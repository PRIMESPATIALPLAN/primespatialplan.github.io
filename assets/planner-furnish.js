/* Prime Spatial Plan — automatic furniture for the interior 3D view.
   Each room gets furniture that suits its type, placed against walls and kept clear of
   door swings and windows (tall pieces avoid windows). Purely illustrative. */

const IN = .14, CELL = .1;

/* api: {box(x0,x1,y0,y1,z0,z1,mat,o), cyl(x,y,z,r,h,mat,seg), sph(x,y,z,r,mat), F:materials} — world x = plan x, world z = plan y */
export function furnish(api, rooms, ops, y0, seed){
  let rs = (seed >>> 0) || 7; const rnd = () => (rs = (Math.imul(rs, 1664525) + 1013904223) >>> 0) / 4294967296;
  const near = (a, b) => Math.abs(a - b) < 1e-3;
  rooms.forEach((r, idx) => {
    const R = room(r, ops, near), F = api.F, y = y0 + .03;
    if(R.nx < 4 || R.ny < 4) return;
    /* local builder on a wall: u along the wall, v away from it into the room */
    const B = (w, u0, u1, v0, v1, h0, h1, mat) => { const a = R.toPlan(w, u0, v0), b = R.toPlan(w, u1, v1);
      api.box(Math.min(a[0], b[0]), Math.max(a[0], b[0]), y + h0, y + h1, Math.min(a[1], b[1]), Math.max(a[1], b[1]), mat, {noEdge:true}); };
    const C = (w, u, v, rad, h0, h1, mat, seg) => { const p = R.toPlan(w, u, v); api.cyl(p[0], y + h0, p[1], rad, h1 - h0, mat, seg); };
    const S = (w, u, v, rad, h, mat) => { const p = R.toPlan(w, u, v); api.sph(p[0], y + h, p[1], rad, mat); };
    const accent = F.accent[idx % F.accent.length];
    const plant = (w, u, v, s) => { C(w, u, v, .17 * s, 0, .32 * s, F.pot, 12); S(w, u, v, .3 * s, .62 * s, F.plant); S(w, u + .12 * s, v - .05, .2 * s, .85 * s, F.plant); };
    const lamp = (w, u, v, h) => { C(w, u, v, .015, h - .32, h - .05, F.metal, 6); C(w, u, v, .1, h - .1, h + .12, F.shade, 14); };
    const sofa = (w, u0, len, dep, col) => { B(w, u0, u0 + len, 0, dep, .08, .42, col); B(w, u0, u0 + len, 0, .2, .42, .82, col);
      B(w, u0, u0 + .18, .2, dep, .42, .62, col); B(w, u0 + len - .18, u0 + len, .2, dep, .42, .62, col);
      for(let k = 0; k < 3; k++) B(w, u0 + .2 + k * (len - .4) / 3 + .02, u0 + .2 + (k + 1) * (len - .4) / 3 - .02, .22, dep - .05, .42, .52, F.cushion);
      B(w, u0 + .05, u0 + .1, .1, dep - .1, 0, .08, F.black); B(w, u0 + len - .1, u0 + len - .05, .1, dep - .1, 0, .08, F.black); };
    const table = (w, u0, u1, v0, v1, h, top, leg) => { B(w, u0, u1, v0, v1, h - .04, h, top);
      [[u0 + .05, v0 + .05], [u1 - .09, v0 + .05], [u0 + .05, v1 - .09], [u1 - .09, v1 - .09]].forEach(q => B(w, q[0], q[0] + .04, q[1], q[1] + .04, 0, h - .04, leg)); };
    const seat = (w, uc, vc, back) => { B(w, uc - .22, uc + .22, vc - .22, vc + .22, .42, .47, F.wood);
      [[-.2, -.2], [.16, -.2], [-.2, .16], [.16, .16]].forEach(q => B(w, uc + q[0], uc + q[0] + .04, vc + q[1], vc + q[1] + .04, 0, .42, F.woodDark));
      const bv = back > 0 ? vc + .18 : vc - .22; B(w, uc - .22, uc + .22, bv, bv + .04, .47, .9, F.wood); };

    if(r.type === 'bed'){
      const dbl = Math.min(r.w, r.h) >= 3.1, bw = dbl ? 1.6 : .95, bl = 2.05;
      const p = R.place(bw + (dbl ? 1.0 : .5), bl, {pref:'quiet', clr:.6, foot:true, soft:true});
      if(p){ const u0 = p.u0 + (dbl ? .5 : 0), w = p.w;
        B(w, u0, u0 + bw, 0, .07, 0, 1.05, F.headboard); B(w, u0, u0 + bw, .07, bl, .1, .32, F.woodDark);
        B(w, u0 + .03, u0 + bw - .03, .09, bl - .03, .32, .52, F.linen);
        B(w, u0 + .01, u0 + bw - .01, .75, bl - .01, .5, .56, accent); B(w, u0 + .01, u0 + bw - .01, .75, .95, .56, .6, F.linen);
        const pw = dbl ? bw / 2 - .1 : bw - .2; for(let k = 0; k < (dbl ? 2 : 1); k++) B(w, u0 + .07 + k * (pw + .06), u0 + .07 + k * (pw + .06) + pw, .12, .5, .52, .66, F.white);
        [u0 - .5, u0 + bw + .05].forEach((nu, k) => { if(!dbl && k === 0) return; B(w, nu, nu + .45, .02, .42, 0, .5, F.wood); lamp(w, nu + .22, .22, .82); });
      }
      if(r.w * r.h > 9){ const q = R.place(Math.min(2.0, Math.max(1.2, Math.min(r.w, r.h) * .5)), .6, {tall:true, clr:.7});
        if(q){ B(q.w, q.u0, q.u0 + q.len, 0, .6, 0, 2.2, F.white); for(let k = 1; k < 3; k++) B(q.w, q.u0 + k * q.len / 3 - .005, q.u0 + k * q.len / 3 + .005, .6, .61, .05, 2.15, F.woodDark); } }
      if(r.w * r.h > 12){ const q = R.place(1.2, .6, {pref:'window', clr:.7}); if(q){ table(q.w, q.u0, q.u0 + 1.2, 0, .6, .75, F.wood, F.woodDark); seat(q.w, q.u0 + .6, .85, 1); } }
      const pc = R.place(.45, .45, {corner:true}); if(pc) plant(pc.w, pc.u0 + .22, .25, 1);
    }
    else if(r.type === 'living'){
      const L = Math.min(2.6, Math.max(1.8, Math.max(r.w, r.h) * .45));
      const p = R.place(L, .95, {pref:'quiet', clr:1.6});
      if(p){ const w = p.w, u0 = p.u0, D = R.depth(w);
        B(w, Math.max(0, u0 - .3), Math.min(R.len(w), u0 + L + .3), Math.min(D - .3, 1.05), Math.min(D - .1, 3.0), 0, .012, F.rug);
        sofa(w, u0, L, .95, F.sofa);
        if(D > 2.3){ table(w, u0 + L / 2 - .55, u0 + L / 2 + .55, 1.45, 2.05, .42, F.woodDark, F.woodDark); S(w, u0 + L / 2 - .2, 1.75, .07, .48, F.ceramic); }
        const t = R.opposite(w, u0 + L / 2, 2.4); if(t){ B(t.w, t.u - .9, t.u + .9, 0, .42, 0, .5, F.woodDark); B(t.w, t.u - .65, t.u + .65, .1, .14, .62, 1.38, F.screen); B(t.w, t.u - .1, t.u + .1, .1, .2, .5, .62, F.black); }
        lamp(w, u0 - .25, .3, 1.55); C(w, u0 - .25, .3, .14, 0, .03, F.black, 14);
      }
      const ac = R.place(.85, .85, {clr:.5}); if(ac){ sofa(ac.w, ac.u0, .85, .85, F.sofaB); }
      const pc = R.place(.5, .5, {corner:true}); if(pc) plant(pc.w, pc.u0 + .25, .25, 1.3);
    }
    else if(r.type === 'kitchen'){
      const p = R.place(Math.min(4.2, Math.max(r.w, r.h) - .4), .62, {pref:'long', clr:1, stretch:true});
      if(p){ const w = p.w, u0 = p.u0, len = p.len;
        B(w, u0, u0 + len, 0, .6, .1, .86, F.white); B(w, u0, u0 + len, 0, .6, 0, .1, F.black); B(w, u0, u0 + len, 0, .62, .86, .9, F.worktop);
        B(w, u0 + len * .3, u0 + len * .3 + .55, .1, .48, .88, .905, F.metal);
        B(w, u0 + len * .65, u0 + len * .65 + .6, .05, .55, .9, .91, F.black);
        for(let k = 1; k < Math.floor(len / .6); k++) B(w, u0 + k * .6 - .004, u0 + k * .6 + .004, .6, .605, .14, .84, F.woodDark);
        R.upper(w, u0, u0 + len).forEach(s => { B(w, s[0], s[1], 0, .35, 1.45, 2.15, F.white); B(w, s[0], s[1], 0, .02, .9, 1.45, F.tile); });
        if(len > 2.2){ const f = R.place(.7, .7, {tall:true, only:w, near:u0 + len + .02}); if(f) B(f.w, f.u0, f.u0 + .7, 0, .68, 0, 1.95, F.steel); }
      }
      if(r.w * r.h >= 11){ const q = R.center(1.6, .9, .75); if(q){ table(q.w, q.u0, q.u0 + 1.6, q.v0, q.v0 + .9, .76, F.wood, F.woodDark);
          [q.u0 + .4, q.u0 + 1.2].forEach(uc => { seat(q.w, uc, q.v0 - .32, -1); seat(q.w, uc, q.v0 + .9 + .32, 1); }); } }
    }
    else if(r.type === 'bath'){
      const long = Math.max(r.w, r.h) >= 2.2;
      const t = long ? R.place(1.65, .75, {pref:'long', clr:.5}) : R.place(.9, .9, {corner:true, clr:.4});
      if(t){ if(long){ B(t.w, t.u0, t.u0 + 1.65, 0, .75, 0, .56, F.ceramic); B(t.w, t.u0 + .08, t.u0 + 1.57, .08, .67, .5, .565, F.water); }
        else { B(t.w, t.u0, t.u0 + .9, 0, .9, 0, .08, F.ceramic); B(t.w, t.u0 + .88, t.u0 + .9, 0, .9, .08, 2.0, F.glassP); } }
      const v = R.place(.8, .5, {clr:.55}); if(v){ B(v.w, v.u0, v.u0 + .8, 0, .48, .2, .82, F.wood); B(v.w, v.u0 + .15, v.u0 + .65, .08, .42, .82, .9, F.ceramic); B(v.w, v.u0 + .1, v.u0 + .7, 0, .02, 1.05, 1.75, F.mirror); }
      const w2 = R.place(.42, .7, {clr:.5}); if(w2){ B(w2.w, w2.u0, w2.u0 + .42, 0, .18, 0, .78, F.ceramic); B(w2.w, w2.u0 + .03, w2.u0 + .39, .18, .66, 0, .42, F.ceramic); B(w2.w, w2.u0 + .03, w2.u0 + .39, .2, .64, .42, .45, F.white); }
    }
    else if(r.type === 'study'){
      const q = R.place(1.4, .7, {pref:'window', clr:.8}); if(q){ table(q.w, q.u0, q.u0 + 1.4, 0, .7, .75, F.wood, F.black); seat(q.w, q.u0 + .7, .95, 1); B(q.w, q.u0 + .5, q.u0 + .9, .15, .18, .78, 1.08, F.screen); }
      const s = R.place(1.0, .35, {tall:true, clr:.6}); if(s){ B(s.w, s.u0, s.u0 + 1, 0, .35, 0, 2.0, F.woodDark); for(let k = 1; k < 5; k++){ B(s.w, s.u0 + .04, s.u0 + .96, .02, .33, k * .4, k * .4 + .025, F.wood);
          for(let j = 0; j < 6; j++) B(s.w, s.u0 + .08 + j * .14, s.u0 + .08 + j * .14 + .08 + rnd() * .03, .05, .28, k * .4 + .025, k * .4 + .25 + rnd() * .08, F.accent[(j + k) % F.accent.length]); } }
      const pc = R.place(.45, .45, {corner:true}); if(pc) plant(pc.w, pc.u0 + .22, .25, 1);
    }
    else if(r.type === 'hall'){
      const q = R.place(1.0, .35, {clr:.8}); if(q){ B(q.w, q.u0, q.u0 + 1, 0, .35, .1, .85, F.wood); B(q.w, q.u0 + .2, q.u0 + .8, 0, .02, 1.1, 1.7, F.mirror); }
      if(Math.max(r.w, r.h) > 3){ const rg = R.center(Math.max(r.w, r.h) * .6, Math.min(r.w, r.h) * .45, 0, true); if(rg) B(rg.w, rg.u0, rg.u0 + rg.len, rg.v0, rg.v0 + rg.dep, 0, .012, F.rug2); }
    }
    else if(r.type === 'storage'){
      for(let k = 0; k < 2; k++){ const q = R.place(Math.min(1.8, Math.max(r.w, r.h) - .4), .45, {tall:true, clr:.5, stretch:true}); if(!q) break;
        for(let j = 0; j < 5; j++) B(q.w, q.u0, q.u0 + q.len, 0, .45, j * .45, j * .45 + .03, F.metal);
        B(q.w, q.u0, q.u0 + .04, 0, .45, 0, 1.85, F.metal); B(q.w, q.u0 + q.len - .04, q.u0 + q.len, 0, .45, 0, 1.85, F.metal);
        for(let j = 0; j < 4; j++) B(q.w, q.u0 + .1 + rnd() * (q.len - .6), q.u0 + .5 + rnd() * .2, .05, .4, j * .45 + .03, j * .45 + .3, F.box); }
    }
    else if(r.type === 'garage'){
      /* a car facing the garage door */
      const gd = R.garageWall(); const w = gd || R.walls[0], len = R.len(w), dep = R.depth(w), cars = len >= 5.4 ? 2 : 1;
      for(let k = 0; k < cars; k++){ const uc = len * (k + .5) / cars, vf = Math.min(.9, dep - 4.6), v0 = Math.max(.4, vf);
        const col = F.car[(idx + k) % F.car.length];
        B(w, uc - .9, uc + .9, v0, v0 + 4.4, .3, .85, col); B(w, uc - .8, uc + .8, v0 + 1.1, v0 + 3.4, .85, 1.38, F.carGlass);
        B(w, uc - .78, uc + .78, v0 + 1.25, v0 + 3.25, 1.38, 1.42, col);
        [[uc - .82, v0 + .85], [uc + .82, v0 + .85], [uc - .82, v0 + 3.55], [uc + .82, v0 + 3.55]].forEach(q => C(w, q[0], q[1], .33, 0, .66, F.black, 14));
        B(w, uc - .7, uc - .45, v0 - .01, v0 + .02, .6, .72, F.lightW); B(w, uc + .45, uc + .7, v0 - .01, v0 + .02, .6, .72, F.lightW); }
    }
    else if(r.type === 'balcony'){
      const q = R.center(.6, .6, 0); if(q){ C(q.w, q.u0 + .3, q.v0 + .3, .3, .7, .74, F.wood, 16); C(q.w, q.u0 + .3, q.v0 + .3, .03, 0, .7, F.black, 6);
        seat(q.w, q.u0 - .25, q.v0 + .3, -1); seat(q.w, q.u0 + .85, q.v0 + .3, 1); }
      const pc = R.place(.45, .45, {corner:true}); if(pc) plant(pc.w, pc.u0 + .22, .25, .9);
    }
  });
}

/* room geometry, wall frames and a coarse occupancy grid */
function room(r, ops, near){
  const X0 = r.x + IN, X1 = r.x + r.w - IN, Y0 = r.y + IN, Y1 = r.y + r.h - IN, nx = Math.floor((X1 - X0) / CELL), ny = Math.floor((Y1 - Y0) / CELL);
  const solid = new Uint8Array(nx * ny), clear = new Uint8Array(nx * ny);
  const W = [
    {id:'N', ori:'h', c:r.y, o:[X0, Y0], u:[1, 0], v:[0, 1], L:X1 - X0, D:Y1 - Y0, a0:X0, dir:1},
    {id:'S', ori:'h', c:r.y + r.h, o:[X1, Y1], u:[-1, 0], v:[0, -1], L:X1 - X0, D:Y1 - Y0, a0:X1, dir:-1},
    {id:'W', ori:'v', c:r.x, o:[X0, Y1], u:[0, -1], v:[1, 0], L:Y1 - Y0, D:X1 - X0, a0:Y1, dir:-1},
    {id:'E', ori:'v', c:r.x + r.w, o:[X1, Y0], u:[0, 1], v:[-1, 0], L:Y1 - Y0, D:X1 - X0, a0:Y0, dir:1}];
  const toPlan = (w, u, v) => [w.o[0] + w.u[0] * u + w.v[0] * v, w.o[1] + w.u[1] * u + w.v[1] * v];
  /* wall coordinate (along the line) -> u, and back */
  const lineToU = (w, s) => (s - w.a0) * w.dir;
  W.forEach(w => { w.ops = ops.filter(o => o.ori === w.ori && near(o.c, w.c) && o.b > (w.ori === 'h' ? r.x : r.y) && o.a < (w.ori === 'h' ? r.x + r.w : r.y + r.h)).map(o => {
      const u0 = lineToU(w, o.a), u1 = lineToU(w, o.b); return {k:o.k, u0:Math.min(u0, u1), u1:Math.max(u0, u1), into:(o.sw || 0) === (w.id === 'N' || w.id === 'W' ? 1 : -1), w:o.b - o.a}; }); });
  const cellRect = (pa, pb) => [Math.max(0, Math.floor((Math.min(pa[0], pb[0]) - X0) / CELL + 1e-6)), Math.max(0, Math.floor((Math.min(pa[1], pb[1]) - Y0) / CELL + 1e-6)),
    Math.min(nx, Math.ceil((Math.max(pa[0], pb[0]) - X0) / CELL - 1e-6)), Math.min(ny, Math.ceil((Math.max(pa[1], pb[1]) - Y0) / CELL - 1e-6))];
  const mark = (arr, w, u0, u1, v0, v1) => { const c = cellRect(toPlan(w, u0, v0), toPlan(w, u1, v1)); for(let j = c[1]; j < c[3]; j++) for(let i = c[0]; i < c[2]; i++) arr[j * nx + i] = 1; };
  const test = (w, u0, u1, v0, v1, soft) => { if(u0 < -1e-6 || u1 > w.L + 1e-6 || v0 < -1e-6 || v1 > w.D + 1e-6) return false;
    const c = cellRect(toPlan(w, u0, v0), toPlan(w, u1, v1)); for(let j = c[1]; j < c[3]; j++) for(let i = c[0]; i < c[2]; i++){ const k = j * nx + i; if(solid[k] || (!soft && clear[k])) return false; } return true; };
  /* door leaves sweep into the room; keep a walking zone in front of every door */
  W.forEach(w => w.ops.forEach(o => { if(o.k === 'win') return; const d = o.k === 'garage' ? 1.2 : o.into ? o.w + .05 : .7; mark(clear, w, o.u0 - .1, o.u1 + .1, 0, Math.min(w.D, d)); }));
  const winOn = (w, u0, u1) => w.ops.some(o => o.k === 'win' && o.u0 < u1 && o.u1 > u0);
  const doorOn = w => w.ops.filter(o => o.k !== 'win').length;
  const score = (w, pref) => { const free = w.L - w.ops.filter(o => o.k !== 'win').reduce((s, o) => s + o.w + .4, 0);
    if(pref === 'quiet') return -doorOn(w) * 10 + free - (w.ops.some(o => o.k === 'win') ? 1.5 : 0);
    if(pref === 'window') return (w.ops.some(o => o.k === 'win') ? 10 : 0) + free * .1 - doorOn(w);
    if(pref === 'long') return free - doorOn(w) * 2;
    return free; };
  const API = {
    nx, ny, walls:W, toPlan, len:w => w.L, depth:w => w.D,
    place(len, dep, o = {}){
      const order = (o.only ? [o.only] : W.slice()).sort((a, b) => score(b, o.pref) - score(a, o.pref));
      for(const w of order){
        let L = len; if(o.stretch){ L = Math.min(len, w.L); if(L < len * .6) continue; }
        if(L > w.L || dep > w.D) continue;
        const cands = []; if(o.corner){ cands.push(0, w.L - L); }
        else if(o.near !== undefined){ cands.push(Math.min(w.L - L, Math.max(0, o.near))); }
        else { const mid = (w.L - L) / 2; for(let s = 0; s <= w.L; s += CELL){ cands.push(mid - s); if(s) cands.push(mid + s); } }
        for(const u0 of cands){ if(u0 < -1e-6 || u0 + L > w.L + 1e-6) continue;
          if(!test(w, u0, u0 + L, 0, dep, o.soft && false)) continue;
          if(o.tall && winOn(w, u0, u0 + L)) continue;
          if(o.clr && !test(w, u0, u0 + L, dep, Math.min(w.D, dep + o.clr), true)) continue;
          mark(solid, w, u0, u0 + L, 0, dep); if(o.clr) mark(clear, w, u0, u0 + L, dep, Math.min(w.D, dep + o.clr));
          return {w, u0, len:L}; } }
      return null; },
    /* a spot on the opposite wall facing a piece (for a TV) */
    opposite(w, u, len){ const op = W.find(x => x.ori === w.ori && x !== w); if(!op) return null; const p = toPlan(w, u, 0), uo = op.ori === 'h' ? lineToU(op, p[0]) : lineToU(op, p[1]);
      const u0 = Math.max(0, Math.min(op.L - len, uo - len / 2)); if(!test(op, u0, u0 + len, 0, .45) || winOn(op, u0 + .4, u0 + len - .4)) return null; mark(solid, op, u0, u0 + len, 0, .45); return {w:op, u:u0 + len / 2}; },
    center(len, dep, clr, soft){ const w = W[0].L >= W[2].L ? W[0] : W[2]; const L = Math.min(len, w.L - .4), D = Math.min(dep, w.D - .4);
      for(let s = 0; s < w.D; s += CELL) for(const sg of [1, -1]){ const v0 = (w.D - D) / 2 + sg * s, u0 = (w.L - L) / 2;
        if(v0 - (clr || 0) < 0 || v0 + D + (clr || 0) > w.D) continue;
        if(test(w, u0 - (clr ? .1 : 0), u0 + L + (clr ? .1 : 0), v0 - (clr || 0), v0 + D + (clr || 0), soft)){ if(!soft) mark(solid, w, u0, u0 + L, v0 - (clr || 0), v0 + D + (clr || 0)); return {w, u0, v0, len:L, dep:D}; } }
      return null; },
    upper(w, u0, u1){ const out = []; let s = u0; const wins = w.ops.filter(o => o.k === 'win' && o.u1 > u0 && o.u0 < u1).sort((a, b) => a.u0 - b.u0);
      wins.forEach(o => { if(o.u0 - .05 > s + .3) out.push([s, o.u0 - .05]); s = Math.max(s, o.u1 + .05); }); if(u1 > s + .3) out.push([s, u1]); return out; },
    garageWall(){ return W.find(w => w.ops.some(o => o.k === 'garage')) || null; }
  };
  return API;
}
