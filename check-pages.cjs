const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=__dirname;
assert(fs.readFileSync(path.join(root,'docs/index.html')).equals(fs.readFileSync(path.join(root,'MFC710_PLC_Studio.html'))),'docs/index.html is outdated. Run npm run build and commit both generated HTML files.');
assert(fs.existsSync(path.join(root,'docs/.nojekyll')),'.nojekyll is missing');
const html=fs.readFileSync(path.join(root,'docs/index.html'),'utf8');
assert(!/<script[^>]+src=/.test(html),'Published file must not require separate scripts');
assert(!/C:\\Users|ASUS Vivobook|libfile_|appgprj_/.test(html),'Local metadata leaked into published HTML');
console.log('Published HTML matches the tested offline build.');
