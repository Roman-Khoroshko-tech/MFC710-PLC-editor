const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
function harness(){
 const events={},classes=new Set();
 const viewport={scrollLeft:500,scrollTop:300,
  classList:{add:name=>classes.add(name),remove:name=>classes.delete(name)},
  setPointerCapture(id){this.capture=id;},hasPointerCapture(id){return this.capture===id;},
  releasePointerCapture(){this.capture=null;},addEventListener:(type,fn)=>events['viewport:'+type]=fn};
 const context=vm.createContext({$:()=>viewport,window:{addEventListener:(type,fn)=>events['window:'+type]=fn},clearConnectionGesture(){},pending:null});
 vm.runInContext(fs.readFileSync('dist/navigation.js','utf8'),context);
 function fire(target,type,changes={}){
  const event={button:1,isPrimary:true,pointerId:1,clientX:100,clientY:100,
   preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},...changes};
  events[target+':'+type](event);return event;
 }
 return {fire,viewport,classes};
}
let count=0;
function test(name,check){check();count++;console.log('PASS '+name);}
test('middle mouse pans by screen displacement and captures the pointer',()=>{
 const h=harness();const down=h.fire('viewport','pointerdown');assert(down.prevented&&down.stopped);
 assert(h.classes.has('panning'));
 h.fire('window','pointermove',{clientX:160,clientY:70});
 assert.equal(h.viewport.scrollLeft,440);assert.equal(h.viewport.scrollTop,330);
 h.fire('window','pointerup');assert(!h.classes.has('panning'));assert.equal(h.viewport.capture,null);
});
test('primary button does not start panning',()=>{
 const h=harness();h.fire('viewport','pointerdown',{button:0});
 h.fire('window','pointermove',{clientX:160});assert.equal(h.viewport.scrollLeft,500);
});
test('cancel and window blur stop panning',()=>{
 const h=harness();h.fire('viewport','pointerdown');h.fire('window','pointercancel');
 h.fire('window','pointermove',{clientX:200});assert.equal(h.viewport.scrollLeft,500);
 h.fire('viewport','pointerdown');h.fire('window','blur');assert(!h.classes.has('panning'));
});
test('middle click suppresses native auto-scroll',()=>{
 const h=harness();assert(h.fire('viewport','auxclick').prevented);
 assert(!h.fire('viewport','auxclick',{button:2}).prevented);
});
test('vertical-only movement scrolls up and down without horizontal movement',()=>{
 const h=harness();h.fire('viewport','pointerdown');
 h.fire('window','pointermove',{clientY:180});
 assert.equal(h.viewport.scrollTop,220);assert.equal(h.viewport.scrollLeft,500);
 h.fire('window','pointermove',{clientY:20});
 assert.equal(h.viewport.scrollTop,380);assert.equal(h.viewport.scrollLeft,500);
});
test('viewport is height-constrained and scrollable in both dimensions',()=>{
 const css=fs.readFileSync('dist/style.css','utf8');
 assert(css.includes('.workspace{height:100%;min-height:0;overflow:hidden}'));
 assert(css.includes('#viewport{flex:1 1 0%;min-height:0;overflow-x:auto;overflow-y:auto;'));
});
console.log(count+' navigation tests passed.');
