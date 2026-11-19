/* Prime Spatial Plan — ready-made plans: catalog (plans.html) and plan page (plan.html).
   Specs are computed from each plan's room geometry so they always match the drawings. */
(function(){
  var P = window.PSP, PLANS = window.PSP_PLANS, OPT = window.PSP_PLAN_OPTIONS;
  var RT = {living:{mn:'Зочны өрөө', en:'Living room'}, bed:{mn:'Унтлагын өрөө', en:'Bedroom'}, kitchen:{mn:'Гал тогоо', en:'Kitchen'}, bath:{mn:'АЦӨ', en:'Bathroom'},
    hall:{mn:'Коридор', en:'Hall'}, study:{mn:'Ажлын өрөө', en:'Study'}, storage:{mn:'Агуулах', en:'Storage'}, garage:{mn:'Гарааш', en:'Garage'}, balcony:{mn:'Тагт', en:'Balcony'}};
  var TAG = {modern:{mn:'Орчин үеийн', en:'Modern'}, minimal:{mn:'Минимал', en:'Minimal'}, highCeiling:{mn:'Өндөр тааз', en:'High ceilings'}, family:{mn:'Гэр бүлд', en:'Family'}, bigGlass:{mn:'Том цонх', en:'Large glazing'}, wood:{mn:'Модон элемент', en:'Timber details'}, nature:{mn:'Байгальд ойр', en:'Close to nature'}, villa:{mn:'Тансаг', en:'Premium'}, terrace:{mn:'Террас', en:'Terrace'},oneStorey:{mn:'Нэг давхар', en:'Single storey'}, twoStorey:{mn:'Хоёр давхар', en:'Two storeys'}, compact:{mn:'Авсаархан', en:'Compact'},
    storage:{mn:'Агуулахтай', en:'Storage room'}, garage:{mn:'Гараж', en:'Garage'}, mudroom:{mn:'Үүдний өрөө', en:'Mud room'}, twoBaths:{mn:'2 АЦӨ', en:'2 bathrooms'},
    balcony:{mn:'Тагт', en:'Balcony'}, study:{mn:'Ажлын өрөө', en:'Home office'}};
  var RMAT = {seam:{mn:'төмөр хавтан', en:'standing seam metal'}, tile:{mn:'металл ваар', en:'metal tile'}, shingle:{mn:'битум ширгэл', en:'asphalt shingles'}};
  var FAC = {auto:{mn:'Тоосго + шавардлага', en:'Brick + render'}, plaster:{mn:'Шавардлага', en:'Render'}, brick:{mn:'Тоосго', en:'Brick'}, wood:{mn:'Модон өнгөлгөө', en:'Timber cladding'}, timber:{mn:'Хар мод, чулуун булан', en:'Dark timber, stone corners'}, cedar:{mn:'Хүрэн мод, чулуун булан', en:'Cedar, stone corners'}, metal:{mn:'Металл фасад', en:'Metal cladding'}, metalLight:{mn:'Металл фасад', en:'Metal cladding'}, stone:{mn:'Чулуун өнгөлгөө', en:'Stone cladding'}};
  var ROOF = {shed:{mn:'Нэг налуу', en:'Mono-pitch'}, gable:{mn:'Хоёр налуу', en:'Gable'}, hip:{mn:'Дөрвөн налуу', en:'Hip'}, flat:{mn:'Хавтгай', en:'Flat'}};
  var S = {
    mn:{m2:'м²', beds:'Унтлагын өрөө', baths:'АЦӨ', floors:'Давхар', garage:'Гараж', yes:'Байгаа', no:'Байхгүй', sample:'Жишээ', onReq:'Үнийн санал авах', from:'-с эхэлнэ',
        all:'Бүгд', f1:'1 давхар', f2:'2 давхар', b2:'2 өрөө', b3:'3+ өрөө', g:'Гаражтай', count:'зураг', none:'Шүүлтэд тохирох зураг алга.', sortF:'Онцлох', sortA:'Талбай: багаас их', sortD:'Талбай: ихээс бага',
        floor:'давхар', total:'Нийт талбай', living:'Амьдрах талбай', garageA:'Гараж', balcony:'Тагт', w:'Өргөн', d:'Урт', h:'Барилгын өндөр', fh:'Давхрын өндөр', roof:'Дээвэр', pitch:'Дээврийн налуу', found:'Суурь',
        sum:'Дүн', rooms:'Өрөө', concept:'Концепц', quote:'Сонголтоо илгээхэд үнийн санал гаргаж өгнө', free:'Багтсан', order:'Захиалга', pkg:'Багц', mirror:'Толин тусгал', addons:'Нэмэлт', none2:'Үгүй', yes2:'Тийм', area:'Талбай', price:'Үнэ'},
    en:{m2:'m²', beds:'Bedrooms', baths:'Bathrooms', floors:'Storeys', garage:'Garage', yes:'Yes', no:'No', sample:'Sample', onReq:'Price on request', from:' and up',
        all:'All', f1:'1 storey', f2:'2 storeys', b2:'2 beds', b3:'3+ beds', g:'With garage', count:'plans', none:'No plans match these filters.', sortF:'Featured', sortA:'Area: low to high', sortD:'Area: high to low',
        floor:'floor', total:'Total area', living:'Living area', garageA:'Garage', balcony:'Balcony', w:'Width', d:'Depth', h:'Building height', fh:'Floor-to-floor height', roof:'Roof', pitch:'Roof pitch', found:'Foundation',
        sum:'Subtotal', rooms:'Rooms', concept:'Concept', quote:'Send your choices and we will quote a price', free:'Included', order:'Order', pkg:'Package', mirror:'Mirrored', addons:'Add-ons', none2:'No', yes2:'Yes', area:'Area', price:'Price'}
  };
  function s(k){ return S[P.lang][k]; }
  function t(o){ return o[P.lang] || o.mn; }
  function fmt(v, d){ return (Math.round(v * (d || 10)) / (d || 10)).toLocaleString(P.lang === 'en' ? 'en-US' : 'mn-MN'); }
  function money(v){ return Math.round(v).toLocaleString('en-US').replace(/,/g, ' ') + ' ' + OPT.currency; }
  function stats(p){
    if(p.spec) return {spec:true, floors:p.spec.floors || 1, beds:p.spec.rooms, rooms:p.spec.rooms, baths:p.spec.baths, garage:0, balcony:0, living:p.spec.area, total:p.spec.area, perFloor:[p.spec.area]};
    var r = {floors:p.floors.length, beds:0, baths:0, garage:0, balcony:0, living:0, perFloor:[], b:[1e9, 1e9, -1e9, -1e9]};
    p.floors.forEach(function(f, i){ var fl = 0;
      f.rooms.forEach(function(x){
        if(x.type === 'bed') r.beds++; if(x.type === 'bath') r.baths++;
        var a = x.w * x.h;
        if(x.type === 'garage') r.garage += a; else if(x.type === 'balcony') r.balcony += a; else { r.living += a; fl += a; }
        r.b[0] = Math.min(r.b[0], x.x); r.b[1] = Math.min(r.b[1], x.y); r.b[2] = Math.max(r.b[2], x.x + x.w); r.b[3] = Math.max(r.b[3], x.y + x.h); });
      r.perFloor.push(fl); });
    r.total = r.living + r.garage; r.w = r.b[2] - r.b[0] + .25; r.d = r.b[3] - r.b[1] + .25;
    /* height from the same model the 3D renders use: plinth .3 m, 3 m storeys, 30° roof over the top floor */
    var top = p.floors[p.floors.length - 1].rooms.filter(function(x){ return x.type !== 'balcony'; }), tb = [1e9, 1e9, -1e9, -1e9];
    top.forEach(function(x){ tb[0] = Math.min(tb[0], x.x); tb[1] = Math.min(tb[1], x.y); tb[2] = Math.max(tb[2], x.x + x.w); tb[3] = Math.max(tb[3], x.y + x.h); });
    r.height = .3 + p.floors.length * 3 + (p.roof.type === 'flat' ? .15 : Math.min(tb[2] - tb[0], tb[3] - tb[1]) / 2 * Math.tan(Math.PI / 6));
    return r;
  }
  function priceFrom(){ var v = OPT.packages.map(function(k){ return k.price; }).filter(function(x){ return typeof x === 'number'; }); return v.length ? Math.min.apply(null, v) : null; }
  function el(tag, cls, txt, parent){ var e = document.createElement(tag); if(cls) e.className = cls; if(txt != null) e.textContent = txt; if(parent) parent.appendChild(e); return e; }
  function statLine(st){ return [fmt(st.total) + ' ' + s('m2'), st.beds + ' ' + (st.spec ? s('rooms') : s('beds')).toLowerCase(), st.baths + ' ' + s('baths'), st.floors + ' ' + s('floor')].concat(st.garage ? [s('garage').toLowerCase()] : []).join(' · '); }
  function card(p, parent){
    var st = stats(p), a = el('a', 'card pcard', null, parent); a.href = 'plan.html?p=' + encodeURIComponent(p.slug);
    var th = el('div', 'thumb render' + (p.wide ? ' wide' : ''), null, a), img = el('img', null, null, th); img.src = p.images[0].src; img.alt = t(p.title); img.loading = 'lazy';
    el('span', 'badge', p.code, th); if(p.sample || p.concept) el('span', 'badge alt', s(p.concept ? 'concept' : 'sample'), th);
    el('h3', null, t(p.title), a); el('p', null, statLine(st), a);
    var pf = priceFrom(); el('p', 'pprice', pf == null ? s('onReq') : money(pf) + s('from'), a);
    return a;
  }

  /* ---------- catalog ---------- */
  function catalog(){
    var grid = document.getElementById('plGrid'); if(!grid) return;
    var F = {floors:'all', beds:'all', garage:'all', sort:'feat'};
    var groups = [['floors', [['all', 'all'], ['1', 'f1'], ['2', 'f2']]], ['beds', [['all', 'all'], ['2', 'b2'], ['3', 'b3']]], ['garage', [['all', 'all'], ['yes', 'g']]]];
    function bar(){
      var box = document.getElementById('plFilters'); box.innerHTML = '';
      groups.forEach(function(g){ var grp = el('div', 'pf-grp', null, box); grp.setAttribute('role', 'group');
        el('span', 'pf-lab', s(g[0] === 'floors' ? 'floors' : g[0] === 'beds' ? 'rooms' : 'garage'), grp);
        g[1].forEach(function(o){ var b = el('button', 'pl-chip', s(o[1]), grp); b.type = 'button'; b.setAttribute('aria-pressed', F[g[0]] === o[0] ? 'true' : 'false');
          b.onclick = function(){ F[g[0]] = o[0]; render(); }; }); });
      var sel = el('select', 'pf-sort', null, box); sel.setAttribute('aria-label', 'Sort');
      [['feat', 'sortF'], ['asc', 'sortA'], ['desc', 'sortD']].forEach(function(o){ var op = el('option', null, s(o[1]), sel); op.value = o[0]; if(F.sort === o[0]) op.selected = true; });
      sel.onchange = function(){ F.sort = this.value; render(); };
    }
    function render(){
      bar(); grid.innerHTML = '';
      var list = PLANS.map(function(p){ return {p:p, st:stats(p)}; }).filter(function(x){
        if(F.floors !== 'all' && x.st.floors !== +F.floors) return false;
        if(F.beds === '2' && x.st.beds !== 2) return false; if(F.beds === '3' && x.st.beds < 3) return false;
        if(F.garage === 'yes' && !x.st.garage) return false; return true; });
      if(F.sort !== 'feat') list.sort(function(a, b){ return F.sort === 'asc' ? a.st.total - b.st.total : b.st.total - a.st.total; });
      list.forEach(function(x){ card(x.p, grid); });
      document.getElementById('plCount').textContent = list.length + ' ' + s('count');
      if(!list.length) el('p', 'pl-muted', s('none'), grid);
    }
    P.on(render);
  }

  /* ---------- plan page ---------- */
  function detail(){
    var root = document.getElementById('planPage'); if(!root) return;
    var slug = new URLSearchParams(location.search).get('p'), p = PLANS.filter(function(x){ return x.slug === slug; })[0] || PLANS[0], st = stats(p);
    var choice = {pkg:(OPT.packages.filter(function(k){ return k.best; })[0] || OPT.packages[0]).id, mirror:false, found:OPT.foundations[0].id, add:{}};
    var gi = 0;
    function opt(name, type, checked, onchange, label, sub, price, parent){
      var l = el('label', 'po' + (checked ? ' on' : ''), null, parent), i = el('input', null, null, l); i.type = type; i.name = name; i.checked = checked; i.onchange = onchange;
      var tx = el('span', 'po-t', null, l); el('b', null, label, tx); if(sub) el('small', null, sub, tx);
      if(price !== undefined) el('span', 'po-p', price === 0 ? s('free') : typeof price === 'number' ? money(price) : '—', l); return l;
    }
    function total(){ var sum = 0, known = true;
      function add(v){ if(typeof v === 'number') sum += v; else known = false; }
      add(OPT.packages.filter(function(k){ return k.id === choice.pkg; })[0].price);
      if(choice.mirror) add(OPT.mirror.price);
      add(OPT.foundations.filter(function(k){ return k.id === choice.found; })[0].price);
      OPT.addons.forEach(function(a){ if(choice.add[a.id]) add(a.price); });
      return known ? sum : null; }
    function buy(){
      var box = document.getElementById('ppBuy'); box.innerHTML = '';
      var steps = [[{mn:'Багцаа сонгоно уу', en:'Select your package'}], [{mn:'Толин тусгал хувилбар хэрэгтэй юу?', en:'Need a mirrored plan?'}], [{mn:'Суурийн төрөл', en:'Choose your foundation'}], [{mn:'Нэмэлт үйлчилгээ', en:'Optional add-ons'}]];
      steps.forEach(function(stp, k){ var sec = el('div', 'pstep', null, box); var h = el('h3', null, null, sec); el('span', 'pstep-n', (P.lang === 'en' ? 'Step ' : 'Алхам ') + (k + 1), h); h.appendChild(document.createTextNode(t(stp[0])));
        if(k === 0) OPT.packages.forEach(function(o){ var l = opt('pkg', 'radio', choice.pkg === o.id, function(){ choice.pkg = o.id; buy(); }, t(o), P.lang === 'en' ? o.den : o.dmn, o.price, sec);
          if(o.best) el('em', 'po-best', P.lang === 'en' ? 'Recommended' : 'Санал болгох', l.querySelector('.po-t')); });
        if(k === 1) [false, true].forEach(function(v){ opt('mir', 'radio', choice.mirror === v, function(){ choice.mirror = v; buy(); }, v ? s('yes2') : s('none2'), null, v ? OPT.mirror.price : undefined, sec); });
        if(k === 2) OPT.foundations.forEach(function(o){ opt('fnd', 'radio', choice.found === o.id, function(){ choice.found = o.id; buy(); }, t(o), null, o.price, sec); });
        if(k === 3) OPT.addons.forEach(function(o){ opt('add-' + o.id, 'checkbox', !!choice.add[o.id], function(){ choice.add[o.id] = this.checked; buy(); }, t(o), null, o.price, sec); });
      });
      var tt = total(), sm = el('div', 'psum', null, box); el('span', null, s('sum'), sm); el('b', null, tt == null ? s('onReq') : money(tt), sm);
      if(tt == null) el('p', 'pl-muted pl-small', s('quote'), box);
    }
    function order(){
      var pk = OPT.packages.filter(function(k){ return k.id === choice.pkg; })[0], fd = OPT.foundations.filter(function(k){ return k.id === choice.found; })[0];
      var ad = OPT.addons.filter(function(a){ return choice.add[a.id]; }).map(t), tt = total();
      var lines = [(P.lang === 'en' ? 'Ready-made plan order: ' : 'Бэлэн зураг захиалга: ') + p.code + ' — ' + t(p.title), statLine(st), '',
        s('pkg') + ': ' + t(pk), s('mirror') + ': ' + (choice.mirror ? s('yes2') : s('none2')), s('found') + ': ' + t(fd), s('addons') + ': ' + (ad.length ? ad.join(', ') : s('none2')),
        s('sum') + ': ' + (tt == null ? s('onReq') : money(tt))];
      try{ sessionStorage.setItem('psp-plan', JSON.stringify({msg:lines.join('\n'), area:String(Math.round(st.total))})); }catch(x){}
      location.href = 'studio.html#contact';
    }
    function edit(){ try{ sessionStorage.setItem('psp-load', JSON.stringify({floors:p.floors, roof:p.roof, facade:p.facade, code:p.code})); }catch(x){} location.href = 'planner.html'; }
    function gallery(){
      var main = document.getElementById('ppMain'), th = document.getElementById('ppThumbs'), im = p.images[gi];
      main.querySelector('img').src = im.src; main.querySelector('img').alt = t(im.cap); document.getElementById('ppCap').textContent = t(im.b) + ' ' + t(im.cap) + '  ·  ' + (gi + 1) + '/' + p.images.length;
      th.innerHTML = ''; p.images.forEach(function(x, k){ var b = el('button', k === gi ? 'on' : '', null, th); b.type = 'button'; b.setAttribute('aria-label', t(x.cap)); var i = el('img', null, null, b); i.src = x.src; i.alt = ''; b.onclick = function(){ gi = k; gallery(); }; });
    }
    function render(){
      document.title = p.code + ' — ' + t(p.title) + ' — Prime Spatial Plan';
      document.getElementById('ppCode').textContent = p.code + (p.sample ? ' · ' + s('sample') : p.concept ? ' · ' + s('concept') : '');
      document.getElementById('ppMain').classList.toggle('wide', !!p.wide); document.getElementById('ppEdit').hidden = !p.floors;
      document.getElementById('ppNote').textContent = t(p.note || {mn:'Жишээ зураг: төлөвлөлт, үзүүлэлтүүд нь манай загвараас гарсан. Эцсийн зургийг таны газарт тохируулж, норм дүрмийн дагуу боловсруулна.', en:'Sample plan: the layout and specs come from our drawing model. Final drawings are prepared for your plot and checked against building codes.'});
      document.getElementById('ppTitle').textContent = t(p.title);
      document.getElementById('ppLead').textContent = t(p.lead);
      var sb = document.getElementById('ppStats'); sb.innerHTML = '';
      [[fmt(st.total), s('m2')], [st.beds, st.spec ? s('rooms') : s('beds')], [st.baths, s('baths')], [st.floors, s('floors')]].concat(st.spec ? [] : [[st.garage ? '1' : '—', s('garage')]]).forEach(function(x){ var d = el('div', null, null, sb); el('b', null, x[0], d); el('span', null, x[1], d); });
      gallery(); buy();
      /* sheets */
      var sh = document.getElementById('ppSheets'); sh.innerHTML = '';
      p.sheets.forEach(function(x, i){ var f = el('figure', 'ppsheet', null, sh), b = el('button', 'sheet-btn', null, f); b.type = 'button';
        var img = el('img', null, null, b); img.src = x.src; img.alt = t(x.cap); img.loading = 'lazy';
        b.onclick = function(){ lb(x.src, t(x.cap)); };
        var fc = el('figcaption', null, null, f); el('b', null, t(x.cap), fc); el('span', null, fmt(st.perFloor[i]) + ' ' + s('m2'), fc);
        if(!p.floors) return;
        var ul = el('ul', 'pprooms', null, f);
        p.floors[i].rooms.forEach(function(r){ var li = el('li', null, null, ul); el('span', null, t(RT[r.type]), li); el('span', null, fmt(r.w) + ' × ' + fmt(r.h) + ' м', li); el('b', null, fmt(r.w * r.h) + ' ' + s('m2'), li); }); });
      /* spec table */
      var sp = document.getElementById('ppSpecs'); sp.innerHTML = '';
      var blocks = st.spec ? [
        [{mn:'Талбай', en:'Areas'}, [[s('total'), fmt(st.total) + ' ' + s('m2')]]],
        [{mn:'Өрөө', en:'Rooms'}, [[s('rooms'), st.rooms], [s('baths'), st.baths]]],
        [{mn:'Ерөнхий', en:'General'}, [[s('floors'), st.floors], [P.lang === 'en' ? 'Status' : 'Төлөв', s('concept')]]],
        [{mn:'Суурь', en:'Foundation'}, [[s('found'), OPT.foundations.map(t).join(', ')]]]
      ] : [
        [{mn:'Талбай', en:'Areas'}, [[s('total'), fmt(st.total) + ' ' + s('m2')], [s('living'), fmt(st.living) + ' ' + s('m2')]].concat(st.perFloor.map(function(a, i){ return [(i + 1) + (P.lang === 'en' ? ['st', 'nd'][i] || 'th' : '-р') + ' ' + s('floor'), fmt(a) + ' ' + s('m2')]; }))
          .concat(st.garage ? [[s('garageA'), fmt(st.garage) + ' ' + s('m2')]] : []).concat(st.balcony ? [[s('balcony'), fmt(st.balcony) + ' ' + s('m2')]] : [])],
        [{mn:'Өрөө', en:'Rooms'}, [[s('beds'), st.beds], [s('baths'), st.baths], [s('garage'), st.garage ? s('yes') : s('no')]]],
        [{mn:'Хэмжээ', en:'Dimensions'}, [[s('floors'), st.floors], [s('w'), fmt(st.w) + ' м'], [s('d'), fmt(st.d) + ' м'], [s('h'), '≈ ' + fmt(st.height) + ' м'], [s('fh'), '3.0 м']]],
        [{mn:'Дээвэр ба суурь', en:'Roof and foundation'}, [[s('roof'), t(ROOF[p.roof.type]) + (p.roof.mat ? ', ' + t(RMAT[p.roof.mat]) : '')], [P.lang === 'en' ? 'Facade' : 'Фасад', t(FAC[p.facade || 'auto'])], [s('pitch'), p.roof.type === 'flat' ? '—' : '30°'], [s('found'), OPT.foundations.map(t).join(', ')]]]
      ];
      blocks.forEach(function(bk){ var d = el('div', 'ppspec', null, sp); el('h3', null, t(bk[0]), d); var dl = el('dl', null, null, d);
        bk[1].forEach(function(row){ var r = el('div', null, null, dl); el('dt', null, row[0], r); el('dd', null, String(row[1]), r); }); });
      var tg = document.getElementById('ppTags'); tg.innerHTML = ''; p.tags.forEach(function(k){ el('span', 'pptag', t(TAG[k]), tg); });
      var sim = document.getElementById('ppSimilar'); sim.innerHTML = ''; PLANS.filter(function(x){ return x !== p && !!x.spec === !!p.spec; }).slice(0, 3).forEach(function(x){ card(x, sim); });
    }
    document.getElementById('ppOrder').onclick = order;
    document.getElementById('ppEdit').onclick = edit;
    document.getElementById('ppMain').onclick = function(){ lb(p.images[gi].src, t(p.images[gi].cap)); };
    document.getElementById('ppPrev').onclick = function(e){ e.stopPropagation(); gi = (gi + p.images.length - 1) % p.images.length; gallery(); };
    document.getElementById('ppNext').onclick = function(e){ e.stopPropagation(); gi = (gi + 1) % p.images.length; gallery(); };
    /* lightbox */
    var box = document.getElementById('lightbox');
    function lb(src, cap){ document.getElementById('lbImg').src = src; document.getElementById('lbCap').textContent = cap; box.classList.remove('zoom'); box.hidden = false; document.body.style.overflow = 'hidden'; }
    function lbClose(){ box.hidden = true; document.body.style.overflow = ''; }
    document.getElementById('lbClose').onclick = lbClose;
    document.getElementById('lbZoom').onclick = function(){ box.classList.toggle('zoom'); };
    document.getElementById('lbImg').onclick = function(){ box.classList.toggle('zoom'); };
    addEventListener('keydown', function(e){ if(e.key === 'Escape' && !box.hidden) lbClose(); });
    P.on(render);
  }
  catalog(); detail();
  P.init();
})();
