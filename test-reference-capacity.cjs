const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
vm.runInThisContext(['catalog.js','references.js','engine.js','editing.js','example-layout.js','examples.js'].map(file=>fs.readFileSync('dist/'+file,'utf8')).join('\n'));
const ui=fs.readFileSync('dist/reference-ui.js','utf8');vm.runInThisContext(ui.slice(0,ui.indexOf("$('#dialog').addEventListener")));
function fixture(){const p=blank();p.nodes=[{id:'b1',kind:'block',slot:1,code:0,x:100,y:100,values:{A:134}},{id:'b2',kind:'block',slot:2,code:1,x:400,y:100,values:{A:0,B:0,C:0}},{id:'b3',kind:'block',slot:3,code:0,x:700,y:100,values:{A:0}},...['s1','s2'].map((id,i)=>({id,kind:'referenceSend',x:100,y:400+i*100,values:{input:256},links:{input:{id:'b1',pch:256}}})),...['r1','r2'].map((id,i)=>({id,kind:'referenceReceive',x:500,y:400+i*100,referenceId:'',pch:-1,values:{}}))];syncSlots(p);return p;}
function assertCapacity(p){for(const n of p.nodes){if(n.kind==='referenceSend')assert(p.nodes.filter(r=>r.kind==='referenceReceive'&&r.referenceId===n.id).length<=1,n.id);if(n.kind==='referenceReceive')assert(referenceConsumers(p,n.id).length<=1,n.id);}}
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name);}
test('sender can be assigned once and menu exposes only free connected senders',()=>{
 const p=fixture();assert.equal(freeReferenceSenders(p).length,2);assert(assignProjectReference(p,'r1','s1'));
 assert.deepEqual(freeReferenceSenders(p).map(n=>n.id),['s2']);const before=JSON.stringify(p);assert(!assignProjectReference(p,'r2','s1'));assert.equal(JSON.stringify(p),before);
 assert(assignProjectReference(p,'r2','s2'));assert.equal(freeReferenceSenders(p).length,0);assertCapacity(p);
});
test('receiver can feed one field only; failed connection changes nothing',()=>{
 const p=fixture();assignProjectReference(p,'r1','s1');assert(connectProjectInput(p,'b2','A',256,'r1'));
 const before=JSON.stringify(p);assert(!connectProjectInput(p,'b2','B',256,'r1'));assert(!connectProjectInput(p,'b3','A',256,'r1'));assert.equal(JSON.stringify(p),before);
 assert(connectProjectInput(p,'b2','A',256,'r1'));assertCapacity(p);
 disconnectProjectInput(p,'b2','A');assert(connectProjectInput(p,'b3','A',256,'r1'));assertCapacity(p);
});
test('removing or reassigning receiver frees its previous sender',()=>{
 const p=fixture();assignProjectReference(p,'r1','s1');assert(assignProjectReference(p,'r1','s2'));assert.deepEqual(freeReferenceSenders(p).map(n=>n.id),['s1']);removeProjectNode(p,'r1');assert.equal(freeReferenceSenders(p).length,2);
});
test('real block output may still feed distinct pairs or multiple direct lines',()=>{
 const p=fixture();assignProjectReference(p,'r1','s1');assignProjectReference(p,'r2','s2');assert(connectProjectInput(p,'b2','A',256,'r1'));assert(connectProjectInput(p,'b2','B',256,'r2'));assertCapacity(p);
 assert(connectProjectInput(p,'b2','C',256,'b1'));assert(connectProjectInput(p,'b3','A',256,'b1'));assert(!compile(p).issues.some(i=>i.level==='error'));
});
test('import splits legacy fanout into individual pairs and preserves all PLC parameters',()=>{
 const p=fixture();p.nodes.find(n=>n.id==='r1').referenceId='s1';p.nodes.find(n=>n.id==='r2').referenceId='s1';
 for(const [id,key,receiver] of [['b2','A','r1'],['b2','B','r1'],['b3','A','r2']]){const n=p.nodes.find(n=>n.id===id);n.links??={};n.links[key]={id:receiver,pch:256};n.values[key]=256;}syncReferences(p);
 const direct=JSON.parse(JSON.stringify(p));for(const n of direct.nodes)for(const key of Object.keys(n.links||{}))if(n.kind==='block'&&n.links[key].id.startsWith('r'))n.links[key]={id:'b1',pch:256};direct.nodes=direct.nodes.filter(n=>!isReference(n));
 assert(compile(p).issues.some(i=>i.level==='error'));const migrated=parseProject(JSON.stringify(p));assertCapacity(migrated);
 assert.deepEqual(compile(migrated).rows,compile(direct).rows);assert.equal(migrated.nodes.filter(n=>n.kind==='referenceReceive').length,3);assert.equal(new Set(migrated.nodes.map(n=>n.id)).size,migrated.nodes.length);
 const again=parseProject(JSON.stringify(migrated));assert.deepEqual(again,migrated);
});
test('every built-in template now uses strictly individual pairs',()=>{
 for(const example of PLC_EXAMPLES){const p=example.build().project;assertCapacity(p);assert(!compile(p).issues.some(i=>i.level==='error'));}
});
test('UI connection rejects reuse without adding an undo entry',()=>{
 const p=fixture();assignProjectReference(p,'r1','s1');connectProjectInput(p,'b2','A',256,'r1');const source=fs.readFileSync('dist/app.js','utf8');
 const context=vm.createContext({project:p,fields,canConnectReferenceInput,connectProjectInput,pending:{},selectedWire:null,snapshot(){context.snapshots++;},snapshots:0,toast(){context.warned=true;},render(){},commit(){context.commits++;},commits:0});
 vm.runInContext(source.slice(source.indexOf('function connect('),source.indexOf('function deleteSelection(')),context);
 context.connect('b3','A',256,'r1');assert.equal(context.snapshots,0);assert.equal(context.commits,0);assert(context.warned);assertCapacity(p);
});
console.log(count+' reference capacity tests passed.');
