// 바이브 코딩 x 데이터 저널리즘 해커톤 — 공용 스크립트
(function () {
  // 모바일 사이드바 토글
  var menuBtn = document.querySelector('.menu-btn');
  var sidebar = document.querySelector('.sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', function () { sidebar.classList.toggle('open'); });
  }

  // 페이지 내 섹션 전환 (data-s ↔ section id)
  var items = document.querySelectorAll('.nav-item');
  var sections = document.querySelectorAll('.section');
  if (items.length && sections.length) {
    var go = function (id) {
      sections.forEach(function (s) { s.classList.toggle('active', s.id === id); });
      items.forEach(function (i) { i.classList.toggle('active', i.dataset.s === id); });
      if (sidebar) sidebar.classList.remove('open');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    items.forEach(function (i) { i.addEventListener('click', function () { go(i.dataset.s); }); });
    // 내부 상호 참조 링크(.xref)
    document.querySelectorAll('.xref').forEach(function (x) {
      x.style.cursor = 'pointer';
      x.addEventListener('click', function () { go(x.dataset.s); });
    });
    // 해시로 들어온 경우 해당 섹션 열기
    if (location.hash) {
      var id = location.hash.slice(1);
      if (document.getElementById(id)) go(id);
    }
  }

  // 페이지 하단 페이지네이션 (이전/다음 강) — 자동 생성
  var pages = [
    { f: 'index.html', t: '강의 홈' },
    { f: '01-first-exercise.html', t: '1강 · 첫 실습 30분' },
    { f: '02-method.html', t: '2강 · 기초취재 방법론' },
    { f: '03-data-100.html', t: '3강 · 공공데이터 100선' },
    { f: '04-case-colin.html', t: '4강 · 콜린알포 케이스' },
    { f: '05-manual.html', t: '5강 · 프로젝트 매뉴얼' },
    { f: '06-verification.html', t: '6강 · 검증과 원칙' }
  ];
  var path = (location.pathname.split('/').pop() || 'index.html');
  if (path === '') path = 'index.html';
  var idx = -1;
  for (var i = 0; i < pages.length; i++) { if (pages[i].f === path) { idx = i; break; } }
  var main = document.querySelector('.main');
  if (idx !== -1 && main) {
    var prev = idx > 0 ? pages[idx - 1] : null;
    var next = idx < pages.length - 1 ? pages[idx + 1] : null;
    var pager = document.createElement('nav');
    pager.className = 'pager';
    pager.setAttribute('aria-label', '강의 이동');
    var html = '';
    html += prev
      ? '<a class="pg prev" href="' + prev.f + '"><span class="dir">← 이전 강</span><span class="t">' + prev.t + '</span></a>'
      : '<span class="pg empty"></span>';
    html += next
      ? '<a class="pg next" href="' + next.f + '"><span class="dir">다음 강 →</span><span class="t">' + next.t + '</span></a>'
      : '<span class="pg empty"></span>';
    pager.innerHTML = html;
    main.appendChild(pager);
  }
})();
