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
  grass(){ const [c, g] = cv(512, 512), r = rng(9);
    g.fillStyle = '#7d9853'; g.fillRect(0, 0, 512, 512); blotch(g, 512, 512, r, 60, .06);
    for(let i = 0; i < 14000; i++){ const x = r() * 512, y = r() * 512, l = 3 + r() * 6, an = -Math.PI / 2 + (r() - .5) * 1.1;
      g.strokeStyle = `hsl(${78 + r() * 26},${32 + r() * 22}%,${26 + r() * 26}%)`; g.lineWidth = .8 + r() * .8;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(an) * l, y + Math.sin(an) * l); g.stroke(); }
    return {map:tex(c, [3, 3])}; },
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

export function T(name){ if(!cache[name]) cache[name] = MAKERS[name](); return cache[name]; }
export const FACADE_FLAT = {plaster:'#efe9df', brick:'#a8634a', wood:'#9b6c45', stone:'#aaa396'};
export {shade};
