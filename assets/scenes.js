/* Prime Spatial Plan — painted scenes shared by every page (homepage voyage, page heroes, transitions).
   Ten architectural sheets, one per project step, drawn to presentation-board conventions:
   line-weight hierarchy, poché, material hatching, dimension chains, sheet labels, north arrows,
   scale bars and entourage. Step 07 is a clay-model render; step 10 (also the studio hero) is an urban master plan. */
(function(){
  /* ---------- palette & basics ---------- */
  var BG='#111317', L='#ECE8E1', L2='rgba(236,232,225,.55)', L3='rgba(236,232,225,.28)', L4='rgba(236,232,225,.12)',
      OR='#F7991E', ORa='rgba(247,153,30,.18)', MONO='Menlo, Consolas, monospace', SANS='Onest, Arial, sans-serif';
  function rng(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0; var t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
  function grad(ctx,y0,y1,stops){ var g=ctx.createLinearGradient(0,y0,0,y1); stops.forEach(function(s){ g.addColorStop(s[0],s[1]); }); return g; }
  function glow(ctx,x,y,r,color){ var g=ctx.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,color); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=g; ctx.fillRect(x-r,y-r,r*2,r*2); }

  /* drawing context: everything inside a sheet is drawn in drawing units, line widths given in screen px */
  var S=1;
  function lw(px){ return px/S; }
  function line(ctx,x1,y1,x2,y2,c,w,dash){ ctx.strokeStyle=c; ctx.lineWidth=lw(w); ctx.setLineDash(dash?dash.map(lw):[]); ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); ctx.setLineDash([]); }
  function path(ctx,d,c,w,dash){ ctx.strokeStyle=c; ctx.lineWidth=lw(w); ctx.setLineDash(dash?dash.map(lw):[]); ctx.stroke(typeof d==='string'?new Path2D(d):d); ctx.setLineDash([]); }
  function rect(ctx,x,y,w,h,c,lwpx,fill){ if(fill){ ctx.fillStyle=fill; ctx.fillRect(x,y,w,h); } if(c){ ctx.strokeStyle=c; ctx.lineWidth=lw(lwpx); ctx.strokeRect(x,y,w,h); } }
  function poly(ctx,pts,fill,stroke,w){ ctx.beginPath(); pts.forEach(function(q,k){ k?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]); }); ctx.closePath();
    if(fill){ ctx.fillStyle=fill; ctx.fill(); } if(stroke){ ctx.strokeStyle=stroke; ctx.lineWidth=lw(w||1); ctx.stroke(); } }
  function text(ctx,t,x,y,o){ o=o||{}; ctx.save(); ctx.translate(x,y); if(o.rot) ctx.rotate(o.rot); ctx.scale(1/S,1/S);
    ctx.font=(o.weight||400)+' '+(o.size||11)+'px '+(o.mono?MONO:SANS); ctx.fillStyle=o.color||L; ctx.textAlign=o.align||'left'; ctx.textBaseline=o.base||'alphabetic';
    if(o.track){ ctx.letterSpacing=o.track+'px'; } ctx.fillText(t,0,0); ctx.restore(); }
  /* hatch a clip region with parallel lines at angle a (deg), spacing sp in screen px */
  function hatch(ctx,clip,a,sp,c,w){ ctx.save(); ctx.beginPath(); clip(ctx); ctx.clip(); var b=4000, step=sp/S, r=a*Math.PI/180;
    ctx.strokeStyle=c; ctx.lineWidth=lw(w||.6); ctx.beginPath();
    for(var k=-b;k<b;k+=step){ var cx=Math.cos(r), sy=Math.sin(r); ctx.moveTo(k*-sy-b*cx, k*cx-b*sy); ctx.lineTo(k*-sy+b*cx, k*cx+b*sy); }
    ctx.stroke(); ctx.restore(); }
  function rclip(x,y,w,h){ return function(ctx){ ctx.rect(x,y,w,h); }; }
  function insulation(ctx,x,y,w,h,c){ /* zigzag batt insulation along the long side */
    ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip(); ctx.strokeStyle=c||L2; ctx.lineWidth=lw(.8); ctx.beginPath();
    if(h>=w){ var s=w*.6; ctx.moveTo(x,y); for(var yy=y;yy<y+h+s;yy+=s){ ctx.lineTo(x+w,yy+s/2); ctx.lineTo(x,yy+s); } }
    else { var s2=h*.6; ctx.moveTo(x,y+h); for(var xx=x;xx<x+w+s2;xx+=s2){ ctx.lineTo(xx+s2/2,y); ctx.lineTo(xx+s2,y+h); } }
    ctx.stroke(); ctx.restore(); }
  function concrete(ctx,x,y,w,h,seed){ var r=rng(seed||7); ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip(); ctx.fillStyle=L3;
    for(var i=0;i<w*h/90;i++){ var px=x+r()*w, py=y+r()*h, s=(r()*1.6+.6)/S; if(r()<.25){ ctx.beginPath(); ctx.moveTo(px,py-s*1.6); ctx.lineTo(px+s*1.4,py+s); ctx.lineTo(px-s*1.4,py+s); ctx.closePath(); ctx.strokeStyle=L3; ctx.lineWidth=lw(.5); ctx.stroke(); } else ctx.fillRect(px,py,s,s); }
    ctx.restore(); }

  /* annotation kit */
  function tick(ctx,x,y){ line(ctx,x-4/S,y+4/S,x+4/S,y-4/S,OR,1); }
  function dimH(ctx,xs,y,ext,labels,y0){ /* horizontal dimension chain at y, extension lines up from y0 */
    line(ctx,xs[0],y,xs[xs.length-1],y,OR,.8);
    xs.forEach(function(x){ line(ctx,x,y0!==undefined?y0:y,x,y+6/S,OR,.6); tick(ctx,x,y); });
    for(var i=0;i<xs.length-1;i++) text(ctx,labels[i],(xs[i]+xs[i+1])/2,y-5/S,{mono:1,size:10,color:OR,align:'center'}); }
  function dimV(ctx,ys,x,labels,x0){
    line(ctx,x,ys[0],x,ys[ys.length-1],OR,.8);
    ys.forEach(function(y){ line(ctx,x0!==undefined?x0:x,y,x-6/S,y,OR,.6); tick(ctx,x,y); });
    for(var i=0;i<ys.length-1;i++) text(ctx,labels[i],x-6/S,(ys[i]+ys[i+1])/2,{mono:1,size:10,color:OR,align:'center',rot:-Math.PI/2}); }
  function bubble(ctx,x,y,t){ ctx.beginPath(); ctx.arc(x,y,10/S,0,7); ctx.fillStyle=BG; ctx.fill(); ctx.strokeStyle=L2; ctx.lineWidth=lw(1); ctx.stroke(); text(ctx,t,x,y+.5/S,{mono:1,size:10,color:L2,align:'center',base:'middle'}); }
  function leader(ctx,x1,y1,x2,y2,t,o){ o=o||{}; line(ctx,x1,y1,x2,y2,o.color||L2,.8); ctx.beginPath(); ctx.arc(x1,y1,2/S,0,7); ctx.fillStyle=o.color||L2; ctx.fill();
    var right=x2>=x1; line(ctx,x2,y2,x2+(right?1:-1)*(o.shelf||40)/S,y2,o.color||L2,.8);
    text(ctx,t,x2+(right?4:-4)/S,y2-5/S,{size:o.size||10.5,color:o.tcolor||L,align:right?'left':'right',weight:500}); }
  function check(ctx,x,y){ ctx.beginPath(); ctx.arc(x,y,9/S,0,7); ctx.fillStyle=ORa; ctx.fill(); ctx.strokeStyle=OR; ctx.lineWidth=lw(1.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x-4/S,y); ctx.lineTo(x-1/S,y+3.5/S); ctx.lineTo(x+4.5/S,y-3.5/S); ctx.lineWidth=lw(1.8); ctx.stroke(); }
  function northArrow(ctx,x,y,r){ ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.strokeStyle=L2; ctx.lineWidth=lw(1); ctx.stroke();
    poly(ctx,[[x,y-r*1.25],[x+r*.35,y+r*.5],[x,y+r*.2],[x-r*.35,y+r*.5]],L); text(ctx,'N',x,y-r*1.45,{size:10,align:'center',weight:600}); }
  function scaleBar(ctx,x,y,unitPx,steps,label){ for(var i=0;i<steps;i++) rect(ctx,x+i*unitPx,y,unitPx,4/S,L2,.8,i%2?null:L2);
    for(i=0;i<=steps;i++) text(ctx,String(i*label),x+i*unitPx,y+16/S,{mono:1,size:9,color:L2,align:'center'}); text(ctx,'м',x+steps*unitPx+10/S,y+16/S,{mono:1,size:9,color:L2}); }
  function sheetLabel(ctx,x,y,num,title,scale){ ctx.beginPath(); ctx.arc(x,y,13/S,0,7); ctx.strokeStyle=L; ctx.lineWidth=lw(1.2); ctx.stroke();
    line(ctx,x-13/S,y,x+13/S,y,L,.8); text(ctx,num,x,y-3/S,{mono:1,size:10,align:'center'}); text(ctx,'АР',x,y+10/S,{mono:1,size:8,align:'center',color:L2});
    line(ctx,x+20/S,y+2/S,x+260/S,y+2/S,L,1.4); text(ctx,title,x+20/S,y-5/S,{size:12,weight:600,track:1.2});
    if(scale) text(ctx,scale,x+20/S,y+15/S,{mono:1,size:10,color:L2}); }
  function person(ctx,x,y,h,c,flip){ var u=h/1.75, f=flip?-1:1; ctx.fillStyle=c;
    ctx.beginPath(); ctx.arc(x,y-1.62*u,.11*u,0,7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x-.2*u*f,y-1.48*u); ctx.lineTo(x+.2*u*f,y-1.48*u); ctx.lineTo(x+.24*u*f,y-.95*u); ctx.lineTo(x+.14*u*f,y-.95*u);
    ctx.lineTo(x+.16*u*f,y); ctx.lineTo(x+.04*u*f,y); ctx.lineTo(x,y-.7*u); ctx.lineTo(x-.06*u*f,y); ctx.lineTo(x-.18*u*f,y); ctx.lineTo(x-.14*u*f,y-.95*u); ctx.lineTo(x-.24*u*f,y-.95*u); ctx.closePath(); ctx.fill(); }
  function treeElev(ctx,x,y,h,seed,c){ var r=rng(seed), cr=h*.32; line(ctx,x,y,x,y-h*.55,c,1.2);
    ctx.strokeStyle=c; ctx.lineWidth=lw(.8); ctx.beginPath();
    for(var i=0;i<=64;i++){ var a=i/64*Math.PI*2, rr=cr*(1+.08*Math.sin(a*7+r()*.6)+.05*(r()-.5)); var px=x+Math.cos(a)*rr*.85, py=y-h*.62+Math.sin(a)*rr; i?ctx.lineTo(px,py):ctx.moveTo(px,py); }
    ctx.closePath(); ctx.stroke();
    for(i=0;i<5;i++){ var a2=-Math.PI/2+(r()-.5)*2.2; line(ctx,x,y-h*.5,x+Math.cos(a2)*cr*.6,y-h*.62+Math.sin(a2)*cr*.6,c,.6); } }
  function treePlan(ctx,x,y,rad,seed,c){ var r=rng(seed); ctx.strokeStyle=c; ctx.lineWidth=lw(.8); ctx.beginPath();
    for(var i=0;i<=48;i++){ var a=i/48*Math.PI*2, rr=rad*(1+.09*Math.sin(a*9+seed)); var px=x+Math.cos(a)*rr, py=y+Math.sin(a)*rr; i?ctx.lineTo(px,py):ctx.moveTo(px,py); }
    ctx.closePath(); ctx.stroke(); for(i=0;i<7;i++){ var a2=r()*7; line(ctx,x,y,x+Math.cos(a2)*rad*.7,y+Math.sin(a2)*rad*.7,c,.5); } ctx.beginPath(); ctx.arc(x,y,1.5/S,0,7); ctx.fillStyle=c; ctx.fill(); }

  /* the drawing board ground: graphite with a fine dot grid, sheet border and registration marks */
  function board(ctx,W,H){
    ctx.fillStyle=BG; ctx.fillRect(0,0,W,H);
    var g=Math.max(16,Math.round(Math.min(W,H)/42)); ctx.fillStyle='rgba(236,232,225,.07)';
    for(var x=g/2;x<W;x+=g) for(var y=g/2;y<H;y+=g) ctx.fillRect(x,y,1.2,1.2);
    var m=Math.round(Math.min(W,H)*.035); ctx.strokeStyle='rgba(236,232,225,.14)'; ctx.lineWidth=1; ctx.strokeRect(m+.5,m+.5,W-2*m,H-2*m);
    [[m,m],[W-m,m],[m,H-m],[W-m,H-m]].forEach(function(p){ ctx.beginPath(); ctx.moveTo(p[0]-8,p[1]); ctx.lineTo(p[0]+8,p[1]); ctx.moveTo(p[0],p[1]-8); ctx.lineTo(p[0],p[1]+8); ctx.strokeStyle='rgba(236,232,225,.35)'; ctx.stroke(); });
  }
  function vignette(ctx,W,H,a){ var v=ctx.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,Math.max(W,H)*.8); v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,'rgba(0,0,0,'+(a||.45)+')'); ctx.fillStyle=v; ctx.fillRect(0,0,W,H); }
  /* place a drawing of dw x dh units; portrait screens get a lower, wider placement below the portal */
  function frame(ctx,W,H,dw,dh,fw,fh,cx,cy){ if(W<H){ fw=.94; fh*=.48; cx=.5; cy=Math.min(cy+.19,.68); }
    S=Math.min(W*fw/dw,H*fh/dh); ctx.save(); ctx.translate(W*cx-dw/2*S,H*cy-dh/2*S); ctx.scale(S,S); }

  /* ---------- shared house geometry (metres): 12 x 8.4, two storeys of 3.3 m, parapet to 7.2 ---------- */
  var ROOMS=[['Гал тогоо',17.6,0,0,4.2,4.2],['Зочны өрөө',32.8,4.2,0,7.8,4.2],['АЦӨ',8.8,0,4.2,2.1,4.2],['Шат',null,2.1,4.2,2.1,4.2],['Унтлагын өрөө',17.6,4.2,4.2,4.2,4.2],['Ажлын өрөө',15.1,8.4,4.2,3.6,4.2]];

  /* full working plan, used by steps 04 and 08; u = units per metre */
  function plan(ctx,u,o){
    var t=.4*u, ti=.16*u, Wd=12*u, Hd=8.4*u;
    function wallsClip(c){ c.rect(-t,-t,Wd+2*t,t); c.rect(-t,Hd,Wd+2*t,t); c.rect(-t,0,t,Hd); c.rect(Wd,0,t,Hd);
      [[4.2*u-ti/2,0,ti,4.2*u],[0,4.2*u-ti/2,Wd,ti],[2.1*u-ti/2,4.2*u,ti,4.2*u],[4.2*u-ti/2,4.2*u,ti,4.2*u],[8.4*u-ti/2,4.2*u,ti,4.2*u]].forEach(function(q){ c.rect(q[0],q[1],q[2],q[3]); }); }
    /* grid */
    [0,4.2,12].forEach(function(x,i){ line(ctx,x*u,-2.2*u,x*u,Hd+2*u,L3,.6,[12,4,2,4]); bubble(ctx,x*u,Hd+2.6*u,String(i+1)); });
    [0,4.2,8.4].forEach(function(y,i){ line(ctx,-2.2*u,y*u,Wd+1.6*u,y*u,L3,.6,[12,4,2,4]); bubble(ctx,-2.8*u,y*u,'АБВ'[i]); });
    /* walls: poché + insulation band on the exterior */
    ctx.save(); ctx.beginPath(); wallsClip(ctx); ctx.fillStyle=o.poche||L; ctx.fill();
    /* openings cut out of the poché */
    var doors=[[4.2,1.6,'v',.9],[1.2,4.2,'h',.8],[6.4,4.2,'h',.9],[9.4,4.2,'h',.9],[3.1,4.2,'h',.9],[2.5,8.4,'h',1]];
    var wins=[[1.2,0,'h',1.8],[6.2,0,'h',3],[5.1,8.4,'h',2.2],[9.6,8.4,'h',1.8],[12,1.2,'v',1.8]];
    ctx.globalCompositeOperation='destination-out';
    doors.concat(wins).forEach(function(d){ var th=(d[1]===0||d[1]===8.4||d[0]===12)?t:ti+2; if(d[2]==='h') ctx.fillRect(d[0]*u,d[1]===0?-t:d[1]===8.4?Hd:d[1]*u-th/2,d[3]*u,d[1]===0||d[1]===8.4?t:th); else ctx.fillRect(d[0]===12?Wd:d[0]*u-th/2,d[1]*u,d[0]===12?t:th,d[3]*u); });
    ctx.restore();
    insulation(ctx,-t,-t,Wd+2*t,t*.42,BG); insulation(ctx,-t,Hd+t*.58,Wd+2*t,t*.42,BG); insulation(ctx,-t,-t,t*.42,Hd+2*t,BG); insulation(ctx,Wd+t*.58,-t,t*.42,Hd+2*t,BG);
    /* windows: three-line convention */
    wins.forEach(function(w){ if(w[2]==='h'){ var y0=w[1]===0?-t:Hd; for(var k=0;k<3;k++) line(ctx,w[0]*u,y0+t*(.2+.3*k),(w[0]+w[3])*u,y0+t*(.2+.3*k),L,k===1?.6:1); }
      else { for(k=0;k<3;k++) line(ctx,Wd+t*(.2+.3*k),w[1]*u,Wd+t*(.2+.3*k),(w[1]+w[3])*u,L,k===1?.6:1); } });
    /* door swings */
    doors.forEach(function(d){ var x=d[0]*u, y=d[1]*u, w=d[3]*u; ctx.strokeStyle=L2; ctx.lineWidth=lw(.7); ctx.beginPath();
      if(d[2]==='h'){ ctx.moveTo(x,y); ctx.lineTo(x,y+(d[1]===8.4?-w:w)); ctx.moveTo(x+w,y); ctx.arc(x,y,w,0,d[1]===8.4?-Math.PI/2:Math.PI/2,d[1]===8.4); }
      else { ctx.moveTo(x,y); ctx.lineTo(x+w,y); ctx.moveTo(x,y+w); ctx.arc(x,y,w,Math.PI/2,0,true); }
      ctx.stroke(); });
    /* stair */
    for(var i=0;i<11;i++) line(ctx,2.1*u+ti/2,(4.6+i*.34)*u,4.2*u-ti/2,(4.6+i*.34)*u,L2,.6);
    line(ctx,3.15*u,8.1*u,3.15*u,4.7*u,L2,.8); poly(ctx,[[3.15*u,4.55*u],[3.05*u,4.85*u],[3.25*u,4.85*u]],L2);
    line(ctx,2.2*u,6.6*u,4.1*u,6.1*u,L2,.8);
    if(o.furniture){
      rect(ctx,.3*u,.3*u,3.6*u,.6*u,L3,.7); rect(ctx,.3*u,.3*u,.6*u,2.6*u,L3,.7); ctx.beginPath(); ctx.arc(1.6*u,.6*u,.22*u,0,7); ctx.strokeStyle=L3; ctx.stroke();
      rect(ctx,2.2*u,2.2*u,1.4*u,1.2*u,L3,.7);
      rect(ctx,5*u,.5*u,3.2*u,.9*u,L3,.7); rect(ctx,5*u,.5*u,.9*u,2.4*u,L3,.7); rect(ctx,6.4*u,1.8*u,1.4*u,.8*u,L3,.7); rect(ctx,9.6*u,.6*u,1.8*u,2.6*u,L3,.7);
      rect(ctx,5*u,5.6*u,2*u,2.2*u,L3,.7); rect(ctx,5*u,5.6*u,2*u,.5*u,L3,.6); rect(ctx,7.3*u,5.6*u,.6*u,.5*u,L3,.6);
      rect(ctx,9.2*u,7.2*u,2*u,.8*u,L3,.7); ctx.beginPath(); ctx.arc(10.2*u,6.6*u,.3*u,0,7); ctx.strokeStyle=L3; ctx.stroke();
      rect(ctx,.3*u,7.3*u,.8*u,.8*u,L3,.6); rect(ctx,1.2*u,4.6*u,.6*u,1.4*u,L3,.6);
    }
    if(o.labels) ROOMS.forEach(function(r){ if(!r[1]) return; var cx=(r[2]+r[4]/2)*u, cy=(r[3]+r[5]/2)*u;
      text(ctx,r[0],cx,cy-2/S,{size:11,weight:500,align:'center'}); text(ctx,r[1]+' м²',cx,cy+12/S,{mono:1,size:9.5,color:L2,align:'center'}); });
    if(o.dims){
      dimH(ctx,[0,4.2*u,12*u],-1.3*u,0,['4 200','7 800'],-t); dimH(ctx,[0,12*u],-2*u,0,['12 000']);
      dimV(ctx,[0,4.2*u,8.4*u],Wd+1.1*u,['4 200','4 200'],Wd+t); }
  }

  /* ---------- 01 Request — location plan: topography, river, roads, parcels ---------- */
  function s01(ctx,W,H){
    board(ctx,W,H);
    var dw=1000, dh=620; frame(ctx,W,H,dw,dh,.66,.72,.57,.47);
    var r=rng(101), hills=[[260,170,190,1],[720,120,230,1.2],[860,470,170,.8],[120,520,150,.6]];
    function f(x,y){ var v=0; hills.forEach(function(h){ var d=((x-h[0])*(x-h[0])+(y-h[1])*(y-h[1]))/(h[2]*h[2]); v+=h[3]*Math.exp(-d); }); return v+.12*Math.sin(x*.012)+.08*Math.cos(y*.017+x*.004); }
    /* marching squares contours */
    var gs=10, nx=dw/gs+1, ny=dh/gs+1, val=[];
    for(var j=0;j<ny;j++){ val[j]=[]; for(var i=0;i<nx;i++) val[j][i]=f(i*gs,j*gs); }
    ctx.save(); ctx.beginPath(); ctx.rect(0,0,dw,dh); ctx.clip();
    for(var lev=-.1,k=0;lev<1.4;lev+=.06,k++){
      ctx.beginPath();
      for(j=0;j<ny-1;j++) for(i=0;i<nx-1;i++){
        var a=val[j][i],b=val[j][i+1],c=val[j+1][i+1],d=val[j+1][i], x=i*gs, y=j*gs, pts=[];
        function e(p,q,x1,y1,x2,y2){ if((p<lev)!==(q<lev)){ var t=(lev-p)/(q-p); pts.push([x1+(x2-x1)*t,y1+(y2-y1)*t]); } }
        e(a,b,x,y,x+gs,y); e(b,c,x+gs,y,x+gs,y+gs); e(d,c,x,y+gs,x+gs,y+gs); e(a,d,x,y,x,y+gs);
        if(pts.length>=2){ ctx.moveTo(pts[0][0],pts[0][1]); ctx.lineTo(pts[1][0],pts[1][1]); }
        if(pts.length===4){ ctx.moveTo(pts[2][0],pts[2][1]); ctx.lineTo(pts[3][0],pts[3][1]); }
      }
      ctx.strokeStyle=k%5===0?L3:L4; ctx.lineWidth=lw(k%5===0?1:.6); ctx.stroke();
    }
    /* river */
    var riv=new Path2D('M-10 600 C120 560 200 590 300 548 C420 498 470 560 600 520 C720 482 780 540 1010 500');
    ctx.strokeStyle='rgba(120,160,200,.35)'; ctx.lineWidth=lw(10); ctx.stroke(riv); ctx.strokeStyle='rgba(150,190,230,.6)'; ctx.lineWidth=lw(1); ctx.stroke(riv);
    /* roads: double lines */
    var roads=['M-10 330 C200 320 400 350 560 330 C700 312 820 300 1010 310','M480 -10 C470 120 500 230 520 335 C540 430 520 520 540 630','M560 330 C640 380 700 420 760 520'];
    roads.forEach(function(d){ var p=new Path2D(d); ctx.strokeStyle=L2; ctx.lineWidth=lw(9); ctx.stroke(p); ctx.strokeStyle=BG; ctx.lineWidth=lw(7); ctx.stroke(p); ctx.strokeStyle=L4; ctx.lineWidth=lw(.6); ctx.setLineDash([6/S,6/S]); ctx.stroke(p); ctx.setLineDash([]); });
    /* parcels along the roads */
    for(i=0;i<9;i++){ var px=560+i*44, py=258; rect(ctx,px,py,40,56,L3,.6); if(r()<.6) rect(ctx,px+10,py+14,18+r()*8,22,null,0,'rgba(236,232,225,.16)'); }
    for(i=0;i<6;i++){ px=560+i*44; py=346; rect(ctx,px,py,40,52,L3,.6); if(r()<.6) rect(ctx,px+12,py+10,18,20,null,0,'rgba(236,232,225,.16)'); }
    for(i=0;i<5;i++){ px=300+i*38; py=262; rect(ctx,px,py,34,54,L3,.6); if(r()<.5) rect(ctx,px+8,py+14,16,20,null,0,'rgba(236,232,225,.16)'); }
    /* the client's plot */
    var P=[648,346,40,52]; hatch(ctx,rclip(P[0],P[1],P[2],P[3]),45,5,OR,.8); rect(ctx,P[0],P[1],P[2],P[3],OR,1.6);
    ctx.restore();
    leader(ctx,P[0]+P[2],P[1]+P[3]/2,P[0]+120,P[1]+86,'ГАЗРЫН НЭГЖ ТАЛБАР',{color:OR,tcolor:OR,shelf:130});
    /* map frame with coordinates */
    rect(ctx,0,0,dw,dh,L2,1);
    ['106°54′','106°55′','106°56′','106°57′'].forEach(function(t,i){ var x=(i+.5)*dw/4; line(ctx,x,0,x,-6/S,L2,.8); text(ctx,t+' E',x,-10/S,{mono:1,size:9,color:L2,align:'center'}); });
    ['47°56′','47°55′','47°54′'].forEach(function(t,i){ var y=(i+.5)*dh/3; line(ctx,dw,y,dw+6/S,y,L2,.8); text(ctx,t+' N',dw+10/S,y+3/S,{mono:1,size:9,color:L2}); });
    northArrow(ctx,dw-40,48,16); scaleBar(ctx,dw-230,dh-40,40,4,25);
    text(ctx,'1 360',268,150,{mono:1,size:9,color:L2}); text(ctx,'1 390',708,96,{mono:1,size:9,color:L2});
    sheetLabel(ctx,18,dh+40,'01','БАЙРШЛЫН ЗУРАГ','1 : 2 000');
    ctx.restore(); vignette(ctx,W,H);
  }

  /* ---------- 02 Brief — site analysis: setbacks, sun path, prevailing wind, access ---------- */
  function s02(ctx,W,H){
    board(ctx,W,H);
    var u=14, dw=40*u, dh=34*u; frame(ctx,W,H,dw+260,dh+40,.66,.74,.56,.47);
    ctx.translate(30,20);
    var px=5*u, py=3*u, pw=30*u, ph=25*u;
    /* road */
    rect(ctx,-30,py+ph+2*u,dw+60,3.5*u,null,0,'rgba(236,232,225,.07)'); line(ctx,-30,py+ph+2*u,dw+30,py+ph+2*u,L2,1); line(ctx,-30,py+ph+5.5*u,dw+30,py+ph+5.5*u,L2,1);
    line(ctx,-30,py+ph+3.75*u,dw+30,py+ph+3.75*u,L3,.8,[14,10]);
    text(ctx,'ГУДАМЖ',dw/2,py+ph+4.2*u,{size:9,color:L2,align:'center',track:2});
    /* neighbours */
    [[-4*u,py+4*u,7*u,9*u],[py+pw+3*u,py+2*u,6*u,10*u],[14*u,-6*u,10*u,6*u]].forEach(function(n){ hatch(ctx,rclip(n[0],n[1],n[2],n[3]),45,6,L4,.7); rect(ctx,n[0],n[1],n[2],n[3],L3,.8); });
    /* plot + setback */
    rect(ctx,px,py,pw,ph,L,2); rect(ctx,px+3*u,py+3*u,pw-6*u,ph-6*u,L2,.9,'rgba(247,153,30,.06)');
    ctx.strokeStyle=L2; ctx.setLineDash([8/S,5/S]); ctx.lineWidth=lw(.9); ctx.strokeRect(px+3*u,py+3*u,pw-6*u,ph-6*u); ctx.setLineDash([]);
    text(ctx,'БАРИЛГА БАЙРЛАХ БҮС',px+pw/2,py+ph/2,{size:10,color:L2,align:'center',track:1.5});
    dimH(ctx,[px,px+pw],py-1.4*u,0,['30 000'],py); dimV(ctx,[py,py+ph],px-1.4*u,['25 000'],px);
    dimH(ctx,[px+pw-3*u,px+pw],py+ph-1.2*u,0,['3 000'],py+ph-1.2*u);
    /* existing trees */
    [[px+4*u,py+5*u,1.6*u],[px+25*u,py+20*u,2*u],[px+7*u,py+21*u,1.3*u]].forEach(function(t,i){ treePlan(ctx,t[0],t[1],t[2],i+3,L2); });
    /* access */
    poly(ctx,[[px+22*u,py+ph+1.8*u],[px+21.2*u,py+ph+.4*u],[px+22.8*u,py+ph+.4*u]],OR); line(ctx,px+22*u,py+ph+1.8*u,px+22*u,py+ph-2.4*u,OR,1.4,[6,4]);
    text(ctx,'ОРЦ',px+23*u,py+ph+1.2*u,{size:9,color:OR,weight:600});
    /* sun path (plan projection) */
    var cx=px+pw/2, cy=py+ph/2, R=ph*.62;
    ctx.beginPath(); ctx.arc(cx,cy,R,0,7); ctx.strokeStyle=L3; ctx.lineWidth=lw(.7); ctx.stroke();
    [['Х',0,-1],['З',1,0],['Ө',0,1],['Б',-1,0]].forEach(function(d){ text(ctx,d[0],cx+d[1]*(R+10),cy+d[2]*(R+10)+4,{size:9,color:L2,align:'center',weight:600}); });
    function arc(a0,a1,rr,c,lab){ ctx.beginPath(); ctx.ellipse(cx,cy+R*.15,rr,rr*.62,0,a0,a1); ctx.strokeStyle=c; ctx.lineWidth=lw(1.2); ctx.stroke();
      for(var k=0;k<=6;k++){ var a=a0+(a1-a0)*k/6; ctx.beginPath(); ctx.arc(cx+Math.cos(a)*rr,cy+R*.15+Math.sin(a)*rr*.62,2.5/S,0,7); ctx.fillStyle=c; ctx.fill(); }
      var am=(a0+a1)/2; text(ctx,lab,cx+Math.cos(am)*rr,cy+R*.15+Math.sin(am)*rr*.62+14/S,{mono:1,size:9,color:c,align:'center'}); }
    arc(Math.PI*.05,Math.PI*.95,R*.92,OR,'06.22'); arc(Math.PI*.22,Math.PI*.78,R*.62,'rgba(247,153,30,.6)','12.22');
    /* wind rose */
    var wx=dw+90, wy=60, sc=[.5,.35,.3,.45,.55,.7,1,.85];
    ctx.beginPath(); sc.forEach(function(v,i){ var a=-Math.PI/2+i*Math.PI/4, rr=v*58; i?ctx.lineTo(wx+Math.cos(a)*rr,wy+Math.sin(a)*rr):ctx.moveTo(wx+Math.cos(a)*rr,wy+Math.sin(a)*rr); }); ctx.closePath();
    ctx.fillStyle='rgba(236,232,225,.1)'; ctx.fill(); ctx.strokeStyle=L; ctx.lineWidth=lw(1); ctx.stroke();
    [20,40,58].forEach(function(rr){ ctx.beginPath(); ctx.arc(wx,wy,rr,0,7); ctx.strokeStyle=L4; ctx.lineWidth=lw(.6); ctx.stroke(); });
    text(ctx,'САЛХИНЫ САРНАЙ',wx,wy+82,{size:9,color:L2,align:'center',track:1.5});
    var wa=-Math.PI/2-Math.PI/4; for(var q=0;q<3;q++){ var sx=px+pw*.15+q*40, sy=py+ph*.12+q*24; line(ctx,sx,sy,sx+Math.cos(wa+Math.PI)*-60,sy+Math.sin(wa+Math.PI)*-60,'rgba(150,190,230,.7)',1.2); }
    text(ctx,'Зонхилох салхи — БХ',px+pw*.15,py+ph*.12-10,{size:9.5,color:'rgba(150,190,230,.9)'});
    northArrow(ctx,dw+90,dh-30,15);
    sheetLabel(ctx,0,dh+30,'02','ГАЗРЫН ШИНЖИЛГЭЭ','1 : 500');
    ctx.restore(); vignette(ctx,W,H);
  }

  /* ---------- 03 Layout — functional diagram: zones, adjacencies, circulation ---------- */
  function s03(ctx,W,H){
    board(ctx,W,H);
    var u=46, dw=12*u, dh=8.4*u; frame(ctx,W,H,dw+300,dh+120,.66,.74,.57,.47);
    ctx.translate(40,60);
    rect(ctx,0,0,dw,dh,L3,1,null); ctx.setLineDash([]);
    for(var i=1;i<12;i++) line(ctx,i*u,0,i*u,dh,L4,.5); for(i=1;i<9;i++) line(ctx,0,i*u,dw,i*u,L4,.5);
    var Z={day:['rgba(247,153,30,.22)',OR,'ӨДРИЙН БҮС'],night:['rgba(140,170,220,.2)','rgba(160,190,235,.9)','ШӨНИЙН БҮС'],svc:['rgba(236,232,225,.12)',L2,'ҮЙЛЧИЛГЭЭ']};
    var B=[['Зочны өрөө',32.8,7.6,1.9,'day'],['Гал тогоо',17.6,2.2,1.9,'day'],['Унтлагын өрөө',17.6,6.2,6.5,'night'],['Ажлын өрөө',15.1,10.1,6.4,'night'],['АЦӨ',8.8,1.1,6.6,'svc'],['Шат',6,3.2,6.3,'svc']];
    function pos(b){ return [b[2]*u,b[3]*u,Math.sqrt(b[1])*u*.25]; }
    var links=[[0,1,1],[0,5,1],[5,2,1],[5,3,0],[1,4,0],[2,3,0],[0,3,0]];
    links.forEach(function(l){ var a=pos(B[l[0]]), b=pos(B[l[1]]); line(ctx,a[0],a[1],b[0],b[1],l[2]?L:L2,l[2]?2:1,l[2]?null:[5,4]); });
    B.forEach(function(b){ var p=pos(b), z=Z[b[4]]; ctx.beginPath(); ctx.arc(p[0],p[1],p[2],0,7); ctx.fillStyle=BG; ctx.fill(); ctx.fillStyle=z[0]; ctx.fill(); ctx.strokeStyle=z[1]; ctx.lineWidth=lw(1.4); ctx.stroke();
      text(ctx,b[0],p[0],p[1]-1/S,{size:11,weight:600,align:'center'}); text(ctx,b[1]+' м²',p[0],p[1]+13/S,{mono:1,size:9.5,color:L2,align:'center'}); });
    /* entrance & circulation */
    var en=[4.2*u,8.4*u+40]; poly(ctx,[[en[0],dh+4],[en[0]-8,dh+20],[en[0]+8,dh+20]],OR); text(ctx,'ОРЦ',en[0]+14,dh+20,{size:9,color:OR,weight:600});
    path(ctx,'M'+en[0]+' '+(dh+4)+' C'+(4.2*u)+' '+(6*u)+' '+(4*u)+' '+(4.6*u)+' '+(5.4*u)+' '+(3.6*u),OR,1.6,[7,5]);
    /* legend */
    var lx=dw+40; ['day','night','svc'].forEach(function(k,i){ var z=Z[k]; ctx.beginPath(); ctx.arc(lx+8,30+i*30,8,0,7); ctx.fillStyle=z[0]; ctx.fill(); ctx.strokeStyle=z[1]; ctx.lineWidth=lw(1.2); ctx.stroke(); text(ctx,z[2],lx+24,34+i*30,{size:10,weight:500,track:1}); });
    line(ctx,lx,128,lx+30,128,L,2); text(ctx,'Шууд холбоо',lx+40,132,{size:10,color:L2});
    line(ctx,lx,152,lx+30,152,L2,1,[5,4]); text(ctx,'Сул холбоо',lx+40,156,{size:10,color:L2});
    line(ctx,lx,176,lx+30,176,OR,1.6,[7,5]); text(ctx,'Хөдөлгөөний урсгал',lx+40,180,{size:10,color:L2});
    sheetLabel(ctx,0,dh+80,'03','ФУНКЦИЙН ДИАГРАММ','Масштабгүй');
    ctx.restore(); vignette(ctx,W,H);
  }

  /* ---------- 04 Review — plan with redline markups and revision tags ---------- */
  function cloud(ctx,x,y,w,h,r){
    ctx.beginPath(); var n,i,s;
    n=Math.max(2,Math.round(w/(2*r))); s=w/n; for(i=0;i<n;i++) ctx.arc(x+s*(i+.5),y,s/2,Math.PI,0);
    n=Math.max(2,Math.round(h/(2*r))); s=h/n; for(i=0;i<n;i++) ctx.arc(x+w,y+s*(i+.5),s/2,-Math.PI/2,Math.PI/2);
    n=Math.max(2,Math.round(w/(2*r))); s=w/n; for(i=n-1;i>=0;i--) ctx.arc(x+s*(i+.5),y+h,s/2,0,Math.PI);
    n=Math.max(2,Math.round(h/(2*r))); s=h/n; for(i=n-1;i>=0;i--) ctx.arc(x,y+s*(i+.5),s/2,Math.PI/2,Math.PI*1.5);
    ctx.strokeStyle=OR; ctx.lineWidth=lw(1.6); ctx.stroke(); }
  function delta(ctx,x,y,n){ poly(ctx,[[x,y-9/S],[x+9/S,y+7/S],[x-9/S,y+7/S]],BG,OR,1.4); text(ctx,n,x,y+4.5/S,{mono:1,size:9,color:OR,align:'center',weight:600}); }
  function s04(ctx,W,H){
    board(ctx,W,H);
    var u=40, dw=12*u, dh=8.4*u; frame(ctx,W,H,dw+260,dh+200,.64,.76,.56,.47);
    ctx.translate(130,90);
    plan(ctx,u,{labels:1,dims:1,poche:'rgba(236,232,225,.85)'});
    cloud(ctx,4.4*u,-.9*u,7.4*u,4.6*u,14); delta(ctx,11.9*u,-.9*u,'1');
    cloud(ctx,-.7*u,4.4*u,2.6*u,4.4*u,12); delta(ctx,-.7*u,4.4*u,'2');
    text(ctx,'Зочны өрөөг 600 мм өргөтгөх',12.4*u,.2*u,{size:11,color:OR,weight:600});
    text(ctx,'Цонхны хэмжээг нэмэгдүүлэх',12.4*u,.2*u+16,{size:11,color:OR,weight:600});
    text(ctx,'АЦӨ-д цонх нэмэх',-1*u,9.6*u+30,{size:11,color:OR,weight:600,align:'left'});
    path(ctx,'M'+(12.3*u)+' '+(.1*u)+' Q'+(12.1*u)+' '+(1.2*u)+' '+(11*u)+' '+(1.6*u),OR,1.2);
    /* revision table */
    var tx=dw+60, ty=4.8*u; rect(ctx,tx,ty,170,74,L3,.8);
    [['№','ЗАСВАР','ОГНОО'],['1','Зочны өрөө','—'],['2','АЦӨ цонх','—']].forEach(function(row,i){ line(ctx,tx,ty+(i+1)*22,tx+170,ty+(i+1)*22,L4,.6);
      text(ctx,row[0],tx+10,ty+15+i*22,{mono:1,size:9,color:i?OR:L2}); text(ctx,row[1],tx+32,ty+15+i*22,{size:9.5,color:i?L:L2}); text(ctx,row[2],tx+136,ty+15+i*22,{mono:1,size:9,color:L2}); });
    sheetLabel(ctx,-80,dh+130,'04','ЗАСВАРЫН ТЭМДЭГЛЭЛ','1 : 100');
    ctx.restore(); vignette(ctx,W,H);
  }

  /* ---------- 05 Façade — south elevation with cladding, shadows, entourage ---------- */
  function elevation(ctx,u,o){
    var w=12*u, gz=0, z1=3.3*u, z2=6.6*u, zp=7.2*u;
    function Y(z){ return -z; }
    /* ground */
    hatch(ctx,rclip(-4*u,0,w+8*u,.8*u),45,6,L4,.7); line(ctx,-4*u,0,w+4*u,0,L,2.4);
    /* body */
    rect(ctx,0,Y(z2),w,z2,null,0,'rgba(236,232,225,.04)');
    /* upper storey timber cladding */
    ctx.save(); ctx.beginPath(); ctx.rect(0,Y(z2),w,z2-z1); ctx.clip(); for(var x=.12*u;x<w;x+=.18*u) line(ctx,x,Y(z2),x,Y(z1),L4,.6); ctx.restore();
    /* parapet & slab edge */
    rect(ctx,-.15*u,Y(zp),w+.3*u,zp-z2,L,1.6,'rgba(236,232,225,.06)'); line(ctx,0,Y(z1),w,Y(z1),L2,1); rect(ctx,0,Y(z2),w,z2,L,2);
    /* parapet cast shadow (hatched) */
    hatch(ctx,rclip(0,Y(z2),w,.35*u),-45,4,L3,.6);
    /* openings */
    var win=[[1.2,4,2.4,1.8],[5.4,4,2.4,1.8],[9,4,1.8,1.8],[5.4,.6,4.8,2.1],[3.6,.9,1,1.2]];
    win.forEach(function(q){ var x0=q[0]*u, zb=q[1]*u, ww=q[2]*u, hh=q[3]*u;
      rect(ctx,x0,Y(zb+hh),ww,hh,null,0,'rgba(140,170,210,.12)');
      ctx.save(); ctx.beginPath(); ctx.rect(x0,Y(zb+hh),ww,hh); ctx.clip(); for(var k=0;k<3;k++){ var sx=x0+ww*(.2+k*.25); line(ctx,sx,Y(zb),sx+hh*.6,Y(zb+hh),'rgba(236,232,225,.14)',1); } ctx.restore();
      rect(ctx,x0,Y(zb+hh),ww,hh,L,1.4); rect(ctx,x0+.06*u,Y(zb+hh-.06*u),ww-.12*u,hh-.12*u,L2,.6);
      var n=Math.round(q[2]/1.2); for(k=1;k<n;k++) line(ctx,x0+ww*k/n,Y(zb),x0+ww*k/n,Y(zb+hh),L,1);
      hatch(ctx,rclip(x0,Y(zb+hh),ww,.18*u),-45,3,L3,.5); line(ctx,x0-.1*u,Y(zb),x0+ww+.1*u,Y(zb),L,1.6); });
    /* entrance door & canopy */
    rect(ctx,1.5*u,Y(2.5*u),1.3*u,2.5*u,L,1.4,'rgba(236,232,225,.08)'); line(ctx,2.6*u,Y(1.3*u),2.6*u,Y(1.05*u),L,1.6);
    rect(ctx,1.1*u,Y(2.85*u),2.1*u,.15*u,L,1.2,L); hatch(ctx,rclip(1.1*u,Y(2.7*u),2.1*u,.5*u),-45,4,L3,.5);
    /* entourage */
    if(o.people){ person(ctx,3.4*u,0,1.75*u,'rgba(236,232,225,.55)'); person(ctx,4.1*u,0,1.6*u,'rgba(236,232,225,.4)',1); person(ctx,13.4*u,0,1.75*u,'rgba(236,232,225,.45)',1); }
    if(o.trees){ treeElev(ctx,-2.4*u,0,6.5*u,3,L2); treeElev(ctx,14.6*u,0,5.2*u,5,L2); }
    /* levels */
    [[0,'±0.000'],[z1,'+3.300'],[z2,'+6.600'],[zp,'+7.200']].forEach(function(l){ line(ctx,w+.3*u,Y(l[0]),w+2.2*u,Y(l[0]),OR,.7);
      poly(ctx,[[w+2.2*u,Y(l[0])],[w+2.2*u-5/S,Y(l[0])-8/S],[w+2.2*u+5/S,Y(l[0])-8/S]],null,OR,1); text(ctx,l[1],w+2.5*u,Y(l[0])-2/S,{mono:1,size:10,color:OR}); });
    dimV(ctx,[0,Y(z1),Y(z2),Y(zp)],-1*u,['3 300','3 300','600'],0);
    dimH(ctx,[0,w],.8*u+18/S,0,['12 000'],.1*u);
  }
  function s05(ctx,W,H){
    board(ctx,W,H);
    var u=34, dw=22*u, dh=10*u; frame(ctx,W,H,dw,dh+80,.68,.7,.56,.46);
    ctx.translate(5*u,8.4*u);
    elevation(ctx,u,{people:1,trees:1});
    sheetLabel(ctx,-4*u,2.6*u,'05','ӨМНӨД ФАСАД','1 : 100');
    ctx.restore(); vignette(ctx,W,H);
  }

  /* ---------- 06 3D sketch — exploded axonometric ---------- */
  function s06(ctx,W,H){
    board(ctx,W,H);
    var u=24, c=Math.cos(Math.PI/6), s=.5;
    function P(x,y,z){ return [(x-y)*c*u,(x+y)*s*u-z*u]; }
    var dw=21*c*u*1.05, dh=28*u; frame(ctx,W,H,dw+380,dh,.66,.8,.57,.47);
    ctx.translate(8.4*c*u+160,20+20*u);
    function face(pts,fill,stroke,w){ poly(ctx,pts.map(function(p){ return P(p[0],p[1],p[2]); }),fill,stroke,w); }
    function slab(z,th,label,lx){ face([[0,0,z],[12,0,z],[12,8.4,z],[0,8.4,z]],'rgba(236,232,225,.06)',L,1.4);
      face([[0,8.4,z],[12,8.4,z],[12,8.4,z-th],[0,8.4,z-th]],'rgba(236,232,225,.14)',L,1.2); face([[12,0,z],[12,8.4,z],[12,8.4,z-th],[12,0,z-th]],'rgba(236,232,225,.1)',L,1.2);
      if(label){ var p=P(0,0,z); leader(ctx,p[0]+1,p[1],p[0]-70,p[1]-26,label,{shelf:90}); } }
    function walls(z,hgt){ /* outer walls as thin boxes showing openings on visible faces */
      face([[0,8.4,z],[12,8.4,z],[12,8.4,z+hgt],[0,8.4,z+hgt]],'rgba(236,232,225,.07)',L,1.2);
      face([[12,0,z],[12,8.4,z],[12,8.4,z+hgt],[12,0,z+hgt]],'rgba(236,232,225,.04)',L,1.2);
      [[0,0],[12,0],[0,8.4]].forEach(function(q){ var a=P(q[0],q[1],z), b=P(q[0],q[1],z+hgt); line(ctx,a[0],a[1],b[0],b[1],q[0]===0&&q[1]===0?L3:L,q[0]===0&&q[1]===0?.8:1.2,q[0]===0&&q[1]===0?[5,4]:null); });
      var a=P(0,0,z+hgt), b=P(12,0,z+hgt), d=P(0,8.4,z+hgt); line(ctx,a[0],a[1],b[0],b[1],L,1.2); line(ctx,a[0],a[1],d[0],d[1],L,1.2);
      [[1.2,3.6],[5.4,7.8],[9,10.8]].forEach(function(w){ face([[w[0],8.4,z+hgt*.25],[w[1],8.4,z+hgt*.25],[w[1],8.4,z+hgt*.82],[w[0],8.4,z+hgt*.82]],'rgba(140,170,210,.15)',L,1); });
      [[1.2,3],[4.5,7]].forEach(function(w){ face([[12,w[0],z+hgt*.25],[12,w[1],z+hgt*.25],[12,w[1],z+hgt*.82],[12,w[0],z+hgt*.82]],'rgba(140,170,210,.12)',L,1); });
      /* interior partitions */
      [[[4.2,0],[4.2,4.2]],[[0,4.2],[12,4.2]],[[8.4,4.2],[8.4,8.4]]].forEach(function(l){ var p1=P(l[0][0],l[0][1],z), p2=P(l[1][0],l[1][1],z); line(ctx,p1[0],p1[1],p2[0],p2[1],L2,1.6); });
    }
    /* alignment lines between exploded layers */
    [[0,8.4],[12,8.4],[12,0]].forEach(function(q){ var a=P(q[0],q[1],-1), b=P(q[0],q[1],19.5); line(ctx,a[0],a[1],b[0],b[1],L4,.7,[3,4]); });
    slab(-.6,.6,'СУУРЬ, ШАЛ');
    walls(0,3.3);
    slab(6.8,.3,'2-р ДАВХРЫН ХУЧИЛТ'); walls(6.8,3.3);
    slab(14.4,.4,'ДЭЭВЭР, ДУЛААЛГА');
    var p=P(12,8.4,0); leader(ctx,p[0],p[1]-40,p[0]+80,p[1]-70,'1-р ДАВХАР',{shelf:80}); p=P(12,8.4,6.8); leader(ctx,p[0],p[1]-40,p[0]+80,p[1]-70,'2-р ДАВХАР',{shelf:80});
    var a=P(0,9.8,-.6), b=P(12,9.8,-.6); line(ctx,a[0],a[1],b[0],b[1],OR,.8); tick(ctx,a[0],a[1]); tick(ctx,b[0],b[1]);
    text(ctx,'12 000',(a[0]+b[0])/2-14,(a[1]+b[1])/2+16,{mono:1,size:10,color:OR,align:'center'});
    sheetLabel(ctx,-8.4*c*u,7*u,'06','ЗАДАРГАА АКСОНОМЕТР','Масштабгүй');
    ctx.restore(); vignette(ctx,W,H);
  }

  /* ---------- 07 Approval — clay model render on a site plinth ---------- */
  function s07(ctx,W,H){
    ctx.fillStyle=grad(ctx,0,H,[[0,'#8d8a85'],[.55,'#b9b5ae'],[1,'#77736d']]); ctx.fillRect(0,0,W,H);
    glow(ctx,W*.5,H*.42,Math.max(W,H)*.55,'rgba(255,255,255,.28)');
    var u=Math.min(H*.026,W*.03), c=Math.cos(Math.PI/6), s=.5, ox=W>H?W*.57:W*.5, oy=W>H?H*.56:H*.66;
    function P(x,y,z){ return [ox+(x-y-3.6)*c*u,oy+(x+y-10.2)*s*u-z*u]; }
    function face(pts,fill,stroke){ var q=pts.map(function(p){ return P(p[0],p[1],p[2]); }); ctx.beginPath(); q.forEach(function(p,k){ k?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]); }); ctx.closePath(); ctx.fillStyle=fill; ctx.fill(); if(stroke){ ctx.strokeStyle=stroke; ctx.lineWidth=1; ctx.stroke(); } }
    /* plinth */
    var X0=-9,X1=21,Y0=-8,Y1=17;
    face([[X0,Y1,0],[X1,Y1,0],[X1,Y1,-1.4],[X0,Y1,-1.4]],'#cfcac2'); face([[X1,Y0,0],[X1,Y1,0],[X1,Y1,-1.4],[X1,Y0,-1.4]],'#aaa59d');
    face([[X0,Y0,0],[X1,Y0,0],[X1,Y1,0],[X0,Y1,0]],'#e4e0d9');
    /* paths & plot line */
    face([[11,8.4,0.01],[13.6,8.4,0.01],[13.6,Y1,0.01],[11,Y1,0.01]],'#d8d3cb');
    /* soft shadow of the house (sun from upper left) */
    ctx.save(); ctx.filter='blur('+Math.round(u*.5)+'px)';
    face([[0,8.4,0],[12,8.4,0],[12,0,0],[17,4,0],[17,12.4,0],[5,12.4,0]],'rgba(60,55,50,.35)'); ctx.restore();
    /* trees: clay spheres */
    function tree(x,y,r){ var b=P(x,y,0), t=P(x,y,r*2.4); ctx.save(); ctx.filter='blur('+Math.round(u*.4)+'px)'; ctx.fillStyle='rgba(60,55,50,.28)'; ctx.beginPath(); ctx.ellipse(b[0]+r*u*1.4,b[1]+r*u*.5,r*u*1.4,r*u*.7,0,0,7); ctx.fill(); ctx.restore();
      ctx.strokeStyle='#d8d3cb'; ctx.lineWidth=Math.max(1,u*.18); ctx.beginPath(); ctx.moveTo(b[0],b[1]); ctx.lineTo(t[0],t[1]); ctx.stroke();
      var g=ctx.createRadialGradient(t[0]-r*u*.4,t[1]-r*u*.4,r*u*.1,t[0],t[1],r*u*1.1); g.addColorStop(0,'#fbf9f5'); g.addColorStop(1,'#bdb7ae'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(t[0],t[1],r*u,0,7); ctx.fill(); }
    tree(-5,13,1.6); tree(-6,2,1.3); tree(17,-4,1.4);
    /* house volume */
    face([[0,8.4,0],[12,8.4,0],[12,8.4,7.2],[0,8.4,7.2]],'#f2efe9');
    face([[12,0,0],[12,8.4,0],[12,8.4,7.2],[12,0,7.2]],'#c9c3b9');
    face([[0,0,7.2],[12,0,7.2],[12,8.4,7.2],[0,8.4,7.2]],'#faf8f4');
    face([[.4,.4,7.2],[11.6,.4,7.2],[11.6,8,7.2],[.4,8,7.2]],'#e8e4dd');
    /* ambient occlusion at the base */
    var a=P(0,8.4,0), b=P(12,8.4,0), d=P(12,0,0); ctx.save(); ctx.filter='blur('+Math.round(u*.25)+'px)'; ctx.strokeStyle='rgba(50,45,40,.35)'; ctx.lineWidth=u*.3;
    ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.lineTo(d[0],d[1]); ctx.stroke(); ctx.restore();
    /* glazing: dark recessed glass with sky reflection */
    function glass(pts){ var q=pts.map(function(p){ return P(p[0],p[1],p[2]); }); var g=ctx.createLinearGradient(q[0][0],q[2][1],q[0][0],q[0][1]); g.addColorStop(0,'#6f7c88'); g.addColorStop(1,'#2d343b');
      ctx.beginPath(); q.forEach(function(p,k){ k?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]); }); ctx.closePath(); ctx.fillStyle=g; ctx.fill(); ctx.strokeStyle='rgba(255,255,255,.5)'; ctx.lineWidth=1; ctx.stroke(); }
    [[1.2,3.6,4,5.8],[5.4,7.8,4,5.8],[9,10.8,4,5.8],[5.4,10.2,.6,2.7],[1.5,2.8,0,2.5]].forEach(function(w){ glass([[w[0],8.4,w[2]],[w[1],8.4,w[2]],[w[1],8.4,w[3]],[w[0],8.4,w[3]]]); });
    [[1.2,3,4,5.8],[4.5,7,4,5.8],[1.5,6.5,.6,2.7]].forEach(function(w){ glass([[12,w[0],w[2]],[12,w[1],w[2]],[12,w[1],w[3]],[12,w[0],w[3]]]); });
    face([[0,8.4,3.25],[12,8.4,3.25],[12,8.4,3.4],[0,8.4,3.4]],'#dcd7cf'); face([[12,0,3.25],[12,8.4,3.25],[12,8.4,3.4],[12,0,3.4]],'#b5aea4');
    /* scale figures in clay */
    function fig(x,y,f){ var p=P(x,y,0), h=1.75*u; person(ctx,p[0],p[1],h,'#f4f1ec',f); }
    S=1; fig(4,11,0); fig(5,11.6,1); fig(13,10,1);
    /* approval stamp */
    var st=P(12,0,7.2); var sx=st[0]+u*3, sy=st[1]-u*2.2, R=u*1.4;
    ctx.beginPath(); ctx.arc(sx,sy,R,0,7); ctx.fillStyle='rgba(247,153,30,.14)'; ctx.fill(); ctx.strokeStyle=OR; ctx.lineWidth=2; ctx.stroke();
    ctx.beginPath(); ctx.arc(sx,sy,R*.82,0,7); ctx.lineWidth=1; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx-R*.38,sy); ctx.lineTo(sx-R*.08,sy+R*.32); ctx.lineTo(sx+R*.42,sy-R*.32); ctx.lineWidth=3; ctx.stroke();
    ctx.fillStyle=OR; ctx.font='600 '+Math.round(u*.42)+'px '+SANS; ctx.textAlign='center'; ctx.fillText('БАТЛАГДСАН',sx,sy+R+u*.6);
  }

  /* ---------- 08 Working drawings — ground-floor plan with furniture, dimensions, title block ---------- */
  function s08(ctx,W,H){
    board(ctx,W,H);
    var u=40, dw=12*u, dh=8.4*u; frame(ctx,W,H,dw+330,dh+200,.66,.78,.56,.47);
    ctx.translate(130,90);
    plan(ctx,u,{labels:1,dims:1,furniture:1});
    /* section cut markers */
    [[-1.8*u,6.1*u,0],[13.6*u,6.1*u,1]].forEach(function(m){ line(ctx,m[0],m[1],m[0]+(m[2]?-.6:.6)*u,m[1],L,2); poly(ctx,[[m[0],m[1]],[m[0]-6/S,m[1]-12/S],[m[0]+6/S,m[1]-12/S]],L); text(ctx,'А',m[0],m[1]-16/S,{size:10,weight:600,align:'center'}); });
    line(ctx,-1.2*u,6.1*u,13*u,6.1*u,L3,.6,[16,4,3,4]);
    northArrow(ctx,dw+2.4*u,-.5*u,15);
    /* title block */
    var tx=dw+1.6*u, ty=4.6*u, tw=200, rows=[['ТӨСӨЛ','Амины орон сууц'],['ХУУДАС','АР-03'],['МАСШТАБ','1 : 100'],['ҮЕ ШАТ','Ажлын зураг']];
    rect(ctx,tx,ty,tw,rows.length*26+34,L2,1);
    text(ctx,'PRIME SPATIAL PLAN',tx+10,ty+20,{size:10,weight:700,track:1.5});
    rows.forEach(function(r,i){ var y=ty+34+i*26; line(ctx,tx,y,tx+tw,y,L4,.7); text(ctx,r[0],tx+10,y+16,{mono:1,size:8.5,color:L2}); text(ctx,r[1],tx+80,y+16,{size:10,weight:500}); });
    scaleBar(ctx,tx,ty+rows.length*26+64,40,5,1);
    sheetLabel(ctx,-80,dh+140,'08','1-Р ДАВХРЫН ПЛАН','1 : 100');
    ctx.restore(); vignette(ctx,W,H);
  }

  /* ---------- 09 Check — wall section detail 1:20 with checked callouts ---------- */
  function s09(ctx,W,H){
    board(ctx,W,H);
    var dw=760, dh=560; frame(ctx,W,H,dw,dh,.66,.78,.56,.47);
    var gx=60, gy=430, k=.9;
    /* ground */
    hatch(ctx,rclip(0,gy,dw*.62,90),45,7,L4,.8); line(ctx,0,gy,dw*.62,gy,L,2);
    /* foundation & footing */
    rect(ctx,gx+40,gy-20,110,130,L,1.6); concrete(ctx,gx+40,gy-20,110,130,3); rect(ctx,gx+20,gy+110,150,40,L,1.6); concrete(ctx,gx+20,gy+110,150,40,4);
    /* wall layers (outside → inside): cladding, cavity, insulation, block, plaster */
    var L0=gx+40, layers=[[8,'clad'],[10,'gap'],[40,'ins'],[52,'block'],[4,'pl']], x=L0, top=60;
    layers.forEach(function(l){ var w=l[0];
      if(l[1]==='clad'){ rect(ctx,x,top,w,gy-20-top,L,1.2); for(var yy=top;yy<gy-20;yy+=16) line(ctx,x,yy,x+w,yy,L3,.5); }
      if(l[1]==='ins'){ rect(ctx,x,top,w,gy-top+10,L,1); insulation(ctx,x,top,w,gy-top+10,'rgba(247,200,140,.75)'); }
      if(l[1]==='block'){ rect(ctx,x,top+14,w,gy-20-top-14,L,1.8); hatch(ctx,rclip(x,top+14,w,gy-20-top-14),45,6,L2,.7); hatch(ctx,rclip(x,top+14,w,gy-20-top-14),-45,6,L3,.6); }
      if(l[1]==='pl'){ rect(ctx,x,top+14,w,gy-20-top-14,L2,.8); }
      x+=w; });
    /* floor slabs */
    var sx=x, slabs=[[gy-20,24],[gy-216,22]];
    slabs.forEach(function(s,i){ rect(ctx,L0+58,s[0]-s[1],dw*.62-L0-58,s[1],L,1.6); concrete(ctx,L0+58,s[0]-s[1],dw*.62-L0-58,s[1],10+i);
      rect(ctx,sx,s[0]-s[1]-12,dw*.62-sx,8,L2,.8); });
    /* roof: slab, insulation, membrane, parapet */
    rect(ctx,L0+58,top+14,dw*.62-L0-58,20,L,1.6); concrete(ctx,L0+58,top+14,dw*.62-L0-58,20,12);
    rect(ctx,L0+58,top-26,dw*.62-L0-58,40,L,1); insulation(ctx,L0+58,top-26,dw*.62-L0-58,40,'rgba(247,200,140,.75)');
    line(ctx,L0,top-30,dw*.62,top-30,L,2); rect(ctx,L0-6,top-54,60,24,L,1.4,'rgba(236,232,225,.1)');
    /* window in upper storey */
    var wy0=gy-216-22-160, wy1=gy-216-22-40; rect(ctx,L0,wy0,110,wy1-wy0,null,0,BG); line(ctx,L0,wy0,L0+110,wy0,L,1.4); line(ctx,L0,wy1,L0+110,wy1,L,1.4);
    rect(ctx,L0+40,wy0,22,wy1-wy0,L,1.2,'rgba(140,170,210,.15)'); line(ctx,L0+51,wy0,L0+51,wy1,L2,.6);
    rect(ctx,L0-10,wy1,70,6,L,1.2);
    /* callouts */
    var cx=dw*.66;
    [[L0+4,180,'Гадна өнгөлгөө, модон хавтан'],[L0+28,240,'Агаарын завсар 30 мм'],[L0+38,300,'Дулаалга, эрдэс хөвөн 150 мм'],[L0+90,360,'Ханын блок 300 мм'],[L0+150,gy-30,'Шалны хучилт, бетон 200 мм'],[L0+150,top-6,'Дээврийн дулаалга 200 мм'],[L0+90,gy+60,'Суурь, цутгамал бетон']].forEach(function(c,i){
      leader(ctx,c[0],c[1],cx,90+i*52,c[2],{shelf:150}); check(ctx,cx+170,85+i*52); });
    /* levels */
    [[gy-20,'±0.000'],[gy-216,'+3.300']].forEach(function(l){ line(ctx,10,l[0],L0-10,l[0],OR,.7); poly(ctx,[[22,l[0]],[17,l[0]-8],[27,l[0]-8]],null,OR,1); text(ctx,l[1],2,l[0]-12,{mono:1,size:10,color:OR}); });
    sheetLabel(ctx,10,dh-10,'09','ХАНЫН ЗҮСЭЛТ, ЗАНГИЛАА','1 : 20');
    ctx.restore(); vignette(ctx,W,H);
  }

  /* ---------- 10 Handover / Studio — urban master plan: street hierarchy, land use, river park ---------- */
  function s10(ctx,W,H){
    board(ctx,W,H);
    var dw=1000, dh=640, r=rng(1010), port=W<H;
    if(port){ S=Math.max(W/dw,H*.74/dh); ctx.save(); ctx.translate(W/2-dw/2*S,H*.1); ctx.scale(S,S); } /* portrait: the map fills the screen */
    else frame(ctx,W,H,dw+230,dh+70,.7,.76,.55,.47);
    var LU={res:['rgba(226,190,140,.30)','rgba(226,190,140,.75)','Орон сууц'],mix:['rgba(247,153,30,.42)',OR,'Холимог зориулалт'],
            civ:['rgba(140,170,225,.34)','rgba(160,190,235,.9)','Нийгмийн үйлчилгээ'],park:['rgba(110,165,115,.26)','rgba(140,195,140,.8)','Ногоон байгууламж'],
            water:['rgba(90,140,200,.45)','rgba(150,190,235,.85)','Гол, ус']};
    /* river centre line in sheet coordinates */
    var RIV=[]; for(var t=0;t<=1;t+=.02){ RIV.push([-40+t*1080, 520-t*190+38*Math.sin(t*7.5)+14*Math.sin(t*19)]); }
    function riverDist(x,y){ var m=1e9; RIV.forEach(function(p){ var d=Math.hypot(p[0]-x,p[1]-y); if(d<m) m=d; }); return m; }
    var hub=[560,250], ang=-12*Math.PI/180, ca=Math.cos(ang), sa=Math.sin(ang), C=[dw/2,dh/2];
    function toSheet(x,y){ var dx=x-C[0], dy=y-C[1]; return [C[0]+dx*ca-dy*sa, C[1]+dx*sa+dy*ca]; }
    ctx.save(); ctx.beginPath(); ctx.rect(0,0,dw,dh); ctx.clip();
    /* green river corridor under everything */
    function riverPath(off){ var p=new Path2D(); RIV.forEach(function(q,i){ i?p.lineTo(q[0],q[1]+off):p.moveTo(q[0],q[1]+off); }); return p; }
    ctx.lineCap='round'; ctx.strokeStyle=LU.park[0]; ctx.lineWidth=150; ctx.stroke(riverPath(0));
    /* rotated urban grid */
    ctx.save(); ctx.translate(C[0],C[1]); ctx.rotate(ang); ctx.translate(-C[0],-C[1]);
    var xs=[-260], ys=[-220], wx=[118,96,124,104,132,98,116,108,126,100,114,122,96,118], wy=[104,92,118,98,110,94,116,102,108];
    wx.forEach(function(w){ xs.push(xs[xs.length-1]+w); }); wy.forEach(function(h){ ys.push(ys[ys.length-1]+h); });
    var site=null;
    for(var i=0;i<xs.length-1;i++) for(var j=0;j<ys.length-1;j++){
      var ri=i%4===0, rj=j%3===0, swL=ri?9:4.5, swT=rj?9:4.5, swR=(i+1)%4===0?9:4.5, swB=(j+1)%3===0?9:4.5;
      var bx=xs[i]+swL, by=ys[j]+swT, bw=xs[i+1]-xs[i]-swL-swR, bh=ys[j+1]-ys[j]-swT-swB;
      var c=toSheet(bx+bw/2,by+bh/2), rd=riverDist(c[0],c[1]), hd=Math.hypot(c[0]-hub[0],c[1]-hub[1]);
      if(c[0]<-80||c[0]>dw+80||c[1]<-80||c[1]>dh+80) continue;
      if(rd<52) continue;
      var use = rd<92 ? 'park' : hd<70 ? 'civ' : hd<170 ? 'mix' : 'res';
      if(use==='res' && r()<.08) use='park'; if(use==='res' && r()<.07) use='civ';
      var lu=LU[use];
      rect(ctx,bx,by,bw,bh,L4,.6);
      if(use==='park'){ rect(ctx,bx,by,bw,bh,null,0,lu[0]); for(var k=0;k<bw*bh/420;k++){ ctx.beginPath(); ctx.arc(bx+6+r()*(bw-12),by+6+r()*(bh-12),2.4+r()*2.6,0,7); ctx.strokeStyle=lu[1]; ctx.lineWidth=lw(.6); ctx.stroke(); }
        path(ctx,'M'+(bx+4)+' '+(by+bh*.7)+' Q'+(bx+bw*.5)+' '+(by+bh*.2)+' '+(bx+bw-4)+' '+(by+bh*.45),'rgba(236,232,225,.35)',.8,[3,3]); continue; }
      var ins=5;
      if(use==='res' && r()<.5){ /* perimeter block with courtyard */
        var d2=Math.min(bw,bh)*.26; ctx.beginPath(); ctx.rect(bx+ins,by+ins,bw-2*ins,bh-2*ins); ctx.rect(bx+ins+d2,by+ins+d2,bw-2*ins-2*d2,bh-2*ins-2*d2);
        ctx.fillStyle=lu[0]; ctx.fill('evenodd'); ctx.strokeStyle=lu[1]; ctx.lineWidth=lw(.8); ctx.stroke();
        if(r()<.5){ ctx.beginPath(); ctx.arc(bx+bw/2,by+bh/2,3,0,7); ctx.strokeStyle='rgba(140,195,140,.7)'; ctx.stroke(); }
      } else if(use==='res'){ /* slab / point buildings */
        var n=2+Math.floor(r()*3); for(k=0;k<n;k++){ var w2=(bw-2*ins)/n-6, h2=bh*.32+r()*bh*.2, x2=bx+ins+k*((bw-2*ins)/n)+3, y2=by+ins+(k%2?bh-2*ins-h2:0);
          rect(ctx,x2,y2,w2,h2,lu[1],.8,lu[0]); } }
      else { /* mixed / civic: large footprints around a court */
        rect(ctx,bx+ins,by+ins,bw-2*ins,bh*.42,lu[1],.9,lu[0]); rect(ctx,bx+ins,by+bh*.58,bw*.56,bh*.42-ins,lu[1],.9,lu[0]);
        rect(ctx,bx+bw*.62,by+bh*.58,bw*.38-ins,bh*.42-ins,lu[1],.9,lu[0]);
        if(use==='civ'){ ctx.beginPath(); ctx.arc(bx+bw*.8,by+bh*.25,5,0,7); ctx.strokeStyle=lu[1]; ctx.lineWidth=lw(1); ctx.stroke(); line(ctx,bx+bw*.8-3,by+bh*.25,bx+bw*.8+3,by+bh*.25,lu[1],1); line(ctx,bx+bw*.8,by+bh*.25-3,bx+bw*.8,by+bh*.25+3,lu[1],1); } }
      if(r()<.35) text(ctx,String([5,9,12,16][Math.floor(r()*4)]),bx+bw-10,by+bh-8,{mono:1,size:8,color:L2,align:'right'});
      if(!site && use==='res' && c[0]>700 && c[0]<840 && c[1]>140 && c[1]<300) site=[bx,by,bw,bh];
    }
    /* boulevards: centre lines with median trees */
    for(i=0;i<xs.length;i+=4){ line(ctx,xs[i],ys[0],xs[i],ys[ys.length-1],L3,.8,[10,6]); for(var yy=ys[0];yy<ys[ys.length-1];yy+=16){ ctx.beginPath(); ctx.arc(xs[i],yy,1.6,0,7); ctx.fillStyle='rgba(140,195,140,.6)'; ctx.fill(); } }
    for(j=0;j<ys.length;j+=3){ line(ctx,xs[0],ys[j],xs[xs.length-1],ys[j],L3,.8,[10,6]); }
    if(site){ hatch(ctx,rclip(site[0],site[1],site[2],site[3]),45,4,OR,.8); rect(ctx,site[0],site[1],site[2],site[3],OR,2); }
    ctx.restore();
    /* river on top: water body and banks */
    ctx.strokeStyle=LU.water[0]; ctx.lineWidth=34; ctx.stroke(riverPath(0));
    ctx.strokeStyle=LU.water[1]; ctx.lineWidth=lw(1); ctx.stroke(riverPath(-17)); ctx.stroke(riverPath(17));
    path(ctx,riverPath(-40),'rgba(236,232,225,.35)',.8,[4,4]); path(ctx,riverPath(40),'rgba(236,232,225,.35)',.8,[4,4]);
    /* bridges */
    [[.38],[.7]].forEach(function(b){ var p=RIV[Math.round(b[0]*(RIV.length-1))]; rect(ctx,p[0]-9,p[1]-26,18,52,L,1.2,BG); });
    /* walking radius around the centre */
    ctx.beginPath(); ctx.arc(hub[0],hub[1],150,0,7); ctx.strokeStyle=OR; ctx.lineWidth=lw(1.2); ctx.setLineDash([8/S,6/S]); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(hub[0],hub[1],4,0,7); ctx.fillStyle=OR; ctx.fill();
    ctx.restore();
    text(ctx,'500 м · 6 мин алхалт',hub[0]+108,hub[1]-112,{mono:1,size:10,color:OR});
    if(site){ var sc=toSheet(site[0]+site[2],site[1]); leader(ctx,sc[0]-6,sc[1]+12,sc[0]+70,sc[1]-46,'ТӨСЛИЙН ТАЛБАЙ',{color:OR,tcolor:OR,shelf:110}); }
    text(ctx,'ГОЛ',RIV[30][0],RIV[30][1]+4,{size:10,weight:600,color:'rgba(190,215,240,.95)',align:'center',track:3});
    rect(ctx,0,0,dw,dh,L2,1);
    if(port){ northArrow(ctx,dw/2+W/S/2-40,40,16); ctx.restore(); vignette(ctx,W,H); return; }
    /* legend */
    var lx=dw+34, ly=24; text(ctx,'ГАЗАР АШИГЛАЛТ',lx,ly,{size:10,weight:600,track:1.5}); line(ctx,lx,ly+8,lx+180,ly+8,L3,.8);
    ['res','mix','civ','park','water'].forEach(function(k,i){ var y=ly+28+i*26; rect(ctx,lx,y-10,22,14,LU[k][1],.9,LU[k][0]); text(ctx,LU[k][2],lx+32,y+1,{size:10.5,color:L}); });
    var y2=ly+28+5*26+10;
    line(ctx,lx,y2,lx+22,y2,L3,.8,[10,6]); text(ctx,'Гол гудамж',lx+32,y2+4,{size:10.5,color:L2});
    line(ctx,lx,y2+24,lx+22,y2+24,OR,1.2,[8,6]); text(ctx,'Алхалтын радиус',lx+32,y2+28,{size:10.5,color:L2});
    rect(ctx,lx,y2+40,22,14,OR,2); text(ctx,'Төслийн талбай',lx+32,y2+51,{size:10.5,color:L2});
    text(ctx,'12',lx+11,y2+80,{mono:1,size:9,color:L2,align:'center'}); text(ctx,'Давхрын тоо',lx+32,y2+80,{size:10.5,color:L2});
    northArrow(ctx,lx+30,dh-110,16); scaleBar(ctx,lx,dh-40,36,4,50);
    sheetLabel(ctx,14,dh+44,'10','ЕРӨНХИЙ ТӨЛӨВЛӨГӨӨ','1 : 5 000');
    ctx.restore(); vignette(ctx,W,H);
  }

  var PAINT=[s01,s02,s03,s04,s05,s06,s07,s08,s09,s10], cache={};
  function dims(){ var d=Math.min(window.devicePixelRatio||1,1.5), w=innerWidth*d, h=innerHeight*d, cap=Math.sqrt(1800000/(w*h));
    if(cap<1){ w*=cap; h*=cap; } return {w:Math.round(w), h:Math.round(h)}; }
  /* full-viewport scene i, painted once per viewport size */
  function scene(i){ var s=dims(), k=i+':'+s.w+'x'+s.h;
    if(!cache[k]){ var c=document.createElement('canvas'); c.width=s.w; c.height=s.h; var ctx=c.getContext('2d'); S=1; PAINT[i](ctx,s.w,s.h); S=1; cache[k]=c; }
    return cache[k]; }
  /* draw src covering a viewport-sized box; canvas may be shorter than the viewport (a hero), showing its top part */
  function blit(canvas,src,cssW,cssH,viewH){
    var d=Math.min(window.devicePixelRatio||1,1.5); viewH=viewH||cssH;
    canvas.width=Math.round(cssW*d); canvas.height=Math.round(cssH*d);
    var vw=canvas.width, vh=Math.round(viewH*d), ctx=canvas.getContext('2d'), sc=Math.max(vw/src.width,vh/src.height),
        w=src.width*sc, h=src.height*sc; ctx.drawImage(src,(vw-w)/2,(vh-h)*.55,w,h);
  }
  window.PSPScenes={PAINT:PAINT, N:PAINT.length, scene:scene, blit:blit, clear:function(){ cache={}; }};
})();
