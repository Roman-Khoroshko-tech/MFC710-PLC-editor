// Execute the complete generated script, not isolated files. This catches
// initialization-order regressions that appear only in the single-file build.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function harness(savedLanguage='uk'){
 const elements=new Map(),events={},frames=[],observers=[];let context;
 function element(){return {nodeType:1,tagName:'DIV',value:'',style:{setProperty(){}},dataset:{},children:[],attributes:{},clientWidth:1200,clientHeight:700,offsetHeight:100,scrollLeft:0,scrollTop:0,
  classList:{add(){},remove(){},toggle(){},contains(){return false;}},
  append(child){this.children.push(child);},prepend(){},before(){},setAttribute(key,value){this.attributes[key]=value;},getAttribute(key){return this.attributes[key];},hasAttribute(key){return Object.hasOwn(this.attributes,key);},
  addEventListener(){},matches(){return false;},closest(){return null;},contains(){return false;},focus(){},remove(){},close(){this.open=false;},showModal(){this.open=true;},hasPointerCapture(){return false;},
  getBoundingClientRect(){return{x:0,y:0,left:0,top:0,right:100,bottom:100,width:100,height:100};},querySelector(){return element();},querySelectorAll(){return[];}};}
 const doc={readyState:'loading',body:element(),documentElement:element(),querySelector(key){if(!elements.has(key))elements.set(key,element());return elements.get(key);},querySelectorAll(){return[];},createElement:element,createElementNS:element,createTreeWalker(){return{nextNode:()=>null};},addEventListener(){}};
 doc.querySelector('#category').value='Усі категорії';
 context=vm.createContext({document:doc,window:{addEventListener(type,fn){(events[type]??=[]).push(fn);}},localStorage:{getItem(key){return key==='mfc710-language'?savedLanguage:null;},setItem(){}},MutationObserver:class{constructor(callback){observers.push(callback);}observe(){}},NodeFilter:{SHOW_TEXT:4},requestAnimationFrame(fn){frames.push(fn);return fn;},cancelAnimationFrame(fn){const index=frames.indexOf(fn);if(index>=0)frames.splice(index,1);},setTimeout(){},clearTimeout(){},console});
 const html=fs.readFileSync('MFC710_PLC_Studio.html','utf8');const script=html.match(/<script>([\s\S]*)<\/script>/)[1];
 vm.runInContext(script,context,{timeout:5000});
 return {context,events,frames,observers,elements,run:code=>vm.runInContext(code,context,{timeout:5000})};
}
let count=0;function test(name,run){run();count++;console.log('PASS '+name);}
test('complete offline script initializes and renders after DOMContentLoaded in all languages',()=>{
 for(const language of ['uk','en','pl']){
  const h=harness(language);assert(h.elements.get('#catalog').innerHTML.includes('catalogitem'));
  for(const callback of h.events.DOMContentLoaded||[])callback();
  assert.equal(h.run('uiLanguage'),language);assert.equal(h.elements.get('#language').textContent,language==='uk'?'UA':language.toUpperCase());
  let remaining=30;while(h.frames.length&&remaining-->0)h.frames.shift()();
  assert.equal(h.frames.length,0);
 }
});
test('complete offline app can load every example, switch languages and undo without changing data',()=>{
 const h=harness();for(const callback of h.events.DOMContentLoaded||[])callback();
 for(const id of h.run('PLC_EXAMPLES.map(e=>e.id)')){
  h.run("loadPlcExample('"+id+"')");const before=h.run('JSON.stringify(project)');
  for(const language of ['en','pl','uk']){h.run("setUILanguage('"+language+"')");assert.equal(h.run('JSON.stringify(project)'),before);}
  assert.equal(h.run("compile(project).issues.filter(i=>i.level==='error').length"),0);
 }
 h.run("$('#new').onclick()");assert.equal(h.run('project.nodes.length'),0);h.run("$('#undo').onclick()");assert(h.run('project.nodes.length')>0);
});
test('SVG redraw mutations cannot reschedule localization indefinitely',()=>{
 const h=harness();for(const callback of h.events.DOMContentLoaded||[])callback();h.frames.length=0;
 h.observers[0]([{type:'childList',target:{closest:()=>({})},addedNodes:[]}]);assert.equal(h.frames.length,0);
});
console.log(count+' complete-build startup tests passed.');
