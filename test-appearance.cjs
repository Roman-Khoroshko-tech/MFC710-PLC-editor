const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function harness({blocked=false}={}){
 const events={},frames=new Map(),attributes={},saved={};let serial=0,centered=0,refreshed=0;
 const root={lang:'uk',dataset:{theme:'light'}},viewport={clientWidth:900,clientHeight:600};
 const button={setAttribute(k,v){attributes[k]=v;},addEventListener(k,fn){events['theme:'+k]=fn;}};
 const context=vm.createContext({document:{readyState:'loading',documentElement:root},window:{addEventListener(k,fn){events[k]=fn;}},$:s=>s==='#viewport'?viewport:button,requestAnimationFrame(fn){frames.set(++serial,fn);return serial;},cancelAnimationFrame(id){frames.delete(id);},centerDiagram(){centered++;},refreshPanels(){refreshed++;},localStorage:{setItem(k,v){if(blocked)throw Error('blocked');saved[k]=v;}},MutationObserver:class{constructor(fn){events.language=fn;}observe(){}}});
 vm.runInContext(fs.readFileSync('dist/appearance.js','utf8'),context);
 function frame(){const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn());}
 return{events,root,viewport,attributes,saved,frame,get centered(){return centered;},get refreshed(){return refreshed;}};
}
function test(name,fn){fn();console.log('PASS '+name);}
test('startup fit waits for two frames and coalesces load/pageshow events',()=>{const h=harness();h.events.DOMContentLoaded();h.events.pageshow();h.events.load();assert.equal(h.centered,0);h.frame();assert.equal(h.centered,0);h.frame();assert.equal(h.centered,1);assert.equal(h.refreshed,1);h.events.pageshow();h.frame();h.frame();assert.equal(h.centered,2);});
test('zero-size viewport is not fitted',()=>{const h=harness();h.viewport.clientWidth=0;h.events.pageshow();h.frame();h.frame();assert.equal(h.centered,0);});
test('theme toggle persists independently of the project without changing geometry',()=>{const h=harness();h.events['theme:click']();assert.equal(h.root.dataset.theme,'dark');assert.equal(h.saved['mfc710-theme'],'dark');assert.equal(h.attributes['aria-pressed'],'true');assert.equal(h.centered,0);h.events['theme:click']();assert.equal(h.root.dataset.theme,'light');});
test('blocked storage and language changes keep theme control usable',()=>{const h=harness({blocked:true});h.events['theme:click']();h.root.lang='en';h.events.language();assert.equal(h.attributes['aria-label'],'Switch to light theme');h.root.lang='pl';h.events.language();assert.equal(h.attributes['aria-label'],'Włącz jasny motyw');});
