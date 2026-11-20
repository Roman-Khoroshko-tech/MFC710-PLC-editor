let commentResizeGesture=null;
function commentResizeDimensions(start,dx,dy){
 return {width:Math.round(Math.max(160,Math.min(1000,start.width+(start.edge==='bottom'?0:dx)))),height:Math.round(Math.max(100,Math.min(2000,start.height+(start.edge==='right'?0:dy))))};
}
$('#nodes').addEventListener('pointerdown',event=>{
 const handle=event.target.closest('[data-resize-comment]');if(!handle||event.button!==0)return;
 const card=handle.closest('.comment'),node=project.nodes.find(item=>item.id===card?.dataset.id);if(!node)return;
 event.preventDefault();event.stopImmediatePropagation();
 const bounds=card.getBoundingClientRect();
 commentResizeGesture={id:node.id,pointerId:event.pointerId,x:event.clientX,y:event.clientY,width:bounds.width/scale,height:bounds.height/scale,edge:handle.dataset.resizeComment,oldWidth:node.width,oldHeight:node.height,saved:false,priorFuture:[...future]};
 selected=node.id;selectedWire=null;$('#nodes').setPointerCapture(event.pointerId);
},true);
window.addEventListener('pointermove',event=>{
 const gesture=commentResizeGesture;if(!gesture||event.pointerId!==gesture.pointerId)return;
 const node=project.nodes.find(item=>item.id===gesture.id);if(!node){finishCommentResize(true);return;}
 const dx=(event.clientX-gesture.x)/scale,dy=(event.clientY-gesture.y)/scale;
 if(!gesture.saved){if(Math.hypot(dx,dy)<2)return;snapshot();gesture.saved=true;}
 const next=commentResizeDimensions(gesture,dx,dy);node.width=next.width;node.height=next.height;
 const card=document.querySelector('.comment[data-id="'+node.id+'"]');card.style.width=node.width+'px';card.style.minHeight=node.height+'px';resizeCaption(card.querySelector('.node-caption'));
 globalThis.refreshSelection?.();
});
function finishCommentResize(cancel=false){
 const gesture=commentResizeGesture;if(!gesture)return;commentResizeGesture=null;
 if($('#nodes').hasPointerCapture(gesture.pointerId))$('#nodes').releasePointerCapture(gesture.pointerId);
 if(cancel&&gesture.saved){
  const node=project.nodes.find(item=>item.id===gesture.id);if(node){if(gesture.oldWidth===undefined)delete node.width;else node.width=gesture.oldWidth;if(gesture.oldHeight===undefined)delete node.height;else node.height=gesture.oldHeight;}
  history.pop();future=gesture.priorFuture;
 }
 if(gesture.saved&&!cancel)commit();else render();
}
window.addEventListener('pointerup',event=>{if(event.pointerId===commentResizeGesture?.pointerId)finishCommentResize();});
window.addEventListener('pointercancel',()=>finishCommentResize(true));window.addEventListener('blur',()=>finishCommentResize(true));
document.addEventListener('keydown',event=>{if(event.key==='Escape'||((event.ctrlKey||event.metaKey)&&(event.code==='KeyZ'||['z','я'].includes(event.key.toLowerCase()))))finishCommentResize(true);},true);
