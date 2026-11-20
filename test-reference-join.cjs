const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
vm.runInThisContext(['catalog.js','references.js','engine.js','editing.js'].map(f=>fs.readFileSync('dist/'+f,'utf8')).join('\n'));
function fixture(){const p=blank();p.nodes=[1,2,3].map(i=>({id:'b'+i,kind:'block',slot:i,code:0,x:i*300,y:100,values:{A:134}}));connectProjectInput(p,'b2','A',256,'b1');syncSlots(p);assert(splitProjectConnection(p,'b2','A','b1',{sender:'send',receiver:'recv'},{sender:{x:100,y:100},receiver:{x:200,y:100}}));return p;}
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name);}
test('split then join restores direct source, PLC export and removes both halves',()=>{
 const p=fixture(),before=compile(normalizeReferenceConnections(JSON.parse(JSON.stringify(p)))).rows;assert(joinProjectReference(p,'recv'));assert(!p.nodes.some(isReference));assert.deepEqual(p.nodes[1].links.A,{id:'b1',pch:256});assert.deepEqual(compile(p).rows,before);assert(!joinProjectReference(p,'recv'));
});
test('receiver join keeps other receivers, sender join merges remaining branches',()=>{
 const p=fixture();p.nodes.push({id:'recv2',kind:'referenceReceive',referenceId:'send',pch:256,x:200,y:500,values:{}});connectProjectInput(p,'b3','A',256,'recv2');const before=compile(normalizeReferenceConnections(JSON.parse(JSON.stringify(p)))).rows;
 assert(joinProjectReference(p,'recv'));assert(p.nodes.some(n=>n.id==='send'));assert.equal(p.nodes[2].links.A.id,'recv2');assert.deepEqual(compile(p).rows,before);
 assert(joinProjectReference(p,'send'));assert(!p.nodes.some(isReference));assert.equal(p.nodes[2].links.A.id,'b1');assert.deepEqual(compile(p).rows,before);
});
test('reference segments cannot be split again at either end',()=>{
 const p=fixture(),before=JSON.stringify(p),ids={sender:'again',receiver:'again_recv'},pos={sender:{x:1,y:1},receiver:{x:2,y:2}};
 assert(!splitProjectConnection(p,'send','input','b1',ids,pos));assert(!splitProjectConnection(p,'b2','A','recv',ids,pos));assert.equal(JSON.stringify(p),before);
});
test('dangling and cyclic references cannot be joined or silently rebound by PCH',()=>{
 const p=fixture();p.nodes.find(n=>n.id==='send').links.input.id='missing';assert.equal(referenceJoinPlan(p,'recv'),null);const before=JSON.stringify(p);assert(!joinProjectReference(p,'recv'));assert.equal(JSON.stringify(p),before);
 const cycle=fixture();disconnectProjectInput(cycle,'b2','A');connectProjectInput(cycle,'send','input',256,'recv');assert(!referenceJoinPlan(cycle,'send'));
});
test('joining leaves unattached receivers available instead of deleting them',()=>{
 const p=fixture();p.nodes.push({id:'unused',kind:'referenceReceive',referenceId:'send',pch:256,values:{},x:0,y:0});assert(joinProjectReference(p,'send'));assert(p.nodes.some(n=>n.id==='send'));assert(p.nodes.some(n=>n.id==='unused'));assert(!referenceJoinPlan(p,'unused'));
});
test('joining after slot compaction uses the current output instead of stale cached PCH',()=>{
 const p=fixture();p.nodes.find(n=>n.id==='b1').slot=5;
 // Rebuild a valid sparse-slot source connection before compaction.
 p.nodes.find(n=>n.id==='send').values.input=260;p.nodes.find(n=>n.id==='send').links.input.pch=260;
 syncSlots(p);const receiver=p.nodes.find(n=>n.id==='recv'),pch=receiver.pch;
 assert(joinProjectReference(p,'recv'));assert.equal(p.nodes.find(n=>n.id==='b2').values.A,pch);assert.equal(p.nodes.find(n=>n.id==='b2').links.A.id,'b1');
});
console.log(count+' reference join tests passed.');
