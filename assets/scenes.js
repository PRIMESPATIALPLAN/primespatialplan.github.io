/* Prime Spatial Plan — painted scenes shared by every page (homepage voyage, page heroes, transitions). */
(function(){
  /* ---------- painting helpers ---------- */
  function rng(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0; var t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
  function grad(ctx,y0,y1,stops){ var g=ctx.createLinearGradient(0,y0,0,y1); stops.forEach(function(s){ g.addColorStop(s[0],s[1]); }); return g; }
  function ridge(ctx,W,H,base,amp,seed,fill){
    var r=rng(seed), f=[r()*.004+.002, r()*.01+.006, r()*.03+.015], p=[r()*6, r()*6, r()*6];
    ctx.beginPath(); ctx.moveTo(0,H);
    for(var x=0;x<=W+4;x+=4){
      var y=base-amp*(.55*Math.sin(x*f[0]*1000/W+p[0])+.3*Math.sin(x*f[1]*1000/W+p[1])+.15*Math.sin(x*f[2]*1000/W+p[2]));
      ctx.lineTo(x,y);
    }
    ctx.lineTo(W,H); ctx.closePath(); ctx.fillStyle=fill; ctx.fill();
  }
  function glow(ctx,x,y,r,color){ var g=ctx.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,color); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=g; ctx.fillRect(x-r,y-r,r*2,r*2); }
  function grass(ctx,W,H,hz,r,n,rgb){
    ctx.lineCap='round';
    for(var i=0;i<n;i++){
      var y=hz+H*.05+Math.pow(r(),.7)*(H-hz-H*.05), x=r()*W, d=(y-hz)/(H-hz), len=H*(.004+d*.022);
      ctx.strokeStyle='rgba('+rgb[0]+','+(rgb[1]+r()*50|0)+','+(rgb[2]+r()*30|0)+','+(.04+d*.12*r())+')';
      ctx.lineWidth=.6+d*1.2; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+(r()-.5)*len*.6,y-len); ctx.stroke();
    }
  }
  /* isometric projection of a 12 x 8.4 m house standing on the ground */
  function iso(W,H,hz){
    var u=Math.min(H*.024,W*.026), c=Math.cos(Math.PI/6), s=.31, ox=W>H?W*.6:W*.5, oy=hz+Math.min(H*.2,W*.2);
    return function(x,y,z){ return [ox+(x-y)*c*u-(1.8)*c*u, oy+(x+y)*s*u-z*u-10.2*s*u]; };
  }
  function poly(ctx,pts,fill,stroke,lw){ ctx.beginPath(); pts.forEach(function(q,k){ k?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]); }); ctx.closePath();
    if(fill){ ctx.fillStyle=fill; ctx.fill(); } if(stroke){ ctx.strokeStyle=stroke; ctx.lineWidth=lw||1; ctx.stroke(); } }

  /* blueprint ground + grid */
  function blueprint(ctx,W,H){
    ctx.fillStyle='#0b2847'; ctx.fillRect(0,0,W,H);
    var step=Math.max(18,Math.round(H/40)); ctx.lineWidth=1;
    for(var x=0;x<W;x+=step){ ctx.strokeStyle=(Math.round(x/step)%5===0)?'rgba(255,255,255,.1)':'rgba(255,255,255,.04)'; ctx.beginPath(); ctx.moveTo(x+.5,0); ctx.lineTo(x+.5,H); ctx.stroke(); }
    for(var y=0;y<H;y+=step){ ctx.strokeStyle=(Math.round(y/step)%5===0)?'rgba(255,255,255,.1)':'rgba(255,255,255,.04)'; ctx.beginPath(); ctx.moveTo(0,y+.5); ctx.lineTo(W,y+.5); ctx.stroke(); }
  }
  function vignette(ctx,W,H){ var v=ctx.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,Math.max(W,H)*.75); v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,'rgba(0,8,20,.55)'); ctx.fillStyle=v; ctx.fillRect(0,0,W,H); }
  var W8='rgba(235,244,255,.92)', W3='rgba(235,244,255,.3)', OR='#F7991E';
  function st(ctx,d,color,w,dash){ ctx.strokeStyle=color; ctx.lineWidth=w; ctx.setLineDash(dash||[]); ctx.stroke(new Path2D(d)); ctx.setLineDash([]); }
  /* fit a drawing of size dw x dh into the screen; returns nothing, leaves ctx transformed (call ctx.restore) */
  function frame(ctx,W,H,dw,dh,fw,fh,cx,cy){ if(W<H){ fw=.92; fh*=.5; cx=.5; cy=Math.min(cy+.17,.66); } var s=Math.min(W*fw/dw,H*fh/dh); ctx.save(); ctx.translate(W*cx-dw/2*s,H*cy-dh/2*s); ctx.scale(s,s); return s; }
  function planLines(ctx,o){
    st(ctx,'M80 40V380M220 40V380M360 40V380M480 40V380M44 80H510M44 220H510M44 360H510',W3,.8,[10,4,2,4]);
    if(o.dims) st(ctx,'M80 52H480M80 46V58M220 46V58M480 46V58M75 57 85 47M215 57 225 47M475 57 485 47M80 30H480M80 24V36M480 24V36M75 35 85 25M475 35 485 25',OR,1);
    if(o.stair) st(ctx,'M150 232H210M150 248H210M150 264H210M150 280H210M150 296H210M150 312H210M150 328H210M180 340V236M176 244 180 236 184 244',W3,.9);
    st(ctx,'M80 80H480V360H80Z',W8,5);
    if(o.walls) st(ctx,'M220 80V150M220 186V300M220 336V360M80 220H110M140 220H290M326 220H480M360 220V290M360 326V360M150 220V360',W8,3);
    if(o.doors) st(ctx,'M220 150 256 150M220 150A36 36 0 0 1 256 186M290 220 290 256M290 220A36 36 0 0 0 326 256M360 290 396 290M360 290A36 36 0 0 1 396 326M110 220 110 248M110 220A30 30 0 0 0 140 248',W3,.9);
    if(o.windows){ ctx.fillStyle='#0b2847'; [[290,77,90,6],[120,77,60,6],[250,357,70,6],[390,357,60,6],[477,110,6,70]].forEach(function(q){ ctx.fillRect(q[0],q[1],q[2],q[3]); });
      st(ctx,'M290 78H380M290 82H380M120 78H180M120 82H180M250 358H320M250 362H320M390 358H450M390 362H450M478 110V180M482 110V180',W8,1); }
    [[80,398,'1'],[220,398,'2'],[360,398,'3'],[480,398,'4'],[26,80,'А'],[26,220,'Б'],[26,360,'В']].forEach(function(b){
      ctx.beginPath(); ctx.arc(b[0],b[1],11,0,7); ctx.strokeStyle=W3; ctx.lineWidth=1; ctx.stroke();
      ctx.fillStyle='rgba(235,244,255,.6)'; ctx.font='10px Menlo, monospace'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(b[2],b[0],b[1]); });
    ctx.textBaseline='alphabetic'; ctx.textAlign='center';
    if(o.dims){ ctx.fillStyle=OR; ctx.font='10px Menlo, monospace'; ctx.fillText('4 200',150,46); ctx.fillText('7 800',350,46); ctx.fillText('12 000',280,24); }
    if(o.labels) [['Гал тогоо','17.6 м²',150,148],['Зочны өрөө','32.8 м²',350,148],['Унтлагын өрөө','17.6 м²',290,300],['Ажлын өрөө','15.1 м²',420,257],['АЦӨ','8.8 м²',115,294]].forEach(function(t){
      ctx.fillStyle=W8; ctx.font='500 11px Onest, Arial, sans-serif'; ctx.fillText(t[0],t[2],t[3]);
      ctx.fillStyle='rgba(235,244,255,.55)'; ctx.font='9.5px Menlo, monospace'; ctx.fillText(t[1],t[2],t[3]+15); });
  }
  function cloud(ctx,x,y,w,h,r){
    ctx.beginPath(); var n, i, s;
    n=Math.max(2,Math.round(w/(2*r))); s=w/n; for(i=0;i<n;i++) ctx.arc(x+s*(i+.5),y,s/2,Math.PI,0);
    n=Math.max(2,Math.round(h/(2*r))); s=h/n; for(i=0;i<n;i++) ctx.arc(x+w,y+s*(i+.5),s/2,-Math.PI/2,Math.PI/2);
    n=Math.max(2,Math.round(w/(2*r))); s=w/n; for(i=n-1;i>=0;i--) ctx.arc(x+s*(i+.5),y+h,s/2,0,Math.PI);
    n=Math.max(2,Math.round(h/(2*r))); s=h/n; for(i=n-1;i>=0;i--) ctx.arc(x,y+s*(i+.5),s/2,Math.PI/2,Math.PI*1.5);
    ctx.strokeStyle=OR; ctx.lineWidth=1.6; ctx.stroke();
  }
  function tick(ctx,x,y,r){ ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fillStyle='rgba(247,153,30,.16)'; ctx.fill(); ctx.strokeStyle=OR; ctx.lineWidth=1.5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x-r*.45,y); ctx.lineTo(x-r*.1,y+r*.38); ctx.lineTo(x+r*.5,y-r*.4); ctx.lineWidth=2; ctx.stroke(); }

  /* ---------- the ten scenes ---------- */

  /* 01 Request — dawn over the steppe, a track leading to an empty plot */
  function s01(ctx,W,H){
    var r=rng(101), hz=H*.62;
    ctx.fillStyle=grad(ctx,0,hz,[[0,'#232c4a'],[.45,'#6f6f99'],[.8,'#d8a7a3'],[1,'#f3cdb0']]); ctx.fillRect(0,0,W,hz+4);
    glow(ctx,W*.3,hz,H*.5,'rgba(255,214,180,.45)');
    for(var i=0;i<8;i++){ ctx.fillStyle='rgba(255,220,210,'+(.05+r()*.08)+')'; ctx.beginPath(); ctx.ellipse(r()*W,H*.1+r()*hz*.5,W*(.06+r()*.15),H*(.007+r()*.012),0,0,7); ctx.fill(); }
    ridge(ctx,W,H,hz,H*.055,12,'#6d6584');
    ridge(ctx,W,H,hz+H*.012,H*.03,13,'#4a4561');
    ridge(ctx,W,H,hz+H*.03,H*.01,14,grad(ctx,hz,H,[[0,'#3a3644'],[1,'#121016']]));
    grass(ctx,W,H,hz,r,2000,[220,190,170]);
    ctx.strokeStyle='rgba(255,230,210,.22)'; ctx.lineCap='round';
    [-1,1].forEach(function(sd){ ctx.lineWidth=H*.004; ctx.beginPath(); ctx.moveTo(W*.5+sd*W*.06,H); ctx.bezierCurveTo(W*.52+sd*W*.03,H*.82,W*.4+sd*W*.012,H*.74,W*.47+sd*W*.004,hz+H*.04); ctx.stroke(); });
  }

  /* 02 Brief — dusk, survey stakes marking out the plot */
  function s02(ctx,W,H){
    var r=rng(11), hz=H*.63;
    ctx.fillStyle=grad(ctx,0,hz,[[0,'#1d1a31'],[.38,'#56324d'],[.72,'#c4674a'],[1,'#f1b46c']]); ctx.fillRect(0,0,W,hz+4);
    glow(ctx,W*.66,hz-H*.03,H*.55,'rgba(255,196,128,.55)');
    ctx.fillStyle='#ffe6b8'; ctx.beginPath(); ctx.arc(W*.66,hz-H*.03,H*.028,0,7); ctx.fill();
    for(var i=0;i<9;i++){ ctx.fillStyle='rgba(255,190,150,'+(.05+r()*.09)+')'; ctx.beginPath(); ctx.ellipse(r()*W,H*.08+r()*hz*.5,W*(.06+r()*.16),H*(.008+r()*.014),0,0,7); ctx.fill(); }
    ridge(ctx,W,H,hz,H*.06,3,'#7b4b58');
    ridge(ctx,W,H,hz+H*.012,H*.035,7,'#523142');
    ridge(ctx,W,H,hz+H*.03,H*.012,9,grad(ctx,hz,H,[[0,'#3d2830'],[1,'#120c0e']]));
    glow(ctx,W*.66,hz+H*.03,H*.25,'rgba(255,170,110,.18)');
    grass(ctx,W,H,hz,r,2200,[255,150,100]);
    var pts=[[.47,.80],[.71,.80],[.645,.705],[.525,.705]].map(function(q){ return [q[0]*W,q[1]*H]; });
    ctx.setLineDash([H*.006,H*.006]); poly(ctx,pts,null,'rgba(255,236,214,.5)',1.2); ctx.setLineDash([]);
    pts.forEach(function(q,k){ var h=H*(k<2?.045:.03);
      ctx.strokeStyle='#efe6da'; ctx.lineWidth=k<2?2.2:1.6; ctx.beginPath(); ctx.moveTo(q[0],q[1]); ctx.lineTo(q[0],q[1]-h); ctx.stroke();
      ctx.fillStyle=OR; ctx.beginPath(); ctx.moveTo(q[0],q[1]-h); ctx.lineTo(q[0]+h*.4,q[1]-h*.86); ctx.lineTo(q[0],q[1]-h*.72); ctx.fill(); });
  }

  /* 03 Layout — blueprint with zoning bubbles and circulation */
  function s03(ctx,W,H){
    blueprint(ctx,W,H);
    frame(ctx,W,H,540,420,.6,.66,.56,.47);
    planLines(ctx,{});
    [[150,150,58,52,'Гал тогоо'],[350,150,110,52,'Зочны өрөө'],[290,290,58,52,'Унтлагын өрөө'],[420,290,48,52,'Ажлын өрөө'],[115,290,28,52,'АЦӨ']].forEach(function(b){
      ctx.beginPath(); ctx.ellipse(b[0],b[1],b[2],b[3],0,0,7); ctx.fillStyle='rgba(120,180,255,.16)'; ctx.fill(); ctx.strokeStyle='rgba(235,244,255,.55)'; ctx.lineWidth=1.2; ctx.stroke();
      ctx.fillStyle=W8; ctx.font='500 11px Onest, Arial, sans-serif'; ctx.textAlign='center'; ctx.fillText(b[4],b[0],b[1]+4); });
    ctx.strokeStyle=OR; ctx.lineWidth=1.6; ctx.setLineDash([6,5]);
    var a=new Path2D('M60 290 C120 250 170 225 220 220 C270 215 300 190 330 160 M220 220 C260 240 270 255 280 268 M330 220 C370 240 395 258 410 270');
    ctx.stroke(a); ctx.setLineDash([]);
    [[330,160,-.8],[280,268,.9],[410,270,.7]].forEach(function(h){ ctx.save(); ctx.translate(h[0],h[1]); ctx.rotate(h[2]); ctx.beginPath(); ctx.moveTo(-6,-4); ctx.lineTo(0,0); ctx.lineTo(-6,4); ctx.stroke(); ctx.restore(); });
    ctx.restore(); vignette(ctx,W,H);
  }

  /* 04 Review — the plan with revision clouds and markups */
  function s04(ctx,W,H){
    blueprint(ctx,W,H);
    frame(ctx,W,H,540,420,.6,.66,.56,.47);
    planLines(ctx,{dims:true,stair:true,walls:true,doors:true,windows:true,labels:true});
    cloud(ctx,330,100,140,90,10); cloud(ctx,96,232,48,118,9);
    ctx.fillStyle=OR; ctx.font='italic 600 12px Onest, Arial, sans-serif'; ctx.textAlign='left';
    ctx.fillText('+600 өргөтгөх',478,96); ctx.fillText('цонх нэмэх',30,372);
    st(ctx,'M470 92 L474 100M70 362 Q86 350 100 344',OR,1.2);
    ctx.restore(); vignette(ctx,W,H);
  }

  /* 05 Façade — blue hour, the south elevation sketched in white */
  function s05(ctx,W,H){
    var r=rng(51), hz=H*.66;
    ctx.fillStyle=grad(ctx,0,hz,[[0,'#0a1322'],[.6,'#1f3553'],[1,'#7690ad']]); ctx.fillRect(0,0,W,hz+4);
    for(var i=0;i<120;i++){ ctx.fillStyle='rgba(255,255,255,'+(r()*.5)+')'; ctx.fillRect(r()*W,r()*hz*.6,1,1); }
    ridge(ctx,W,H,hz,H*.05,15,'#22344c');
    ridge(ctx,W,H,hz+H*.02,H*.01,16,grad(ctx,hz,H,[[0,'#17222f'],[1,'#080c12']]));
    var s=Math.min(W*.6/640,H*.62/400), gx=(W>H?W*.58:W*.5)-320*s, gy=hz+H*.03-330*s;
    for(var k=0;k<2;k++){
      ctx.save(); ctx.translate(gx+(k?1.2:0),gy+(k?.8:0)); ctx.scale(s,s);
      var c=k?'rgba(240,246,255,.35)':'rgba(240,246,255,.9)';
      st(ctx,'M40 330H600',c,2.5);
      st(ctx,'M112 88h416v12H112ZM120 100h400v230H120ZM300 240h160v90H300ZM340 240V330M380 240V330M420 240V330M170 245h44v85H170ZM240 252h36v40H240ZM160 130h80v62H160ZM200 130V192M300 130h80v62H300ZM340 130V192M420 130h60v62H420ZM156 240H232',c,1.6);
      st(ctx,'M120 220H520',c.replace(/[\d.]+\)$/,'.35)'),1,[6,4]);
      if(!k){ st(ctx,'M520 330H556M520 220H556M520 100H556M528 88H556',OR,1);
        ctx.fillStyle=OR; ctx.font='11px Menlo, monospace'; ctx.textAlign='left';
        [['±0.000',334],['+3.300',224],['+6.600',104],['+7.200',84]].forEach(function(t){ ctx.fillText(t[0],562,t[1]); }); }
      ctx.restore();
    }
  }

  /* 06 3D sketch — wireframe axonometric on the plot */
  function s06(ctx,W,H){
    var r=rng(21), hz=H*.64;
    ctx.fillStyle=grad(ctx,0,hz,[[0,'#0a1322'],[.6,'#1f3553'],[1,'#7690ad']]); ctx.fillRect(0,0,W,hz+4);
    for(var i=0;i<120;i++){ ctx.fillStyle='rgba(255,255,255,'+(r()*.5)+')'; ctx.fillRect(r()*W,r()*hz*.6,1,1); }
    ridge(ctx,W,H,hz,H*.05,5,'#22344c');
    ridge(ctx,W,H,hz+H*.02,H*.012,8,grad(ctx,hz,H,[[0,'#17222f'],[1,'#080c12']]));
    var pt=iso(W,H,hz);
    function line(a,b,al,w){ for(var k=0;k<2;k++){ var j=k?1.2:0; ctx.strokeStyle='rgba(240,246,255,'+(al*(k?.45:1))+')'; ctx.lineWidth=w||1.4;
      ctx.beginPath(); ctx.moveTo(a[0]+(r()-.5)*j,a[1]+(r()-.5)*j); ctx.lineTo(b[0]+(r()-.5)*j,b[1]+(r()-.5)*j); ctx.stroke(); } }
    function box(x0,y0,z0,x1,y1,z1,a){ var v=[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]].map(function(q){ return pt(q[0],q[1],q[2]); });
      [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(function(e){ line(v[e[0]],v[e[1]],a); }); }
    line(pt(-3,8.4,0),pt(15,8.4,0),.18,1); line(pt(12,-3,0),pt(12,11.4,0),.18,1);
    line(pt(-3,0,0),pt(15,0,0),.1,1); line(pt(0,-3,0),pt(0,11.4,0),.1,1);
    line(pt(12,8.4,0),pt(12,8.4,9),.15,1); line(pt(0,8.4,0),pt(0,8.4,8.5),.12,1);
    box(0,0,0,12,8.4,6.6,.9); box(-.2,-.2,6.6,12.2,8.6,7.2,.75);
    line(pt(0,8.4,3.3),pt(12,8.4,3.3),.5); line(pt(12,0,3.3),pt(12,8.4,3.3),.5);
    function wy(x0,x1,z0,z1){ var y=8.4; line(pt(x0,y,z0),pt(x1,y,z0),.75); line(pt(x1,y,z0),pt(x1,y,z1),.75); line(pt(x1,y,z1),pt(x0,y,z1),.75); line(pt(x0,y,z1),pt(x0,y,z0),.75); }
    function wx(y0,y1,z0,z1){ var x=12; line(pt(x,y0,z0),pt(x,y1,z0),.75); line(pt(x,y1,z0),pt(x,y1,z1),.75); line(pt(x,y1,z1),pt(x,y0,z1),.75); line(pt(x,y0,z1),pt(x,y0,z0),.75); }
    wy(1.2,3.6,4.2,6); wy(5.4,7.8,4.2,6); wy(9,10.8,4.2,6); wy(5.4,10.2,.6,2.7); wy(1.5,2.8,0,2.5);
    wx(1.2,3,4.2,6); wx(4.5,7,4.2,6); wx(1.5,6.5,.6,2.7);
    ctx.fillStyle=OR; ctx.font='500 '+Math.round(H*.016)+'px Onest, Arial, sans-serif'; ctx.textAlign='center';
    var a=pt(6,9.9,0); ctx.fillText('12 000',a[0],a[1]+H*.012);
    var b=pt(13.6,4.2,0); ctx.fillText('8 400',b[0]+H*.02,b[1]+H*.01);
    ctx.strokeStyle='rgba(247,153,30,.8)'; ctx.lineWidth=1;
    var d0=pt(0,9.6,0), d1=pt(12,9.6,0); ctx.beginPath(); ctx.moveTo(d0[0],d0[1]); ctx.lineTo(d1[0],d1[1]); ctx.stroke();
    var e0=pt(12.9,0,0), e1=pt(12.9,8.4,0); ctx.beginPath(); ctx.moveTo(e0[0],e0[1]); ctx.lineTo(e1[0],e1[1]); ctx.stroke();
  }

  /* 07 Approval — clear morning, the design as a solid massing model */
  function s07(ctx,W,H){
    var r=rng(71), hz=H*.64;
    ctx.fillStyle=grad(ctx,0,hz,[[0,'#3f6f9e'],[.6,'#9dbcd8'],[1,'#f1dcbc']]); ctx.fillRect(0,0,W,hz+4);
    glow(ctx,W*.2,hz-H*.1,H*.5,'rgba(255,240,210,.5)');
    for(var i=0;i<7;i++){ ctx.fillStyle='rgba(255,255,255,'+(.25+r()*.25)+')'; ctx.beginPath(); ctx.ellipse(r()*W,H*.08+r()*hz*.45,W*(.05+r()*.12),H*(.01+r()*.015),0,0,7); ctx.fill(); }
    ridge(ctx,W,H,hz,H*.05,17,'#8a9bb0');
    ridge(ctx,W,H,hz+H*.012,H*.03,18,'#6f7d6a');
    ridge(ctx,W,H,hz+H*.03,H*.01,19,grad(ctx,hz,H,[[0,'#7d7a55'],[1,'#3b3a26']]));
    grass(ctx,W,H,hz,r,1800,[230,210,150]);
    var pt=iso(W,H,hz), q=function(a){ return a.map(function(v){ return pt(v[0],v[1],v[2]); }); };
    var sh=q([[0,8.4,0],[12,8.4,0],[12,0,0]]).concat([pt(12,0,0)]); var off=[H*.12,H*.025];
    poly(ctx,[pt(0,8.4,0),pt(12,8.4,0),pt(12,0,0),[pt(12,0,0)[0]+off[0],pt(12,0,0)[1]+off[1]],[pt(12,8.4,0)[0]+off[0],pt(12,8.4,0)[1]+off[1]],[pt(0,8.4,0)[0]+off[0],pt(0,8.4,0)[1]+off[1]]],'rgba(40,40,20,.28)');
    poly(ctx,q([[0,8.4,0],[12,8.4,0],[12,8.4,7.2],[0,8.4,7.2]]),'#e2dbcf');
    poly(ctx,q([[12,0,0],[12,8.4,0],[12,8.4,7.2],[12,0,7.2]]),'#b3a898');
    poly(ctx,q([[0,0,7.2],[12,0,7.2],[12,8.4,7.2],[0,8.4,7.2]]),'#f5f1ea');
    var dark='#34414f';
    [[1.2,3.6,4.2,6],[5.4,7.8,4.2,6],[9,10.8,4.2,6],[5.4,10.2,.6,2.7],[1.5,2.8,0,2.5]].forEach(function(w){ poly(ctx,q([[w[0],8.4,w[2]],[w[1],8.4,w[2]],[w[1],8.4,w[3]],[w[0],8.4,w[3]]]),dark); });
    [[1.2,3,4.2,6],[4.5,7,4.2,6],[1.5,6.5,.6,2.7]].forEach(function(w){ poly(ctx,q([[12,w[0],w[2]],[12,w[1],w[2]],[12,w[1],w[3]],[12,w[0],w[3]]]),'#2a3542'); });
    poly(ctx,q([[0,8.4,3.3],[12,8.4,3.3],[12,8.4,3.38],[0,8.4,3.38]]),'#cfc6b7');
    var c=pt(12,8.4,7.2); tick(ctx,c[0]+H*.05,c[1]-H*.08,H*.03);
  }

  /* 08 Working drawings — the full ground-floor plan */
  function s08(ctx,W,H){
    blueprint(ctx,W,H);
    frame(ctx,W,H,540,420,.6,.66,.56,.47);
    planLines(ctx,{dims:true,stair:true,walls:true,doors:true,windows:true,labels:true});
    ctx.restore(); vignette(ctx,W,H);
  }

  /* 09 Check — section A–A with checked points */
  function s09(ctx,W,H){
    blueprint(ctx,W,H);
    frame(ctx,W,H,640,400,.62,.6,.56,.48);
    st(ctx,'M40 330H600',W8,2.5);
    ctx.fillStyle=W8; [[104,330,40,44],[496,330,40,44],[116,100,16,230],[508,100,16,230],[116,322,408,10],[116,212,408,10],[116,100,408,10],[116,84,12,16],[512,84,12,16]].forEach(function(b){ ctx.fillRect(b[0],b[1],b[2],b[3]); });
    st(ctx,'M300 322h17v-12.5h17v-12.5h17v-12.5h17v-12.5h17v-12.5h17v-12.5h17v-12.5h17v-12.5',W8,1.6);
    ctx.strokeStyle=OR; ctx.lineWidth=1; ctx.beginPath(); for(var x=132;x<508;x+=12){ ctx.moveTo(x,98); ctx.lineTo(x+6,92); ctx.lineTo(x+12,98); } ctx.stroke();
    st(ctx,'M80 322V110M74 322H86M74 212H86M74 110H86M75 327 85 317M75 217 85 207M75 115 85 105',OR,1);
    ctx.fillStyle=OR; ctx.font='10px Menlo, monospace'; ctx.textAlign='center';
    ctx.save(); ctx.translate(70,267); ctx.rotate(-Math.PI/2); ctx.fillText('3 300',0,0); ctx.restore();
    ctx.save(); ctx.translate(70,161); ctx.rotate(-Math.PI/2); ctx.fillText('3 300',0,0); ctx.restore();
    ctx.fillStyle=W8; ctx.font='500 11px Onest, Arial, sans-serif';
    ctx.fillText('Зочны өрөө',210,280); ctx.fillText('Унтлагын өрөө',210,170); ctx.fillText('Ажлын өрөө',430,170);
    ctx.fillStyle='rgba(235,244,255,.6)'; ctx.font='10px Menlo, monospace'; ctx.fillText('А–А зүсэлт',320,392);
    [[80,216],[320,95],[124,352],[400,270],[516,216]].forEach(function(t){ tick(ctx,t[0]+22,t[1]-14,11); });
    ctx.restore(); vignette(ctx,W,H);
  }

  /* 10 Handover — winter night, the finished house lit from within, a ger beside it */
  function s10(ctx,W,H){
    var r=rng(41), hz=H*.66;
    ctx.fillStyle=grad(ctx,0,hz,[[0,'#03050b'],[.6,'#0b1322'],[1,'#1d2b41']]); ctx.fillRect(0,0,W,hz+4);
    for(var i=0;i<650;i++){ var y=r()*hz*.95, a=(.15+.85*r())*(1-y/hz*.55), sz=Math.pow(r(),3)*1.7+.4;
      ctx.fillStyle='rgba(255,255,255,'+a+')'; ctx.beginPath(); ctx.arc(r()*W,y,sz*.6,0,7); ctx.fill(); }
    glow(ctx,W*.17,H*.17,H*.16,'rgba(220,230,255,.18)');
    ctx.fillStyle='#f1ecdc'; ctx.beginPath(); ctx.arc(W*.17,H*.17,H*.026,0,7); ctx.fill();
    ridge(ctx,W,H,hz,H*.055,6,'#0c1320');
    ridge(ctx,W,H,hz+H*.01,H*.025,4,'#273449');
    ridge(ctx,W,H,hz+H*.03,H*.008,2,grad(ctx,hz,H,[[0,'#43526a'],[.45,'#7c8ca4'],[1,'#b6c3d4']]));
    var bw=Math.min(H*.5,W*.42), k=bw/400, bx=W*.5, by=hz+H*.12, top=by-230*k;
    function R(x,y,w,h){ return [bx+(x-120)*k, top+(y-100)*k, w*k, h*k]; }
    var wins=[R(160,130,80,62),R(300,130,80,62),R(420,130,60,62),R(300,240,160,90),R(240,252,36,40)];
    ctx.globalCompositeOperation='lighter';
    wins.forEach(function(w){ glow(ctx,w[0]+w[2]/2,by+H*.02,Math.max(w[2],H*.06)*1.4,'rgba(255,160,70,.22)'); });
    ctx.globalCompositeOperation='source-over';
    var body=R(120,100,400,230), par=R(112,88,416,12);
    ctx.fillStyle='#0d1119'; ctx.fillRect(body[0],body[1],body[2],body[3]); ctx.fillRect(par[0],par[1],par[2],par[3]);
    ctx.fillStyle='#dfe7f1'; ctx.fillRect(par[0]-2,par[1]-H*.006,par[2]+4,H*.007);
    wins.forEach(function(w){ var g=ctx.createLinearGradient(0,w[1],0,w[1]+w[3]); g.addColorStop(0,'#ffd79a'); g.addColorStop(1,'#f39633'); ctx.fillStyle=g; ctx.fillRect(w[0],w[1],w[2],w[3]); });
    ctx.strokeStyle='#0d1119'; ctx.lineWidth=Math.max(1,k*2);
    [[200,130,200,192],[340,130,340,192],[340,240,340,330],[380,240,380,330],[420,240,420,330]].forEach(function(l){
      ctx.beginPath(); ctx.moveTo(bx+(l[0]-120)*k,top+(l[1]-100)*k); ctx.lineTo(bx+(l[2]-120)*k,top+(l[3]-100)*k); ctx.stroke(); });
    var door=R(170,245,44,85); ctx.fillStyle='#3a2a1c'; ctx.fillRect(door[0],door[1],door[2],door[3]);
    ctx.globalCompositeOperation='lighter';
    wins.forEach(function(w){ glow(ctx,w[0]+w[2]/2,w[1]+w[3]/2,Math.max(w[2],w[3])*1.1,'rgba(255,170,80,.16)'); });
    ctx.globalCompositeOperation='source-over';
    ctx.fillStyle='rgba(255,180,100,.14)'; ctx.beginPath(); ctx.ellipse(bx+(380-120)*k,by+H*.03,170*k,H*.025,0,0,7); ctx.fill();
    var gx=W*.3, gr=H*.075, gy=by;
    ctx.fillStyle='#c3c9d4'; ctx.beginPath(); ctx.moveTo(gx-gr,gy); ctx.lineTo(gx-gr,gy-gr*.62); ctx.lineTo(gx+gr,gy-gr*.62); ctx.lineTo(gx+gr,gy); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#dfe4ec'; ctx.beginPath(); ctx.moveTo(gx-gr*1.04,gy-gr*.6); ctx.lineTo(gx,gy-gr*1.12); ctx.lineTo(gx+gr*1.04,gy-gr*.6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='rgba(60,70,90,.55)'; ctx.lineWidth=1.2; [-.55,0,.55].forEach(function(o){ ctx.beginPath(); ctx.moveTo(gx-gr,gy-gr*(.3+o*.05)); ctx.lineTo(gx+gr,gy-gr*(.3+o*.05)); ctx.stroke(); });
    ctx.fillStyle=OR; ctx.fillRect(gx-gr*.14,gy-gr*.5,gr*.28,gr*.5);
    glow(ctx,gx,gy-gr*.2,gr*.9,'rgba(247,153,30,.18)');
    ctx.strokeStyle='rgba(230,236,245,.12)'; ctx.lineWidth=H*.006; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(gx,gy-gr*1.12); ctx.bezierCurveTo(gx+gr*.3,gy-gr*1.6,gx-gr*.4,gy-gr*1.9,gx+gr*.2,gy-gr*2.4); ctx.stroke();
    for(i=0;i<16;i++){ var t=i/15, px=door[0]+door[2]/2+(W*.08)*t*t, py=by+H*.01+(H-by)*t;
      ctx.fillStyle='rgba(40,50,70,'+(.18-t*.08)+')'; ctx.beginPath(); ctx.ellipse(px+(i%2?H*.008:-H*.008),py,H*(.004+t*.006),H*(.002+t*.004),0,0,7); ctx.fill(); }
    for(i=0;i<260;i++){ ctx.fillStyle='rgba(255,255,255,'+(.25+r()*.5)+')'; ctx.beginPath(); ctx.arc(r()*W,r()*H,r()*1.6+.3,0,7); ctx.fill(); }
  }

  var PAINT=[s01,s02,s03,s04,s05,s06,s07,s08,s09,s10], cache={};
  function dims(){ var d=Math.min(window.devicePixelRatio||1,1.5), w=innerWidth*d, h=innerHeight*d, cap=Math.sqrt(1800000/(w*h));
    if(cap<1){ w*=cap; h*=cap; } return {w:Math.round(w), h:Math.round(h)}; }
  /* full-viewport scene i, painted once per viewport size */
  function scene(i){ var s=dims(), k=i+':'+s.w+'x'+s.h;
    if(!cache[k]){ var c=document.createElement('canvas'); c.width=s.w; c.height=s.h; PAINT[i](c.getContext('2d'),s.w,s.h); cache[k]=c; }
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
