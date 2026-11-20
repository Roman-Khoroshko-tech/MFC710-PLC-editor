const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

function harness() {
 const handlers = new Map();
 const classes = () => ({add(){},remove(){},toggle(){}});
 const elements = {};
 function element(id) {
  const el = {id, dataset:{}, classList:classes(), children:[],
   addEventListener(type, fn){handlers.set(id+':'+type, fn);},
   setPointerCapture(){this.captured=true;},
   releasePointerCapture(){this.captured=false;},
   hasPointerCapture(){return this.captured;},
   contains(other){return other===port||other===input||other===row;},
   append(child){elements['#'+child.id]=child;},
   remove(){delete elements['#'+this.id];},
   setAttribute(name,value){this[name]=value;},
   getBoundingClientRect(){return {x:100,y:50,width:12,height:12};}
  };
  return el;
 }
 const port=element('port');port.dataset={pch:'134',out:'source'};
 port.closest=selector=>selector==='[data-out]'?port:null;
 const input=element('input');input.dataset={in:'b1',field:'A'};
 input.closest=selector=>selector==='[data-in]'?input:null;
 const row=element('row');row.closest=selector=>selector==='.portrow'?row:null;
 row.querySelector=()=>input;
 for(const id of ['nodes','board','wires','viewport','status'])elements['#'+id]=element(id);
 const document=element('document');
 document.querySelectorAll=()=>[];
 document.createElementNS=()=>element('preview');
 document.elementFromPoint=()=>document.hit;
 const window=element('window');
 const connections=[],scheduled=[];
 const context=vm.createContext({document,window,
  $:selector=>elements[selector],scale:.5,pending:null,selected:null,
  point:pch=>'PCH.'+pch,
  connect:(...args)=>connections.push(args),showIssues(){},render(){},
  setTimeout:fn=>scheduled.push(fn)
 });
 vm.runInContext(fs.readFileSync('dist/connections.js','utf8'),context);
 function fire(id,type,options={}) {
  const event={target:port,button:0,isPrimary:true,pointerId:1,clientX:106,clientY:56,
   preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},...options};
  handlers.get(id+':'+type)(event);
  return event;
 }
 return {context,document,port,input,row,elements,connections,fire};
}

let tests=0;
function test(name,fn){fn();tests++;console.log('PASS '+name);}
test('drag assigns source PCH to the target input and shows scaled preview',()=>{
 const h=harness();h.fire('nodes','pointerdown');
 h.document.hit=h.input;
 h.fire('window','pointermove',{clientX:300,clientY:150});
 assert(h.elements['#connection-preview'].d.startsWith('M 12 12'));
 h.fire('window','pointerup',{clientX:300,clientY:150});
 assert.deepEqual(h.connections,[['b1','A',134,'source']]);
 assert(!h.elements['#connection-preview']);
 assert.equal(h.context.selected,'b1');
 assert(h.fire('nodes','click').stopped);
});
test('dropping on an input row resolves its connector',()=>{
 const h=harness();h.fire('nodes','pointerdown');h.document.hit=h.row;
 h.fire('window','pointermove',{clientX:300});h.fire('window','pointerup');
 assert.deepEqual(h.connections,[['b1','A',134,'source']]);
});
test('clicking an output preserves two-click connections',()=>{
 const h=harness();h.fire('nodes','pointerdown');h.fire('window','pointerup');
 assert.equal(h.context.pending.pch,134);assert.equal(h.connections.length,0);
 assert(h.fire('nodes','click').stopped);
});
test('empty drops preserve existing connections',()=>{
 const h=harness();h.fire('nodes','pointerdown');
 h.fire('window','pointermove',{clientX:300});h.fire('window','pointerup');
 assert.equal(h.connections.length,0);assert(!h.elements['#connection-preview']);
});
test('Escape cancels a drag',()=>{
 const h=harness();h.fire('nodes','pointerdown');
 h.fire('window','pointermove',{clientX:300});h.fire('document','keydown',{key:'Escape'});
 h.document.hit=h.input;h.fire('window','pointerup');
 assert.equal(h.connections.length,0);assert(!h.elements['#connection-preview']);
});
test('pointer cancellation clears preview and never connects',()=>{
 const h=harness();h.fire('nodes','pointerdown');h.fire('window','pointermove',{clientX:300});
 h.fire('window','pointercancel');assert(!h.elements['#connection-preview']);assert.equal(h.connections.length,0);
});
test('another pointer and secondary buttons cannot complete a drag',()=>{
 const h=harness();h.fire('nodes','pointerdown',{button:2});h.document.hit=h.input;
 h.fire('window','pointermove',{clientX:300});h.fire('window','pointerup');assert.equal(h.connections.length,0);
 h.fire('nodes','pointerdown');h.fire('window','pointermove',{clientX:300,pointerId:2});
 h.fire('window','pointerup',{pointerId:2});assert.equal(h.connections.length,0);
});
test('dragging input to output assigns the same source and destination',()=>{
 const h=harness();h.fire('nodes','pointerdown',{target:h.input});
 h.document.hit=h.port;
 h.fire('window','pointermove',{clientX:300});h.fire('window','pointerup');
 assert.deepEqual(h.connections,[['b1','A',134,'source']]);
});
test('clicking input then output completes the reverse two-click connection',()=>{
 const h=harness();h.fire('nodes','pointerdown',{target:h.input});h.fire('window','pointerup');
 assert.equal(h.context.pending.input.id,'b1');
 h.fire('nodes','pointerdown');h.fire('window','pointerup');
 assert.deepEqual(h.connections,[['b1','A',134,'source']]);
});
test('clicking output then input completes the forward two-click connection',()=>{
 const h=harness();h.fire('nodes','pointerdown');h.fire('window','pointerup');
 h.fire('nodes','pointerdown',{target:h.input});h.fire('window','pointerup');
 assert.deepEqual(h.connections,[['b1','A',134,'source']]);
});
console.log(tests+' connection tests passed.');
