// Optional real-browser acceptance checks; requires Playwright and a browser.
// Run: node run-tests.cjs --browser. MFC_BROWSER=chrome/msedge/firefox.
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http');
async function main(){
 let automation;
 try{automation=require('playwright');}catch{throw Error('Browser checks NOT RUN: Playwright is unavailable. Install the test dependency and a supported browser, then run node run-tests.cjs --browser.');}
 const html=fs.readFileSync('MFC710_PLC_Studio.html');
 const server=http.createServer((_req,res)=>{res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(html);});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
 try{
  const family=process.env.MFC_BROWSER||'chrome';
  browser=await(family==='firefox'?automation.firefox.launch():automation.chromium.launch({channel:family,chromiumSandbox:true}));
  const page=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port);
  let passed=0,failed=0;
  async function test(name,run){try{await run();passed++;console.log('PASS '+name);}catch(e){failed++;console.error('FAIL '+name+' '+e.stack);}}
  async function fixture(){await page.evaluate(()=>{
   clearConnectionGesture();clearSelectionGroup();project=blank();history=[];future=[];selected=null;selectedWire=null;pending=null;
   project.nodes=[{id:'b1',kind:'block',slot:1,code:0,x:180,y:200,values:{A:134}},{id:'b2',kind:'block',slot:2,code:0,x:650,y:200,values:{A:0}}];commit();centerDiagram();
  });}
  async function port(selector){const r=await page.locator(selector).boundingBox();assert(r,selector);return{x:r.x+r.width/2,y:r.y+r.height/2};}
  async function drag(a,b){await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x,b.y,{steps:12});await page.mouse.up();}
  async function linePoint(){return page.locator('#wires .wire').first().evaluate(el=>{const p=el.getPointAtLength(el.getTotalLength()/2),m=el.getScreenCTM();return{x:m.a*p.x+m.c*p.y+m.e,y:m.b*p.x+m.d*p.y+m.f};});}
  await test('offline page and ten examples render and compile',async()=>{
   assert.equal(await page.title(),'MFC710 · PLC Studio');const ids=await page.evaluate(()=>PLC_EXAMPLES.map(e=>e.id));assert.equal(ids.length,10);
   for(const id of ids){await page.evaluate(id=>loadPlcExample(id),id);assert.equal(await page.evaluate(()=>compile(project).issues.filter(i=>i.level==='error').length),0);assert(await page.locator('#nodes .node').count()>0);}
   await page.locator('#demo').click();assert.equal(await page.locator('.examples-menu button').count(),10);await page.keyboard.press('Escape');
  });
  await test('ports connect in both drag directions',async()=>{
   await fixture();const out=await port('[data-out="b1"]'),input=await port('[data-in="b2"]');
   await drag(out,input);assert.equal(await page.evaluate(()=>project.nodes[1].values.A),256);
   await page.locator('#undo').click();assert.equal(await page.evaluate(()=>project.nodes[1].values.A),0);
   await drag(input,out);assert.equal(await page.evaluate(()=>project.nodes[1].links.A.id),'b1');
  });
  await test('right-click splits and rejoins references',async()=>{
   await fixture();await page.evaluate(()=>connect('b2','A',256,'b1'));const p=await linePoint();await page.mouse.click(p.x,p.y,{button:'right'});
   await page.locator('.wire-menu:not([hidden]) button').filter({hasText:'Розбити на посилання'}).click();assert.equal(await page.locator('.reference').count(),2);
   await page.locator('.reference').first().click({button:'right'});await page.locator('.reference-context:not([hidden]) button').filter({hasText:'З’єднати назад'}).click();
   assert.equal(await page.locator('.reference').count(),0);assert.equal(await page.locator('#wires .wire').count(),1);
  });
  await test('waypoints move and double-click preserves wires',async()=>{
   await fixture();await page.evaluate(()=>connect('b2','A',256,'b1'));const p=await linePoint();await page.mouse.dblclick(p.x,p.y);assert.equal(await page.locator('#wires .wire').count(),1);
   await page.mouse.click(p.x,p.y,{button:'right'});await page.locator('.wire-menu:not([hidden]) button').filter({hasText:'Додати точку переміщення'}).click();assert.equal(await page.locator('.wire-waypoint').count(),1);
   await page.mouse.move(p.x,p.y);const handle=await port('.wire-waypoint');const before=await page.evaluate(()=>project.nodes[1].wireRoutes.A[0].y);await drag(handle,{x:handle.x,y:handle.y+90});assert(await page.evaluate(()=>project.nodes[1].wireRoutes.A[0].y)>before);
  });
  await test('marquee Delete and Ctrl+Z restore the graph',async()=>{
   await fixture();await page.evaluate(()=>connect('b2','A',256,'b1'));const before=await page.evaluate(()=>JSON.stringify(project));
   const r=await page.locator('#nodes .node').evaluateAll(nodes=>{const a=nodes.map(n=>n.getBoundingClientRect());return{left:Math.min(...a.map(n=>n.left)),right:Math.max(...a.map(n=>n.right)),top:Math.min(...a.map(n=>n.top)),bottom:Math.max(...a.map(n=>n.bottom))};});
   await drag({x:r.left-15,y:r.top-15},{x:r.right+15,y:r.bottom+15});await page.keyboard.press('Delete');assert.equal(await page.locator('#nodes .node').count(),0);await page.keyboard.press('Control+z');assert.equal(await page.evaluate(()=>JSON.stringify(project)),before);
  });
  await test('hidden Blocks preserves workspace and toolbar icons are equal',async()=>{
   await fixture();const button=page.locator('.panel-controls button').filter({hasText:/^Блоки$/});await button.click();assert.equal(await page.locator('.library').isVisible(),false);assert(await page.locator('.workspace').isVisible());assert((await page.locator('#viewport').boundingBox()).width>500);await button.click();
   for(const width of [1920,1366,1280]){await page.setViewportSize({width,height:768});const sizes=await page.locator('.project-tools .icon-button').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return[r.width,r.height];}));assert(sizes.length>=6);for(const [w,h]of sizes){assert.equal(w,36);assert.equal(h,36);}}
   await page.setViewportSize({width:1500,height:1000});
  });
  await test('JSON download, reimport, autosave and rejected import preserve data',async()=>{
   await fixture();await page.evaluate(()=>connect('b2','A',256,'b1'));const before=await page.evaluate(()=>JSON.stringify(project));
   const downloaded=page.waitForEvent('download');await page.locator('#save').click();const stream=await(await downloaded).createReadStream(),chunks=[];for await(const chunk of stream)chunks.push(chunk);assert.deepEqual(JSON.parse(Buffer.concat(chunks).toString()),JSON.parse(before));
   await page.locator('#new').click();await page.locator('#file').setInputFiles({name:'project.json',mimeType:'application/json',buffer:Buffer.from(before)});assert.equal(await page.evaluate(()=>JSON.stringify(project)),before);await page.reload();assert.equal(await page.evaluate(()=>JSON.stringify(project)),before);
   await page.locator('#file').setInputFiles({name:'broken.json',mimeType:'application/json',buffer:Buffer.from('{"schema":"broken"}')});assert.equal(await page.evaluate(()=>JSON.stringify(project)),before);
  });
  await test('parameter table opens and runtime has no uncaught errors',async()=>{
   await fixture();await page.locator('#export').click();assert(await page.locator('#dialog').isVisible());assert((await page.locator('#dialogbody table').innerText()).includes('5.145'));await page.locator('#close').click();assert.deepEqual(errors,[]);
  });
  console.log(passed+' browser checks passed; '+failed+' failed.');if(failed)process.exitCode=1;
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
