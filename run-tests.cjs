const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process'),crypto=require('node:crypto');
const root=__dirname,includeBrowser=process.argv.includes('--browser'),results=[];
process.chdir(root);
const build=spawnSync(process.execPath,['build-offline.cjs'],{cwd:root,encoding:'utf8'});
if(build.status!==0){process.stderr.write(build.stderr||build.stdout||'Build failed');process.exit(1);}
console.log(build.stdout.trim());
const files=fs.readdirSync(root).filter(name=>/^test(?:-[\w-]+)?\.cjs$/.test(name)&&(includeBrowser||name!=='test-browser.cjs')).sort();
for(const file of files){
 const run=spawnSync(process.execPath,[file],{cwd:root,encoding:'utf8',timeout:includeBrowser&&file==='test-browser.cjs'?180000:60000,maxBuffer:4*1024*1024});
 const output=(run.stdout||'')+(run.stderr||'');
 const result={file,pass:run.status===0,checks:(run.stdout?.match(/^PASS /gm)||[]).length};results.push(result);
 console.log(`${result.pass?'PASS':'FAIL'} ${file}: ${result.checks} checks`);
 if(!result.pass)process.stderr.write(output+(run.error?.message||''));
}
const checks=results.reduce((sum,result)=>sum+result.checks,0),failed=results.filter(result=>!result.pass);
console.log(`${checks} checks; ${results.length-failed.length}/${results.length} suites passed. Browser: ${includeBrowser?'included':'NOT RUN'}.`);
if(process.argv.includes('--report')){
 const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'MFC710_PLC_Studio.html'))).digest('hex');
 const report=`# Перевірка MFC710 PLC Studio перед публікацією\n\nДата запуску: ${new Date().toISOString()}.\n\nРезультат: ${checks} автоматизованих перевірок; успішних наборів ${results.length-failed.length} із ${results.length}.\n\n| Набір | Перевірок | Результат |\n| --- | ---: | --- |\n${results.map(r=>`| ${r.file} | ${r.checks} | ${r.pass?'Пройдено':'Помилка'} |`).join('\n')}\n\n## Виправлено під час перевірки\n\n- Власний вихід блока знову можна підключити на його вхід, безпосередньо та через посилання. Попередження про попередній цикл залишається. Цикли лише з посилань блокують експорт.\n- Завантаження відхиляє пошкоджені типи полів, дублікати ідентифікаторів і некоректну геометрію зв’язків до заміни поточного проєкту.\n- Зміна PCH у властивостях прибирає точки маршруту попереднього зв’язку.\n- Скасування перетягування окремого блока відновлює положення й історію повторення; права кнопка не починає перетягування.\n- Сторонній текст, перетягнутий у поле, не створює невідомих функцій або PCH.\n- Експорт схеми без функціональних блоків залишає 5.144 = 0, щоб не запускати попередню конфігурацію ПЧ.\n\n## Обсяг підтвердження\n\nПеревірено модель даних, підготовку параметрів усіх 49 функцій, схему на 48 слотів, імпорт/експорт JSON, перетворення зв’язків, історію змін та обробники взаємодії в тестових середовищах. Усі 10 прикладів проходять перевірки; геометрія дев’яти відредагованих користувачем прикладів збережена. Технічну основу експорту зіставлено з доданими витягами інструкції MFC710 редакції 7.4: стор. 61, 64–66, 78–81, 108–109.\n\n## Ще потрібно перед публічним випуском\n\n${includeBrowser?(results.find(r=>r.file==='test-browser.cjs')?.pass?'Браузерний набір пройдено. Візуальне приймання користувачем залишається окремим етапом.':'Браузерний набір не пройдено; дивіться журнал запуску.'):'Браузерні перевірки не виконано: у поточному середовищі немає доступного підключення для перевірки сторінки в браузері. Автоматизовані тести обробників не підтверджують фактичне відображення CSS та поведінку браузера.'}\n\n- Перевірити редактор у цільових Chrome, Edge та Firefox: відкриття HTML без сервера, компонування шапок, масштаб, панорамування, меню, рамку виділення, Ctrl+Z, завантаження та збереження файлів, друк/PDF.\n- Перевірити переповнення та компонування на 1920×1080, 1366×768 і 1280×720; особливо при прихованій лівій панелі.\n- Провести інженерне приймання сформованих параметрів на цільовому MFC710. Тести програмної моделі не є перевіркою прошивки ПЧ. Функції понад 39 потребують окремого підтвердження підтримки через суперечність додатків B і C.\n\nПублікацію та зміну доступу не виконували.\n\nSHA-256 перевіреного HTML: \`${hash}\`.\n`;
 fs.writeFileSync(path.join(root,'QA_REPORT.md'),report);
}
process.exitCode=failed.length?1:0;
