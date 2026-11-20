function layoutPlcExample(p){
 const blocks=p.nodes.filter(n=>n.kind==='block'),signature=blocks.map(n=>n.code).join(',');
 const layouts={
  '23,18,24,19':[[400,100],[750,100],[1100,100],[1450,100]],
  '12,23,12,9,20,19,34,26,16':[[400,100],[750,100],[750,600],[1100,100],[1100,600],[1450,100],[1800,100],[2150,100],[2500,100]],
  '12,23,12,24,19':[[400,100],[750,100],[750,600],[1100,100],[1450,100]],
  '12,23,12,24,19,12':[[400,100],[750,100],[750,600],[1100,100],[1450,100],[1100,600]],
  '23,19,8,7,9,12,24,23,19':[[400,100],[750,100],[1100,100],[1450,100],[1800,100],[2150,100],[2500,100],[1800,700],[2150,700]],
  '29,23,19,19':[[400,100],[750,100],[1100,100],[1100,600]],
  '23,19,8,7,9,12,18,23,18,24,23,19,19':[[400,100],[750,100],[1100,100],[1450,100],[1800,100],[2150,100],[2500,100],[400,700],[750,700],[1100,700],[1450,700],[1800,700],[1800,1200]],
  '9,7':[[400,100],[750,100]],
  '16,7,12,23,12':[[400,100],[750,100],[400,600],[750,600],[400,1100]],
  '34,19':[[400,100],[750,600]]
 };
 const positions=layouts[signature];blocks.forEach((n,i)=>{[n.x,n.y]=positions?.[i]||[400+i%7*350,100+Math.floor(i/7)*550];});
 p.nodes.filter(n=>n.kind==='source'||n.kind==='constant').forEach((n,i)=>{n.x=40;n.y=100+i*230;});
 const note=p.nodes.find(n=>n.id==='example_info');if(note){note.x=40;note.y=Math.max(600,...p.nodes.filter(n=>n.kind!=='comment').map(n=>n.y+400));note.width=900;}
}
function exampleWireScore(edge,points,edges,rects){
 let score=0;
 for(const box of rects){if(box.id===edge.sourceId||box.id===edge.id)continue;if(points.some(p=>p.x>box.left-5&&p.x<box.right+5&&p.y>box.top-5&&p.y<box.bottom+5))score+=8;}
 for(const other of edges){if(other===edge||other.removed||other.sourceId===edge.sourceId)continue;if(curveLinesCross(points,other.points))score+=4;}
 return score;
}
function planExampleWires(edges,rects){
 for(const edge of edges)edge.points=connectionCurvePoints(edge.x1,edge.y1,edge.x2,edge.y2,edge.route);
 const ordered=[...edges].sort((a,b)=>Math.abs(b.x2-b.x1)-Math.abs(a.x2-a.x1));
 for(let pass=0;pass<3;pass++)for(const edge of ordered){
  let score=exampleWireScore(edge,edge.points,edges,rects);if(!score)continue;
  const middle=(edge.x1+edge.x2)/2,candidates=[];
  for(const offset of [120,-120,240,-240,400,-400,600,-600]){
   candidates.push({x:middle,y:Math.max(20,Math.min(2280,(edge.y1+edge.y2)/2+offset))});
   candidates.push({x:middle,y:Math.max(20,Math.min(2280,Math.min(edge.y1,edge.y2)+offset))});
  }
  for(const x of [Math.max(20,Math.min(edge.x1,edge.x2)-180),Math.min(2950,Math.max(edge.x1,edge.x2)+180)])for(const y of [Math.max(20,Math.min(edge.y1,edge.y2)-140),Math.min(2280,Math.max(edge.y1,edge.y2)+140)])candidates.push({x,y});
  for(const route of candidates){const points=connectionCurvePoints(edge.x1,edge.y1,edge.x2,edge.y2,route),next=exampleWireScore(edge,points,edges,rects);if(next<score){edge.route=route;edge.points=points;score=next;}if(!score)break;}
 }
 // Only unresolved crossings need a pair of references.
 while(true){let worst=null,score=0;for(const edge of ordered){if(edge.removed)continue;const next=exampleWireScore(edge,edge.points,edges,rects);if(next>score){worst=edge;score=next;}}if(!worst)break;worst.removed=true;}
 return edges;
}
function routePlcExample(){
 const board=$('#board').getBoundingClientRect();
 const rects=[...document.querySelectorAll('#nodes .node')].map(card=>{const r=card.getBoundingClientRect();return {id:card.dataset.id,left:(r.left-board.left)/scale,right:(r.right-board.left)/scale,top:(r.top-board.top)/scale,bottom:(r.bottom-board.top)/scale};});
 const edges=[];
 for(const n of project.nodes)for(const f of fields(n)){
  if(f.type!=='pch'||!n.links?.[f.key])continue;const sourceId=n.links[f.key].id,pch=n.values[f.key];
  const out=document.querySelector(`[data-out="${sourceId}"][data-pch="${pch}"]`),input=document.querySelector(`[data-in="${n.id}"][data-field="${f.key}"]`);if(!out||!input)continue;
  const a=out.getBoundingClientRect(),b=input.getBoundingClientRect();edges.push({id:n.id,key:f.key,sourceId,x1:(a.left+a.width/2-board.left)/scale,y1:(a.top+a.height/2-board.top)/scale,x2:(b.left+b.width/2-board.left)/scale,y2:(b.top+b.height/2-board.top)/scale});
 }
 planExampleWires(edges,rects);
 function place(x,y){
  for(const dy of [0,-120,120,-240,240,-360,360,-480,480])for(const dx of [0,180,-180]){
   const pos={x:Math.max(15,Math.min(2800,x+dx)),y:Math.max(15,Math.min(2230,y+dy))};
   if(rects.some(r=>pos.x<r.right+10&&pos.x+155>r.left-10&&pos.y<r.bottom+10&&pos.y+95>r.top-10))continue;
   rects.push({left:pos.x,right:pos.x+155,top:pos.y,bottom:pos.y+95});return pos;
  }
  return {x:Math.max(15,Math.min(2800,x)),y:Math.max(15,Math.min(2230,y+500))};
 }
 for(const edge of edges){
  const target=project.nodes.find(n=>n.id===edge.id);if(!target)continue;
  if(edge.removed){const sender=place(edge.x1+25,edge.y1-35),receiver=place(edge.x2-180,edge.y2-35);splitProjectConnection(project,edge.id,edge.key,edge.sourceId,{sender:crypto.randomUUID(),receiver:crypto.randomUUID()},{sender,receiver});}
  else if(edge.route){target.wireRoutes??={};target.wireRoutes[edge.key]=edge.route;}
 }
 commit();
}
