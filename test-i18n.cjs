const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
vm.runInThisContext(['catalog.js','references.js','engine.js','editing.js','example-layout.js','examples.js','i18n-manual-data.js','i18n-core.js'].map(f=>fs.readFileSync('dist/'+f,'utf8')).join('\n'));
let count=0;function test(name,run){run();count++;console.log('PASS '+name);}
const cyrillic=/[А-Яа-яІіЇїЄєҐґ]/;
test('all 49 function names, descriptions and formulas have both translations',()=>{
 for(const locale of ['en','pl']){assert.equal(FUNCTION_NAMES[locale].length,FUNCTIONS.length);for(const f of FUNCTIONS)for(const key of ['name','description','formula'])assert(!cyrillic.test(translatedText(f[key],locale)),locale+' '+f.code+' '+key);}
});
test('all characteristic points have complete translations using supplied terminology',()=>{
 for(const locale of ['en','pl'])for(const [id,name]of Object.entries(PCH))assert(!cyrillic.test(translatedText(name,locale)),locale+' PCH '+id);
 assert.equal(translatedText(PCH[134],'en'),'Input A0');assert.equal(translatedText(PCH[134],'pl'),'Wejście A0');
 assert.equal(translatedText(PCH[320],'en'),'CONST. 1');assert.equal(translatedText(PCH[320],'pl'),'STAŁA 1');
 assert.equal(translatedText(fn(40).name,'pl'),'Sekwenser');assert.equal(translatedText(fn(43).name,'en'),'Curve shaping unit');
});
test('example menus, descriptions, warnings and I/O mappings are localized',()=>{
 for(const locale of ['en','pl'])for(const example of PLC_EXAMPLES){const d=example.build();for(const text of [example.title,d.description,...d.notes,...d.inputs.map(i=>i.name),...d.outputs.map(i=>i.name)])assert(!cyrillic.test(translatedText(text,locale)),locale+' '+example.id+' '+text);}
});
test('language-specific citations point to existing pages in the correct edition',()=>{
 for(const locale of ['en','pl'])for(const pages of Object.values(MANUAL_LOCALES[locale].pages))for(const page of pages)assert(fs.statSync('dist/references/'+locale+'/page-'+String(page).padStart(3,'0')+'.txt').size>100);
 assert.equal(translatedText('Інструкція 7.4 · с. 78','en'),'Manual 8.1 · p. 73');
 assert.equal(translatedText('Інструкція 7.4 · стор. 81','pl'),'Instrukcja 8.1 · str. 71');
 assert.equal(translatedText('с.64,108','en'),'p.61,94,95');
});
test('translation never changes the project, parameter numbers or parameter values',()=>{
 const p=PLC_EXAMPLES.find(e=>e.id==='motopot').build().project;const before=JSON.stringify(p),rows=compile(p).rows;
 for(const locale of ['en','pl','uk']){uiLanguage=locale;const localized=localizedParameterRows(rows);assert.deepEqual(localized.map(r=>[r.param,r.value]),rows.map(r=>[r.param,r.value]));for(const row of rows)translatedText(row.description);assert.equal(JSON.stringify(p),before);assert.equal(parseProject(JSON.stringify(p)).title,p.title);}
 uiLanguage='uk';
});
test('CSV headings and descriptions follow language while custom labels remain unchanged',()=>{
 const rows=[{phase:'2 · Конфігурація',param:'6.2',value:134,description:'Зберегти · Вхід A',source:'с.78;64'}];
 for(const locale of ['en','pl']){uiLanguage=locale;const localized=localizedParameterRows(rows,locale,['Зберегти']);assert(localized[0].description.startsWith('Зберегти · '));assert(!localized[0].description.includes('Вхід'));const csv=toCSV(localized);assert(csv.includes(locale==='en'?'"Parameter"':'"Parametr"'));assert(csv.includes('"6.2";"134"'));}
 uiLanguage='uk';
});
const source=fs.readFileSync('dist/i18n.js','utf8');
test('text and attribute caches support UA → EN → PL → UA without accumulating translations',()=>{
 const context=vm.createContext({WeakMap,locale:'uk',translatedText:value=>translatedText(value,context.locale)});
 vm.runInContext(source.slice(0,source.indexOf('let localizationFrame=')),context);
 const node={nodeValue:'Зберегти',parentElement:{closest:()=>null}},attributes={title:'Зберегти'},element={tagName:'BUTTON',closest:()=>null,hasAttribute:key=>Object.hasOwn(attributes,key),getAttribute:key=>attributes[key],setAttribute:(key,value)=>attributes[key]=value};
 for(const [locale,expected]of [['uk','Зберегти'],['en','Save'],['pl','Zapisz'],['uk','Зберегти']]){context.locale=locale;context.localizeTextNode(node);context.localizeElementAttributes(element);assert.equal(node.nodeValue,expected);assert.equal(attributes.title,expected);}
 context.locale='en';node.nodeValue='Видалити';context.localizeTextNode(node);assert.equal(node.nodeValue,'Delete');
 const ownText={nodeValue:'Зберегти',parentElement:{closest:()=>({})}};context.localizeTextNode(ownText);assert.equal(ownText.nodeValue,'Зберегти');
});
test('language switch persists the preference without touching project or undo history',()=>{
 const saved={},buttons=['uk','en','pl'].map(language=>({dataset:{language},attributes:{},setAttribute(key,value){this.attributes[key]=value;}}));
 const elements={'#language':{setAttribute(){},textContent:'UA'},'#language-menu':{hidden:false}};
 const p={title:'Мій проєкт',nodes:[{label:'Сума',note:'Не перекладати'}]},history=['before'];
 const context=vm.createContext({uiLanguage:'uk',project:p,history,activeManualTopic:null,$:key=>elements[key],localStorage:{setItem:(key,value)=>saved[key]=value},document:{documentElement:{lang:'uk'},querySelectorAll:()=>buttons},localizeUI(){},refreshLocalizedGeometry(){}});
 vm.runInContext(source.slice(source.indexOf('function setUILanguage('),source.indexOf('const languageButton=')),context);
 for(const [locale,code]of [['en','EN'],['pl','PL'],['uk','UA']]){assert(context.setUILanguage(locale));assert.equal(elements['#language'].textContent,code);assert.equal(context.document.documentElement.lang,locale);assert.equal(saved['mfc710-language'],locale);assert.equal(buttons.filter(b=>b.attributes['aria-checked']==='true').length,1);}
 assert(!context.setUILanguage('de'));assert.deepEqual(p,{title:'Мій проєкт',nodes:[{label:'Сума',note:'Не перекладати'}]});assert.deepEqual(history,['before']);
});
test('language selector follows help and keeps filtering identifiers independent of translated labels',()=>{
 const html=fs.readFileSync('dist/index.html','utf8'),css=fs.readFileSync('dist/style.css','utf8'),app=fs.readFileSync('dist/app.js','utf8');
 assert(html.indexOf('id="help"')<html.indexOf('id="language"'));assert(html.includes('<option value="Арифметика">Арифметика</option>'));assert(css.includes('.project-tools .language-control{order:3;'));assert(app.includes("translatedText(i.title+' '+i.sub"));
 assert(source.includes("if(record.target.closest?.('#wires'))continue;"),'SVG redraws must not create an observer/render loop');
});
test('offline build contains both original-language manual page collections',()=>{
 const html=fs.readFileSync('MFC710_PLC_Studio.html','utf8');assert(html.includes('globalThis.MANUAL_PAGES_I18N='));assert(html.includes('Curve shaping unit'));assert(html.includes('Blok kształtowania krzywej'));assert(!html.includes('src="i18n.js"'));
});
console.log(count+' localization tests passed.');
