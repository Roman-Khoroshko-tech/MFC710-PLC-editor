const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
vm.runInThisContext(['catalog.js','references.js','engine.js','editing.js','example-layout.js','examples.js'].map(file=>fs.readFileSync('dist/'+file,'utf8')).join('\n'));
const routing=fs.readFileSync('dist/wire-routing.js','utf8');vm.runInThisContext(routing);
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name);}
test('curved routes keep both endpoints fixed and pass through the dragged point',()=>{
 const points=connectionCurvePoints(200,100,500,200,{x:350,y:400});assert.deepEqual(points[0],{x:200,y:100});assert.deepEqual(points.at(-1),{x:500,y:200});assert(points.some(p=>p.x===350&&p.y===400));assert(connectionPath(200,100,500,200,{x:350,y:400}).includes('350 400'));
});
test('crossing detector distinguishes a true intersection from separated curves',()=>{
 assert(curveLinesCross([{x:0,y:0},{x:100,y:100}],[{x:0,y:100},{x:100,y:0}]));assert(!curveLinesCross([{x:0,y:0},{x:100,y:0}],[{x:0,y:100},{x:100,y:100}]));
});
test('example planner keeps unambiguous direct wires and reroutes crossings first',()=>{
 const direct={id:'b',sourceId:'a',key:'A',x1:200,y1:100,x2:500,y2:100};planExampleWires([direct],[]);assert(!direct.route&&!direct.removed);
 const edges=[{...direct},{id:'d',sourceId:'c',key:'A',x1:200,y1:200,x2:500,y2:0}];planExampleWires(edges,[]);assert(edges.some(e=>e.route));for(const e of edges.filter(e=>!e.removed))assert.equal(exampleWireScore(e,e.points,edges,[]),0);
});
test('all templates start with direct links and retain their exact PLC configuration',()=>{
 for(const entry of PLC_EXAMPLES){const data=entry.build(),p=data.project;if(!data.layoutLocked)assert(!p.nodes.some(isReference));assert(p.nodes.some(n=>n.links));assert(!compile(p).issues.some(i=>i.level==='error'));for(const n of p.nodes)for(const f of fields(n))if(f.type==='pch'&&(n.values[f.key]===0||n.values[f.key]===7))assert(!n.links?.[f.key]);}
});
test('manual wire routes roundtrip in JSON without adding PLC parameters',()=>{
 const p=buildPlcExample('motopot').project,b=p.nodes.find(n=>n.id==='b2'),before=compile(p).rows;b.wireRoutes={A:{x:650,y:480}};const parsed=parseProject(JSON.stringify(p));assert.deepEqual(parsed.nodes.find(n=>n.id==='b2').wireRoutes,b.wireRoutes);assert.deepEqual(compile(parsed).rows,before);disconnectProjectInput(parsed,'b2','A');assert(!parsed.nodes.find(n=>n.id==='b2').wireRoutes.A);
});
test('double click does not delete wires and right-click menu includes delete',()=>{
 assert(!fs.readFileSync('dist/app.js','utf8').includes("$('#wires').ondblclick"));assert(fs.readFileSync('dist/wire-menu.js','utf8').includes("deleteWireButton.textContent='Видалити'"));
 const html=fs.readFileSync('dist/index.html','utf8'),header=html.slice(html.indexOf('<header>'),html.indexOf('</header>'));assert(!header.includes('інструкція 7.4'));
});
console.log(count+' wire layout tests passed.');
