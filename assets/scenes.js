/* Prime Spatial Plan — the site's graphics: one parametric CAD model (two residential towers on their plot)
   drawn in orthographic projection with hidden lines removed, like a SketchUp/Revit model-space view.
   Every homepage step is a state of that model (camera, how many floors are built, how far the floors are
   exploded, how much detail shows); the homepage tweens between states so the land turns into a building
   floor by floor. Subpage heroes use the same states as still images.
   Geometry is reconstructed from the studio's SketchUp screenshots; replace BL/PLOT with exported data later. */
(function(){
  var MONO='Menlo, Consolas, monospace', SANS='Onest, Arial, sans-serif', OR='#F7991E', ORc='247,153,30';
  function hx(c){ if(c.charAt(0)==='r'){ var m=c.match(/[\d.]+/g); return [+m[0],+m[1],+m[2]]; } c=c.replace('#',''); return [parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)]; }
  function mixc(a,b,t){ var A=hx(a),B=hx(b); return 'rgb('+Math.round(A[0]+(B[0]-A[0])*t)+','+Math.round(A[1]+(B[1]-A[1])*t)+','+Math.round(A[2]+(B[2]-A[2])*t)+')'; }
  function L(a,b,t){ return a+(b-a)*t; }
  var PAL={
    dark:{bg:'#16243b',side:'#1b2b46',top:'#223454',site:'#1b2c48',foot:'#232a3a',ink:'232,239,250'},
    light:{bg:'#eef0f3',side:'#f8f9fb',top:'#ffffff',site:'#f3f5f8',foot:'#d7dce4',ink:'22,30,46'}
  };
  var CLAY={bg:'#aaa69f',side:'#ece8e1',top:'#faf8f4',site:'#dcd8d0',foot:'#cfcac2'};
  function themeName(){ return document.documentElement.getAttribute('data-theme')==='light'?'light':'dark'; }

  /* ---------- model (metres; x east, y north) ---------- */
  var FH=3, EX=3.6;
  var PLOT=[[0,0],[44,0],[70,22],[70,58],[0,58]];
  /* r: x0,y0,x1,y1 · f: floors · s: first floor index · t: tower */
  var BL=[
    {r:[5,5,27,27],f:11,t:'A'},
    {r:[5,17,27,27],f:1,s:11,t:'A',roof:1},
    {r:[27,8,29,15],f:11,t:'A',bay:1},{r:[27,18,29,25],f:11,t:'A',bay:1},{r:[3,9,5,22],f:11,t:'A',bay:1},
    {r:[12,3,20,5],f:1,t:'A',entr:1},
    {r:[46,27,58,54],f:13,t:'B'},
    {r:[38,31,46,52],f:11,t:'B'},{r:[58,31,66,52],f:11,t:'B'},
    {r:[48,24,56,27],f:1,t:'B',entr:1}
  ];
  var MAXF={A:12,B:13};
  var CTXB=[[-46,74,-22,86,8],[-78,30,-60,44,6],[84,78,104,90,8],[108,64,138,80,10],[141,58,162,73,10],[96,-30,122,-16,6],
            [-56,-46,-34,-34,6],[122,26,138,44,12],[-34,98,-8,110,7],[20,96,46,108,9],[-90,-6,-74,10,5]];
  var CYL=[[114,94,2.6,4],[150,48,2.6,4.5]];
  var ROADS=[[[-140,64],[-60,64],[-8,61],[24,66],[70,68],[180,62]],[[76,-80],[78,10],[76,60],[90,140]],[[-6,-90],[-6,61]],[[78,10],[180,0]]];
  var PAV=[[20,40,4],[32,15,4]];
  var GREEN=[[11,44,3,5],[14.5,44,3,5],[18,44,3,5]];
  var TREES=[[2,2],[36,4],[30,30],[34,34],[8,32],[66,56],[36,56],[60,8],[2,30],[24,54]];
  var LAWNS=[[[7.5,35.5],[29,35.5],[33,40],[33,53.5],[7.5,53.5]],[[40,3],[50,3],[59,11],[55,19],[40,19]],[[30,1.5],[33,1.5],[33,20],[30,20]]];
  var MTREES=(function(){ var t=[], i, r=0;
    function rnd(){ r=(r*9301+49297)%233280; return r/233280; }
    for(i=0;i<9;i++) t.push([9+i*3.4,56.2,1.3+rnd()*.5]);
    for(i=0;i<6;i++) t.push([68.2,25+i*5.6,1.2+rnd()*.5]);
    for(i=0;i<5;i++) t.push([8+i*4.6,1.6,1.2+rnd()*.5]);
    for(i=0;i<5;i++) t.push([11+i*4,48.5+(i%2)*2.5,1.4+rnd()*.6]);
    [[44,8],[47,15],[56,17],[37.5,48],[37.5,40],[31,26]].forEach(function(p){ t.push([p[0],p[1],1.3+rnd()*.6]); });
    for(var x=-120;x<170;x+=8.5){ if(x>-4&&x<74) continue; t.push([x,59,1.5+rnd()*.6]); t.push([x+3,69.5,1.5+rnd()*.6]); }
    for(var y=-70;y<130;y+=8.5){ if(y>-2&&y<62) { t.push([73.2,y,1.4+rnd()*.5]); continue; } t.push([73,y,1.5+rnd()*.6]); t.push([83,y+3,1.5+rnd()*.6]); }
    for(y=-80;y<58;y+=8){ t.push([-2.6,y,1.4+rnd()*.5]); t.push([-10,y+4,1.5+rnd()*.6]); }
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

  /* ---------- details ---------- */
  function facade(g,C,a,b,o){
    var al=o.fac; if(al<=.02) return; var P=C.P, len=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.max(1,Math.round(len/1.55)), m=len/n,
        ux=(b[0]-a[0])/len, uy=(b[1]-a[1])/len, z0=o.z0, h=o.z1-o.z0, ink=o.ink;
    function Q(u,z){ return P(a[0]+ux*u,a[1]+uy*u,z); }
    g.lineWidth=1;
    g.strokeStyle='rgba('+ink+','+(.55*al)+')'; seg(g,Q(0,z0),Q(len,z0));
    if(h<1.4||C.k*m<5) return;
    g.strokeStyle='rgba('+ink+','+(.2*al)+')';
    for(var j=1;j<n;j++){ seg(g,Q(j*m,z0),Q(j*m,o.z1)); }
    for(j=0;j<n;j++){
      if(!(o.bay||o.g===0||j%2===0)) continue;
      var u0=j*m+.24, u1=(j+1)*m-.24, zb=z0+(o.g===0?.3:.85), zt=z0+Math.min(h-.25,o.g===0?2.7:2.35); if(zt<=zb+.2) continue;
      var q=[Q(u0,zb),Q(u1,zb),Q(u1,zt),Q(u0,zt)]; path(g,q);
      if(o.clay>.02){ g.fillStyle='rgba(58,66,78,'+(.55*o.clay)+')'; g.fill(); }
      g.strokeStyle='rgba('+ink+','+(.78*al)+')'; g.stroke();
      if(u1-u0>.9){ g.strokeStyle='rgba('+ink+','+(.4*al)+')'; seg(g,Q((u0+u1)/2,zb),Q((u0+u1)/2,zt)); }
    }
  }
  /* floor plan: corridor along the long side, partitions, hatched core */
  function planLines(g,C,r,z,al,ink){
    if(al<=.02) return; var P=C.P, x0=r[0],y0=r[1],x1=r[2],y1=r[3], w=x1-x0, d=y1-y0, alongX=w>=d, i;
    g.lineWidth=1; g.strokeStyle='rgba('+ink+','+(.65*al)+')';
    if(Math.min(w,d)<9){ var nn=Math.round((alongX?w:d)/4.5); for(i=1;i<nn;i++){ var t=i*(alongX?w:d)/nn;
        alongX?seg(g,P(x0+t,y0,z),P(x0+t,y1,z)):seg(g,P(x0,y0+t,z),P(x1,y0+t,z)); } return; }
    var mid=alongX?(y0+y1)/2:(x0+x1)/2, c0=mid-.9, c1=mid+.9;
    if(alongX){ seg(g,P(x0,c0,z),P(x1,c0,z)); seg(g,P(x0,c1,z),P(x1,c1,z)); }
    else { seg(g,P(c0,y0,z),P(c0,y1,z)); seg(g,P(c1,y0,z),P(c1,y1,z)); }
    var span=alongX?w:d, n=Math.round(span/4.4);
    for(i=1;i<n;i++){ var s=i*span/n;
      if(alongX){ seg(g,P(x0+s,y0,z),P(x0+s,c0,z)); seg(g,P(x0+s,c1,z),P(x0+s,y1,z)); }
      else { seg(g,P(x0,y0+s,z),P(c0,y0+s,z)); seg(g,P(c1,y0+s,z),P(x1,y0+s,z)); } }
    var cc=alongX?[(x0+x1)/2-2.2,c1,(x0+x1)/2+2.2,Math.min(y1,c1+4.6)]:[c1,(y0+y1)/2-2.2,Math.min(x1,c1+4.6),(y0+y1)/2+2.2];
    var q=rectPoly(cc).map(function(p){ return P(p[0],p[1],z); });
    g.save(); path(g,q); g.clip(); g.strokeStyle='rgba('+ink+','+(.4*al)+')';
    var bb=bbox(q); for(var xx=bb[0]-(bb[3]-bb[1]);xx<bb[2];xx+=5) seg(g,[xx,bb[3]],[xx+(bb[3]-bb[1]),bb[1]]);
    g.restore(); path(g,q); g.strokeStyle='rgba('+ink+','+(.8*al)+')'; g.stroke();
  }

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
  function ucs(g,C,ink){ var o=C.P(-8,-8,0), ax=[[1,0,0,'X'],[0,1,0,'Y'],[0,0,1,'Z']];
    if(o[0]<0||o[0]>C.W||o[1]<0||o[1]>C.H) return;
    g.lineWidth=1.2; ax.forEach(function(d){ var p=C.P(-8+d[0],-8+d[1],d[2]), dx=p[0]-o[0], dy=p[1]-o[1], l=Math.hypot(dx,dy); if(l<.05*C.k) return;
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

  /* ---------- paper working drawing: poché walls, floor finishes, doors, core ---------- */
  function planDetail(g,C,r,ink,al){
    if(al<=.02) return; var P=C.P, x0=r[0],y0=r[1],x1=r[2],y1=r[3], w=x1-x0, d=y1-y0, alongX=w>=d, i, j, k=C.k;
    function R(a,b,c,e){ return [P(a,b,0),P(c,b,0),P(c,e,0),P(a,e,0)]; }
    function fillR(a,b,c,e,col){ path(g,R(a,b,c,e)); g.fillStyle=col; g.fill(); }
    function clipR(a,b,c,e,fn){ g.save(); path(g,R(a,b,c,e)); g.clip(); fn(); g.restore(); }
    g.save(); g.globalAlpha=al; g.lineWidth=1;
    fillR(x0,y0,x1,y1,'#ffffff');
    var narrow=Math.min(w,d)<9, mid=alongX?(y0+y1)/2:(x0+x1)/2, c0=mid-.9, c1=mid+.9, span=alongX?w:d, n=Math.max(1,Math.round(span/4.4)), step=span/n;
    /* rooms: timber floor, planks along the long axis */
    clipR(x0,y0,x1,y1,function(){ g.strokeStyle='rgba('+ink+',.2)';
      for(var t=0;t<=(alongX?d:w);t+=.42){ alongX?seg(g,P(x0,y0+t,0),P(x1,y0+t,0)):seg(g,P(x0+t,y0,0),P(x0+t,y1,0)); }
      g.strokeStyle='rgba('+ink+',.12)'; for(var u=0,row=0;u<=span;u+=1.6,row++){ for(var t2=(row%2)*.42;t2<=(alongX?d:w);t2+=.84){ alongX?seg(g,P(x0+u,y0+t2,0),P(x0+u,y0+t2+.42,0)):seg(g,P(x0+t2,y0+u,0),P(x0+t2+.42,y0+u,0)); } } });
    if(!narrow){
      /* corridor: square tiles */
      var cr=alongX?[x0,c0,x1,c1]:[c0,y0,c1,y1]; fillR(cr[0],cr[1],cr[2],cr[3],'#ffffff');
      clipR(cr[0],cr[1],cr[2],cr[3],function(){ g.strokeStyle='rgba('+ink+',.3)'; for(var a=cr[0];a<=cr[2];a+=.6) seg(g,P(a,cr[1],0),P(a,cr[3],0)); for(var b=cr[1];b<=cr[3];b+=.6) seg(g,P(cr[0],b,0),P(cr[2],b,0)); });
      /* core: stair + lift, hatched walls */
      var cc=alongX?[(x0+x1)/2-2.4,c1,(x0+x1)/2+2.4,Math.min(y1-.4,c1+5)]:[c1,(y0+y1)/2-2.4,Math.min(x1-.4,c1+5),(y0+y1)/2+2.4];
      fillR(cc[0],cc[1],cc[2],cc[3],'#ffffff');
      clipR(cc[0],cc[1],cc[2],cc[3],function(){ g.strokeStyle='rgba('+ink+',.55)'; var mx=(cc[0]+cc[2])/2;
        for(var s2=cc[1]+.3;s2<cc[3]-.2;s2+=.3) seg(g,P(cc[0]+.2,s2,0),P(mx-.1,s2,0)); seg(g,P((cc[0]+mx)/2,cc[1]+.3,0),P((cc[0]+mx)/2,cc[3]-.3,0));
        var l=[mx+.3,cc[1]+.6,cc[2]-.3,cc[1]+2.6]; path(g,R(l[0],l[1],l[2],l[3])); g.stroke(); seg(g,P(l[0],l[1],0),P(l[2],l[3],0)); seg(g,P(l[2],l[1],0),P(l[0],l[3],0)); });
      path(g,R(cc[0],cc[1],cc[2],cc[3])); g.strokeStyle='rgba('+ink+',.95)'; g.lineWidth=Math.max(2,.2*k); g.stroke(); g.lineWidth=1;
      /* corridor walls with door openings + swings */
      g.fillStyle='rgba('+ink+',.95)';
      for(i=0;i<n;i++){ var u0=i*step;
        [[c0,-1],[c1,1]].forEach(function(cw){ var dc=u0+step*.62, dw=.9;
          if(alongX){ fillR(x0+u0,cw[0]-.1,x0+dc,cw[0]+.1,'rgba('+ink+',.95)'); fillR(x0+dc+dw,cw[0]-.1,x0+u0+step,cw[0]+.1,'rgba('+ink+',.95)');
            var hx=x0+dc, hy=cw[0], sgn=-cw[1]; g.strokeStyle='rgba('+ink+',.7)'; seg(g,P(hx,hy,0),P(hx,hy+sgn*dw,0)); g.beginPath();
            var A=P(hx,hy,0); g.arc(A[0],A[1],dw*k,sgn>0?Math.PI/2:-Math.PI/2,0,sgn<0); g.stroke(); }
          else { fillR(cw[0]-.1,y0+u0,cw[0]+.1,y0+dc,'rgba('+ink+',.95)'); fillR(cw[0]-.1,y0+dc+dw,cw[0]+.1,y0+u0+step,'rgba('+ink+',.95)'); } });
        /* party walls between flats */
        if(i>0){ if(alongX){ fillR(x0+u0-.1,y0,x0+u0+.1,c0,'rgba('+ink+',.95)'); fillR(x0+u0-.1,c1,x0+u0+.1,y1,'rgba('+ink+',.95)'); }
          else { fillR(x0,y0+u0-.1,c0,y0+u0+.1,'rgba('+ink+',.95)'); fillR(c1,y0+u0-.1,x1,y0+u0+.1,'rgba('+ink+',.95)'); } }
        /* wet room in each flat */
        var wr=alongX?[x0+u0+.25,c1+.25,x0+u0+1.9,c1+2.1]:[c1+.25,y0+u0+.25,c1+2.1,y0+u0+1.9];
        clipR(wr[0],wr[1],wr[2],wr[3],function(){ g.fillStyle='#ffffff'; g.fillRect(-1e4,-1e4,2e4,2e4); g.strokeStyle='rgba('+ink+',.35)';
          for(var a=wr[0];a<=wr[2];a+=.3) seg(g,P(a,wr[1],0),P(a,wr[3],0)); for(var b=wr[1];b<=wr[3];b+=.3) seg(g,P(wr[0],b,0),P(wr[2],b,0)); });
        path(g,R(wr[0],wr[1],wr[2],wr[3])); g.strokeStyle='rgba('+ink+',.9)'; g.lineWidth=1.4; g.stroke(); g.lineWidth=1;
      }
    }
    /* exterior wall: poché with windows */
    var t=.4; g.fillStyle='rgba('+ink+',.97)';
    [[x0,y0,x1,y0+t,'h'],[x0,y1-t,x1,y1,'h'],[x0,y0,x0+t,y1,'v'],[x1-t,y0,x1,y1,'v']].forEach(function(wl){
      path(g,R(wl[0],wl[1],wl[2],wl[3])); g.fill();
      var len=wl[4]==='h'?x1-x0:y1-y0, m=Math.max(1,Math.floor(len/3.2)), off=(len-m*3.2)/2+.85;
      for(var q=0;q<m;q++){ var s0=off+q*3.2, s1=s0+1.5; if(s1>len-.5) break;
        var wr2=wl[4]==='h'?[x0+s0,wl[1],x0+s1,wl[3]]:[wl[0],y0+s0,wl[2],y0+s1];
        fillR(wr2[0],wr2[1],wr2[2],wr2[3],'#ffffff'); g.strokeStyle='rgba('+ink+',.9)';
        if(wl[4]==='h'){ seg(g,P(wr2[0],wr2[1]+t*.35,0),P(wr2[2],wr2[1]+t*.35,0)); seg(g,P(wr2[0],wr2[1]+t*.65,0),P(wr2[2],wr2[1]+t*.65,0)); }
        else { seg(g,P(wr2[0]+t*.35,wr2[1],0),P(wr2[0]+t*.35,wr2[3],0)); seg(g,P(wr2[0]+t*.65,wr2[1],0),P(wr2[0]+t*.65,wr2[3],0)); }
        g.fillStyle='rgba('+ink+',.97)'; } });
    g.restore();
  }
  /* finish tags on the left, title block on the right — like a presentation sheet */
  function paperSheet(g,C,st,ink,al){
    var P=C.P, pb=bbox(PLOT.map(function(p){ return P(p[0],p[1],0); })), c='rgba('+ink+',.92)', c2='rgba('+ink+',.55)';
    g.save(); g.globalAlpha=al; g.lineWidth=1;
    var tags=[[['ШИНЭ','ПЛ-01','ХУЧИЛТЫН ХАВТАН'],[20,26]],[['ШИНЭ','ПЛ-02','ПАРКЕТ'],[9,9]],[['ШИНЭ','ПЛ-03','КЕРАМИК ПЛИТА'],[52,40.5]],[['ОДОО БАЙГАА','НГ-01','ЗҮЛЭГ, МОД'],[14,42]]];
    var tx=Math.max(C.W*.15,pb[0]-150), ty=pb[1]+30, gap=Math.min(86,(pb[3]-pb[1]-40)/tags.length);
    tags.forEach(function(tg,i){ var y=ty+i*gap, bw=86, bh=16;
      txt(g,tg[0][0],tx+bw/2,y-5,{mono:1,s:8,c:c2,a:'center',tr:1});
      g.strokeStyle=c; g.strokeRect(tx,y,bw,bh); seg(g,[tx+bw-18,y],[tx+bw-18,y+bh]);
      txt(g,tg[0][1],tx+(bw-18)/2,y+11.5,{mono:1,s:9.5,c:c,a:'center'}); txt(g,String.fromCharCode(1040+i),tx+bw-9,y+11.5,{mono:1,s:9,c:c,a:'center'});
      txt(g,tg[0][2],tx+bw/2,y+bh+11,{s:8.5,c:c2,a:'center',w:500,tr:.6});
      var to=P(tg[1][0],tg[1][1],0); g.strokeStyle=c2; g.beginPath(); g.moveTo(tx+bw,y+bh/2); g.lineTo(tx+bw+22,y+bh/2); g.lineTo(to[0],to[1]); g.stroke();
      g.beginPath(); g.moveTo(to[0],to[1]); g.lineTo(to[0]-6,to[1]-3); g.lineTo(to[0]-4,to[1]+4); g.closePath(); g.fillStyle=c2; g.fill(); });
    /* title block */
    var bx=pb[2]+28, bw=150, by=pb[1]-10, bh=pb[3]-pb[1]+20; if(bx+bw>C.W*.84) { g.restore(); return; }
    g.strokeStyle=c; g.lineWidth=1.4; g.strokeRect(bx,by,bw,bh); g.lineWidth=1;
    g.fillStyle='#F7991E'; var lx=bx+bw/2, ly=by+30, lr=18; g.beginPath(); for(var j=0;j<6;j++){ var a=Math.PI/6+j*Math.PI/3; j?g.lineTo(lx+Math.cos(a)*lr,ly+Math.sin(a)*lr):g.moveTo(lx+Math.cos(a)*lr,ly+Math.sin(a)*lr); } g.closePath(); g.fill();
    g.fillStyle='#ffffff'; g.fillRect(lx-6,ly-6,12,12); g.fillStyle='#1b1d22'; g.fillRect(lx-4,ly-4,8,8);
    txt(g,'PRIME SPATIAL PLAN',lx,by+66,{s:10,w:700,c:c,a:'center',tr:1}); txt(g,'АРХИТЕКТУР · ТӨЛӨВЛӨЛТ',lx,by+80,{s:7.5,c:c2,a:'center',tr:1});
    var yy=by+96; seg(g,[bx,yy],[bx+bw,yy]);
    ['№','Засвар','Огноо'].forEach(function(h,i){ txt(g,h,bx+[8,30,112][i],yy+13,{mono:1,s:8,c:c2}); });
    for(j=1;j<=4;j++) seg(g,[bx,yy+j*16+4],[bx+bw,yy+j*16+4]); seg(g,[bx+24,yy],[bx+24,yy+68]); seg(g,[bx+106,yy],[bx+106,yy+68]);
    yy+=80; seg(g,[bx,yy],[bx+bw,yy]);
    txt(g,'Төсөл',bx+8,yy+14,{mono:1,s:8,c:c2}); txt(g,'Орон сууцны хотхон',bx+8,yy+30,{s:10,w:600,c:c}); txt(g,'Арвайхээр, Өвөрхангай',bx+8,yy+44,{s:8.5,c:c2});
    var mid=yy+46, low=by+bh-118;
    seg(g,[bx,low],[bx+bw,low]); txt(g,'Хуудас',bx+8,low+14,{mono:1,s:8,c:c2}); txt(g,(st.label&&st.label[1])||'',bx+8,low+30,{s:9,w:600,c:c});
    seg(g,[bx,low+40],[bx+bw,low+40]); txt(g,'Огноо  2026',bx+8,low+56,{mono:1,s:8.5,c:c2}); txt(g,'Масштаб  1:200',bx+8,low+70,{mono:1,s:8.5,c:c2});
    seg(g,[bx,low+80],[bx+bw,low+80]); txt(g,'А-'+((st.label&&st.label[0])||'03'),bx+bw-10,low+110,{s:22,w:700,c:c,a:'right'});
    g.restore();
  }

  /* ---------- states: one per homepage step ---------- */
  var BASE={az:22,el:38,span:110,tx:35,ty:29,tz:12, ctx:1,plotHi:0,land:1,foot:0,plan:0,clouds:0,build:1,explode:0,fac:1,clay:0,model:0,paper:0,call:0,dims:0,levels:0,nor:0};
  function S(o){ var s={}; for(var k in BASE) s[k]=BASE[k]; for(k in o) s[k]=o[k]; return s; }
  var STATES=[
    S({az:24,el:58,span:250,tz:0, plotHi:1,land:0,build:0,fac:0, label:['01','ГАЗРЫН БАЙРШИЛ','Хоосон газар · 1 : 2 000']}),
    S({az:28,el:38,span:128,tz:9, ctx:1,land:1,foot:0,build:1,fac:0,clay:1,model:1, label:['02','ЕРӨНХИЙ ТӨЛӨВЛӨГӨӨ','Масс загвар · 1 : 500']}),
    S({az:0,el:90,span:128,tx:40,ty:29,tz:0, ctx:.6,land:.7,foot:0,plan:1,paper:1,build:0,fac:0,nor:1, label:['03','ТИПИЙН ДАВХРЫН ПЛАН','Өрөөний зохион байгуулалт · 1 : 200']}),
    S({az:0,el:90,span:118,tx:40,ty:29,tz:0, ctx:.5,land:.6,foot:0,plan:1,paper:1,clouds:1,build:0,fac:0,nor:1, label:['04','ЗАСВАРЫН ТЭМДЭГЛЭЛ','Захиалагчтай хэлэлцсэн · 1 : 200']}),
    S({az:22,el:24,span:118,tz:16, ctx:.5,land:.6,build:1,fac:1,levels:1, label:['05','БАРИЛГА БОСОХ','Давхар давхраар · фасад']}),
    S({az:30,el:24,span:200,tz:44, ctx:.25,land:.35,build:1,explode:1,fac:.55, label:['06','ДАВХРЫН ЗАДАРГАА','Давхар бүрийн план']}),
    S({az:34,el:34,span:112,tz:12, ctx:.6,land:.9,build:1,fac:1,clay:1,model:.7, label:null}),
    S({az:22,el:38,span:100,tz:12, ctx:.3,land:1,build:1,fac:1,dims:1, label:['08','ЕРӨНХИЙ ЗАГВАР','Ажлын зураг · 3D']}),
    S({az:16,el:20,span:62,tx:48,ty:28,tz:16, ctx:0,land:1,build:1,fac:1,call:1, label:['09','ЗАНГИЛАА, ШАЛГАЛТ','Орц, фасадын хэсэг']}),
    S({az:22,el:40,span:175,tz:8, ctx:1,land:1,build:1,fac:1, label:['10','БАРИЛГА ОРЧИНДОО','Хүлээлгэн өгөх · 3D']})
  ];
  function lerpState(a,b,t){ var s={}; for(var k in BASE) s[k]=L(a[k],b[k],t); s.label=t<.5?a.label:b.label; s.labelA=Math.abs(t-.5)*2; return s; }

  /* ---------- render one state ---------- */
  function render(g,W,H,st,sc){
    sc=sc||1; W/=sc; H/=sc;
    var pal=PAL[themeName()], ink=pal.ink, clay=st.clay;
    var model=st.model||0, paper=st.paper||0, bg=mixc(mixc(mixc(pal.bg,CLAY.bg,clay),'#d5d4d0',model),'#f4f3ef',paper), sideC=pal.side, topC=pal.top;
    if(clay>.5) ink='46,50,58'; if(paper>.5) ink='26,28,34';
    var inkE='rgba('+ink+','+(.92*(1-clay*(model>.5?.84:.7)))+')';
    g.setTransform(sc,0,0,sc,0,0); g.globalAlpha=1; g.fillStyle=bg; g.fillRect(0,0,W,H);
    var C=cam(W,H,st), P=C.P;
    var LT=[-.45,-.65,.62];
    function shade(nx,ny){ var d=Math.max(0,nx*LT[0]+ny*LT[1]), c=clay>.01?mixc(sideC,mixc('#b8b2a9',CLAY.side,Math.min(1,d*1.4)),clay):sideC; return paper>.01?mixc(c,'#ffffff',paper):c; }

    g.lineWidth=1;
    if(model>.02){ g.save(); g.globalAlpha=model; g.lineCap='round'; g.lineJoin='round';
      ROADS.forEach(function(r){ var q=r.map(function(p){ return P(p[0],p[1],0); });
        g.strokeStyle='#e9e8e4'; g.lineWidth=14*C.k; polyline(g,q); g.strokeStyle='#bdbcb8'; g.lineWidth=8*C.k; polyline(g,q);
        g.strokeStyle='rgba(255,255,255,.55)'; g.lineWidth=Math.max(.6,.18*C.k); g.setLineDash([3*C.k,3*C.k]); polyline(g,q); g.setLineDash([]); });
      g.restore(); }
    if(st.ctx>.02){ g.strokeStyle='rgba('+ink+','+(.5*st.ctx*(1-model))+')'; ROADS.forEach(function(r){ polyline(g,r.map(function(p){ return P(p[0],p[1],0); })); }); }
    /* plot */
    var plot=PLOT.map(function(p){ return P(p[0],p[1],0); });
    path(g,plot); g.fillStyle=mixc(mixc(mixc(pal.site,CLAY.site,clay),'#ecebe7',model),'#fcfbf8',paper); g.fill();
    if(paper>.02){ g.save(); path(g,plot); g.clip(); g.globalAlpha=paper; g.strokeStyle='rgba('+ink+',.13)'; g.lineWidth=1;   /* paving: running-bond pavers */
      for(var py=0,row=0;py<=58;py+=.9,row++){ seg(g,P(0,py,0),P(70,py,0)); for(var px=(row%2)*.9;px<=70;px+=1.8) seg(g,P(px,py,0),P(px,py+.9,0)); }
      LAWNS.forEach(function(l){ var q=l.map(function(p){ return P(p[0],p[1],0); }); path(g,q); g.fillStyle='#fcfbf8'; g.fill(); g.strokeStyle='rgba('+ink+',.5)'; g.stroke();
        var bb=bbox(q); g.fillStyle='rgba('+ink+',.35)'; g.save(); path(g,q); g.clip(); var rr=7;
        for(var sx=bb[0];sx<bb[2];sx+=6) for(var sy=bb[1];sy<bb[3];sy+=6){ rr=(rr*9301+49297)%233280; g.fillRect(sx+(rr%5),sy+(rr%7)*.6,1.1,1.1); } g.restore(); });
      g.restore(); }
    if(model>.02){ g.save(); path(g,plot); g.clip(); g.globalAlpha=model; g.strokeStyle='rgba(120,118,112,.16)'; g.lineWidth=1;
      for(var gx=0;gx<=70;gx+=2.5) seg(g,P(gx,0,0),P(gx,58,0)); for(var gy=0;gy<=58;gy+=2.5) seg(g,P(0,gy,0),P(70,gy,0));
      LAWNS.forEach(function(l){ path(g,l.map(function(p){ return P(p[0],p[1],0); })); g.fillStyle='#a9b98f'; g.fill(); g.strokeStyle='rgba(90,110,70,.35)'; g.stroke(); });
      path(g,circleW(C,52,13,0,3.4,28)); g.fillStyle='#c9b8a4'; g.fill();
      g.restore(); }
    if(st.plotHi>.02){ g.save(); path(g,plot); g.clip(); g.strokeStyle='rgba('+ORc+','+(.45*st.plotHi)+')'; var bb=bbox(plot);
      for(var xx=bb[0]-(bb[3]-bb[1]);xx<bb[2];xx+=6) seg(g,[xx,bb[3]],[xx+(bb[3]-bb[1]),bb[1]]); g.restore(); }
    path(g,plot); g.strokeStyle=st.plotHi>.5?OR:inkE; g.lineWidth=st.plotHi>.5?2:1.3; g.stroke(); g.lineWidth=1;

    /* landscape on the ground */
    if(st.land>.02){ var la=st.land; g.strokeStyle='rgba('+ink+','+(.72*la*(1-clay*.5))+')';
      for(var y=34;y<=56;y+=2.6) seg(g,P(.8,y,0),P(5.8,y,0)); seg(g,P(5.8,33,0),P(5.8,56.5,0));
      var e0=[44,0], e1=[70,22], el=Math.hypot(e1[0]-e0[0],e1[1]-e0[1]), ux=(e1[0]-e0[0])/el, uy=(e1[1]-e0[1])/el, nx=-uy, ny=ux;
      for(var u=3;u<el-2;u+=2.6) seg(g,P(e0[0]+ux*u+nx*.6,e0[1]+uy*u+ny*.6,0),P(e0[0]+ux*u+nx*5.6,e0[1]+uy*u+ny*5.6,0));
      polyline(g,[P(e0[0]+ux*3+nx*5.6,e0[1]+uy*3+ny*5.6,0),P(e0[0]+ux*(el-2)+nx*5.6,e0[1]+uy*(el-2)+ny*5.6,0)]);
      polyline(g,[P(34,0,0),P(34,22,0),P(36,26,0)]); polyline(g,[P(38,0,0),P(38,20,0)]);
      polyline(g,[P(8,30,0),P(36,30,0)]); polyline(g,[P(8,33,0),P(30,33,0),P(36,38,0),P(36,56,0)]);
      g.beginPath(); for(var a=0;a<=1.0001;a+=.05){ var q=P(24+Math.cos(Math.PI*(.2+a*.9))*12,40+Math.sin(Math.PI*(.2+a*.9))*9,0); a?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]); } g.stroke();
      [[52,13,3.4],[52,13,2.2]].forEach(function(c){ path(g,circleW(C,c[0],c[1],0,c[2],28)); g.stroke(); });
      if(paper<.5) TREES.forEach(function(t,i){ path(g,circleW(C,t[0],t[1],0,1.4+(i%3)*.4,14)); g.stroke(); });
    }
    /* footprints */
    if(st.foot>.02){ BL.forEach(function(b){ if(b.roof||b.entr) return; var q=rectPoly(b.r).map(function(p){ return P(p[0],p[1],0); });
      g.globalAlpha=st.foot; path(g,q); g.fillStyle=mixc(pal.foot,CLAY.foot,clay); g.fill(); g.strokeStyle=inkE; g.stroke(); g.globalAlpha=1; }); }
    /* floor plans on the ground */
    if(st.plan>.02){ BL.forEach(function(b){ if(b.roof||b.entr) return; var q=rectPoly(b.r).map(function(p){ return P(p[0],p[1],0); });
        g.globalAlpha=st.plan; path(g,q); g.fillStyle=pal.top; g.fill(); g.strokeStyle='rgba('+ink+',.95)'; g.lineWidth=2.2; g.stroke(); g.lineWidth=1; g.globalAlpha=1;
        if(paper>.5) planDetail(g,C,b.r,ink,st.plan); else planLines(g,C,b.r,0,st.plan,ink); });
      g.globalAlpha=st.plan; [[5,'1'],[16,'2'],[27,'3']].forEach(function(x){ g.strokeStyle='rgba('+ink+',.3)'; g.setLineDash([10,4,2,4]); seg(g,P(x[0],2,0),P(x[0],-4,0)); g.setLineDash([]);
        var b=P(x[0],-6,0); g.beginPath(); g.arc(b[0],b[1],9,0,7); g.strokeStyle='rgba('+ink+',.6)'; g.stroke(); txt(g,x[1],b[0],b[1]+.5,{mono:1,s:9.5,c:'rgba('+ink+',.8)',a:'center',b:'middle'}); });
      g.globalAlpha=1; }

    if(paper>.02){ g.save(); g.globalAlpha=paper*st.land;
      MTREES.concat(TREES.map(function(t,i){ return [t[0],t[1],1.5+(i%3)*.4]; })).forEach(function(t,i){ if(t[0]<-4||t[0]>74||t[1]<-4||t[1]>62) return;
        var c=P(t[0],t[1],0), R=t[2]*1.25*C.k, n=18; g.strokeStyle='rgba('+ink+',.85)'; g.lineWidth=.9; g.beginPath();
        for(var j=0;j<n;j++){ var a=j/n*Math.PI*2+i, r1=R*(j%2?.55:1); g.moveTo(c[0]+Math.cos(a)*R*.12,c[1]+Math.sin(a)*R*.12); g.lineTo(c[0]+Math.cos(a)*r1,c[1]+Math.sin(a)*r1); }
        g.stroke(); g.beginPath(); g.arc(c[0],c[1],1.6,0,7); g.fillStyle='rgba('+ink+',.9)'; g.fill(); });
      g.restore(); }
    /* solids in painter's order */
    var items=[];
    function push(o){ var cx=0,cy=0; o.poly.forEach(function(p){ cx+=p[0]; cy+=p[1]; }); cx/=o.poly.length; cy/=o.poly.length; o.depth=P(cx,cy,(o.z0+o.z1)/2)[2]; items.push(o); }
    var base={edge:inkE,top:mixc(mixc(topC,CLAY.top,clay),'#ffffff',paper),ink:ink,clay:clay,side:shade};
    function mk(o){ for(var k in base) if(o[k]===undefined) o[k]=base[k]; return o; }
    if(st.ctx>.02){ CTXB.forEach(function(b){ push(mk({poly:rectPoly(b),z0:0,z1:b[4],a:st.ctx})); });
      CYL.forEach(function(c){ var q=[]; for(var i=0;i<14;i++){ var a=i/14*Math.PI*2; q.push([c[0]+Math.cos(a)*c[2],c[1]+Math.sin(a)*c[2]]); } push(mk({poly:q,z0:0,z1:c[3],a:st.ctx})); }); }
    if(st.land>.02){ PAV.forEach(function(p){ push(mk({poly:rectPoly([p[0]-p[2]/2,p[1]-p[2]/2,p[0]+p[2]/2,p[1]+p[2]/2]),z0:0,z1:2.6,a:st.land,pyr:1,cx:p[0],cy:p[1]})); });
      GREEN.forEach(function(p){ push(mk({poly:rectPoly([p[0]-p[2]/2,p[1]-p[3]/2,p[0]+p[2]/2,p[1]+p[3]/2]),z0:0,z1:2.2,a:st.land})); });
      [[49,15,1.2,1.2,1.6],[55,11,1.6,.8,1.2],[51,9.5,1,1,2.2]].forEach(function(p){ push(mk({poly:rectPoly([p[0],p[1],p[0]+p[2],p[1]+p[3]]),z0:0,z1:p[4],a:st.land})); }); }
    if(st.build>.001){
      BL.forEach(function(b){ var s0=b.s||0, vis=st.build*MAXF[b.t];
        for(var i=0;i<b.f;i++){ var gi=s0+i; if(gi>=vis) break; var frac=Math.min(1,vis-gi);
          var z0=gi*FH+gi*st.explode*EX, hh=(b.entr?3.3:FH)*frac, top=(gi===s0+b.f-1);
          push(mk({poly:rectPoly(b.r),z0:z0,z1:z0+hh,g:gi,bay:b.bay,fac:st.fac*(frac>.98?1:frac),det:facade,
            topDet:(st.explode>.05&&!b.bay&&!b.entr)?(function(r,ex){ return function(g2,C2,o){ planLines(g2,C2,r,o.z1,ex,o.ink); }; })(b.r,st.explode):null,
            parapet:top&&!b.bay&&!b.entr})); } });
    }
    if(model>.02){
      MTREES.concat(TREES.map(function(t,i){ return [t[0],t[1],1.4+(i%3)*.4]; })).forEach(function(t){ var h=2.2+t[2];
        items.push({tree:1,x:t[0],y:t[1],r:t[2],h:h,a:model,depth:P(t[0],t[1],h)[2]}); });
      /* shadows: sun from the north-west */
      var SV=[.62,-.48], sp=new Path2D();
      function hull(pts){ pts.sort(function(a,b){ return a[0]-b[0]||a[1]-b[1]; }); function cr(o,a,b){ return (a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]); }
        var lo=[],up=[]; pts.forEach(function(p){ while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0) lo.pop(); lo.push(p); });
        for(var i=pts.length-1;i>=0;i--){ var p=pts[i]; while(up.length>1&&cr(up[up.length-2],up[up.length-1],p)<=0) up.pop(); up.push(p); } up.pop(); lo.pop(); return lo.concat(up); }
      items.forEach(function(o){ if(o.tree){ var c=P(o.x+SV[0]*o.h*.8,o.y+SV[1]*o.h*.8,0); sp.ellipse(c[0],c[1],o.r*C.k*1.1,o.r*C.k*.7,0,0,7); return; }
        if(o.z0>.01&&!o.g) return; var hgt=o.z1, pts=[]; o.poly.forEach(function(p){ pts.push([p[0],p[1]]); pts.push([p[0]+SV[0]*hgt,p[1]+SV[1]*hgt]); });
        var hp=hull(pts).map(function(p){ return P(p[0],p[1],0); }); hp.forEach(function(p,i){ i?sp.lineTo(p[0],p[1]):sp.moveTo(p[0],p[1]); }); sp.closePath(); });
      g.save(); g.globalAlpha=model; g.filter='blur('+Math.max(1,Math.round(C.k*.45))+'px)'; g.fillStyle='rgba(70,66,58,.2)'; g.fill(sp,'nonzero'); g.restore(); g.filter='none';
    }
    items.sort(function(a,b){ return a.depth-b.depth; });
    items.forEach(function(o){
      if(o.tree){ var b=P(o.x,o.y,0), c=P(o.x,o.y,o.h), rr=o.r*C.k; g.globalAlpha=o.a;
        g.strokeStyle='#8a7d6a'; g.lineWidth=Math.max(1,.22*C.k); seg(g,b,[c[0],c[1]+rr*.6]);
        var gr=g.createRadialGradient(c[0]-rr*.35,c[1]-rr*.4,rr*.1,c[0],c[1],rr*1.05); gr.addColorStop(0,'#9fb47e'); gr.addColorStop(.6,'#6f8a52'); gr.addColorStop(1,'#4d6539');
        g.beginPath(); g.arc(c[0],c[1],rr,0,7); g.fillStyle=gr; g.fill(); g.globalAlpha=1; return; }
      prism(g,C,o);
      if(o.parapet&&C.v[2]>.05){ var r=o.poly, q=[[r[0][0]+.45,r[0][1]+.45],[r[1][0]-.45,r[1][1]+.45],[r[2][0]-.45,r[2][1]-.45],[r[3][0]+.45,r[3][1]-.45]].map(function(p){ return P(p[0],p[1],o.z1); });
        g.globalAlpha=o.a==null?1:o.a; path(g,q); g.strokeStyle='rgba('+ink+','+(.5*(1-clay*.6))+')'; g.lineWidth=1; g.stroke(); g.globalAlpha=1; }
      if(o.pyr){ var apex=P(o.cx,o.cy,o.z1+1.6), t=o.poly.map(function(p){ return P(p[0],p[1],o.z1); });
        g.globalAlpha=o.a; for(var i=0;i<4;i++){ path(g,[t[i],t[(i+1)%4],apex]); g.fillStyle=o.top; g.fill(); g.strokeStyle=o.edge; g.stroke(); } g.globalAlpha=1; }
    });

    /* annotations */
    var la=st.labelA==null?1:st.labelA;
    if(st.dims>.02){
      if(st.build<.1){ for(var i=0;i<PLOT.length;i++){ var a2=PLOT[i], b2=PLOT[(i+1)%PLOT.length]; dim(g,C,a2,b2,-22,(Math.hypot(b2[0]-a2[0],b2[1]-a2[1])*1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,' '),st.dims*(1-st.build*10)); } }
      else { dim(g,C,[5,5,0],[27,5,0],24,'22 000',st.dims); dim(g,C,[46,27,0],[58,27,0],24,'12 000',st.dims); }
    }
    if(st.levels>.02&&st.build>.05){ g.globalAlpha=st.levels;
      [[0,'±0.000'],[15,'+15.000'],[33,'+33.000'],[36,'+36.000']].forEach(function(l){ if(l[0]>st.build*36+.1) return; var p=P(3,5,l[0]), x=p[0]-80; g.strokeStyle=OR; g.lineWidth=1; seg(g,[x,p[1]],[p[0]-8,p[1]]);
        g.beginPath(); g.moveTo(x+12,p[1]); g.lineTo(x+7,p[1]-8); g.lineTo(x+17,p[1]-8); g.closePath(); g.stroke(); txt(g,l[1],x,p[1]-12,{mono:1,s:10,c:OR}); });
      g.globalAlpha=1; }
    if(st.clouds>.02){ var q=rectPoly([58,31,66,52]).map(function(p){ return P(p[0],p[1],0); }), bx=bbox(q);
      g.globalAlpha=st.clouds; cloud(g,bx[0]-10,bx[1]-10,bx[2]-bx[0]+20,bx[3]-bx[1]+20,12);
      var tx=bx[0]+2, ty=bx[3]+30; g.beginPath(); g.moveTo(tx,ty-9); g.lineTo(tx+9,ty+7); g.lineTo(tx-9,ty+7); g.closePath(); g.strokeStyle=OR; g.lineWidth=1.3; g.stroke(); txt(g,'1',tx,ty+4.5,{mono:1,s:9,c:OR,a:'center',w:600});
      txt(g,'Далавчийг 2 м өргөтгөх',tx+16,ty+5,{s:11,w:600,c:OR});
      var q2=bbox(rectPoly([12,3,20,5]).map(function(p){ return P(p[0],p[1],0); })); cloud(g,q2[0]-8,q2[1]-8,q2[2]-q2[0]+16,q2[3]-q2[1]+16,8);
      txt(g,'2  Орцны байршил',q2[2]+18,q2[3]+4,{s:11,w:600,c:OR}); g.globalAlpha=1; }
    if(st.call>.02){ [[52,24,3.3,'Орцны саравч'],[46,30,7.5,'Фасадын хавтан, бэхэлгээ'],[46,40,16.5,'Цонхны нүх, хэмжээс'],[52,40,39.6,'Дээврийн парапет'],[46,27,0,'Суурь, гадна талбай']].forEach(function(c,i){
        var p=P(c[0],c[1],c[2]); leader(g,p,W*(C.port?.06:.6),H*(C.port?.15:.14)+i*(C.port?30:46),c[3],ink,st.call); }); }
    if(st.nor>.02) north(g,W*(C.port?.1:.22),H*(C.port?.24:.2),ink,st.nor);
    if(model<.5) ucs(g,C,ink);
    if(!C.port) sheet(g,W*.3,H*.12,st.label,ink,la*(1-clay)*(1-paper));
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
