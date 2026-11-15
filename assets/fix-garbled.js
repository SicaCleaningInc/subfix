/* 字幕亂碼修復：介面邏輯 */
(function () {
  'use strict';
  var E = window.ZimuFixEncoding;
  var Z = window.ZimuFixZip;
  var MAX_SIZE = 20 * 1024 * 1024; // 20MB
  var ACCEPT = /\.(srt|ass|ssa|vtt|sub|txt|lrc|smi|sbv)$/i;

  var drop = document.getElementById('drop');
  var input = document.getElementById('file-input');
  var list = document.getElementById('results');
  var bomBox = document.getElementById('opt-bom');
  var zipBtn = document.getElementById('zip-all');
  var clearBtn = document.getElementById('clear-all');
  var actions = document.getElementById('bulk-actions');

  var items = [];

  function labelOf(enc) {
    for (var i = 0; i < E.MANUAL_ENCODINGS.length; i++) {
      if (E.MANUAL_ENCODINGS[i].id === enc) return E.MANUAL_ENCODINGS[i].label;
    }
    return enc;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function previewText(bytes, enc) {
    var text = E.decode(bytes, enc, false) || '';
    var lines = text.replace(/^﻿/, '').split(/\r?\n/).filter(function (l) {
      return l.trim() && !/^\d+$/.test(l.trim()) && !/-->/.test(l);
    });
    return lines.slice(0, 8).join('\n') || '（沒有內容）';
  }

  function download(name, bytes, type) {
    var blob = new Blob([bytes], { type: type || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function statusFor(item) {
    var d = item.detection;
    if (d.ascii) return { cls: 'ok', text: '這個檔案只有英文字元，沒有編碼問題。' };
    if (d.reason === 'valid-utf8' || (d.reason === 'bom' && d.encoding === 'utf-8')) {
      return {
        cls: 'ok',
        text: '這個檔案已經是 UTF-8。如果播放器仍然顯示亂碼，下載加入 BOM 的版本通常就能解決；如果仍然不行，請參考下方的播放器設定教學。'
      };
    }
    if (d.confidence === 'low') {
      return { cls: 'warn', text: '內容太少，無法確定編碼。請檢查下方預覽，如果文字不正常，請在選單選擇另一種編碼。' };
    }
    return { cls: 'fix', text: '偵測到原本是 ' + labelOf(d.encoding) + '，已轉換為 UTF-8。請檢查預覽，確認文字正常。' };
  }

  function render() {
    list.innerHTML = '';
    actions.hidden = items.length === 0;
    zipBtn.hidden = items.length < 2;

    items.forEach(function (item, idx) {
      var card = el('div', 'file-card');

      var head = el('div', 'file-head');
      head.appendChild(el('strong', 'file-name', item.name));
      var badge = el('span', 'badge badge-' + item.detection.confidence, '偵測：' + labelOf(item.detection.encoding));
      head.appendChild(badge);
      card.appendChild(head);

      var st = statusFor(item);
      card.appendChild(el('p', 'status status-' + st.cls, st.text));

      var row = el('div', 'file-row');
      var lab = el('label', null, '原本編碼：');
      var sel = el('select');
      E.MANUAL_ENCODINGS.forEach(function (m) {
        var o = el('option', null, m.label);
        o.value = m.id;
        if (m.id === item.encoding) o.selected = true;
        sel.appendChild(o);
      });
      sel.addEventListener('change', function () {
        item.encoding = sel.value;
        pre.textContent = previewText(item.bytes, item.encoding);
      });
      lab.appendChild(sel);
      row.appendChild(lab);

      var btn = el('button', 'btn btn-primary', '下載修復後字幕');
      btn.type = 'button';
      btn.addEventListener('click', function () {
        var out = E.convert(item.bytes, item.encoding, bomBox.checked);
        download(item.name, out.bytes);
      });
      row.appendChild(btn);

      var rm = el('button', 'btn btn-ghost', '移除');
      rm.type = 'button';
      rm.addEventListener('click', function () {
        items.splice(idx, 1);
        render();
      });
      row.appendChild(rm);
      card.appendChild(row);

      card.appendChild(el('div', 'preview-label', '預覽（頭幾句）：'));
      var pre = el('pre', 'preview', previewText(item.bytes, item.encoding));
      card.appendChild(pre);

      list.appendChild(card);
    });
  }

  function handleFiles(fileList) {
    var files = Array.prototype.slice.call(fileList);
    var pending = files.length;
    if (!pending) return;
    files.forEach(function (file) {
      if (!ACCEPT.test(file.name)) {
        alertLine('「' + file.name + '」不是支援的字幕格式（支援 SRT、ASS、SSA、VTT、SUB、TXT、LRC、SMI、SBV）。');
        if (--pending === 0) render();
        return;
      }
      if (file.size > MAX_SIZE) {
        alertLine('「' + file.name + '」超過 20MB，看來不是字幕檔案。');
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

  var msgBox = document.getElementById('messages');
  function alertLine(text) {
    var p = el('p', 'status status-warn', text);
    msgBox.appendChild(p);
    setTimeout(function () { p.remove(); }, 8000);
  }

  input.addEventListener('change', function () {
    handleFiles(input.files);
    input.value = '';
  });
  ['dragenter', 'dragover'].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('drag'); });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('drag'); });
  });
  drop.addEventListener('drop', function (e) {
    if (e.dataTransfer && e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  });
  drop.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
  });

  zipBtn.addEventListener('click', function () {
    var used = {};
    var files = items.map(function (item) {
      var name = item.name;
      if (used[name]) { // 避免同名檔案互相覆蓋
        var n = used[name]++;
        name = name.replace(/(\.[^.]+)$/, '(' + n + ')$1');
      } else used[name] = 1;
      return { name: name, data: E.convert(item.bytes, item.encoding, bomBox.checked).bytes };
    });
    download('字幕修復.zip', Z.makeZip(files), 'application/zip');
  });

  clearBtn.addEventListener('click', function () {
    items = [];
    render();
  });
})();
