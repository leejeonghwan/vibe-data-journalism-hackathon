// 바이브 코딩 x 데이터 저널리즘 해커톤 — 공용 스크립트
(function () {
  // 모바일 사이드바 토글
  var menuBtn = document.querySelector('.menu-btn');
  var sidebar = document.querySelector('.sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', function () { sidebar.classList.toggle('open'); });
  }

  var items = Array.prototype.slice.call(document.querySelectorAll('.nav-item'));
  var sections = document.querySelectorAll('.section');
  var main = document.querySelector('.main');
  if (!items.length || !sections.length) return;

  // 섹션 순서와 라벨(목차 텍스트)
  var order = items.map(function (i) { return i.dataset.s; });
  var labels = {};
  items.forEach(function (i) { labels[i.dataset.s] = (i.textContent || '').replace(/\s+/g, ' ').trim(); });

  // 하단 페이지네이션(현재 강 안에서 이전/다음 섹션)
  var pager = null;
  if (main) {
    pager = document.createElement('nav');
    pager.className = 'pager';
    pager.setAttribute('aria-label', '페이지 이동');
    main.appendChild(pager);
  }

  function renderPager(id) {
    if (!pager) return;
    var pos = order.indexOf(id);
    var prevId = pos > 0 ? order[pos - 1] : null;
    var nextId = (pos > -1 && pos < order.length - 1) ? order[pos + 1] : null;
    var html = '';
    html += prevId
      ? '<button class="pg prev" data-go="' + prevId + '"><span class="dir">← 이전</span><span class="t">' + labels[prevId] + '</span></button>'
      : '<span class="pg empty"></span>';
    html += nextId
      ? '<button class="pg next" data-go="' + nextId + '"><span class="dir">다음 →</span><span class="t">' + labels[nextId] + '</span></button>'
      : '<span class="pg empty"></span>';
    pager.innerHTML = html;
    Array.prototype.slice.call(pager.querySelectorAll('button[data-go]')).forEach(function (b) {
      b.addEventListener('click', function () { go(b.dataset.go); });
    });
  }

  function go(id) {
    sections.forEach(function (s) { s.classList.toggle('active', s.id === id); });
    items.forEach(function (i) { i.classList.toggle('active', i.dataset.s === id); });
    renderPager(id);
    if (sidebar) sidebar.classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  items.forEach(function (i) { i.addEventListener('click', function () { go(i.dataset.s); }); });
  document.querySelectorAll('.xref').forEach(function (x) {
    x.style.cursor = 'pointer';
    x.addEventListener('click', function () { go(x.dataset.s); });
  });

  // 초기 표시 섹션 결정 (해시 > 현재 active > 첫 섹션)
  var startId = order[0];
  var activeSection = document.querySelector('.section.active');
  if (activeSection) startId = activeSection.id;
  if (location.hash && document.getElementById(location.hash.slice(1))) startId = location.hash.slice(1);
  go(startId);
})();
