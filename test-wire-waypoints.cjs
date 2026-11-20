const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
vm.runInThisContext(['catalog.js','references.js','engine.js','editing.js','wire-routing.js'].map(file=>fs.readFileSync('dist/'+file,'utf8')).join('\n'));
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name);}
test('several waypoints insert in curve order and the path crosses every point',()=>{
 const n={wireRoutes:{A:{x:400,y:300}}};
 assert(insertWireWaypoint(n,'A',{x:200,y:150},[0,100,800,100]));assert.equal(n.wireRoutes.A.length,2);assert.equal(n.wireRoutes.A[0].x,200);
 insertWireWaypoint(n,'A',{x:700,y:150},[0,100,800,100]);assert.deepEqual(n.wireRoutes.A.map(p=>p.x),[200,400,700]);
 const samples=connectionCurvePoints(0,100,800,100,n.wireRoutes.A);for(const p of n.wireRoutes.A)assert(samples.some(s=>s.x===p.x&&s.y===p.y));assert.deepEqual(samples[0],{x:0,y:100});assert.deepEqual(samples.at(-1),{x:800,y:100});
});
test('waypoint arrays roundtrip without changing PLC parameters and reject invalid points',()=>{
 const p=blank();p.nodes=[{id:'b1',kind:'block',slot:1,code:0,x:10,y:10,values:{A:134}},{id:'b2',kind:'block',slot:2,code:0,x:600,y:10,values:{A:256}}];connectProjectInput(p,'b2','A',256,'b1');syncSlots(p);
 const before=compile(p).rows;p.nodes[1].wireRoutes={A:[{x:300,y:600},{x:500,y:400}]};const restored=parseProject(JSON.stringify(p));assert.deepEqual(restored.nodes[1].wireRoutes,p.nodes[1].wireRoutes);assert.deepEqual(compile(restored).rows,before);
 restored.nodes[1].wireRoutes.A.push({x:null,y:4});assert.throws(()=>parseProject(JSON.stringify(restored)));
});
function harness(){
 const events={},node={id:'b2',values:{A:256},links:{A:{id:'b1',pch:256}},wireRoutes:{A:[{x:300,y:200},{x:600,y:400}]}};
 const svg={addEventListener:(type,fn)=>events['svg:'+type]=fn,setPointerCapture(){},hasPointerCapture:()=>true,releasePointerCapture(){}};
 const context=vm.createContext({project:{nodes:[node]},wireRoutePoints,scale:2,history:[],future:['redo'],selected:null,selectedWire:null,pending:null,
  snapshot(){context.history.push(JSON.stringify(context.project));context.future=[];},commit(){context.commits++;},commits:0,render(){},drawWires(){},$:()=>svg,
  document:{addEventListener:(type,fn)=>events['document:'+type]=fn},window:{addEventListener:(type,fn)=>events['window:'+type]=fn}});
 vm.runInContext(fs.readFileSync('dist/wire-waypoints.js','utf8'),context);
 const handle={dataset:{target:'b2',field:'A',waypoint:'1'}};
 const fire=(name,changes={})=>events[name]({button:0,pointerId:9,clientX:100,clientY:100,target:{closest:selector=>selector==='.wire-waypoint'?handle:null},preventDefault(){},stopImmediatePropagation(){},...changes});
 return {context,node,fire};
}
test('dragging one handle moves only that waypoint and creates one undo entry',()=>{
 const h=harness(),links=JSON.stringify(h.node.links);h.fire('svg:pointerdown');h.fire('window:pointermove',{clientX:180,clientY:140});h.fire('window:pointermove',{clientX:200,clientY:180});h.fire('window:pointerup');
 assert.equal(h.node.wireRoutes.A[1].x,650);assert.equal(h.node.wireRoutes.A[1].y,440);assert.equal(h.node.wireRoutes.A[0].x,300);assert.equal(JSON.stringify(h.node.links),links);assert.equal(h.context.history.length,1);assert.equal(h.context.commits,1);assert.equal(JSON.parse(h.context.history[0]).nodes[0].wireRoutes.A[1].x,600);
});
test('plain wire dragging has no effect; cancellation restores points and redo',()=>{
 const h=harness();h.fire('svg:pointerdown',{target:{closest:()=>null}});h.fire('window:pointermove',{clientX:300,clientY:300});assert.equal(h.context.history.length,0);assert.equal(h.node.wireRoutes.A[1].x,600);
 h.fire('svg:pointerdown');h.fire('window:pointermove',{clientX:300,clientY:300});h.fire('document:keydown',{key:'Escape'});assert.equal(h.node.wireRoutes.A[1].x,600);assert.equal(h.context.history.length,0);assert.equal(h.context.future[0],'redo');
});
test('handles show on hover and right-click menu can add or delete individual points',()=>{
 const css=fs.readFileSync('dist/style.css','utf8');assert(css.includes('opacity:0;cursor:move'));assert(css.includes('.wire-group:hover .wire-waypoint'));
 const menu=fs.readFileSync('dist/wire-menu.js','utf8');assert(menu.includes("addWaypointButton.textContent='Додати точку переміщення'"));assert(menu.includes("removeWaypointButton.textContent='Видалити точку'"));
});
console.log(count+' waypoint tests passed.');
