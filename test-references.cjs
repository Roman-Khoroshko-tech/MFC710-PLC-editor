const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
vm.runInThisContext(['catalog.js','references.js','engine.js','editing.js'].map(name=>fs.readFileSync('dist/'+name,'utf8')).join('\n'));
let count=0;
function test(name,check){check();count++;console.log('PASS '+name);}
const block=(id,slot,label='')=>({id,slot,label,kind:'block',code:0,x:0,y:0,values:{A:134}});
function fixture(){
 const p=blank();
 p.nodes=[block('b1',1,'Тиск'),block('b2',2),
  {id:'send',kind:'referenceSend',x:0,y:0,values:{input:0}},
  {id:'recv',kind:'referenceReceive',x:0,y:0,values:{},referenceId:'send',pch:-1}];
 connectProjectInput(p,'send','input',256,'b1');
 connectProjectInput(p,'b2','A',256,'recv');
 return syncSlots(p);
}
test('reference inherits name and delivers actual PCH without consuming a PLC slot',()=>{
 const p=fixture();
 assert.equal(referenceName(p,p.nodes[3]),'Тиск');
 assert.equal(p.nodes[1].values.A,256);assert.equal(p.cycle,2);
 const rows=compile(p).rows;
 assert.equal(rows.find(r=>r.param==='6.6').value,256);
 assert.equal(rows.filter(r=>r.param.startsWith('6.')).length,4);
 assert(rows.every(r=>r.param));
});
test('multiple receivers update when the sender is reconnected',()=>{
 const p=fixture();
 p.nodes.push({id:'recv2',kind:'referenceReceive',x:0,y:0,values:{},referenceId:'send'});
 p.nodes.push({id:'ai',kind:'source',pch:135,x:0,y:0,values:{},label:'Рівень'});
 connectProjectInput(p,'send','input',135,'ai');
 assert.equal(p.nodes[1].values.A,135);
 for(const node of p.nodes.filter(n=>n.kind==='referenceReceive')){
  assert.equal(node.pch,135);assert.equal(referenceName(p,node),'Рівень');
 }
});
test('compaction updates referenced PCH and export preserves identity',()=>{
 const p=fixture();p.nodes[0].slot=5;p.nodes[1].slot=8;
 syncSlots(p);
 assert.equal(p.nodes[0].slot,1);assert.equal(p.nodes[3].pch,256);assert.equal(p.nodes[1].values.A,256);
});
test('deleting sender exposes a missing reference instead of changing the destination signal silently',()=>{
 const p=fixture();removeProjectNode(p,'send');syncSlots(p);
 assert.equal(p.nodes.find(n=>n.id==='recv').pch,-1);
 assert.equal(p.nodes.find(n=>n.id==='b2').values.A,-1);
 assert.equal(compile(p).rows.length,0);
});
test('deleting receiver disconnects only its consumers',()=>{
 const p=fixture();removeProjectNode(p,'recv');syncSlots(p);
 assert.equal(p.nodes.find(n=>n.id==='b2').values.A,0);
 assert.deepEqual(p.nodes.find(n=>n.id==='b2').disconnected,['A']);
 assert.equal(p.nodes.find(n=>n.id==='send').values.input,256);
});
test('reference cycles and disconnected senders block dependent exports',()=>{
 const p=fixture();disconnectProjectInput(p,'b2','A');connectProjectInput(p,'send','input',256,'recv');
 assert.equal(p.nodes[3].pch,-1);assert.equal(compile(p).rows.length,0);
 const other=fixture();disconnectProjectInput(other,'send','input');syncReferences(other);
 assert.equal(other.nodes[3].pch,-1);assert.equal(compile(other).rows.length,0);
});
test('references roundtrip and snapshots restore the previous sender',()=>{
 const p=fixture();const snapshot=JSON.stringify(p);
 connectProjectInput(p,'send','input',135);
 assert.equal(p.nodes[1].values.A,135);
 const restored=syncSlots(parseProject(snapshot));
 assert.equal(restored.nodes[1].values.A,256);assert.equal(restored.nodes[3].referenceId,'send');
});
test('normal feedback connections remain legal with reference resolution',()=>{
 const p=fixture();connectProjectInput(p,'b1','A',257,'b2');
 assert.equal(p.nodes[0].values.A,257);assert.equal(p.nodes[1].values.A,256);
 assert.equal(compile(p).issues.filter(i=>i.level==='error').length,0);
});

const source=fs.readFileSync('dist/app.js','utf8');
const keyboardStart=source.indexOf("document.addEventListener('keydown',event=>{");
const keyboardEnd=source.indexOf('\nasync function showPage',keyboardStart);
function interactions(){
 const handlers={};const clicks=[];
 const viewport={scrollLeft:100,scrollTop:60,clientHeight:600,getBoundingClientRect:()=>({left:10,top:20}),addEventListener:(key,fn)=>handlers[key]=fn};
 const context=vm.createContext({document:{addEventListener:(key,fn)=>handlers[key]=fn},
  $:selector=>selector==='#viewport'?viewport:selector==='#dialog'?{open:false}:{click:()=>clicks.push(selector)},
  scale:1,pending:null,render(){},deleteSelection(){},zoom:value=>{context.scale=value;}});
 vm.runInContext(source.slice(keyboardStart,keyboardEnd),context);
 return {handlers,clicks,viewport,context};
}
test('Ctrl+Z and Ctrl+Shift+Z call undo and redo without intercepting text edits',()=>{
 const h=interactions();
 const event={target:{closest:()=>null},key:'z',ctrlKey:true,preventDefault(){}};
 h.handlers.keydown(event);h.handlers.keydown({...event,shiftKey:true});
 assert.deepEqual(h.clicks,['#undo','#redo']);
 h.handlers.keydown({...event,target:{closest:()=>({})}});assert.equal(h.clicks.length,2);
});
test('Ctrl+wheel keeps the world point under the cursor fixed',()=>{
 const h=interactions();let prevented=false;
 h.handlers.wheel({ctrlKey:true,deltaY:-100,deltaMode:0,clientX:210,clientY:120,preventDefault:()=>{prevented=true;}});
 assert(prevented);assert(h.context.scale>1);
 assert(Math.abs((h.viewport.scrollLeft+200)/h.context.scale-300)<1e-10);
 assert(Math.abs((h.viewport.scrollTop+100)/h.context.scale-160)<1e-10);
 const old=h.context.scale;
 h.handlers.wheel({ctrlKey:false,deltaY:-100});assert.equal(h.context.scale,old);
});
test('splitting a wire creates sender and receiver while preserving exported PLC parameters',()=>{
 const p=blank();p.nodes=[block('b1',1),block('b2',2)];
 connectProjectInput(p,'b2','A',256,'b1');syncSlots(p);
 const before=compile(p).rows.map(row=>[row.param,row.value]);
 assert(splitProjectConnection(p,'b2','A','b1',{sender:'send',receiver:'recv'},{sender:{x:100,y:100},receiver:{x:200,y:200}}));
 syncSlots(p);
 assert.equal(p.nodes.length,4);assert.equal(p.cycle,2);
 assert.equal(p.nodes[1].links.A.id,'recv');assert.equal(p.nodes[2].links.input.id,'b1');
 assert.equal(p.nodes[3].referenceId,'send');
 assert.deepEqual(compile(p).rows.map(row=>[row.param,row.value]),before);
 const restored=syncSlots(parseProject(JSON.stringify(p)));
 assert.equal(restored.nodes[1].values.A,256);
});
const referenceUI=fs.readFileSync('dist/reference-ui.js','utf8');
vm.runInThisContext(referenceUI.slice(0,referenceUI.indexOf("$('#dialog').addEventListener")));
global.esc=value=>String(value).replaceAll('<','&lt;').replaceAll('>','&gt;');
global.selected=null;
test('picker offers connected senders and excludes empty or broken ones',()=>{
 const p=fixture();p.nodes.push({id:'empty',kind:'referenceSend',values:{input:0},disconnected:['input']});
 p.nodes.push({id:'broken',kind:'referenceSend',values:{input:-1},links:{input:{id:'absent',pch:256}}});
 assert.deepEqual(connectedReferenceSenders(p).map(node=>node.id),['send']);
});
test('compact reference contains only the characteristic-point name and connector',()=>{
 const p=fixture();
 global.project=p;
 for(const node of p.nodes.filter(isReference)){
  const markup=referenceMarkup(node);
  assert(markup.includes('PCH256 (вихід BL1)'));assert(markup.includes(node.kind==='referenceReceive'?'<span class="reference-destination">Вихід блоку 1 →</span>':'<span class="reference-destination">→ Вхід A блоку 2</span>'));
  assert(!markup.includes('textarea'));assert(!markup.includes('<small>'));
  assert(markup.includes(node.kind==='referenceSend'?'data-in=':'data-out='));
 }
});
test('references are yellow before the receiver is wired and adopt the input name when complete',()=>{
 const p=fixture();disconnectProjectInput(p,'b2','A');syncReferences(p);
 for(const node of p.nodes.filter(isReference)){
  const view=referencePresentation(p,node);assert(view.incomplete);assert.equal(view.name,'PCH256 (вихід BL1) → Вхід не під’єднано');
 }
 connectProjectInput(p,'b2','A',256,'recv');
 for(const node of p.nodes.filter(isReference)){
  const view=referencePresentation(p,node);assert(view.active);assert(!view.incomplete);assert.equal(view.name,'PCH256 (вихід BL1) → Вхід A блоку 2');
 }
 assert.equal(p.nodes.find(n=>n.id==='b2').values.A,256);
 disconnectProjectInput(p,'b2','A');syncReferences(p);
 assert(referencePresentation(p,p.nodes.find(n=>n.id==='send')).incomplete);
});
test('references show source descriptions and actual destinations for fanout and reconnection',()=>{
 const p=fixture();
 p.nodes.push(block('b3',3),{id:'recv2',kind:'referenceReceive',values:{},referenceId:'send'});
 connectProjectInput(p,'b3','A',256,'recv2');
 const sender=p.nodes.find(n=>n.id==='send');
 assert.equal(referencePresentation(p,sender).name,'PCH256 (вихід BL1) → Вхід A блоку 2 / Вхід A блоку 3');
 assert.equal(referencePresentation(p,p.nodes.find(n=>n.id==='recv2')).name,'PCH256 (вихід BL1) → Вхід A блоку 3');
 p.nodes.push({id:'source',kind:'source',pch:134,values:{}});
 connectProjectInput(p,'send','input',134,'source');
 for(const n of p.nodes.filter(isReference))assert(referencePresentation(p,n).name.startsWith('PCH134 ('+PCH[134]+') → '));
 assert.equal(referenceSignalLabel(320),'PCH320 ('+PCH[320]+')');
 disconnectProjectInput(p,'send','input');syncReferences(p);
 assert(referencePresentation(p,sender).name.startsWith('Джерело не вибрано → '));
});
test('hover pairs use reference identity, support fanout and exclude unrelated identical PCH',()=>{
 const p=fixture();
 p.nodes.push({id:'recv2',kind:'referenceReceive',referenceId:'send',pch:256},
 {id:'otherSend',kind:'referenceSend',values:{input:256}},
 {id:'otherRecv',kind:'referenceReceive',referenceId:'otherSend',pch:256});
 assert.deepEqual(relatedReferenceIds(p,'send'),['send','recv','recv2']);
 assert.deepEqual(relatedReferenceIds(p,'recv'),['recv','send']);
 assert.deepEqual(relatedReferenceIds(p,'recv2'),['recv2','send']);
 assert.deepEqual(relatedReferenceIds(p,'b1'),[]);
 assert.deepEqual(relatedReferenceIds(p,'absent'),[]);
 removeProjectNode(p,'send');
 assert.deepEqual(relatedReferenceIds(p,'recv'),['recv']);
});
test('hover highlight clears on leave and survives movement inside a reference',()=>{
 const p=fixture(),handlers={},windowHandlers={};
 const cards=p.nodes.filter(isReference).map(node=>({dataset:{id:node.id},on:false,classList:{toggle(_name,on){this.owner.on=on;}}}));
 cards.forEach(card=>{card.classList.owner=card;card.closest=()=>card;});
 const context=vm.createContext({project:p,relatedReferenceIds,document:{querySelectorAll:()=>cards},window:{addEventListener:(name,cb)=>{windowHandlers[name]=cb;}},$ :()=>({addEventListener:(name,cb)=>{handlers[name]=cb;}})});
 vm.runInContext(referenceUI.slice(referenceUI.indexOf('let hoveredReferenceId=')),context);
 handlers.pointerover({type:'pointerover',target:cards[0]});assert(cards.every(card=>card.on));
 handlers.pointerout({type:'pointerout',target:cards[0],relatedTarget:cards[0]});assert(cards.every(card=>card.on));
 handlers.pointerleave();assert(cards.every(card=>!card.on));
 handlers.focusin({type:'focusin',target:cards[1]});assert(cards.every(card=>card.on));
 windowHandlers.blur();assert(cards.every(card=>!card.on));
});
test('receiver footer names its origin while sender footer names the destination',()=>{
 const p=fixture();global.project=p;
 const sender=p.nodes.find(n=>n.id==='send'),receiver=p.nodes.find(n=>n.id==='recv');
 assert(referenceMarkup(receiver).includes('<span class="reference-destination">Вихід блоку 1 →</span>'));
 assert(referenceMarkup(sender).includes('<span class="reference-destination">→ Вхід A блоку 2</span>'));
 p.nodes.push({id:'di4',kind:'source',pch:4,values:{}});connectProjectInput(p,'send','input',4,'di4');
 assert(referenceMarkup(receiver).includes('<span class="reference-destination">DI4 →</span>'));
});
test('header logo is removed from delivered source',()=>{
 assert(!fs.readFileSync('dist/index.html','utf8').includes('<b class="logo">M</b>'));
});
console.log(count+' reference and interaction tests passed.');
