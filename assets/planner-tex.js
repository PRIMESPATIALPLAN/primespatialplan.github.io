/* Prime Spatial Plan — procedural material textures for the 3D view (no image downloads).
   Each texture is drawn once on a canvas and tiles in world metres: tex.userData.size = [u, v] metres per tile. */
import * as THREE from './vendor/three.module.min.js';

const cache = {};
function rng(seed){ let s = seed >>> 0 || 1; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; }
function cv(w, h){ const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function tex(c, size, color = true){
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  if(color) t.colorSpace = THREE.SRGBColorSpace;
  t.repeat.set(1 / size[0], 1 / size[1]); t.userData.size = size; return t;
}
function speckle(g, w, h, r, n, a, lo = 0, hi = 255){
  for(let i = 0; i < n; i++){ const v = r() < .5 ? lo : hi, s = .6 + r() * 1.8; g.fillStyle = `rgba(${v},${v},${v},${a * r()})`; g.fillRect(r() * w, r() * h, s, s); }
}
function blotch(g, w, h, r, n, a){
  for(let i = 0; i < n; i++){ const x = r() * w, y = r() * h, rad = 20 + r() * 90, v = r() < .5 ? 0 : 255;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, `rgba(${v},${v},${v},${a})`); gr.addColorStop(1, `rgba(${v},${v},${v},0)`);
    g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
}
function shade(hex, k){ const c = new THREE.Color(hex); c.multiplyScalar(k); return '#' + c.getHexString(); }

const MAKERS = {
  /* render (stucco), warm white */
  plaster(){ const [c, g] = cv(512, 512), r = rng(11);
    g.fillStyle = '#ece5d8'; g.fillRect(0, 0, 512, 512); blotch(g, 512, 512, r, 40, .035); speckle(g, 512, 512, r, 9000, .22);
    return {map:tex(c, [2, 2]), bump:tex(c, [2, 2], false), bs:.6}; },
  /* stretcher-bond brick, 250 × 65 mm with 10 mm joints */
  brick(){ const [c, g] = cv(512, 512), [b, h] = cv(512, 512), r = rng(7), rows = 13, rh = 512 / rows, bw = 128;
    const pal = ['#8c4a32', '#9a5338', '#7f4029', '#a45d40', '#874631', '#93503a', '#7a3d2b'];
    g.fillStyle = '#b9b0a2'; g.fillRect(0, 0, 512, 512); h.fillStyle = '#3a3a3a'; h.fillRect(0, 0, 512, 512);
    for(let j = 0; j < rows; j++) for(let i = -1; i < 5; i++){
      const x = i * bw + (j % 2) * bw / 2 + 2, y = j * rh + 2, w = bw - 5, hh = rh - 5, col = pal[Math.floor(r() * pal.length)];
      g.fillStyle = col; g.fillRect(x, y, w, hh);
      const gr = g.createLinearGradient(0, y, 0, y + hh); gr.addColorStop(0, 'rgba(255,255,255,.10)'); gr.addColorStop(1, 'rgba(0,0,0,.12)'); g.fillStyle = gr; g.fillRect(x, y, w, hh);
      h.fillStyle = '#d0d0d0'; h.fillRect(x, y, w, hh); }
    speckle(g, 512, 512, r, 7000, .25); speckle(h, 512, 512, r, 4000, .3);
    return {map:tex(c, [1.04, .975]), bump:tex(b, [1.04, .975], false), bs:2.2}; },
  /* horizontal timber cladding, 150 mm boards */
  wood(){ const [c, g] = cv(512, 512), [b, h] = cv(512, 512), r = rng(5), n = 6, bh = 512 / n, pal = ['#8a5a36', '#94633d', '#7d5131', '#9b6a42'];
    h.fillStyle = '#cccccc'; h.fillRect(0, 0, 512, 512);
    for(let j = 0; j < n; j++){ const y = j * bh; g.fillStyle = pal[j % pal.length]; g.fillRect(0, y, 512, bh);
      for(let k = 0; k < 60; k++){ const yy = y + r() * bh, a = .05 + r() * .12; g.strokeStyle = r() < .5 ? `rgba(40,22,10,${a})` : `rgba(255,230,200,${a * .6})`; g.lineWidth = .6 + r() * 1.4;
        g.beginPath(); g.moveTo(0, yy); for(let x = 0; x <= 512; x += 32) g.lineTo(x, yy + Math.sin(x * .02 + k) * 1.6); g.stroke(); }
      g.fillStyle = 'rgba(20,10,5,.55)'; g.fillRect(0, y + bh - 5, 512, 5); g.fillStyle = 'rgba(255,240,220,.18)'; g.fillRect(0, y, 512, 2);
      h.fillStyle = '#444'; h.fillRect(0, y + bh - 5, 512, 5); }
    return {map:tex(c, [1.2, .9]), bump:tex(b, [1.2, .9], false), bs:2}; },
  /* random ashlar stone cladding */
  stone(){ const [c, g] = cv(512, 512), [b, h] = cv(512, 512), r = rng(3), pal = ['#a39c90', '#b3ab9d', '#8f897f', '#c2baa9', '#9a9488', '#ada594'];
    g.fillStyle = '#6f6a62'; g.fillRect(0, 0, 512, 512); h.fillStyle = '#333'; h.fillRect(0, 0, 512, 512);
    let y = 0; while(y < 512){ const rh = Math.min(512 - y, 56 + Math.floor(r() * 60)); let x = -Math.floor(r() * 80);
      while(x < 512){ const w = 70 + Math.floor(r() * 130); const col = pal[Math.floor(r() * pal.length)];
        g.fillStyle = col; g.fillRect(x + 3, y + 3, w - 6, rh - 6); blotchRect(g, x + 3, y + 3, w - 6, rh - 6, r);
        h.fillStyle = '#' + (180 + Math.floor(r() * 50)).toString(16).repeat(3); h.fillRect(x + 3, y + 3, w - 6, rh - 6); x += w; }
      y += rh; }
    speckle(g, 512, 512, r, 9000, .3);
    return {map:tex(c, [1.4, 1.4]), bump:tex(b, [1.4, 1.4], false), bs:2.5}; },
  /* lawn */
  grass(){ const [c, g] = cv(1024, 1024), r = rng(9);
    g.fillStyle = '#6e9140'; g.fillRect(0, 0, 1024, 1024); blotch(g, 1024, 1024, r, 160, .11);
    for(let i = 0; i < 60000; i++){ const x = r() * 1024, y = r() * 1024, l = 3 + r() * 7, an = -Math.PI / 2 + (r() - .5) * 1.2;
      g.strokeStyle = `hsl(${76 + r() * 24},${38 + r() * 22}%,${28 + r() * 26}%)`; g.lineWidth = .7 + r() * .8;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(an) * l, y + Math.sin(an) * l); g.stroke(); }
    return {map:tex(c, [2.5, 2.5])}; },
  /* concrete block pavers, 200 × 100 mm */
  pavers(){ const [c, g] = cv(512, 512), [b, h] = cv(512, 512), r = rng(4), rows = 10, rh = 51.2, bw = 102.4;
    g.fillStyle = '#7d786f'; g.fillRect(0, 0, 512, 512); h.fillStyle = '#333'; h.fillRect(0, 0, 512, 512);
    for(let j = 0; j < rows; j++) for(let i = -1; i < 6; i++){ const x = i * bw + (j % 2) * bw / 2 + 2, y = j * rh + 2, v = 170 + Math.floor(r() * 30);
      g.fillStyle = `rgb(${v},${v - 4},${v - 10})`; g.fillRect(x, y, bw - 4, rh - 4); h.fillStyle = '#ccc'; h.fillRect(x, y, bw - 4, rh - 4); }
    speckle(g, 512, 512, r, 9000, .22);
    return {map:tex(c, [1.024, 1.024]), bump:tex(b, [1.024, 1.024], false), bs:1.5}; },
  /* standing-seam metal sheet (tinted by roof colour) */
  seam(){ const [c, g] = cv(128, 256), [b, h] = cv(128, 256), r = rng(2);
    g.fillStyle = '#d8d8d8'; g.fillRect(0, 0, 128, 256); h.fillStyle = '#888'; h.fillRect(0, 0, 128, 256);
    const gr = g.createLinearGradient(0, 0, 128, 0); gr.addColorStop(0, 'rgba(0,0,0,.06)'); gr.addColorStop(.5, 'rgba(255,255,255,.05)'); gr.addColorStop(1, 'rgba(0,0,0,.06)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 256);
    g.fillStyle = '#f6f6f6'; g.fillRect(62, 0, 3, 256); g.fillStyle = '#7a7a7a'; g.fillRect(65, 0, 3, 256);
    h.fillStyle = '#fff'; h.fillRect(61, 0, 6, 256); speckle(g, 128, 256, r, 600, .08);
    return {map:tex(c, [.5, 1]), bump:tex(b, [.5, 1], false), bs:1.5}; },
  /* metal roof tile profile (tinted) */
  tile(){ const [c, g] = cv(512, 512), [b, h] = cv(512, 512), rows = 3, rh = 512 / rows, cols = 6, cw = 512 / cols;
    for(let j = 0; j < rows; j++) for(let i = 0; i < cols; i++){ const x = i * cw, y = j * rh;
      const gr = g.createLinearGradient(x, 0, x + cw, 0); gr.addColorStop(0, '#9a9a9a'); gr.addColorStop(.35, '#f2f2f2'); gr.addColorStop(.7, '#c8c8c8'); gr.addColorStop(1, '#8a8a8a');
      g.fillStyle = gr; g.fillRect(x, y, cw, rh);
      const hg = h.createLinearGradient(x, 0, x + cw, 0); hg.addColorStop(0, '#444'); hg.addColorStop(.45, '#eee'); hg.addColorStop(1, '#444'); h.fillStyle = hg; h.fillRect(x, y, cw, rh); }
    for(let j = 0; j < rows; j++){ const y = (j + 1) * rh; const sg = g.createLinearGradient(0, y - 14, 0, y); sg.addColorStop(0, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = sg; g.fillRect(0, y - 14, 512, 14);
      h.fillStyle = '#111'; h.fillRect(0, y - 4, 512, 4); }
    return {map:tex(c, [1.1, 1.05]), bump:tex(b, [1.1, 1.05], false), bs:3}; },
  /* asphalt shingles (tinted) */
  shingle(){ const [c, g] = cv(512, 512), [b, h] = cv(512, 512), r = rng(8), rows = 5, rh = 512 / rows, tw = 170;
    g.fillStyle = '#555'; g.fillRect(0, 0, 512, 512); h.fillStyle = '#333'; h.fillRect(0, 0, 512, 512);
    for(let j = 0; j < rows; j++) for(let i = -1; i < 4; i++){ const x = i * tw + (j % 2) * tw / 2 + 2, y = j * rh, v = 150 + Math.floor(r() * 70);
      g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, y, tw - 4, rh - 3);
      const sg = g.createLinearGradient(0, y + rh - 16, 0, y + rh); sg.addColorStop(0, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(0,0,0,.4)'); g.fillStyle = sg; g.fillRect(x, y + rh - 16, tw - 4, 16);
      h.fillStyle = '#bbb'; h.fillRect(x, y, tw - 4, rh - 3); }
    speckle(g, 512, 512, r, 16000, .35);
    return {map:tex(c, [1, .7]), bump:tex(b, [1, .7], false), bs:2}; },
  /* dark vertical timber boards, 120 mm, Scandinavian style */
  timber(){ const [c, g] = cv(512, 512), [b, h] = cv(512, 512), r = rng(21), n = 8, bw = 512 / n, pal = ['#2f2b27', '#35302b', '#2a2622', '#3a342e'];
    h.fillStyle = '#cccccc'; h.fillRect(0, 0, 512, 512);
    for(let i = 0; i < n; i++){ const x = i * bw; g.fillStyle = pal[Math.floor(r() * pal.length)]; g.fillRect(x, 0, bw, 512);
      for(let k = 0; k < 26; k++){ const xx = x + r() * bw, a = .04 + r() * .08; g.strokeStyle = r() < .5 ? `rgba(0,0,0,${a})` : `rgba(200,180,150,${a * .5})`; g.lineWidth = .6 + r();
        g.beginPath(); g.moveTo(xx, 0); for(let y = 0; y <= 512; y += 32) g.lineTo(xx + Math.sin(y * .02 + k) * 1.2, y); g.stroke(); }
      g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(x + bw - 4, 0, 4, 512); g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(x, 0, 2, 512); h.fillStyle = '#333'; h.fillRect(x + bw - 4, 0, 4, 512); }
    return {map:tex(c, [.96, 1.6]), bump:tex(b, [.96, 1.6], false), bs:2.5}; },
  /* pea gravel */
  gravel(){ const [c, g] = cv(512, 512), [b, h] = cv(512, 512), r = rng(14);
    g.fillStyle = '#8c8a85'; g.fillRect(0, 0, 512, 512); h.fillStyle = '#555'; h.fillRect(0, 0, 512, 512);
    for(let i = 0; i < 7000; i++){ const x = r() * 512, y = r() * 512, rx = 2 + r() * 4, ry = 1.5 + r() * 3, v = 120 + Math.floor(r() * 110);
      g.fillStyle = `rgb(${v},${v - 3},${v - 8})`; g.beginPath(); g.ellipse(x, y, rx, ry, r() * 3, 0, 7); g.fill();
      h.fillStyle = `rgb(${v + 40},${v + 40},${v + 40})`; h.beginPath(); h.ellipse(x, y, rx, ry, 0, 0, 7); h.fill(); }
    return {map:tex(c, [1.2, 1.2]), bump:tex(b, [1.2, 1.2], false), bs:2}; },
  /* decking boards */
  deck(){ const [c, g] = cv(512, 512), [b, h] = cv(512, 512), r = rng(15), n = 7, bh = 512 / n;
    h.fillStyle = '#ccc'; h.fillRect(0, 0, 512, 512);
    for(let j = 0; j < n; j++){ const y = j * bh; g.fillStyle = ['#b08a62', '#a98259', '#b8946a'][j % 3]; g.fillRect(0, y, 512, bh);
      for(let k = 0; k < 30; k++){ const yy = y + r() * bh; g.strokeStyle = `rgba(80,50,25,${.05 + r() * .1})`; g.lineWidth = .7; g.beginPath(); g.moveTo(0, yy); g.lineTo(512, yy + (r() - .5) * 3); g.stroke(); }
      g.fillStyle = 'rgba(40,25,10,.55)'; g.fillRect(0, y + bh - 4, 512, 4); h.fillStyle = '#333'; h.fillRect(0, y + bh - 4, 512, 4); }
    return {map:tex(c, [1, .98]), bump:tex(b, [1, .98], false), bs:1.5}; },
  /* sky with soft clouds (screen background) */
  sky(){ const [c, g] = cv(1024, 512), r = rng(31), gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, '#5f8fc0'); gr.addColorStop(.55, '#a9c6e0'); gr.addColorStop(1, '#e6eef3'); g.fillStyle = gr; g.fillRect(0, 0, 1024, 512);
    for(let i = 0; i < 26; i++){ const cx = r() * 1024, cy = 60 + r() * 260, w = 80 + r() * 200;
      for(let k = 0; k < 14; k++){ const x = cx + (r() - .5) * w, y = cy + (r() - .5) * w * .22, rad = 18 + r() * 46, a = .1 + r() * .16;
        const rg = g.createRadialGradient(x, y, 0, x, y, rad); rg.addColorStop(0, `rgba(255,255,255,${a})`); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); } }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return {map:t}; },
  /* warm cedar vertical boards */
  cedar(){ const [c, g] = cv(512, 512), [b, h] = cv(512, 512), r = rng(23), n = 8, bw = 512 / n, pal = ['#6b4a32', '#76533a', '#5f412c', '#7f5b40', '#6f4d35'];
    h.fillStyle = '#cccccc'; h.fillRect(0, 0, 512, 512);
    for(let i = 0; i < n; i++){ const x = i * bw; g.fillStyle = pal[Math.floor(r() * pal.length)]; g.fillRect(x, 0, bw, 512);
      for(let k = 0; k < 34; k++){ const xx = x + r() * bw, a = .05 + r() * .1; g.strokeStyle = r() < .55 ? `rgba(40,22,10,${a})` : `rgba(220,180,140,${a * .5})`; g.lineWidth = .6 + r() * 1.2;
        g.beginPath(); g.moveTo(xx, 0); for(let y = 0; y <= 512; y += 32) g.lineTo(xx + Math.sin(y * .02 + k) * 1.4, y); g.stroke(); }
      g.fillStyle = 'rgba(25,14,6,.65)'; g.fillRect(x + bw - 4, 0, 4, 512); g.fillStyle = 'rgba(255,230,200,.07)'; g.fillRect(x, 0, 2, 512); h.fillStyle = '#333'; h.fillRect(x + bw - 4, 0, 4, 512); }
    return {map:tex(c, [.96, 1.6]), bump:tex(b, [.96, 1.6], false), bs:2.5}; },
  /* poured concrete with saw-cut joints every 1.5 m */
  concrete(){ const [c, g] = cv(512, 512), [b, h] = cv(512, 512), r = rng(25);
    g.fillStyle = '#c9c6bf'; g.fillRect(0, 0, 512, 512); blotch(g, 512, 512, r, 50, .05); speckle(g, 512, 512, r, 12000, .18);
    h.fillStyle = '#bbb'; h.fillRect(0, 0, 512, 512); g.fillStyle = 'rgba(70,68,64,.55)'; h.fillStyle = '#222';
    [0, 511].forEach(v => { g.fillRect(v, 0, 2, 512); g.fillRect(0, v, 512, 2); h.fillRect(v, 0, 2, 512); h.fillRect(0, v, 512, 2); });
    return {map:tex(c, [1.5, 1.5]), bump:tex(b, [1.5, 1.5], false), bs:1}; },
  /* white sectional garage door with a row of windows (0..1 UVs across the door) */
  garageDoor(){ const [c, g] = cv(512, 512), rows = 4;
    g.fillStyle = '#f2f2f0'; g.fillRect(0, 0, 512, 512);
    for(let j = 0; j < rows; j++){ const y = j * 128; g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, y + 124, 512, 4); g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(0, y, 512, 2);
      for(let i = 0; i < 4; i++){ const x = 18 + i * 124; if(j === 0){ g.fillStyle = '#3d4a56'; g.fillRect(x + 6, y + 30, 100, 62); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x + 8, y + 32, 40, 20); }
        else { g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 3; g.strokeRect(x + 6, y + 22, 100, 80); } } }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return {map:t}; },
  /* painted conifer for cross-plane billboards (alpha) */
  pine(){ const [c, g] = cv(256, 512), r = rng(41);
    g.fillStyle = '#4a3626'; g.fillRect(124, 300, 8, 212);
    for(let i = 0; i < 3200; i++){ const t = Math.pow(r(), .85), y = 492 - t * 476, mw = 112 * Math.pow(1 - t, 1.05) + 5, side = r() < .5 ? -1 : 1, len = (.15 + r() * .85) * mw;
      const lit = side < 0 ? 9 : -4, L = 13 + r() * 15 + lit + (1 - t) * -3;
      g.strokeStyle = `hsl(${100 + r() * 35},${22 + r() * 22}%,${Math.max(6, L)}%)`; g.lineWidth = 1 + r() * 2.2;
      g.beginPath(); g.moveTo(128 + side * r() * 3, y); g.quadraticCurveTo(128 + side * len * .55, y - 3, 128 + side * len, y + len * .22 + r() * 5); g.stroke(); }
    for(let i = 0; i < 6000; i++){ const t = Math.pow(r(), .85), y = 492 - t * 476 + r() * 8, mw = 112 * Math.pow(1 - t, 1.05) + 4, x = 128 + (r() * 2 - 1) * mw * Math.sqrt(r());
      g.fillStyle = `hsl(${95 + r() * 40},${25 + r() * 25}%,${10 + r() * 22 + (x < 128 ? 6 : 0)}%)`; g.fillRect(x, y, 1.5 + r() * 2, 1.5 + r() * 2); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return {map:t}; },
  /* painted broadleaf tree */
  leafy(){ const [c, g] = cv(256, 512), r = rng(43);
    g.strokeStyle = '#4b3a2b'; g.lineCap = 'round';
    [[128, 512, 128, 250, 12], [128, 360, 70, 250, 6], [128, 330, 190, 230, 6], [128, 290, 110, 160, 5], [128, 300, 160, 170, 4]].forEach(b => { g.lineWidth = b[4]; g.beginPath(); g.moveTo(b[0], b[1]); g.lineTo(b[2], b[3]); g.stroke(); });
    for(let i = 0; i < 2600; i++){ const a = r() * Math.PI * 2, rr = Math.sqrt(r()), wob = 1 + .12 * Math.sin(a * 5 + 1) + .08 * Math.sin(a * 9);
      const x = 128 + Math.cos(a) * rr * 112 * wob, y = 200 + Math.sin(a) * rr * 150 * wob, lit = (128 - x) * .05 + (200 - y) * .04;
      g.fillStyle = `hsl(${85 + r() * 30},${30 + r() * 22}%,${Math.max(8, 20 + r() * 14 + lit)}%)`; g.beginPath(); g.arc(x, y, 2.5 + r() * 5, 0, 7); g.fill(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return {map:t}; },
  /* tuft of grass blades */
  tuft(){ const [c, g] = cv(128, 128), r = rng(47);
    for(let i = 0; i < 70; i++){ const x = 14 + r() * 100, h = 50 + r() * 74, lean = (r() - .5) * 40, w = 1.5 + r() * 2.5;
      g.fillStyle = `hsl(${78 + r() * 30},${35 + r() * 25}%,${22 + r() * 24}%)`; g.beginPath(); g.moveTo(x - w, 128); g.quadraticCurveTo(x + lean * .3, 128 - h * .6, x + lean, 128 - h); g.quadraticCurveTo(x + lean * .3 + w * .4, 128 - h * .6, x + w, 128); g.fill(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return {map:t}; },
  /* equirectangular skies used for the background and for reflections */
  skyDay(){ return eq(['#4f80b4', '#8fb3d6', '#dbe7ef'], ['#7f8b62', '#56603f'], 'rgba(255,255,255,', 51); },
  skyDusk(){ return eq(['#16233f', '#3e4f7a', '#e89c64'], ['#2c3024', '#1d2018'], 'rgba(255,190,150,', 53); },
  bark(){ const [c, g] = cv(128, 256), r = rng(6); g.fillStyle = '#5d4636'; g.fillRect(0, 0, 128, 256);
    for(let i = 0; i < 160; i++){ g.strokeStyle = r() < .5 ? 'rgba(25,15,8,.5)' : 'rgba(150,120,95,.35)'; g.lineWidth = 1 + r() * 2; const x = r() * 128;
      g.beginPath(); g.moveTo(x, r() * 256); g.lineTo(x + (r() - .5) * 6, r() * 256); g.stroke(); }
    const t = tex(c, [1, 1]); t.repeat.set(2, 1); return {map:t}; },
  doorWood(){ const [c, g] = cv(256, 512), r = rng(12); g.fillStyle = '#5e3a20'; g.fillRect(0, 0, 256, 512);
    for(let i = 0; i < 140; i++){ g.strokeStyle = r() < .5 ? 'rgba(25,12,4,.35)' : 'rgba(170,110,60,.25)'; g.lineWidth = .7 + r() * 1.3; const x = r() * 256;
      g.beginPath(); g.moveTo(x, 0); for(let y = 0; y <= 512; y += 32) g.lineTo(x + Math.sin(y * .02 + i) * 2, y); g.stroke(); }
    return {map:tex(c, [1, 2.1])}; }
};
function blotchRect(g, x, y, w, h, r){ const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, `rgba(255,255,255,${.08 * r()})`); gr.addColorStop(1, `rgba(0,0,0,${.12 * r()})`); g.fillStyle = gr; g.fillRect(x, y, w, h); }

function eq(sky, gr, cl, seed){ const [c, g] = cv(1024, 512), r = rng(seed);
  let G = g.createLinearGradient(0, 0, 0, 256); G.addColorStop(0, sky[0]); G.addColorStop(.6, sky[1]); G.addColorStop(1, sky[2]); g.fillStyle = G; g.fillRect(0, 0, 1024, 256);
  for(let i = 0; i < 40; i++){ const cx = r() * 1024, cy = 110 + r() * 120, w = 60 + r() * 160;
    for(let k = 0; k < 12; k++){ const x = cx + (r() - .5) * w, y = cy + (r() - .5) * w * .15, rad = 10 + r() * 34, a = .08 + r() * .14;
      const rg = g.createRadialGradient(x, y, 0, x, y, rad); rg.addColorStop(0, cl + a + ')'); rg.addColorStop(1, cl + '0)'); g.fillStyle = rg; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); } }
  G = g.createLinearGradient(0, 256, 0, 512); G.addColorStop(0, gr[0]); G.addColorStop(1, gr[1]); g.fillStyle = G; g.fillRect(0, 256, 1024, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.mapping = THREE.EquirectangularReflectionMapping; return {map:t}; }
export function T(name){ if(!cache[name]) cache[name] = MAKERS[name](); return cache[name]; }
export const FACADE_FLAT = {plaster:'#efe9df', brick:'#a8634a', wood:'#9b6c45', stone:'#aaa396', timber:'#3a3530', cedar:'#7a5a40'};
export {shade};
