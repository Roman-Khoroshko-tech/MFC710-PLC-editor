function isReference(node) {
 return node.kind === 'referenceSend' || node.kind === 'referenceReceive';
}

function referenceName(project, node, visited = new Set()) {
 if (!node || visited.has(node.id)) return 'Невизначене посилання';
 if (!isReference(node)) {
  return node.label || (node.kind === 'block' ? fn(node.code).name :
   node.kind === 'constant' ? 'Стала ' + (node.resource + 1) : PCH[node.pch] || 'Сигнал');
 }
 if(node.kind==='referenceSend'&&node.disconnected?.includes('input'))return 'Приєднайте вихід';
 visited.add(node.id);
 const sourceId = node.kind === 'referenceReceive' ? node.referenceId : node.links?.input?.id;
 const source = project.nodes.find(item => item.id === sourceId);
 if (source) return referenceName(project, source, visited);
 return node.kind === 'referenceSend' && Object.hasOwn(PCH, node.values.input) ?
  PCH[node.values.input] : 'Виберіть джерело';
}

function syncReferences(project) {
 const nodes = new Map(project.nodes.map(node => [node.id, node]));
 function output(node, chosenPch, visited) {
  if (!node) return -1;
  // A real PLC output is a stored value, including feedback to the same block.
  // Only cycles made entirely of virtual references have no resolvable output.
  if (!isReference(node)) {
   const ports = outputs(node);
   return ports.length === 1 ? ports[0] : ports.includes(chosenPch) ? chosenPch : -1;
  }
  if (visited.has(node.id)) return -1;
  const next = new Set(visited).add(node.id);
  if (node.kind === 'referenceReceive') {
   const sender = nodes.get(node.referenceId);
   return sender?.kind === 'referenceSend' ? output(sender, null, next) : -1;
  }
  if (node.kind === 'referenceSend') return node.disconnected?.includes('input') ? -1 : input(node, 'input', next);
  return -1;
 }
 function input(node, key, visited) {
  if (node.disconnected?.includes(key)) return 0;
  const link = node.links?.[key];
  return link ? output(nodes.get(link.id), link.pch, visited) : node.values[key] ?? 0;
 }
 for (const node of project.nodes) {
  for (const field of fields(node)) {
   if (field.type === 'pch' && node.links?.[field.key]) {
    node.values[field.key] = input(node, field.key, new Set([node.id]));
   }
  }
  if (node.kind === 'referenceReceive') node.pch = output(node, null, new Set());
 }
 return project;
}

function connectProjectInput(project, nodeId, key, pch, sourceId) {
 const node = project.nodes.find(item => item.id === nodeId);
 if (!node || !fields(node).some(field => field.key === key && field.type === 'pch') || !canConnectReferenceInput(project,nodeId,key,sourceId)) return false;
 if(node.wireRoutes&&node.links?.[key]?.id!==sourceId)delete node.wireRoutes[key];
 node.values[key] = pch;
 node.disconnected = node.disconnected?.filter(item => item !== key);
 node.links ??= {};
 if (sourceId) node.links[key] = {id: sourceId, pch};
 else delete node.links[key];
 syncReferences(project);
 return true;
}

function splitProjectConnection(project,nodeId,key,sourceId,ids,positions){
 const target=project.nodes.find(node=>node.id===nodeId);
 const source=project.nodes.find(node=>node.id===sourceId);
 if(!target||!source||isReference(target)||isReference(source)||!fields(target).some(field=>field.key===key&&field.type==='pch')||target.disconnected?.includes(key))return false;
 const pch=target.values[key];
 if(!outputs(source).includes(pch))return false;
 const sender={id:ids.sender,kind:'referenceSend',values:{input:pch},links:{input:{id:source.id,pch}},...positions.sender};
 const receiver={id:ids.receiver,kind:'referenceReceive',values:{},referenceId:sender.id,pch,...positions.receiver};
 project.nodes.push(sender,receiver);
 connectProjectInput(project,target.id,key,pch,receiver.id);
 return true;
}
// Resolve the real source behind a reference without confusing equal PCH values.
function realReferenceSource(project,node,pch,visited=new Set()){
 if(!node||visited.has(node.id))return null;visited.add(node.id);
 if(node.kind==='referenceReceive')return realReferenceSource(project,project.nodes.find(n=>n.id===node.referenceId),pch,visited);
 if(node.kind==='referenceSend'){
  if(node.disconnected?.includes('input'))return null;
  const link=node.links?.input;
  const source=link?project.nodes.find(n=>n.id===link.id):project.nodes.find(n=>!isReference(n)&&outputs(n).includes(node.values.input));
  return realReferenceSource(project,source,link?.pch??node.values.input,visited);
 }
 const ports=outputs(node);return ports.length===1?{id:node.id,pch:ports[0]}:ports.includes(pch)?{id:node.id,pch}:null;
}
function referenceJoinPlan(project,nodeId){
 const node=project.nodes.find(n=>n.id===nodeId);if(!node||!isReference(node))return null;
 const receivers=node.kind==='referenceReceive'?[node]:project.nodes.filter(n=>n.kind==='referenceReceive'&&n.referenceId===node.id);
 const edges=[],removedReceivers=[];
 for(const receiver of receivers){
  const source=realReferenceSource(project,receiver,receiver.pch);if(!source)continue;
  const consumers=project.nodes.flatMap(target=>fields(target).filter(field=>field.type==='pch'&&!target.disconnected?.includes(field.key)&&target.links?.[field.key]?.id===receiver.id).map(field=>({key:field.key,pch:source.pch,sourceId:source.id,targetId:target.id})));
  if(!consumers.length)continue;
  edges.push(...consumers);removedReceivers.push(receiver.id);
 }
 return edges.length?{edges,removedReceivers,senderId:node.kind==='referenceSend'?node.id:node.referenceId}:null;
}
function joinProjectReference(project,nodeId){
 const plan=referenceJoinPlan(project,nodeId);if(!plan)return false;
 for(const edge of plan.edges)connectProjectInput(project,edge.targetId,edge.key,edge.pch,edge.sourceId);
 const removed=new Set(plan.removedReceivers);
 project.nodes=project.nodes.filter(n=>!removed.has(n.id));
 if(!project.nodes.some(n=>n.kind==='referenceReceive'&&n.referenceId===plan.senderId))project.nodes=project.nodes.filter(n=>n.id!==plan.senderId);
 syncReferences(project);return true;
}
function projectConnectionSource(project,target,key){
 const pch=target.values[key];return target.links?.[key]?project.nodes.find(n=>n.id===target.links[key].id):project.nodes.find(n=>n.kind!=='source'&&!isReference(n)&&outputs(n).includes(pch))||project.nodes.find(n=>!isReference(n)&&outputs(n).includes(pch));
}
function referenceConsumers(project,receiverId){
 return project.nodes.flatMap(target=>fields(target).filter(field=>field.type==='pch'&&!target.disconnected?.includes(field.key)&&target.links?.[field.key]?.id===receiverId).map(field=>({id:target.id,key:field.key})));
}
function canAssignReference(project,receiverId,senderId){
 return project.nodes.some(n=>n.id===receiverId&&n.kind==='referenceReceive')&&project.nodes.some(n=>n.id===senderId&&n.kind==='referenceSend')&&!project.nodes.some(n=>n.kind==='referenceReceive'&&n.id!==receiverId&&n.referenceId===senderId);
}
function assignProjectReference(project,receiverId,senderId){
 if(!canAssignReference(project,receiverId,senderId))return false;
 project.nodes.find(n=>n.id===receiverId).referenceId=senderId;syncReferences(project);return true;
}
function canConnectReferenceInput(project,nodeId,key,sourceId){
 const source=project.nodes.find(n=>n.id===sourceId);
 return source?.kind!=='referenceReceive'||!referenceConsumers(project,source.id).some(edge=>edge.id!==nodeId||edge.key!==key);
}
// Migrate older shared references into independent pairs without changing PLC wiring.
function normalizeReferenceConnections(project){
 const used=new Set(project.nodes.map(n=>n.id));let counter=0;
 function copy(node,index){
  let id;do{id=node.id.slice(0,60)+'_copy_'+(++counter);}while(used.has(id));used.add(id);
  return {...JSON.parse(JSON.stringify(node)),id,y:(node.y||0)+index*110};
 }
 for(const receiver of project.nodes.filter(n=>n.kind==='referenceReceive')){
  const consumers=referenceConsumers(project,receiver.id);
  consumers.slice(1).forEach((edge,index)=>{const clone=copy(receiver,index+1);project.nodes.push(clone);project.nodes.find(n=>n.id===edge.id).links[edge.key].id=clone.id;});
 }
 for(const sender of project.nodes.filter(n=>n.kind==='referenceSend')){
  const receivers=project.nodes.filter(n=>n.kind==='referenceReceive'&&n.referenceId===sender.id);
  receivers.slice(1).forEach((receiver,index)=>{const clone=copy(sender,index+1);project.nodes.push(clone);receiver.referenceId=clone.id;});
 }
 return syncReferences(project);
}
