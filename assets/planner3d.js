/* Prime Spatial Plan — Revit-style 3D view for the house planner.
   Builds walls with real thickness, door and window openings, slabs, a plinth, a site pad and a roof
   from the planner's rooms and openings, and renders them in three visual styles
   (Hidden Line, Shaded, Realistic) with an orthographic {3D} camera, ViewCube and section box. */
import * as THREE from './vendor/three.module.min.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {T, FACADE_FLAT} from './planner-tex.js?v=6';
import {furnish} from './planner-furnish.js?v=1';
import {GLTFLoader} from './vendor/GLTFLoader.js';

const FH = 3, SL = .25, PL = .3, T30 = Math.tan(30 * Math.PI / 180);
const near = (a, b) => Math.abs(a - b) < 1e-4;

export function create(canvas, ui){
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const ocam = new THREE.OrthographicCamera(-10, 10, 10, -10, -1000, 2000), pcam = new THREE.PerspectiveCamera(36, 1, .1, 1500);
  let cam = ocam, persp = false;
  const ctl = new OrbitControls(cam, canvas);
  ctl.enableDamping = true; ctl.dampingFactor = .12; ctl.maxPolarAngle = Math.PI * .5; ctl.screenSpacePanning = true;
  ctl.minZoom = .3; ctl.maxZoom = 8; ctl.rotateSpeed = .8; ctl.minDistance = 4; ctl.maxDistance = 160;
  const hemi = new THREE.HemisphereLight(0xe8eef5, 0x8d8f80, 1.15); scene.add(hemi);
  const amb = new THREE.AmbientLight(0xffffff, 0); scene.add(amb);
  const sun = new THREE.DirectionalLight(0xfff1df, 2.3); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0005; sun.shadow.normalBias = .03;
  scene.add(sun, sun.target);
  const pmrem = new THREE.PMREMGenerator(renderer), envRoom = pmrem.fromScene(new RoomEnvironment(), .04).texture; let envSky = null;
  let root = new THREE.Group(); scene.add(root);
  let MODEL = null, ENTRIES = [], PAVED = [], PERIM = [];
  let frustum = 24, fbase = 24, fitted = false, M = null, LM = null, anim = null;
  const memo = {};

  /* ---------- materials per visual style ---------- */
  function mats(st, m){
    const real = st === 'realistic', hid = st === 'hidden';
    const mk = (c, o = {}) => {
      const {hid:hc, roughness, metalness, flatShading, tint, env, ...rest} = o;
      const base = {color:c, polygonOffset:true, polygonOffsetFactor:1, polygonOffsetUnits:1, ...rest};
      if(hid) return new THREE.MeshBasicMaterial({...base, color:hc || '#ffffff'});
      if(real) return new THREE.MeshStandardMaterial({...base, roughness:roughness ?? .85, metalness:metalness ?? 0, flatShading:!!flatShading});
      return new THREE.MeshLambertMaterial({...base, flatShading:!!flatShading});
    };
    const tx = (name, flat, o = {}) => {
      if(!real) return mk(flat, o);
      const t = T(name);
      return new THREE.MeshStandardMaterial({map:t.map, bumpMap:t.bump || null, bumpScale:t.bump ? (t.bs || 1) : 0, color:o.tint || '#ffffff', roughness:o.roughness ?? .9, metalness:o.metalness ?? 0,
        side:o.side || THREE.FrontSide, envMapIntensity:o.env ?? .45, polygonOffset:true, polygonOffsetFactor:1, polygonOffsetUnits:1});
    };
    const rm = m.roof.mat || 'seam', vc = (c) => hid ? new THREE.MeshBasicMaterial({color:'#ffffff', polygonOffset:true, polygonOffsetFactor:1, polygonOffsetUnits:1})
      : real ? new THREE.MeshStandardMaterial({vertexColors:true, flatShading:true, roughness:.95, envMapIntensity:.25}) : new THREE.MeshLambertMaterial({vertexColors:true, flatShading:true});
    const bb = (n, at) => { const m = new THREE.MeshStandardMaterial({map:T(n).map, alphaTest:at || .5, side:THREE.DoubleSide, roughness:.92, envMapIntensity:.25});
      m.userData.depth = new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking, map:T(n).map, alphaTest:at || .5}); return m; };
    const R = {
      F:{plaster:tx('plaster', FACADE_FLAT.plaster), brick:tx('brick', FACADE_FLAT.brick, {roughness:.92}), wood:tx('wood', FACADE_FLAT.wood, {roughness:.7}), stone:tx('stone', FACADE_FLAT.stone), timber:tx('timber', FACADE_FLAT.timber, {roughness:.8}), cedar:tx('cedar', FACADE_FLAT.cedar, {roughness:.8})},
      concrete:tx('concrete', '#d2cfc8', {roughness:.92, env:.25}),
      pine:real ? bb('pine') : null, leafy:real ? bb('leafy') : null, tuft:real ? bb('tuft', .35) : null,
      gravel:tx('gravel', '#c9c6bf', {roughness:1, env:.2}), deck:tx('deck', '#c9a77c', {roughness:.8}), rock:real ? new THREE.MeshStandardMaterial({color:'#9b968d', roughness:.95, flatShading:true, envMapIntensity:.3}) : mk('#c9c5bd', {flatShading:true}),
      porch:tx('stone', '#d4cfc6', {tint:'#e4e0d8'}), canopy:mk(real ? '#33363b' : '#55595f', {roughness:.5}),
      leaf:vc(), conifer:vc(),
      wallExt: mk(real ? '#efe8dc' : '#f1eee8', {roughness:.92}),
      wallInt: mk(real ? '#f7f4ee' : '#f7f6f2'),
      cut: mk('#d8d3cb', {hid:'#d8d3cb'}),
      slab: mk(real ? '#e6e1d8' : '#e9e7e2'),
      plinth: tx('stone', '#bdbab3', {tint:'#8f8a82', roughness:.95}),
      glass: hid ? new THREE.MeshBasicMaterial({color:'#e5eef5', transparent:true, opacity:.75, polygonOffset:true, polygonOffsetFactor:1, polygonOffsetUnits:1})
        : real ? new THREE.MeshStandardMaterial({color:'#6f8fa8', roughness:.06, metalness:.35, transparent:true, opacity:.58})
        : new THREE.MeshLambertMaterial({color:'#9ec1dc', transparent:true, opacity:.6}),
      frame: mk(real ? '#3a3e44' : '#55595f', {roughness:.5, hid:'#ffffff'}),
      doorInt: mk(real ? '#d9cbb3' : '#e2d5bf', {roughness:.6}),
      doorExt: tx('doorWood', '#8a6040', {roughness:.55}),
      garage: real ? new THREE.MeshStandardMaterial({map:T('garageDoor').map, roughness:.45, metalness:.1, envMapIntensity:.5}) : mk('#d6d8db', {roughness:.45}),
      rail: mk(real ? '#f2eee7' : '#f1eee8'),
      roof: tx(rm, m.roof.color, {tint:m.roof.color, roughness:rm === 'shingle' ? .9 : .42, metalness:rm === 'shingle' ? 0 : .45, side:THREE.DoubleSide, env:.7}),
      seam: new THREE.LineBasicMaterial({color:hid ? '#9a9da2' : new THREE.Color(m.roof.color).multiplyScalar(.62), transparent:true, opacity:hid ? .6 : .9}),
      grass: real ? tx('grass', '#dfe3d6', {roughness:1, env:.15, tint:'#c2c9ae'}) : mk('#dfe3d6', {hid:'#ffffff'}),
      earth: mk(real ? '#7b6a55' : '#c9c1b4', {roughness:1, hid:'#ffffff'}),
      pave: tx('pavers', '#d2cfc8', {roughness:.95}),
      trunk: tx('bark', '#a9998a'),
      crown: mk(real ? '#6e8c52' : '#b9cba5', {flatShading:true}),
      floor: {}
    };
    const par = tx('parquet', '#c9a57a', {roughness:.55, env:.35}), til = tx('tiles', '#dedbd5', {roughness:.3, env:.4});
    const FL = {living:par, bed:par, study:par, hall:par, kitchen:til, bath:til, storage:R.concrete, garage:R.concrete, balcony:R.deck};
    Object.keys(m.colors).forEach(k => { R.floor[k] = real ? (FL[k] || par) : mk(m.colors[k], {roughness:.7}); });
    /* furniture */
    const eve = m.tod === 'evening', em = (c, e, k) => hid ? mk(c) : real ? new THREE.MeshStandardMaterial({color:c, emissive:e, emissiveIntensity:k, roughness:.6}) : new THREE.MeshLambertMaterial({color:c, emissive:e, emissiveIntensity:k});
    R.Fu = {wood:mk('#b88a5c', {roughness:.6}), woodDark:mk('#5b4332', {roughness:.6}), white:mk('#f1efea', {roughness:.5}), linen:mk('#ece7de', {roughness:.95}), headboard:mk('#8a7563', {roughness:.9}),
      sofa:mk('#8d939a', {roughness:.95}), sofaB:mk('#b7a48c', {roughness:.95}), cushion:mk('#a5aab0', {roughness:.95}), black:mk('#26282c', {roughness:.5}), metal:mk('#aab0b6', {roughness:.35, metalness:.6}),
      shade:em('#f5ead8', '#ffcf8a', eve ? 2.4 : .15), ceramic:mk('#f7f6f2', {roughness:.15}), water:mk('#9cc3d6', {roughness:.05}), mirror:mk('#d9e1e6', {roughness:.05, metalness:.9}),
      glassP:hid ? mk('#eef3f6') : new THREE.MeshStandardMaterial({color:'#cfe0ea', transparent:true, opacity:.35, roughness:.05}),
      rug:mk('#d6c7ae', {roughness:1}), rug2:mk('#b9c0c6', {roughness:1}), plant:mk('#4f7d3b', {roughness:.9, flatShading:true}), pot:mk('#cbb79c', {roughness:.8}), screen:mk('#14161a', {roughness:.2}),
      worktop:mk('#3b3a38', {roughness:.35}), tile:mk('#e8e6e1', {roughness:.3}), steel:mk('#c9cdd1', {roughness:.3, metalness:.7}), box:mk('#c4a57c', {roughness:.9}),
      car:[mk('#9aa3ad', {roughness:.25, metalness:.6}), mk('#24304a', {roughness:.25, metalness:.6}), mk('#7a2a26', {roughness:.25, metalness:.6})], carGlass:mk('#1d2430', {roughness:.08, metalness:.3}),
      lightW:em('#ffffff', '#fff4dc', eve ? 2 : .3), accent:['#c46a43', '#5d7fa8', '#7d9a6a', '#b8945a'].map(c => mk(c, {roughness:.95}))};
    R.fence = tx('deck', '#7a5a43', {tint:'#9b7d68', roughness:.85});
    R.bollard = mk('#2c2e32', {roughness:.5}); R.bulb = em('#fff2d6', '#ffd9a0', eve ? 3 : .2);
    if(eve && !hid){ R.glass.emissive = new THREE.Color('#ffc98a'); R.glass.emissiveIntensity = real ? 1.8 : 1; R.glass.opacity = .9; }
    return R;
  }

  /* ---------- geometry helpers ---------- */
  function edgeLines(geo, thr){ const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo, thr || 20), LM); return e; }
  function box(x0, x1, y0, y1, z0, z1, mat, o = {}){
    if(x1 - x0 < 1e-3 || y1 - y0 < 1e-3 || z1 - z0 < 1e-3) return null;
    const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m = new THREE.Mesh(g, mat);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); if(!o.nouv) wuv(g, m.position);
    m.castShadow = o.cast !== false; m.receiveShadow = true; root.add(m);
    if(!o.noEdge){ const e = edgeLines(g); e.position.copy(m.position); root.add(e); }
    return m;
  }
  /* world-space UVs in metres so textures keep their real size on every face */
  function wuv(g, off){
    const p = g.attributes.position, n = g.attributes.normal; if(!n) return;
    let uv = g.attributes.uv; if(!uv){ uv = new THREE.Float32BufferAttribute(new Float32Array(p.count * 2), 2); g.setAttribute('uv', uv); }
    for(let i = 0; i < p.count; i++){ const x = p.getX(i) + off.x, y = p.getY(i) + off.y, z = p.getZ(i) + off.z, ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
      if(ay >= ax && ay >= az) uv.setXY(i, x, z); else if(ax >= az) uv.setXY(i, z, y); else uv.setXY(i, x, y); }
    uv.needsUpdate = true;
  }
  function prect(ori, u0, u1, v0, v1, y0, y1, mat, o){ const a = Math.min(u0, u1), b = Math.max(u0, u1), c = Math.min(v0, v1), d = Math.max(v0, v1);
    if(mat === M.pave || mat === M.porch || mat === M.concrete) PAVED.push(ori === 'h' ? [a, b, c, d] : [c, d, a, b]);
    return ori === 'h' ? box(a, b, y0, y1, c, d, mat, o) : box(c, d, y0, y1, a, b, mat, o); }
  /* facade material for an exterior wall piece */
  function facadeAt(i, yl){ const f = MODEL.facade; if(f !== 'mixed') return M.F[f] || M.F.plaster;
    if(MODEL.nfl > 1) return i === 0 ? M.F.brick : M.F.plaster; return yl < .9 ? M.F.stone : M.F.plaster; }
  function extMats(ori, side, fm, top){ const I = M.wallInt, a = [I, I, top || I, I, I, I], out = -side || 1;
    if(ori === 'h'){ a[0] = a[1] = fm; a[out > 0 ? 4 : 5] = fm; } else { a[4] = a[5] = fm; a[out > 0 ? 0 : 1] = fm; } return a; }
  function ewall(ori, c, a, b, t, y0, y1, side, i, top){
    const z0 = i * FH, band = MODEL.facade === 'mixed' && MODEL.nfl === 1 ? z0 + .9 : null;
    if(band && y0 < band - 1e-3 && y1 > band + 1e-3){ ewall(ori, c, a, b, t, y0, band, side, i, null); ewall(ori, c, a, b, t, band, y1, side, i, top); return; }
    return wbox(ori, c, a, b, t, y0, y1, extMats(ori, side, facadeAt(i, (y0 + y1) / 2 - z0), top));
  }
  /* a box lying along a wall line: plan x/y map to three x/z, height to y */
  function wbox(ori, c, a, b, t, y0, y1, mat, o){
    return ori === 'h' ? box(a, b, y0, y1, c - t / 2, c + t / 2, mat, o) : box(c - t / 2, c + t / 2, y0, y1, a, b, mat, o);
  }
  function MB(){ const p = [], u = []; return {
    tri(a, b, c){ p.push(...a, ...b, ...c); },
    quad(a, b, c, d){ p.push(...a, ...b, ...c, ...a, ...c, ...d); },
    uvq(a, b, c, d){ u.push(...a, ...b, ...c, ...a, ...c, ...d); }, uvt(a, b, c){ u.push(...a, ...b, ...c); },
    geo(){ const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
      while(u.length < p.length / 3 * 2) u.push(0, 0); g.setAttribute('uv', new THREE.Float32BufferAttribute(u, 2)); g.computeVertexNormals(); return g; }
  }; }

  /* ---------- walls with openings ---------- */
  function walls(fl, i, H, cutTop){
    const z0 = i * FH, lines = new Map();
    const key = (ori, c) => ori + Math.round(c * 1000);
    const add = (ori, c, a, b, side, bal) => { const k = key(ori, c); if(!lines.has(k)) lines.set(k, {ori, c, items:[], ops:[]}); lines.get(k).items.push({a, b, side, bal}); };
    fl.rooms.forEach(r => { const bal = r.type === 'balcony';
      add('h', r.y, r.x, r.x + r.w, 1, bal); add('h', r.y + r.h, r.x, r.x + r.w, -1, bal);
      add('v', r.x, r.y, r.y + r.h, 1, bal); add('v', r.x + r.w, r.y, r.y + r.h, -1, bal); });
    fl.ops.forEach(o => { const L = lines.get(key(o.ori, o.c)); if(L) L.ops.push(o); });
    const TH = {ext:.25, int:.12, rail:.1};
    lines.forEach(L => {
      const P = [...new Set(L.items.flatMap(it => [it.a, it.b]).concat(L.ops.flatMap(o => [o.a, o.b])).map(v => Math.round(v * 1000) / 1000))].sort((a, b) => a - b);
      const runs = [];
      for(let k = 0; k < P.length - 1; k++){
        const a = P[k], b = P[k + 1]; if(b - a < 1e-3) continue; const m = (a + b) / 2;
        let minus = false, plus = false, bal = false;
        L.items.forEach(it => { if(it.a <= m && m <= it.b){ if(it.bal) bal = true; else if(it.side < 0) minus = true; else plus = true; } });
        let s = null;
        if(minus || plus || bal){ const type = minus || plus ? (minus && plus ? 'int' : 'ext') : 'rail';
          s = {a, b, type, side:plus && !minus ? 1 : (minus && !plus ? -1 : 0), op:type === 'rail' ? null : (L.ops.find(o => o.a - 1e-4 <= m && m <= o.b + 1e-4) || null)}; }
        const lr = runs[runs.length - 1];
        if(s && lr && lr.type === s.type && lr.side === s.side && lr.op === s.op && near(lr.b, s.a)) lr.b = s.b;
        else if(s && lr && !near(lr.b, s.a)){ runs.push(null); runs.push(s); }
        else runs.push(s);
      }
      runs.forEach((r, k) => {
        if(!r) return;
        const t = TH[r.type], prev = runs[k - 1], next = runs[k + 1];
        const a = r.a - (!prev && !r.op ? t / 2 : 0), b = r.b + (!next && !r.op ? t / 2 : 0);
        const wm = r.type === 'ext' ? M.wallExt : r.type === 'rail' ? M.rail : M.wallInt;
        const mat = cutTop && r.type !== 'rail' ? [wm, wm, M.cut, wm, wm, wm] : wm;
        if(r.type === 'rail'){ wbox(L.ori, L.c, a, b, t, z0, z0 + Math.min(1.05, H), mat); return; }
        const o = r.op, ext = r.type === 'ext', ct = cutTop ? M.cut : null;
        const piece = (y0, y1, top) => ext ? ewall(L.ori, L.c, a, b, t, y0, y1, r.side, i, top ? ct : null) : wbox(L.ori, L.c, a, b, t, y0, y1, top ? mat : wm);
        if(ext && i === 0) PERIM.push({ori:L.ori, c:L.c, a:r.a, b:r.b, out:-(r.side || 1)});
        if(!o){
          if(ext && (MODEL.facade === 'timber' || MODEL.facade === 'cedar') && r.b - r.a > 1.3){ const cw = Math.min(.9, (r.b - r.a) / 2 - .1), sa = !prev ? a + cw : a, sb = !next ? b - cw : b;
            if(!prev) wbox(L.ori, L.c, a, sa, t, z0, z0 + H, extMats(L.ori, r.side, M.F.stone, cutTop ? M.cut : null));
            if(!next) wbox(L.ori, L.c, sb, b, t, z0, z0 + H, extMats(L.ori, r.side, M.F.stone, cutTop ? M.cut : null));
            wbox(L.ori, L.c, sa, sb, t, z0, z0 + H, extMats(L.ori, r.side, M.F[MODEL.facade], cutTop ? M.cut : null)); return; }
          piece(z0, z0 + H, true); return; }
        const s = Math.min(o.s, H), hd = Math.min(o.h, H);
        if(ext && i === 0 && o.k === 'door') ENTRIES.push({ori:L.ori, c:L.c, a:r.a, b:r.b, out:-(r.side || 1), h:o.h});
        if(s > 0) piece(z0, z0 + s, s >= H);
        if(hd < H) piece(z0 + hd, z0 + H, true);
        if(s >= H) return;
        const f = .06;
        if(o.k === 'win'){
          wbox(L.ori, L.c, a + f, b - f, .03, z0 + s + f, z0 + hd - (hd < o.h ? 0 : f), M.glass, {cast:false});
          wbox(L.ori, L.c, a, a + f, .1, z0 + s, z0 + hd, M.frame); wbox(L.ori, L.c, b - f, b, .1, z0 + s, z0 + hd, M.frame);
          wbox(L.ori, L.c, a + f, b - f, .1, z0 + s, z0 + s + f, M.frame);
          if(hd >= o.h) wbox(L.ori, L.c, a + f, b - f, .1, z0 + hd - f, z0 + hd, M.frame);
          if(b - a > 1.4) wbox(L.ori, L.c, (a + b) / 2 - .03, (a + b) / 2 + .03, .08, z0 + s + f, z0 + hd - f, M.frame);
          return;
        }
        if(o.k === 'garage'){
          const g = wbox(L.ori, L.c + (o.sw || 1) * -.05, a, b, .05, z0, z0 + hd, M.garage, {nouv:true});
          if(g && MODEL.style === 'realistic') return;
          if(g){ const pts = []; for(let y = .5; y < hd - .1; y += .5){ const yy = z0 + y - g.position.y;
              if(L.ori === 'h') pts.push(-(b - a) / 2, yy, -.03 * (o.sw || 1), (b - a) / 2, yy, -.03 * (o.sw || 1));
              else pts.push(-.03 * (o.sw || 1), yy, -(b - a) / 2, -.03 * (o.sw || 1), yy, (b - a) / 2); }
            const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
            const ln = new THREE.LineSegments(lg, LM); ln.position.copy(g.position); root.add(ln); }
          return;
        }
        /* door: frame + leaf */
        wbox(L.ori, L.c, a, a + f, t + .02, z0, z0 + hd, M.frame); wbox(L.ori, L.c, b - f, b, t + .02, z0, z0 + hd, M.frame);
        if(hd >= o.h) wbox(L.ori, L.c, a, b, t + .02, z0 + hd - f, z0 + hd, M.frame);
        wbox(L.ori, L.c, a + f, b - f, .05, z0 + .01, z0 + hd - (hd >= o.h ? f : 0), r.type === 'ext' ? M.doorExt : M.doorInt);
      });
    });
  }

  /* ---------- roof ---------- */
  function roof(m, top, zt){
    const rs = m.floors[top].rooms.filter(r => r.type !== 'balcony'); if(!rs.length) return;
    const b = [1e9, 1e9, -1e9, -1e9];
    rs.forEach(r => { b[0] = Math.min(b[0], r.x); b[1] = Math.min(b[1], r.y); b[2] = Math.max(b[2], r.x + r.w); b[3] = Math.max(b[3], r.y + r.h); });
    let type = m.roof.type;
    if(type === 'flat'){
      rs.forEach(r => box(r.x - .3, r.x + r.w + .3, zt - SL, zt + .15, r.y - .3, r.y + r.h + .3, M.roof));
      return;
    }
    const o = .5, alongX = b[2] - b[0] >= b[3] - b[1];
    const P = (u, v, h) => alongX ? [u, h, v] : [v, h, u];
    const bu0 = alongX ? b[0] : b[1], bu1 = alongX ? b[2] : b[3], bv0 = alongX ? b[1] : b[0], bv1 = alongX ? b[3] : b[2];
    const u0 = bu0 - o, u1 = bu1 + o, v0 = bv0 - o, v1 = bv1 + o, vm = (v0 + v1) / 2, half = (v1 - v0) / 2;
    const ye = zt - o * T30, hr = ye + half * T30, th = .22;
    const hip = type === 'hip', ru0 = hip ? Math.min(u0 + half, (u0 + u1) / 2) : u0, ru1 = hip ? Math.max(u1 - half, (u0 + u1) / 2) : u1;
    const mb = MB(), cs = Math.cos(Math.PI / 6), sh = half / cs;
    for(const d of [0, -th]){
      const A = P(u0, v0, ye + d), B = P(u1, v0, ye + d), C = P(u1, v1, ye + d), D = P(u0, v1, ye + d), R0 = P(ru0, vm, hr + d), R1 = P(ru1, vm, hr + d);
      mb.quad(A, B, R1, R0); mb.quad(C, D, R0, R1);
      if(d === 0){ mb.uvq([u0, 0], [u1, 0], [ru1, sh], [ru0, sh]); mb.uvq([u1, 0], [u0, 0], [ru0, sh], [ru1, sh]); }
      else { mb.uvq([0, 0], [0, 0], [0, 0], [0, 0]); mb.uvq([0, 0], [0, 0], [0, 0], [0, 0]); }
      if(hip){ mb.tri(D, A, R0); mb.tri(B, C, R1);
        if(d === 0){ mb.uvt([v1, 0], [v0, 0], [vm, (ru0 - u0) / cs]); mb.uvt([v0, 0], [v1, 0], [vm, (u1 - ru1) / cs]); }
        else { mb.uvt([0, 0], [0, 0], [0, 0]); mb.uvt([0, 0], [0, 0], [0, 0]); } }
    }
    /* perimeter faces for thickness */
    const per = hip ? [[u0, v0, ye, u1, v0, ye], [u1, v0, ye, u1, v1, ye], [u1, v1, ye, u0, v1, ye], [u0, v1, ye, u0, v0, ye]]
      : [[u0, v0, ye, u1, v0, ye], [u1, v0, ye, u1, vm, hr], [u1, vm, hr, u1, v1, ye], [u1, v1, ye, u0, v1, ye], [u0, v1, ye, u0, vm, hr], [u0, vm, hr, u0, v0, ye]];
    per.forEach(e => mb.quad(P(e[0], e[1], e[2]), P(e[3], e[4], e[5]), P(e[3], e[4], e[5] - th), P(e[0], e[1], e[2] - th)));
    { const lv = rs.filter(r => r.type === 'living')[0] || rs.slice().sort((a, b) => b.w * b.h - a.w * a.h)[0];
      if(lv){ const lu = alongX ? lv.x + lv.w / 2 : lv.y + lv.h / 2, lvv = vm + Math.min(1, half * .35), q = P(Math.max(bu0 + .6, Math.min(bu1 - .6, lu)), lvv, 0);
        box(q[0] - .3, q[0] + .3, zt - .4, hr + .5, q[2] - .3, q[2] + .3, M.F.brick); box(q[0] - .36, q[0] + .36, hr + .5, hr + .58, q[2] - .36, q[2] + .36, M.canopy); } }
    const g = mb.geo(), mesh = new THREE.Mesh(g, M.roof); mesh.castShadow = true; mesh.receiveShadow = true; root.add(mesh); root.add(edgeLines(g, 15));
    /* standing seams (drawn as lines when the roof is not textured) */
    if(MODEL.style === 'realistic' || (m.roof.mat || 'seam') !== 'seam'){ gableWalls(); return; }
    const pts = [], st = .45, lift = .012;
    for(let u = u0 + st / 2; u < u1; u += st){ const d = hip ? Math.min(half, u - u0, u1 - u) : half;
      pts.push(...P(u, v0, ye + lift), ...P(u, v0 + d, ye + d * T30 + lift), ...P(u, v1, ye + lift), ...P(u, v1 - d, ye + d * T30 + lift)); }
    if(hip) for(let v = v0 + st / 2; v < v1; v += st){ const d = Math.min(v - v0, v1 - v);
      pts.push(...P(u0, v, ye + lift), ...P(u0 + d, v, ye + d * T30 + lift), ...P(u1, v, ye + lift), ...P(u1 - d, v, ye + d * T30 + lift)); }
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); root.add(new THREE.LineSegments(lg, M.seam));
    gableWalls();
    function gableWalls(){
    if(!hip){ const gb = MB(), t = .25;
      for(const u of [bu0, bu1]) for(const s of [-t / 2, t / 2]) gb.tri(P(u + s, bv0, zt - .3), P(u + s, bv1, zt - .3), P(u + s, (bv0 + bv1) / 2, zt + (bv1 - bv0) / 2 * T30 - th - .02));
      for(const u of [bu0, bu1]){ const a = P(u - t / 2, bv0, zt - .3), c = P(u - t / 2, (bv0 + bv1) / 2, zt + (bv1 - bv0) / 2 * T30 - th - .02), d = P(u - t / 2, bv1, zt - .3);
        const a2 = P(u + t / 2, bv0, zt - .3), c2 = P(u + t / 2, (bv0 + bv1) / 2, zt + (bv1 - bv0) / 2 * T30 - th - .02), d2 = P(u + t / 2, bv1, zt - .3);
        gb.quad(a, c, c2, a2); gb.quad(c, d, d2, c2); }
      const gg = gb.geo(); wuv(gg, {x:0, y:0, z:0});
      const fm = facadeAt(top, 2).clone(); fm.side = THREE.DoubleSide;
      const gm = new THREE.Mesh(gg, fm); gm.castShadow = true; gm.receiveShadow = true; root.add(gm); root.add(edgeLines(gg, 30));
    }
    }
  }

  /* ---------- entrance porch (довжоо), canopy and footpath ---------- */
  /* where a path leaving the house (perpendicular to a wall line) meets the plot edge or the lawn disc */
  function edgeAt(ori, o, u, b, pad){ const d = MODEL.disc;
    if(d){ const du = u - (ori === 'h' ? d.cx : d.cz), k = Math.sqrt(Math.max(0, d.R * d.R - du * du)) - .05; return (ori === 'h' ? d.cz : d.cx) + o * k; }
    return ori === 'h' ? (o > 0 ? b[3] + pad : b[1] - pad) : (o > 0 ? b[2] + pad : b[0] - pad); }
  function porch(e, b, pad){
    const w = e.b - e.a, cu = (e.a + e.b) / 2, W = Math.max(w + 1.2, 2), D = 1.4, o = e.out;
    const c0 = e.c + o * .125, c1 = c0 + o * D, c2 = c1 + o * .32, c3 = c2 + o * .32;
    const pm = /timber|wood|cedar/.test(MODEL.facade) ? M.deck : M.porch; if(pm === M.deck) PAVED.push(e.ori === 'h' ? [cu - W / 2, cu + W / 2, Math.min(c0, c3), Math.max(c0, c3)] : [Math.min(c0, c3), Math.max(c0, c3), cu - W / 2, cu + W / 2]);
    prect(e.ori, cu - W / 2, cu + W / 2, c0, c1, -PL, 0, pm);
    prect(e.ori, cu - W / 2, cu + W / 2, c1, c2, -PL, -.1, pm);
    prect(e.ori, cu - W / 2, cu + W / 2, c2, c3, -PL, -.2, pm);
    const ch = Math.max(e.h + .3, 2.45);
    prect(e.ori, cu - W / 2 - .1, cu + W / 2 + .1, c0, c1 + o * .15, ch, ch + .12, M.canopy);
    [-1, 1].forEach(k => prect(e.ori, cu + k * (W / 2 - .05) - .05, cu + k * (W / 2 - .05) + .05, c1 - o * .02, c1 - o * .12, 0, ch, M.canopy));
    const edge = edgeAt(e.ori, o, cu, b, pad);
    if((edge - c3) * o > .2){ prect(e.ori, cu - .6, cu + .6, c3, edge, -PL, -PL + .03, MODEL.style === 'realistic' ? M.concrete : M.pave, {cast:false});
      for(let d = 1.2; d < Math.abs(edge - c3) - .8; d += 2.6){ const vv = c3 + o * d, uu = cu + .9, x = e.ori === 'h' ? uu : vv, z = e.ori === 'h' ? vv : uu;
        cylAt(x, -PL, z, .06, .55, M.bollard, 10); cylAt(x, -PL + .55, z, .065, .07, M.bulb, 10); } }
    if(MODEL.tod === 'evening'){ const L = new THREE.PointLight('#ffd3a0', MODEL.style === 'realistic' ? 9 : 4, 7, 2), pc = (c0 + c1) / 2; L.position.set(e.ori === 'h' ? cu : pc, ch - .25, e.ori === 'h' ? pc : cu); root.add(L); }
  }
  /* ---------- trees, shrubs ---------- */
  function rnd(seed){ let s = seed >>> 0 || 1; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; }
  function lumpy(g, seed, amp){ const p = g.attributes.position;
    for(let i = 0; i < p.count; i++){ const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 1 + amp * (Math.sin(x * 3.1 + seed) * Math.cos(z * 2.7 + seed * 1.3) + .6 * Math.sin(y * 4.3 + seed * 2.1)); p.setXYZ(i, x * k, y * k, z * k); }
    g.computeVertexNormals(); return g; }
  function paint(g, hex, seed){ const n = g.attributes.position.count, col = new Float32Array(n * 3), c = new THREE.Color(), r = rnd(seed);
    for(let f = 0; f < n; f += 3){ c.set(hex); c.offsetHSL((r() - .5) * .05, (r() - .5) * .12, (r() - .5) * .14); for(let k = 0; k < 3 && f + k < n; k++) col.set([c.r, c.g, c.b], (f + k) * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g; }
  function part(g, mat, x, y, z, edges){ const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; root.add(m);
    if(edges){ const e = edgeLines(g, 25); e.position.copy(m.position); root.add(e); } return m; }
  /* cross-plane billboards: n vertical quads around the y axis, normals up so foliage is lit evenly */
  function crossGeo(w, h, n, uvr){ const pos = [], uv = [], nor = [], u0 = uvr ? uvr[0] : 0, v0 = uvr ? uvr[1] : 0, u1 = uvr ? uvr[2] : 1, v1 = uvr ? uvr[3] : 1;
    for(let k = 0; k < n; k++){ const a = k * Math.PI / n, cx = Math.cos(a) * w / 2, cz = Math.sin(a) * w / 2, Q = [[-cx, 0, -cz], [cx, 0, cz], [cx, h, cz], [-cx, h, -cz]];
      [0, 1, 2, 0, 2, 3].forEach(i => pos.push(...Q[i])); [[u0, v0], [u1, v0], [u1, v1], [u0, v0], [u1, v1], [u0, v1]].forEach(q => uv.push(...q)); for(let i = 0; i < 6; i++) nor.push(0, 1, 0); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); return g; }
  /* camera-facing (around the vertical axis) billboard; in the shadow pass it faces the sun so the shadow keeps the tree's outline */
  const _v = new THREE.Vector3();
  function sprite(g, mat, x, z, rot, shadow){ const m = new THREE.Mesh(g, mat); m.position.set(x, -PL, z); m.castShadow = shadow; m.customDepthMaterial = mat.userData.depth;
    const face = c => { if(c.isOrthographicCamera){ c.getWorldDirection(_v); m.rotation.y = Math.atan2(-_v.x, -_v.z); } else m.rotation.y = Math.atan2(c.position.x - x, c.position.z - z);
      m.updateMatrix(); m.matrixWorld.copy(m.matrix); m.modelViewMatrix.multiplyMatrices(c.matrixWorldInverse, m.matrixWorld); m.normalMatrix.getNormalMatrix(m.modelViewMatrix); };
    m.onBeforeRender = (r, sc, c) => face(c); m.onBeforeShadow = (r, o, c, sc) => face(sc); root.add(m); return m; }
  function tree(x, z, s, kind, seed, edges){
    const y0 = -PL;
    if(MODEL.style === 'realistic'){ const r = rnd(seed);
      if(kind === 'conifer'){ if(!realTree('Pine Medium', 7.5 * s, x, z, r() * 6)) sprite(crossGeo(3.4 * s, 7 * s, 1), M.pine, x, z, 0, true); }
      else if(!realTree(['Oak Medium', 'Ash Medium', 'Oak Small'][Math.floor(r() * 3)], 7 * s, x, z, r() * 6)) sprite(crossGeo(5 * s, 6.6 * s, 1), M.leafy, x, z, 0, true);
      return; }
    if(kind === 'conifer'){
      part(new THREE.CylinderGeometry(.08 * s, .13 * s, 1.2 * s, 7), M.trunk, x, y0 + .6 * s, z, false);
      for(let k = 0; k < 6; k++){ const g = paint(lumpy(new THREE.ConeGeometry((1.15 - .16 * k) * s, 1.3 * s, 10, 2).toNonIndexed(), seed + k, .07), '#34503a', seed * 7 + k);
        part(g, M.conifer, x, y0 + (1.4 + k * .7) * s, z, edges); }
      return; }
    part(new THREE.CylinderGeometry(.09 * s, .15 * s, 2 * s, 7), M.trunk, x, y0 + s, z, false);
    const r = rnd(seed); [[0, 2.75, 0, 1.15], [.62, 2.35, .25, .82], [-.55, 2.45, -.3, .86], [.1, 3.3, -.15, .78]].forEach((q, k) => {
      const g = paint(lumpy(new THREE.IcosahedronGeometry(q[3] * s * (.9 + r() * .2), 3), seed + k * 3, .13), '#56743a', seed * 13 + k);
      part(g, M.leaf, x + q[0] * s, y0 + q[1] * s, z + q[2] * s, edges); });
  }
  function free(x, z, rad, b){ if(x > b[0] - rad && x < b[2] + rad && z > b[1] - rad && z < b[3] + rad) return false;
    return !PAVED.some(p => x > p[0] - rad && x < p[1] + rad && z > p[2] - rad && z < p[3] + rad); }
  /* a ring of spruce and pine behind and around the plot, instanced */
  function forest(b, pad){
    const parts = [], r = rnd(91);
    for(let k = 0; k < 7; k++){ const g = lumpy(new THREE.ConeGeometry(1.15 - .15 * k, 1.3, 9, 1).toNonIndexed(), 5 + k, .07); g.translate(0, 1.5 + k * .72, 0); paint(g, '#2f4a33', 40 + k); parts.push(g); }
    const pos = [], col = []; parts.forEach(g => { pos.push(...g.attributes.position.array); col.push(...g.attributes.color.array); });
    const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); cg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); cg.computeVertexNormals();
    const tg = new THREE.CylinderGeometry(.07, .12, 2, 6); tg.translate(0, 1, 0);
    const cx = (b[0] + b[2]) / 2, cz = (b[1] + b[3]) / 2, R0 = Math.max(b[2] - b[0], b[3] - b[1]) / 2 + pad + 5, list = [];
    for(let i = 0; i < 240 && list.length < 140; i++){ const an = r() * Math.PI * 2, d = R0 + 2 + r() * 38, x = cx + Math.cos(an) * d, z = cz + Math.sin(an) * d;
      if(z > cz + 4 && Math.abs(x - cx) < R0 + 6 && d < R0 + 24) continue; list.push([x, z, 1.6 + r() * 2.4, r() * 6]); }
    if(MODEL.style === 'realistic'){ const g = crossGeo(3.2, 7, 1); list.forEach(t => { const sp = sprite(g, M.pine, t[0], t[1], 0, false); sp.scale.set(t[2] * .55, t[2] * .62, t[2] * .55); }); return; }
    const real = false, im = new THREE.InstancedMesh(real ? crossGeo(3.2, 7, 3) : cg, real ? M.pine : M.conifer, list.length), it = new THREE.InstancedMesh(tg, M.trunk, real ? 0 : list.length), mt = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3();
    list.forEach((t, i) => { q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), t[3]); if(real) sc.set(t[2] * .55, t[2] * .62, t[2] * .55); else sc.set(t[2] * .75, t[2] * 1.45, t[2] * .75); p.set(t[0], -PL, t[1]); mt.compose(p, q, sc); im.setMatrixAt(i, mt); if(!real) it.setMatrixAt(i, mt); });
    im.castShadow = false; root.add(im, it);
  }
  function landscape(b, pad, m){
    const edges = m.style !== 'realistic', d = m.disc, real = m.style === 'realistic';
    if(d){
      /* three trees around the house on the lawn island, like a presentation model */
      const spots = [[-2.35, 'Ash Medium', 7.5], [-.75, 'Oak Medium', 8.5], [2.45, 'Oak Small', 6]];
      spots.forEach(([an, preset, h], k) => { let ok = false;
        for(let t = 0; t < 8 && !ok; t++){ const a = an + (t % 2 ? 1 : -1) * Math.ceil(t / 2) * .18, rr = d.R - 1.5, x = d.cx + Math.cos(a) * rr, z = d.cz + Math.sin(a) * rr;
          if(!free(x, z, 1.1, b)) continue; ok = true;
          if(!(real && realTree(preset, h, x, z, k * 2.1))) tree(x, z, h / 6.6, 'leaf', 17 + k * 31, edges); } });
      if(real){ const R2 = d.R - .1, inside = () => { const rr = Math.sqrt(Math.random()) * R2, a = Math.random() * 6.283; return [d.cx + Math.cos(a) * rr, d.cz + Math.sin(a) * rr]; };
        lawnGrass(inside, Math.PI * R2 * R2 - (b[2] - b[0]) * (b[3] - b[1]), matchMedia('(pointer: coarse)').matches ? 9000 : 26000, b); }
      shrubs(b, m, edges); return;
    }
    const spots = [[b[0] - 4, b[1] - 3, 1.25, 'leaf'], [b[2] + 4.2, b[1] - 2, 1.1, 'conifer'], [b[2] + 3.6, b[3] + 4.6, 1.15, 'leaf'], [b[0] - 3.8, b[3] + 3.4, 1.0, 'conifer'],
      [b[0] - 5.5, (b[1] + b[3]) / 2, .95, 'conifer'], [(b[0] + b[2]) / 2, b[1] - 5.2, 1.2, 'leaf']];
    spots.forEach((q, k) => { let [x, z] = q; for(let t = 0; t < 6 && !free(x, z, 1.4, b); t++){ x += (x < (b[0] + b[2]) / 2 ? -1 : 1) * .9; }
      if(free(x, z, 1.4, b)) tree(x, z, q[2], q[3], 17 + k * 31, edges); });
    /* boulders */
    const rr = rnd(57); for(let k = 0; k < 7; k++){ const x = b[0] - pad + 1 + rr() * (b[2] - b[0] + 2 * pad - 2), z = b[1] - pad + 1 + rr() * (b[3] - b[1] + 2 * pad - 2), s = .25 + rr() * .45;
      if(!free(x, z, 1, b)) continue; const g = lumpy(new THREE.DodecahedronGeometry(s, 0), k * 7, .2); g.scale(1.3, .6, 1); part(g, M.rock, x, -PL + s * .25, z, edges); }
    shrubs(b, m, edges);
    if(real){ const X0 = b[0] - pad + .3, X1 = b[2] + pad - .3, Z0 = b[1] - pad + .3, Z1 = b[3] + pad - .3;
      lawnGrass(() => [X0 + Math.random() * (X1 - X0), Z0 + Math.random() * (Z1 - Z0)], (X1 - X0) * (Z1 - Z0) - (b[2] - b[0]) * (b[3] - b[1]), matchMedia('(pointer: coarse)').matches ? 9000 : 26000, b); }
  }
  function shrubs(b, m, edges){
    /* shrubs along the front facade, clear of paths */
    for(let x = b[0] + .7; x < b[2] - .5; x += 1.6){ const z = b[3] + .75;
      if(PAVED.some(p => x > p[0] - .7 && x < p[1] + .7 && z > p[2] - .7 && z < p[3] + .7)) continue;
      if(m.style === 'realistic'){ if(realTree(['Bush 1', 'Bush 2', 'Bush 3'][Math.floor(x * 7) % 3], 1.0 + (x * 13 % 1) * .3, x, z, x)) continue; sprite(crossGeo(1.25, 1, 1, [.06, .3, .94, .92]), M.leafy, x, z, 0, true); continue; }
      const g = paint(lumpy(new THREE.IcosahedronGeometry(.42 + (x * 7 % 1) * .12, 1), x * 3, .14), '#58763a', Math.floor(x * 100));
      part(g, M.leaf, x, -PL + .3, z, edges); }

  }
  function cylAt(x, y, z, r, h, mat, seg){ const g = new THREE.CylinderGeometry(r, r, h, seg || 12), m = new THREE.Mesh(g, mat); m.position.set(x, y + h / 2, z); m.castShadow = true; m.receiveShadow = true; root.add(m); return m; }
  function sphAt(x, y, z, r, mat){ const g = new THREE.SphereGeometry(r, 12, 9), m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; root.add(m); return m; }
  /* wooden plot fence with openings where paths and drives leave the plot */
  function fence(b, pad){
    const x0 = b[0] - pad + .35, x1 = b[2] + pad - .35, z0 = b[1] - pad + .35, z1 = b[3] + pad - .35, y = -PL;
    const sides = [['h', z0, x0, x1], ['h', z1, x0, x1], ['v', x0, z0, z1], ['v', x1, z0, z1]];
    sides.forEach(([ori, c, a0, a1]) => {
      const gaps = PAVED.filter(p => ori === 'h' ? (p[2] <= c + .4 && p[3] >= c - .4) : (p[0] <= c + .4 && p[1] >= c - .4)).map(p => ori === 'h' ? [p[0] - .3, p[1] + .3] : [p[2] - .3, p[3] + .3]);
      let segs = [[a0, a1]]; gaps.forEach(g => { const n = []; segs.forEach(sg => { if(g[1] <= sg[0] || g[0] >= sg[1]) n.push(sg); else { if(g[0] > sg[0]) n.push([sg[0], g[0]]); if(g[1] < sg[1]) n.push([g[1], sg[1]]); } }); segs = n; });
      segs.forEach(([s0, s1]) => { if(s1 - s0 < .3) return; const n = Math.max(1, Math.ceil((s1 - s0) / 2.2));
        for(let k = 0; k <= n; k++){ const u = s0 + (s1 - s0) * k / n; if(ori === 'h') box(u - .05, u + .05, y, y + 1.35, c - .05, c + .05, M.fence, {noEdge:MODEL.style === 'realistic'}); else box(c - .05, c + .05, y, y + 1.35, u - .05, u + .05, M.fence, {noEdge:MODEL.style === 'realistic'}); }
        [.3, .62, .94].forEach(h => { if(ori === 'h') box(s0, s1, y + h, y + h + .16, c - .02, c + .02, M.fence, {noEdge:MODEL.style === 'realistic'}); else box(c - .02, c + .02, y + h, y + h + .16, s0, s1, M.fence, {noEdge:MODEL.style === 'realistic'}); }); });
    });
  }
  /* ---------- photographic assets: real grass clumps, lawn photo texture, generated trees (loaded on demand) ---------- */
  const A = {state:0};
  function loadAssets(){
    if(A.state) return; A.state = 1;
    const base = new URL('./3d/', import.meta.url).href, tl = new THREE.TextureLoader();
    Promise.all([
      new GLTFLoader().loadAsync(base + 'grass.glb'),
      tl.loadAsync(base + 'grass.jpg'),
      import('./vendor/ez-tree.es.js')
    ]).then(([gl, lawn, ez]) => {
      let geo = null, map = null; gl.scene.traverse(o => { if(o.isMesh && !geo){ geo = o.geometry.clone(); map = o.material.map; } });
      geo.computeBoundingBox(); const bb = geo.boundingBox, h = bb.max.y - bb.min.y || 1; geo.translate(0, -bb.min.y, 0); geo.scale(.34 / h, .34 / h, .34 / h); geo.userData.keep = true;
      A.grassGeo = geo; A.grassMap = map;
      lawn.colorSpace = THREE.SRGBColorSpace; lawn.wrapS = lawn.wrapT = THREE.RepeatWrapping; lawn.anisotropy = 16; lawn.repeat.set(1 / 2.4, 1 / 2.4); A.lawn = lawn;
      A.ez = ez; A.trees = {}; A.state = 2;
      if(MODEL && MODEL.style === 'realistic') build(MODEL);
    }).catch(e => { console.warn('3D assets', e); A.state = 3; });
  }
  /* a generated tree (cached per preset, cloned per use), scaled to a target height; materials made physically based */
  function realTree(preset, height, x, z, rot){
    if(A.state !== 2) return false;
    let tpl = A.trees[preset];
    if(!tpl){ try{ const t = new A.ez.Tree(); t.loadPreset(preset); t.generate(); t.updateMatrixWorld(true);
        t.traverse(o => { if(!o.isMesh) return; const m0 = o.material, std = new THREE.MeshStandardMaterial({color:m0.color, map:m0.map, normalMap:m0.normalMap || null, roughnessMap:m0.roughnessMap || null,
            aoMap:m0.aoMap || null, alphaTest:m0.alphaTest || 0, side:m0.side, transparent:false, roughness:.85, envMapIntensity:.3});
          if(std.alphaTest){ std.userData.depth = new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking, map:m0.map, alphaTest:m0.alphaTest}); o.customDepthMaterial = std.userData.depth; }
          o.material = std; o.geometry.userData.keep = true; o.castShadow = true; o.receiveShadow = true; });
        const bx = new THREE.Box3().setFromObject(t); tpl = {obj:t, h:bx.max.y - bx.min.y || 1}; A.trees[preset] = tpl; }
      catch(e){ console.warn('tree', e); A.trees[preset] = tpl = {fail:true}; } }
    if(tpl.fail) return false;
    const c = tpl.obj.clone(); const k = height / tpl.h; c.scale.setScalar(k); c.position.set(x, -PL, z); c.rotation.y = rot || 0;
    c.traverse(o => { if(o.isMesh && o.material.userData.depth) o.customDepthMaterial = o.material.userData.depth; });
    root.add(c); return true;
  }
  /* the gravel drip strip around the ground floor stays clear of grass */
  function onGravel(x, z){ const f0 = MODEL && MODEL.floors[0];
    if(f0 && f0.rooms.some(r => x > r.x - .95 && x < r.x + r.w + .95 && z > r.y - .95 && z < r.y + r.h + .95)) return true;
    return PERIM.some(e => { const u = e.ori === 'h' ? x : z, v = (e.ori === 'h' ? z : x) - e.c;
    return u > e.a - .95 && u < e.b + .95 && v * e.out > -.05 && v * e.out < .95; }); }
  /* dense lawn: instanced grass clumps with colour variation */
  function lawnGrass(inside, area, count, b){
    if(A.state !== 2) return;
    const mat = new THREE.MeshStandardMaterial({map:A.grassMap, alphaTest:.45, side:THREE.DoubleSide, roughness:.9, envMapIntensity:.25, color:'#86ad55'});
    const n = Math.round(Math.min(count, area * 70)), im = new THREE.InstancedMesh(A.grassGeo, mat, n), r = rnd(5), mt = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), col = new THREE.Color();
    let i = 0;
    for(let t = 0; t < n * 3 && i < n; t++){ const pt = inside(r()); if(!pt || !free(pt[0], pt[1], .12, b) || onGravel(pt[0], pt[1])) continue;
      q.setFromAxisAngle(up, r() * 6.28); const s = .7 + r() * .7; sc.set(s * (.8 + r() * .5), s, s * (.8 + r() * .5)); p.set(pt[0], -PL, pt[1]); mt.compose(p, q, sc); im.setMatrixAt(i, mt);
      col.setHSL(.17 + r() * .1, .25 + r() * .3, .62 + r() * .3); im.setColorAt(i, col); i++; }
    im.count = i; im.receiveShadow = true; im.castShadow = false; root.add(im);
  }
  /* ---------- whole model ---------- */
  /* ---------- "Render": progressive path tracing of the same scene (global illumination, soft light, reflections) ---------- */
  let PT = null, ptOn = false, ptSaved = null, ptCb = null, ptGoal = 600, ptEnv = null;
  const ENV = {};
  function envData(){ const kind = MODEL && MODEL.tod === 'evening' ? 'skyDusk' : 'skyDay'; if(ENV[kind]) return ENV[kind];
    const src = T(kind).map.image, w = 512, h = 256, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(src, 0, 0, w, h);
    const px = g.getImageData(0, 0, w, h).data, f = new Float32Array(w * h * 4);
    for(let y = 0; y < h; y++) for(let x = 0; x < w; x++){ const i = (y * w + x) * 4, o = ((h - 1 - y) * w + x) * 4; for(let k = 0; k < 3; k++) f[o + k] = Math.pow(px[i + k] / 255, 2.2) * 1.15; f[o + 3] = 1; }
    ptEnv = new THREE.DataTexture(f, w, h, THREE.RGBAFormat, THREE.FloatType); ptEnv.mapping = THREE.EquirectangularReflectionMapping; ptEnv.magFilter = THREE.LinearFilter; ptEnv.minFilter = THREE.LinearFilter; ptEnv.needsUpdate = true; ENV[kind] = ptEnv; return ptEnv; }
  /* path tracing starts by itself when the view is still (D5-style progressive refinement) and pauses while the user moves the camera */
  let buildId = 0, ptBuilt = -1, ptBusy = false, interacting = false, ptTimer = 0, ptFail = false;
  function canPT(){ return !ptFail && !window.PSP_NOPT && MODEL && MODEL.style === 'realistic' && renderer.capabilities.isWebGL2; }
  function autoRender(delay){ clearTimeout(ptTimer); if(!canPT()) return;
    ptTimer = setTimeout(async () => {
      if(interacting || anim || ptBusy) return;
      try{
        ['backgroundRotation', 'environmentRotation'].forEach(k => { if(!(k in scene)) Object.defineProperty(THREE.Scene.prototype, k, {configurable:true, get(){ return this['_' + k] || (this['_' + k] = new THREE.Euler()); }}); });
        const mod = await import('./vendor/three-gpu-pathtracer.module.js');
        if(!PT){ PT = new mod.WebGLPathTracer(renderer); PT.tiles.set(2, 2); PT.minSamples = 2; PT.renderDelay = 0; PT.fadeDuration = 400; PT.bounces = 5; PT.filterGlossyFactor = .5;
          PT.renderScale = matchMedia('(pointer: coarse)').matches ? .6 : Math.min(1, 1.5 / renderer.getPixelRatio()); }
        if(ptBuilt !== buildId){ ptBusy = true; const id = buildId; PT.setScene(ptScene(), cam); ptBusy = false; if(id !== buildId) return autoRender(50); ptBuilt = id; }
        else { PT.setCamera(cam); }
        if(interacting || anim) return;
        ptOn = true; req();
      }catch(e){ console.warn('path tracer off', e); ptFail = true; ptBusy = false; ptOn = false; }
    }, delay ?? 700);
  }
  /* the path tracer gets a compact copy of the scene: one merged mesh per material, billboards as crossed planes */
  function ptScene(){
    const B = new Map(), v = new THREE.Vector3(), n = new THREE.Vector3(), nm = new THREE.Matrix3();
    root.updateMatrixWorld(true);
    root.traverse(o => {
      if(!o.isMesh || !o.visible || o.userData.noPT) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material], g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry;
      const P = g.attributes.position; if(!P || !P.count) return; const N = g.attributes.normal, U = g.attributes.uv, groups = g.groups.length && Array.isArray(o.material) ? g.groups : [{start:0, count:P.count, materialIndex:0}];
      let mws = [o.matrixWorld];
      if(o.isInstancedMesh){ mws = []; const step = Math.max(1, Math.ceil(o.count / 9000)); for(let i = 0; i < o.count; i += step){ const mi = new THREE.Matrix4(); o.getMatrixAt(i, mi); mws.push(new THREE.Matrix4().multiplyMatrices(o.matrixWorld, mi)); } }
      if(o.onBeforeShadow && o.customDepthMaterial){ mws = [0, Math.PI / 2].map(a => new THREE.Matrix4().compose(o.position, new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), .5 + a), o.scale)); }
      mws.forEach(mw => { nm.getNormalMatrix(mw);
        groups.forEach(gr => { const mat = mats[gr.materialIndex || 0]; if(!mat || mat.isLineBasicMaterial) return;
          if(!B.has(mat)) B.set(mat, {p:[], n:[], u:[]}); const b = B.get(mat);
          for(let i = gr.start; i < Math.min(gr.start + gr.count, P.count); i++){
            v.fromBufferAttribute(P, i).applyMatrix4(mw); b.p.push(v.x, v.y, v.z);
            if(N){ n.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); b.n.push(n.x, n.y, n.z); } else b.n.push(0, 1, 0);
            if(U) b.u.push(U.getX(i), U.getY(i)); else b.u.push(0, 0); } }); });
      if(g !== o.geometry) g.dispose();
    });
    const sc = new THREE.Scene();
    B.forEach((b, mat) => { if(!b.p.length) return; const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(b.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(b.n, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(b.u, 2));
      sc.add(new THREE.Mesh(g, mat)); });
    const s2 = new THREE.DirectionalLight(sun.color, sun.intensity); s2.position.copy(sun.position); s2.target.position.copy(sun.target.position); sc.add(s2, s2.target);
    sc.environment = envData(); sc.background = scene.background; sc.backgroundIntensity = 1;
    return sc;
  }
  function pauseRender(){ clearTimeout(ptTimer); if(ptOn){ ptOn = false; req(); } }
  function stopRender(){ pauseRender(); }
  function build(m){
    pauseRender(); buildId++;
    root.traverse(o => { if(o.geometry && !o.geometry.userData.keep) o.geometry.dispose(); });
    scene.remove(root); root = new THREE.Group(); scene.add(root);
    if(M) Object.values(M).forEach(x => { if(x && x.dispose) x.dispose(); });
    MODEL = m; ENTRIES = []; PAVED = []; PERIM = [];
    persp = !!m.persp; cam = persp ? pcam : ocam; ctl.object = cam;
    m.nfl = m.floors.filter(f => f.rooms.some(r => r.type !== 'balcony')).length || 1;
    M = mats(m.style, m);
    LM = new THREE.LineBasicMaterial({color:'#1b1d21', transparent:true, opacity:m.style === 'realistic' ? .3 : m.style === 'shaded' ? .8 : 1});
    const real = m.style === 'realistic';
    renderer.toneMapping = real ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping; renderer.toneMappingExposure = 1.05;
    scene.environment = real ? envData() : null;
    hemi.intensity = real ? .7 : m.style === 'shaded' ? .55 : 0; amb.intensity = m.style === 'shaded' ? .55 : 0;
    sun.intensity = real ? 2.6 : m.style === 'shaded' ? 1.4 : 0; sun.castShadow = m.shadows && m.style !== 'hidden';
    const eve = m.tod === 'evening';
    hemi.color.set(eve ? '#8fa2cc' : '#e8eef5'); hemi.groundColor.set(eve ? '#262a33' : '#8d8f80'); sun.color.set(eve ? '#ffad78' : '#fff1df');
    if(eve){ hemi.intensity *= .75; sun.intensity *= .5; amb.intensity *= .7; renderer.toneMappingExposure = real ? 1.45 : 1.1; }

    const solids = [];
    m.floors.forEach((f, i) => f.rooms.forEach(r => solids.push({r, i})));
    const b = [1e9, 1e9, -1e9, -1e9];
    solids.forEach(({r}) => { b[0] = Math.min(b[0], r.x); b[1] = Math.min(b[1], r.y); b[2] = Math.max(b[2], r.x + r.w); b[3] = Math.max(b[3], r.y + r.h); });
    if(!solids.length){ b[0] = 0; b[1] = 0; b[2] = 10; b[3] = 8; }
    let top = -1; m.floors.forEach((f, i) => { if(f.rooms.some(r => r.type !== 'balcony')) top = i; });
    const lastF = m.cut ? m.cur : m.floors.length - 1;
    const rt = m.roof.type === 'auto' ? 'gable' : m.roof.type, pitched = rt !== 'flat' && !m.cut;

    /* site pad, trees, paving */
    const pad = 8;
    const disc = m.site !== 'plot', cx0 = (b[0] + b[2]) / 2, cz0 = (b[1] + b[3]) / 2, RD = Math.hypot(b[2] - b[0], b[3] - b[1]) / 2 + 3.4;
    MODEL.disc = disc ? {cx:cx0, cz:cz0, R:RD} : null;
    if(real) loadAssets();
    if(disc){
      const lawnMat = real && A.lawn ? new THREE.MeshStandardMaterial({map:A.lawn, color:'#d9e2c8', roughness:1, envMapIntensity:.2}) : M.grass;
      const lg = new THREE.CylinderGeometry(RD, RD, .3, 128), lm = new THREE.Mesh(lg, [M.earth, lawnMat, M.earth]); lm.position.set(cx0, -PL - .15, cz0); wuv(lg, lm.position); lm.receiveShadow = true; root.add(lm);
      const cg = new THREE.CylinderGeometry(RD + .16, RD + .16, .42, 128), cm = new THREE.Mesh(cg, real ? M.concrete : M.slab); cm.position.set(cx0, -PL - .215, cz0); wuv(cg, cm.position); cm.receiveShadow = true; cm.castShadow = true; root.add(cm);
      if(!(MODEL.style === 'hidden')){ const fl = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShadowMaterial({opacity:m.tod === 'evening' ? .5 : .22})); fl.rotation.x = -Math.PI / 2; fl.position.set(cx0, -PL - .38, cz0); fl.receiveShadow = true; fl.userData.noPT = true; root.add(fl); }
    }
    const site = (persp && real) || disc ? null : box(b[0] - pad, b[2] + pad, -PL - .6, -PL, b[1] - pad, b[3] + pad, [M.earth, M.earth, M.grass, M.earth, M.earth, M.earth], {cast:false, noEdge:persp});
    if(site) site.receiveShadow = true;
    if(m.floors[0]) m.floors[0].ops.forEach(o => {
      if(o.k !== 'garage') return;
      const out = -(o.sw || 1), c1 = edgeAt(o.ori, out, (o.a + o.b) / 2, b, pad);
      prect(o.ori, o.a - .3, o.b + .3, o.c, c1, -PL, -PL + .04, real ? M.concrete : M.pave, {cast:false});
    });
    m.floors.forEach((f, i) => {
      if(i > lastF) return;
      const z0 = i * FH, cutHere = m.cut && i === m.cur, H = cutHere ? FH - .3 : (i === top && pitched ? FH - .3 : FH);
      f.rooms.forEach(r => {
        const solid = r.type !== 'balcony';
        if(i === 0) box(r.x, r.x + r.w, -PL, 0, r.y, r.y + r.h, M.plinth);
        else box(r.x, r.x + r.w, z0 - SL, z0, r.y, r.y + r.h, M.slab);
        box(r.x + .005, r.x + r.w - .005, z0, z0 + .03, r.y + .005, r.y + r.h - .005, M.floor[r.type] || M.slab, {noEdge:true, cast:false});
        if(solid && !cutHere && !(i === top && pitched) && !(m.roof.type === 'flat' && i === top))
          box(r.x, r.x + r.w, z0 + FH - SL, z0 + FH, r.y, r.y + r.h, M.slab);
      });
      walls(f, i, H, cutHere);
      if(cutHere){ const real2 = m.style === 'realistic';
        furnish({box:(a, b2, c, d, e, g, mat, o) => box(a, b2, c, d, e, g, mat, {noEdge:real2, cast:true}), cyl:cylAt, sph:sphAt, F:M.Fu}, f.rooms, f.ops, z0, 11 + i);
        if(m.tod === 'evening') f.rooms.filter(r => r.type !== 'balcony').slice(0, 10).forEach(r => { const L = new THREE.PointLight('#ffd6a0', real2 ? 5 : 2, Math.max(r.w, r.h) * 1.6, 2); L.position.set(r.x + r.w / 2, z0 + 2.3, r.y + r.h / 2); root.add(L); }); }
    });
    if(!m.cut && top >= 0) roof(m, top, top * FH + FH);
    if(m.porch) ENTRIES.forEach(e => porch(e, b, pad));
    if(m.fence !== false && !disc) fence(b, pad);
    /* gravel drip strip around the ground floor */
    if(real) PERIM.forEach(e => prect(e.ori, e.a - .1, e.b + .1, e.c + e.out * .13, e.c + e.out * .8, -PL, -PL + .02, M.gravel, {cast:false, noEdge:true}));
    landscape(b, pad, m);
    /* eye-level surroundings: far lawn, forest, sky and haze */
    scene.background = null; scene.fog = null;
    if(persp && real && !disc){ scene.background = envData(); scene.fog = new THREE.Fog(m.tod === 'evening' ? '#3a4560' : '#dfe7ec', 28, 150);
      const gg = new THREE.PlaneGeometry(600, 600); gg.rotateX(-Math.PI / 2); const gm = new THREE.Mesh(gg, M.grass); gm.position.set((b[0] + b[2]) / 2, -PL, (b[1] + b[3]) / 2); wuv(gg, gm.position); gm.receiveShadow = true; root.add(gm);
      forest(b, pad); }

    /* camera and sun fit */
    const cx = (b[0] + b[2]) / 2, cz = (b[1] + b[3]) / 2, hgt = (top + 1) * FH + 2, diag = Math.hypot(b[2] - b[0] + 2 * pad, b[3] - b[1] + 2 * pad, hgt);
    if(m.tod === 'evening') sun.position.set(cx - 30, 13, cz + 20); else sun.position.set(cx - 22, 34, cz + 26); sun.target.position.set(cx, 0, cz);
    const sc = sun.shadow.camera, ss = diag * .75; sc.left = -ss; sc.right = ss; sc.top = ss; sc.bottom = -ss; sc.near = 1; sc.far = 140; sc.updateProjectionMatrix();
    const key = [b.map(v => Math.round(v)).join(','), top].join('|');
    memo.pd = Math.max(16, Math.hypot(b[2] - b[0], b[3] - b[1]) * 1.55 + 6);
    if(memo.persp !== persp){ memo.persp = persp; if(fitted){ size(); home(false, cx, hgt * .3, cz); } }
    if(!fitted || key !== memo.key){ fbase = Math.max(11, Math.hypot(b[2] - b[0], b[3] - b[1], hgt) * 1.18); if(!fitted) home(false, cx, hgt * .3, cz); fitted = true; }
    memo.key = key; memo.center = [cx, hgt * .3, cz];
    size(); req(); autoRender(900);
  }

  /* ---------- camera ---------- */
  function setDir(dir, animate){
    const tgt = ctl.target.clone(), dist = persp ? (memo.pd || 30) : 120, to = tgt.clone().add(dir.clone().normalize().multiplyScalar(dist));
    if(!animate){ cam.position.copy(to); cam.up.set(0, 1, 0); cam.lookAt(tgt); ctl.update(); req(); return; }
    const from = cam.position.clone().sub(tgt), f2 = to.clone().sub(tgt), t0 = performance.now();
    anim = () => { const k = Math.min(1, (performance.now() - t0) / 450), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const v = from.clone().normalize().lerp(f2.clone().normalize(), e).normalize().multiplyScalar(dist);
      cam.position.copy(tgt.clone().add(v)); cam.lookAt(tgt); if(k >= 1){ anim = null; autoRender(); } };
    pauseRender();
    req();
  }
  function home(animate, x, y, z){
    if(x !== undefined) ctl.target.set(x, y, z); else if(memo.center) ctl.target.set(...memo.center);
    cam.zoom = 1; cam.updateProjectionMatrix();
    if(persp){ ctl.target.y = 1.6; setDir(new THREE.Vector3(Math.sin(.62), .17, Math.cos(.62)), animate); return; }
    setDir(new THREE.Vector3(Math.sin(.7), .62, Math.cos(.7)), animate);
  }
  function size(){
    const r = canvas.parentElement.getBoundingClientRect(), w = Math.max(10, r.width), h = Math.max(10, r.height), a = w / h;
    frustum = a < 1.1 ? fbase * 1.1 / a * .82 : fbase;
    renderer.setSize(w, h, false);
    pcam.aspect = a; pcam.fov = a < 1 ? 58 : 36; pcam.updateProjectionMatrix();
    cam = persp ? pcam : ocam; if(persp) return;
    cam.left = -frustum * a / 2; cam.right = frustum * a / 2; cam.top = frustum / 2; cam.bottom = -frustum / 2; cam.updateProjectionMatrix();
  }
  let pending = false;
  function req(){ if(!pending){ pending = true; requestAnimationFrame(frame); } }
  function frame(){
    pending = false; if(anim) anim();
    if(ptOn && PT){ PT.renderSample(); cube(); if(ui && ui.status) ui.status(Math.floor(PT.samples), ptGoal); if(PT.samples < ptGoal) req(); return; }
    const moved = ctl.update(); renderer.render(scene, cam); cube();
    if(moved || anim) req();
  }
  ctl.addEventListener('change', () => { if(ptOn) pauseRender(); req(); });
  ctl.addEventListener('start', () => { interacting = true; pauseRender(); });
  ctl.addEventListener('end', () => { interacting = false; autoRender(); });
  function cube(){
    if(!ui || !ui.cube) return;
    const v = cam.position.clone().sub(ctl.target), az = Math.atan2(v.x, v.z), el = Math.atan2(v.y, Math.hypot(v.x, v.z));
    ui.cube.style.transform = 'rotateX(' + (-el) + 'rad) rotateY(' + (-az) + 'rad)';
  }
  const ro = new ResizeObserver(() => { size(); req(); }); ro.observe(canvas.parentElement);

  return {
    update(m){ build(m); },
    view(name){ const D = {top:[0, 1, .0001], front:[0, 0, 1], back:[0, 0, -1], right:[1, 0, 0], left:[-1, 0, 0]}; if(name === 'home') return home(true); if(name === 'inside') return setDir(new THREE.Vector3(Math.sin(.55), 1.7, Math.cos(.55)), true); if(name === 'rear') return setDir(new THREE.Vector3(-Math.sin(.8), .55, -Math.cos(.8)), true); setDir(new THREE.Vector3(...D[name]), true); },
    resize(){ size(); pauseRender(); req(); autoRender(); },
    rendering(){ return ptOn; },
    png(cb){
      if(!ptOn) renderer.render(scene, cam);
      const w = canvas.width, h = canvas.height, c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, h);
      if(MODEL && MODEL.tod === 'evening'){ gr.addColorStop(0, '#1b2540'); gr.addColorStop(.6, '#3d4a6b'); gr.addColorStop(1, '#2a2f3a'); }
      else if(MODEL && MODEL.disc){ gr.addColorStop(0, '#f1f2f4'); gr.addColorStop(.6, '#dfe1e4'); gr.addColorStop(1, '#c9ccd1'); }
      else { gr.addColorStop(0, '#9fb6cc'); gr.addColorStop(.6, '#e4eaee'); gr.addColorStop(1, '#d5d8cc'); }
      g.fillStyle = gr; g.fillRect(0, 0, w, h); g.drawImage(canvas, 0, 0);
      g.font = '600 ' + Math.round(h * .03) + 'px Onest, Arial, sans-serif'; g.fillStyle = 'rgba(30,32,36,.8)'; g.fillText('Prime Spatial Plan', h * .03, h * .96);
      c.toBlob(cb);
    }
  };
}
