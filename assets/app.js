// 바이브 코딩 x 데이터 저널리즘 해커톤 — 공용 스크립트 (슬라이드 모드 + 자동 페이지 분할)
(function () {
  var body = document.body;
  var menuBtn = document.querySelector('.menu-btn');
  var sidebar = document.querySelector('.sidebar');
  var header = document.querySelector('.site-header');
  var main = document.querySelector('.main');
  var isMobile = function(){ return window.innerWidth <= 900; };

  function toggleSidebar(){
    if (isMobile()) sidebar.classList.toggle('open');
    else body.classList.toggle('nav-collapsed');
  }
  if (menuBtn && sidebar) menuBtn.addEventListener('click', toggleSidebar);

  var items = Array.prototype.slice.call(document.querySelectorAll('.nav-item'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('.section'));

  // ---- 헤더 버튼 · 화살표 · 카운터 주입 ----
  var slideBtn = document.createElement('button'); slideBtn.className='hdr-btn'; slideBtn.type='button'; slideBtn.innerHTML='▶ 슬라이드';
  var collapseBtn = document.createElement('button'); collapseBtn.className='hdr-btn'; collapseBtn.type='button'; collapseBtn.innerHTML='⇤ 사이드바';
  var themeBtn = document.createElement('button'); themeBtn.className='hdr-btn'; themeBtn.type='button';
  function applyTheme(dark){ body.classList.toggle('dark', dark); themeBtn.innerHTML = dark ? '☀ 라이트' : '🌙 다크'; }
  var savedTheme=null; try{ savedTheme=localStorage.getItem('vdjh-theme'); }catch(e){}
  var initDark = savedTheme ? (savedTheme==='dark') : !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  applyTheme(initDark);
  themeBtn.addEventListener('click', function(){ var d=!body.classList.contains('dark'); applyTheme(d); try{ localStorage.setItem('vdjh-theme', d?'dark':'light'); }catch(e){} });
  if (header){ header.appendChild(themeBtn); header.appendChild(collapseBtn); header.appendChild(slideBtn); }
  collapseBtn.addEventListener('click', toggleSidebar);

  var arrowL=document.createElement('button'); arrowL.className='slide-arrow left'; arrowL.type='button'; arrowL.setAttribute('aria-label','이전'); arrowL.innerHTML='‹';
  var arrowR=document.createElement('button'); arrowR.className='slide-arrow right'; arrowR.type='button'; arrowR.setAttribute('aria-label','다음'); arrowR.innerHTML='›';
  var counter=document.createElement('div'); counter.className='slide-count';
  body.appendChild(arrowL); body.appendChild(arrowR); body.appendChild(counter);

  if (!items.length || !sections.length){ slideBtn.style.display='none'; return; }

  var order = items.map(function(i){ return i.dataset.s; });
  var labels = {}; items.forEach(function(i){ labels[i.dataset.s]=(i.textContent||'').replace(/\s+/g,' ').trim(); });

  var pager=null;
  if (main){ pager=document.createElement('nav'); pager.className='pager'; main.appendChild(pager); }

  var current = order[0];          // 현재 섹션 id (일반 모드)
  var pages = [];                  // 슬라이드 모드: [{sec, els:[el...]}]
  var pIdx = 0;
  var lessonOrder = Array.prototype.slice.call(document.querySelectorAll('.course-nav a')).map(function(a){ return a.getAttribute('href'); });
  function hereFile(){ return location.pathname.split('/').pop() || 'index.html'; }
  function gotoLesson(dir){ var i=lessonOrder.indexOf(hereFile()); var t=lessonOrder[i+dir]; if(i<0||!t) return false; try{ sessionStorage.setItem('vdjh-present','1'); sessionStorage.setItem('vdjh-pos', dir>0?'first':'last'); }catch(e){} location.href=t; return true; }

  function outer(el){ var s=getComputedStyle(el); return el.offsetHeight + (parseFloat(s.marginTop)||0) + (parseFloat(s.marginBottom)||0); }
  function isHeading(el){ return /^H[2-4]$/.test(el.tagName); }

  function clearInlineDisplay(){
    sections.forEach(function(sec){ Array.prototype.slice.call(sec.children).forEach(function(c){ c.style.display=''; }); });
  }

  // 각 섹션을 화면 높이에 맞춰 페이지로 분할
  function buildDeck(){
    pages = [];
    var headerBar = header ? (header.offsetHeight||60) : 60;
    var avail = window.innerHeight - headerBar - 84;   // 슬라이드 가용 높이
    sections.forEach(function(sec){
      var headerEl = sec.querySelector('.module-header');
      var kids = Array.prototype.slice.call(sec.children).filter(function(k){ return k!==headerEl; });
      // 측정 위해 잠깐 활성화 + 전부 표시
      sections.forEach(function(s){ s.classList.toggle('active', s===sec); });
      kids.forEach(function(k){ k.style.display=''; });
      var headerH = headerEl ? outer(headerEl) : 0;
      var budget = avail - headerH - 20;
      if (budget < 140) budget = avail - 20;
      var page=[], used=0;
      kids.forEach(function(k){
        var h = outer(k);
        var brk = page.length && (isHeading(k) || used + h > budget);
        if (brk){ pages.push({sec:sec.id, els:page}); page=[]; used=0; }
        page.push(k); used += h;
      });
      pages.push({sec:sec.id, els:page});   // 마지막(또는 빈) 페이지
    });
  }

  function showPage(i){
    if (i<0) i=0; if (i>pages.length-1) i=pages.length-1;
    pIdx=i; var pg=pages[i];
    sections.forEach(function(s){ s.classList.toggle('active', s.id===pg.sec); });
    var sec=document.getElementById(pg.sec);
    var headerEl=sec.querySelector('.module-header');
    Array.prototype.slice.call(sec.children).forEach(function(c){
      if (c===headerEl) return;
      c.style.display = (pg.els.indexOf(c)>=0) ? '' : 'none';
    });
    items.forEach(function(it){ it.classList.toggle('active', it.dataset.s===pg.sec); });
    current = pg.sec;
    counter.textContent=(i+1)+' / '+pages.length;
    var li=lessonOrder.indexOf(hereFile());
    arrowL.disabled = (i<=0) && !(li>0);
    arrowR.disabled = (i>=pages.length-1) && !(li>=0 && li<lessonOrder.length-1);
    if (sidebar) sidebar.classList.remove('open');
    var box=sec; box.scrollTop=0;
  }

  // ---- 일반 모드 섹션 이동 ----
  function renderPager(id){
    if(!pager) return;
    var pos=order.indexOf(id);
    var prevId=pos>0?order[pos-1]:null, nextId=(pos>-1&&pos<order.length-1)?order[pos+1]:null;
    var html='';
    html += prevId ? '<button class="pg prev" data-go="'+prevId+'"><span class="dir">← 이전</span><span class="t">'+labels[prevId]+'</span></button>' : '<span class="pg empty"></span>';
    html += nextId ? '<button class="pg next" data-go="'+nextId+'"><span class="dir">다음 →</span><span class="t">'+labels[nextId]+'</span></button>' : '<span class="pg empty"></span>';
    pager.innerHTML=html;
    Array.prototype.slice.call(pager.querySelectorAll('button[data-go]')).forEach(function(b){ b.addEventListener('click',function(){ go(b.dataset.go); }); });
  }
  function go(id){
    if (order.indexOf(id)<0) return;
    current=id;
    sections.forEach(function(s){ s.classList.toggle('active', s.id===id); });
    items.forEach(function(i){ i.classList.toggle('active', i.dataset.s===id); });
    renderPager(id);
    if (sidebar) sidebar.classList.remove('open');
    window.scrollTo({top:0,behavior:'smooth'});
  }

  // ---- 공통 이동 ----
  function step(delta){
    if (body.classList.contains('present')){
      var ni=pIdx+delta;
      if (ni<0){ gotoLesson(-1); return; }
      if (ni>pages.length-1){ gotoLesson(1); return; }
      showPage(ni);
    } else { var pos=order.indexOf(current)+delta; if (pos>=0&&pos<order.length) go(order[pos]); }
  }
  items.forEach(function(i){ i.addEventListener('click', function(){
    if (body.classList.contains('present')){ for (var k=0;k<pages.length;k++){ if (pages[k].sec===i.dataset.s){ showPage(k); break; } } }
    else go(i.dataset.s);
  }); });
  document.querySelectorAll('.xref').forEach(function(x){ x.style.cursor='pointer'; x.addEventListener('click',function(){ go(x.dataset.s); }); });
  arrowL.addEventListener('click',function(){ step(-1); });
  arrowR.addEventListener('click',function(){ step(1); });

  // ---- 슬라이드 모드 토글 ----
  function setPresent(on){
    if (on){
      if (!isMobile()) body.classList.add('nav-collapsed');
      body.classList.add('present');
      var secOfCurrent = current;
      buildDeck();
      var start=0; for (var k=0;k<pages.length;k++){ if (pages[k].sec===secOfCurrent){ start=k; break; } }
      showPage(start);
    } else {
      body.classList.remove('present');
      clearInlineDisplay();
      try{ sessionStorage.removeItem('vdjh-present'); sessionStorage.removeItem('vdjh-pos'); }catch(e){}
      go(current);
    }
    slideBtn.classList.toggle('on', on);
    slideBtn.innerHTML = on ? '✕ 나가기' : '▶ 슬라이드';
  }
  slideBtn.addEventListener('click', function(){ setPresent(!body.classList.contains('present')); });

  // ---- 키보드 ----
  document.addEventListener('keydown', function(e){
    var tag=(e.target&&e.target.tagName)||'';
    if (tag==='INPUT'||tag==='TEXTAREA') return;
    if (e.key==='ArrowRight'||e.key==='PageDown'||e.key===' '){ step(1); e.preventDefault(); }
    else if (e.key==='ArrowLeft'||e.key==='PageUp'){ step(-1); e.preventDefault(); }
    else if (e.key==='Escape' && body.classList.contains('present')) setPresent(false);
  });

  // 창 크기 변경 시 슬라이드 모드면 재분할
  var rz; window.addEventListener('resize', function(){ if (!body.classList.contains('present')) return; clearTimeout(rz); rz=setTimeout(function(){ var s=current; buildDeck(); var st=0; for(var k=0;k<pages.length;k++){ if(pages[k].sec===s){st=k;break;} } showPage(st); }, 200); });

  // 초기 섹션
  var startId=order[0];
  var activeSection=document.querySelector('.section.active');
  if (activeSection) startId=activeSection.id;
  if (location.hash && document.getElementById(location.hash.slice(1))) startId=location.hash.slice(1);
  go(startId);
  try{ if (sessionStorage.getItem('vdjh-present')==='1'){ var _pos=sessionStorage.getItem('vdjh-pos'); setPresent(true); if(_pos==='last') showPage(pages.length-1); } }catch(e){}
})();
