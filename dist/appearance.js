/* Fit only at entry/restoration or explicit example load, never during editing. */
let savedEditorTheme;
try{savedEditorTheme=localStorage.getItem('mfc710-theme')||localStorage.getItem('rk-theme');}catch{}
document.documentElement.dataset.theme=['light','dark'].includes(savedEditorTheme)?savedEditorTheme:(window.matchMedia?.('(prefers-color-scheme: dark)').matches?'dark':'light');
let diagramCenterFrame=0;
function requestDiagramCenter(){
 if(diagramCenterFrame)cancelAnimationFrame(diagramCenterFrame);
 diagramCenterFrame=requestAnimationFrame(()=>{
  diagramCenterFrame=requestAnimationFrame(()=>{
   diagramCenterFrame=0;
   const viewport=$('#viewport');
   if(!viewport.clientWidth||!viewport.clientHeight)return;
   globalThis.refreshPanels?.();
   centerDiagram();
  });
 });
}
if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',requestDiagramCenter,{once:true});else requestDiagramCenter();
window.addEventListener('pageshow',requestDiagramCenter);
window.addEventListener('load',requestDiagramCenter,{once:true});
if(document.fonts?.ready)document.fonts.ready.then(requestDiagramCenter);

const themeToggle=$('#theme-toggle');
function updateEditorThemeLabel(){
 const dark=document.documentElement.dataset.theme==='dark';
 const labels={uk:['Увімкнути темну тему','Увімкнути світлу тему'],en:['Switch to dark theme','Switch to light theme'],pl:['Włącz ciemny motyw','Włącz jasny motyw']};
 const label=(labels[document.documentElement.lang]||labels.uk)[dark?1:0];
 themeToggle.setAttribute('aria-pressed',String(dark));
 themeToggle.setAttribute('aria-label',label);themeToggle.title=label;
}
themeToggle.addEventListener('click',()=>{
 const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';
 document.documentElement.dataset.theme=theme;
 try{localStorage.setItem('mfc710-theme',theme);}catch{}
 updateEditorThemeLabel();
});
updateEditorThemeLabel();
new MutationObserver(updateEditorThemeLabel).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
