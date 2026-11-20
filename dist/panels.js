const panelDefinitions=[
 {key:'left',label:'Блоки',selector:'.library',property:'--library-width',axis:'x',direction:1},
 {key:'right',label:'Властивості',selector:'.inspector',property:'--inspector-width',axis:'x',direction:-1},
 {key:'bottom',label:'Перевірка',selector:'.validation',property:'--validation-height',axis:'y',direction:-1}
];
const panelControls=document.createElement('div');
panelControls.className='panel-controls';
$('#help').before(panelControls);
const panelPreferences={};
try{Object.assign(panelPreferences,JSON.parse(localStorage.getItem('mfc710-panels')||'{}'));}catch{}
let panelResize=null;

function savePanelPreferences(){
 try{localStorage.setItem('mfc710-panels',JSON.stringify(panelPreferences));}catch{}
}
function updatePanelHandles(){
 const main=$('main'),origin=main.getBoundingClientRect();
 for(const panel of panelDefinitions){
  const handle=panel.handle,bounds=$(panel.selector).getBoundingClientRect();
  handle.hidden=main.classList.contains('hide-'+panel.key);
  if(panel.axis==='x'){
   handle.style.left=(panel.key==='left'?bounds.right-origin.left-4:bounds.left-origin.left-4)+'px';
   handle.style.top='0px';handle.style.height=main.clientHeight+'px';
  }else{
   handle.style.left=(bounds.left-origin.left)+'px';handle.style.top=(bounds.top-origin.top-4)+'px';handle.style.width=bounds.width+'px';
  }
 }
 drawWires();globalThis.refreshSelection?.();
}
globalThis.refreshPanels=updatePanelHandles;

for(const panel of panelDefinitions){
 const preference=panelPreferences[panel.key]||{};
 if(Number.isFinite(preference.size))$('main').style.setProperty(panel.property,preference.size+'px');
 if(preference.hidden)$('main').classList.add('hide-'+panel.key);
 const button=document.createElement('button');
 button.textContent=panel.label;
 button.setAttribute('aria-pressed',String(!preference.hidden));
 button.title='Показати або приховати панель';
 button.onclick=()=>{
  const hidden=$('main').classList.toggle('hide-'+panel.key);
  panelPreferences[panel.key]={...panelPreferences[panel.key],hidden};
  button.setAttribute('aria-pressed',String(!hidden));
  savePanelPreferences();updatePanelHandles();
 };
 panelControls.append(button);
 const handle=document.createElement('div');
 handle.className='panel-handle '+(panel.axis==='x'?'vertical':'horizontal');
 handle.setAttribute('role','separator');handle.setAttribute('aria-label','Змінити розмір панелі '+panel.label);
 handle.setAttribute('aria-orientation',panel.axis==='x'?'vertical':'horizontal');
 panel.handle=handle;$('main').append(handle);
 handle.onpointerdown=event=>{
  if(event.button!==0||!event.isPrimary)return;
  event.preventDefault();event.stopPropagation();
  const bounds=$(panel.selector).getBoundingClientRect();
  panelResize={panel,pointerId:event.pointerId,start:panel.axis==='x'?event.clientX:event.clientY,size:panel.axis==='x'?bounds.width:bounds.height};
  handle.setPointerCapture(event.pointerId);document.body.classList.add('resizing-panels');
 };
}
window.addEventListener('pointermove',event=>{
 if(!panelResize||event.pointerId!==panelResize.pointerId)return;
 const {panel,start,size}=panelResize;
 const current=panel.axis==='x'?event.clientX:event.clientY;
 const other=panel.key==='left'?$('.inspector').getBoundingClientRect().width:$('.library').getBoundingClientRect().width;
 const maximum=panel.axis==='x'?Math.max(120,Math.min(600,$('main').clientWidth-other-250)):Math.max(56,$('.workspace').clientHeight-150);
 const next=Math.max(panel.axis==='x'?120:56,Math.min(maximum,size+(current-start)*panel.direction));
 $('main').style.setProperty(panel.property,Math.round(next)+'px');
 panelPreferences[panel.key]={...panelPreferences[panel.key],size:Math.round(next)};
 updatePanelHandles();event.preventDefault();
});
function finishPanelResize(){
 if(!panelResize)return;
 const {panel,pointerId}=panelResize;panelResize=null;
 if(panel.handle.hasPointerCapture(pointerId))panel.handle.releasePointerCapture(pointerId);
 document.body.classList.remove('resizing-panels');savePanelPreferences();
}
window.addEventListener('pointerup',event=>{if(event.pointerId===panelResize?.pointerId)finishPanelResize();});
window.addEventListener('pointercancel',finishPanelResize);
window.addEventListener('blur',finishPanelResize);
window.addEventListener('resize',updatePanelHandles);
window.addEventListener('DOMContentLoaded',updatePanelHandles,{once:true});
