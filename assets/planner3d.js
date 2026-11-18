/* Prime Spatial Plan — Revit-style 3D view for the house planner.
   Builds walls with real thickness, door and window openings, slabs, a plinth, a site pad and a roof
   from the planner's rooms and openings, and renders them in three visual styles
   (Hidden Line, Shaded, Realistic) with an orthographic {3D} camera, ViewCube and section box. */
import * as THREE from './vendor/three.module.min.js';
import {OrbitControls} from './vendor/OrbitControls.js';

const FH = 3, SL = .25, PL = .3, T30 = Math.tan(30 * Math.PI / 180);
const near = (a, b) => Math.abs(a - b) < 1e-4;

export function create(canvas, ui){
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-10, 10, 10, -10, -1000, 2000);
  const ctl = new OrbitControls(cam, canvas);
  ctl.enableDamping = true; ctl.dampingFactor = .12; ctl.maxPolarAngle = Math.PI * .5; ctl.screenSpacePanning = true;
  ctl.minZoom = .3; ctl.maxZoom = 8; ctl.rotateSpeed = .8;
  const hemi = new THREE.HemisphereLight(0xe8eef5, 0x8d8f80, 1.15); scene.add(hemi);
  const amb = new THREE.AmbientLight(0xffffff, 0); scene.add(amb);
  const sun = new THREE.DirectionalLight(0xfff1df, 2.3); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0005; sun.shadow.normalBias = .03;
  scene.add(sun, sun.target);
  let root = new THREE.Group(); scene.add(root);
  let frustum = 24, fbase = 24, fitted = false, M = null, LM = null, anim = null;
  const memo = {};

  /* ---------- materials per visual style ---------- */
  function mats(st, m){
    const real = st === 'realistic', hid = st === 'hidden';
    const mk = (c, o = {}) => {
      const {hid:hc, roughness, metalness, flatShading, ...rest} = o;
      const base = {color:c, polygonOffset:true, polygonOffsetFactor:1, polygonOffsetUnits:1, ...rest};
      if(hid) return new THREE.MeshBasicMaterial({...base, color:hc || '#ffffff'});
      if(real) return new THREE.MeshStandardMaterial({...base, roughness:roughness ?? .85, metalness:metalness ?? 0, flatShading:!!flatShading});
      return new THREE.MeshLambertMaterial({...base, flatShading:!!flatShading});
    };
    const R = {
      wallExt: mk(real ? '#efe8dc' : '#f1eee8', {roughness:.92}),
      wallInt: mk(real ? '#f7f4ee' : '#f7f6f2'),
      cut: mk('#3b3e44', {hid:'#3b3e44'}),
      slab: mk(real ? '#e6e1d8' : '#e9e7e2'),
      plinth: mk(real ? '#8e8a83' : '#bdbab3', {roughness:.95}),
      glass: hid ? new THREE.MeshBasicMaterial({color:'#e5eef5', transparent:true, opacity:.75, polygonOffset:true, polygonOffsetFactor:1, polygonOffsetUnits:1})
        : real ? new THREE.MeshStandardMaterial({color:'#6f8fa8', roughness:.06, metalness:.35, transparent:true, opacity:.58})
        : new THREE.MeshLambertMaterial({color:'#9ec1dc', transparent:true, opacity:.6}),
      frame: mk(real ? '#3a3e44' : '#55595f', {roughness:.5, hid:'#ffffff'}),
      doorInt: mk(real ? '#d9cbb3' : '#e2d5bf', {roughness:.6}),
      doorExt: mk(real ? '#6b4528' : '#8a6040', {roughness:.55}),
      garage: mk(real ? '#cfd2d6' : '#d6d8db', {roughness:.45, metalness:real ? .3 : 0}),
      rail: mk(real ? '#f2eee7' : '#f1eee8'),
      roof: mk(m.roof.color, {roughness:.5, metalness:real ? .35 : 0, side:THREE.DoubleSide}),
      seam: new THREE.LineBasicMaterial({color:hid ? '#9a9da2' : new THREE.Color(m.roof.color).multiplyScalar(.62), transparent:true, opacity:hid ? .6 : .9}),
      grass: mk(real ? '#9fb07f' : '#dfe3d6', {roughness:1, hid:'#ffffff'}),
      earth: mk(real ? '#7b6a55' : '#c9c1b4', {roughness:1, hid:'#ffffff'}),
      pave: mk(real ? '#bdb8ae' : '#d2cfc8', {roughness:.95}),
      trunk: mk(real ? '#6a5240' : '#a9998a'),
      crown: mk(real ? '#6e8c52' : '#b9cba5', {flatShading:true}),
      floor: {}
    };
    const fin = {living:'#b98c5f', bed:'#c09a6e', study:'#b98c5f', hall:'#c8b79e', kitchen:'#d8d4cc', bath:'#cfd8da', storage:'#bdb9b0', garage:'#a9a7a2', balcony:'#8d7357'};
    Object.keys(m.colors).forEach(k => { R.floor[k] = mk(real ? (fin[k] || '#cccccc') : m.colors[k], {roughness:.7}); });
    return R;
  }

  /* ---------- geometry helpers ---------- */
  function edgeLines(geo, thr){ const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo, thr || 20), LM); return e; }
  function box(x0, x1, y0, y1, z0, z1, mat, o = {}){
    if(x1 - x0 < 1e-3 || y1 - y0 < 1e-3 || z1 - z0 < 1e-3) return null;
    const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m = new THREE.Mesh(g, mat);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    m.castShadow = o.cast !== false; m.receiveShadow = true; root.add(m);
    if(!o.noEdge){ const e = edgeLines(g); e.position.copy(m.position); root.add(e); }
    return m;
  }
  /* a box lying along a wall line: plan x/y map to three x/z, height to y */
  function wbox(ori, c, a, b, t, y0, y1, mat, o){
    return ori === 'h' ? box(a, b, y0, y1, c - t / 2, c + t / 2, mat, o) : box(c - t / 2, c + t / 2, y0, y1, a, b, mat, o);
  }
  function MB(){ const p = []; return {
    tri(a, b, c){ p.push(...a, ...b, ...c); },
    quad(a, b, c, d){ p.push(...a, ...b, ...c, ...a, ...c, ...d); },
    geo(){ const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.computeVertexNormals(); return g; }
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
          s = {a, b, type, op:type === 'rail' ? null : (L.ops.find(o => o.a - 1e-4 <= m && m <= o.b + 1e-4) || null)}; }
        const lr = runs[runs.length - 1];
        if(s && lr && lr.type === s.type && lr.op === s.op && near(lr.b, s.a)) lr.b = s.b;
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
        const o = r.op;
        if(!o){ wbox(L.ori, L.c, a, b, t, z0, z0 + H, mat); return; }
        const s = Math.min(o.s, H), hd = Math.min(o.h, H);
        if(s > 0) wbox(L.ori, L.c, a, b, t, z0, z0 + s, cutTop && s >= H ? mat : wm);
        if(hd < H) wbox(L.ori, L.c, a, b, t, z0 + hd, z0 + H, mat);
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
          const g = wbox(L.ori, L.c + (o.sw || 1) * -.05, a, b, .05, z0, z0 + hd, M.garage);
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
    const mb = MB();
    for(const d of [0, -th]){
      const A = P(u0, v0, ye + d), B = P(u1, v0, ye + d), C = P(u1, v1, ye + d), D = P(u0, v1, ye + d), R0 = P(ru0, vm, hr + d), R1 = P(ru1, vm, hr + d);
      mb.quad(A, B, R1, R0); mb.quad(C, D, R0, R1);
      if(hip){ mb.tri(D, A, R0); mb.tri(B, C, R1); }
    }
    /* perimeter faces for thickness */
    const per = hip ? [[u0, v0, ye, u1, v0, ye], [u1, v0, ye, u1, v1, ye], [u1, v1, ye, u0, v1, ye], [u0, v1, ye, u0, v0, ye]]
      : [[u0, v0, ye, u1, v0, ye], [u1, v0, ye, u1, vm, hr], [u1, vm, hr, u1, v1, ye], [u1, v1, ye, u0, v1, ye], [u0, v1, ye, u0, vm, hr], [u0, vm, hr, u0, v0, ye]];
    per.forEach(e => mb.quad(P(e[0], e[1], e[2]), P(e[3], e[4], e[5]), P(e[3], e[4], e[5] - th), P(e[0], e[1], e[2] - th)));
    const g = mb.geo(), mesh = new THREE.Mesh(g, M.roof); mesh.castShadow = true; mesh.receiveShadow = true; root.add(mesh); root.add(edgeLines(g, 15));
    /* standing seams */
    const pts = [], st = .45, lift = .012;
    for(let u = u0 + st / 2; u < u1; u += st){ const d = hip ? Math.min(half, u - u0, u1 - u) : half;
      pts.push(...P(u, v0, ye + lift), ...P(u, v0 + d, ye + d * T30 + lift), ...P(u, v1, ye + lift), ...P(u, v1 - d, ye + d * T30 + lift)); }
    if(hip) for(let v = v0 + st / 2; v < v1; v += st){ const d = Math.min(v - v0, v1 - v);
      pts.push(...P(u0, v, ye + lift), ...P(u0 + d, v, ye + d * T30 + lift), ...P(u1, v, ye + lift), ...P(u1 - d, v, ye + d * T30 + lift)); }
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); root.add(new THREE.LineSegments(lg, M.seam));
    /* gable end walls */
    if(!hip){ const gb = MB(), t = .25;
      for(const u of [bu0, bu1]) for(const s of [-t / 2, t / 2]) gb.tri(P(u + s, bv0, zt - .3), P(u + s, bv1, zt - .3), P(u + s, (bv0 + bv1) / 2, zt + (bv1 - bv0) / 2 * T30 - th - .02));
      for(const u of [bu0, bu1]){ const a = P(u - t / 2, bv0, zt - .3), c = P(u - t / 2, (bv0 + bv1) / 2, zt + (bv1 - bv0) / 2 * T30 - th - .02), d = P(u - t / 2, bv1, zt - .3);
        const a2 = P(u + t / 2, bv0, zt - .3), c2 = P(u + t / 2, (bv0 + bv1) / 2, zt + (bv1 - bv0) / 2 * T30 - th - .02), d2 = P(u + t / 2, bv1, zt - .3);
        gb.quad(a, c, c2, a2); gb.quad(c, d, d2, c2); }
      const gg = gb.geo(), gm = new THREE.Mesh(gg, M.wallExt.clone()); gm.material.side = THREE.DoubleSide; gm.castShadow = true; gm.receiveShadow = true; root.add(gm); root.add(edgeLines(gg, 30));
    }
  }

  /* ---------- whole model ---------- */
  function build(m){
    root.traverse(o => { if(o.geometry) o.geometry.dispose(); });
    scene.remove(root); root = new THREE.Group(); scene.add(root);
    if(M) Object.values(M).forEach(x => { if(x && x.dispose) x.dispose(); });
    M = mats(m.style, m);
    LM = new THREE.LineBasicMaterial({color:'#1b1d21', transparent:true, opacity:m.style === 'realistic' ? .3 : m.style === 'shaded' ? .8 : 1});
    const real = m.style === 'realistic';
    renderer.toneMapping = real ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping; renderer.toneMappingExposure = 1.05;
    hemi.intensity = real ? 1.15 : m.style === 'shaded' ? .55 : 0; amb.intensity = m.style === 'shaded' ? .55 : 0;
    sun.intensity = real ? 2.3 : m.style === 'shaded' ? 1.4 : 0; sun.castShadow = m.shadows && m.style !== 'hidden';

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
    const site = box(b[0] - pad, b[2] + pad, -PL - .6, -PL, b[1] - pad, b[3] + pad, [M.earth, M.earth, M.grass, M.earth, M.earth, M.earth], {cast:false});
    if(site) site.receiveShadow = true;
    [[b[0] - 4, b[1] - 3, 1.3], [b[2] + 4.2, b[1] - 1.5, 1.6], [b[2] + 3.4, b[3] + 4.6, 1.2], [b[0] - 3.6, b[3] + 3.2, 1.45]].forEach(([x, z, s]) => {
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(.1 * s, .14 * s, 1.7 * s, 8), M.trunk); tr.position.set(x, -PL + .85 * s, z); tr.castShadow = true; root.add(tr);
      const cg = new THREE.IcosahedronGeometry(1.25 * s, 1), cr = new THREE.Mesh(cg, M.crown); cr.position.set(x, -PL + 2.3 * s, z); cr.castShadow = true; cr.receiveShadow = true; root.add(cr);
      if(m.style !== 'realistic'){ const e = edgeLines(cg, 8); e.position.copy(cr.position); root.add(e); }
    });
    if(m.floors[0]) m.floors[0].ops.forEach(o => {
      if(o.k !== 'garage' && !(o.k === 'door' && o.ext)) return;
      const out = -(o.sw || 1), wide = o.k === 'garage', ext = wide ? pad : 2.6, ex = wide ? .3 : .2;
      const c1 = o.c + out * ext, lo = Math.min(o.c, c1), hi = Math.max(o.c, c1);
      if(o.ori === 'h') box(o.a - ex, o.b + ex, -PL, -PL + .04, lo, hi, M.pave, {cast:false, noEdge:!wide});
      else box(lo, hi, -PL, -PL + .04, o.a - ex, o.b + ex, M.pave, {cast:false, noEdge:!wide});
    });

    m.floors.forEach((f, i) => {
      if(i > lastF) return;
      const z0 = i * FH, cutHere = m.cut && i === m.cur, H = cutHere ? 1.3 : (i === top && pitched ? FH - .3 : FH);
      f.rooms.forEach(r => {
        const solid = r.type !== 'balcony';
        if(i === 0) box(r.x, r.x + r.w, -PL, 0, r.y, r.y + r.h, M.plinth);
        else box(r.x, r.x + r.w, z0 - SL, z0, r.y, r.y + r.h, M.slab);
        box(r.x + .005, r.x + r.w - .005, z0, z0 + .03, r.y + .005, r.y + r.h - .005, M.floor[r.type] || M.slab, {noEdge:true, cast:false});
        if(solid && !cutHere && !(i === top && pitched) && !(m.roof.type === 'flat' && i === top))
          box(r.x, r.x + r.w, z0 + FH - SL, z0 + FH, r.y, r.y + r.h, M.slab);
      });
      walls(f, i, H, cutHere);
    });
    if(!m.cut && top >= 0) roof(m, top, top * FH + FH);

    /* camera and sun fit */
    const cx = (b[0] + b[2]) / 2, cz = (b[1] + b[3]) / 2, hgt = (top + 1) * FH + 2, diag = Math.hypot(b[2] - b[0] + 2 * pad, b[3] - b[1] + 2 * pad, hgt);
    sun.position.set(cx - 22, 34, cz + 26); sun.target.position.set(cx, 0, cz);
    const sc = sun.shadow.camera, ss = diag * .75; sc.left = -ss; sc.right = ss; sc.top = ss; sc.bottom = -ss; sc.near = 1; sc.far = 140; sc.updateProjectionMatrix();
    const key = [b.map(v => Math.round(v)).join(','), top].join('|');
    if(!fitted || key !== memo.key){ fbase = Math.max(11, Math.hypot(b[2] - b[0], b[3] - b[1], hgt) * 1.18); if(!fitted) home(false, cx, hgt * .3, cz); fitted = true; }
    memo.key = key; memo.center = [cx, hgt * .3, cz];
    size(); req();
  }

  /* ---------- camera ---------- */
  function setDir(dir, animate){
    const tgt = ctl.target.clone(), dist = 120, to = tgt.clone().add(dir.clone().normalize().multiplyScalar(dist));
    if(!animate){ cam.position.copy(to); cam.up.set(0, 1, 0); cam.lookAt(tgt); ctl.update(); req(); return; }
    const from = cam.position.clone().sub(tgt), f2 = to.clone().sub(tgt), t0 = performance.now();
    anim = () => { const k = Math.min(1, (performance.now() - t0) / 450), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const v = from.clone().normalize().lerp(f2.clone().normalize(), e).normalize().multiplyScalar(dist);
      cam.position.copy(tgt.clone().add(v)); cam.lookAt(tgt); if(k >= 1) anim = null; };
    req();
  }
  function home(animate, x, y, z){
    if(x !== undefined) ctl.target.set(x, y, z); else if(memo.center) ctl.target.set(...memo.center);
    cam.zoom = 1; cam.updateProjectionMatrix();
    setDir(new THREE.Vector3(Math.sin(.7), .62, Math.cos(.7)), animate);
  }
  function size(){
    const r = canvas.parentElement.getBoundingClientRect(), w = Math.max(10, r.width), h = Math.max(10, r.height), a = w / h;
    frustum = a < 1.1 ? fbase * 1.1 / a * .82 : fbase;
    renderer.setSize(w, h, false);
    cam.left = -frustum * a / 2; cam.right = frustum * a / 2; cam.top = frustum / 2; cam.bottom = -frustum / 2; cam.updateProjectionMatrix();
  }
  let pending = false;
  function req(){ if(!pending){ pending = true; requestAnimationFrame(frame); } }
  function frame(){
    pending = false; if(anim) anim();
    const moved = ctl.update(); renderer.render(scene, cam); cube();
    if(moved || anim) req();
  }
  ctl.addEventListener('change', req);
  function cube(){
    if(!ui || !ui.cube) return;
    const v = cam.position.clone().sub(ctl.target), az = Math.atan2(v.x, v.z), el = Math.atan2(v.y, Math.hypot(v.x, v.z));
    ui.cube.style.transform = 'rotateX(' + (-el) + 'rad) rotateY(' + (-az) + 'rad)';
  }
  const ro = new ResizeObserver(() => { size(); req(); }); ro.observe(canvas.parentElement);

  return {
    update(m){ build(m); },
    view(name){ const D = {top:[0, 1, .0001], front:[0, 0, 1], back:[0, 0, -1], right:[1, 0, 0], left:[-1, 0, 0]}; if(name === 'home') return home(true); setDir(new THREE.Vector3(...D[name]), true); },
    resize(){ size(); req(); },
    png(cb){
      renderer.render(scene, cam);
      const w = canvas.width, h = canvas.height, c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, '#9fb6cc'); gr.addColorStop(.6, '#e4eaee'); gr.addColorStop(1, '#d5d8cc');
      g.fillStyle = gr; g.fillRect(0, 0, w, h); g.drawImage(canvas, 0, 0);
      g.font = '600 ' + Math.round(h * .03) + 'px Onest, Arial, sans-serif'; g.fillStyle = 'rgba(30,32,36,.8)'; g.fillText('Prime Spatial Plan', h * .03, h * .96);
      c.toBlob(cb);
    }
  };
}
