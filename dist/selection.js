let groupNodes=new Set();
let groupWires=new Map();
let selectionGesture=null;
let groupDrag=null;
let suppressSelectionClick=false;

function selectionRect(start,end){
 return {left:Math.min(start.x,end.x),top:Math.min(start.y,end.y),right:Math.max(start.x,end.x),bottom:Math.max(start.y,end.y)};
}
function rectangleContains(rect,bounds){
 return bounds.left>=rect.left&&bounds.right<=rect.right&&bounds.top>=rect.top&&bounds.bottom<=rect.bottom;
}
function refreshGroupSelection(){
 const ids=new Set(project.nodes.map(node=>node.id));
 groupNodes=new Set([...groupNodes].filter(id=>ids.has(id)));
 document.querySelectorAll('#nodes .node').forEach(card=>card.classList.toggle('group-selected',groupNodes.has(card.dataset.id)));
 document.querySelectorAll('#wires .wire').forEach(wire=>wire.classList.toggle('group-wire',groupWires.has(wire.dataset.target+'|'+wire.dataset.field)));
 const count=groupNodes.size+groupWires.size;
 if(count)$('#status').textContent=`Вибрано ${groupNodes.size} блоків і ${groupWires.size} зв’язків · Delete видаляє`;
}
globalThis.refreshSelection=refreshGroupSelection;
function clearGroupSelection(){
 groupNodes.clear();groupWires.clear();refreshGroupSelection();
}
globalThis.clearSelectionGroup=clearGroupSelection;
globalThis.deleteGroupSelection=()=>{
 if(!groupNodes.size&&!groupWires.size)return false;
 snapshot();
 for(const {id,key} of groupWires.values())disconnectProjectInput(project,id,key);
 for(const id of groupNodes)removeProjectNode(project,id);
 groupNodes.clear();groupWires.clear();selected=null;selectedWire=null;pending=null;
 commit();return true;
};

function captureGroupWireRoutes(project,nodeIds,wireIds){
 const routes=[];
 for(const node of project.nodes)for(const [key,route] of Object.entries(node.wireRoutes||{})){
  const sourceId=node.links?.[key]?.id||(nodeIds.has(node.id)?projectConnectionSource(project,node,key)?.id:null);
  if(wireIds.has(node.id+'|'+key)||(nodeIds.has(node.id)&&nodeIds.has(sourceId)))routes.push({id:node.id,key,route:JSON.parse(JSON.stringify(route))});
 }
 return routes;
}
function moveGroupWireRoutes(project,routes,dx,dy){
 for(const saved of routes){
  const node=project.nodes.find(n=>n.id===saved.id);if(!node)continue;
  const translate=point=>({...point,x:point.x+dx,y:point.y+dy});
  node.wireRoutes??={};node.wireRoutes[saved.key]=Array.isArray(saved.route)?saved.route.map(translate):translate(saved.route);
 }
}
function boardPoint(event){
 const bounds=$('#board').getBoundingClientRect();
 return {x:(event.clientX-bounds.left)/scale,y:(event.clientY-bounds.top)/scale};
}
$('#viewport').addEventListener('pointerdown',event=>{
 if(event.button!==0||!event.isPrimary)return;
 const card=event.target.closest('.node');
 if(card){
  if(groupNodes.has(card.dataset.id)&&event.target.closest('.nodehead')){
   event.preventDefault();event.stopImmediatePropagation();
   groupDrag={pointerId:event.pointerId,start:boardPoint(event),saved:false,
    routes:captureGroupWireRoutes(project,groupNodes,groupWires),priorFuture:[...future],
    positions:project.nodes.filter(node=>groupNodes.has(node.id)).map(node=>({id:node.id,x:node.x,y:node.y}))};
   $('#viewport').setPointerCapture(event.pointerId);return;
  }
  clearGroupSelection();return;
 }
 if(event.target.closest('.wire,.wire-waypoint')||event.target.closest('button,input,textarea,select')){clearGroupSelection();return;}
 event.preventDefault();event.stopImmediatePropagation();
 if(!event.shiftKey)clearGroupSelection();
 selected=null;selectedWire=null;pending=null;
 selectionGesture={pointerId:event.pointerId,start:boardPoint(event),startClient:{x:event.clientX,y:event.clientY},
  nodes:new Set(groupNodes),wires:new Map(groupWires)};
 const rectangle=document.createElement('div');rectangle.id='selection-box';$('#board').append(rectangle);
 $('#viewport').setPointerCapture(event.pointerId);
 properties();
},true);

window.addEventListener('pointermove',event=>{
 if(groupDrag&&event.pointerId===groupDrag.pointerId){
  const current=boardPoint(event);
  if(!groupDrag.saved){if(Math.hypot(current.x-groupDrag.start.x,current.y-groupDrag.start.y)<3)return;snapshot();groupDrag.saved=true;}
  const dx=current.x-groupDrag.start.x,dy=current.y-groupDrag.start.y;
  const x=Math.max(15-Math.min(...groupDrag.positions.map(n=>n.x)),Math.min(2750-Math.max(...groupDrag.positions.map(n=>n.x)),dx));
  const y=Math.max(15-Math.min(...groupDrag.positions.map(n=>n.y)),Math.min(2000-Math.max(...groupDrag.positions.map(n=>n.y)),dy));
  for(const start of groupDrag.positions){
   const node=project.nodes.find(node=>node.id===start.id);if(!node)continue;
   node.x=Math.round(start.x+x);node.y=Math.round(start.y+y);
   const card=document.querySelector(`[data-id="${node.id}"]`);card.style.left=node.x+'px';card.style.top=node.y+'px';
  }
  moveGroupWireRoutes(project,groupDrag.routes,x,y);
  drawWires();refreshGroupSelection();event.preventDefault();return;
 }
 if(!selectionGesture||event.pointerId!==selectionGesture.pointerId)return;
 const rect=selectionRect(selectionGesture.start,boardPoint(event));
 const box=$('#selection-box');
 box.style.left=rect.left+'px';box.style.top=rect.top+'px';box.style.width=(rect.right-rect.left)+'px';box.style.height=(rect.bottom-rect.top)+'px';
 const screen=selectionRect(selectionGesture.startClient,{x:event.clientX,y:event.clientY});
 groupNodes=new Set(selectionGesture.nodes);groupWires=new Map(selectionGesture.wires);
 document.querySelectorAll('#nodes .node').forEach(card=>{if(rectangleContains(screen,card.getBoundingClientRect()))groupNodes.add(card.dataset.id);});
 document.querySelectorAll('#wires .wire').forEach(wire=>{
  if(rectangleContains(screen,wire.getBoundingClientRect()))groupWires.set(wire.dataset.target+'|'+wire.dataset.field,{id:wire.dataset.target,key:wire.dataset.field});
 });
 refreshGroupSelection();event.preventDefault();
});
function finishSelection(cancel=false){
 const gesture=selectionGesture||groupDrag;if(!gesture)return;
 if(cancel&&groupDrag?.saved){
  for(const start of groupDrag.positions){const node=project.nodes.find(n=>n.id===start.id);if(node){node.x=start.x;node.y=start.y;}}
  moveGroupWireRoutes(project,groupDrag.routes,0,0);
  history.pop();future=groupDrag.priorFuture;
 }
 const moved=groupDrag?.saved;
 selectionGesture=null;groupDrag=null;$('#selection-box')?.remove();
 if($('#viewport').hasPointerCapture(gesture.pointerId))$('#viewport').releasePointerCapture(gesture.pointerId);
 suppressSelectionClick=true;setTimeout(()=>{suppressSelectionClick=false;},0);
 if(moved&&!cancel)commit();else render();
}
window.addEventListener('pointerup',event=>{if(event.pointerId===(selectionGesture||groupDrag)?.pointerId)finishSelection();},true);
window.addEventListener('pointercancel',()=>finishSelection(true));
window.addEventListener('blur',()=>finishSelection(true));
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'){finishSelection(true);clearGroupSelection();}
 if((event.ctrlKey||event.metaKey)&&(event.code==='KeyZ'||['z','я'].includes(event.key.toLowerCase()))&&!event.target.closest('input,textarea,select')){finishSelection(true);clearGroupSelection();}
},true);
document.addEventListener('pointerdown',event=>{if(event.target.closest('#new,#demo,#import,#undo,#redo'))clearGroupSelection();},true);
$('#viewport').addEventListener('click',event=>{if(suppressSelectionClick){event.preventDefault();event.stopImmediatePropagation();}},true);
