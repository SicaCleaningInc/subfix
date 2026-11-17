/*
 * ZimuFix — 字幕斷句（直式短劇／短片用）
 * 中文、全形字計 1 個字寬，英文字母、數字、半形符號計 0.5 個字寬。
 * 超過每行字數就斷行；超過行數就拆成幾句，時間按字數比例分配。
 */
(function (root) {
  'use strict';

  var SOFT_AFTER = '，。！？、；：…,.!?;:）)」』】》”’';

  function charW(c) {
    var code = c.charCodeAt(0);
    if (code < 0x2e80) return code >= 0xff61 && code <= 0xff9f ? 0.5 : (code > 0x7f && code < 0x2000 ? 1 : 0.5);
    return 1;
  }
  function textW(s) { var w = 0; for (var i = 0; i < s.length; i++) w += charW(s[i]); return w; }
  function isWordChar(c) { return /[A-Za-z0-9'’\-]/.test(c); }

  /** 清理文字：移除標籤、合併原有換行 */
  function normalize(text, opts) {
    var t = text.replace(/<[^>]+>/g, '').replace(/\{[^}]*\}/g, '');
    var lines = t.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    var out = '';
    lines.forEach(function (l, i) {
      if (i === 0) { out = l; return; }
      var prev = out.charAt(out.length - 1), next = l.charAt(0);
      out += (isWordChar(prev) || isWordChar(next) || !SOFT_AFTER.includes(prev)) ? ' ' : '';
      out += l;
    });
    if (opts && opts.punctToSpace) {
      out = out.replace(/[，、；：]/g, ' ').replace(/[。．.]+$/g, '').replace(/。/g, ' ').replace(/ {2,}/g, ' ').trim();
    }
    return out;
  }

  /** 將一段文字按每行最大字寬斷行，優先喺標點或空格後斷 */
  function wrap(text, maxW) {
    var lines = [], cur = '', curW = 0, i = 0;
    while (i < text.length) {
      // 一個英文詞當一個單位，唔好斬開
      var unit = text[i];
      if (isWordChar(unit)) { var j = i; while (j < text.length && isWordChar(text[j])) j++; unit = text.slice(i, j); }
      var uw = textW(unit);
      // 標點唔可以放喺行首，超出少少都跟返上一行
      var hang = unit.length === 1 && SOFT_AFTER.indexOf(unit) !== -1;
      if (curW + uw > maxW && cur.trim() && !hang) {
        // 搵最後一個標點或空格位，條件係斷咗之後前半行唔會太短
        var best = -1;
        for (var k = cur.length - 1; k > 0; k--) {
          var ch = cur[k - 1];
          if (SOFT_AFTER.indexOf(ch) !== -1 || ch === ' ') {
            if (textW(cur.slice(0, k)) >= maxW * 0.4) best = k;
            break;
          }
        }
        if (best > 0) {
          lines.push(cur.slice(0, best).trim());
          cur = cur.slice(best).replace(/^\s+/, '');
        } else {
          lines.push(cur.trim());
          cur = '';
        }
        curW = textW(cur);
        if (unit === ' ' && !cur) { i += 1; continue; }
      }
      cur += unit; curW += uw; i += unit.length;
    }
    if (cur.trim()) lines.push(cur.trim());
    return lines;
  }

  /**
   * cues：[{start, end, text}]
   * opts：{ maxW, maxLines, punctToSpace }
   * 回傳 { cues, stats:{ before, after, wrapped, split } }
   */
  function breakCues(cues, opts) {
    var maxW = Math.max(4, opts.maxW || 14), maxLines = Math.max(1, opts.maxLines || 1);
    var out = [], wrapped = 0, split = 0;
    cues.forEach(function (c) {
      var t = normalize(c.text, opts);
      if (!t) return;
      var lines = wrap(t, maxW);
      if (lines.length > 1) wrapped++;
      var groups = [];
      for (var g = 0; g < lines.length; g += maxLines) groups.push(lines.slice(g, g + maxLines));
      if (groups.length > 1) split++;
      var total = groups.reduce(function (s, gr) { return s + textW(gr.join('')); }, 0) || 1;
      var t0 = c.start, dur = c.end - c.start;
      groups.forEach(function (gr, idx) {
        var share = textW(gr.join('')) / total;
        var t1 = idx === groups.length - 1 ? c.end : Math.round(t0 + dur * share);
        out.push({ start: t0, end: t1, text: gr.join('\n') });
        t0 = t1;
      });
    });
    return { cues: out, stats: { before: cues.length, after: out.length, wrapped: wrapped, split: split } };
  }

  function pad(n, w) { n = String(n); while (n.length < w) n = '0' + n; return n; }
  function srtTime(ms) {
    ms = Math.max(0, Math.round(ms));
    var h = Math.floor(ms / 3600000); ms -= h * 3600000;
    var m = Math.floor(ms / 60000); ms -= m * 60000;
    var s = Math.floor(ms / 1000); ms -= s * 1000;
    return pad(h, 2) + ':' + pad(m, 2) + ':' + pad(s, 2) + ',' + pad(ms, 3);
  }
  function toSRT(cues) {
    return cues.map(function (c, i) {
      return (i + 1) + '\n' + srtTime(c.start) + ' --> ' + srtTime(c.end) + '\n' + c.text;
    }).join('\n\n') + '\n';
  }

  var api = { breakCues: breakCues, wrap: wrap, normalize: normalize, textW: textW, toSRT: toSRT };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ZimuBreak = api;
})(this);
