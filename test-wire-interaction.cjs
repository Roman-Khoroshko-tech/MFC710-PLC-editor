const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name);}
test('wire geometry registers no pointer handlers and exposes no drag action',()=>{
 const context=vm.createContext({document:{addEventListener(){throw Error('Unexpected handler');}},window:{addEventListener(){throw Error('Unexpected handler');}},$(){throw Error('Unexpected DOM access');}});
 const source=fs.readFileSync('dist/wire-routing.js','utf8');vm.runInContext(source,context);
 assert(!source.includes('wireDragGesture'));assert(!source.includes('setPointerCapture'));
 assert(!fs.readFileSync('dist/style.css','utf8').includes('.wire{cursor:grab}'));
 assert(fs.readFileSync('dist/app.js','utf8').includes("$('#wires').onclick="));
 assert(fs.readFileSync('dist/wire-menu.js','utf8').includes("addEventListener('contextmenu'"));
});
test('centering fits a large graph and centers a small graph without negative scrolling',()=>{
 const nav=fs.readFileSync('dist/navigation.js','utf8'),context=vm.createContext({});vm.runInContext(nav.slice(nav.indexOf('function centeredDiagramView(')),context);
 for(const bounds of [{left:40,right:2800,top:30,bottom:1800},{left:20,right:250,top:40,bottom:300}]){
  const view=context.centeredDiagramView(bounds,900,600);
  assert(Math.abs(view.marginLeft+(bounds.left+bounds.right)/2*view.scale-view.scrollLeft-450)<1e-8);
  assert(Math.abs(view.marginTop+(bounds.top+bounds.bottom)/2*view.scale-view.scrollTop-300)<1e-8);
  assert(view.marginLeft+bounds.left*view.scale-view.scrollLeft>=24-1e-8);
  assert(view.marginLeft+bounds.right*view.scale-view.scrollLeft<=876+1e-8);
  assert(view.marginTop+bounds.bottom*view.scale-view.scrollTop<=576+1e-8);
 }
});
test('toolbar retains only centering and removes redundant comment button',()=>{
 const html=fs.readFileSync('dist/index.html','utf8');assert(!html.includes('id="add-comment"'));assert(html.includes('aria-label="Центрувати схему"'));assert(html.includes('title="Центрувати схему"'));assert(!html.includes('Центрувати</button>'));assert(/id="home"[^>]*><svg/.test(html));assert(fs.readFileSync('dist/app.js','utf8').includes("key:'comment'"));
});
console.log(count+' wire interaction and centering tests passed.');
