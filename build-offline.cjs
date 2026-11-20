const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'dist'),pages={},localizedPages={};
function readPages(folder){const result={};for(const name of fs.readdirSync(folder).filter(name=>/^page-\d+\.txt$/.test(name)))result[Number(name.match(/\d+/)[0])]=fs.readFileSync(path.join(folder,name),'utf8');return result;}
Object.assign(pages,readPages(path.join(root,'references')));
for(const locale of ['en','pl'])localizedPages[locale]=readPages(path.join(root,'references',locale));
let html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace('<link rel="stylesheet" href="style.css">','<style>'+fs.readFileSync(path.join(root,'style.css'),'utf8')+'</style>');
const scripts=[...html.matchAll(/<script src="([\w.-]+\.js)"><\/script>/g)];
const js=scripts.map(([,name])=>fs.readFileSync(path.join(root,name),'utf8')).join('\n');
html=html.replace(scripts.map(([tag])=>tag).join(''),()=>'<script>globalThis.MANUAL_PAGES='+JSON.stringify(pages).replace(/</g,'\\u003c')+';\nglobalThis.MANUAL_PAGES_I18N='+JSON.stringify(localizedPages).replace(/</g,'\\u003c')+';\n'+js.replace(/<\/script/gi,'<\\/script')+'</script>');
fs.writeFileSync(path.join(__dirname,'MFC710_PLC_Studio.html'),html);console.log('Offline file built: '+Buffer.byteLength(html)+' bytes');
