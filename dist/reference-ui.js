function referencePch(node) {
 if (node.kind === 'referenceSend') return node.disconnected?.includes('input') ? -1 : node.values.input;
 return node.pch;
}

function relatedReferenceIds(project,nodeId){
 const node=project.nodes.find(item=>item.id===nodeId);
 if(!node||!isReference(node))return [];
 if(node.kind==='referenceSend')return [node.id,...project.nodes.filter(item=>item.kind==='referenceReceive'&&item.referenceId===node.id).map(item=>item.id)];
 const sender=project.nodes.find(item=>item.id===node.referenceId&&item.kind==='referenceSend');
 return sender?[node.id,sender.id]:[node.id];
}

function connectedReferenceSenders(project) {
 return project.nodes.filter(node => node.kind === 'referenceSend' &&
  Object.hasOwn(PCH, referencePch(node)) &&
  (!node.links?.input || project.nodes.some(source => source.id === node.links.input.id)));
}

function freeReferenceSenders(project){
 return connectedReferenceSenders(project).filter(sender=>!project.nodes.some(n=>n.kind==='referenceReceive'&&n.referenceId===sender.id));
}
function referenceSignalLabel(pch){
 if(!Object.hasOwn(PCH,pch))return 'Джерело не вибрано';
 const description=pch>=256&&pch<=303?'вихід BL'+(pch-255):PCH[pch];
 return 'PCH'+pch+' ('+description+')';
}

function referencePresentation(project,node){
 const pch=referencePch(node);
 const receivers=node.kind==='referenceReceive'?[node]:project.nodes.filter(item=>item.kind==='referenceReceive'&&item.referenceId===node.id);
 const receiverIds=new Set(receivers.map(item=>item.id));
 const destinations=[];
 for(const target of project.nodes){
  if(isReference(target))continue;
  for(const field of fields(target)){
   if(field.type!=='pch'||target.disconnected?.includes(field.key)||!receiverIds.has(target.links?.[field.key]?.id))continue;
   const name=target.kind==='block'?'Вхід '+field.label+' блоку '+target.slot:field.label+' · '+(target.label||target.param);
   destinations.push(name);
  }
 }
 const active=destinations.length>0&&Object.hasOwn(PCH,pch);
 const source=referenceSignalLabel(pch);
 const destination=destinations.length?[...new Set(destinations)].join(' / '):'Вхід не під’єднано';
 return {pch,active,source,destination,name:source+' → '+destination,
  incomplete:!active&&Object.hasOwn(PCH,pch)};
}

function referenceMarkup(node) {
 const {pch,name,source,destination,incomplete}=referencePresentation(project,node);
 const route=node.kind==='referenceReceive'?(PCH[pch]||'Джерело не вибрано')+' →':'→ '+destination;
 const input = node.kind === 'referenceSend' ?
  `<button class="port" data-in="${node.id}" data-field="input" aria-label="Вхід посилання" title="Вхід посилання"></button>` : '';
 const output = node.kind === 'referenceReceive' && pch >= 0 ?
  `<button class="port out" data-out="${node.id}" data-pch="${pch}" aria-label="Вихід посилання" title="Вихід посилання"></button>` : '';
 const picker = node.kind === 'referenceReceive' ? 'tabindex="0" role="button" aria-haspopup="dialog" aria-label="Вибрати джерело посилання"' : '';
 return `<article class="node reference ${incomplete?'reference-incomplete':''} ${selected === node.id ? 'selected' : ''}" data-id="${node.id}" style="left:${node.x}px;top:${node.y}px">${input}<div class="nodehead" ${picker} title="${esc(name)}"><span class="reference-signal">${esc(source)}</span><span class="reference-destination">${esc(route)}</span></div>${output}</article>`;
}

function showReferencePicker(nodeId) {
 const node = project.nodes.find(item => item.id === nodeId);
 if (node?.kind !== 'referenceReceive') return;
 const senders = freeReferenceSenders(project);
 const options = senders.map(sender => {
  const pch = referencePch(sender);
  return `<button class="reference-option ${sender.id === node.referenceId ? 'current' : ''}" data-choose-reference="${esc(sender.id)}" data-receiver="${esc(node.id)}"><span>${esc(PCH[pch])}</span><small>${point(pch)}</small></button>`;
 }).join('');
 modal('Виберіть характеристичну точку', options ? `<div class="reference-options">${options}</div>` : '<p>Спочатку приєднайте вихід блока до посилання-передавача. Після цього він з’явиться у списку.</p>');
 $('#dialog').classList.add('reference-dialog');
}

$('#dialog').addEventListener('click', event => {
 const option = event.target.closest('[data-choose-reference]');
 if (!option) return;
 const node = project.nodes.find(item => item.id === option.dataset.receiver);
 if (node?.kind !== 'referenceReceive') return;
 const sender = freeReferenceSenders(project).find(item => item.id === option.dataset.chooseReference);
 if (!sender) return;
 snapshot();
 if(!assignProjectReference(project,node.id,sender.id)){history.pop();return;}
 selected = node.id;
 $('#dialog').close();
 commit();
});
$('#dialog').addEventListener('close', () => $('#dialog').classList.remove('reference-dialog'));
$('#nodes').addEventListener('keydown', event => {
 if (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10')) return;
 const header = event.target.closest('.node.reference .nodehead');
 if (!header) return;
 event.preventDefault();
 const bounds=header.getBoundingClientRect();showReferenceContextMenu({clientX:bounds.left,clientY:bounds.bottom,preventDefault(){}},header.closest('.node').dataset.id);
});
let hoveredReferenceId=null;
function refreshReferenceHighlight(){
 const ids=new Set(relatedReferenceIds(project,hoveredReferenceId));
 document.querySelectorAll('#nodes .reference').forEach(card=>card.classList.toggle('reference-related',ids.has(card.dataset.id)));
}
globalThis.refreshReferenceHighlight=refreshReferenceHighlight;
function trackReferenceHighlight(event){
 const card=event.target.closest?.('.reference');
 if(!card)return;
 const next=event.type==='pointerout'||event.type==='focusout'?event.relatedTarget?.closest?.('.reference'):card;
 hoveredReferenceId=next?.dataset.id||null;
 refreshReferenceHighlight();
}
for(const type of ['pointerover','pointerout','focusin','focusout'])$('#nodes').addEventListener(type,trackReferenceHighlight);
$('#nodes').addEventListener('pointerleave',()=>{hoveredReferenceId=null;refreshReferenceHighlight();});
window.addEventListener('blur',()=>{hoveredReferenceId=null;refreshReferenceHighlight();});
