const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let project=blank(),selected=null,pending=null,selectedWire=null,scale=1,history=[],future=[],timer;
try{const data=localStorage.getItem('mfc710-project-v1');if(data)project=parseProject(data);}catch(e){}
function snapshot(){history.push(JSON.stringify(project));if(history.length>80)history.shift();future=[];}
function commit(){syncSlots(project);try{localStorage.setItem('mfc710-project-v1',JSON.stringify(project));$('#saved').textContent='Збережено в цьому браузері';}catch(e){$('#saved').textContent='Не вдалося зберегти – завантажте JSON';}render();}
function toast(t){$('#toast').textContent=t;$('#toast').style.display='block';clearTimeout(timer);timer=setTimeout(()=>$('#toast').style.display='none',3800);}
function label(n){if(n.kind==='comment')return n.label||'Коментар';if(isReference(n))return referenceName(project,n);return n.label||(n.kind==='block'?fn(n.code).name:n.kind==='source'?PCH[n.pch]:n.kind==='constant'?'Стала '+(n.resource+1):n.param);}
function catalog(){
 const q=$('#search').value.toLowerCase(),cat=$('#category').value;
 const items=[{key:'comment',title:'Текстовий коментар',sub:'Довільний текст на робочому полі',category:'Коментарі',code:'T'},{key:'referenceSend',title:'Посилання · передавач',sub:'Приєднайте вихід до входу посилання',category:'Посилання',code:'↗'},{key:'referenceReceive',title:'Посилання · приймач',sub:'Виберіть передавач і підключіть вихід далі',category:'Посилання',code:'↪'},...FUNCTIONS.map(f=>({key:'f:'+f.code,title:f.name,sub:f.formula,category:f.category,code:f.code,details:f.description,ports:fields({kind:'block',code:f.code,slot:1}).map(p=>p.label+' – '+(p.type==='pch'?'сигнал PCH':'числовий параметр')).join('; '),page:f.page})),{key:'constant',title:'Програмована стала',sub:'24 ресурси · −32000…32000',category:'Сталі',code:'C'},...Object.entries(PCH).filter(([p])=>Number(p)<256||Number(p)>=384).map(([p,name])=>({key:'p:'+p,title:name,sub:point(p),category:'Сигнали PCH',code:'●'}))];
 $('#total').textContent=FUNCTIONS.length+' функцій';$('#catalog').innerHTML=items.filter(i=>(cat==='Усі категорії'||cat===i.category)&&((i.title+' '+i.sub+' '+i.code+' '+(i.details||'')+' '+(typeof translatedText==='function'?translatedText(i.title+' '+i.sub+' '+(i.details||'')):'')).toLowerCase().includes(q))).map(i=>`<div class="catalogitem" draggable="true" data-key="${esc(i.key)}"><div><b><span class="code">${i.code}</span>${esc(i.title)}</b><small>${esc(i.sub)}</small>${i.details?`<details class="catalogdetails" draggable="false"><summary>Опис та входи</summary><p>${esc(i.details)}</p><p><b>Входи:</b> ${esc(i.ports||'Окремі параметри групи 5; універсальні A/B/C неактивні.')}</p><p>Інструкція 7.4 · с. ${i.page}. Позначення H – будь-яке ненульове значення, L – нуль.</p></details>`:''}</div><button aria-label="Додати ${esc(i.title)}" data-add="${esc(i.key)}">+</button></div>`).join('');
}
function add(key,x,y){
 if(typeof key!=='string'||(key.startsWith('f:')&&!FUNCTIONS.some(f=>'f:'+f.code===key))||(key.startsWith('p:')&&!Object.keys(PCH).some(p=>'p:'+p===key)))return;
 if(!key.startsWith('f:')&&key!=='constant'&&!key.startsWith('p:')&&!['referenceSend','referenceReceive','comment'].includes(key))return;
 const vp=$('#viewport');x??=Math.round((vp.scrollLeft+65)/scale);y??=Math.round((vp.scrollTop+65)/scale);let n={id:crypto.randomUUID(),x:Math.max(15,Math.min(x,2750)),y:Math.max(15,Math.min(y,2000)),values:{},label:''};
 if(key==='comment'){Object.assign(n,{kind:'comment',note:''});}
 else if(key==='referenceSend'||key==='referenceReceive'){Object.assign(n,{kind:key,values:key==='referenceSend'?{input:0}:{},referenceId:'',pch:-1});if(key==='referenceSend')n.disconnected=['input'];}
 else if(key.startsWith('f:')){const code=Number(key.slice(2));if([39,40,41,42,43].includes(code)&&project.nodes.some(n=>n.kind==='block'&&n.code===code))return toast('Цей ресурс уже використано.');const slot=Array.from({length:48},(_,i)=>i+1).find(i=>!project.nodes.some(n=>n.kind==='block'&&n.slot===i));if(!slot)return toast('Усі 48 слотів зайняті.');Object.assign(n,{kind:'block',code,slot});for(const f of fields(n))n.values[f.key]=f.key==='LEN'?8:0;
 if(code===43)for(let i=0;i<5;i++){n.values['X'+i]=i*250;n.values['Y'+i]=i*250;}}
 else if(key==='constant'){const resource=Array.from({length:24},(_,i)=>i).find(i=>!project.nodes.some(n=>n.kind==='constant'&&n.resource===i));if(resource===undefined)return toast('Усі 24 сталі зайняті.');Object.assign(n,{kind:'constant',resource,values:{value:0}});}
 else if(key.startsWith('p:'))Object.assign(n,{kind:'source',pch:Number(key.slice(2))});
 else {const param=key.slice(5);if(project.nodes.some(n=>n.kind==='sink'&&n.param===param))return toast('Це призначення вже на схемі.');Object.assign(n,{kind:'sink',param,label:SINKS.find(s=>s.param===param).name,values:{input:0}});}
 snapshot();project.nodes.push(n);selected=n.id;pending=null;commit();
}
function commentMarkup(n){
 return `<article class="node comment ${selected===n.id?'selected':''}" data-id="${n.id}" style="left:${n.x}px;top:${n.y}px;width:${n.width||240}px;min-height:${n.height||100}px"><div class="nodehead"><b ${n.label?'data-user-text':''}>${esc(label(n))}</b></div><textarea class="node-caption" data-caption="${n.id}" aria-label="Текст коментаря" placeholder="Введіть коментар…" rows="1">${esc(n.note||'')}</textarea><div class="comment-resize right" data-resize-comment="right" title="Змінити ширину"></div><div class="comment-resize bottom" data-resize-comment="bottom" title="Змінити висоту"></div><div class="comment-resize corner" data-resize-comment="corner" title="Змінити розмір"></div></article>`;
}
function render(){
 $('#title').value=project.title;$('#cycle').value=project.cycle;$('#count').textContent='Використано: '+project.nodes.filter(n=>n.kind==='block').length+' / 48 блоків';$('#period').textContent='Час циклу: '+(project.cycle*.2).toFixed(1).replace('.',',')+' мс';$('#undo').disabled=!history.length;$('#redo').disabled=!future.length;
 $('#nodes').innerHTML=project.nodes.map(n=>n.kind==='comment'?commentMarkup(n):isReference(n)?referenceMarkup(n):`<article class="node ${isReference(n)?'reference':''} ${selected===n.id?'selected':''}" data-id="${n.id}" style="left:${n.x}px;top:${n.y}px"><div class="nodehead"><small>${n.kind==='block'?'БЛОК '+String(n.slot).padStart(2,'0')+' · ФУНКЦІЯ '+n.code:n.kind==='source'?'ДЖЕРЕЛО СИГНАЛУ':n.kind==='constant'?'ПРОГРАМОВАНА СТАЛА':n.kind==='referenceSend'?'ПОСИЛАННЯ · ПЕРЕДАВАЧ':n.kind==='referenceReceive'?'ПОСИЛАННЯ · ПРИЙМАЧ':'ПРИЗНАЧЕННЯ ПЧ'}</small><b ${n.label?'data-user-text':''}>${esc(label(n))}</b></div>${n.kind==='block'?`<div class="nodeformula">${esc(fn(n.code).formula)}</div>`:''}${fields(n).map(f=>`<div class="portrow ${f.type==='number'?'literal':''}">${f.type==='pch'?`<button class="port" title="Вхід ${esc(f.label)}" aria-label="Вхід ${esc(f.label)}" data-in="${n.id}" data-field="${f.key}"></button>`:''}<span>${esc(f.label)}</span><span>${f.type==='pch'?point(valueOf(n,f)):esc(valueOf(n,f))}</span></div>`).join('')}${outputs(n).map(p=>`<div class="portrow output">${point(p)}<button class="port out ${pending?.pch===p?'pending':''}" title="Вихід ${point(p)}" aria-label="Вихід ${point(p)}" data-out="${n.id}" data-pch="${p}"></button></div>`).join('')}<textarea class="node-caption" data-caption="${n.id}" aria-label="Підпис блока" placeholder="Підпис блока…" rows="1">${esc(n.note||'')}</textarea></article>`).join('');
 document.querySelectorAll('.node-caption').forEach(resizeCaption);drawWires();properties();showIssues();globalThis.refreshSelection?.();globalThis.refreshPanels?.();globalThis.refreshReferenceHighlight?.();
}
function drawWires(){
 const svg=$('#wires');svg.innerHTML='';const board=$('#board').getBoundingClientRect();
 for(const n of project.nodes)for(const f of fields(n).filter(f=>f.type==='pch'&&!n.disconnected?.includes(f.key))){const v=valueOf(n,f);let src=n.links?.[f.key]?project.nodes.find(b=>b.id===n.links[f.key].id):project.nodes.find(b=>b.kind!=='source'&&!isReference(b)&&outputs(b).includes(v))||project.nodes.find(b=>!isReference(b)&&outputs(b).includes(v));if(!src)continue;const a=document.querySelector(`[data-out="${src.id}"][data-pch="${v}"]`),b=document.querySelector(`[data-in="${n.id}"][data-field="${f.key}"]`);if(!a||!b)continue;const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect(),x1=(ar.x+ar.width/2-board.x)/scale,y1=(ar.y+ar.height/2-board.y)/scale,x2=(br.x+br.width/2-board.x)/scale,y2=(br.y+br.height/2-board.y)/scale,d=Math.max(65,Math.abs(x2-x1)*.4);let path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',connectionPath(x1,y1,x2,y2,n.wireRoutes?.[f.key]));path.setAttribute('class','wire'+(selectedWire?.id===n.id&&selectedWire?.key===f.key?' selected-wire':''));path.dataset.target=n.id;path.dataset.field=f.key;const group=document.createElementNS('http://www.w3.org/2000/svg','g');group.setAttribute('class','wire-group');group.append(path);appendWireWaypoints(group,n,f.key);svg.append(group);}
}
function properties(){
 if(selected&&isReference(project.nodes.find(n=>n.id===selected)||{})){referenceProperties();return;}
 const n=project.nodes.find(n=>n.id===selected);$('.inspector').classList.toggle('active',!!n);if(!n){$('#properties').innerHTML='<div class="empty"><span>⌁</span><h3>Виберіть блок</h3><p>Входи, параметри та опис функції з інструкції з’являться тут.</p></div>';return;}
 if(n.kind==='comment'){
 $('#properties').innerHTML=`<h2>Текстовий коментар</h2><div class="field"><label>Заголовок</label><input data-edit="label" value="${esc(n.label)}" placeholder="Коментар"></div><p>Введіть текст безпосередньо в полі на схемі. Перетягуйте за заголовок. Поле зростає вниз разом із текстом.</p><button class="danger" id="delete">Видалити коментар</button>`;
 return;
 }
 const f=n.kind==='block'?fn(n.code):null;
 $('#properties').innerHTML=`<h2 ${n.label?'data-user-text':''}>${esc(label(n))}</h2><span class="pill">${n.kind==='block'?'Функція '+n.code+' · слот '+n.slot:n.kind==='source'?point(n.pch):n.kind==='constant'?point(320+n.resource):'Параметр '+n.param}</span><div class="field"><label>Назва / коментар</label><input data-edit="label" value="${esc(n.label)}" placeholder="Власна назва"></div>${n.kind==='block'?`<div class="field"><label>Номер слоту виконання</label><input data-edit="slot" type="number" min="1" max="48" value="${n.slot}"><small>Задає порядок виконання. Редактор ущільнює нумерацію до 1…N та переносить посилання PCH.</small></div>`:''}${f?`<p>${esc(f.description)}</p><p class="source" data-page="${f.page}">Інструкція 7.4 · стор. ${f.page} ↗</p>`:n.kind==='source'?`<p>${esc(PCH[n.pch])}</p><p class="source" data-page="${n.pch<256?(n.pch<42?73:n.pch<136?74:n.pch<164?75:76):77}">Таблиця PCH · додаток A ↗</p>`:''}${f&&n.code>39?'<div class="warn">Функція є в додатку B, але перевищує діапазон 0–39 із додатка C. Підтримку слід перевірити на ПЧ.</div>':''}<hr>${fields(n).map(v=>`<div class="field"><label>${esc(v.label)} ${v.type==='pch'?'●':'■'}<span>${v.param}</span></label>${v.type==='pch'?`<select data-value="${v.key}">${Object.entries(PCH).map(([p,t])=>`<option value="${p}" ${Number(p)===valueOf(n,v)?'selected':''}>${point(p)} · ${esc(t)}</option>`).join('')}</select><small>Покажчик на сигнал. З’єднайте з виходом або виберіть PCH.</small>`:`<input type="number" step="1" data-value="${v.key}" value="${esc(valueOf(n,v))}" ${v.min!==undefined?'min="'+v.min+'"':''} ${v.max!==undefined?'max="'+v.max+'"':''}><small>Числове значення${v.min!==undefined?' · '+v.min+'…'+v.max:' · точні межі в додатку B не наведені'}</small>`}</div>`).join('')}<button class="danger" id="delete">Видалити блок</button>`;
}
function showIssues(){const issues=validateProject(project);$('#issues').innerHTML=issues.length?issues.map(i=>`<div class="issue ${i.level==='error'?'error':''}">${i.level==='error'?'!':'△'} ${esc(i.text)}</div>`).join(''):'<div class="issue ok">✓ Структурних помилок не виявлено. Масштаби сигналів і налаштування ПЧ перевіряються окремо.</div>';$('#status').textContent=pending?.input?'Виберіть вихід для входу '+pending.input.key:pending?'Вибрано '+point(pending.pch)+' – натисніть на вхід блока':issues.some(i=>i.level==='error')?'Є помилки · експорт заблоковано':'Готово до формування параметрів';}
function connect(id,key,pch,sourceId){const n=project.nodes.find(n=>n.id===id);if(!n||!fields(n).some(f=>f.key===key&&f.type==='pch'))return;if(!canConnectReferenceInput(project,id,key,sourceId)){pending=null;toast('Цей приймач уже під’єднаний. Для другого входу створіть окрему пару посилань.');render();return;}snapshot();connectProjectInput(project,id,key,pch,sourceId);selectedWire=null;pending=null;commit();}
function deleteSelection(){
 if(globalThis.deleteGroupSelection?.())return;
 if(!selectedWire&&!selected)return;
 clearConnectionGesture?.();
 snapshot();
 if(selectedWire)disconnectProjectInput(project,selectedWire.id,selectedWire.key);
 else removeProjectNode(project,selected);
 selected=null;
 selectedWire=null;
 pending=null;
 commit();
}
function resizeCaption(textarea){
 textarea.style.height='0px';
 const card=textarea.closest('.node');
 const node=project.nodes.find(item=>item.id===textarea.dataset.caption);
 const minimum=node?.kind==='comment'?Math.max(64,(node.height||100)-(card.querySelector('.nodehead')?.offsetHeight||34)-2):44;
 textarea.style.height=Math.max(minimum,textarea.scrollHeight+2)+'px';
 const bottom=parseFloat(card.style.top)+card.offsetHeight+80;
 const board=$('#board');
 if(bottom>board.offsetHeight){board.style.height=Math.ceil(bottom)+'px';$('#wires').setAttribute('height',Math.ceil(bottom));}
}
$('#nodes').addEventListener('focusin',event=>{
 const textarea=event.target.closest('[data-caption]');
 if(!textarea)return;
 selected=textarea.dataset.caption;
 selectedWire=null;
 document.querySelectorAll('.node').forEach(card=>card.classList.toggle('selected',card.dataset.id===selected));
 document.querySelectorAll('.selected-wire').forEach(path=>path.classList.remove('selected-wire'));
 properties();
});
$('#nodes').addEventListener('beforeinput',event=>{
 const textarea=event.target.closest('[data-caption]');
 if(!textarea||textarea.dataset.editing)return;
 snapshot();
 textarea.dataset.editing='true';
});
$('#nodes').addEventListener('input',event=>{
 const textarea=event.target.closest('[data-caption]');
 if(!textarea)return;
 const node=project.nodes.find(node=>node.id===textarea.dataset.caption);
 if(!node)return;
 node.note=textarea.value;
 resizeCaption(textarea);
 drawWires();
 try{localStorage.setItem('mfc710-project-v1',JSON.stringify(project));$('#saved').textContent='Збережено в цьому браузері';}
 catch{$('#saved').textContent='Завантажте JSON для збереження';}
 $('#undo').disabled=!history.length;
 $('#redo').disabled=!future.length;
});
$('#nodes').addEventListener('focusout',event=>{
 const textarea=event.target.closest('[data-caption]');
 if(textarea)delete textarea.dataset.editing;
});
function modal(title,html){$('#dialogtitle').textContent=title;$('#dialogbody').innerHTML=html;$('#dialog').showModal();}
function download(name,data,type){let u=URL.createObjectURL(new Blob([data],{type}));let a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
function parameterDescriptionMarkup(row){const name=project.nodes.map(n=>n.label).filter(Boolean).find(name=>row.description.startsWith(name+' · '));return name?'<span data-user-text>'+esc(name)+'</span>'+esc(row.description.slice(name.length)):esc(row.description);}
function exportDialog(){const result=compile(project);let errors=result.issues.filter(i=>i.level==='error');modal('Параметри для ручного введення',`<p>Проєкт: <b data-user-text>${esc(project.title)}</b> · T = ${(project.cycle*.2).toFixed(1)} мс · ${result.rows.length} записів</p><div class="warn">Вводьте конфігурацію на зупиненому ПЧ. У таблиці лише задіяні блоки; 5.145 визначається автоматично. Перед 4.6 = 1 введіть код у 4.2 (заводський – 1; якщо його змінено, використайте чинний). Зміни інших налаштувань ПЧ тут не перевіряються.</div><label class="checkrow"><input id="extended" type="checkbox" ${project.extended?'checked':''}><span>Я перевірив підтримку функцій >39 у конкретній версії ПЗ ПЧ. Дозволити їх експорт із позначенням суперечності документації.</span></label>${errors.length?errors.map(i=>`<div class="issue error">${esc(i.text)}</div>`).join(''):`<div class="exportactions"><button id="csv" class="primary">Завантажити CSV</button><button id="print">Друк / PDF</button></div>${result.issues.map(i=>`<div class="issue">${esc(i.text)}</div>`).join('')}<table><thead><tr><th>Етап</th><th>Параметр</th><th>Значення</th><th>Призначення</th></tr></thead><tbody>${result.rows.map(r=>`<tr><td>${esc(r.phase)}</td><td>${r.param}</td><td>${r.value}</td><td>${parameterDescriptionMarkup(r)} <small>(${r.source})</small></td></tr>`).join('')}</tbody></table>`}`);}
function demo(){snapshot();project=blank();project.title='Приклад інструкції · Y = AI0 × 5';project.nodes=[{id:'ai',kind:'source',pch:134,x:70,y:95,values:{},label:'Аналоговий вхід AI0'},{id:'c1',kind:'constant',resource:0,x:70,y:260,values:{value:5},label:'Множник 5'},{id:'c2',kind:'constant',resource:1,x:70,y:420,values:{value:1},label:'Дільник 1'},{id:'b1',kind:'block',slot:1,code:2,x:420,y:190,values:{A:134,B:320,C:321},label:'Масштабування ×5'}];selected='b1';pending=null;commit();toast('Приклад зі сторінки 67: PCH.256 = PCH.134 × 5 / 1');}
$('#search').oninput=catalog;$('#category').onchange=catalog;
$('#catalog').onclick=e=>{let b=e.target.closest('[data-add]');if(b)add(b.dataset.add);};
$('#catalog').ondragstart=e=>{let b=e.target.closest('[data-key]');if(b)e.dataTransfer.setData('text/plain',b.dataset.key);};
$('#viewport').ondragover=e=>e.preventDefault();$('#viewport').ondrop=e=>{e.preventDefault();let b=$('#board').getBoundingClientRect();add(e.dataTransfer.getData('text/plain'),(e.clientX-b.x)/scale,(e.clientY-b.y)/scale);};
$('#nodes').onclick=e=>{if(e.target.closest('textarea'))return;selectedWire=null;const out=e.target.closest('[data-out]');if(out){pending={pch:Number(out.dataset.pch),id:out.dataset.out};render();return;}const inp=e.target.closest('[data-in]');if(inp&&pending){connect(inp.dataset.in,inp.dataset.field,pending.pch,pending.id);return;}const node=e.target.closest('.node');if(node&&selected!==node.dataset.id){selected=node.dataset.id;render();}};
let drag=null;
$('#nodes').onpointerdown=e=>{if(e.button!==0||!e.isPrimary||e.target.closest('button')||!e.target.closest('.nodehead'))return;const el=e.target.closest('.node'),n=project.nodes.find(n=>n.id===el.dataset.id);drag={saved:false,id:n.id,pointerId:e.pointerId,element:el,priorFuture:[...future],startX:e.clientX,startY:e.clientY,x:n.x,y:n.y};selected=n.id;selectedWire=null;el.setPointerCapture(e.pointerId);};
$('#nodes').onpointermove=e=>{if(!drag)return;if(!drag.saved){if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<3)return;snapshot();drag.saved=true;}let n=project.nodes.find(n=>n.id===drag.id);n.x=Math.round(Math.max(15,Math.min(2750,drag.x+(e.clientX-drag.startX)/scale)));n.y=Math.round(Math.max(15,Math.min(2000,drag.y+(e.clientY-drag.startY)/scale)));let el=document.querySelector(`[data-id="${n.id}"]`);el.style.left=n.x+'px';el.style.top=n.y+'px';drawWires();};
function finishNodeDrag(cancel=false){
 if(!drag)return;
 const gesture=drag;drag=null;
 if(gesture.element.hasPointerCapture(gesture.pointerId))gesture.element.releasePointerCapture(gesture.pointerId);
 if(gesture.saved&&cancel){const node=project.nodes.find(n=>n.id===gesture.id);if(node){node.x=gesture.x;node.y=gesture.y;}history.pop();future=gesture.priorFuture;}
 if(gesture.saved&&!cancel)commit();else render();
}
$('#nodes').onpointerup=()=>finishNodeDrag();
window.addEventListener('pointercancel',()=>finishNodeDrag(true));
window.addEventListener('blur',()=>finishNodeDrag(true));
document.addEventListener('keydown',function cancelNodeGesture(event){if(event.key==='Escape'||((event.ctrlKey||event.metaKey)&&(event.code==='KeyZ'||['z','я'].includes(event.key.toLowerCase()))))finishNodeDrag(true);},true);
$('#wires').onclick=e=>{if(!e.target.dataset.target)return;selected=null;pending=null;selectedWire={id:e.target.dataset.target,key:e.target.dataset.field};document.querySelectorAll('.selected-wire,.node.selected').forEach(el=>el.classList.remove('selected-wire','selected'));e.target.classList.add('selected-wire');properties();$('#status').textContent='Зв’язок вибрано · Delete видаляє';};
$('#properties').onchange=e=>{if(e.target.dataset.reference!==undefined){const receiver=project.nodes.find(n=>n.id===selected);if(!receiver||!canAssignReference(project,receiver.id,e.target.value))return;snapshot();assignProjectReference(project,receiver.id,e.target.value);commit();return;}const n=project.nodes.find(n=>n.id===selected);if(!n)return;if(e.target.dataset.edit==='slot'){const slot=Number(e.target.value);if(!Number.isInteger(slot)||slot<1||slot>48||project.nodes.some(b=>b.id!==n.id&&b.kind==='block'&&b.slot===slot)){e.target.value=n.slot;return toast('Потрібен вільний слот 1…48.');}snapshot();const old=255+n.slot;n.slot=slot;for(const b of project.nodes)for(const f of fields(b))if(f.type==='pch'&&b.values[f.key]===old)b.values[f.key]=255+slot;}
 else if(e.target.dataset.edit==='label'){snapshot();n.label=e.target.value.slice(0,100);}
 else if(e.target.dataset.value){const key=e.target.dataset.value;snapshot();n.values[key]=Number(e.target.value);if(n.links)delete n.links[key];if(n.wireRoutes)delete n.wireRoutes[key];n.disconnected=n.disconnected?.filter(k=>k!==key);}else return;commit();};
$('#properties').onclick=e=>{if(e.target.id==='delete')deleteSelection();if(e.target.dataset.page)showPage(Number(e.target.dataset.page));};
$('#title').onchange=e=>{snapshot();project.title=e.target.value.slice(0,150)||'Проєкт';commit();};
$('#undo').onclick=()=>{clearConnectionGesture?.();if(!history.length)return;future.push(JSON.stringify(project));project=JSON.parse(history.pop());selected=null;selectedWire=null;pending=null;commit();};$('#redo').onclick=()=>{clearConnectionGesture?.();if(!future.length)return;history.push(JSON.stringify(project));project=JSON.parse(future.pop());selected=null;selectedWire=null;pending=null;commit();};
$('#new').onclick=()=>{snapshot();project=blank();selected=null;pending=null;commit();toast('Створено новий проєкт. Попередню схему можна повернути кнопкою ↶.');};$('#demo').onclick=demo;
$('#save').onclick=()=>download('mfc710-project.json',JSON.stringify(project,null,2),'application/json');$('#import').onclick=()=>$('#file').click();$('#file').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>2000000)throw Error('Файл завеликий.');const p=parseProject(await file.text());snapshot();project=p;selected=null;pending=null;commit();toast('Проєкт відкрито.');}catch(e){toast(e.message);}e.target.value='';};
$('#export').onclick=exportDialog;$('#validate').onclick=showIssues;$('#close').onclick=()=>$('#dialog').close();$('#dialog').onclick=e=>{if(e.target.id==='csv'){const r=compile(project);if(!r.issues.some(i=>i.level==='error'))download('mfc710-parameters.csv',toCSV(typeof localizedParameterRows==='function'?localizedParameterRows(r.rows):r.rows),'text/csv;charset=utf-8');}if(e.target.id==='print')window.print();if(e.target.dataset.page)showPage(Number(e.target.dataset.page));};$('#dialog').onchange=e=>{if(e.target.id==='extended'){snapshot();project.extended=e.target.checked;commit();$('#dialog').close();exportDialog();}};
function zoom(z){scale=Math.max(.05,Math.min(3,z));$('#board').style.transform=`scale(${scale})`;$('#zoom').textContent=Math.round(scale*100)+'%';drawWires();}$('#zoomin').onclick=()=>zoom(scale+.1);$('#zoomout').onclick=()=>zoom(scale-.1);$('#home').onclick=()=>centerDiagram();
document.addEventListener('keydown',event=>{
 const editing=event.target.closest('input,textarea,select,[contenteditable=true]');
 if((event.ctrlKey||event.metaKey)&&(event.code==='KeyZ'||['z','я'].includes(event.key.toLowerCase()))&&!editing&&!$('#dialog').open){
  event.preventDefault();
  (event.shiftKey?$('#redo'):$('#undo')).click();
  return;
 }
 if(event.key==='Delete'&&!editing&&!$('#dialog').open){event.preventDefault();deleteSelection();return;}
 if(event.key==='Escape'&&!editing){pending=null;render();}
});
$('#viewport').addEventListener('wheel',event=>{
 if(!event.ctrlKey)return;
 event.preventDefault();
 const viewport=$('#viewport');
 const bounds=viewport.getBoundingClientRect();
 const x=event.clientX-bounds.left, y=event.clientY-bounds.top;
 const marginX=parseFloat($('#board').style?.marginLeft||'0'),marginY=parseFloat($('#board').style?.marginTop||'0');
 const worldX=(viewport.scrollLeft+x-marginX)/scale, worldY=(viewport.scrollTop+y-marginY)/scale;
 const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?viewport.clientHeight:1);
 zoom(scale*Math.exp(-delta*.002));
 viewport.scrollLeft=worldX*scale+marginX-x;
 viewport.scrollTop=worldY*scale+marginY-y;
},{passive:false});

async function showPage(page){try{let text=globalThis.MANUAL_PAGES?.[page];if(!text){const r=await fetch('references/page-'+String(page).padStart(3,'0')+'.txt');if(!r.ok)throw Error();text=await r.text();}if($('#dialog').open)$('#dialog').close();modal('MFC710 · інструкція 7.4 · стор. '+page,'<p>Текст наданої інструкції. Графічні діаграми у витягу відсутні.</p><div class="docpage">'+esc(text)+'</div>');}catch(e){toast('Текст сторінки доступний у комплекті редактора під час роботи через сервер.');}}
$('#help').onclick=()=>modal('Як працювати з PLC Studio',`<p>1. Додайте джерела сигналів, сталі й функціональні блоки з каталогу. У категорії «Посилання» передавач приймає вихід блока та його назву. Натисніть правою кнопкою на приймач і виберіть під’єднаний передавач, потім з’єднайте вихід приймача з потрібним входом.</p><p>2. Перетягніть круглий вихід PCH на круглий вхід потрібного блока. Також можна натиснути вихід, а потім вхід. Esc скасовує перетягування. Перетягуйте блоки за заголовок. Ctrl+Z скасовує зміну, Ctrl+Shift+Z повторює її. Ctrl+колесо змінює масштаб під курсором, затиснуте колесо переміщує поле.</p><p>3. Виберіть блок, задайте числові входи й номер слоту. Круглі входи приймають PCH; числові поля не мають роз’єму.</p><p>4. Усуньте помилки, сформуйте таблицю й завантажте CSV. Збережіть JSON для перенесення та подальшого редагування.</p><div class="warn">Результат потребує інженерної перевірки. Зразок зі стороннього ПЧ не використано як джерело номерів параметрів.</div><h3>Модель виконання</h3><p>48 слотів; послідовне виконання від меншого номера до більшого. Виходи PCH.256…303. Для блоку n: функція 6.(4n−3), входи 6.(4n−2)…6.(4n). T = 5.145 × 0,2 мс. Слоти автоматично нумеруються 1…N, зв’язки PCH переносяться. 5.145 дорівнює кількості задіяних блоків (для порожньої схеми мінімум 1). Невикористані блоки в таблицю не додаються. 5.144=1 розташований останнім.</p><h3>Межі підтвердження</h3><p>У каталозі ${FUNCTIONS.length} описаних у додатку B функцій: 0…43 та 45…49. №44 у джерелі відсутній. Додаток C обмежує номер функції 0…39 – тому експорт старших номерів початково заблокований. Числові межі звичайних входів не всюди конкретизовані; редактор застосовує робочу межу ±32000, яка не є підтвердженою універсальною специфікацією ПЧ.</p><p>Секвенсор, MUX1, MUX2 і формувач кривої займають слоти активації, але їхні порти задаються параметрами групи 5. Є лише один ресурс кожного типу. Кількість функцій у вступі інструкції (43) не збігається з переліком додатка B.</p><p>Каталог містить функції ПЛК, сталі та джерела PCH для входів. Виберіть блок або лінію та натисніть Delete для видалення. Підпис редагується безпосередньо внизу блока, його висота збільшується за текстом.</p><h3>Джерело · надана інструкція MFC710, ред. 7.4</h3><p>${[26,27,61,64,65,66,67,73,74,75,76,77,78,79,80,81,91,105,107,108,109].map(p=>`<button data-page="${p}">Стор. ${p}</button>`).join(' ')}</p><p>Програма зберігається локально в цьому браузері. Для резервної копії завантажте JSON.</p>`);
syncSlots(project);catalog();window.addEventListener('DOMContentLoaded',render,{once:true});window.addEventListener('resize',drawWires);


function referenceProperties(){
 const node=project.nodes.find(n=>n.id===selected);
 $('.inspector').classList.add('active');
 $('#properties').innerHTML='<h2>'+esc(PCH[referencePch(node)]||'Посилання')+'</h2>'+
  (node.kind==='referenceReceive'?'<button id="reference-picker">Вибрати характеристичну точку</button>':'<p>Приєднайте вихід до входу посилання.</p>')+
  '<button class="danger" id="delete">Видалити посилання</button>';
 if($('#reference-picker'))$('#reference-picker').onclick=event=>showReferenceContextMenu(event,node.id);
}
