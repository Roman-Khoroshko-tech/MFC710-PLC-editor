const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
vm.runInThisContext(['catalog.js','references.js','engine.js','editing.js','example-layout.js','examples.js'].map(f=>fs.readFileSync('dist/'+f,'utf8')).join('\n'));
let total=0;function test(name,fn){fn();total++;console.log('PASS '+name);}
function machine(id){
 const data=buildPlcExample(id),p=data.project,values={0:0,7:1},state={};let steps=0;
 p.nodes.filter(n=>n.kind==='constant').forEach(n=>{values[320+n.resource]=n.values.value;});
 const blocks=p.nodes.filter(n=>n.kind==='block').sort((a,b)=>a.slot-b.slot);
 function step(inputs={}){
  Object.assign(values,inputs);steps++;
  for(const n of blocks){
   const args={};for(const f of fields(n))args[f.key]=f.type==='pch'?(values[n.values[f.key]]||0):n.values[f.key];
   const {A:a=0,B:b=0,C:c=0}=args,st=state[n.id]??={out:0,prev:0,elapsed:0};let out=0;
   switch(n.code){
    case 7:out=Math.max(b,Math.min(c,a));break;case 8:out=a+b;break;
    case 9:out=c?b:a;break;case 12:out=+(a>=b+c);break;
    case 16:out=Math.trunc((a-b)*1000/(c-b));break;
    case 18:out=+(!!a||!!b||!!c);break;case 19:out=+(!!a&&!!b&&!!c);break;
    case 20:out=+(!!a!==!!b);break;case 23:out=+!a;break;
    case 24:out=a?0:b?1:st.out;break;
    case 26:out=st.out;if(b)out=0;else if(a&&!st.prev)out+=c?-1:1;break;
    case 29:out=st.out;if(b&&a&&!st.prev)out=+!out;break;
    case 34:if(!a){out=0;st.elapsed=0;}else{out=+(st.elapsed%(b+c)<b);st.elapsed++;}break;
    default:throw Error('Untested opcode '+n.code);
   }
   st.out=out;st.prev=a;values[255+n.slot]=out;
  }
  return data.outputs.map(row=>values[row.pch]||0);
 }
 function hold(ms,inputs){let result;for(let i=0;i<Math.ceil(ms/data.tick);i++)result=step(inputs);return result;}
 return {data,p,values,step,hold};
}
test('all ten templates parse, compile and export the exact active block count',()=>{
 assert.equal(PLC_EXAMPLES.length,10);
 for(const e of PLC_EXAMPLES){const d=e.build(),p=parseProject(JSON.stringify(d.project)),result=compile(p);assert(!result.issues.some(i=>i.level==='error'),e.id);assert.equal(p.cycle,p.nodes.filter(n=>n.kind==='block').length);assert.equal(result.rows.find(r=>r.param==='5.145').value,p.cycle);assert(d.inputs.length&&d.outputs.length);assert(p.nodes.some(n=>n.kind==='comment'));for(const n of p.nodes.filter(isReference))assert(realReferenceSource(p,n,n.kind==='referenceSend'?n.values.input:n.pch));}
});
test('start/stop has reset priority, latches start and clears on loss of permit',()=>{
 const m=machine('start_stop');assert.deepEqual(m.step({1:1,2:0,3:1}),[1]);assert.deepEqual(m.step({1:0}),[1]);assert.deepEqual(m.step({1:1,2:1}),[0]);m.step({1:0,2:0});m.step({1:1});assert.deepEqual(m.step({1:0,3:0}),[0]);assert.deepEqual(m.step({3:1}),[0]);
});
test('fill and drain retain their states between thresholds and alarm separately',()=>{
 const f=machine('fill');assert.deepEqual(f.step({134:100,1:1}),[1]);assert.deepEqual(f.step({134:500}),[1]);assert.deepEqual(f.step({134:850}),[0]);assert.deepEqual(f.step({134:500}),[0]);
 const d=machine('drain');assert.deepEqual(d.step({134:850,1:1}),[1,0]);assert.deepEqual(d.step({134:500}),[1,0]);assert.deepEqual(d.step({134:960}),[1,1]);assert.deepEqual(d.step({134:100}),[0,0]);
});
test('dry run waits, clears accumulated short interruptions and latches the alarm',()=>{
 const m=machine('dry_run');m.step({1:1,2:1,3:0});assert.deepEqual(m.hold(1000,{2:0}),[0,1]);m.step({2:1});assert.deepEqual(m.hold(2500,{2:0}),[0,1]);assert.deepEqual(m.hold(1000,{2:0}),[1,0]);assert.deepEqual(m.step({2:1}),[1,0]);assert.deepEqual(m.step({3:1}),[0,1]);
});
test('alternation selects exactly one pump and alternates on new requests',()=>{
 const m=machine('alternate');m.step({1:0});const first=m.step({1:1});assert.equal(first[0]+first[1],1);assert.deepEqual(m.step({1:1}),first);assert.deepEqual(m.step({1:0}),[0,0]);const next=m.step({1:1});assert.equal(next[0]+next[1],1);assert.notDeepEqual(next,first);
});
test('reserve switches on fault or missing feedback and remains selected until stop',()=>{
 const m=machine('reserve');assert.deepEqual(m.step({1:1,2:0,3:1,4:0}),[1,0]);assert.deepEqual(m.step({2:1}),[0,1]);assert.deepEqual(m.step({2:0}),[0,1]);assert.deepEqual(m.step({1:0}),[0,0]);assert.deepEqual(m.step({1:1}),[1,0]);assert.deepEqual(m.hold(3100,{3:0}),[0,1]);assert.deepEqual(m.step({3:1}),[0,1]);
});
test('setpoint selector and analog scaling map their specified limits',()=>{
 const s=machine('setpoints');assert.deepEqual(s.step({2:0}),[700]);assert.deepEqual(s.step({2:1}),[400]);const a=machine('analog');assert.deepEqual(a.step({134:100}),[0,1,0]);assert.deepEqual(a.step({134:200}),[0,0,0]);assert.deepEqual(a.step({134:500}),[500,0,0]);assert.deepEqual(a.step({134:800}),[1000,0,1]);assert.deepEqual(a.step({134:950}),[1000,0,1]);
});
test('motopot counts both ways, stops at both limits and rejects simultaneous buttons',()=>{
 const m=machine('motopot');m.step({3:0,4:0});m.hold(12000,{3:1,4:0});assert.equal(m.values[263],100);m.hold(500,{3:1,4:1});assert.equal(m.values[263],100);m.hold(12000,{3:0,4:1});assert.equal(m.values[263],0);const gen=m.p.nodes.find(n=>n.code===34);assert(Math.abs(gen.values.B*m.data.tick-50.4)<1e-9);assert((gen.values.B+gen.values.C)*m.data.tick>=20);
});
test('periodic template timing is two seconds on and three seconds off',()=>{
 const m=machine('periodic'),gen=m.p.nodes.find(n=>n.code===34);assert.equal(gen.values.B*m.data.tick,2000);assert.equal(gen.values.C*m.data.tick,3000);assert.deepEqual(m.step({1:0}),[0]);assert.deepEqual(m.step({1:1}),[1]);assert.deepEqual(m.hold(2100,{1:1}),[0]);assert.deepEqual(m.step({1:0}),[0]);
});
console.log(total+' template scenario tests passed (software model only).');
