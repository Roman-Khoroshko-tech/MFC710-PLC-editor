let waypointGesture=null;
function appendWireWaypoints(group,node,key){
 if(waypointGesture?.id===node.id&&waypointGesture?.key===key)group.classList.add('waypoint-dragging');
 wireRoutePoints(node.wireRoutes?.[key]).forEach((point,index)=>{
  const circle=document.createElementNS('http://www.w3.org/2000/svg','circle');circle.setAttribute('class','wire-waypoint');circle.setAttribute('cx',point.x);circle.setAttribute('cy',point.y);circle.setAttribute('r',6/scale);circle.dataset.target=node.id;circle.dataset.field=key;circle.dataset.waypoint=index;
  const title=document.createElementNS('http://www.w3.org/2000/svg','title');title.textContent='Точка переміщення '+(index+1);circle.append(title);group.append(circle);
 });
}
function wireGeometry(id,key){
 const node=project.nodes.find(n=>n.id===id);if(!node)return null;const source=projectConnectionSource(project,node,key);if(!source)return null;
 const a=document.querySelector(`[data-out="${source.id}"][data-pch="${node.values[key]}"]`),b=document.querySelector(`[data-in="${id}"][data-field="${key}"]`);if(!a||!b)return null;
 const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect(),board=$('#board').getBoundingClientRect();return [(ar.left+ar.width/2-board.left)/scale,(ar.top+ar.height/2-board.top)/scale,(br.left+br.width/2-board.left)/scale,(br.top+br.height/2-board.top)/scale];
}
function addWaypointFromMenu(id,key,point){
 const node=project.nodes.find(n=>n.id===id),geometry=wireGeometry(id,key);if(!node||!geometry||wireRoutePoints(node.wireRoutes?.[key]).length>=40)return;
 snapshot();insertWireWaypoint(node,key,point,geometry);selected=null;selectedWire={id,key};pending=null;commit();
}
function removeWaypointFromMenu(id,key,index){
 const node=project.nodes.find(n=>n.id===id),points=wireRoutePoints(node?.wireRoutes?.[key]);if(!node||!points[index])return;
 snapshot();node.wireRoutes[key]=points.filter((_point,i)=>i!==index);if(!node.wireRoutes[key].length)delete node.wireRoutes[key];commit();
}
$('#wires').addEventListener('pointerdown',event=>{
 const handle=event.target.closest('.wire-waypoint');if(!handle||event.button!==0)return;
 const node=project.nodes.find(n=>n.id===handle.dataset.target),index=Number(handle.dataset.waypoint),key=handle.dataset.field,point=wireRoutePoints(node?.wireRoutes?.[key])[index];if(!point)return;
 event.preventDefault();event.stopImmediatePropagation();document.activeElement?.blur?.();
 waypointGesture={id:node.id,key,index,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,origin:{...point},oldRoutes:JSON.parse(JSON.stringify(node.wireRoutes)),priorFuture:[...future],saved:false};
 selected=null;selectedWire={id:node.id,key};pending=null;$('#wires').setPointerCapture(event.pointerId);
},true);
window.addEventListener('pointermove',event=>{
 const g=waypointGesture;if(!g||event.pointerId!==g.pointerId)return;const dx=(event.clientX-g.startX)/scale,dy=(event.clientY-g.startY)/scale;
 if(!g.saved){if(Math.hypot(dx,dy)<3)return;snapshot();g.saved=true;}
 const node=project.nodes.find(n=>n.id===g.id);if(!node){finishWaypointDrag(true);return;}
 const points=wireRoutePoints(node.wireRoutes?.[g.key]).map(p=>({...p}));points[g.index]={x:Math.round(Math.max(15,Math.min(2980,g.origin.x+dx))),y:Math.round(Math.max(15,Math.min(2350,g.origin.y+dy)))};
 node.wireRoutes[g.key]=points;drawWires();globalThis.refreshSelection?.();
});
function finishWaypointDrag(cancel=false){
 const g=waypointGesture;if(!g)return;waypointGesture=null;if($('#wires').hasPointerCapture(g.pointerId))$('#wires').releasePointerCapture(g.pointerId);
 if(g.saved&&cancel){const node=project.nodes.find(n=>n.id===g.id);if(node)node.wireRoutes=g.oldRoutes;history.pop();future=g.priorFuture;}
 if(g.saved&&!cancel)commit();else render();
}
window.addEventListener('pointerup',event=>{if(event.pointerId===waypointGesture?.pointerId)finishWaypointDrag();});
window.addEventListener('pointercancel',()=>finishWaypointDrag(true));window.addEventListener('blur',()=>finishWaypointDrag(true));
document.addEventListener('keydown',event=>{if(event.key==='Escape'||((event.ctrlKey||event.metaKey)&&(event.code==='KeyZ'||['z','я'].includes(event.key.toLowerCase()))))finishWaypointDrag(true);},true);
