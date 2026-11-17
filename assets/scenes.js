/* Prime Spatial Plan — the site's graphics: the studio's kindergarten building, exported from its Revit model
   (assets/model.js), drawn in orthographic projection with hidden faces removed, like a Revit/SketchUp
   model-space view. Every homepage step is a state (camera, how many storeys are built, how far the storeys
   are exploded, which drawing style); the homepage tweens between states so the empty plot turns into the
   building storey by storey. Subpage heroes use the same states as still images. */
(function(){
  var MONO='Menlo, Consolas, monospace', SANS='Onest, Arial, sans-serif', OR='#F7991E', ORc='247,153,30';
  function hx(c){ if(c.charAt(0)==='r'){ var m=c.match(/[\d.]+/g); return [+m[0],+m[1],+m[2]]; } c=c.replace('#',''); return [parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)]; }
  function mixc(a,b,t){ var A=hx(a),B=hx(b); return 'rgb('+Math.round(A[0]+(B[0]-A[0])*t)+','+Math.round(A[1]+(B[1]-A[1])*t)+','+Math.round(A[2]+(B[2]-A[2])*t)+')'; }
  function L(a,b,t){ return a+(b-a)*t; }
  var PAL={
    dark:{bg:'#16243b',side:'#1b2b46',top:'#223454',site:'#1b2c48',foot:'#232a3a',glass:'#21395a',ink:'232,239,250'},
    light:{bg:'#eef0f3',side:'#f8f9fb',top:'#ffffff',site:'#f3f5f8',foot:'#d7dce4',glass:'#dfe7f0',ink:'22,30,46'}
  };
  var CLAY={bg:'#aaa69f',side:'#ece8e1',top:'#faf8f4',site:'#dcd8d0',foot:'#cfcac2'};
  function themeName(){ return document.documentElement.getAttribute('data-theme')==='light'?'light':'dark'; }

  /* ---------- the building (Revit export, metres; x east, y north) ---------- */
  var RAW=window.PSP_MODEL||{els:[],rooms:[],wallL1:[],colL1:[],winL1:[],doorL1:[]};
  var EX=4.6;
  function pts3(a){ var o=[]; for(var i=0;i<a.length;i+=3) o.push([a[i]/100,a[i+1]/100,a[i+2]/100]); return o; }
  function pts2(a){ return a.map(function(p){ return [p[0]/100,p[1]/100]; }); }
  var EL=RAW.els.map(function(e){
    var faces=e[4].map(function(f){ var loops=f.slice(3).map(pts3), c=[0,0,0], n=0;
      loops[0].forEach(function(p){ c[0]+=p[0]; c[1]+=p[1]; c[2]+=p[2]; n++; });
      return {n:[f[0],f[1],f[2]], l:loops, c:[c[0]/n,c[1]/n,c[2]/n]}; });
    var all=[]; faces.forEach(function(f){ f.l[0].forEach(function(p){ all.push(p); }); });
    return {c:e[0], b:e[1], z0:e[2], z1:e[3], f:faces, pts:all};
  });
  var ROOMS=RAW.rooms.map(function(r){ return {name:r[0], area:r[1], lv:r[2], p:pts2(r[3])}; });
  var WALL1=RAW.wallL1.map(pts2), COL1=RAW.colL1.map(pts2), WIN1=RAW.winL1.map(function(b){ return b; }), DOOR1=RAW.doorL1;
  var BX=(function(){ var b=[1e9,1e9,-1e9,-1e9]; WALL1.forEach(function(w){ w.forEach(function(p){ b[0]=Math.min(b[0],p[0]); b[1]=Math.min(b[1],p[1]); b[2]=Math.max(b[2],p[0]); b[3]=Math.max(b[3],p[1]); }); });
    return b[0]<1e9?b:[-20,-14,14,10]; })();
  var ZTOP=EL.reduce(function(m,e){ return Math.max(m,e.z1); },6);
  var HULL=(function(){ var pts=[]; WALL1.forEach(function(w){ w.forEach(function(p){ pts.push([p[0],p[1]]); }); }); return pts.length?hull(pts):[[BX[0],BX[1]],[BX[2],BX[1]],[BX[2],BX[3]],[BX[0],BX[3]]]; })();
  /* envelope vs interior: an element belongs to the envelope when one of its vertical faces looks out of every room */
  function inPoly(x,y,p){ var c=false; for(var i=0,j=p.length-1;i<p.length;j=i++){ if(((p[i][1]>y)!==(p[j][1]>y))&&(x<(p[j][0]-p[i][0])*(y-p[i][1])/(p[j][1]-p[i][1])+p[i][0])) c=!c; } return c; }
  function inRoom(x,y,lv){ for(var i=0;i<ROOMS.length;i++){ var r=ROOMS[i]; if(r.lv===lv&&inPoly(x,y,r.p)) return true; } return false; }
  EL.forEach(function(e){
    if(e.c==='f'){ e.ext=e.z1>5.5; return; }
    if(e.c==='c'||e.c==='b'){ e.ext=false; return; }
    var ext=false;
    e.f.forEach(function(f){ if(ext||Math.abs(f.n[2])>.3) return; var lv=f.c[2]<-.2?0:f.c[2]<3?1:2, lvRooms=ROOMS.some(function(r){ return r.lv===lv; });
      if(!lvRooms) return; var hit=[.45,1.5,3,6,10,15,25].some(function(t){ return inRoom(f.c[0]+f.n[0]*t,f.c[1]+f.n[1]*t,1)||inRoom(f.c[0]+f.n[0]*t,f.c[1]+f.n[1]*t,2); }); if(!hit) ext=true; });
    if(e.c==='s'){ var sx=0,sy=0; e.pts.forEach(function(p){ sx+=p[0]; sy+=p[1]; }); sx/=e.pts.length; sy/=e.pts.length; ext=!inRoom(sx,sy,1)&&!inRoom(sx,sy,2); }
    e.ext=ext; });
  function roomC(name,lv){ var r=ROOMS.filter(function(x){ return x.lv===lv&&x.name.indexOf(name)===0; })[0]; if(!r) return null;
    var c=[0,0]; r.p.forEach(function(p){ c[0]+=p[0]; c[1]+=p[1]; }); return [c[0]/r.p.length,c[1]/r.p.length,r]; }

  /* ---------- the site around it ---------- */
  var PLOT=[[-38,-34],[30,-34],[34,-24],[34,22],[-38,22]];
  var CTXB=[[-84,-84,-58,-58,9],[-32,-86,-6,-62,12],[8,-84,34,-60,9],[54,-76,76,-54,6],[54,-34,74,-10,9],[54,2,78,24,12],
            [52,40,80,62,6],[4,40,30,62,9],[-38,40,-12,58,12],[-86,38,-60,58,6],[-88,-22,-60,4,9],[-88,-52,-62,-34,6]];
  var CYL=[[60,-46,2.6,4],[-72,22,2.6,4.5]];
  var ROADS=[[[-170,-44],[170,-44]],[[-50,-130],[-50,130]],[[-170,31],[170,31]],[[44,-130],[44,130]]];
  var PAV=[[-30,13,4],[-17,16.5,4],[24,13,4],[25,-8,4]];
  var GREEN=[[-31,-25,10,6],[23,-22,2,2],[27,-26,2,2]];
  var TREES=[[-34,0],[-34,-10],[28,0],[28,-16],[-8,18],[6,18],[-26,-30],[20,-30]];
  var LAWNS=[[[-36,-17],[-25,-17],[-25,20],[-36,20]],[[19,-31],[32,-31],[32,20],[19,20]],[[-22,13],[16,13],[16,20],[-22,20]],[[-24,-31],[-6,-31],[-6,-21],[-24,-21]]];
  var MTREES=(function(){ var t=[], r=0; function rnd(){ r=(r*9301+49297)%233280; return r/233280; }
    for(var x=-35;x<=31;x+=5.5){ t.push([x,20.4,1.3+rnd()*.5]); if(x<-12||x>4) t.push([x,-32.4,1.2+rnd()*.5]); }
    for(var y=-28;y<=18;y+=5.5){ t.push([-36.4,y,1.3+rnd()*.5]); t.push([32.4,y,1.3+rnd()*.5]); }
    [[-30,-4],[-29,6],[26,4],[23,-14],[-20,-26],[-12,-24],[12,-24],[8,-28]].forEach(function(p){ t.push([p[0],p[1],1.4+rnd()*.6]); });
    for(x=-160;x<160;x+=8.5){ if(x>-52&&x<46) continue; t.push([x,-38.5,1.5+rnd()*.6]); t.push([x+3,26,1.5+rnd()*.6]); }
    for(x=-52;x<46;x+=7){ t.push([x,-38.5,1.4+rnd()*.5]); t.push([x+3,25.5,1.4+rnd()*.5]); }
    for(y=-120;y<120;y+=8.5){ t.push([-44.5,y,1.5+rnd()*.6]); t.push([38.5,y+3,1.5+rnd()*.6]); }
    return t; })();

  /* ---------- camera: orthographic, az around z, el above horizon ---------- */
  function cam(W,H,c){
    var port=W<H, az=c.az*Math.PI/180, el=c.el*Math.PI/180, ca=Math.cos(az), sa=Math.sin(az), ce=Math.cos(el), se=Math.sin(el);
    var k=port? W*1.02/c.span : Math.min(W*.66,H*1.08)/c.span;
    var sx=W*(port?.46:.5), sy=H*(port?.6:.47);
    function P(x,y,z){ var dx=x-c.tx, dy=y-c.ty, dz=(z||0)-c.tz, xr=dx*ca-dy*sa, yr=dx*sa+dy*ca; return [sx+xr*k, sy-(yr*se+dz*ce)*k, -yr*ce+dz*se]; }
    return {P:P,k:k,v:[-ce*sa,-ce*ca,se],W:W,H:H,port:port,el:c.el};
  }

  /* ---------- drawing primitives ---------- */
  function path(g,q){ g.beginPath(); for(var i=0;i<q.length;i++){ i?g.lineTo(q[i][0],q[i][1]):g.moveTo(q[i][0],q[i][1]); } g.closePath(); }
  function seg(g,a,b){ g.beginPath(); g.moveTo(a[0],a[1]); g.lineTo(b[0],b[1]); g.stroke(); }
  function polyline(g,q){ g.beginPath(); q.forEach(function(p,i){ i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]); }); g.stroke(); }
  function txt(g,t,x,y,o){ o=o||{}; g.save(); g.translate(x,y); if(o.rot) g.rotate(o.rot); g.font=(o.w||400)+' '+(o.s||11)+'px '+(o.mono?MONO:SANS);
    g.fillStyle=o.c; g.textAlign=o.a||'left'; g.textBaseline=o.b||'alphabetic'; if(o.tr) g.letterSpacing=o.tr+'px'; g.fillText(t,0,0); g.restore(); }
  function circleW(C,x,y,z,r,n){ var q=[]; for(var i=0;i<n;i++){ var a=i/n*Math.PI*2; q.push(C.P(x+Math.cos(a)*r,y+Math.sin(a)*r,z)); } return q; }
  function bbox(q){ return q.reduce(function(m,p){ return [Math.min(m[0],p[0]),Math.min(m[1],p[1]),Math.max(m[2],p[0]),Math.max(m[3],p[1])]; },[1e9,1e9,-1e9,-1e9]); }

  /* one convex prism with hidden faces culled; per-face detail callbacks */
  function prism(g,C,o){
    var P=C.P, v=C.v, poly=o.poly, n=poly.length, cx=0, cy=0, i;
    for(i=0;i<n;i++){ cx+=poly[i][0]; cy+=poly[i][1]; } cx/=n; cy/=n;
    g.globalAlpha=o.a==null?1:o.a; g.lineJoin='round';
    for(i=0;i<n;i++){
      var a=poly[i], b=poly[(i+1)%n], nx=b[1]-a[1], ny=-(b[0]-a[0]), mx=(a[0]+b[0])/2-cx, my=(a[1]+b[1])/2-cy;
      if(nx*mx+ny*my<0){ nx=-nx; ny=-ny; } var ln=Math.hypot(nx,ny); nx/=ln; ny/=ln;
      if(nx*v[0]+ny*v[1]<=1e-4) continue;
      var q=[P(a[0],a[1],o.z0),P(b[0],b[1],o.z0),P(b[0],b[1],o.z1),P(a[0],a[1],o.z1)];
      path(g,q); g.fillStyle=o.side(nx,ny); g.fill();
      if(o.det) o.det(g,C,a,b,o);
      path(g,q); g.strokeStyle=o.edge; g.lineWidth=o.lw||1; g.stroke();
    }
    if(v[2]>1e-4){ var t=poly.map(function(p){ return P(p[0],p[1],o.z1); }); path(g,t); g.fillStyle=o.top; g.fill();
      if(o.topDet) o.topDet(g,C,o); path(g,t); g.strokeStyle=o.edge; g.lineWidth=o.lw||1; g.stroke(); }
    g.globalAlpha=1;
  }
  function rectPoly(r){ return [[r[0],r[1]],[r[2],r[1]],[r[2],r[3]],[r[0],r[3]]]; }

  /* ---------- annotations ---------- */
  function dim(g,C,a,b,off,label,al){
    if(al<=.02) return; var A=C.P(a[0],a[1],a[2]||0), B=C.P(b[0],b[1],b[2]||0), dx=B[0]-A[0], dy=B[1]-A[1], l=Math.hypot(dx,dy); if(l<30) return;
    var nx=-dy/l*off, ny=dx/l*off, A2=[A[0]+nx,A[1]+ny], B2=[B[0]+nx,B[1]+ny];
    g.globalAlpha=al; g.strokeStyle=OR; g.lineWidth=1; seg(g,A2,B2); seg(g,A,[A2[0]+nx*.15,A2[1]+ny*.15]); seg(g,B,[B2[0]+nx*.15,B2[1]+ny*.15]);
    [A2,B2].forEach(function(p){ seg(g,[p[0]-4,p[1]+4],[p[0]+4,p[1]-4]); });
    var ang=Math.atan2(dy,dx); if(ang>Math.PI/2) ang-=Math.PI; if(ang<-Math.PI/2) ang+=Math.PI;
    txt(g,label,(A2[0]+B2[0])/2+nx*.3,(A2[1]+B2[1])/2+ny*.3,{mono:1,s:10,c:OR,a:'center',b:'middle',rot:ang}); g.globalAlpha=1;
  }
  function cloud(g,x,y,w,h,r){ g.beginPath(); var n,i,s;
    n=Math.max(2,Math.round(w/(2*r))); s=w/n; for(i=0;i<n;i++) g.arc(x+s*(i+.5),y,s/2,Math.PI,0);
    n=Math.max(2,Math.round(h/(2*r))); s=h/n; for(i=0;i<n;i++) g.arc(x+w,y+s*(i+.5),s/2,-Math.PI/2,Math.PI/2);
    n=Math.max(2,Math.round(w/(2*r))); s=w/n; for(i=n-1;i>=0;i--) g.arc(x+s*(i+.5),y+h,s/2,0,Math.PI);
    n=Math.max(2,Math.round(h/(2*r))); s=h/n; for(i=n-1;i>=0;i--) g.arc(x,y+s*(i+.5),s/2,Math.PI/2,Math.PI*1.5);
    g.strokeStyle=OR; g.lineWidth=1.6; g.stroke(); }
  function check(g,x,y){ g.beginPath(); g.arc(x,y,9,0,7); g.fillStyle='rgba('+ORc+',.18)'; g.fill(); g.strokeStyle=OR; g.lineWidth=1.3; g.stroke();
    g.beginPath(); g.moveTo(x-4,y); g.lineTo(x-1,y+3.5); g.lineTo(x+4.5,y-3.5); g.lineWidth=1.8; g.stroke(); }
  function ucs(g,C,ink){ var o=C.P(-41,-37,0), ax=[[1,0,0,'X'],[0,1,0,'Y'],[0,0,1,'Z']];
    if(o[0]<0||o[0]>C.W||o[1]<0||o[1]>C.H) return;
    g.lineWidth=1.2; ax.forEach(function(d){ var p=C.P(-41+d[0],-37+d[1],d[2]), dx=p[0]-o[0], dy=p[1]-o[1], l=Math.hypot(dx,dy); if(l<.05*C.k) return;
      var e=[o[0]+dx/l*34,o[1]+dy/l*34]; g.strokeStyle='rgba('+ink+',.85)'; seg(g,o,e); txt(g,d[3],e[0]+dx/l*9,e[1]+dy/l*9,{s:10,c:'rgba('+ink+',.85)',a:'center',b:'middle',w:600}); });
    g.strokeStyle='rgba('+ink+',.85)'; g.strokeRect(o[0]-3,o[1]-3,6,6); }
  function north(g,x,y,ink,al){ g.globalAlpha=al; g.strokeStyle='rgba('+ink+',.6)'; g.lineWidth=1; g.beginPath(); g.arc(x,y,15,0,7); g.stroke();
    g.fillStyle='rgba('+ink+',.9)'; g.beginPath(); g.moveTo(x,y-19); g.lineTo(x+5,y+7); g.lineTo(x,y+3); g.lineTo(x-5,y+7); g.closePath(); g.fill();
    txt(g,'N',x,y-24,{s:10,c:'rgba('+ink+',.9)',a:'center',w:600}); g.globalAlpha=1; }
  function sheet(g,x,y,lab,ink,al){ if(al<=.02||!lab) return; g.globalAlpha=al; var c='rgba('+ink+',.9)';
    g.strokeStyle=c; g.lineWidth=1.2; g.beginPath(); g.arc(x,y,13,0,7); g.stroke(); seg(g,[x-13,y],[x+13,y]);
    txt(g,lab[0],x,y-3,{mono:1,s:10,c:c,a:'center'}); txt(g,'АР',x,y+10,{mono:1,s:8,c:'rgba('+ink+',.55)',a:'center'});
    g.lineWidth=1.4; seg(g,[x+20,y+2],[x+250,y+2]); txt(g,lab[1],x+20,y-5,{s:12,w:600,c:c,tr:1.2}); txt(g,lab[2],x+20,y+15,{mono:1,s:10,c:'rgba('+ink+',.55)'});
    g.globalAlpha=1; }
  function leader(g,p,tx,ty,label,ink,al){ g.globalAlpha=al; g.strokeStyle='rgba('+ink+',.7)'; g.lineWidth=1;
    g.beginPath(); g.arc(p[0],p[1],2.5,0,7); g.fillStyle='rgba('+ink+',.9)'; g.fill(); seg(g,p,[tx,ty]); seg(g,[tx,ty],[tx+170,ty]);
    txt(g,label,tx+4,ty-6,{s:11,w:500,c:'rgba('+ink+',.95)'}); check(g,tx+186,ty); g.globalAlpha=1; }

  /* ---------- paper working drawing of the ground floor, from the Revit rooms and walls ---------- */
  function finishOf(name){ var n=name.toLowerCase();
    if(/коридор|гонх|үүдний|шат|танхим|хонгил/.test(n)) return 'tile';
    if(/угаал|ариун|ацө|сав|бохир|шүршүүр|гал тогоо|хөргөх/.test(n)) return 'wet';
    if(/бүлгийн|унтлаг|хувцас|тоглоом|хөгжим|спорт|эмч|өрөө/.test(n)) return 'wood';
    return 'plain'; }
  function revitPlan(g,C,ink,al){
    if(al<=.02) return; var P=C.P, k=C.k;
    function poly2(p){ return p.map(function(q){ return P(q[0],q[1],0); }); }
    g.save(); g.globalAlpha=al; g.lineWidth=1;
    ROOMS.forEach(function(r){ if(r.lv!==1) return; var q=poly2(r.p); path(g,q); g.fillStyle='#ffffff'; g.fill();
      var fin=finishOf(r.name), bb=bbox(r.p.map(function(p){ return [p[0],p[1]]; }));
      g.save(); path(g,q); g.clip();
      if(fin==='tile'){ g.strokeStyle='rgba('+ink+',.28)'; for(var x=Math.floor(bb[0]);x<=bb[2];x+=.6) seg(g,P(x,bb[1],0),P(x,bb[3],0)); for(var y=Math.floor(bb[1]);y<=bb[3];y+=.6) seg(g,P(bb[0],y,0),P(bb[2],y,0)); }
      else if(fin==='wet'){ g.strokeStyle='rgba('+ink+',.32)'; for(x=Math.floor(bb[0]);x<=bb[2];x+=.3) seg(g,P(x,bb[1],0),P(x,bb[3],0)); for(y=Math.floor(bb[1]);y<=bb[3];y+=.3) seg(g,P(bb[0],y,0),P(bb[2],y,0)); }
      else if(fin==='wood'){ g.strokeStyle='rgba('+ink+',.18)'; for(y=Math.floor(bb[1]);y<=bb[3];y+=.42) seg(g,P(bb[0],y,0),P(bb[2],y,0));
        g.strokeStyle='rgba('+ink+',.1)'; for(var row=0,yy=Math.floor(bb[1]);yy<=bb[3];yy+=.42,row++) for(x=Math.floor(bb[0])+(row%2)*.8;x<=bb[2];x+=1.6) seg(g,P(x,yy,0),P(x,yy+.42,0)); }
      g.restore(); });
    /* walls and columns: poché */
    g.fillStyle='rgba('+ink+',.96)';
    WALL1.forEach(function(w){ path(g,poly2(w)); g.fill(); });
    COL1.forEach(function(w){ path(g,poly2(w)); g.fill(); });
    /* windows: three-line opening */
    WIN1.forEach(function(b){ var q=poly2([[b[0],b[1]],[b[2],b[1]],[b[2],b[3]],[b[0],b[3]]]); path(g,q); g.fillStyle='#ffffff'; g.fill();
      g.strokeStyle='rgba('+ink+',.9)'; var wx=b[2]-b[0], wy=b[3]-b[1];
      if(wx>=wy){ [.2,.5,.8].forEach(function(t){ seg(g,P(b[0],b[1]+wy*t,0),P(b[2],b[1]+wy*t,0)); }); } else { [.2,.5,.8].forEach(function(t){ seg(g,P(b[0]+wx*t,b[1],0),P(b[0]+wx*t,b[3],0)); }); }
      path(g,q); g.stroke(); });
    /* doors: opening and leaf */
    DOOR1.forEach(function(b){ var q=poly2([[b[0],b[1]],[b[2],b[1]],[b[2],b[3]],[b[0],b[3]]]); path(g,q); g.fillStyle='#ffffff'; g.fill();
      var wx=b[2]-b[0], wy=b[3]-b[1], A=P(b[0],b[1],0); g.strokeStyle='rgba('+ink+',.75)'; g.beginPath();
      if(wx>=wy){ g.moveTo(A[0],A[1]); g.arc(A[0],A[1],wx*k*.9,-Math.PI/2,0); } else { g.moveTo(A[0],A[1]); g.arc(A[0],A[1],wy*k*.9,-Math.PI/2,0); } g.stroke(); });
    /* room names and areas */
    ROOMS.forEach(function(r){ if(r.lv!==1) return; var bb=bbox(r.p.map(function(p){ return P(p[0],p[1],0); })), w=bb[2]-bb[0], h=bb[3]-bb[1]; if(w<34||h<22) return;
      var c=[0,0]; r.p.forEach(function(p){ c[0]+=p[0]; c[1]+=p[1]; }); var cp=P(c[0]/r.p.length,c[1]/r.p.length,0);
      var nm=r.name.length>18?r.name.slice(0,17)+'…':r.name, fs=w>90?9:7.5;
      g.font='500 '+fs+'px '+SANS; var tw=g.measureText(nm).width; if(tw>w-6){ nm=nm.slice(0,Math.max(4,Math.floor(nm.length*(w-8)/tw)))+'…'; }
      g.fillStyle='rgba(255,255,255,.85)'; g.fillRect(cp[0]-Math.min(tw,w-6)/2-2,cp[1]-fs-1,Math.min(tw,w-6)+4,fs*2+6);
      txt(g,nm,cp[0],cp[1]-1,{s:fs,w:500,c:'rgba('+ink+',.95)',a:'center'}); txt(g,r.area.toFixed(2)+' м²',cp[0],cp[1]+fs+1,{mono:1,s:fs-.5,c:'rgba('+ink+',.6)',a:'center'}); });
    g.restore();
  }
  /* finish tags on the left, title block on the right — like a presentation sheet */
  function paperSheet(g,C,st,ink,al){
    var P=C.P, pb=bbox([[BX[0]-2,BX[1]-4],[BX[2]+2,BX[3]+2]].map(function(p){ return P(p[0],p[1],0); })), c='rgba('+ink+',.92)', c2='rgba('+ink+',.55)';
    var gr=roomC('Бүлгийн',1)||[-12,0], co=roomC('Коридор',1)||[-3,-6];
    g.save(); g.globalAlpha=al; g.lineWidth=1;
    var tags=[[['ШИНЭ','ПЛ-01','ХУЧИЛТЫН ХАВТАН'],[-3,BX[1]-5]],[['ШИНЭ','ПЛ-02','ПАРКЕТ'],[gr[0],gr[1]]],[['ШИНЭ','ПЛ-03','КЕРАМИК ПЛИТА'],[co[0],co[1]]],[['ОДОО БАЙГАА','НГ-01','ЗҮЛЭГ, МОД'],[BX[0]-3,BX[3]+4]]];
    var tx=Math.max(C.W*.15,pb[0]-150), ty=pb[1]+30, gap=Math.min(86,(pb[3]-pb[1]-40)/tags.length);
    tags.forEach(function(tg,i){ var y=ty+i*gap, bw=86, bh=16;
      txt(g,tg[0][0],tx+bw/2,y-5,{mono:1,s:8,c:c2,a:'center',tr:1});
      g.fillStyle='rgba(255,255,255,.9)'; g.fillRect(tx,y,bw,bh); g.strokeStyle=c; g.strokeRect(tx,y,bw,bh); seg(g,[tx+bw-18,y],[tx+bw-18,y+bh]);
      txt(g,tg[0][1],tx+(bw-18)/2,y+11.5,{mono:1,s:9.5,c:c,a:'center'}); txt(g,String.fromCharCode(1040+i),tx+bw-9,y+11.5,{mono:1,s:9,c:c,a:'center'});
      txt(g,tg[0][2],tx+bw/2,y+bh+11,{s:8.5,c:c2,a:'center',w:500,tr:.6});
      var to=P(tg[1][0],tg[1][1],0); g.strokeStyle=c2; g.beginPath(); g.moveTo(tx+bw,y+bh/2); g.lineTo(tx+bw+22,y+bh/2); g.lineTo(to[0],to[1]); g.stroke();
      g.beginPath(); g.arc(to[0],to[1],2.5,0,7); g.fillStyle=c; g.fill(); });
    var bx=pb[2]+28, bw=150, by=pb[1]-10, bh=pb[3]-pb[1]+20; if(bx+bw>C.W*.84){ g.restore(); return; }
    g.fillStyle='rgba(255,255,255,.92)'; g.fillRect(bx,by,bw,bh); g.strokeStyle=c; g.lineWidth=1.4; g.strokeRect(bx,by,bw,bh); g.lineWidth=1;
    g.fillStyle='#F7991E'; var lx=bx+bw/2, ly=by+30, lr=18; g.beginPath(); for(var j=0;j<6;j++){ var a=Math.PI/6+j*Math.PI/3; j?g.lineTo(lx+Math.cos(a)*lr,ly+Math.sin(a)*lr):g.moveTo(lx+Math.cos(a)*lr,ly+Math.sin(a)*lr); } g.closePath(); g.fill();
    g.fillStyle='#ffffff'; g.fillRect(lx-6,ly-6,12,12); g.fillStyle='#1b1d22'; g.fillRect(lx-4,ly-4,8,8);
    txt(g,'PRIME SPATIAL PLAN',lx,by+66,{s:10,w:700,c:c,a:'center',tr:1}); txt(g,'АРХИТЕКТУР · ТӨЛӨВЛӨЛТ',lx,by+80,{s:7.5,c:c2,a:'center',tr:1});
    var yy=by+96; seg(g,[bx,yy],[bx+bw,yy]);
    ['№','Засвар','Огноо'].forEach(function(h,i){ txt(g,h,bx+[8,30,112][i],yy+13,{mono:1,s:8,c:c2}); });
    for(j=1;j<=4;j++) seg(g,[bx,yy+j*16+4],[bx+bw,yy+j*16+4]); seg(g,[bx+24,yy],[bx+24,yy+68]); seg(g,[bx+106,yy],[bx+106,yy+68]);
    yy+=80; seg(g,[bx,yy],[bx+bw,yy]);
    txt(g,'Төсөл',bx+8,yy+14,{mono:1,s:8,c:c2}); txt(g,'Цэцэрлэгийн барилга',bx+8,yy+30,{s:10,w:600,c:c}); txt(g,'2 давхар, зоорьтой',bx+8,yy+44,{s:8.5,c:c2});
    var low=by+bh-118;
    seg(g,[bx,low],[bx+bw,low]); txt(g,'Хуудас',bx+8,low+14,{mono:1,s:8,c:c2}); txt(g,(st.label&&st.label[1])||'',bx+8,low+30,{s:9,w:600,c:c});
    seg(g,[bx,low+40],[bx+bw,low+40]); txt(g,'Огноо  2026',bx+8,low+56,{mono:1,s:8.5,c:c2}); txt(g,'Масштаб  1:200',bx+8,low+70,{mono:1,s:8.5,c:c2});
    seg(g,[bx,low+80],[bx+bw,low+80]); txt(g,'А-'+((st.label&&st.label[0])||'03'),bx+bw-10,low+110,{s:22,w:700,c:c,a:'right'});
    g.restore();
  }

  /* ---------- Revit program chrome drawn over the view ---------- */
  function revitUI(g,C,st,W,H,al,cube){
    g.save(); g.globalAlpha=al;
    var x=W*.26, y=H*.1, tw=Math.max(190,g.measureText?0:0);
    /* view tab */
    var t1=st.view[0], t2=st.view[1]; g.font='600 11px '+SANS; var w1=g.measureText(t1).width; g.font='400 11px '+SANS; var w2=g.measureText(t2).width; tw=w1+w2+86;
    g.fillStyle='rgba(250,250,251,.96)'; g.strokeStyle='rgba(60,64,72,.35)'; g.lineWidth=1;
    g.beginPath(); g.moveTo(x,y+26); g.lineTo(x,y+5); g.quadraticCurveTo(x,y,x+5,y); g.lineTo(x+tw-5,y); g.quadraticCurveTo(x+tw,y,x+tw,y+5); g.lineTo(x+tw,y+26); g.fill(); g.stroke();
    g.fillStyle='#2f6fb3'; g.fillRect(x+10,y+8,10,10); g.fillStyle='#fff'; g.fillRect(x+12,y+10,6,6);
    txt(g,t1,x+28,y+17,{s:11,w:600,c:'#22252b'}); txt(g,'— '+t2,x+32+w1,y+17,{s:11,c:'#4a4f58'}); txt(g,'×',x+tw-14,y+17,{s:12,c:'#6b717a'});
    /* view control bar */
    var by=y+32, bw=212; g.fillStyle='rgba(244,245,247,.95)'; g.strokeStyle='rgba(60,64,72,.3)'; g.fillRect(x,by,bw,22); g.strokeRect(x+.5,by+.5,bw,22);
    txt(g,st.plan>.5?'1 : 100':'1 : 100',x+8,by+15,{s:10.5,c:'#22252b',mono:1});
    var ix=x+62; g.strokeStyle='#3d424b'; g.lineWidth=1.1;
    for(var i=0;i<6;i++){ var cx=ix+i*24, cy=by+11; g.strokeStyle='rgba(60,64,72,.25)'; seg(g,[cx-12,by+3],[cx-12,by+19]); g.strokeStyle='#3d424b';
      if(i===0){ g.strokeRect(cx-5,cy-5,10,10); }
      if(i===1){ g.beginPath(); g.arc(cx,cy,5,0,7); g.stroke(); g.beginPath(); g.moveTo(cx,cy-5); g.arc(cx,cy,5,-Math.PI/2,Math.PI/2); g.closePath(); g.fillStyle='#3d424b'; g.fill(); }
      if(i===2){ g.beginPath(); g.arc(cx,cy,3,0,7); g.fillStyle=OR; g.fill(); for(var a=0;a<8;a++){ var an=a*Math.PI/4; seg(g,[cx+Math.cos(an)*5,cy+Math.sin(an)*5],[cx+Math.cos(an)*7,cy+Math.sin(an)*7]); } }
      if(i===3){ g.beginPath(); g.ellipse(cx,cy+3,6,2.5,0,0,7); g.fillStyle='rgba(60,64,72,.5)'; g.fill(); }
      if(i===4){ g.beginPath(); g.moveTo(cx-6,cy+4); g.lineTo(cx,cy-5); g.lineTo(cx+6,cy+4); g.closePath(); g.stroke(); }
      if(i===5){ g.strokeRect(cx-6,cy-4,12,8); seg(g,[cx-6,cy],[cx+6,cy]); } }
    /* ViewCube with compass */
    if(cube){ var vx=W*.885, vy=H*.2, s=24, az=st.az*Math.PI/180, el=st.el*Math.PI/180, ca=Math.cos(az), sa=Math.sin(az), ce=Math.cos(el), se=Math.sin(el);
      function V(x,y,z){ var xr=x*ca-y*sa, yr=x*sa+y*ca; return [vx+xr*s, vy-(yr*se+z*ce)*s]; }
      var ring=[]; for(var k=0;k<=40;k++){ var an2=k/40*Math.PI*2; ring.push(V(Math.cos(an2)*1.9,Math.sin(an2)*1.9,-1.15)); }
      g.strokeStyle='rgba(90,96,106,.55)'; g.lineWidth=5; polyline(g,ring); g.strokeStyle='rgba(250,250,252,.7)'; g.lineWidth=3; polyline(g,ring);
      [['N',0,1],['E',1,0],['S',0,-1],['W',-1,0]].forEach(function(d){ var q=V(d[1]*2.35,d[2]*2.35,-1.15); txt(g,d[0],q[0],q[1]+3.5,{s:9,w:700,c:'#3d424b',a:'center'}); });
      var vv=[-ce*sa,-ce*ca,se], F=[[[0,0,1],'TOP',[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]]],[[0,-1,0],'FRONT',[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]]],[[1,0,0],'RIGHT',[[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1]]],
        [[0,1,0],'BACK',[[1,1,-1],[-1,1,-1],[-1,1,1],[1,1,1]]],[[-1,0,0],'LEFT',[[-1,1,-1],[-1,-1,-1],[-1,-1,1],[-1,1,1]]]];
      F.forEach(function(f){ var d=f[0][0]*vv[0]+f[0][1]*vv[1]+f[0][2]*vv[2]; if(d<=.01) return; var q=f[2].map(function(p){ return V(p[0],p[1],p[2]); });
        path(g,q); g.fillStyle=mixc('#c9ced6','#f6f7f9',.4+.6*d); g.fill(); g.strokeStyle='rgba(80,86,96,.8)'; g.lineWidth=1; g.stroke();
        var c=[0,0]; q.forEach(function(p){ c[0]+=p[0]/4; c[1]+=p[1]/4; }); if(d>.25) txt(g,f[1],c[0],c[1]+3,{s:Math.max(6,8*d+1),w:700,c:'#3d424b',a:'center'}); });
      var hm=V(0,0,0); g.fillStyle='#3d424b'; g.beginPath(); g.moveTo(vx-s*1.9,vy-s*1.55); g.lineTo(vx-s*1.6,vy-s*1.85); g.lineTo(vx-s*1.3,vy-s*1.55); g.lineTo(vx-s*1.4,vy-s*1.55); g.lineTo(vx-s*1.4,vy-s*1.35); g.lineTo(vx-s*1.8,vy-s*1.35); g.lineTo(vx-s*1.8,vy-s*1.55); g.closePath(); g.fill(); }
    g.restore();
  }

  /* ---------- states: one per homepage step ---------- */
  var BASE={az:22,el:38,span:70,tx:-3,ty:-3,tz:2, ctx:1,plotHi:0,land:1,foot:0,plan:0,clouds:0,build:1,explode:0,fac:1,clay:0,model:0,paper:0,sketch:0,idea:0,topo:0,rv:0,ui:0,call:0,dims:0,levels:0,nor:0};
  function S(o){ var s={}; for(var k in BASE) s[k]=BASE[k]; for(k in o) s[k]=o[k]; return s; }
  var STATES=[
    S({az:24,el:52,span:200,tz:0, plotHi:1,topo:1,land:0,build:0,fac:0, label:['01','ГАЗАР','Байршил, газрын гадарга · 1 : 2 000']}),
    S({az:26,el:44,span:108,tz:1, ctx:.8,land:.5,build:0,fac:0,paper:1,idea:1, label:['02','САНАА','Бүсчлэл, масс, нар салхи']}),
    S({az:30,el:28,span:74,tz:2.4, ctx:.7,land:.6,build:1,paper:1,sketch:1, ui:1, label:['03','ЭСКИЗ','Гар зураг · 3D'], view:['{3D}','Hidden Line · Sketchy']}),
    S({az:0,el:90,span:56,tx:1.4,ty:-2.4,tz:0, ctx:.6,land:.7,plan:1,paper:1,build:0,fac:0,nor:1, label:['04','ЗУРАГ ТӨСӨЛ','1-р давхрын план · 1 : 200'], view:['Floor Plan','1-Р ДАВХАР']}),
    S({az:32,el:30,span:84,tz:2.6, ctx:1,land:1,build:1,model:1,rv:1,ui:1, label:['05','БАРИЛГА','Барилга орчноороо · 3D'], view:['{3D}','Realistic']})
  ];
  function lerpState(a,b,t){ var s={}; for(var k in BASE) s[k]=L(a[k],b[k],t); s.label=t<.5?a.label:b.label; s.view=t<.5?a.view:b.view; s.labelA=Math.abs(t-.5)*2; return s; }

  function rng2(seed){ var t=seed>>>0||1; return function(){ t^=t<<13; t^=t>>>17; t^=t<<5; return ((t>>>0)%10000)/10000; }; }
  function hull(pts){ pts.sort(function(a,b){ return a[0]-b[0]||a[1]-b[1]; }); function cr(o,a,b){ return (a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]); }
    var lo=[],up=[]; pts.forEach(function(p){ while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0) lo.pop(); lo.push(p); });
    for(var i=pts.length-1;i>=0;i--){ var p=pts[i]; while(up.length>1&&cr(up[up.length-2],up[up.length-1],p)<=0) up.pop(); up.push(p); } up.pop(); lo.pop(); return lo.concat(up); }

  /* ---------- render one state ---------- */
  function render(g,W,H,st,sc){
    sc=sc||1; W/=sc; H/=sc;
    var pal=PAL[themeName()], ink=pal.ink, clay=st.clay;
    var model=st.model||0, paper=st.paper||0, sk=st.sketch||0, idea=st.idea||0, topo=st.topo||0, bg=mixc(mixc(mixc(pal.bg,CLAY.bg,clay),'#d5d4d0',model),'#f4f3ef',paper), sideC=pal.side, topC=pal.top;
    var rv=st.rv||0;
    if(clay>.5) ink='46,50,58'; if(paper>.5) ink='26,28,34'; if(rv>.5) ink='34,38,46';
    var inkE=rv>.5?'rgba(28,30,34,.62)':'rgba('+ink+','+(.92*(1-clay*(model>.5?.84:.7)))+')';
    g.setTransform(sc,0,0,sc,0,0); g.globalAlpha=1; g.fillStyle=bg; g.fillRect(0,0,W,H);
    if(rv>.02){ g.globalAlpha=rv; var sg=g.createLinearGradient(0,0,0,H); [[0,'#9fbad4'],[.45,'#d9e3ea'],[.46,'#c3c9b4'],[1,'#a9b394']].forEach(function(c){ sg.addColorStop(c[0],c[1]); }); g.fillStyle=sg; g.fillRect(0,0,W,H); g.globalAlpha=1; }
    var C=cam(W,H,st), P=C.P;
    var LT=[-.45,-.65,.62];
    function shade(nx,ny){ var d=Math.max(0,nx*LT[0]+ny*LT[1]), c=clay>.01?mixc(sideC,mixc('#b8b2a9',CLAY.side,Math.min(1,d*1.4)),clay):sideC; return paper>.01?mixc(c,'#ffffff',paper):c; }
    var L3=[-.45,-.65,.62]; function lam(n){ return .5+.5*Math.max(0,n[0]*L3[0]+n[1]*L3[1]+n[2]*L3[2]); }
    function tone(hex,k){ return mixc('#1c1e22',hex,k); }
    var MAT={w:'#efeae1',f:'#d9d6cf',c:'#d6d1c8',b:'#d6d1c8',d:'#7b5539',s:'#c8c4bb',r:'#3a3d42',n:'#3a3d42',ctx:'#e6e3dc'};
    if(rv>.5){ var shade0=shade; shade=function(nx,ny){ return tone(MAT.ctx,lam([nx,ny,0])+.08); }; }
    var topF=mixc(mixc(topC,CLAY.top,clay),'#ffffff',paper), glassF=mixc(mixc(pal.glass,'#5d6a77',clay),'#ffffff',paper);
    if(rv>.5) topF=tone(MAT.ctx,lam([0,0,1]));

    g.lineWidth=1;
    if(model>.02){ g.save(); g.globalAlpha=model; g.lineCap='round'; g.lineJoin='round';
      ROADS.forEach(function(r){ var q=r.map(function(p){ return P(p[0],p[1],0); });
        g.strokeStyle=mixc('#e9e8e4','#d4d1c9',rv); g.lineWidth=14*C.k; polyline(g,q); g.strokeStyle=mixc('#bdbcb8','#5c6066',rv); g.lineWidth=8*C.k; polyline(g,q);
        g.strokeStyle='rgba(255,255,255,.55)'; g.lineWidth=Math.max(.6,.18*C.k); g.setLineDash([3*C.k,3*C.k]); polyline(g,q); g.setLineDash([]); });
      g.restore(); }
    if(st.ctx>.02){ g.strokeStyle='rgba('+ink+','+(.5*st.ctx*(1-model))+')'; ROADS.forEach(function(r){ polyline(g,r.map(function(p){ return P(p[0],p[1],0); })); }); }
    /* plot */
    var plot=PLOT.map(function(p){ return P(p[0],p[1],0); });
    path(g,plot); g.fillStyle=mixc(mixc(mixc(mixc(pal.site,CLAY.site,clay),'#ecebe7',model),'#fcfbf8',paper),'#d3cfc5',rv); g.fill();
    if(topo>.02){ g.save(); g.lineWidth=1;
      for(var ci=-14;ci<=14;ci++){ var q=[]; for(var cx=-150;cx<=150;cx+=5){ q.push(P(cx,ci*7+6*Math.sin(cx/27+ci*.6)+2.5*Math.sin(cx/9+ci*1.3),0)); }
        g.strokeStyle='rgba('+ink+','+((ci%5===0?.22:.1)*topo)+')'; polyline(g,q);
        if(ci%5===0){ var lp=P(60,ci*7+6*Math.sin(60/27+ci*.6)+2.5*Math.sin(60/9+ci*1.3),0); txt(g,(1352+ci*2)+'.0',lp[0]+4,lp[1]-4,{mono:1,s:9,c:'rgba('+ink+','+(.5*topo)+')'}); } }
      g.restore(); }
    if(model>.02){ g.save(); path(g,plot); g.clip(); g.globalAlpha=model; g.strokeStyle='rgba(120,118,112,.16)'; g.lineWidth=1;
      for(var gx=-38;gx<=34;gx+=2.5) seg(g,P(gx,-34,0),P(gx,22,0)); for(var gy=-34;gy<=22;gy+=2.5) seg(g,P(-38,gy,0),P(34,gy,0));
      LAWNS.forEach(function(l){ path(g,l.map(function(p){ return P(p[0],p[1],0); })); g.fillStyle=mixc('#a9b98f','#7d9f55',rv); g.fill(); g.strokeStyle='rgba(90,110,70,.35)'; g.stroke(); });
      [[-30,-4,3.2],[26,4,3.2]].forEach(function(c){ path(g,circleW(C,c[0],c[1],0,c[2],28)); g.fillStyle=mixc('#d8c9a8','#c2754a',rv); g.fill(); });
      g.restore(); }
    if(paper*st.plan>.02){ g.save(); path(g,plot); g.clip(); g.globalAlpha=paper*st.plan; g.strokeStyle='rgba('+ink+',.13)'; g.lineWidth=1;
      for(var py=-34,row=0;py<=22;py+=.9,row++){ seg(g,P(-38,py,0),P(34,py,0)); for(var px=-38+(row%2)*.9;px<=34;px+=1.8) seg(g,P(px,py,0),P(px,py+.9,0)); }
      LAWNS.forEach(function(l){ var q=l.map(function(p){ return P(p[0],p[1],0); }); path(g,q); g.fillStyle='#fcfbf8'; g.fill(); g.strokeStyle='rgba('+ink+',.5)'; g.stroke();
        var bb=bbox(q); g.fillStyle='rgba('+ink+',.35)'; g.save(); path(g,q); g.clip(); var rr=7;
        for(var sx=bb[0];sx<bb[2];sx+=6) for(var sy=bb[1];sy<bb[3];sy+=6){ rr=(rr*9301+49297)%233280; g.fillRect(sx+(rr%5),sy+(rr%7)*.6,1.1,1.1); } g.restore(); });
      g.restore(); }
    if(st.plotHi>.02){ g.save(); path(g,plot); g.clip(); g.strokeStyle='rgba('+ORc+','+(.45*st.plotHi)+')'; var bb2=bbox(plot);
      for(var xx=bb2[0]-(bb2[3]-bb2[1]);xx<bb2[2];xx+=6) seg(g,[xx,bb2[3]],[xx+(bb2[3]-bb2[1]),bb2[1]]); g.restore(); }
    path(g,plot); g.strokeStyle=st.plotHi>.5?OR:inkE; g.lineWidth=st.plotHi>.5?2:1.3; g.stroke(); g.lineWidth=1;
    if(st.plotHi>.02){ g.save(); g.globalAlpha=st.plotHi; PLOT.forEach(function(c,i){ var b0=P(c[0],c[1],0), b1=P(c[0],c[1],3.2);
        g.strokeStyle='rgba('+ink+',.9)'; g.lineWidth=1.6; seg(g,b0,b1); g.fillStyle=OR; g.beginPath(); g.moveTo(b1[0],b1[1]); g.lineTo(b1[0]+11,b1[1]+4); g.lineTo(b1[0],b1[1]+8); g.closePath(); g.fill();
        txt(g,'Ц'+(i+1),b1[0]+3,b1[1]-5,{mono:1,s:9,c:'rgba('+ink+',.8)'}); });
      var mid=P(-2,-5,0); txt(g,'ГАЗРЫН НЭГЖ ТАЛБАР',mid[0],mid[1],{s:11,w:600,c:OR,a:'center',tr:2}); g.restore(); }

    /* landscape on the ground: entrance path, parking, paths around the building, play areas */
    if(st.land>.02){ var la=st.land; g.strokeStyle='rgba('+ink+','+(.72*la*(1-clay*.5)*(1-rv*.6))+')';
      polyline(g,[P(-4.8,-34,0),P(-4.8,-17.2,0)]); polyline(g,[P(-1,-34,0),P(-1,-17.2,0)]);
      for(var x=-36;x<=-14;x+=2.6) seg(g,P(x,-33.6,0),P(x,-28.6,0)); seg(g,P(-36.2,-28.6,0),P(-13.6,-28.6,0));
      path(g,[[BX[0]-3,BX[1]-3],[BX[2]+3,BX[1]-3],[BX[2]+3,BX[3]+3],[BX[0]-3,BX[3]+3]].map(function(p){ return P(p[0],p[1],0); })); g.stroke();
      path(g,[[-31,-25],[-21,-25],[-21,-19],[-31,-19]].map(function(p){ return P(p[0],p[1],0); })); g.stroke();
      [[-30,-4,3.2],[-30,-4,2],[26,4,3.2],[26,4,2]].forEach(function(c){ path(g,circleW(C,c[0],c[1],0,c[2],28)); g.stroke(); });
      if(paper<.5&&model<.5) TREES.forEach(function(t,i){ path(g,circleW(C,t[0],t[1],0,1.4+(i%3)*.4,14)); g.stroke(); });
    }
    /* ground-floor plan on paper */
    if(st.plan>.02&&paper>.5) revitPlan(g,C,ink,st.plan);
    if(st.plan>.02){ g.save(); g.globalAlpha=st.plan;
      var ax=[[BX[0],'1'],[(BX[0]+BX[2])/2,'2'],[BX[2],'3']];
      ax.forEach(function(x){ g.strokeStyle='rgba('+ink+',.3)'; g.setLineDash([10,4,2,4]); seg(g,P(x[0],BX[1]-1,0),P(x[0],BX[1]-6,0)); g.setLineDash([]);
        var b=P(x[0],BX[1]-8,0); g.beginPath(); g.arc(b[0],b[1],9,0,7); g.fillStyle='#ffffff'; g.fill(); g.strokeStyle='rgba('+ink+',.6)'; g.stroke(); txt(g,x[1],b[0],b[1]+.5,{mono:1,s:9.5,c:'rgba('+ink+',.8)',a:'center',b:'middle'}); });
      g.restore(); }
    if(paper*st.plan>.02){ g.save(); g.globalAlpha=paper*st.land*st.plan;
      MTREES.concat(TREES.map(function(t,i){ return [t[0],t[1],1.5+(i%3)*.4]; })).forEach(function(t,i){ if(t[0]<-40||t[0]>36||t[1]<-36||t[1]>24) return;
        var c=P(t[0],t[1],0), R=t[2]*1.25*C.k, n=18; g.strokeStyle='rgba('+ink+',.85)'; g.lineWidth=.9; g.beginPath();
        for(var j=0;j<n;j++){ var a=j/n*Math.PI*2+i, r1=R*(j%2?.55:1); g.moveTo(c[0]+Math.cos(a)*R*.12,c[1]+Math.sin(a)*R*.12); g.lineTo(c[0]+Math.cos(a)*r1,c[1]+Math.sin(a)*r1); }
        g.stroke(); g.beginPath(); g.arc(c[0],c[1],1.6,0,7); g.fillStyle='rgba('+ink+',.9)'; g.fill(); });
      g.restore(); }

    if(idea>.02){ g.save(); g.globalAlpha=idea; g.lineWidth=1.3;
      function lab(t,x,y,c){ var q=P(x,y,0); txt(g,t,q[0],q[1],{s:10,w:600,c:c,a:'center',tr:1.5}); }
      LAWNS.forEach(function(l){ path(g,l.map(function(p){ return P(p[0],p[1],0); })); g.fillStyle='rgba(110,165,115,.2)'; g.fill(); g.setLineDash([6,4]); g.strokeStyle='rgba(70,120,75,.85)'; g.stroke(); g.setLineDash([]); });
      lab('НОГООН БҮС',-30.5,8,'rgba(60,100,65,1)'); lab('НОГООН БҮС',25.5,14,'rgba(60,100,65,1)');
      [[-30,-4,5.5],[26,4,5.5]].forEach(function(c){ path(g,circleW(C,c[0],c[1],0,c[2],36)); g.fillStyle='rgba(247,153,30,.14)'; g.fill(); g.setLineDash([6,4]); g.strokeStyle=OR; g.stroke(); g.setLineDash([]); });
      lab('ТОГЛООМЫН ТАЛБАЙ',-30,-4,'#b45f00'); lab('ТОГЛООМЫН ТАЛБАЙ',26,4,'#b45f00');
      path(g,[[-36,-33.6],[-14,-33.6],[-14,-28.6],[-36,-28.6]].map(function(p){ return P(p[0],p[1],0); })); g.fillStyle='rgba(60,70,90,.1)'; g.fill(); g.setLineDash([6,4]); g.strokeStyle='rgba('+ink+',.7)'; g.stroke(); g.setLineDash([]);
      lab('ЗОГСООЛ',-25,-31.4,'rgba('+ink+',.85)');
      var e0=P(-3,-44,0), e1=P(-3,BX[1]-1.2,0); g.strokeStyle=OR; g.lineWidth=3; seg(g,e0,e1);
      var an=Math.atan2(e1[1]-e0[1],e1[0]-e0[0]); g.fillStyle=OR; g.beginPath(); g.moveTo(e1[0],e1[1]); g.lineTo(e1[0]-14*Math.cos(an-.4),e1[1]-14*Math.sin(an-.4)); g.lineTo(e1[0]-14*Math.cos(an+.4),e1[1]-14*Math.sin(an+.4)); g.closePath(); g.fill();
      var el=P(-3,-38,0); txt(g,'ГОЛ ОРЦ',el[0]+10,el[1],{s:10,w:700,c:'#b45f00',tr:1.5});
      g.lineWidth=1.2; g.strokeStyle='rgba(214,140,20,.9)'; g.setLineDash([3,5]); var sq=[]; for(var sa=0;sa<=1.0001;sa+=.05){ var ang=Math.PI*(1.1-sa*1.2); sq.push(P(-2+Math.cos(ang)*46,-4-Math.sin(ang)*38-2,0)); } polyline(g,sq); g.setLineDash([]);
      var sp=sq[10]; g.beginPath(); g.arc(sp[0],sp[1],7,0,7); g.fillStyle='#F7B23B'; g.fill(); txt(g,'НАР',sp[0]+11,sp[1]+4,{s:10,w:700,c:'#b45f00',tr:1.5});
      [[-48,30],[-44,36],[-52,24]].forEach(function(w){ var a0=P(w[0],w[1],0), a1=P(w[0]+11,w[1]-9,0); g.strokeStyle='rgba(80,120,170,.85)'; g.lineWidth=1.4; seg(g,a0,a1);
        var aw=Math.atan2(a1[1]-a0[1],a1[0]-a0[0]); g.beginPath(); g.moveTo(a1[0],a1[1]); g.lineTo(a1[0]-8*Math.cos(aw-.45),a1[1]-8*Math.sin(aw-.45)); g.moveTo(a1[0],a1[1]); g.lineTo(a1[0]-8*Math.cos(aw+.45),a1[1]-8*Math.sin(aw+.45)); g.stroke(); });
      var wl=P(-50,34,0); txt(g,'САЛХИ',wl[0]-6,wl[1]-10,{s:10,w:700,c:'rgba(60,100,150,1)',tr:1.5,a:'right'});
      g.restore(); }
    /* solids in painter's order: context, landscape objects, trees, and every visible face of the building */
    var items=[], v=C.v;
    function push(o){ var cx=0,cy=0; o.poly.forEach(function(p){ cx+=p[0]; cy+=p[1]; }); cx/=o.poly.length; cy/=o.poly.length; o.depth=P(cx,cy,(o.z0+o.z1)/2)[2]; items.push(o); }
    var base={edge:inkE,top:topF,ink:ink,clay:clay,side:shade};
    function mk(o){ for(var k in base) if(o[k]===undefined) o[k]=base[k]; return o; }
    if(st.ctx>.02){ CTXB.forEach(function(b){ push(mk({poly:rectPoly(b),z0:0,z1:b[4],a:st.ctx})); });
      CYL.forEach(function(c){ var q=[]; for(var i=0;i<14;i++){ var a=i/14*Math.PI*2; q.push([c[0]+Math.cos(a)*c[2],c[1]+Math.sin(a)*c[2]]); } push(mk({poly:q,z0:0,z1:c[3],a:st.ctx})); }); }
    if(st.land>.02&&st.plan<.5){ PAV.forEach(function(p){ push(mk({poly:rectPoly([p[0]-p[2]/2,p[1]-p[2]/2,p[0]+p[2]/2,p[1]+p[2]/2]),z0:0,z1:2.6,a:st.land,pyr:1,cx:p[0],cy:p[1]})); });
      [[-29.5,-4.5,1,1,1.6],[-31,-3,1.4,.6,1],[25.5,3.5,1,1,2],[27,5,.8,1.4,1.2]].forEach(function(p){ push(mk({poly:rectPoly([p[0],p[1],p[0]+p[2],p[1]+p[3]]),z0:0,z1:p[4],a:st.land})); }); }
    if(model>.02||sk>.02){
      MTREES.concat(TREES.map(function(t,i){ return [t[0],t[1],1.4+(i%3)*.4]; })).forEach(function(t,i){ var h=2.2+t[2];
        items.push({tree:1,x:t[0],y:t[1],r:t[2],h:h,a:Math.max(model,sk),sk:sk>model,seed:i,depth:P(t[0],t[1],h)[2]}); }); }
    if(idea>.02){ push(mk({poly:HULL,z0:0,z1:ZTOP*Math.min(1,idea*1.2),a:idea,side:function(nx,ny){ var d=Math.max(0,nx*LT[0]+ny*LT[1]); return 'rgba(247,153,30,'+(.18+.14*(1-d))+')'; },top:'rgba(247,153,30,.26)',edge:'rgba(190,100,0,.95)',lw:1.4,massLines:1})); }
    var bld=[];
    if(st.build>.001){
      EL.forEach(function(e){
        var frac = e.b===0 ? st.explode*st.build : Math.max(0,Math.min(1,st.build*3-(e.b-1)));
        if(!e.ext) frac*=Math.min(1,st.explode*1.6);
        if(frac<=.01) return;
        var zo=(e.b-1)*EX*st.explode - (1-frac)*2.2, a=frac;
        bld.push({e:e,zo:zo,a:a});
        e.f.forEach(function(f){ var d=f.n[0]*v[0]+f.n[1]*v[1]+f.n[2]*v[2]; if(d<=.01) return;
          var dp=P(f.c[0],f.c[1],f.c[2]+zo)[2];
          /* painter's fix for the big roof slab: draw it over the storey below, and wall tops (parapet caps) over it */
          if(st.explode<.3&&e.c==='f'&&e.z1>5.5&&f.n[2]>.6) dp+=1e4;
          else if(st.explode<.3&&f.n[2]>.6&&f.c[2]>6.05) dp+=2e4;
          items.push({face:f,el:e,zo:zo,a:a,d:d,depth:dp}); }); });
    }
    if(model>.02){
      var SV=[.62,-.48], sp=new Path2D();
      items.forEach(function(o){ if(o.tree){ var c=P(o.x+SV[0]*o.h*.8,o.y+SV[1]*o.h*.8,0); sp.ellipse(c[0],c[1],o.r*C.k*1.1,o.r*C.k*.7,0,0,7); return; }
        if(o.face||o.z0>.01) return; var hgt=o.z1, pts=[]; o.poly.forEach(function(p){ pts.push([p[0],p[1]]); pts.push([p[0]+SV[0]*hgt,p[1]+SV[1]*hgt]); });
        var hp=hull(pts).map(function(p){ return P(p[0],p[1],0); }); hp.forEach(function(p,i){ i?sp.lineTo(p[0],p[1]):sp.moveTo(p[0],p[1]); }); sp.closePath(); });
      bld.forEach(function(b){ if(b.e.c!=='w'||b.e.b<1) return; var pts=[]; b.e.pts.forEach(function(p){ var z=p[2]+b.zo; if(z<0) z=0; pts.push([p[0],p[1]]); pts.push([p[0]+SV[0]*z,p[1]+SV[1]*z]); });
        var hp=hull(pts).map(function(p){ return P(p[0],p[1],0); }); hp.forEach(function(p,i){ i?sp.lineTo(p[0],p[1]):sp.moveTo(p[0],p[1]); }); sp.closePath(); });
      g.save(); g.globalAlpha=model; g.filter='blur('+Math.max(1,Math.round(C.k*.35))+'px)'; g.fillStyle='rgba(60,58,52,'+(.22+.14*rv)+')'; g.fill(sp,'nonzero'); g.restore(); g.filter='none';
    }
    items.sort(function(a,b){ return a.depth-b.depth; });
    items.forEach(function(o){
      if(o.face&&sk>.5){ var f=o.face, e=o.el, rs=rng2(Math.round(f.c[0]*97+f.c[1]*31+f.c[2]*13)); g.globalAlpha=o.a;
        var loops=f.l.map(function(lp){ return lp.map(function(p){ return P(p[0],p[1],p[2]+o.zo); }); });
        g.beginPath(); loops.forEach(function(q){ q.forEach(function(p,i){ i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]); }); g.closePath(); });
        var gl=(e.c==='n')&&Math.abs(f.n[2])<.5, dl=Math.max(0,f.n[0]*LT[0]+f.n[1]*LT[1]);
        g.fillStyle=gl?'rgba(150,160,172,.35)':(Math.abs(f.n[2])>.6?'#fbfaf7':mixc('#dedad1','#fbfaf7',Math.min(1,dl*1.5))); g.fill('evenodd');
        [[.8,.95],[.35,.6]].forEach(function(pass){ g.strokeStyle='rgba(38,40,46,'+pass[0]+')'; g.lineWidth=pass[1]; g.beginPath();
          loops.forEach(function(q){ for(var i=0;i<q.length;i++){ var A=q[i], B=q[(i+1)%q.length], dx=B[0]-A[0], dy=B[1]-A[1], l=Math.hypot(dx,dy); if(l<1.5) continue;
            var ov=Math.min(4,l*.12)/l, j1=(rs()-.5)*1.4, j2=(rs()-.5)*1.4;
            g.moveTo(A[0]-dx*ov+j1,A[1]-dy*ov+j2); g.lineTo(B[0]+dx*ov+j2,B[1]+dy*ov+j1); } });
          g.stroke(); });
        g.globalAlpha=1; return; }
      if(o.face){ var f=o.face, e=o.el; g.globalAlpha=o.a; g.beginPath();
        f.l.forEach(function(lp){ lp.forEach(function(p,i){ var q=P(p[0],p[1],p[2]+o.zo); i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]); }); g.closePath(); });
        var glass=(e.c==='n')&&Math.abs(f.n[2])<.5;
        if(rv>.5){ var k=lam(f.n);
          if(glass){ var bb=[1e9,1e9,-1e9,-1e9]; f.l[0].forEach(function(p){ var q=P(p[0],p[1],p[2]+o.zo); bb[1]=Math.min(bb[1],q[1]); bb[3]=Math.max(bb[3],q[1]); });
            var gg=g.createLinearGradient(0,bb[1],0,bb[3]); gg.addColorStop(0,tone('#c9dbe8',k+.15)); gg.addColorStop(.55,tone('#7593a9',k+.1)); gg.addColorStop(1,tone('#3f5263',k+.1)); g.fillStyle=gg; }
          else { var m=MAT[e.c]||MAT.w; if(e.c==='f'&&f.n[2]>.6&&e.z1>5.5) m='#c5c3bd'; if(e.c==='w'&&f.n[2]>.6) m='#dcd8d0'; g.fillStyle=tone(m,k); }
          g.fill('evenodd'); g.strokeStyle=inkE; g.lineWidth=(e.c==='n'||e.c==='d'||e.c==='r')?.45:.7; g.stroke(); g.globalAlpha=1; return; }
        g.fillStyle=glass?glassF:(Math.abs(f.n[2])>.6?topF:shade(f.n[0],f.n[1])); g.fill('evenodd');
        g.strokeStyle=inkE; g.lineWidth=(e.c==='n'||e.c==='d'||e.c==='r')?.7:1; g.stroke(); g.globalAlpha=1; return; }
      if(o.tree&&o.sk){ var b=P(o.x,o.y,0), c=P(o.x,o.y,o.h), rr=o.r*C.k, rs=rng2(o.seed+11); g.globalAlpha=o.a;
        g.strokeStyle='rgba(44,46,52,.75)'; g.lineWidth=.9; seg(g,b,[c[0],c[1]+rr*.7]);
        g.beginPath(); for(var j=0;j<=22;j++){ var an=j/18*Math.PI*2, rj=rr*(.82+rs()*.32); var x=c[0]+Math.cos(an)*rj, y=c[1]+Math.sin(an)*rj*.92; j?g.lineTo(x,y):g.moveTo(x,y); }
        g.fillStyle='rgba(251,250,247,.92)'; g.fill(); g.stroke(); g.globalAlpha=1; return; }
      if(o.tree){ var b=P(o.x,o.y,0), c=P(o.x,o.y,o.h), rr=o.r*C.k; g.globalAlpha=o.a;
        g.strokeStyle='#8a7d6a'; g.lineWidth=Math.max(1,.22*C.k); seg(g,b,[c[0],c[1]+rr*.6]);
        var gr=g.createRadialGradient(c[0]-rr*.35,c[1]-rr*.4,rr*.1,c[0],c[1],rr*1.05); gr.addColorStop(0,mixc('#9fb47e','#8fb35e',rv)); gr.addColorStop(.6,mixc('#6f8a52','#4f7a35',rv)); gr.addColorStop(1,mixc('#4d6539','#2f4d22',rv));
        g.beginPath(); g.arc(c[0],c[1],rr,0,7); g.fillStyle=gr; g.fill(); g.globalAlpha=1; return; }
      prism(g,C,o);
      if(o.massLines){ g.globalAlpha=o.a; g.strokeStyle='rgba(190,100,0,.6)'; g.lineWidth=1; g.setLineDash([5,4]);
        [3,6].forEach(function(z){ if(z>=o.z1) return; var n=o.poly.length; for(var i=0;i<n;i++){ var a=o.poly[i], b=o.poly[(i+1)%n], nx=b[1]-a[1], ny=-(b[0]-a[0]); if(nx*v[0]+ny*v[1]<=0&&(-nx)*v[0]+(-ny)*v[1]<=0) continue; seg(g,P(a[0],a[1],z),P(b[0],b[1],z)); } });
        g.setLineDash([]); var tp=P(HULL[0][0],HULL[0][1],o.z1); txt(g,'2 ДАВХАР БАРИЛГА',tp[0]+10,tp[1]-14,{s:11,w:700,c:'#b45f00',tr:1.5}); g.globalAlpha=1; }
      if(o.pyr){ var apex=P(o.cx,o.cy,o.z1+1.6), t=o.poly.map(function(p){ return P(p[0],p[1],o.z1); });
        g.globalAlpha=o.a; for(var i=0;i<4;i++){ path(g,[t[i],t[(i+1)%4],apex]); g.fillStyle=o.top; g.fill(); g.strokeStyle=o.edge; g.stroke(); } g.globalAlpha=1; }
    });

    /* annotations */
    var la=st.labelA==null?1:st.labelA;
    if(st.dims>.02){
      if(st.build<.1){ for(var i=0;i<PLOT.length;i++){ var a2=PLOT[i], b2=PLOT[(i+1)%PLOT.length]; dim(g,C,a2,b2,-22,(Math.hypot(b2[0]-a2[0],b2[1]-a2[1])*1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,' '),st.dims*(1-st.build*10)); } }
      else { var fm=function(m){ return (Math.round(m*1000)).toString().replace(/\B(?=(\d{3})+(?!\d))/g,' '); };
        dim(g,C,[BX[0],BX[1],0],[BX[2],BX[1],0],24,fm(BX[2]-BX[0]),st.dims); dim(g,C,[BX[2],BX[1],0],[BX[2],BX[3],0],24,fm(BX[3]-BX[1]),st.dims); }
    }
    if(st.levels>.02&&st.build>.05){ g.globalAlpha=st.levels;
      [[0,'±0.000'],[3,'+3.000'],[6,'+6.000'],[ZTOP,'+'+ZTOP.toFixed(3)]].forEach(function(l){ if(l[0]>st.build*ZTOP+.1) return; var p=P(BX[0],BX[1],l[0]), x=p[0]-80; g.strokeStyle=OR; g.lineWidth=1; seg(g,[x,p[1]],[p[0]-8,p[1]]);
        g.beginPath(); g.moveTo(x+12,p[1]); g.lineTo(x+7,p[1]-8); g.lineTo(x+17,p[1]-8); g.closePath(); g.stroke(); txt(g,l[1],x,p[1]-12,{mono:1,s:10,c:OR}); });
      g.globalAlpha=1; }
    if(st.clouds>.02){ g.globalAlpha=st.clouds;
      var r1=roomC('Бүлгийн өрөө-2',1)||roomC('Бүлгийн',1);
      if(r1){ var bx=bbox(r1[2].p.map(function(p){ return P(p[0],p[1],0); })); cloud(g,bx[0]-8,bx[1]-8,bx[2]-bx[0]+16,bx[3]-bx[1]+16,11);
        var tx=bx[0]+2, ty=bx[3]+30; g.beginPath(); g.moveTo(tx,ty-9); g.lineTo(tx+9,ty+7); g.lineTo(tx-9,ty+7); g.closePath(); g.strokeStyle=OR; g.lineWidth=1.3; g.stroke(); txt(g,'1',tx,ty+4.5,{mono:1,s:9,c:OR,a:'center',w:600});
        txt(g,'Бүлгийн өрөөний цонх нэмэх',tx+16,ty+5,{s:11,w:600,c:OR}); }
      var q2=bbox([[-5.2,-17.4],[4,-17.4],[4,-14],[-5.2,-14]].map(function(p){ return P(p[0],p[1],0); })); cloud(g,q2[0]-8,q2[1]-8,q2[2]-q2[0]+16,q2[3]-q2[1]+16,8);
      txt(g,'2  Гол орц, пандус',q2[2]+18,q2[3]+4,{s:11,w:600,c:OR}); g.globalAlpha=1; }
    if(st.call>.02){ [[-2.9,-15.6,.4,'Гол орцны шат, пандус'],[-2.9,-14.3,2.2,'Орцны хаалга, саравч'],[-10,BX[1],4.5,'Цонхны нүх, хэмжээс'],[-12,BX[1],ZTOP-.2,'Дээврийн парапет'],[BX[0],-8,1.5,'Гадна хана, дулаалга']].forEach(function(c,i){
        var p=P(c[0],c[1],c[2]); leader(g,p,W*(C.port?.06:.6),H*(C.port?.15:.14)+i*(C.port?30:46),c[3],ink,st.call); }); }
    if(st.nor>.02) north(g,W*(C.port?.1:.22),H*(C.port?.24:.2),ink,st.nor);
    if(model<.5) ucs(g,C,ink);
    var uiA=(st.ui||0)>.02?st.ui:0, pv=st.plan>.5&&paper>.5;
    if(!C.port) sheet(g,W*.3,H*.12,st.label,ink,la*(1-clay)*(1-paper*st.plan)*(1-uiA)*(1-rv));
    if(!C.port&&(uiA>.02||pv)&&st.view) revitUI(g,C,st,W,H,Math.max(uiA,pv?1:0)*la,st.ui>.5||rv>.5);
    if(paper>.5&&!C.port&&st.plan>.5) paperSheet(g,C,st,ink,paper*la);
  }

  /* ---------- cache for still images (subpage heroes, portal previews, settled homepage frames) ---------- */
  var cache={};
  function dims(){ var d=Math.min(window.devicePixelRatio||1,1.5), w=innerWidth*d, h=innerHeight*d, cap=Math.sqrt(2000000/(w*h));
    if(cap<1){ w*=cap; h*=cap; } return {w:Math.round(w), h:Math.round(h)}; }
  function scene(i){ var s=dims(), k=themeName()+i+':'+s.w+'x'+s.h;
    if(!cache[k]){ var c=document.createElement('canvas'); c.width=s.w; c.height=s.h; render(c.getContext('2d'),s.w,s.h,STATES[i],s.w/innerWidth); cache[k]=c; }
    return cache[k]; }
  function blit(canvas,src,cssW,cssH,viewH){
    var d=Math.min(window.devicePixelRatio||1,1.5); viewH=viewH||cssH;
    canvas.width=Math.round(cssW*d); canvas.height=Math.round(cssH*d);
    var vw=canvas.width, vh=Math.round(viewH*d), ctx=canvas.getContext('2d'), sc=Math.max(vw/src.width,vh/src.height),
        w=src.width*sc, h=src.height*sc; ctx.drawImage(src,(vw-w)/2,(vh-h)*.55,w,h);
  }
  var PAINT=STATES.map(function(s){ return function(g,W,H){ render(g,W,H,s); }; });
  window.PSPScenes={dims:dims, PAINT:PAINT, N:STATES.length, STATES:STATES, lerp:lerpState, render:render, scene:scene, raw:scene, blit:blit, clear:function(){ cache={}; }};
})();
