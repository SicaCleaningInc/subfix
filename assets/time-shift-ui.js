/* 字幕時間軸調整：介面邏輯 */
(function () {
  'use strict';
  var E = window.ZimuFixEncoding;
  var Z = window.ZimuFixZip;
  var TM = window.ZimuTime;
  var MAX_SIZE = 20 * 1024 * 1024;

  var drop = document.getElementById('drop');
  var input = document.getElementById('file-input');
  var list = document.getElementById('results');
  var bomBox = document.getElementById('opt-bom');
  var zipBtn = document.getElementById('zip-all');
  var clearBtn = document.getElementById('clear-all');
  var actions = document.getElementById('bulk-actions');
  var offsetIn = document.getElementById('offset');
  var fpsSel = document.getElementById('fps');
  var summary = document.getElementById('summary');
  var msgBox = document.getElementById('messages');

  var items = [];
  var STR = window.ZIMU_STRINGS || {};
  function t(k, d) { return STR[k] != null ? STR[k] : d; }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function offsetMs() {
    var v = parseFloat(offsetIn.value);
    return isFinite(v) ? Math.round(v * 1000) : 0;
  }
  /* 毫秒轉為秒的字串，最多三位小數，去掉尾隨的 0（1100 → "1.1"） */
  function fmtSec(ms) {
    var neg = ms < 0, a = Math.abs(ms), s = String(Math.floor(a / 1000)), f = a % 1000;
    if (f) s += '.' + ('00' + f).slice(-3).replace(/0+$/, '');
    return (neg ? '-' : '') + s;
  }
  function scale() {
    var p = fpsSel.value.split('/');
    return p.length === 2 ? parseFloat(p[0]) / parseFloat(p[1]) : 1;
  }

  function updateSummary() {
    var ms = offsetMs(), parts = [];
    if (ms > 0) parts.push(t('later', '延後 ') + fmtSec(ms) + t('sec', ' 秒'));
    else if (ms < 0) parts.push(t('earlier', '提前 ') + fmtSec(-ms) + t('sec', ' 秒'));
    if (scale() !== 1) parts.push(t('fps', '幀率轉換：') + fpsSel.options[fpsSel.selectedIndex].text);
    summary.textContent = parts.length ? t('current', '目前設定：') + parts.join(t('join', '，')) : t('none', '目前設定：不作調整');
  }

  function timingLines(text) {
    return text.replace(/^﻿/, '').split(/\r?\n/).filter(function (l) {
      return /-->/.test(l) || /^(Dialogue|Comment):/.test(l) || /^\d+:\d{2}:\d{2}\.\d{3},/.test(l) ||
        /^\[\d{1,3}:\d{2}/.test(l) || /<SYNC/i.test(l);
    }).map(function (l) {
      var m = /^(?:Dialogue|Comment):\s*[^,]*,([^,]*),([^,]*),/.exec(l);
      if (m) return m[1] + ' → ' + m[2];
      return l.length > 60 ? l.slice(0, 60) + '…' : l;
    });
  }

  function previewOf(text) {
    var lines = timingLines(text);
    if (!lines.length) return t('noTime', '（找不到時間碼）');
    if (lines.length <= 4) return lines.join('\n');
    return lines.slice(0, 3).join('\n') + '\n⋯\n' + lines[lines.length - 1] + t('last', '（最後一句）');
  }

  function download(name, bytes, type) {
    var blob = new Blob([bytes], { type: type || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function shifted(item) {
    var text = E.decode(item.bytes, item.encoding, false) || '';
    return TM.shiftSubtitle(text, item.name, offsetMs(), scale());
  }

  function render() {
    updateSummary();
    list.innerHTML = '';
    actions.hidden = items.length === 0;
    zipBtn.hidden = items.length < 2;
    items.forEach(function (item, idx) {
      var card = el('div', 'file-card');
      var head = el('div', 'file-head');
      head.appendChild(el('strong', 'file-name', item.name));
      card.appendChild(head);

      var row = el('div', 'file-row');
      var btn = el('button', 'btn btn-primary', t('download', '下載調整後字幕'));
      btn.type = 'button';
      btn.addEventListener('click', function () {
        download(item.name, E.encodeUTF8(shifted(item), bomBox.checked));
      });
      row.appendChild(btn);
      var rm = el('button', 'btn btn-ghost', t('remove', '移除'));
      rm.type = 'button';
      rm.addEventListener('click', function () { items.splice(idx, 1); render(); });
      row.appendChild(rm);
      card.appendChild(row);

      var grid = el('div', 'compare');
      var a = el('div');
      a.appendChild(el('div', 'preview-label', t('before', '調整前')));
      a.appendChild(el('pre', 'preview mono', previewOf(E.decode(item.bytes, item.encoding, false) || '')));
      var b = el('div');
      b.appendChild(el('div', 'preview-label', t('after', '調整後')));
      b.appendChild(el('pre', 'preview mono', previewOf(shifted(item))));
      grid.appendChild(a); grid.appendChild(b);
      card.appendChild(grid);
      list.appendChild(card);
    });
  }

  function alertLine(text) {
    var p = el('p', 'status status-warn', text);
    msgBox.appendChild(p);
    setTimeout(function () { p.remove(); }, 10000);
  }

  function handleFiles(fileList) {
    var files = Array.prototype.slice.call(fileList);
    var pending = files.length;
    if (!pending) return;
    files.forEach(function (file) {
      var ext = TM.extOf(file.name);
      if (!TM.SUPPORTED[ext]) {
        alertLine(t('q1', '「') + file.name + t('unsupported', '」暫不支援。本工具支援 SRT、VTT、ASS、SSA、SBV、LRC、SMI；以影格計算的 SUB（MicroDVD）字幕暫不適用。'));
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

  var timer = null;
  function scheduleRender() { clearTimeout(timer); timer = setTimeout(render, 120); }
  offsetIn.addEventListener('input', scheduleRender);
  fpsSel.addEventListener('change', render);
  Array.prototype.forEach.call(document.querySelectorAll('[data-delta]'), function (b) {
    b.addEventListener('click', function () {
      /* 以整數毫秒計算，避免浮點誤差（例如 1 + 0.1 = 1.100000023…） */
      var ms = offsetMs() + Math.round(parseFloat(b.getAttribute('data-delta')) * 1000);
      offsetIn.value = fmtSec(ms);
      render();
    });
  });
  document.getElementById('reset-offset').addEventListener('click', function () {
    offsetIn.value = 0; fpsSel.value = '1'; render();
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
      var name = item.name;
      if (used[name]) { var n = used[name]++; name = name.replace(/(\.[^.]+)$/, '(' + n + ')$1'); } else used[name] = 1;
      return { name: name, data: E.encodeUTF8(shifted(item), bomBox.checked) };
    });
    download(t('zipName', '字幕時間軸調整.zip'), Z.makeZip(files), 'application/zip');
  });
  clearBtn.addEventListener('click', function () { items = []; render(); });

  updateSummary();
})();
