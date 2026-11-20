/* UI localization is a view layer. It never rewrites project data or JSON. */
const textTranslations=new WeakMap(),attributeTranslations=new WeakMap();
const protectedTranslationSelector='script,style,textarea,input,[data-user-text],.docpage';
function localizeElementAttributes(element){
 if(element.closest('[data-user-text],.docpage')||element.tagName==='SCRIPT'||element.tagName==='STYLE')return;
 const saved=attributeTranslations.get(element)||{};
 for(const name of ['title','aria-label','placeholder']){
  if(!element.hasAttribute(name))continue;
  const current=element.getAttribute(name),old=saved[name];const source=old&&current===old.rendered?old.source:current;
  const rendered=translatedText(source);saved[name]={source,rendered};if(current!==rendered)element.setAttribute(name,rendered);
 }
 attributeTranslations.set(element,saved);
}
function localizeTextNode(node){
 if(node.parentElement?.closest(protectedTranslationSelector))return;
 const current=node.nodeValue,old=textTranslations.get(node);const source=old&&current===old.rendered?old.source:current;
 const rendered=translatedText(source);textTranslations.set(node,{source,rendered});if(current!==rendered)node.nodeValue=rendered;
}
function localizeUI(root=document.body){
 if(root.nodeType===3){localizeTextNode(root);return;}
 if(root.nodeType!==1)return;
 if(root.matches('script,style,textarea,[data-user-text],.docpage'))return;
 localizeElementAttributes(root);
 root.querySelectorAll('[title],[aria-label],[placeholder]').forEach(localizeElementAttributes);
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;while((node=walker.nextNode()))localizeTextNode(node);
}
let localizationFrame=0;
function refreshLocalizedGeometry(){
 if(localizationFrame)return;
 localizationFrame=requestAnimationFrame(()=>{localizationFrame=0;drawWires();globalThis.refreshPanels?.();});
}
function setUILanguage(locale,{persist=true}={}){
 if(!['uk','en','pl'].includes(locale))return false;
 uiLanguage=locale;document.documentElement.lang=locale;
 const button=$('#language');button.textContent=locale==='uk'?'UA':locale.toUpperCase();
 button.setAttribute('aria-expanded','false');$('#language-menu').hidden=true;
 document.querySelectorAll('[data-language]').forEach(option=>option.setAttribute('aria-checked',String(option.dataset.language===locale)));
 if(persist)try{localStorage.setItem('mfc710-language',locale);}catch{}
 localizeUI();refreshLocalizedGeometry();
 if(activeManualTopic!==null&&$('#dialog').open&&$('#dialogbody .docpage'))showPage(activeManualTopic);
 return true;
}
const languageButton=$('#language'),languageMenu=$('#language-menu');
languageButton.onclick=()=>{
 languageMenu.hidden=!languageMenu.hidden;languageButton.setAttribute('aria-expanded',String(!languageMenu.hidden));
 if(!languageMenu.hidden)languageMenu.querySelector('[data-language="'+uiLanguage+'"]')?.focus();
};
languageMenu.onclick=event=>{const option=event.target.closest('[data-language]');if(option){setUILanguage(option.dataset.language);languageButton.focus();}};
document.addEventListener('pointerdown',event=>{if(!event.target.closest('.language-control')){languageMenu.hidden=true;languageButton.setAttribute('aria-expanded','false');}},true);
document.addEventListener('keydown',event=>{
 if(languageMenu.hidden)return;
 if(event.key==='Escape'){languageMenu.hidden=true;languageButton.setAttribute('aria-expanded','false');languageButton.focus();return;}
 if(!languageMenu.contains(event.target)||!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
 event.preventDefault();const options=[...languageMenu.querySelectorAll('[data-language]')],index=options.indexOf(event.target);
 options[event.key==='Home'?0:event.key==='End'?options.length-1:(index+(event.key==='ArrowDown'?1:-1)+options.length)%options.length].focus();
},true);
const originalHelp=$('#help').onclick;
$('#help').onclick=()=>{
 activeManualTopic=null;if(uiLanguage==='uk'){originalHelp();return;}
 const en=uiLanguage==='en';
 const paragraphs=en?[
  'Choose functional blocks, Constant values or Characteristic Points (PCH) in the library. Drag a port from an output to an input, or from an input to an output. Numeric parameters do not accept wires.',
  'Drag on blank canvas to select a group. Delete removes the selection. Ctrl+Z undoes an action; Ctrl+Shift+Z redoes it. Ctrl+mouse wheel zooms; hold the middle mouse button to pan. The fit button centers the whole diagram.',
  'Right-click a wire to delete it, add a waypoint or split it into a reference pair. A reference can be used once. Right-click a reference to select a free sender or rejoin the wire. Hovering highlights its other end.',
  'Add text comments from the library and resize them by dragging an edge. Enter block captions directly below the ports. Project names, custom labels and comments are kept in their original language.',
  'Save downloads a JSON project; Load opens a JSON file. Autosave is local to this browser. Undo history lasts for the current page session.',
  'Parameter table generates only the used blocks and constants. Slots are compacted to 1…N and PCH links remapped. 5.145 is the block count; T = 5.145 × 0.2 ms. PLC is enabled with 5.144 only when functional blocks exist.',
  'Before changing drive assignments, enter the AL2 access code in 4.2 (factory code 1, unless changed), then enable Full PCH with 4.6 = 1. Verify the diagram and enter configuration with the drive stopped.',
  'Terminology and reference pages: supplied English OP-11 manual, edition 8.1. Ukrainian base: edition 7.4. Language selection changes the interface, not parameter values or hardware compatibility. Functions above 39 require separate support verification because Appendices B and C differ.'
 ]:[
  'Wybierz bloki funkcyjne, Stałe lub Punkty Charakterystyczne (PCH) z katalogu. Przeciągnij port od wyjścia do wejścia lub od wejścia do wyjścia. Parametry liczbowe nie przyjmują połączeń.',
  'Przeciągnij po pustym obszarze, aby zaznaczyć grupę. Delete usuwa zaznaczenie. Ctrl+Z cofa działanie, Ctrl+Shift+Z ponawia. Ctrl+kółko myszy zmienia powiększenie; przytrzymane kółko przesuwa obszar roboczy. Przycisk dopasowania centruje cały schemat.',
  'Kliknij linię prawym przyciskiem, aby ją usunąć, dodać punkt prowadzenia lub zamienić na parę odsyłaczy. Odsyłacz można połączyć tylko raz. Prawy przycisk na odsyłaczu pozwala wybrać wolny nadajnik lub ponownie połączyć linię. Najechanie podświetla drugi koniec.',
  'Dodawaj komentarze tekstowe z katalogu i zmieniaj ich rozmiar przez przeciąganie krawędzi. Podpisy bloków wpisuj poniżej portów. Nazwy projektów, własne etykiety i komentarze pozostają w oryginalnym języku.',
  'Zapisz pobiera projekt JSON; Wczytaj otwiera plik JSON. Autozapis działa lokalnie w tej przeglądarce. Historia cofania dotyczy bieżącej sesji strony.',
  'Tabela parametrów zawiera tylko użyte bloki i stałe. Numeracja jest porządkowana do 1…N, a połączenia PCH aktualizowane. 5.145 określa liczbę bloków; T = 5.145 × 0,2 ms. PLC jest włączany przez 5.144 tylko wtedy, gdy są bloki funkcyjne.',
  'Przed zmianą przypisań przemiennika wpisz kod dostępu AL2 w 4.2 (fabryczny 1, jeśli nie zmieniono), potem włącz Pełne PCH przez 4.6 = 1. Sprawdź schemat i wprowadzaj konfigurację przy zatrzymanym przemienniku.',
  'Terminologia i strony odniesienia: dostarczona polska instrukcja OP-11, edycja 8.1. Ukraińska podstawa: edycja 7.4. Wybór języka zmienia interfejs, nie wartości parametrów ani zgodność sprzętową. Funkcje powyżej 39 wymagają sprawdzenia obsługi z powodu rozbieżności załączników B i C.'
 ];
 modal(en?'Help and sources':'Pomoc i źródła',paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')+'<h3>'+(en?'Manual excerpts':'Fragmenty instrukcji')+'</h3><p>'+Object.keys(MANUAL_LOCALES[uiLanguage].pages).map(page=>'<button data-page="'+page+'">'+esc(manualCitation(Number(page)))+'</button>').join(' ')+'</p>');
};
let activeManualTopic=null;
const originalShowPage=showPage;
showPage=async function(topic){
 activeManualTopic=topic;
 if(uiLanguage==='uk'){await originalShowPage(topic);return;}
 const locale=uiLanguage,spec=MANUAL_LOCALES[locale],pages=spec.pages[topic];if(!pages)return;
 try{
  const texts=await Promise.all(pages.map(async page=>{
   let text=globalThis.MANUAL_PAGES_I18N?.[locale]?.[page];
   if(!text){const response=await fetch('references/'+locale+'/page-'+String(page).padStart(3,'0')+'.txt');if(!response.ok)throw Error();text=await response.text();}
   return '<h3>'+(locale==='en'?'Page ':'Strona ')+page+'</h3><div class="docpage">'+esc(text)+'</div>';
  }));
  if(uiLanguage!==locale||activeManualTopic!==topic)return;
  if($('#dialog').open)$('#dialog').close();
  modal('MFC710 · '+manualCitation(topic),'<p>'+(locale==='en'?'Original manual text. Figures are not included in this excerpt.':'Oryginalny tekst instrukcji. Ten fragment nie zawiera rysunków.')+'</p>'+texts.join(''));
 }catch{toast(locale==='en'?'The manual page could not be loaded.':'Nie udało się wczytać strony instrukcji.');}
};
new MutationObserver(records=>{
 const roots=new Set();for(const record of records){if(record.target.closest?.('#wires'))continue;if(record.type==='childList')for(const node of record.addedNodes)roots.add(node);else roots.add(record.target);}
 if(roots.size){roots.forEach(localizeUI);refreshLocalizedGeometry();}
}).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','placeholder']});
window.addEventListener('DOMContentLoaded',()=>{
 let saved='uk';try{saved=localStorage.getItem('mfc710-language')||'uk';}catch{}
 setUILanguage(['uk','en','pl'].includes(saved)?saved:'uk',{persist:false});
},{once:true});
