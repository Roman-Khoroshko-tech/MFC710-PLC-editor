const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
vm.runInThisContext(['catalog.js','references.js','engine.js','editing.js'].map(file=>fs.readFileSync('dist/'+file,'utf8')).join('\n'));
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name);}
const comment=()=>({id:'comment1',kind:'comment',x:120,y:180,values:{},label:'Algorithm',note:'Mode A\nStart when level < 5 m'});
test('multiline comments roundtrip in JSON with coordinates and title',()=>{
 const p=blank();p.nodes.push(comment());assert.deepEqual(parseProject(JSON.stringify(p)),p);
 p.nodes[0].note={bad:true};assert.throws(()=>parseProject(JSON.stringify(p)));
});
test('comments have no ports, consume no PLC slots and change no exported parameters',()=>{
 const p=blank();p.nodes=[{id:'b1',kind:'block',slot:1,code:0,x:20,y:20,values:{A:134}}];
 const before=compile(p);p.nodes.push(comment());syncSlots(p);
 assert.deepEqual(fields(p.nodes[1]),[]);assert.deepEqual(outputs(p.nodes[1]),[]);
 assert.equal(p.cycle,1);assert.deepEqual(compile(p),before);
 assert.equal(connectProjectInput(p,'comment1','input',134,'b1'),false);
 removeProjectNode(p,'comment1');assert.equal(p.nodes.length,1);assert.equal(p.nodes[0].values.A,134);
});
test('comment text is escaped and uses the existing growing editable caption',()=>{
 const app=fs.readFileSync('dist/app.js','utf8');
 const context=vm.createContext({selected:null,label:()=>'<script>title</script>',esc:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')});
 vm.runInContext(app.slice(app.indexOf('function commentMarkup('),app.indexOf('function render(){')),context);
 const markup=context.commentMarkup({...comment(),note:'</textarea><script>alert(1)</script>\nLine 2'});
 assert(!markup.includes('<script>'));assert(markup.includes('&lt;/textarea&gt;'));assert(markup.includes('data-caption="comment1"'));assert(!markup.includes('data-in='));assert(!markup.includes('data-out='));
});
console.log(count+' comment tests passed.');
