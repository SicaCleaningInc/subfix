/* 字幕格式轉換：介面邏輯（SRT 轉 TXT、VTT 轉 SRT、ASS 轉 SRT 共用，設定由 window.ZIMU_FMT_CONFIG 提供） */
(function () {
  'use strict';
  var CFG = window.ZIMU_FMT_CONFIG;
  var E = window.ZimuFixEncoding;
  var Z = window.ZimuFixZip;
  var F = window.ZimuFormat;
  var MAX_SIZE = 20 * 1024 * 1024;

  var $ = function (id) { return document.getElementById(id); };
  var drop = $('drop'), input = $('file-input'), list = $('results'), bomBox = $('opt-bom');
  var zipBtn = $('zip-all'), clearBtn = $('clear-all'), actions = $('bulk-actions'), msgBox = $('messages');
  var items = [];
  var STR = window.ZIMU_STRINGS || {};
  function t(k, d) { return STR[k] != null ? STR[k] : d; }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function checked(id) { var b = $(id); return b ? b.checked : false; }

  function convert(item) {
    var text = E.decode(item.bytes, item.encoding, false) || '';
    var cues = F.parse(text, item.name, { skipComments: true, skipDrawings: $('opt-skip') ? checked('opt-skip') : true });
    var out = CFG.output === 'txt'
      ? F.toTXT(cues, { oneLine: checked('opt-oneline'), dedupe: checked('opt-dedupe'), blankBetween: checked('opt-blank') })
      : F.toSRT(cues);
    return { cues: cues, out: out };
  }

  function download(name, bytes, type) {
    var blob = new Blob([bytes], { type: type || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function copyText(text, btn) {
    var done = function () { var o = btn.textContent; btn.textContent = t('copied', '已複製 ✓'); setTimeout(function () { btn.textContent = o; }, 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
    else {
      var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove(); done();
    }
  }

  function render() {
    list.innerHTML = '';
    actions.hidden = items.length === 0;
    zipBtn.hidden = items.length < 2;
    items.forEach(function (item, idx) {
      var r = convert(item);
      var card = el('div', 'file-card');
      var head = el('div', 'file-head');
      head.appendChild(el('strong', 'file-name', item.name + ' → ' + F.replaceExt(item.name, CFG.output)));
      head.appendChild(el('span', 'badge ' + (r.cues.length ? 'badge-high' : 'badge-low'), t('cuesPre', '共 ') + r.cues.length + t('cuesPost', ' 句')));
      card.appendChild(head);
      if (!r.cues.length) card.appendChild(el('p', 'status status-warn', t('noCues', '找不到任何字幕句子，請確認檔案格式是否正確。')));

      var row = el('div', 'file-row');
      var btn = el('button', 'btn btn-primary', t('downloadPre', '下載 ') + CFG.output.toUpperCase());
      btn.type = 'button';
      btn.addEventListener('click', function () {
        download(F.replaceExt(item.name, CFG.output), E.encodeUTF8(convert(item).out, bomBox.checked));
      });
      row.appendChild(btn);
      if (CFG.output === 'txt') {
        var cp = el('button', 'btn', t('copyAll', '複製全部文字'));
        cp.type = 'button';
        cp.addEventListener('click', function () { copyText(convert(item).out, cp); });
        row.appendChild(cp);
      }
      var rm = el('button', 'btn btn-ghost', t('remove', '移除'));
      rm.type = 'button';
      rm.addEventListener('click', function () { items.splice(idx, 1); render(); });
      row.appendChild(rm);
      card.appendChild(row);

      var lines = r.out.split('\n');
      card.appendChild(el('div', 'preview-label', t('preview', '轉換結果預覽')));
      card.appendChild(el('pre', 'preview' + (CFG.output === 'srt' ? ' mono' : ''),
        lines.slice(0, 14).join('\n') + (lines.length > 15 ? '\n⋯' : '')));
      list.appendChild(card);
    });
  }

  function alertLine(text) {
    var p = el('p', 'status status-warn', text);
    msgBox.appendChild(p);
    setTimeout(function () { p.remove(); }, 9000);
  }

  function handleFiles(fileList) {
    var files = Array.prototype.slice.call(fileList);
    var pending = files.length;
    if (!pending) return;
    files.forEach(function (file) {
      var ext = F.extOf(file.name);
      if (CFG.accept.indexOf(ext) === -1) {
        alertLine(t('q1', '「') + file.name + t('unsupported', '」不是本工具支援的格式（支援 ') + CFG.accept.join(t('sep', '、')).toUpperCase() + t('unsupportedEnd', '）。'));
        if (--pending === 0) render();
        return;
      }
      if (file.size > MAX_SIZE) {
        alertLine(t('q1', '「') + file.name + t('tooBig', '」超過 20MB，看來不是字幕檔案。'));
        if (--pending === 0) render();
        return;
      }
      file.arrayBuffer().then(function (buf) {
        var bytes = new Uint8Array(buf);
        items.push({ name: file.name, bytes: bytes, encoding: E.detectEncoding(bytes).encoding });
        if (--pending === 0) render();
      });
    });
  }

  ['opt-oneline', 'opt-dedupe', 'opt-blank', 'opt-skip'].forEach(function (id) {
    var b = $(id); if (b) b.addEventListener('change', render);
  });
  input.addEventListener('change', function () { handleFiles(input.files); input.value = ''; });
  ['dragenter', 'dragover'].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('drag'); });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('drag'); });
  });
  drop.addEventListener('drop', function (e) { if (e.dataTransfer && e.dataTransfer.files) handleFiles(e.dataTransfer.files); });
  drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });

  zipBtn.addEventListener('click', function () {
    var used = {};
    var files = items.map(function (item) {
      var name = F.replaceExt(item.name, CFG.output);
      if (used[name]) { var n = used[name]++; name = name.replace(/(\.[^.]+)$/, '(' + n + ')$1'); } else used[name] = 1;
      return { name: name, data: E.encodeUTF8(convert(item).out, bomBox.checked) };
    });
    download(CFG.zipName, Z.makeZip(files), 'application/zip');
  });
  clearBtn.addEventListener('click', function () { items = []; render(); });
})();
