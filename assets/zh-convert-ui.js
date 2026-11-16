/* 字幕繁簡轉換：介面邏輯（簡轉繁、繁轉簡共用，設定由頁面嘅 window.ZIMU_ZH_CONFIG 提供） */
(function () {
  'use strict';
  var CFG = window.ZIMU_ZH_CONFIG;
  var E = window.ZimuFixEncoding;
  var Z = window.ZimuFixZip;
  var ZH = window.ZimuZh;
  var MAX_SIZE = 20 * 1024 * 1024;
  var ACCEPT = /\.(srt|ass|ssa|vtt|sub|txt|lrc|smi|sbv)$/i;

  var drop = document.getElementById('drop');
  var input = document.getElementById('file-input');
  var list = document.getElementById('results');
  var bomBox = document.getElementById('opt-bom');
  var tagBox = document.getElementById('opt-tag');
  var zipBtn = document.getElementById('zip-all');
  var clearBtn = document.getElementById('clear-all');
  var actions = document.getElementById('bulk-actions');
  var variantBox = document.getElementById('variants');
  var textIn = document.getElementById('text-in');
  var textOut = document.getElementById('text-out');
  var copyBtn = document.getElementById('copy-out');
  var msgBox = document.getElementById('messages');

  var items = [];
  var STR = window.ZIMU_STRINGS || {};
  function t(k, d) { return STR[k] != null ? STR[k] : d; }
  // 按瀏覽器語言揀預設選項，例如台灣用戶預設「台灣正體＋台灣用詞」
  function defaultIndex() {
    var langs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || ''];
    for (var a = 0; a < langs.length; a++) {
      var l = String(langs[a]).toLowerCase();
      for (var i = 0; i < CFG.variants.length; i++) {
        var locs = CFG.variants[i].locales || [];
        if (locs.indexOf(l) !== -1) return i;
      }
    }
    return 0;
  }
  var current = CFG.variants[defaultIndex()];
  var converters = {};

  function getConv() {
    var key = current.from + '>' + current.to;
    if (!converters[key]) converters[key] = window.OpenCC.Converter({ from: current.from, to: current.to });
    return converters[key];
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function labelOf(enc) {
    var map = t('enc', null); if (map && map[enc]) return map[enc];
    for (var i = 0; i < E.MANUAL_ENCODINGS.length; i++) if (E.MANUAL_ENCODINGS[i].id === enc) return E.MANUAL_ENCODINGS[i].label;
    return enc;
  }

  function dialogueLines(text, n) {
    return text.replace(/^﻿/, '').split(/\r?\n/).filter(function (l) {
      var t = l.trim();
      return t && !/^\d+$/.test(t) && !/-->/.test(t) && !/^\[.*\]$/.test(t) &&
        !/^(Style|Format|Title|ScriptType|PlayRes|WrapStyle|ScaledBorder|YCbCr|WEBVTT)/i.test(t);
    }).map(function (l) {
      var m = /^Dialogue:(?:[^,]*,){9}(.*)$/.exec(l);
      return m ? m[1].replace(/\{[^}]*\}/g, '') : l;
    }).slice(0, n);
  }

  function outName(name) {
    return tagBox.checked ? ZH.addLangTag(name, CFG.langTag) : name;
  }

  function download(name, bytes, type) {
    var blob = new Blob([bytes], { type: type || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function convertItem(item) {
    var text = E.decode(item.bytes, item.encoding, false) || '';
    return ZH.convertSubtitle(text, item.name, getConv());
  }

  function render() {
    list.innerHTML = '';
    actions.hidden = items.length === 0;
    zipBtn.hidden = items.length < 2;

    items.forEach(function (item, idx) {
      var card = el('div', 'file-card');
      var head = el('div', 'file-head');
      head.appendChild(el('strong', 'file-name', item.name));
      head.appendChild(el('span', 'badge badge-' + item.detection.confidence, t('origEnc', '原本編碼：') + labelOf(item.encoding)));
      card.appendChild(head);

      var row = el('div', 'file-row');
      var lab = el('label', null, t('origEnc', '原本編碼：'));
      var sel = el('select');
      E.MANUAL_ENCODINGS.forEach(function (m) {
        var o = el('option', null, labelOf(m.id));
        o.value = m.id;
        if (m.id === item.encoding) o.selected = true;
        sel.appendChild(o);
      });
      sel.addEventListener('change', function () { item.encoding = sel.value; render(); });
      lab.appendChild(sel);
      row.appendChild(lab);

      var btn = el('button', 'btn btn-primary', t('download', '下載轉換後字幕'));
      btn.type = 'button';
      btn.addEventListener('click', function () {
        download(outName(item.name), E.encodeUTF8(convertItem(item), bomBox.checked));
      });
      row.appendChild(btn);

      var rm = el('button', 'btn btn-ghost', t('remove', '移除'));
      rm.type = 'button';
      rm.addEventListener('click', function () { items.splice(idx, 1); render(); });
      row.appendChild(rm);
      card.appendChild(row);

      var original = E.decode(item.bytes, item.encoding, false) || '';
      var grid = el('div', 'compare');
      var a = el('div');
      a.appendChild(el('div', 'preview-label', t('before', '轉換前')));
      a.appendChild(el('pre', 'preview', dialogueLines(original, 6).join('\n') || t('empty', '（沒有內容）')));
      var b = el('div');
      b.appendChild(el('div', 'preview-label', t('after', '轉換後（') + current.label + t('afterEnd', '）')));
      b.appendChild(el('pre', 'preview', dialogueLines(convertItem(item), 6).join('\n') || t('empty', '（沒有內容）')));
      grid.appendChild(a); grid.appendChild(b);
      card.appendChild(grid);
      list.appendChild(card);
    });
  }

  function alertLine(text) {
    var p = el('p', 'status status-warn', text);
    msgBox.appendChild(p);
    setTimeout(function () { p.remove(); }, 8000);
  }

  function handleFiles(fileList) {
    var files = Array.prototype.slice.call(fileList);
    var pending = files.length;
    if (!pending) return;
    files.forEach(function (file) {
      if (!ACCEPT.test(file.name)) {
        alertLine(t('q1', '「') + file.name + t('unsupported', '」不是支援的字幕格式。'));
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
        var det = E.detectEncoding(bytes);
        items.push({ name: file.name, bytes: bytes, detection: det, encoding: det.encoding });
        if (--pending === 0) render();
      });
    });
  }

  // 轉換方式選項
  CFG.variants.forEach(function (v, i) {
    var lab = el('label', 'variant');
    var r = el('input');
    r.type = 'radio'; r.name = 'variant'; r.value = i;
    if (v === current) r.checked = true;
    r.addEventListener('change', function () {
      current = CFG.variants[i];
      render();
      convertText();
    });
    lab.appendChild(r);
    var span = el('span');
    span.appendChild(el('strong', null, v.label));
    span.appendChild(el('small', null, v.hint));
    lab.appendChild(span);
    variantBox.appendChild(lab);
  });

  // 貼上文字模式
  var timer = null;
  function convertText() {
    textOut.value = textIn.value ? getConv()(textIn.value) : '';
  }
  textIn.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(convertText, 150);
  });
  copyBtn.addEventListener('click', function () {
    if (!textOut.value) return;
    var done = function () {
      copyBtn.textContent = t('copied', '已複製 ✓');
      setTimeout(function () { copyBtn.textContent = t('copy', '複製結果'); }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textOut.value).then(done, function () { textOut.select(); document.execCommand('copy'); done(); });
    } else { textOut.select(); document.execCommand('copy'); done(); }
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
      var name = outName(item.name);
      if (used[name]) { var n = used[name]++; name = name.replace(/(\.[^.]+)$/, '(' + n + ')$1'); } else used[name] = 1;
      return { name: name, data: E.encodeUTF8(convertItem(item), bomBox.checked) };
    });
    download(CFG.zipName, Z.makeZip(files), 'application/zip');
  });
  clearBtn.addEventListener('click', function () { items = []; render(); });
})();
