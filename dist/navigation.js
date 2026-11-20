let panGesture = null;

$('#viewport').addEventListener('pointerdown', event => {
 if (event.button !== 1 || !event.isPrimary) return;
 event.preventDefault();
 event.stopImmediatePropagation();
 clearConnectionGesture();
 pending = null;
 const viewport = $('#viewport');
 panGesture = {
  pointerId: event.pointerId,
  x: event.clientX,
  y: event.clientY,
  left: viewport.scrollLeft,
  top: viewport.scrollTop
 };
 viewport.classList.add('panning');
 viewport.setPointerCapture(event.pointerId);
}, true);

window.addEventListener('pointermove', event => {
 if (!panGesture || event.pointerId !== panGesture.pointerId) return;
 const viewport = $('#viewport');
 viewport.scrollLeft = panGesture.left - (event.clientX - panGesture.x);
 viewport.scrollTop = panGesture.top - (event.clientY - panGesture.y);
 event.preventDefault();
});

function stopPanning() {
 if (!panGesture) return;
 const viewport = $('#viewport');
 const pointerId = panGesture.pointerId;
 panGesture = null;
 viewport.classList.remove('panning');
 if (viewport.hasPointerCapture(pointerId)) viewport.releasePointerCapture(pointerId);
}

window.addEventListener('pointerup', event => {
 if (event.pointerId === panGesture?.pointerId) stopPanning();
}, true);
window.addEventListener('pointercancel', event => {
 if (event.pointerId === panGesture?.pointerId) stopPanning();
});
window.addEventListener('blur', stopPanning);
$('#viewport').addEventListener('auxclick', event => {
 if (event.button === 1) event.preventDefault();
});
function centeredDiagramView(bounds,viewportWidth,viewportHeight){
 const width=Math.max(1,bounds.right-bounds.left),height=Math.max(1,bounds.bottom-bounds.top);
 const scale=Math.max(.05,Math.min(1,(viewportWidth-48)/width,(viewportHeight-48)/height));
 const x=(bounds.left+bounds.right)*scale/2,y=(bounds.top+bounds.bottom)*scale/2;
 return {scale,marginLeft:Math.max(0,viewportWidth/2-x),marginTop:Math.max(0,viewportHeight/2-y),scrollLeft:Math.max(0,x-viewportWidth/2),scrollTop:Math.max(0,y-viewportHeight/2)};
}
function centerDiagram(){
 const board=$('#board'),viewport=$('#viewport'),origin=board.getBoundingClientRect();
 const cards=[...document.querySelectorAll('#nodes .node')];
 if(!cards.length){board.style.marginLeft='0px';board.style.marginTop='0px';zoom(1);viewport.scrollLeft=0;viewport.scrollTop=0;return;}
 const boxes=cards.map(card=>{const r=card.getBoundingClientRect();return {left:(r.left-origin.left)/scale,right:(r.right-origin.left)/scale,top:(r.top-origin.top)/scale,bottom:(r.bottom-origin.top)/scale};});
 const bounds={left:Math.min(...boxes.map(r=>r.left)),right:Math.max(...boxes.map(r=>r.right)),top:Math.min(...boxes.map(r=>r.top)),bottom:Math.max(...boxes.map(r=>r.bottom))};
 for(const node of project.nodes)for(const savedRoute of Object.values(node.wireRoutes||{}))for(const route of (Array.isArray(savedRoute)?savedRoute:[savedRoute])){bounds.left=Math.min(bounds.left,route.x-80);bounds.right=Math.max(bounds.right,route.x+80);bounds.top=Math.min(bounds.top,route.y-20);bounds.bottom=Math.max(bounds.bottom,route.y+20);}
 board.style.width=Math.ceil(Math.max(3000,bounds.right+100))+'px';board.style.height=Math.ceil(Math.max(2400,bounds.bottom+100))+'px';
 $('#wires').setAttribute('width',Math.ceil(Math.max(3000,bounds.right+100)));$('#wires').setAttribute('height',Math.ceil(Math.max(2400,bounds.bottom+100)));
 const view=centeredDiagramView(bounds,viewport.clientWidth,viewport.clientHeight);zoom(view.scale);
 board.style.marginLeft=view.marginLeft+'px';board.style.marginTop=view.marginTop+'px';viewport.scrollLeft=view.scrollLeft;viewport.scrollTop=view.scrollTop;
}
