/* 雙語字幕合併：介面邏輯（中英文頁面共用，文字可由 window.ZIMU_STRINGS 覆寫） */
(function () {
  'use strict';
  var E = window.ZimuFixEncoding, F = window.ZimuFormat, M = window.ZimuMerge;
  var STR = window.ZIMU_STRINGS || {};
  function t(k, d) { return STR[k] != null ? STR[k] : d; }
  var $ = function (id) { return document.getElementById(id); };
  var ACCEPT = ['srt', 'vtt', 'ass', 'ssa', 'sbv'];
  var MAX_SIZE = 20 * 1024 * 1024;
  var slots = { a: null, b: null };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function radio(name) { var r = document.querySelector('input[name="' + name + '"]:checked'); return r ? r.value : null; }

  function loadSlot(key, file) {
    var ext = F.extOf(file.name);
    if (ACCEPT.indexOf(ext) === -1) { showMsg(t('q1', '「') + file.name + t('unsupported', '」不是支援的格式（支援 SRT、VTT、ASS、SSA、SBV）。')); return; }
    if (file.size > MAX_SIZE) { showMsg(t('q1', '「') + file.name + t('tooBig', '」超過 20MB，看來不是字幕檔案。')); return; }
    file.arrayBuffer().then(function (buf) {
      var bytes = new Uint8Array(buf);
      var enc = E.detectEncoding(bytes).encoding;
      var text = E.decode(bytes, enc, false) || '';
      slots[key] = { name: file.name, cues: F.parse(text, file.name, { skipComments: true, skipDrawings: true }) };
      render();
    });
  }

  function showMsg(text) {
    var p = el('p', 'status status-warn', text);
    $('messages').appendChild(p);
    setTimeout(function () { p.remove(); }, 9000);
  }

  function renderSlot(key) {
    var info = $('info-' + key), s = slots[key];
    info.innerHTML = '';
    if (!s) { info.appendChild(el('span', 'hint', t('noFile', '尚未選擇檔案'))); return; }
    info.appendChild(el('strong', 'file-name', s.name));
    info.appendChild(el('span', 'badge ' + (s.cues.length ? 'badge-high' : 'badge-low'), t('cuesPre', '共 ') + s.cues.length + t('cuesPost', ' 句')));
  }

  function result() {
    if (!slots.a || !slots.b) return null;
    var cues = M.merge(slots.a.cues, slots.b.cues, { oneLine: $('opt-oneline').checked, keepUnmatched: $('opt-unmatched').checked });
    var fmt = radio('fmt'), top = radio('top');
    return { cues: cues, fmt: fmt, text: fmt === 'ass' ? M.toASS(cues, top) : M.toSRT(cues, top) };
  }

  function outName(fmt) {
    var base = slots.a.name.replace(/\.[^.]+$/, '');
    return base + '.' + t('suffix', 'bilingual') + '.' + fmt;
  }

  function render() {
    renderSlot('a'); renderSlot('b');
    var r = result(), out = $('output');
    out.hidden = !r;
    if (!r) return;
    var matched = r.cues.filter(function (c) { return c.a && c.b; }).length;
    $('summary').textContent = t('sumPre', '合併後共 ') + r.cues.length + t('sumMid', ' 句，其中 ') + matched + t('sumPost', ' 句成功配對兩種語言。');
    var preview = M.toSRT(r.cues.slice(0, 6), radio('top')).trim();
    $('preview').textContent = preview + (r.cues.length > 6 ? '\n\n⋯' : '');
  }

  function download() {
    var r = result(); if (!r) return;
    var bytes = E.encodeUTF8(r.text, $('opt-bom').checked);
    var blob = new Blob([bytes], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = outName(r.fmt);
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  ['a', 'b'].forEach(function (key) {
    var drop = $('drop-' + key), input = $('file-' + key);
    input.addEventListener('change', function () { if (input.files[0]) loadSlot(key, input.files[0]); input.value = ''; });
    ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('drag'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('drag'); }); });
    drop.addEventListener('drop', function (e) {
      var files = e.dataTransfer && e.dataTransfer.files;
      if (!files || !files.length) return;
      loadSlot(key, files[0]);
      if (files.length > 1) loadSlot(key === 'a' ? 'b' : 'a', files[1]);   // 一次拖兩個檔：自動分配
    });
    drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
  });
  $('swap').addEventListener('click', function () { var x = slots.a; slots.a = slots.b; slots.b = x; render(); });
  Array.prototype.forEach.call(document.querySelectorAll('#merge-opts input'), function (i) { i.addEventListener('change', render); });
  $('download').addEventListener('click', download);
  render();
})();
