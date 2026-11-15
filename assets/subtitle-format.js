/*
 * ZimuFix — 字幕格式解析及轉換
 * 讀取：SRT、VTT、ASS/SSA、SBV → 統一嘅字幕句子列表 [{start, end, text}]（毫秒）
 * 輸出：SRT、TXT
 */
(function (root) {
  'use strict';

  function pad(n, w) { n = String(n); while (n.length < w) n = '0' + n; return n; }

  function parseClock(s) {
    var m = /^(?:(\d+):)?(\d{1,2}):(\d{2})[,.](\d{1,3})$/.exec(s.trim());
    if (!m) return null;
    var frac = m[4];
    while (frac.length < 3) frac += '0';
    return ((+m[1] || 0) * 3600 + (+m[2]) * 60 + (+m[3])) * 1000 + (+frac);
  }

  function srtTime(ms) {
    ms = Math.max(0, Math.round(ms));
    var h = Math.floor(ms / 3600000); ms -= h * 3600000;
    var m = Math.floor(ms / 60000); ms -= m * 60000;
    var s = Math.floor(ms / 1000); ms -= s * 1000;
    return pad(h, 2) + ':' + pad(m, 2) + ':' + pad(s, 2) + ',' + pad(ms, 3);
  }

  function decodeEntities(t) {
    return t.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  }

  // SRT 同 VTT：以空行分段，每段搵含「-->」嗰行
  function parseBlocks(text, isVTT) {
    var cues = [];
    text.replace(/\r\n?/g, '\n').split(/\n[ \t]*\n+/).forEach(function (block) {
      var lines = block.split('\n');
      var ti = -1;
      for (var i = 0; i < lines.length; i++) if (lines[i].indexOf('-->') !== -1) { ti = i; break; }
      if (ti === -1) return;
      var parts = lines[ti].split('-->');
      var start = parseClock(parts[0]);
      var end = parseClock((parts[1] || '').trim().split(/\s+/)[0] || '');
      if (start === null || end === null) return;
      var body = lines.slice(ti + 1).join('\n');
      if (isVTT) {
        body = body.replace(/<\d{1,2}:\d{2}(?::\d{2})?\.\d{3}>/g, '')      // 卡拉 OK 時間標籤
                   .replace(/<v(?:\.[^\s>]*)?\s+([^>]*)>/g, '')               // <v 講者>
                   .replace(/<\/?(?:c|v|lang|ruby|rt)(?:\.[^>]*)?(?:\s[^>]*)?>/g, '');
        body = decodeEntities(body);
      }
      cues.push({ start: start, end: end, text: body });
    });
    return cues;
  }

  function parseSBV(text) {
    var cues = [];
    text.replace(/\r\n?/g, '\n').split(/\n[ \t]*\n+/).forEach(function (block) {
      var lines = block.split('\n');
      var m = /^(\d+:\d{2}:\d{2}\.\d{3}),(\d+:\d{2}:\d{2}\.\d{3})\s*$/.exec(lines[0] || '');
      if (!m) return;
      cues.push({ start: parseClock(m[1]), end: parseClock(m[2]), text: lines.slice(1).join('\n') });
    });
    return cues;
  }

  // ASS/SSA：按 [Events] 嘅 Format 行搵 Start、End、Text 欄位
  function assClock(s) {
    var m = /^(\d+):(\d{2}):(\d{2})\.(\d{2})$/.exec(s.trim());
    return m ? ((+m[1]) * 3600 + (+m[2]) * 60 + (+m[3])) * 1000 + (+m[4]) * 10 : null;
  }

  function parseASS(text, opts) {
    opts = opts || {};
    var lines = text.replace(/\r\n?/g, '\n').split('\n');
    var fmt = ['layer', 'start', 'end', 'style', 'name', 'marginl', 'marginr', 'marginv', 'effect', 'text'];
    var inEvents = false, cues = [];
    lines.forEach(function (line) {
      var sec = /^\s*\[(.+)\]\s*$/.exec(line);
      if (sec) { inEvents = sec[1].toLowerCase() === 'events'; return; }
      if (!inEvents) return;
      var f = /^Format:\s*(.*)$/i.exec(line);
      if (f) { fmt = f[1].split(',').map(function (x) { return x.trim().toLowerCase(); }); return; }
      var d = /^(Dialogue|Comment):\s*(.*)$/.exec(line);
      if (!d) return;
      if (d[1] === 'Comment' && opts.skipComments !== false) return;
      var fields = [], rest = d[2];
      for (var i = 0; i < fmt.length - 1; i++) {
        var c = rest.indexOf(',');
        if (c === -1) return;
        fields.push(rest.slice(0, c)); rest = rest.slice(c + 1);
      }
      fields.push(rest);
      var get = function (k) { var i = fmt.indexOf(k); return i === -1 ? '' : fields[i]; };
      var raw = get('text');
      if (opts.skipDrawings !== false && /\{[^}]*\\p[1-9]/.test(raw)) return;   // 繪圖指令，唔係對白
      var body = raw.replace(/\{[^}]*\}/g, '').replace(/\\N/g, '\n').replace(/\\n/g, '\n').replace(/\\h/g, ' ');
      var start = assClock(get('start')), end = assClock(get('end'));
      if (start === null || end === null || !body.trim()) return;
      cues.push({ start: start, end: end, text: body });
    });
    cues.sort(function (a, b) { return a.start - b.start || a.end - b.end; });
    return cues;
  }

  function extOf(name) {
    var m = /\.([^.]+)$/.exec(name || '');
    return m ? m[1].toLowerCase() : '';
  }

  function parse(text, filename, opts) {
    text = text.replace(/^﻿/, '');
    var ext = extOf(filename);
    if (ext === 'ass' || ext === 'ssa') return parseASS(text, opts);
    if (ext === 'sbv') return parseSBV(text);
    if (ext === 'vtt' || /^WEBVTT/.test(text)) return parseBlocks(text, true);
    return parseBlocks(text, false);
  }

  function stripTags(t) { return t.replace(/<[^>]+>/g, '').replace(/\{[^}]*\}/g, ''); }

  function toSRT(cues) {
    return cues.map(function (c, i) {
      var body = c.text.replace(/<(?!\/?(?:i|b|u|font)\b)[^>]*>/g, '').replace(/^\s+|\s+$/g, '');
      return (i + 1) + '\n' + srtTime(c.start) + ' --> ' + srtTime(c.end) + '\n' + body;
    }).join('\n\n') + '\n';
  }

  /** opts: oneLine（句內換行合併）, dedupe（移除連續重複）, blankBetween（句與句之間留空行） */
  function toTXT(cues, opts) {
    opts = opts || {};
    var out = [], last = null;
    cues.forEach(function (c) {
      var t = stripTags(c.text).split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
      if (!t.length) return;
      var line = opts.oneLine ? t.join(' ') : t.join('\n');
      if (opts.dedupe && line === last) return;
      last = line;
      out.push(line);
    });
    return out.join(opts.blankBetween ? '\n\n' : '\n') + '\n';
  }

  function replaceExt(name, ext) {
    return /\.[^.]+$/.test(name) ? name.replace(/\.[^.]+$/, '.' + ext) : name + '.' + ext;
  }

  var api = { parse: parse, toSRT: toSRT, toTXT: toTXT, replaceExt: replaceExt, extOf: extOf };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ZimuFormat = api;
})(this);
