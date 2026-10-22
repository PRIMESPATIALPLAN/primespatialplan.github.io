/* Prime Spatial Plan — shared behaviour: language switch, gallery, inquiry form. */
(function(){
  var P = window.PSP = {
    lang:'mn', subs:[],
    on:function(f){ this.subs.push(f); },
    t:function(o){ return o ? (o[this.lang] || o.mn || '') : ''; },
    T:{
      mn:{err:'Нэр болон утасны дугаараа оруулна уу.',head:'Зураг төслийн хүсэлт — Prime Spatial Plan',name:'Нэр',phone:'Утас',type:'Төрөл',area:'Талбай',loc:'Байршил',copied:'Хуулсан',copy:'Хуулах',sel:'Текст сонгогдлоо, хуулна уу',prev:'Өмнөх',next:'Дараах'},
      en:{err:'Please enter your name and phone number.',head:'Design request — Prime Spatial Plan',name:'Name',phone:'Phone',type:'Type',area:'Area',loc:'Location',copied:'Copied',copy:'Copy',sel:'Text selected, copy it now',prev:'Previous',next:'Next'}
    }
  };

  function setLang(l){
    P.lang = l; document.documentElement.lang = l;
    document.querySelectorAll('[data-en]').forEach(function(el){
      if(el.dataset.mn === undefined) el.dataset.mn = el.textContent;
      el.textContent = l === 'en' ? el.dataset.en : el.dataset.mn;
    });
    document.querySelectorAll('[data-en-ph]').forEach(function(el){
      if(el.dataset.mnPh === undefined) el.dataset.mnPh = el.placeholder;
      el.placeholder = l === 'en' ? el.dataset.enPh : el.dataset.mnPh;
    });
    document.querySelectorAll('[data-en-aria]').forEach(function(el){
      if(el.dataset.mnAria === undefined) el.dataset.mnAria = el.getAttribute('aria-label');
      el.setAttribute('aria-label', l === 'en' ? el.dataset.enAria : el.dataset.mnAria);
    });
    document.querySelectorAll('.lang button').forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.lang === l ? 'true' : 'false'); });
    P.subs.forEach(function(f){ f(l); });
    try{ localStorage.setItem('psp-lang', l); }catch(x){}
  }
  P.setLang = setLang;

  /* Gallery: builds slides into a .gallery element from an image list. */
  P.gallery = function(root, images, badge){
    var track = root.querySelector('.track'), count = root.querySelector('.count'),
        cap = root.querySelector('.caption'), cur = 0, slides = [];
    track.innerHTML = '';
    images.forEach(function(im){
      var fig = document.createElement('figure'); fig.className = 'slide';
      var plate = document.createElement('div'); plate.className = 'plate' + (im.contain ? ' contain' : '');
      var img = document.createElement('img'); img.src = im.src; img.alt = P.t(im.b).replace(' —','') + ' ' + P.t(im.cap);
      plate.appendChild(img);
      if(badge){ var s = document.createElement('span'); s.className = 'badge'; s.textContent = badge; plate.appendChild(s); }
      fig.appendChild(plate); track.appendChild(fig); slides.push(fig);
    });
    function pad(n){ return (n < 10 ? '0' : '') + n; }
    function show(){
      var im = images[cur]; cap.innerHTML = '';
      var b = document.createElement('b'); b.textContent = P.t(im.b);
      cap.appendChild(b); cap.appendChild(document.createTextNode(' ' + P.t(im.cap)));
      count.textContent = pad(cur + 1) + '/' + pad(images.length);
    }
    function go(i){
      i = (i + slides.length) % slides.length;
      track.scrollTo({left: slides[i].offsetLeft - track.offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    }
    var t; track.onscroll = function(){ clearTimeout(t); t = setTimeout(function(){
      var i = Math.round(track.scrollLeft / track.clientWidth); if(i !== cur){ cur = i; show(); } }, 60); };
    var prev = root.querySelector('.prev'), next = root.querySelector('.next-btn');
    prev.onclick = function(){ go(cur - 1); }; next.onclick = function(){ go(cur + 1); };
    prev.hidden = next.hidden = images.length < 2;
    track.onkeydown = function(e){ if(e.key === 'ArrowRight'){ e.preventDefault(); go(cur + 1); } if(e.key === 'ArrowLeft'){ e.preventDefault(); go(cur - 1); } };
    show();
    P.on(function(l){ show(); prev.setAttribute('aria-label', P.T[l].prev); next.setAttribute('aria-label', P.T[l].next); });
  };

  /* Inquiry form (studio page). */
  function initForm(){
    var f = document.getElementById('inq'); if(!f) return;
    var err = document.getElementById('err'), res = document.getElementById('result'), out = document.getElementById('out');
    function v(id){ return document.getElementById(id).value.trim(); }
    function build(){
      var t = P.T[P.lang], s = document.getElementById('type');
      out.textContent = t.head + '\n\n' + t.name + ': ' + v('name') + '\n' + t.phone + ': ' + v('phone') + '\n' + t.type + ': ' + s.options[s.selectedIndex].text +
        (v('area') ? '\n' + t.area + ': ' + v('area') + ' м²' : '') + (v('loc') ? '\n' + t.loc + ': ' + v('loc') : '') + (v('msg') ? '\n\n' + v('msg') : '');
    }
    f.addEventListener('submit', function(e){
      e.preventDefault();
      if(!v('name') || !v('phone')){ err.textContent = P.T[P.lang].err; err.hidden = false; return; }
      err.hidden = true; build(); res.hidden = false;
    });
    document.getElementById('copy').addEventListener('click', function(){
      var b = this, txt = out.textContent;
      var sel = function(){ var r = document.createRange(); r.selectNodeContents(out); var s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = P.T[P.lang].sel; };
      var done = function(){ b.textContent = P.T[P.lang].copied; setTimeout(function(){ b.textContent = P.T[P.lang].copy; }, 1800); };
      try{ navigator.clipboard.writeText(txt).then(done, sel); }catch(x){ sel(); }
    });
    P.on(function(l){ if(!res.hidden) build(); if(!err.hidden) err.textContent = P.T[l].err; });
  }

  /* Call once the page script has registered its renderers. */
  P.init = function(){
    initForm();
    document.querySelectorAll('.lang button').forEach(function(b){ b.addEventListener('click', function(){ setLang(b.dataset.lang); }); });
    var saved = null; try{ saved = localStorage.getItem('psp-lang'); }catch(x){}
    setLang(saved === 'en' ? 'en' : 'mn');
  };
})();

/* Page transitions and painted heroes: every page shares the homepage's scenes.
   Leaving: the next page's scene opens from the clicked link like the homepage portal.
   Arriving: that same scene covers the screen, then settles into this page's hero. */
(function(){
  var S = window.PSPScenes, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MAP = {'':0, 'index.html':0, 'projects.html':1, 'project.html':7, 'studio.html':9};
  function sceneFor(u){ var f = u.pathname.split('/').pop(); return MAP.hasOwnProperty(f) ? MAP[f] : null; }
  var EASE = 'cubic-bezier(.75,0,.2,1)';

  function overlay(i){
    var c = document.createElement('canvas'); c.className = 'psp-ov'; c.setAttribute('aria-hidden','true');
    c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:100;pointer-events:none;display:block';
    S.blit(c, S.scene(i), innerWidth, innerHeight); document.body.appendChild(c); return c;
  }

  /* heroes */
  var heroes = [].slice.call(document.querySelectorAll('canvas.hero-cv'));
  function paintHeroes(){
    if(!S) return;
    heroes.forEach(function(cv){ var r = cv.getBoundingClientRect(); S.blit(cv, S.scene(+cv.dataset.scene), r.width, r.height, innerHeight); });
  }
  paintHeroes();
  var rt; addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(function(){ S && S.clear(); paintHeroes(); }, 200); });

  /* header turns solid once the hero has scrolled away */
  var bar = document.querySelector('.top.over');
  if(bar){ var hero = document.querySelector('.hero');
    var onScroll = function(){ bar.classList.toggle('solid', !hero || hero.getBoundingClientRect().bottom < 80); };
    addEventListener('scroll', onScroll, {passive:true}); onScroll(); }

  /* arriving */
  var flag = null; try{ flag = sessionStorage.getItem('psp-enter'); }catch(x){}
  if(flag !== null && heroes.length && S && !reduce){
    try{ sessionStorage.removeItem('psp-enter'); }catch(x){}
    var i = +flag, ov = overlay(i), hero = document.querySelector('.hero');
    requestAnimationFrame(function(){
      var hb = hero.getBoundingClientRect().bottom, sameScene = +heroes[0].dataset.scene === i && !location.hash && hb > 0;
      var to = sameScene ? 'inset(0px 0px '+Math.max(0, innerHeight - hb)+'px 0px round 0px)' : 'inset(0px 0px 0px 0px round 0px)';
      var a = ov.animate([{clipPath:'inset(0px 0px 0px 0px round 0px)', opacity:1}, {clipPath:to, opacity: sameScene ? 1 : 0}],
                         {duration: sameScene ? 700 : 500, easing: EASE, fill:'forwards'});
      a.onfinish = function(){ ov.remove(); };
    });
  } else { try{ sessionStorage.removeItem('psp-enter'); }catch(x){} }

  /* leaving */
  var leaving = false;
  function leave(href, rect){
    var u = new URL(href, location.href), i = sceneFor(u);
    if(i === null || reduce || !S || leaving){ location.href = href; return; }
    leaving = true;
    var ov = overlay(i), W = innerWidth, H = innerHeight,
        r = rect && rect.width ? rect : {left:W/2-60, top:H/2-70, right:W/2+60, bottom:H/2+70};
    var from = 'inset('+r.top+'px '+(W-r.right)+'px '+(H-r.bottom)+'px '+r.left+'px round 30px)';
    var a = ov.animate([{clipPath:from, filter:'brightness(1.15)'}, {clipPath:'inset(0px 0px 0px 0px round 0px)', filter:'brightness(1)'}],
                       {duration:900, easing:EASE, fill:'forwards'});
    a.onfinish = function(){ try{ sessionStorage.setItem('psp-enter', String(i)); }catch(x){} location.href = href; };
  }
  window.PSP.leave = leave;
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href]');
    if(!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank' || a.hasAttribute('download')) return;
    var u = new URL(a.href, location.href);
    if(u.origin !== location.origin) return;
    if(u.pathname === location.pathname && u.search === location.search) return; /* same-page anchors scroll normally */
    e.preventDefault(); leave(a.href, a.getBoundingClientRect());
  });
  addEventListener('pageshow', function(e){ if(e.persisted){ leaving = false; [].slice.call(document.querySelectorAll('.psp-ov')).forEach(function(o){ o.remove(); }); } });
})();
