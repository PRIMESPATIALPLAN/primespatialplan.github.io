/* Prime Spatial Plan — "Draw your house": a simple room planner for phone and desktop.
   Rooms are rectangles on a 0.5 m grid, per floor. Draw by dragging, tap to select, drag to move,
   drag the corner handles to resize, pinch or wheel to zoom. 3D view extrudes the floors.
   The plan autosaves in this browser and can be sent to the studio through the inquiry form. */
(function(){
  var P = window.PSP;
  var TYPES = [
    {id:'living',  mn:'Зочны өрөө',     en:'Living room', c:'#f3d9a6'},
    {id:'bed',     mn:'Унтлагын өрөө',  en:'Bedroom',     c:'#c6dbf2'},
    {id:'kitchen', mn:'Гал тогоо',      en:'Kitchen',     c:'#f2c1ad'},
    {id:'bath',    mn:'АЦӨ',            en:'Bathroom',    c:'#bfe5e1'},
    {id:'hall',    mn:'Коридор',        en:'Hall',        c:'#e5e2da'},
    {id:'study',   mn:'Ажлын өрөө',     en:'Study',       c:'#d8cff0'},
    {id:'storage', mn:'Агуулах',        en:'Storage',     c:'#e7dbc2'},
    {id:'garage',  mn:'Гарааш',         en:'Garage',      c:'#d2d6dc'},
    {id:'balcony', mn:'Тагт',           en:'Balcony',     c:'#cfe7c1'}
  ];
  var TM = {}; TYPES.forEach(function(t){ TM[t.id] = t; });
  var L = {
    mn:{floor:'давхар', area:'м²', total:'Нийт талбай', none:'Өрөө сонгоогүй байна. Өрөөн дээр дарж сонгоно уу.', name:'Нэр', type:'Төрөл', w:'Өргөн, м', h:'Урт, м',
        del:'Устгах', dup:'Хуулах', rooms:'өрөө', sendMsg:'Миний зурсан байшингийн санаа', sum:'Нийт', empty:'Энэ давхарт өрөө алга. Төрлөө сонгоод зурж эхлээрэй.',
        confirmClear:'Дахин дарж бүх зургийг устгана', saved:'Хадгалагдсан', addFloor:'+ Давхар', delFloor:'Давхар устгах'},
    en:{floor:'floor', area:'m²', total:'Total area', none:'No room selected. Tap a room to select it.', name:'Name', type:'Type', w:'Width, m', h:'Length, m',
        del:'Delete', dup:'Duplicate', rooms:'rooms', sendMsg:'My house idea', sum:'Total', empty:'No rooms on this floor yet. Pick a type and start drawing.',
        confirmClear:'Tap again to clear everything', saved:'Saved', addFloor:'+ Floor', delFloor:'Delete floor'}
  };
  function t(k){ return L[P.lang][k]; }
  var GRID = .5, WALL = .2, FH = 3;

  /* ---------- templates ---------- */
  function R(type,x,y,w,h){ return {type:type,x:x,y:y,w:w,h:h}; }
  var TEMPLATES = {
    blank: function(){ return {floors:[{rooms:[]}]}; },
    flat: function(){ return {floors:[{rooms:[R('living',0,0,5.5,4.5),R('kitchen',5.5,0,3,3.5),R('hall',5.5,3.5,3,3.5),R('bath',8.5,3.5,2.5,2.5),R('bed',0,4.5,4,3.5),R('bed',8.5,0,3.5,3.5),R('storage',8.5,6,2.5,1)]}]}; },
    house: function(){ return {floors:[
      {rooms:[R('living',0,0,6,5),R('kitchen',6,0,4,3.5),R('hall',6,3.5,2,3.5),R('bath',8,3.5,2,2),R('storage',8,5.5,2,1.5),R('garage',10,0,4,7),R('study',0,5,4,3),R('hall',4,5,2,3)]},
      {rooms:[R('bed',0,0,4.5,4),R('bed',4.5,0,4,4),R('bath',8.5,0,2.5,2.5),R('hall',0,4,10,1.5),R('bed',0,5.5,5,3.5),R('balcony',5,5.5,3,2),R('storage',8.5,2.5,2.5,1.5)]}]}; }
  };
  var uid = 1;
  function ids(s){ s.floors.forEach(function(f){ f.rooms.forEach(function(r){ if(!r.id) r.id = uid++; else uid = Math.max(uid, r.id + 1); }); }); return s; }

  /* ---------- state ---------- */
  var state = null;
  try{ state = JSON.parse(localStorage.getItem('psp-planner') || 'null'); }catch(x){}
  if(!state || !state.floors || !state.floors.length) state = TEMPLATES.house();
  ids(state);
  var cur = 0, sel = null, mode = 'draw', curType = 'bed', view = '2d', hist = [], fut = [];
  function snap(v){ return Math.round(v / GRID) * GRID; }
  function floor(){ return state.floors[cur]; }
  function room(id){ var r = null; floor().rooms.forEach(function(x){ if(x.id === id) r = x; }); return r; }
  function save(){ try{ localStorage.setItem('psp-planner', JSON.stringify(state)); }catch(x){} }
  function checkpoint(){ hist.push(JSON.stringify(state)); if(hist.length > 60) hist.shift(); fut = []; }
  function undo(){ if(!hist.length) return; fut.push(JSON.stringify(state)); state = ids(JSON.parse(hist.pop())); if(cur >= state.floors.length) cur = 0; sel = null; changed(); }
  function redo(){ if(!fut.length) return; hist.push(JSON.stringify(state)); state = ids(JSON.parse(fut.pop())); sel = null; changed(); }
  function label(r){
    if(r.name) return r.name;
    var same = floor().rooms.filter(function(x){ return x.type === r.type && !x.name; });
    var n = TM[r.type][P.lang]; return same.length > 1 ? n + ' ' + (same.indexOf(r) + 1) : n;
  }
  function area(r){ return r.w * r.h; }
  function fmt(v){ return (Math.round(v * 10) / 10).toLocaleString(P.lang === 'en' ? 'en-US' : 'mn-MN', {maximumFractionDigits:1}); }

  /* ---------- DOM ---------- */
  var $ = function(id){ return document.getElementById(id); };
  var svg = $('plSvg'), cv = $('pl3d'), stage = $('plStage'), NS = 'http://www.w3.org/2000/svg';
  var vb = [-3, -3, 20, 14];
  function el(tag, attrs, parent){ var e = document.createElementNS(NS, tag); for(var k in attrs) e.setAttribute(k, attrs[k]); if(parent) parent.appendChild(e); return e; }
  function fitView(){
    var rs = floor().rooms.concat(cur > 0 ? state.floors[cur - 1].rooms : []);
    var b = [0, 0, 12, 9];
    if(rs.length){ b = [1e9, 1e9, -1e9, -1e9]; rs.forEach(function(r){ b[0] = Math.min(b[0], r.x); b[1] = Math.min(b[1], r.y); b[2] = Math.max(b[2], r.x + r.w); b[3] = Math.max(b[3], r.y + r.h); }); }
    var rect = svg.getBoundingClientRect(), asp = (rect.width || 800) / (rect.height || 500);
    var w = b[2] - b[0] + 6, h = b[3] - b[1] + 6;
    if(w / h < asp) w = h * asp; else h = w / asp;
    vb = [(b[0] + b[2]) / 2 - w / 2, (b[1] + b[3]) / 2 - h / 2, w, h];
  }

  /* ---------- 2D plan ---------- */
  var temp = null, coarse = matchMedia('(pointer: coarse)').matches;
  function draw2d(){
    svg.setAttribute('viewBox', vb.join(' '));
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    var defs = el('defs', {}, svg);
    var pat = el('pattern', {id:'g1', width:1, height:1, patternUnits:'userSpaceOnUse'}, defs);
    el('path', {d:'M1 0H0V1', fill:'none', stroke:'rgba(40,50,70,.12)', 'stroke-width':.02}, pat);
    var pat5 = el('pattern', {id:'g5', width:5, height:5, patternUnits:'userSpaceOnUse'}, defs);
    el('rect', {width:5, height:5, fill:'url(#g1)'}, pat5);
    el('path', {d:'M5 0H0V5', fill:'none', stroke:'rgba(40,50,70,.26)', 'stroke-width':.035}, pat5);
    el('rect', {x:vb[0] - 50, y:vb[1] - 50, width:vb[2] + 100, height:vb[3] + 100, fill:'#fbfaf7'}, svg);
    el('rect', {x:vb[0] - 50, y:vb[1] - 50, width:vb[2] + 100, height:vb[3] + 100, fill:'url(#g5)'}, svg);
    /* floor below as a ghost */
    if(cur > 0) state.floors[cur - 1].rooms.forEach(function(r){ el('rect', {x:r.x, y:r.y, width:r.w, height:r.h, fill:'none', stroke:'rgba(40,50,70,.35)', 'stroke-width':.05, 'stroke-dasharray':'.25 .18'}, svg); });
    var rs = floor().rooms;
    rs.forEach(function(r){ var g = el('g', {'data-rid':r.id}, svg);
      el('rect', {x:r.x, y:r.y, width:r.w, height:r.h, fill:TM[r.type].c}, g);
      if(r.type === 'balcony'){ for(var k = .5; k < r.w + r.h; k += .5){ el('line', {x1:r.x + Math.max(0, k - r.h), y1:r.y + Math.min(k, r.h), x2:r.x + Math.min(k, r.w), y2:r.y + Math.max(0, k - r.w), stroke:'rgba(60,90,50,.25)', 'stroke-width':.03}, g); } }
    });
    rs.forEach(function(r){ el('rect', {x:r.x, y:r.y, width:r.w, height:r.h, fill:'none', stroke:'#22252b', 'stroke-width':r.type === 'balcony' ? WALL / 2 : WALL, 'pointer-events':'none'}, svg); });
    rs.forEach(function(r){
      var fs = Math.max(.24, Math.min(.42, Math.min(r.w, r.h) / 5));
      if(Math.min(r.w, r.h) < 1) return;
      var tx = el('text', {x:r.x + r.w / 2, y:r.y + r.h / 2 - fs * .15, 'text-anchor':'middle', 'font-size':fs, 'font-weight':600, fill:'#22252b', 'pointer-events':'none', 'font-family':'Onest, Arial, sans-serif'}, svg);
      var nm = label(r), maxc = Math.max(4, Math.floor(r.w / (fs * .55))); tx.textContent = nm.length > maxc ? nm.slice(0, maxc - 1) + '…' : nm;
      var ta = el('text', {x:r.x + r.w / 2, y:r.y + r.h / 2 + fs * 1.05, 'text-anchor':'middle', 'font-size':fs * .82, fill:'#5b616b', 'pointer-events':'none', 'font-family':'Menlo, monospace'}, svg);
      ta.textContent = fmt(area(r)) + ' ' + t('area');
    });
    /* overall dimensions */
    if(rs.length){ var b = [1e9, 1e9, -1e9, -1e9]; rs.forEach(function(r){ b[0] = Math.min(b[0], r.x); b[1] = Math.min(b[1], r.y); b[2] = Math.max(b[2], r.x + r.w); b[3] = Math.max(b[3], r.y + r.h); });
      dimLine(b[0], b[1] - 1.1, b[2], b[1] - 1.1, fmt(b[2] - b[0]) + ' м', 0);
      dimLine(b[0] - 1.1, b[1], b[0] - 1.1, b[3], fmt(b[3] - b[1]) + ' м', 1); }
    /* selection */
    var s = sel && room(sel);
    if(s){ el('rect', {x:s.x, y:s.y, width:s.w, height:s.h, fill:'rgba(247,153,30,.08)', stroke:'#F7991E', 'stroke-width':.09, 'stroke-dasharray':'.3 .2', 'pointer-events':'none'}, svg);
      var hr = (coarse ? .55 : .32) * Math.max(1, vb[2] / 24);
      [['nw', s.x, s.y], ['ne', s.x + s.w, s.y], ['se', s.x + s.w, s.y + s.h], ['sw', s.x, s.y + s.h]].forEach(function(h){
        el('circle', {cx:h[1], cy:h[2], r:hr, fill:'#fff', stroke:'#F7991E', 'stroke-width':hr * .3, 'data-h':h[0], style:'cursor:' + (h[0] === 'nw' || h[0] === 'se' ? 'nwse' : 'nesw') + '-resize'}, svg); });
      dimLine(s.x, s.y + s.h + .7, s.x + s.w, s.y + s.h + .7, fmt(s.w) + ' м', 0, '#F7991E');
      dimLine(s.x + s.w + .7, s.y, s.x + s.w + .7, s.y + s.h, fmt(s.h) + ' м', 1, '#F7991E'); }
    if(temp){ el('rect', {x:temp.x, y:temp.y, width:temp.w, height:temp.h, fill:TM[curType].c, 'fill-opacity':.7, stroke:'#F7991E', 'stroke-width':.08, 'stroke-dasharray':'.3 .2', 'pointer-events':'none'}, svg);
      var tt = el('text', {x:temp.x + temp.w / 2, y:temp.y + temp.h / 2, 'text-anchor':'middle', 'font-size':.4, fill:'#B25E00', 'font-weight':700, 'pointer-events':'none', 'font-family':'Menlo, monospace'}, svg);
      tt.textContent = fmt(temp.w) + ' × ' + fmt(temp.h) + ' = ' + fmt(temp.w * temp.h) + ' ' + t('area'); }
  }
  function dimLine(x1, y1, x2, y2, txt, vert, col){
    col = col || '#B25E00'; var g = el('g', {'pointer-events':'none'}, svg);
    el('line', {x1:x1, y1:y1, x2:x2, y2:y2, stroke:col, 'stroke-width':.03}, g);
    [[x1, y1], [x2, y2]].forEach(function(p){ el('line', {x1:p[0] - .15, y1:p[1] + .15, x2:p[0] + .15, y2:p[1] - .15, stroke:col, 'stroke-width':.05}, g); });
    var tx = el('text', {x:(x1 + x2) / 2, y:(y1 + y2) / 2 - .12, 'text-anchor':'middle', 'font-size':.32, fill:col, 'font-family':'Menlo, monospace'}, g);
    if(vert) tx.setAttribute('transform', 'rotate(-90 ' + ((x1 + x2) / 2) + ' ' + ((y1 + y2) / 2) + ')');
    tx.textContent = txt;
  }

  /* ---------- pointer interaction ---------- */
  var ptrs = new Map(), drag = null;
  function pt(e){ var m = svg.getScreenCTM(); if(!m) return {x:0, y:0}; var p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; p = p.matrixTransform(m.inverse()); return {x:p.x, y:p.y}; }
  function hit(p){ var rs = floor().rooms, i; for(i = rs.length - 1; i >= 0; i--){ var r = rs[i]; if(p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h) return r; } return null; }
  svg.addEventListener('pointerdown', function(e){
    svg.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, {x:e.clientX, y:e.clientY});
    if(ptrs.size === 2){ var a = Array.from(ptrs.values()); temp = null; drag = {kind:'pinch', d0:Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y), vb0:vb.slice(), m:pt({clientX:(a[0].x + a[1].x) / 2, clientY:(a[0].y + a[1].y) / 2})}; draw2d(); return; }
    var p = pt(e), h = e.target.getAttribute && e.target.getAttribute('data-h'), r = hit(p);
    if(h && sel){ var s = room(sel); drag = {kind:'resize', h:h, r0:{x:s.x, y:s.y, w:s.w, h:s.h}, p0:p, snap:JSON.stringify(state)}; return; }
    if(mode === 'draw'){ drag = {kind:'draw', p0:{x:snap(p.x), y:snap(p.y)}, raw:p, on:r}; return; }
    if(r){ sel = r.id; drag = {kind:'move', r0:{x:r.x, y:r.y}, p0:p, snap:JSON.stringify(state)}; panel(); draw2d(); return; }
    sel = null; panel(); drag = {kind:'pan', c0:{x:e.clientX, y:e.clientY}, vb0:vb.slice()}; draw2d();
  });
  svg.addEventListener('pointermove', function(e){
    if(!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, {x:e.clientX, y:e.clientY});
    if(!drag) return; var p = pt(e);
    if(drag.kind === 'pinch' && ptrs.size === 2){ var a = Array.from(ptrs.values()), d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y), k = drag.d0 / Math.max(d, 1);
      var w = Math.min(120, Math.max(5, drag.vb0[2] * k)), hh = drag.vb0[3] * w / drag.vb0[2];
      vb = [drag.m.x - (drag.m.x - drag.vb0[0]) * w / drag.vb0[2], drag.m.y - (drag.m.y - drag.vb0[1]) * w / drag.vb0[2], w, hh]; draw2d(); return; }
    if(drag.kind === 'pan'){ var rc = svg.getBoundingClientRect(), sx = drag.vb0[2] / rc.width; vb = [drag.vb0[0] - (e.clientX - drag.c0.x) * sx, drag.vb0[1] - (e.clientY - drag.c0.y) * sx, drag.vb0[2], drag.vb0[3]]; draw2d(); return; }
    if(drag.kind === 'draw'){ var x2 = snap(p.x), y2 = snap(p.y); temp = {x:Math.min(drag.p0.x, x2), y:Math.min(drag.p0.y, y2), w:Math.abs(x2 - drag.p0.x), h:Math.abs(y2 - drag.p0.y)}; draw2d(); return; }
    var s = room(sel); if(!s) return;
    var dx = snap(p.x - drag.p0.x), dy = snap(p.y - drag.p0.y);
    if(drag.kind === 'move'){ s.x = drag.r0.x + dx; s.y = drag.r0.y + dy; }
    if(drag.kind === 'resize'){ var r0 = drag.r0, x0 = r0.x, y0 = r0.y, x1 = r0.x + r0.w, y1 = r0.y + r0.h;
      if(drag.h.indexOf('w') >= 0) x0 = Math.min(x1 - 1, r0.x + dx); if(drag.h.indexOf('e') >= 0) x1 = Math.max(x0 + 1, x1 + dx);
      if(drag.h.indexOf('n') >= 0) y0 = Math.min(y1 - 1, r0.y + dy); if(drag.h.indexOf('s') >= 0) y1 = Math.max(y0 + 1, y1 + dy);
      s.x = x0; s.y = y0; s.w = x1 - x0; s.h = y1 - y0; }
    draw2d(); panelValues();
  });
  function up(e){
    ptrs.delete(e.pointerId);
    if(!drag) return;
    if(drag.kind === 'pinch'){ if(ptrs.size === 0) drag = null; return; }
    if(drag.kind === 'draw'){
      if(temp && temp.w >= 1 && temp.h >= 1){ checkpoint(); var r = {id:uid++, type:curType, x:temp.x, y:temp.y, w:temp.w, h:temp.h}; floor().rooms.push(r); sel = r.id; }
      else if(drag.on){ sel = drag.on.id; }
      else sel = null;
      temp = null; drag = null; changed(); return; }
    if((drag.kind === 'move' || drag.kind === 'resize') && drag.snap !== JSON.stringify(state)){ hist.push(drag.snap); fut = []; }
    drag = null; changed();
  }
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
  svg.addEventListener('wheel', function(e){ e.preventDefault(); var p = pt(e), k = e.deltaY > 0 ? 1.12 : 1 / 1.12, w = Math.min(120, Math.max(5, vb[2] * k)), f = w / vb[2];
    vb = [p.x - (p.x - vb[0]) * f, p.y - (p.y - vb[1]) * f, w, vb[3] * f]; draw2d(); }, {passive:false});
  function zoom(k){ var c = {x:vb[0] + vb[2] / 2, y:vb[1] + vb[3] / 2}, w = Math.min(120, Math.max(5, vb[2] * k)), f = w / vb[2]; vb = [c.x - vb[2] * f / 2, c.y - vb[3] * f / 2, w, vb[3] * f]; draw2d(); }
  addEventListener('keydown', function(e){
    if(/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if((e.key === 'Delete' || e.key === 'Backspace') && sel){ e.preventDefault(); delSel(); }
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z'){ e.preventDefault(); e.shiftKey ? redo() : undo(); }
    var s = sel && room(sel); if(s && /^Arrow/.test(e.key)){ e.preventDefault(); checkpoint(); s.x += e.key === 'ArrowLeft' ? -GRID : e.key === 'ArrowRight' ? GRID : 0; s.y += e.key === 'ArrowUp' ? -GRID : e.key === 'ArrowDown' ? GRID : 0; changed(); }
  });

  /* ---------- 3D view ---------- */
  var cam = {az:35, el:38}, d3 = null;
  function draw3d(){
    var rect = stage.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(rect.width * dpr); cv.height = Math.round(rect.height * dpr);
    var g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    var W = rect.width, H = rect.height, light = document.documentElement.getAttribute('data-theme') === 'light';
    var sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#a9c1d8'); sky.addColorStop(.55, '#e2e9ee'); sky.addColorStop(1, '#cfd5c4'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    var all = [], b = [1e9, 1e9, -1e9, -1e9];
    state.floors.forEach(function(f, i){ if(i > cur) return; f.rooms.forEach(function(r){ all.push({r:r, i:i}); b[0] = Math.min(b[0], r.x); b[1] = Math.min(b[1], r.y); b[2] = Math.max(b[2], r.x + r.w); b[3] = Math.max(b[3], r.y + r.h); }); });
    if(!all.length){ b = [0, 0, 10, 8]; }
    var cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2, span = Math.max(b[2] - b[0], b[3] - b[1], 6) * 1.55 + (cur + 1) * 1.2;
    var az = cam.az * Math.PI / 180, el2 = cam.el * Math.PI / 180, ca = Math.cos(az), sa = Math.sin(az), ce = Math.cos(el2), se = Math.sin(el2), k = Math.min(W, H * 1.3) / span;
    function Pp(x, y, z){ var dx = x - cx, dy = -(y - cy), xr = dx * ca - dy * sa, yr = dx * sa + dy * ca; return [W / 2 + xr * k, H * .58 - (yr * se + (z - (cur + 1) * FH * .35) * ce) * k, -yr * ce + z * se]; }
    var V = [-ce * sa, -ce * ca, se], quads = [];
    function q(pts, fill, stroke, n){ var pp = pts.map(function(p){ return Pp(p[0], p[1], p[2]); }), d = 0; pp.forEach(function(p){ d += p[2]; }); quads.push({p:pp, d:d / pp.length, f:fill, s:stroke, n:n}); }
    /* ground and shadow */
    var gp = [[b[0] - 6, b[1] - 6, 0], [b[2] + 6, b[1] - 6, 0], [b[2] + 6, b[3] + 6, 0], [b[0] - 6, b[3] + 6, 0]].map(function(p){ return Pp(p[0], p[1], p[2]); });
    g.beginPath(); gp.forEach(function(p, i){ i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.closePath(); g.fillStyle = '#b9c69f'; g.fill();
    g.save(); g.filter = 'blur(6px)'; g.fillStyle = 'rgba(40,45,30,.28)';
    all.forEach(function(a){ var r = a.r, hz = (a.i + 1) * FH, ox = .5 * hz, oy = .35 * hz; var pp = [[r.x + ox, r.y + oy], [r.x + r.w + ox, r.y + oy], [r.x + r.w + ox, r.y + r.h + oy], [r.x + ox, r.y + r.h + oy]].map(function(p){ return Pp(p[0], p[1], 0); });
      g.beginPath(); pp.forEach(function(p, i){ i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.closePath(); g.fill(); });
    g.restore();
    var LD = [-.45, .65, .62];
    function tone(hex, n){ var kk = .62 + .38 * Math.max(0, n[0] * LD[0] + n[1] * LD[1] + n[2] * LD[2]); var c = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]; return 'rgb(' + c.map(function(v){ return Math.round(v * kk); }).join(',') + ')'; }
    all.forEach(function(a){ var r = a.r, z0 = a.i * FH, top = a.i === cur, wh = top ? 1.2 : FH - .05;
      q([[r.x, r.y, z0 + .02], [r.x + r.w, r.y, z0 + .02], [r.x + r.w, r.y + r.h, z0 + .02], [r.x, r.y + r.h, z0 + .02]], TM[r.type].c, 'rgba(30,32,36,.35)', [0, 0, 1]);
      var e4 = [[[r.x, r.y], [r.x + r.w, r.y], [0, 1]], [[r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [1, 0]], [[r.x + r.w, r.y + r.h], [r.x, r.y + r.h], [0, -1]], [[r.x, r.y + r.h], [r.x, r.y], [-1, 0]]];
      if(r.type === 'balcony') wh = 1;
      e4.forEach(function(ed){ var n = [ed[2][0], ed[2][1], 0]; q([[ed[0][0], ed[0][1], z0], [ed[1][0], ed[1][1], z0], [ed[1][0], ed[1][1], z0 + wh], [ed[0][0], ed[0][1], z0 + wh]], tone('#f2eee6', n), 'rgba(30,32,36,.55)', n); });
      if(!top) q([[r.x, r.y, z0 + FH], [r.x + r.w, r.y, z0 + FH], [r.x + r.w, r.y + r.h, z0 + FH], [r.x, r.y + r.h, z0 + FH]], a.i === cur - 1 ? '#e4e1da' : '#d9d6cf', 'rgba(30,32,36,.45)', [0, 0, 1]);
    });
    quads.sort(function(a, b){ return a.d - b.d; });
    quads.forEach(function(qq){ g.beginPath(); qq.p.forEach(function(p, i){ i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.closePath(); g.fillStyle = qq.f; g.fill(); g.strokeStyle = qq.s; g.lineWidth = 1; g.stroke(); });
    /* labels on the current floor */
    floor().rooms.forEach(function(r){ if(r.w * r.h < 3) return; var c = Pp(r.x + r.w / 2, r.y + r.h / 2, cur * FH + .05);
      g.font = '600 ' + Math.max(10, Math.min(13, k * .32)) + 'px Onest, Arial, sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(30,32,36,.85)'; g.fillText(label(r), c[0], c[1]);
      g.font = '400 10px Menlo, monospace'; g.fillStyle = 'rgba(30,32,36,.6)'; g.fillText(fmt(area(r)) + ' ' + t('area'), c[0], c[1] + 13); });
    void light;
  }
  (function(){ var p0 = null, c0 = null;
    cv.addEventListener('pointerdown', function(e){ cv.setPointerCapture(e.pointerId); p0 = {x:e.clientX, y:e.clientY}; c0 = {az:cam.az, el:cam.el}; });
    cv.addEventListener('pointermove', function(e){ if(!p0) return; cam.az = c0.az + (e.clientX - p0.x) * .4; cam.el = Math.max(12, Math.min(80, c0.el + (e.clientY - p0.y) * .3)); draw3d(); });
    ['pointerup', 'pointercancel'].forEach(function(n){ cv.addEventListener(n, function(){ p0 = null; }); });
  })();

  /* ---------- panels ---------- */
  function typeChips(){
    var box = $('plTypes'); box.innerHTML = '';
    TYPES.forEach(function(ty){ var b = document.createElement('button'); b.type = 'button'; b.className = 'pl-chip'; b.setAttribute('aria-pressed', ty.id === curType ? 'true' : 'false');
      var sw = document.createElement('i'); sw.style.background = ty.c; b.appendChild(sw); b.appendChild(document.createTextNode(ty[P.lang]));
      b.onclick = function(){ curType = ty.id; var s = sel && room(sel); if(s && mode === 'select'){ checkpoint(); s.type = ty.id; changed(); } setMode('draw'); typeChips(); };
      box.appendChild(b); });
  }
  function floorTabs(){
    var box = $('plFloors'); box.innerHTML = '';
    state.floors.forEach(function(f, i){ var b = document.createElement('button'); b.type = 'button'; b.className = 'pl-tab'; b.setAttribute('aria-pressed', i === cur ? 'true' : 'false');
      b.textContent = (i + 1) + '-' + (P.lang === 'en' ? ['st', 'nd', 'rd'][i] || 'th' : 'р') + ' ' + t('floor'); b.onclick = function(){ cur = i; sel = null; fitView(); changed(); }; box.appendChild(b); });
    if(state.floors.length < 4){ var a = document.createElement('button'); a.type = 'button'; a.className = 'pl-tab add'; a.textContent = t('addFloor');
      a.onclick = function(){ checkpoint(); state.floors.push({rooms:[]}); cur = state.floors.length - 1; sel = null; changed(); }; box.appendChild(a); }
    $('plDelFloor').hidden = state.floors.length < 2; $('plDelFloor').textContent = t('delFloor');
  }
  function setMode(m){ mode = m; document.querySelectorAll('[data-mode]').forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.mode === m ? 'true' : 'false'); }); svg.style.cursor = m === 'draw' ? 'crosshair' : 'default'; }
  function panel(){
    var s = sel && room(sel), ed = $('plEdit');
    $('plNone').hidden = !!s; ed.hidden = !s;
    if(s){ var ts = $('plType'); ts.innerHTML = ''; TYPES.forEach(function(ty){ var o = document.createElement('option'); o.value = ty.id; o.textContent = ty[P.lang]; if(ty.id === s.type) o.selected = true; ts.appendChild(o); });
      $('plName').value = s.name || ''; $('plName').placeholder = label(s); panelValues(); }
    summary();
  }
  function panelValues(){ var s = sel && room(sel); if(!s) return; if(document.activeElement !== $('plW')) $('plW').value = s.w; if(document.activeElement !== $('plH')) $('plH').value = s.h; $('plArea').textContent = fmt(area(s)) + ' ' + t('area'); }
  function summary(){
    var list = $('plList'); list.innerHTML = ''; var tot = 0;
    state.floors.forEach(function(f, i){ var ft = 0; f.rooms.forEach(function(r){ if(r.type !== 'balcony') ft += area(r); }); tot += ft;
      var h = document.createElement('li'); h.className = 'pl-fl'; h.textContent = (i + 1) + '-' + (P.lang === 'en' ? ['st', 'nd', 'rd'][i] || 'th' : 'р') + ' ' + t('floor') + ' · ' + fmt(ft) + ' ' + t('area'); list.appendChild(h);
      if(i !== cur) return;
      if(!f.rooms.length){ var em = document.createElement('li'); em.className = 'pl-em'; em.textContent = t('empty'); list.appendChild(em); }
      f.rooms.forEach(function(r){ var li = document.createElement('li'); li.className = r.id === sel ? 'on' : '';
        var b = document.createElement('button'); b.type = 'button'; var sw = document.createElement('i'); sw.style.background = TM[r.type].c; b.appendChild(sw);
        var n = document.createElement('span'); n.textContent = label(r); b.appendChild(n); var a = document.createElement('b'); a.textContent = fmt(area(r)) + ' ' + t('area'); b.appendChild(a);
        b.onclick = function(){ sel = r.id; setMode('select'); changed(); }; li.appendChild(b); list.appendChild(li); }); });
    $('plTotal').textContent = fmt(tot) + ' ' + t('area');
  }
  function delSel(){ var f = floor(), i = f.rooms.findIndex(function(r){ return r.id === sel; }); if(i < 0) return; checkpoint(); f.rooms.splice(i, 1); sel = null; changed(); }
  function changed(){ save(); floorTabs(); typeChips(); panel(); if(view === '2d') draw2d(); else draw3d(); $('plUndo').disabled = !hist.length; $('plRedo').disabled = !fut.length; }

  /* ---------- controls ---------- */
  document.querySelectorAll('[data-mode]').forEach(function(b){ b.onclick = function(){ setMode(b.dataset.mode); }; });
  $('plUndo').onclick = undo; $('plRedo').onclick = redo;
  $('plZin').onclick = function(){ zoom(1 / 1.25); }; $('plZout').onclick = function(){ zoom(1.25); }; $('plFit').onclick = function(){ fitView(); draw2d(); };
  $('plDel').onclick = delSel;
  $('plDup').onclick = function(){ var s = room(sel); if(!s) return; checkpoint(); var r = {id:uid++, type:s.type, name:s.name, x:s.x + s.w, y:s.y, w:s.w, h:s.h}; floor().rooms.push(r); sel = r.id; changed(); };
  $('plType').onchange = function(){ var s = room(sel); if(!s) return; checkpoint(); s.type = this.value; changed(); };
  $('plName').onchange = function(){ var s = room(sel); if(!s) return; checkpoint(); s.name = this.value.trim() || undefined; changed(); };
  ['plW', 'plH'].forEach(function(id){ $(id).onchange = function(){ var s = room(sel); if(!s) return; var v = Math.max(1, Math.min(40, snap(parseFloat(this.value) || 1))); checkpoint(); if(id === 'plW') s.w = v; else s.h = v; changed(); }; });
  $('plDelFloor').onclick = function(){ if(state.floors.length < 2) return; checkpoint(); state.floors.splice(cur, 1); cur = Math.max(0, cur - 1); sel = null; changed(); };
  $('plTpl').onchange = function(){ var v = this.value; if(!v) return; checkpoint(); state = ids(TEMPLATES[v]()); cur = 0; sel = null; this.value = ''; fitView(); changed(); };
  var clearArmed = 0;
  $('plClear').onclick = function(){ var b = this; if(Date.now() - clearArmed > 3000){ clearArmed = Date.now(); b.dataset.label = b.textContent; b.textContent = t('confirmClear'); setTimeout(function(){ if(b.dataset.label) b.textContent = b.dataset.label; }, 3000); return; }
    clearArmed = 0; b.textContent = b.dataset.label; checkpoint(); state = {floors:[{rooms:[]}]}; cur = 0; sel = null; changed(); };
  function setView(v){ view = v; svg.hidden = v !== '2d'; cv.hidden = v !== '3d'; $('plZoom').hidden = v !== '2d';
    document.querySelectorAll('[data-view]').forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.view === v ? 'true' : 'false'); }); changed(); }
  document.querySelectorAll('[data-view]').forEach(function(b){ b.onclick = function(){ setView(b.dataset.view); }; });
  /* download PNG of the current view */
  $('plPng').onclick = function(){
    function dl(blob){ var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'prime-spatial-plan-' + (view === '2d' ? 'plan' : '3d') + '.png'; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1000); }
    if(view === '3d'){ cv.toBlob(dl); return; }
    var s0 = sel; sel = null; draw2d(); var xml = new XMLSerializer().serializeToString(svg); sel = s0; draw2d();
    var Wd = 2000, Hd = Math.round(2000 * vb[3] / vb[2]), img = new Image();
    img.onload = function(){ var c = document.createElement('canvas'); c.width = Wd; c.height = Hd; var g = c.getContext('2d'); g.fillStyle = '#fbfaf7'; g.fillRect(0, 0, Wd, Hd); g.drawImage(img, 0, 0, Wd, Hd);
      g.font = '600 28px Onest, Arial, sans-serif'; g.fillStyle = '#22252b'; g.fillText('Prime Spatial Plan', 30, Hd - 30); c.toBlob(dl); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml.replace('<svg', '<svg width="' + Wd + '" height="' + Hd + '"'));
  };
  /* send to the studio: prefill the inquiry form */
  $('plSend').onclick = function(){
    var lines = [t('sendMsg') + ':'], tot = 0;
    state.floors.forEach(function(f, i){ var ft = 0; f.rooms.forEach(function(r){ if(r.type !== 'balcony') ft += area(r); }); tot += ft;
      var c0 = cur; cur = i; lines.push('', (i + 1) + ' ' + t('floor') + ' (' + fmt(ft) + ' ' + t('area') + '):');
      f.rooms.forEach(function(r){ lines.push('• ' + label(r) + ' — ' + fmt(r.w) + ' × ' + fmt(r.h) + ' м = ' + fmt(area(r)) + ' ' + t('area')); }); cur = c0; });
    lines.push('', t('sum') + ': ' + fmt(tot) + ' ' + t('area'));
    try{ sessionStorage.setItem('psp-plan', JSON.stringify({msg:lines.join('\n'), area:String(Math.round(tot)), floors:state.floors.length})); }catch(x){}
    location.href = 'studio.html#contact';
  };
  addEventListener('resize', function(){ if(view === '2d') draw2d(); else draw3d(); });
  addEventListener('psp-theme', function(){ if(view === '3d') draw3d(); });
  P.on(function(){ changed(); });
  P.init();
  fitView(); setMode('draw'); changed();
})();
