const referenceMenu=document.createElement('div');
referenceMenu.className='wire-menu reference-context';
referenceMenu.hidden=true;
referenceMenu.setAttribute('role','menu');
document.body.append(referenceMenu);
let referenceMenuNode=null;

function showReferenceContextMenu(event,nodeId){
 const node=project.nodes.find(node=>node.id===nodeId);
 if(!node||!isReference(node))return;
 event.preventDefault();
 selected=node.id;selectedWire=null;pending=null;
 globalThis.clearSelectionGroup?.();
 render();
 referenceMenuNode=node.id;
 const options=node.kind==='referenceReceive'?
  freeReferenceSenders(project).map(source=>({id:source.id,pch:referencePch(source)})):
  project.nodes.filter(source=>!isReference(source)).flatMap(source=>outputs(source).map(pch=>({id:source.id,pch})));
 referenceMenu.innerHTML=options.length?options.map(option=>
  `<button role="menuitem" data-ref-source="${esc(option.id)}" data-ref-pch="${option.pch}"><span>${esc(PCH[option.pch])}</span><small>${point(option.pch)}</small></button>`).join(''):
  '<p>Немає вільних передавачів. Додайте окремий передавач і під’єднайте його до виходу.</p>';
 const joinButton=document.createElement('button');joinButton.setAttribute('role','menuitem');joinButton.dataset.refJoin=node.id;joinButton.textContent='З’єднати назад';joinButton.disabled=!referenceJoinPlan(project,node.id);referenceMenu.prepend(joinButton);
 referenceMenu.hidden=false;
 referenceMenu.style.left=Math.max(4,Math.min(event.clientX,window.innerWidth-referenceMenu.offsetWidth-4))+'px';
 referenceMenu.style.top=Math.max(4,Math.min(event.clientY,window.innerHeight-referenceMenu.offsetHeight-4))+'px';
 referenceMenu.querySelector('button')?.focus();
}
$('#nodes').addEventListener('contextmenu',event=>{
 const card=event.target.closest('.reference');
 if(card)showReferenceContextMenu(event,card.dataset.id);
});
function joinReferencesFromMenu(nodeId){
 if(!referenceJoinPlan(project,nodeId))return false;
 clearConnectionGesture?.();globalThis.clearSelectionGroup?.();snapshot();
 if(!joinProjectReference(project,nodeId))return false;
 selected=null;selectedWire=null;pending=null;commit();return true;
}
referenceMenu.onclick=event=>{
 const join=event.target.closest('[data-ref-join]');if(join){referenceMenu.hidden=true;joinReferencesFromMenu(join.dataset.refJoin);return;}
 const button=event.target.closest('[data-ref-source]');
 if(!button)return;
 const node=project.nodes.find(node=>node.id===referenceMenuNode);
 if(!node)return;
 if(node.kind==='referenceReceive'&&!canAssignReference(project,node.id,button.dataset.refSource)){toast('Цей передавач уже зайнятий. Створіть окрему пару посилань.');return;}
 snapshot();
 if(node.kind==='referenceReceive')assignProjectReference(project,node.id,button.dataset.refSource);
 else connectProjectInput(project,node.id,'input',Number(button.dataset.refPch),button.dataset.refSource);
 referenceMenu.hidden=true;
 commit();
};
document.addEventListener('pointerdown',event=>{if(!referenceMenu.contains(event.target))referenceMenu.hidden=true;},true);
document.addEventListener('keydown',event=>{if(event.key==='Escape')referenceMenu.hidden=true;});
$('#viewport').addEventListener('scroll',()=>{referenceMenu.hidden=true;});
window.addEventListener('resize',()=>{referenceMenu.hidden=true;});
