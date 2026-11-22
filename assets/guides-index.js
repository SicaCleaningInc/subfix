/* 教學目錄：即時搜尋 + 側欄分類高亮 */
(function () {
  'use strict';
  var q = document.getElementById('gi-q');
  var none = document.getElementById('gi-none');
  var zh = /^zh/.test(document.documentElement.lang);
  if (none) none.textContent = zh ? '找不到相關教學，試試其他關鍵字。' : 'No guides found. Try another word.';
  if (q) q.addEventListener('input', function () {
    var v = q.value.trim().toLowerCase(), shown = 0;
    document.querySelectorAll('.gi-group').forEach(function (g) {
      var n = 0;
      g.querySelectorAll('.gi-row').forEach(function (r) {
        var ok = !v || r.textContent.toLowerCase().indexOf(v) !== -1;
        r.hidden = !ok; if (ok) n++;
      });
      g.hidden = n === 0; shown += n;
    });
    if (none) none.hidden = shown !== 0;
  });
  var cats = document.querySelectorAll('.gi-cats a');
  cats.forEach(function (a) {
    a.addEventListener('click', function () {
      cats.forEach(function (x) { x.classList.toggle('on', x === a); });
    });
  });
})();
