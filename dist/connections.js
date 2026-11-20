// Pointer gestures complement the existing click-output, click-input workflow.
let connectionGesture = null;
let suppressConnectionClick = false;

function connectionInputAt(clientX, clientY) {
 const element = document.elementFromPoint(clientX, clientY);
 if (!element || !$('#nodes').contains(element)) return null;
 const direct = element.closest('[data-in]');
 if (direct) return direct;
 // The input row gives small connectors an accessible drop target.
 return element.closest('.portrow')?.querySelector('[data-in]') ?? null;
}
function connectionOutputAt(clientX,clientY){
 const element=document.elementFromPoint(clientX,clientY);
 if(!element||!$('#nodes').contains(element))return null;
 return element.closest('[data-out]')||element.closest('.portrow')?.querySelector('[data-out]')||null;
}

function clearConnectionGesture() {
 const gesture = connectionGesture;
 connectionGesture = null;
 $('#connection-preview')?.remove();
 $('#board').classList.remove('connecting');
 $('#board').classList.remove('connecting-to-output');
 document.querySelectorAll('.connection-target, .connection-source').forEach(port => {
  port.classList.remove('connection-target', 'connection-source');
 });
 if (gesture && $('#nodes').hasPointerCapture(gesture.pointerId)) {
  $('#nodes').releasePointerCapture(gesture.pointerId);
 }
 return gesture;
}

function drawConnectionPreview() {
 const gesture = connectionGesture;
 if (!gesture?.moved) return;
 let preview = $('#connection-preview');
 if (!preview) {
  preview = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  preview.id = 'connection-preview';
  preview.setAttribute('class', 'connection-preview');
  $('#wires').append(preview);
 }
 const origin = gesture.port.getBoundingClientRect();
 const board = $('#board').getBoundingClientRect();
 const target = gesture.reverse ? connectionOutputAt(gesture.clientX,gesture.clientY) : connectionInputAt(gesture.clientX, gesture.clientY);
 const end = target?.getBoundingClientRect();
 const fixedX = (origin.x + origin.width / 2 - board.x) / scale;
 const fixedY = (origin.y + origin.height / 2 - board.y) / scale;
 const movingX = ((end ? end.x + end.width / 2 : gesture.clientX) - board.x) / scale;
 const movingY = ((end ? end.y + end.height / 2 : gesture.clientY) - board.y) / scale;
 const x1=gesture.reverse?movingX:fixedX,y1=gesture.reverse?movingY:fixedY;
 const x2=gesture.reverse?fixedX:movingX,y2=gesture.reverse?fixedY:movingY;
 const bend = Math.max(65, Math.abs(x2 - x1) * .4);
 preview.setAttribute('d', `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`);
 document.querySelectorAll('.connection-target').forEach(port => port.classList.remove('connection-target'));
 target?.classList.add('connection-target');
}

$('#nodes').addEventListener('pointerdown', event => {
 const port = event.target.closest('[data-out]') || event.target.closest('[data-in]');
 if (!port || event.button !== 0 || !event.isPrimary) return;
 clearConnectionGesture();
 connectionGesture = {
  port,
  pointerId: event.pointerId,
  pch: Number(port.dataset.pch),
  sourceId: port.dataset.out,
  reverse: !!port.dataset.in,
  inputId: port.dataset.in,
  inputKey: port.dataset.field,
  previous: pending,
  startX: event.clientX,
  startY: event.clientY,
  clientX: event.clientX,
  clientY: event.clientY,
  moved: false
 };
 $('#nodes').setPointerCapture(event.pointerId);
 // Capture stays on the stable node container while the pointer leaves the port.
 event.stopImmediatePropagation();
}, true);

window.addEventListener('pointermove', event => {
 const gesture = connectionGesture;
 if (!gesture || event.pointerId !== gesture.pointerId) return;
 gesture.clientX = event.clientX;
 gesture.clientY = event.clientY;
 if (!gesture.moved && Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) < 4) return;
 gesture.moved = true;
 pending = null;
 $('#board').classList.add('connecting');
 $('#board').classList.toggle('connecting-to-output',gesture.reverse);
 gesture.port.classList.add('connection-source');
 $('#status').textContent = gesture.reverse?'Перетягніть до потрібного виходу · Esc скасовує':`Перетягніть ${point(gesture.pch)} до входу блока · Esc скасовує`;
 drawConnectionPreview();
 event.preventDefault();
});

window.addEventListener('pointerup', event => {
 if (!connectionGesture || event.pointerId !== connectionGesture.pointerId) return;
 const target = connectionGesture.reverse ? connectionOutputAt(event.clientX,event.clientY) : connectionInputAt(event.clientX, event.clientY);
 const gesture = clearConnectionGesture();
 suppressConnectionClick = true;
 setTimeout(() => { suppressConnectionClick = false; }, 0);
 if (!gesture.moved) {
  if(gesture.reverse && Number.isInteger(gesture.previous?.pch)){
   selected=gesture.inputId;
   connect(gesture.inputId,gesture.inputKey,gesture.previous.pch,gesture.previous.id);
   return;
  }
  if(!gesture.reverse && gesture.previous?.input){
   selected=gesture.previous.input.id;
   connect(gesture.previous.input.id,gesture.previous.input.key,gesture.pch,gesture.sourceId);
   return;
  }
  pending = gesture.reverse ? {input:{id:gesture.inputId,key:gesture.inputKey}} : {pch: gesture.pch, id: gesture.sourceId};
  render();
  return;
 }
 if (target) {
  if(gesture.reverse){
   selected=gesture.inputId;
   connect(gesture.inputId,gesture.inputKey,Number(target.dataset.pch),target.dataset.out);
  }else{
   selected = target.dataset.in;
   connect(target.dataset.in, target.dataset.field, gesture.pch, gesture.sourceId);
  }
 } else {
  showIssues();
 }
}, true);

// A completed drag generates a click too. Consume it before the click connector.
$('#nodes').addEventListener('click', event => {
 if (!suppressConnectionClick) return;
 suppressConnectionClick = false;
 event.preventDefault();
 event.stopImmediatePropagation();
}, true);

window.addEventListener('pointercancel', event => {
 if (connectionGesture?.pointerId !== event.pointerId) return;
 clearConnectionGesture();
 showIssues();
});
window.addEventListener('blur', () => {
 if (!connectionGesture) return;
 clearConnectionGesture();
 showIssues();
});
document.addEventListener('keydown', event => {
 if (event.key !== 'Escape' || !connectionGesture) return;
 clearConnectionGesture();
 pending = null;
 showIssues();
}, true);
$('#viewport').addEventListener('scroll', drawConnectionPreview);
