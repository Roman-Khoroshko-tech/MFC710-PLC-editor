const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function harness(saved=null){
 const handlers={},style={},classes=new Set(),handles=[],stored={};
 const main={clientWidth:1400,clientHeight:800,style:{setProperty:(name,value)=>style[name]=value},
  classList:{contains:key=>classes.has(key),add:key=>classes.add(key),toggle(key){if(classes.has(key)){classes.delete(key);return false;}classes.add(key);return true;}},
  append:el=>handles.push(el),getBoundingClientRect:()=>({left:0,top:0})};
 const width=side=>classes.has('hide-'+side)?0:parseFloat(style[side==='left'?'--library-width':'--inspector-width']|| (side==='left'?216:236));
 const library={getBoundingClientRect:()=>({left:0,right:width('left'),width:width('left')})};
 const inspector={getBoundingClientRect:()=>({left:1400-width('right'),width:width('right')})};
 const validation={getBoundingClientRect:()=>({left:width('left'),top:800-parseFloat(style['--validation-height']||88),width:1400-width('left')-width('right'),height:parseFloat(style['--validation-height']||88)})};
 const elements={'main':main,'.library':library,'.inspector':inspector,'.validation':validation,'.workspace':{clientHeight:800}};
 let controls;
 const document={body:{classList:{add(){},remove(){}}},createElement:()=>({style:{},children:[],setAttribute(){},append(el){this.children.push(el);},setPointerCapture(id){this.capture=id;},hasPointerCapture(id){return this.capture===id;},releasePointerCapture(){this.capture=null;}})};
 elements['#help']={before:el=>controls=el};
 const context=vm.createContext({document,$:selector=>elements[selector],window:{addEventListener:(type,fn)=>handlers[type]=fn},drawWires(){},
  localStorage:{getItem:()=>saved,setItem:(key,value)=>stored[key]=value}});
 vm.runInContext(fs.readFileSync('dist/panels.js','utf8'),context);
 function resize(index,from,to){
  handles[index].onpointerdown({button:0,isPrimary:true,pointerId:1,clientX:from,clientY:from,preventDefault(){},stopPropagation(){}});
  handlers.pointermove({pointerId:1,clientX:to,clientY:to,preventDefault(){}});handlers.pointerup({pointerId:1});
 }
 return {handles,controls,style,classes,stored,resize};
}
let count=0;function test(name,check){check();count++;console.log('PASS '+name);}
test('panel handles resize left, right and bottom in their expected directions',()=>{
 const h=harness();h.resize(0,100,180);assert.equal(h.style['--library-width'],'296px');
 h.resize(1,100,130);assert.equal(h.style['--inspector-width'],'206px');
 h.resize(2,100,60);assert.equal(h.style['--validation-height'],'128px');
});
test('all three panels can be hidden and restored independently',()=>{
 const h=harness();assert.equal(h.controls.children.length,3);
 h.controls.children[0].onclick();assert(h.classes.has('hide-left'));assert(!h.classes.has('hide-right'));
 h.controls.children[0].onclick();assert(!h.classes.has('hide-left'));
 h.controls.children[2].onclick();assert(h.classes.has('hide-bottom'));
});
test('panel sizes and visibility restore from browser preferences',()=>{
 const h=harness();h.resize(0,100,180);h.controls.children[1].onclick();
 const restored=harness(h.stored['mfc710-panels']);
 assert.equal(restored.style['--library-width'],'296px');assert(restored.classes.has('hide-right'));
});
test('default desktop panels are reduced by twenty percent',()=>{
 const css=fs.readFileSync('dist/style.css','utf8');
 assert(css.includes('--library-width:216px'));assert(css.includes('--inspector-width:236px'));
 assert(css.includes('height:var(--validation-height,88px)'));
});
test('hidden-library preference restores its visibility and width',()=>{const h=harness(JSON.stringify({left:{hidden:true,size:260}}));assert(h.classes.has('hide-left'));assert.equal(h.style['--library-width'],'260px');});
console.log(count+' panel tests passed.');
