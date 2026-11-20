const SCHEMA='mfc710-plc-studio/1';
function blank(){return {schema:SCHEMA,title:'Новий проєкт',cycle:1,extended:false,nodes:[]};}
function syncSlots(p){
 const blocks=p.nodes.filter(n=>n.kind==='block').sort((a,b)=>a.slot-b.slot);
 if(new Set(blocks.map(n=>n.slot)).size!==blocks.length)return p;
 const remap=new Map(blocks.map((n,i)=>[255+n.slot,256+i]));
 for(const n of p.nodes){for(const f of fields(n))if(f.type==='pch'){const v=n.values[f.key];if(remap.has(v))n.values[f.key]=remap.get(v);else if(v>=256&&v<=303)n.values[f.key]=-1;}if(n.kind==='source'&&n.pch>=256&&n.pch<=303)n.pch=remap.get(n.pch)??-1;}
 blocks.forEach((n,i)=>n.slot=i+1);p.cycle=Math.max(1,blocks.length);return syncReferences(p);
}
function valueOf(n,f){return n.values[f.key]??0;}
function validateProject(p){
 const issues=[],err=t=>issues.push({level:'error',text:t}),warn=t=>issues.push({level:'warning',text:t});
 if(p.schema!==SCHEMA)err('Невідома версія формату проєкту.');
 if(!Number.isInteger(p.cycle)||p.cycle<1||p.cycle>50)err('5.145 має бути цілим числом 1…50.');
 const slots=new Set(),constants=new Set(),resources=new Set(),ids=new Set(),sinkparams=new Set();
 for(const n of p.nodes){
  if(n.kind==='referenceSend'&&p.nodes.filter(r=>r.kind==='referenceReceive'&&r.referenceId===n.id).length>1)err('Передавач '+n.id+' має більше одного приймача. Створіть окремі пари посилань.');
  if(n.kind==='referenceReceive'&&referenceConsumers(p,n.id).length>1)err('Приймач '+n.id+' має більше одного підключення. Створіть окремі пари посилань.');
  if(ids.has(n.id))err('Повторний ідентифікатор блока.');ids.add(n.id);
  if(n.kind==='referenceReceive'&&n.pch===-1)err('Посилання «'+referenceName(p,n)+'» має відсутнє джерело або циклічне посилання.');
  if(n.kind==='block'){
   const f=fn(n.code);if(!f){err('Невідома функція '+n.code);continue;}
   if(!Number.isInteger(n.slot)||n.slot<1||n.slot>48)err('Номер блоку поза 1…48.');
   if(slots.has(n.slot))err('Слот '+n.slot+' використано двічі.');slots.add(n.slot);
   if(n.slot>p.cycle)err('Блок '+n.slot+' не виконуватиметься: його номер перевищує 5.145.');
   if(n.code>=39&&n.code<=43){if(resources.has(n.code))err('Функція '+n.code+' допускає один спільний ресурс.');resources.add(n.code);}
   if(n.code>39&&!p.extended)err('Функція '+n.code+': підтримку потрібно перевірити через суперечність додатків B і C.');
   if(n.code>=46)warn('Блок '+n.slot+': перевірте адресацію, роль master / адаптер і налаштування мережі; редактор не перевіряє фізичний зв’язок.');
   if(n.code===45&&(n.values.A<0||n.values.A>6))err('Блок '+n.slot+': група параметра A має бути 0…6.');
   if(n.code===16&&n.values.B===n.values.C)err('Блок '+n.slot+': C = B призводить до ділення на нуль.');
   if(n.code===2&&constantValue(p,n.values.C)===0)err('Блок '+n.slot+': дільник c дорівнює нулю.');
   if([7,15,16].includes(n.code)&&n.values.B>n.values.C)warn('Блок '+n.slot+': B > C; перевірте задум і допустимість діапазону.');
   if(n.code===29&&n.values.C<=0)err('Блок '+n.slot+': дільник C має бути додатним.');
   if([32,34,35,36,37,38].includes(n.code))warn('Блок '+n.slot+': час залежить від T = 5.145 × 0,2 мс. Межі числових входів не конкретизовані в додатку B; перевірте їх на ПЧ.');
   if(n.code===43){for(let i=0;i<4;i++)if(n.values['X'+i]>n.values['X'+(i+1)])err('Формувач кривої: порушено X1 ≤ X2 ≤ X3 ≤ X4 ≤ X5.');}
  }
  if(n.kind==='constant'){if(!Number.isInteger(n.resource)||n.resource<0||n.resource>23)err('Номер сталої поза 1…24.');if(constants.has(n.resource))err('Повторний ресурс сталої.');constants.add(n.resource);}
  if(n.kind==='source'&&!Object.hasOwn(PCH,n.pch))err('Непідтверджена або резервна PCH '+n.pch+'.');
  if(n.kind==='sink'){
   if(!SINKS.some(s=>s.param===n.param))err('Непідтверджене призначення '+n.param);
   if(sinkparams.has(n.param))err('Параметр '+n.param+' призначено двічі.');sinkparams.add(n.param);
  }
  if(n.kind==='block'&&!fn(n.code))continue;
  for(const f of fields(n)){
   const v=valueOf(n,f);if(!Number.isFinite(v)||!Number.isInteger(v)){err((n.label||n.id)+' · '+f.label+': потрібне ціле число.');continue;}
   if(f.type==='pch'){
    if(!Object.hasOwn(PCH,v)){err((n.label||n.id)+' · '+f.label+': PCH '+v+' відсутня в підтвердженому каталозі.');continue;}
    if(v>=256&&v<=303){const src=p.nodes.find(b=>b.kind==='block'&&b.slot===v-255);if(!src)err('Посилання '+point(v)+' веде на блок, відсутній у проєкті.');else if(n.kind==='block'&&src.slot>=n.slot)warn('Блок '+n.slot+' читає '+point(v)+' зі свого або пізнішого слоту: врахуйте значення попереднього циклу.');}
    if(v>=320&&v<=343&&!p.nodes.some(b=>b.kind==='constant'&&b.resource===v-320))err(point(v)+': додайте відповідну сталу, щоб її значення потрапило в експорт.');
    if(v>=304&&v<=315){let code=v<=312?40:v===313?41:v===314?42:43;if(!p.nodes.some(b=>b.kind==='block'&&b.code===code))err(point(v)+': відсутній блок активації відповідного ресурсу.');}
    if(v>=448)warn(point(v)+': необхідний опціональний модуль розширення.');
   }else if(v<(f.min??-32000)||v>(f.max??32000))err((n.label||n.id)+' · '+f.label+': значення поза '+(f.min??-32000)+'…'+(f.max??32000)+'.');
  }
 }
 if(p.extended&&p.nodes.some(n=>n.code>39))warn('Експорт функцій >39 дозволено користувачем після перевірки підтримки; документ містить суперечність.');
 return issues;
}
function constantValue(p,pch){if(pch===0||pch===126)return 0;if(pch===147)return 1000;const c=p.nodes.find(n=>n.kind==='constant'&&n.resource===pch-320);return c?.values.value;}
function compile(p){
 p=syncSlots(JSON.parse(JSON.stringify(p)));
 const issues=validateProject(p);if(issues.some(x=>x.level==='error'))return {issues,rows:[]};
 const rows=[{param:'5.144',value:0,description:'Вимкнути PLC перед введенням конфігурації',source:'с.64,108',phase:'1 · Підготовка'}];
 if(p.nodes.some(n=>n.kind==='sink')){
 rows.unshift({param:'4.2',value:1,description:'Ввести код доступу AL2 і підтвердити Enter. Заводський код 1; якщо змінено – використати чинний код',source:'с.26–27',phase:'1 · Підготовка'});
 rows.splice(1,0,{param:'4.6',value:1,description:'Увімкнути повні покажчики після введення коду доступу',source:'с.61',phase:'1 · Підготовка'});
 }
 let nodes=[...p.nodes].sort((a,b)=>(a.kind==='constant'?0:a.kind==='block'?1:2)-(b.kind==='constant'?0:b.kind==='block'?1:2)||(a.slot??a.resource??0)-(b.slot??b.resource??0));
 for(const n of nodes){if(n.kind==='source'||n.kind==='comment'||isReference(n))continue;if(n.kind==='block')rows.push({param:'6.'+((n.slot-1)*4+1),value:n.code,description:'Блок '+n.slot+' · '+fn(n.code).name,source:'с.'+fn(n.code).page+';64',phase:'2 · Конфігурація'});
  for(const f of fields(n))rows.push({param:f.param,value:valueOf(n,f),description:(n.label||n.id)+' · '+f.label+(f.type==='pch'?' ← '+point(valueOf(n,f))+' · '+PCH[valueOf(n,f)]:''),source:n.kind==='block'?'с.'+fn(n.code).page+';64–66;105–109':n.kind==='constant'?'с.67,108':'с.'+SINKS.find(s=>s.param===n.param)?.page,phase:'2 · Конфігурація'});
 }
 rows.push({param:'5.145',value:p.cycle,description:'Кількість задіяних блоків; T = '+(p.cycle*.2).toFixed(1)+' мс'+(p.nodes.some(n=>n.kind==='block')?'':' (для порожньої схеми мінімум 1)'),source:'с.64,108',phase:'3 · Цикл'});
 rows.push({param:'5.144',value:p.nodes.some(n=>n.kind==='block')?1:0,description:p.nodes.some(n=>n.kind==='block')?'Увімкнути PLC після перевірки введених значень':'Залишити PLC вимкненим: у схемі немає функціональних блоків',source:'с.64,108',phase:'4 · Увімкнення'});
 return {issues,rows};
}
const SINKS=[{param:'2.2',name:'Задатчик A',page:91},{param:'2.3',name:'Задатчик B',page:91},{param:'1.36',name:'Вибір динаміки',page:67}];
function parseProject(text){
 const p=JSON.parse(text);
 const record=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
 const validId=value=>typeof value==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(value);
 const invalid=()=>{throw Error('Некоректний елемент проєкту.');};
 if(!record(p)||p.schema!==SCHEMA||!Array.isArray(p.nodes)||p.nodes.length>2000||typeof p.title!=='string'||!Number.isInteger(p.cycle)||p.cycle<1||p.cycle>50||typeof p.extended!=='boolean')throw Error('Непідтримуваний формат проєкту.');
 const ids=new Set();
 for(const n of p.nodes){
  if(!record(n)||!['source','constant','block','sink','referenceSend','referenceReceive','comment'].includes(n.kind)||!validId(n.id)||ids.has(n.id)||!record(n.values)||!Number.isFinite(n.x)||!Number.isFinite(n.y))invalid();
  ids.add(n.id);
  if((n.label!==undefined&&typeof n.label!=='string')||(n.note!==undefined&&typeof n.note!=='string')||Object.values(n.values).some(value=>!Number.isFinite(value)))invalid();
  if(n.kind==='block'&&(!Number.isInteger(n.code)||!fn(n.code)||!Number.isInteger(n.slot)||n.slot<1||n.slot>48))invalid();
  if(n.kind==='constant'&&(!Number.isInteger(n.resource)||n.resource<0||n.resource>23))invalid();
  if(n.kind==='source'&&(!Number.isInteger(n.pch)||!Object.hasOwn(PCH,n.pch)))invalid();
  if(n.kind==='sink'&&!SINKS.some(s=>s.param===n.param))invalid();
  if(n.kind==='comment'&&((n.width!==undefined&&(!Number.isFinite(n.width)||n.width<160||n.width>1000))||(n.height!==undefined&&(!Number.isFinite(n.height)||n.height<100||n.height>2000))))invalid();
  const inputs=new Set(fields(n).filter(f=>f.type==='pch').map(f=>f.key));
  if(n.disconnected!==undefined&&(!Array.isArray(n.disconnected)||n.disconnected.some(key=>!inputs.has(key))))invalid();
  if(n.referenceId!==undefined&&(typeof n.referenceId!=='string'||(n.referenceId!==''&&!validId(n.referenceId))))invalid();
  if(n.links!==undefined&&(!record(n.links)||Object.entries(n.links).some(([key,link])=>!inputs.has(key)||!record(link)||!validId(link.id)||!Number.isInteger(link.pch))))invalid();
  if(n.wireRoutes!==undefined&&(!record(n.wireRoutes)||Object.entries(n.wireRoutes).some(([key,route])=>!inputs.has(key)||!(Array.isArray(route)?route.length<=40&&route.every(point=>record(point)&&Number.isFinite(point.x)&&Number.isFinite(point.y)):record(route)&&Number.isFinite(route.x)&&Number.isFinite(route.y)))))invalid();
 }
 const normalized=normalizeReferenceConnections(p);
 if(normalized.nodes.length>2000)throw Error('Проєкт перевищує обмеження 2000 елементів після оновлення посилань.');
 return normalized;
}
function toCSV(rows){return '\uFEFF'+[['Етап','Параметр','Значення','Призначення','Джерело'].map(text=>typeof translatedText==='function'?translatedText(text):text),...rows.map(r=>[r.phase,r.param,r.value,r.description,r.source])].map(r=>r.map(x=>'"'+String(x).replaceAll('"','""')+'"').join(';')).join('\r\n');}
if(typeof module!=='undefined')module.exports={blank,validateProject,compile,parseProject,toCSV,SINKS};
