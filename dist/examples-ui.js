const examplesMenu=document.createElement('div');examplesMenu.className='wire-menu examples-menu';examplesMenu.hidden=true;examplesMenu.setAttribute('role','menu');document.body.append(examplesMenu);
examplesMenu.innerHTML=PLC_EXAMPLES.map((entry,index)=>`<button role="menuitem" data-preview-example="${entry.id}">${index+1}. ${esc(entry.title)}</button>`).join('');
$('#demo').textContent='Приклади ▾';$('#demo').setAttribute('aria-haspopup','menu');$('#demo').setAttribute('aria-expanded','false');
function hideExamplesMenu(){examplesMenu.hidden=true;$('#demo').setAttribute('aria-expanded','false');}
$('#demo').onclick=()=>{
 if(!examplesMenu.hidden){hideExamplesMenu();return;}
 const bounds=$('#demo').getBoundingClientRect();examplesMenu.hidden=false;
 examplesMenu.style.left=Math.max(4,Math.min(bounds.left,window.innerWidth-examplesMenu.offsetWidth-4))+'px';examplesMenu.style.top=Math.min(bounds.bottom+5,window.innerHeight-examplesMenu.offsetHeight-4)+'px';
 $('#demo').setAttribute('aria-expanded','true');examplesMenu.querySelector('button')?.focus();
};
function previewPlcExample(id){
 const entry=PLC_EXAMPLES.find(e=>e.id===id);if(!entry)return;
 hideExamplesMenu();const data=buildPlcExample(id);
 const mapping=(rows)=>rows.map(row=>`<tr><td>${esc('PCH'+row.pch)}</td><td>${esc(row.name)}</td></tr>`).join('');
 modal(entry.title,`<p>${esc(data.description)}</p><p><b>${data.project.cycle} блоків</b> · цикл T = ${data.tick.toFixed(1)} мс</p><table><thead><tr><th>Вхід</th><th>Призначення</th></tr></thead><tbody>${mapping(data.inputs)}</tbody></table><table><thead><tr><th>Вихід</th><th>Призначення</th></tr></thead><tbody>${mapping(data.outputs)}</tbody></table>${data.notes.map(note=>`<p>${esc(note)}</p>`).join('')}<p>Фізичні виходи та задатчики ПЧ призначаються окремо. Схема замінить поточну; Ctrl+Z поверне її.</p><button class="primary" data-load-example="${entry.id}">Завантажити схему</button>`);
}
examplesMenu.onclick=event=>{const button=event.target.closest('[data-preview-example]');if(button)previewPlcExample(button.dataset.previewExample);};
function loadPlcExample(id){
 const data=buildPlcExample(id),next=parseProject(JSON.stringify(data.project));
 clearConnectionGesture?.();globalThis.clearSelectionGroup?.();snapshot();project=next;selected=null;selectedWire=null;pending=null;
 $('#dialog').close();commit();if(!data.layoutLocked)routePlcExample();
 centerDiagram();
}
$('#dialog').addEventListener('click',event=>{const button=event.target.closest('[data-load-example]');if(button)loadPlcExample(button.dataset.loadExample);});
document.addEventListener('pointerdown',event=>{if(!examplesMenu.contains(event.target)&&!event.target.closest('#demo'))hideExamplesMenu();},true);
document.addEventListener('keydown',event=>{
 if(event.key==='Escape')hideExamplesMenu();
 if(examplesMenu.hidden||!examplesMenu.contains(event.target))return;
 const buttons=[...examplesMenu.querySelectorAll('button')],index=buttons.indexOf(event.target);
 if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();buttons[(index+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length].focus();}
});
window.addEventListener('resize',hideExamplesMenu);
