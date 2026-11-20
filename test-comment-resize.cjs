const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
function harness(edge='corner'){
 const events={},nodes={addEventListener:(type,fn)=>events['nodes:'+type]=fn,setPointerCapture(){},hasPointerCapture:()=>true,releasePointerCapture(){}};
 const n={id:'comment1',kind:'comment',x:20,y:30,values:{},note:'Text',width:240,height:120};
 const card={dataset:{id:n.id},style:{},getBoundingClientRect:()=>({width:480,height:240}),querySelector:()=>({})};const handle={dataset:{resizeComment:edge},closest:()=>card};
 const context=vm.createContext({project:{nodes:[n]},scale:2,history:[],future:['redo'],selected:null,selectedWire:null,
  snapshot(){context.history.push(JSON.stringify(context.project));context.future=[];},commit(){context.commits++;},render(){},commits:0,resizeCaption(){},
  $:()=>nodes,document:{querySelector:()=>card,addEventListener:(type,fn)=>events['document:'+type]=fn},window:{addEventListener:(type,fn)=>events['window:'+type]=fn}});
 vm.runInContext(fs.readFileSync('dist/comment-resize.js','utf8'),context);
 const fire=(name,changes={})=>events[name]({button:0,pointerId:7,clientX:100,clientY:100,target:{closest:()=>handle},preventDefault(){},stopImmediatePropagation(){},...changes});
 return {context,n,fire,card};
}
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name);}
test('corner resizing respects zoom and records one undo action per gesture',()=>{
 const h=harness();h.fire('nodes:pointerdown');h.fire('window:pointermove',{clientX:220,clientY:180});h.fire('window:pointermove',{clientX:260,clientY:220});h.fire('window:pointerup');assert.equal(h.n.width,320);assert.equal(h.n.height,180);assert.equal(h.context.history.length,1);assert.equal(h.context.commits,1);
});
test('edge handles resize only their own dimension',()=>{
 const r=harness('right');r.fire('nodes:pointerdown');r.fire('window:pointermove',{clientX:220,clientY:220});r.fire('window:pointerup');assert.equal(r.n.width,300);assert.equal(r.n.height,120);
 const b=harness('bottom');b.fire('nodes:pointerdown');b.fire('window:pointermove',{clientX:220,clientY:220});b.fire('window:pointerup');assert.equal(b.n.width,240);assert.equal(b.n.height,180);
});
test('cancel restores original dimensions and prior redo without committing',()=>{
 const h=harness();h.fire('nodes:pointerdown');h.fire('window:pointermove',{clientX:220,clientY:220});h.fire('document:keydown',{key:'Escape'});assert.equal(h.n.width,240);assert.equal(h.n.height,120);assert.equal(h.context.history.length,0);assert.equal(h.context.future[0],'redo');assert.equal(h.context.commits,0);
});
test('minimum dimensions prevent collapsing text field and click is not a history action',()=>{
 const h=harness();h.fire('nodes:pointerdown');h.fire('window:pointerup');assert.equal(h.context.history.length,0);
 h.fire('nodes:pointerdown');h.fire('window:pointermove',{clientX:-1000,clientY:-1000});h.fire('window:pointerup');assert.equal(h.n.width,160);assert.equal(h.n.height,100);
});
console.log(count+' comment resizing tests passed.');
