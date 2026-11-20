const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function harness(){
 const events={},elements={},deleted=[],disconnected=[];
 const project={nodes:[{id:'a',x:20,y:20},{id:'b',x:100,y:100},{id:'c',x:400,y:400}]};
 const classes=()=>({items:new Set(),toggle(key,on){on?this.items.add(key):this.items.delete(key);}});
 const cards=project.nodes.map(node=>({dataset:{id:node.id},classList:classes(),style:{},
  getBoundingClientRect:()=>({left:node.x,top:node.y,right:node.x+60,bottom:node.y+60})}));
 const wire={dataset:{target:'b',field:'A'},classList:classes(),getBoundingClientRect:()=>({left:50,top:50,right:150,bottom:150})};
 const board={getBoundingClientRect:()=>({left:0,top:0}),append:el=>{elements['#'+el.id]=el;}};
 const viewport={addEventListener:(type,fn)=>events['viewport:'+type]=fn,setPointerCapture(){},hasPointerCapture:()=>true,releasePointerCapture(){}};
 const document={addEventListener:(type,fn)=>events['document:'+type]=fn,
  createElement:()=>({style:{},remove(){delete elements['#selection-box'];}}),
  querySelectorAll:selector=>selector==='#nodes .node'?cards:selector==='#wires .wire'?[wire]:[],
  querySelector:selector=>cards.find(card=>selector.includes('"'+card.dataset.id+'"'))};
 const context=vm.createContext({document,window:{addEventListener:(type,fn)=>events['window:'+type]=fn},project,
  scale:2,history:[],future:[],selected:null,selectedWire:null,pending:null,
  $:selector=>elements[selector]||(selector==='#board'?board:selector==='#viewport'?viewport:selector==='#status'?{}:null),
  snapshot:()=>context.history.push(JSON.stringify(project)),
  commit:()=>{context.commits++;context.refreshSelection();},render:()=>context.refreshSelection(),properties(){},drawWires(){},setTimeout(){},commits:0,
  removeProjectNode:(p,id)=>{deleted.push(id);p.nodes=p.nodes.filter(n=>n.id!==id);},disconnectProjectInput:(p,id,key)=>disconnected.push([id,key])});
 vm.runInContext(fs.readFileSync('dist/selection.js','utf8'),context);
 const blank={closest:()=>null};
 function fire(target,type,changes={}){events[target+':'+type]({button:0,isPrimary:true,pointerId:1,clientX:10,clientY:10,target:blank,preventDefault(){},stopImmediatePropagation(){},...changes});}
 function select(){fire('viewport','pointerdown');fire('window','pointermove',{clientX:200,clientY:200});fire('window','pointerup');}
 return {context,project,cards,fire,select,deleted,disconnected};
}
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name);}
test('rectangle selects enclosed nodes and wires, leaving outside nodes untouched',()=>{
 const h=harness();h.select();assert(h.cards[0].classList.items.has('group-selected'));assert(h.cards[1].classList.items.has('group-selected'));assert(!h.cards[2].classList.items.has('group-selected'));
});
test('group deletion is one undo operation and deletes only enclosed elements',()=>{
 const h=harness();h.select();assert(h.context.deleteGroupSelection());
 assert.deepEqual(h.deleted,['a','b']);assert.deepEqual(h.disconnected,[['b','A']]);assert.equal(h.context.history.length,1);assert.equal(h.project.nodes[0].id,'c');
});
test('group movement preserves distances and accounts for zoom',()=>{
 const h=harness();h.select();const card=h.cards[0];
 const target={closest:selector=>selector==='.node'?card:selector==='.nodehead'?{}:null};
 h.fire('viewport','pointerdown',{target,clientX:30,clientY:30});
 h.fire('window','pointermove',{clientX:70,clientY:90});h.fire('window','pointerup');
 assert.equal(h.project.nodes[0].x,40);assert.equal(h.project.nodes[0].y,50);assert.equal(h.project.nodes[1].x,120);assert.equal(h.project.nodes[1].y,130);assert.equal(h.context.history.length,1);
});
test('right and middle mouse buttons do not start a rectangle',()=>{
 const h=harness();h.fire('viewport','pointerdown',{button:1});h.fire('window','pointermove',{clientX:200,clientY:200});assert(!h.cards[0].classList.items.has('group-selected'));
});
test('group movement translates every internal waypoint once, including legacy routes',()=>{
 const h=harness();h.select();const a=h.project.nodes[0],b=h.project.nodes[1],outside=h.project.nodes[2];
 b.links={A:{id:'a'},B:{id:'a'},C:{id:'c'}};b.wireRoutes={A:[{x:50,y:40},{x:80,y:70}],B:{x:60,y:50},C:[{x:300,y:200}]};
 outside.links={A:{id:'b'}};outside.wireRoutes={A:[{x:350,y:300}]};
 const target={closest:selector=>selector==='.node'?h.cards[0]:selector==='.nodehead'?{}:null};
 h.fire('viewport','pointerdown',{target,clientX:30,clientY:30});
 h.fire('window','pointermove',{clientX:50,clientY:50});h.fire('window','pointermove',{clientX:70,clientY:90});h.fire('window','pointerup');
 assert.equal(a.x,40);assert.equal(a.y,50);assert.equal(b.wireRoutes.A[0].x,70);assert.equal(b.wireRoutes.A[0].y,70);assert.equal(b.wireRoutes.A[1].x,100);assert.equal(b.wireRoutes.A[1].y,100);
 assert.equal(b.wireRoutes.B.x,80);assert.equal(b.wireRoutes.B.y,80);
 assert.equal(b.wireRoutes.C[0].x,300);assert.equal(outside.wireRoutes.A[0].x,350);assert.equal(h.context.history.length,1);
 const undo=JSON.parse(h.context.history[0]);assert.equal(undo.nodes[1].wireRoutes.A[0].x,50);assert.equal(undo.nodes[0].x,20);
});
test('cancelling a group drag restores waypoints, positions and redo history',()=>{
 const h=harness();h.select();h.context.future=['redo'];const b=h.project.nodes[1];b.links={A:{id:'a'}};b.wireRoutes={A:[{x:50,y:40},{x:80,y:70}]};const before=JSON.stringify(h.project);
 const target={closest:selector=>selector==='.node'?h.cards[0]:selector==='.nodehead'?{}:null};
 h.fire('viewport','pointerdown',{target,clientX:30,clientY:30});h.fire('window','pointermove',{clientX:70,clientY:90});h.fire('document','keydown',{key:'Escape'});
 assert.equal(JSON.stringify(h.project),before);assert.equal(h.context.history.length,0);assert.equal(h.context.future[0],'redo');
});
console.log(count+' group-selection tests passed.');
