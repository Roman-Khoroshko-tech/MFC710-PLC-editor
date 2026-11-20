const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
vm.runInThisContext(['catalog.js','references.js','engine.js','editing.js'].map(name=>fs.readFileSync('dist/'+name,'utf8')).join('\n'));
const block=(slot,values={A:134})=>({id:'b'+slot,kind:'block',code:0,slot,x:20,y:30,values});
let count=0;
function test(name,check){check();count++;console.log('PASS '+name);}
test('deleting a block disconnects consumers and compacts surviving slots',()=>{
 const p=blank();p.nodes=[block(1),block(2,{A:256}),block(3,{A:257})];
 assert(removeProjectNode(p,'b1'));syncSlots(p);
 assert.equal(p.nodes.length,2);assert.equal(p.cycle,2);
 assert.equal(p.nodes[0].slot,1);assert.equal(p.nodes[0].values.A,0);
 assert.deepEqual(p.nodes[0].disconnected,['A']);assert.equal(p.nodes[1].values.A,256);
});
test('deleting a wire leaves the blocks and other inputs intact',()=>{
 const p=blank();p.nodes=[block(1),{...block(2),code:1,values:{A:256,B:134,C:7}}];
 assert(disconnectProjectInput(p,'b2','A'));
 assert.equal(p.nodes.length,2);assert.deepEqual(p.nodes[1].values,{A:0,B:134,C:7});
 assert.deepEqual(p.nodes[1].disconnected,['A']);
 assert(!disconnectProjectInput(p,'missing','A'));
});
test('literal inputs cannot be deleted as signal connections',()=>{
 const p=blank();p.nodes=[{...block(1),code:8,values:{A:134,B:10}}];
 assert(!disconnectProjectInput(p,'b1','B'));assert.equal(p.nodes[0].values.B,10);
});
test('multiline captions and disconnected input metadata roundtrip through JSON',()=>{
 const p=blank();p.nodes=[{...block(1),note:'Назва\nДругий рядок\nДовгий опис < & >'}];
 disconnectProjectInput(p,'b1','A');
 const restored=parseProject(JSON.stringify(p));
 assert.equal(restored.nodes[0].note,p.nodes[0].note);assert.deepEqual(restored.nodes[0].disconnected,['A']);
});
test('delivered HTML contains captions and deletion handlers without simulation assets',()=>{
 const html=fs.readFileSync('MFC710_PLC_Studio.html','utf8');
 assert(html.includes('data-caption='));assert(html.includes('resizeCaption'));
 assert(html.includes("event.key==='Delete'"));assert(html.includes("event.target.closest('input,textarea,select,[contenteditable=true]')"));
 assert(!html.includes('createSimulation'));assert(!html.includes('simdock'));assert(!html.includes('refreshSimulation'));
 assert(!html.includes('<option>Призначення</option>'));assert(!html.includes('...SINKS.map'));
});
console.log(count+' editing tests passed.');
