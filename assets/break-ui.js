/* 字幕斷句：介面邏輯 */
(function () {
  'use strict';
  var E = window.ZimuFixEncoding, Z = window.ZimuFixZip, F = window.ZimuFormat, B = window.ZimuBreak;
  var $ = function (id) { return document.getElementById(id); };
  var ACCEPT = ['srt', 'vtt', 'ass', 'ssa', 'sbv'];
  var MAX_SIZE = 20 * 1024 * 1024;
  var PRESETS = { 'v12-1': [12, 1], 'v12-2': [12, 2], 'h16-2': [16, 2], 'en': [21, 2] };
  var items = [];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function opts() {
    return { maxW: parseFloat($('max-w').value) || 12, maxLines: parseInt($('max-lines').value, 10) || 1, punctToSpace: $('opt-punct').checked };
  }
  function outName(name) { return name.replace(/\.[^.]+$/, '') + '.srt'; }

  function process(item) {
    var text = E.decode(item.bytes, item.encoding, false) || '';
    var cues = F.parse(text, item.name, { skipComments: true, skipDrawings: true });
    return B.breakCues(cues, opts());
  }

  function previewCues(cues) {
    return cues.slice(0, 5).map(function (c) { return c.text; }).join('\n────\n') + (cues.length > 5 ? '\n⋯' : '');
  }

  function download(name, bytes, type) {
    var blob = new Blob([bytes], { type: type || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function render() {
    var list = $('results');
    list.innerHTML = '';
    $('bulk-actions').hidden = items.length === 0;
    $('zip-all').hidden = items.length < 2;
    items.forEach(function (item, idx) {
      var text = E.decode(item.bytes, item.encoding, false) || '';
      var original = F.parse(text, item.name, { skipComments: true, skipDrawings: true });
      var r = process(item);
      var card = el('div', 'file-card');
      var head = el('div', 'file-head');
      head.appendChild(el('strong', 'file-name', item.name + ' → ' + outName(item.name)));
      head.appendChild(el('span', 'badge badge-high', r.stats.before + ' 句 → ' + r.stats.after + ' 句'));
      card.appendChild(head);
      card.appendChild(el('p', 'status status-fix', '斷行 ' + r.stats.wrapped + ' 句，其中 ' + r.stats.split + ' 句因為太長拆開成多句，時間按字數比例分配。'));
      var row = el('div', 'file-row');
      var btn = el('button', 'btn btn-primary', '下載斷句後字幕');
      btn.type = 'button';
      btn.addEventListener('click', function () { download(outName(item.name), E.encodeUTF8(B.toSRT(process(item).cues), $('opt-bom').checked)); });
      row.appendChild(btn);
      var rm = el('button', 'btn btn-ghost', '移除');
      rm.type = 'button';
      rm.addEventListener('click', function () { items.splice(idx, 1); render(); });
      row.appendChild(rm);
      card.appendChild(row);
      var grid = el('div', 'compare');
      var a = el('div'); a.appendChild(el('div', 'preview-label', '斷句前')); a.appendChild(el('pre', 'preview', previewCues(original)));
      var b = el('div'); b.appendChild(el('div', 'preview-label', '斷句後')); b.appendChild(el('pre', 'preview phone', previewCues(r.cues)));
      grid.appendChild(a); grid.appendChild(b);
      card.appendChild(grid);
      list.appendChild(card);
    });
  }

  function msg(text) {
    var p = el('p', 'status status-warn', text);
    $('messages').appendChild(p);
    setTimeout(function () { p.remove(); }, 9000);
  }

  function handleFiles(fileList) {
    var files = Array.prototype.slice.call(fileList), pending = files.length;
    if (!pending) return;
    files.forEach(function (file) {
      if (ACCEPT.indexOf(F.extOf(file.name)) === -1) { msg('「' + file.name + '」不是支援的格式（支援 SRT、VTT、ASS、SSA、SBV）。'); if (--pending === 0) render(); return; }
      if (file.size > MAX_SIZE) { msg('「' + file.name + '」超過 20MB，看來不是字幕檔案。'); if (--pending === 0) render(); return; }
      file.arrayBuffer().then(function (buf) {
        var bytes = new Uint8Array(buf);
        items.push({ name: file.name, bytes: bytes, encoding: E.detectEncoding(bytes).encoding });
        if (--pending === 0) render();
      });
    });
  }

  $('preset').addEventListener('change', function () {
    var p = PRESETS[this.value];
    if (p) { $('max-w').value = p[0]; $('max-lines').value = String(p[1]); }
    render();
  });
  ['max-w', 'max-lines'].forEach(function (id) {
    $(id).addEventListener('input', function () { $('preset').value = 'custom'; render(); });
  });
  $('opt-punct').addEventListener('change', render);
  var drop = $('drop'), input = $('file-input');
  input.addEventListener('change', function () { handleFiles(input.files); input.value = ''; });
  ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('drag'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('drag'); }); });
  drop.addEventListener('drop', function (e) { if (e.dataTransfer && e.dataTransfer.files) handleFiles(e.dataTransfer.files); });
  drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
  $('zip-all').addEventListener('click', function () {
    var used = {};
    var files = items.map(function (item) {
      var name = outName(item.name);
      if (used[name]) { var n = used[name]++; name = name.replace(/(\.[^.]+)$/, '(' + n + ')$1'); } else used[name] = 1;
      return { name: name, data: E.encodeUTF8(B.toSRT(process(item).cues), $('opt-bom').checked) };
    });
    download('字幕斷句.zip', Z.makeZip(files), 'application/zip');
  });
  $('clear-all').addEventListener('click', function () { items = []; render(); });
})();
