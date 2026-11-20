const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const app=fs.readFileSync('dist/app.js','utf8');
function harness(){
 const handlers={},elements={},storage=new Map();
 const context=vm.createContext({console,setTimeout,clearTimeout,
  localStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)},
  clearConnectionGesture(){},render(){},window:{addEventListener(){}},
  document:{querySelector(selector){return elements[selector]??={disabled:false,click(){if(!this.disabled)this.onclick?.();},addEventListener(){},setAttribute(){},close(){},clientWidth:900,clientHeight:600,style:{},getBoundingClientRect:()=>({left:0,top:0})};},querySelectorAll:()=>[],addEventListener(type,fn,capture){(handlers[type]??=[]).push({fn,capture});}},
 });
 for(const file of ['catalog.js','references.js','engine.js','editing.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);
 vm.runInContext(app.slice(0,app.indexOf('function label(')),context);
 vm.runInContext(`function render(){ $('#undo').disabled=!history.length;$('#redo').disabled=!future.length; }`,context);
 vm.runInContext(app.slice(app.indexOf('function deleteSelection(){'),app.indexOf('function resizeCaption(')),context);
 const start=app.indexOf("$('#undo').onclick=");
 vm.runInContext(app.slice(start,app.indexOf("$('#new').onclick=",start)),context);
 const keyStart=app.indexOf("document.addEventListener('keydown',event=>{");
 vm.runInContext(app.slice(keyStart,app.indexOf("$('#viewport').addEventListener('wheel'",keyStart)),context);
 vm.runInContext(fs.readFileSync('dist/selection.js','utf8'),context);
 vm.runInContext(`project=blank();project.nodes=[
 {id:'b1',kind:'block',slot:1,code:0,x:20,y:20,note:'source',values:{A:134}},
 {id:'b2',kind:'block',slot:2,code:0,x:200,y:20,note:'destination',values:{A:256}},
 {id:'send',kind:'referenceSend',x:100,y:20,values:{input:256},links:{input:{id:'b1',pch:256}}},
 {id:'recv',kind:'referenceReceive',x:150,y:20,values:{},referenceId:'send',pch:256}];
 connectProjectInput(project,'b2','A',256,'recv');syncSlots(project);render();`,context);
 function run(code){return vm.runInContext(code,context);}
 function key(changes={}){
  const e={key:'я',code:'KeyZ',ctrlKey:true,target:{closest:()=>null},preventDefault(){this.prevented=true;},...changes};
  for(const handler of [...handlers.keydown].sort((a,b)=>Number(!!b.capture)-Number(!!a.capture)))handler.fn(e);
  return e;
 }
 return {run,key,elements,storage};
}
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name);}
test('Ukrainian Ctrl+Z restores entire deleted graph including wires, references and notes',()=>{
 const h=harness(),before=h.run('JSON.stringify(project)');
 h.run('groupNodes=new Set(project.nodes.map(n=>n.id));deleteSelection();');
 assert.equal(h.run('project.nodes.length'),0);assert.equal(h.run('history.length'),1);
 assert(h.key().prevented);assert.equal(h.run('JSON.stringify(project)'),before);
 assert.equal(h.storage.get('mfc710-project-v1'),before);
 assert.equal(h.run('future.length'),1);
 h.key({shiftKey:true});assert.equal(h.run('project.nodes.length'),0);
 h.key({key:'z'});assert.equal(h.run('JSON.stringify(project)'),before);
});
test('single-node and wire deletion restore with Ukrainian shortcut',()=>{
 const h=harness(),before=h.run('JSON.stringify(project)');
 h.run("selected='b1';deleteSelection();");h.key();assert.equal(h.run('JSON.stringify(project)'),before);
 h.run("selectedWire={id:'b2',key:'A'};deleteSelection();");h.key();assert.equal(h.run('JSON.stringify(project)'),before);
});
test('native text undo is preserved and unrelated Ctrl keys do not undo',()=>{
 const h=harness();h.run('groupNodes=new Set(project.nodes.map(n=>n.id));deleteSelection();');
 assert(!h.key({target:{closest:()=>({})}}).prevented);assert.equal(h.run('project.nodes.length'),0);
 assert(!h.key({key:'c',code:'KeyC'}).prevented);assert.equal(h.run('project.nodes.length'),0);
 h.key();assert.equal(h.run('project.nodes.length'),4);
});
test('new action after undo clears redo and toolbar also restores entire graph',()=>{
 const h=harness(),before=h.run('JSON.stringify(project)');
 h.run('groupNodes=new Set(project.nodes.map(n=>n.id));deleteSelection();');
 h.elements['#undo'].click();assert.equal(h.run('JSON.stringify(project)'),before);
 h.run("selected='b2';deleteSelection();");assert.equal(h.run('future.length'),0);
 h.key({shiftKey:true});assert.equal(h.run('project.nodes.length'),3);
});
test('comment creation and deletion undo restore text and position',()=>{
 const h=harness();
 h.run("crypto={randomUUID:()=> 'comment1'};scale=1;");
 h.run(app.slice(app.indexOf('function add('),app.indexOf('function commentMarkup(')));
 h.run("add('comment',120,180);");assert.equal(h.run('project.nodes.length'),5);
 h.key();assert.equal(h.run('project.nodes.length'),4);
 h.key({shiftKey:true});assert.equal(h.run('project.nodes.length'),5);
 h.run("project.nodes.find(n=>n.kind==='comment').note='Test comment';selected='comment1';deleteSelection();");
 assert.equal(h.run('project.nodes.length'),4);h.key();
 assert.equal(h.run("project.nodes.find(n=>n.kind==='comment').note"),'Test comment');
 assert.equal(h.run("project.nodes.find(n=>n.kind==='comment').x"),120);
});
test('loading a built-in example can restore the entire previous project with Ctrl+Z',()=>{
 const h=harness(),before=h.run('JSON.stringify(project)');
 h.run(fs.readFileSync('dist/example-layout.js','utf8'));h.run(fs.readFileSync('dist/examples.js','utf8'));h.run('function routePlcExample(){} function centerDiagram(){}');
 h.run('function zoom(value){ scale=value; }');
 const ui=fs.readFileSync('dist/examples-ui.js','utf8');
 h.run(ui.slice(ui.indexOf('function loadPlcExample('),ui.indexOf("$('#dialog').addEventListener")));
 h.run("loadPlcExample('reserve');");assert.equal(h.run('project.cycle'),13);
 h.key();assert.equal(h.run('JSON.stringify(project)'),before);
});
test('joining references through their menu is one reversible action',()=>{
 const h=harness(),before=h.run('JSON.stringify(project)');
 const ui=fs.readFileSync('dist/reference-menu.js','utf8');
 h.run(ui.slice(ui.indexOf('function joinReferencesFromMenu('),ui.indexOf('referenceMenu.onclick=')));
 assert(h.run("joinReferencesFromMenu('recv')"));assert.equal(h.run('project.nodes.length'),2);
 h.key();assert.equal(h.run('JSON.stringify(project)'),before);
});
console.log(count+' history integration tests passed.');
