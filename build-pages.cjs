const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=__dirname;
const build=spawnSync(process.execPath,['build-offline.cjs'],{cwd:root,encoding:'utf8'});
if(build.status!==0){process.stderr.write(build.stderr||build.stdout);process.exit(1);}
process.stdout.write(build.stdout);
fs.mkdirSync(path.join(root,'docs'),{recursive:true});
fs.copyFileSync(path.join(root,'MFC710_PLC_Studio.html'),path.join(root,'docs/index.html'));
fs.writeFileSync(path.join(root,'docs/.nojekyll'),'');
console.log('GitHub Pages ready: docs/index.html');
