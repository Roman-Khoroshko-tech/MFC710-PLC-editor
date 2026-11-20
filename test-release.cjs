const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
vm.runInThisContext(['catalog.js','references.js','engine.js','editing.js','example-layout.js','examples.js'].map(name=>fs.readFileSync('dist/'+name,'utf8')).join('\n'));
let count=0;
function test(name,run){run();count++;console.log('PASS '+name);}
const block=(id='b1',slot=1)=>({id,slot,kind:'block',code:0,x:100,y:100,values:{A:134}});
const fixture=()=>({...blank(),nodes:[block()]});
const parameters=p=>compile(p).rows.map(row=>[row.param,row.value]);
function rejects(edit){const p=fixture();edit(p);assert.throws(()=>parseProject(JSON.stringify(p)));}

test('direct self-feedback retains stored PLC output and exports its own PCH',()=>{
 const p=fixture();assert(connectProjectInput(p,'b1','A',256,'b1'));syncSlots(p);
 assert.equal(p.nodes[0].values.A,256);assert.equal(compile(p).rows.find(row=>row.param==='6.2').value,256);
 assert(compile(p).issues.some(issue=>issue.level==='warning'));assert.equal(compile(p).issues.filter(issue=>issue.level==='error').length,0);
 assert.deepEqual(parameters(parseProject(JSON.stringify(p))),parameters(p));
});
test('self-feedback split into references and joined back preserves parameters',()=>{
 const p=fixture();connectProjectInput(p,'b1','A',256,'b1');const before=parameters(p);
 assert(splitProjectConnection(p,'b1','A','b1',{sender:'send',receiver:'recv'},{sender:{x:350,y:100},receiver:{x:15,y:100}}));
 assert.deepEqual(parameters(p),before);assert.deepEqual(parameters(parseProject(JSON.stringify(p))),before);
 assert(joinProjectReference(p,'recv'));assert.deepEqual(parameters(p),before);
});
test('reference-only cycles still block export',()=>{
 const p=fixture();p.nodes.push({id:'s',kind:'referenceSend',x:0,y:0,values:{input:256},links:{input:{id:'r',pch:256}}},{id:'r',kind:'referenceReceive',x:0,y:0,values:{},referenceId:'s',pch:256});
 p.nodes[0].links={A:{id:'r',pch:256}};syncSlots(p);assert.equal(compile(p).rows.length,0);
});
test('damaged optional JSON fields are rejected before touching the active graph',()=>{
 for(const value of ['A',{},[null],[5],['absent']])rejects(p=>p.nodes[0].disconnected=value);
 for(const value of [null,[],{A:null},{A:[]},{A:{id:'b1'}},{A:{id:'<img>',pch:256}},{missing:{id:'b1',pch:256}}])rejects(p=>p.nodes[0].links=value);
 for(const key of ['label','note','referenceId'])rejects(p=>p.nodes[0][key]={bad:true});
 rejects(p=>p.nodes[0].code='0');rejects(p=>p.nodes[0].values.A=null);rejects(p=>p.nodes[0].values.A='134');
});
test('duplicate node identities and malformed route points are rejected',()=>{
 rejects(p=>p.nodes.push({...block(),x:300}));
 for(const route of [null,'path',[null],[{x:10,y:'20'}],Array.from({length:41},()=>({x:1,y:2}))])rejects(p=>p.nodes[0].wireRoutes={A:route});
 rejects(p=>p.nodes[0].wireRoutes={unused:[{x:1,y:2}]});
});
test('dangling source identity remains a visible error and cannot export a stale PCH',()=>{
 const p=fixture();p.nodes[0].links={A:{id:'missing',pch:134}};
 const loaded=parseProject(JSON.stringify(p));assert.equal(loaded.nodes[0].values.A,-1);assert.equal(compile(loaded).rows.length,0);
});
test('empty and source-only diagrams never enable old PLC configuration',()=>{
 for(const nodes of [[],[{id:'di',kind:'source',pch:3,x:0,y:0,values:{}}]]){
  const p={...blank(),nodes};const rows=compile(p).rows;
  assert.equal(rows.at(-1).param,'5.144');assert.equal(rows.at(-1).value,0);assert(!rows.some(row=>row.param==='5.144'&&row.value===1));
 }
});
test('every documented function builds parseable parameters with unique addresses',()=>{
 for(const f of FUNCTIONS){
  const p=fixture();p.extended=true;const n=p.nodes[0];n.code=f.code;
  for(const field of fields(n))n.values[field.key]=field.key==='LEN'?8:0;
  if(f.code===2)n.values.C=147;
  if(f.code===16||f.code===29)n.values.C=1;
  const result=compile(parseProject(JSON.stringify(p)));
  assert(!result.issues.some(issue=>issue.level==='error'),'code '+f.code);
  const body=result.rows.filter(row=>row.phase.startsWith('2'));
  assert.equal(new Set(body.map(row=>row.param)).size,body.length,'code '+f.code);
  assert(result.rows.every(row=>/^\d+\.\d+$/.test(row.param)&&Number.isInteger(row.value)),'code '+f.code);
 }
});
test('48-slot graph survives compaction, self-feedback, reference conversion and deletion',()=>{
 const p=blank();p.nodes=Array.from({length:48},(_,i)=>block('b'+(i+1),i+1));
 for(let i=0;i<48;i++)connectProjectInput(p,p.nodes[i].id,'A',i===0?256:255+i,i===0?'b1':'b'+i);
 syncSlots(p);assert.equal(p.cycle,48);assert.equal(compile(p).issues.filter(i=>i.level==='error').length,0);
 assert.deepEqual(parameters(parseProject(JSON.stringify(p))),parameters(p));
 const before=parameters(p);assert(splitProjectConnection(p,'b25','A','b24',{sender:'s',receiver:'r'},{sender:{x:100,y:400},receiver:{x:400,y:400}}));
 assert.deepEqual(parameters(p),before);assert(joinProjectReference(p,'s'));assert.deepEqual(parameters(p),before);
 removeProjectNode(p,'b17');syncSlots(p);assert.equal(p.cycle,47);
 assert.equal(p.nodes.find(n=>n.id==='b18').values.A,0);assert.equal(p.nodes.find(n=>n.id==='b19').values.A,272);
 assert.deepEqual(parameters(parseProject(JSON.stringify(p))),parameters(p));
});
test('all ten examples roundtrip and nine edited layouts remain exact',()=>{
 assert.equal(PLC_EXAMPLES.length,10);assert.equal(Object.keys(EDITED_EXAMPLE_PROJECTS).length,9);
 const geometry=p=>p.nodes.map(n=>({id:n.id,x:n.x,y:n.y,width:n.width,height:n.height,note:n.note,wireRoutes:n.wireRoutes}));
 for(const entry of PLC_EXAMPLES){
  const data=entry.build(),p=data.project;
  assert.deepEqual(parameters(parseProject(JSON.stringify(p))),parameters(p),entry.id);
  if(data.layoutLocked)assert.deepEqual(geometry(p),geometry(EDITED_EXAMPLE_PROJECTS[p.title]),entry.id);
 }
});
const app=fs.readFileSync('dist/app.js','utf8');
test('foreign drag payloads cannot add unknown functions or characteristic points',()=>{
 const context=vm.createContext({FUNCTIONS,PCH,project:fixture(),crypto:{randomUUID(){throw Error('Should reject before allocation');}}});
 vm.runInContext(app.slice(app.indexOf('function add('),app.indexOf('function commentMarkup(')),context);
 for(const key of [null,{},'f:44','f:999','f:2x','p:999','p:3x','text from another app'])assert.doesNotThrow(()=>context.add(key));
});
test('changing PCH in inspector clears geometry belonging to the previous connection',()=>{
 const n=block();n.links={A:{id:'old',pch:256}};n.wireRoutes={A:[{x:300,y:200}]};n.disconnected=['A'];
 const element={},context=vm.createContext({$:()=>element,project:{nodes:[n]},selected:'b1',snapshot(){},commit(){},Number});
 const start=app.indexOf("$('#properties').onchange=");vm.runInContext(app.slice(start,app.indexOf("$('#properties').onclick=",start)),context);
 element.onchange({target:{dataset:{value:'A'},value:'135'}});assert.equal(n.values.A,135);assert(!n.links.A);assert(!n.wireRoutes.A);assert.deepEqual(n.disconnected,[]);
});
test('single-node drag ignores right click and restores state on pointer cancellation',()=>{
 const n=block(),handlers={},card={dataset:{id:'b1'},setPointerCapture(){},hasPointerCapture:()=>true,releasePointerCapture(){},style:{}},head={closest:s=>s==='button'?null:s==='.nodehead'?head:card};
 const element={},context=vm.createContext({$:()=>element,project:{nodes:[n]},selected:null,selectedWire:null,history:[],future:['redo'],scale:1,
  document:{querySelector:()=>card,addEventListener:(name,fn)=>{handlers[name]=fn;}},window:{addEventListener:(name,fn)=>{handlers[name]=fn;}},drawWires(){},render(){},commit(){context.committed=true;},snapshot(){context.history.push('snapshot');context.future=[];}});
 vm.runInContext(app.slice(app.indexOf('let drag=null;'),app.indexOf("$('#wires').onclick=")),context);
 element.onpointerdown({button:2,isPrimary:true,target:head,pointerId:1,clientX:100,clientY:100});
 element.onpointermove({clientX:200,clientY:200});assert.equal(n.x,100);assert.equal(context.history.length,0);
 element.onpointerdown({button:0,isPrimary:true,target:head,pointerId:1,clientX:100,clientY:100});
 element.onpointermove({clientX:200,clientY:200});assert.equal(n.x,200);assert.equal(context.history.length,1);
 handlers.pointercancel();assert.equal(n.x,100);assert.equal(n.y,100);assert.equal(context.history.length,0);assert.deepEqual(Array.from(context.future),['redo']);assert(!context.committed);
});
console.log(count+' release regression tests passed.');
