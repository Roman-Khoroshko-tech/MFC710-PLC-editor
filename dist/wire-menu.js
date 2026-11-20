const wireMenu=document.createElement('div');
wireMenu.className='wire-menu';
wireMenu.hidden=true;
wireMenu.setAttribute('role','menu');
wireMenu.innerHTML='<button role="menuitem">Розбити на посилання</button>';
const deleteWireButton=document.createElement('button');deleteWireButton.textContent='Видалити';deleteWireButton.setAttribute('role','menuitem');deleteWireButton.className='delete-wire-action';wireMenu.append(deleteWireButton);
deleteWireButton.onclick=()=>{
 wireMenu.hidden=true;if(!wireMenuTarget)return;
 globalThis.clearSelectionGroup?.();selected=null;selectedWire={...wireMenuTarget};deleteSelection();
};
const addWaypointButton=document.createElement('button');addWaypointButton.textContent='Додати точку переміщення';addWaypointButton.setAttribute('role','menuitem');wireMenu.append(addWaypointButton);
addWaypointButton.onclick=()=>{wireMenu.hidden=true;if(wireMenuTarget&&wireMenuPoint)addWaypointFromMenu(wireMenuTarget.id,wireMenuTarget.key,wireMenuPoint);};
const removeWaypointButton=document.createElement('button');removeWaypointButton.textContent='Видалити точку';removeWaypointButton.setAttribute('role','menuitem');removeWaypointButton.hidden=true;wireMenu.append(removeWaypointButton);
removeWaypointButton.onclick=()=>{wireMenu.hidden=true;if(wireMenuTarget&&wireMenuWaypointIndex!==null)removeWaypointFromMenu(wireMenuTarget.id,wireMenuTarget.key,wireMenuWaypointIndex);};
document.body.append(wireMenu);
let wireMenuTarget=null,wireMenuPoint=null,wireMenuWaypointIndex=null;

$('#wires').addEventListener('contextmenu',event=>{
 const line=event.target.closest('.wire,.wire-waypoint');
 if(!line?.dataset.target)return;
 event.preventDefault();
 selected=null;
 pending=null;
 selectedWire={id:line.dataset.target,key:line.dataset.field};
 wireMenuTarget={...selectedWire};
 const board=$('#board').getBoundingClientRect();wireMenuPoint={x:(event.clientX-board.left)/scale,y:(event.clientY-board.top)/scale};
 wireMenuWaypointIndex=line.dataset.waypoint===undefined?null:Number(line.dataset.waypoint);removeWaypointButton.hidden=wireMenuWaypointIndex===null;
 document.querySelectorAll('.selected-wire,.node.selected').forEach(el=>el.classList.remove('selected-wire','selected'));
 line.classList.add('selected-wire');
 properties();
 const target=project.nodes.find(node=>node.id===wireMenuTarget.id);
 addWaypointButton.disabled=!target||wireRoutePoints(target.wireRoutes?.[wireMenuTarget.key]).length>=40;
 const source=target&&projectConnectionSource(project,target,wireMenuTarget.key);
 const reference=target&&isReference(target)?target:source&&isReference(source)?source:null;
 const button=wireMenu.querySelector('button');
 button.textContent=reference?'З’єднати назад':'Розбити на посилання';
 button.disabled=reference?!referenceJoinPlan(project,reference.id):!source;
 wireMenu.hidden=false;
 wireMenu.style.left=Math.max(4,Math.min(event.clientX,window.innerWidth-wireMenu.offsetWidth-4))+'px';
 wireMenu.style.top=Math.max(4,Math.min(event.clientY,window.innerHeight-wireMenu.offsetHeight-4))+'px';
 wireMenu.querySelector('button').focus();
});

wireMenu.querySelector('button').onclick=()=>{
 wireMenu.hidden=true;
 const target=project.nodes.find(node=>node.id===wireMenuTarget?.id);
 if(!target)return;
 const key=wireMenuTarget.key,pch=target.values[key];
 const connectedSource=projectConnectionSource(project,target,key);
 const reference=isReference(target)?target:connectedSource&&isReference(connectedSource)?connectedSource:null;
 if(reference){joinReferencesFromMenu(reference.id);return;}
 const source=target.links?.[key]?project.nodes.find(node=>node.id===target.links[key].id):
  project.nodes.find(node=>node.kind!=='source'&&!isReference(node)&&outputs(node).includes(pch))||
  project.nodes.find(node=>!isReference(node)&&outputs(node).includes(pch));
 if(!source)return;
 const output=document.querySelector(`[data-out="${source.id}"][data-pch="${pch}"]`);
 const input=document.querySelector(`[data-in="${target.id}"][data-field="${key}"]`);
 if(!output||!input)return;
 const bounds=$('#board').getBoundingClientRect();
 const start=output.getBoundingClientRect(),end=input.getBoundingClientRect();
 const position=(x,y)=>({x:Math.max(15,Math.min(2750,x)),y:Math.max(15,Math.min(2100,y))});
 const sender=position((start.right-bounds.left)/scale+25,(start.top+start.height/2-bounds.top)/scale-18);
 const receiver=position((end.left-bounds.left)/scale-175,(end.top+end.height/2-bounds.top)/scale-18);
 if(Math.abs(sender.x-receiver.x)<165&&Math.abs(sender.y-receiver.y)<50){sender.y=Math.max(15,sender.y-45);receiver.y+=45;}
 const ids={sender:crypto.randomUUID(),receiver:crypto.randomUUID()};
 snapshot();
 if(splitProjectConnection(project,target.id,key,source.id,ids,{sender,receiver})){
  selected=ids.receiver;
  selectedWire=null;
  pending=null;
  commit();
 }
};
document.addEventListener('pointerdown',event=>{if(!wireMenu.contains(event.target))wireMenu.hidden=true;},true);
document.addEventListener('keydown',event=>{if(event.key==='Escape')wireMenu.hidden=true;});
$('#viewport').addEventListener('scroll',()=>{wireMenu.hidden=true;});
window.addEventListener('resize',()=>{wireMenu.hidden=true;});
