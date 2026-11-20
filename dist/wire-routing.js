function wireRoutePoints(route){return Array.isArray(route)?route:route?[route]:[];}
function connectionCurves(x1,y1,x2,y2,route){
 const points=wireRoutePoints(route);if(!points.length){const d=Math.max(65,Math.abs(x2-x1)*.4);return [[[x1,y1],[x1+d,y1],[x2-d,y2],[x2,y2]]];}
 const anchors=[[x1,y1],...points.map(p=>[p.x,p.y]),[x2,y2]],curves=[];
 for(let i=1;i<anchors.length;i++){const a=anchors[i-1],b=anchors[i],d=Math.max(35,Math.abs(b[0]-a[0])*.45);curves.push([a,[a[0]+d,a[1]],[b[0]-d,b[1]],b]);}return curves;
}
function connectionPath(x1,y1,x2,y2,route){
 return 'M '+x1+' '+y1+connectionCurves(x1,y1,x2,y2,route).map(c=>' C '+c.slice(1).map(p=>p[0]+' '+p[1]).join(',')).join('');
}
function sampleConnectionCurve(curve){
 const points=[];for(let i=0;i<=32;i++){const t=i/32,u=1-t;points.push({x:u*u*u*curve[0][0]+3*u*u*t*curve[1][0]+3*u*t*t*curve[2][0]+t*t*t*curve[3][0],y:u*u*u*curve[0][1]+3*u*u*t*curve[1][1]+3*u*t*t*curve[2][1]+t*t*t*curve[3][1]});}return points;
}
function connectionCurvePoints(x1,y1,x2,y2,route){return connectionCurves(x1,y1,x2,y2,route).flatMap(sampleConnectionCurve);}
function validWireRoute(route){return !!route&&(Array.isArray(route)?route.length<=40&&route.every(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)):Number.isFinite(route.x)&&Number.isFinite(route.y));}
function insertWireWaypoint(node,key,point,geometry){
 const points=wireRoutePoints(node.wireRoutes?.[key]).map(p=>({...p}));if(points.length>=40)return false;
 const curves=connectionCurves(...geometry,points);let best=Infinity,index=0;
 curves.forEach((curve,i)=>{for(const sample of sampleConnectionCurve(curve)){const distance=Math.hypot(point.x-sample.x,point.y-sample.y);if(distance<best){best=distance;index=i;}}});
 points.splice(index,0,{x:point.x,y:point.y});node.wireRoutes??={};node.wireRoutes[key]=points;return true;
}
function curveLinesCross(a,b){
 const bounds=points=>({left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),top:Math.min(...points.map(p=>p.y)),bottom:Math.max(...points.map(p=>p.y))});
 const ar=bounds(a),br=bounds(b);if(ar.right<br.left||br.right<ar.left||ar.bottom<br.top||br.bottom<ar.top)return false;
 const cross=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);
 for(let i=1;i<a.length;i++)for(let j=1;j<b.length;j++){
  if(Math.max(a[i-1].x,a[i].x)<Math.min(b[j-1].x,b[j].x)||Math.max(b[j-1].x,b[j].x)<Math.min(a[i-1].x,a[i].x)||Math.max(a[i-1].y,a[i].y)<Math.min(b[j-1].y,b[j].y)||Math.max(b[j-1].y,b[j].y)<Math.min(a[i-1].y,a[i].y))continue;
  const c1=cross(a[i-1],a[i],b[j-1]),c2=cross(a[i-1],a[i],b[j]),c3=cross(b[j-1],b[j],a[i-1]),c4=cross(b[j-1],b[j],a[i]);
  if(c1*c2<=.000001&&c3*c4<=.000001&&Math.max(Math.abs(c1),Math.abs(c2),Math.abs(c3),Math.abs(c4))>.001)return true;
 }return false;
}
