/*
 * ZimuFix — 字幕時間軸調整核心
 * 支援 SRT、VTT、ASS/SSA、SBV、LRC、SMI。
 * 新時間 = 舊時間 × 縮放比例（幀率轉換）＋ 位移（毫秒），最少為 0。
 */
(function (root) {
  'use strict';

  function pad(n, w) { n = String(n); while (n.length < w) n = '0' + n; return n; }

  function makeTransform(offsetMs, scale) {
    scale = scale || 1;
    return function (ms) { return Math.max(0, Math.round(ms * scale + offsetMs)); };
  }

  function splitMs(ms) {
    var h = Math.floor(ms / 3600000); ms -= h * 3600000;
    var m = Math.floor(ms / 60000); ms -= m * 60000;
    var s = Math.floor(ms / 1000); ms -= s * 1000;
    return { h: h, m: m, s: s, ms: ms };
  }

  // SRT：00:01:02,345   VTT：00:01:02.345 或 01:02.345
  var CLOCK = /(?:(\d{1,2}):)?(\d{1,2}):(\d{2})([,.])(\d{3})/g;

  function shiftClockLine(line, tf) {
    return line.replace(CLOCK, function (all, h, m, s, sep, ms) {
      var t = tf(((+h || 0) * 3600 + (+m) * 60 + (+s)) * 1000 + (+ms));
      var p = splitMs(t);
      var hasHours = h !== undefined || p.h > 0;
      return (hasHours ? pad(p.h, 2) + ':' : '') + pad(p.m, 2) + ':' + pad(p.s, 2) + sep + pad(p.ms, 3);
    });
  }

  function shiftSRTorVTT(text, tf) {
    return text.split(/(\r?\n)/).map(function (line) {
      return line.indexOf('-->') !== -1 ? shiftClockLine(line, tf) : line;
    }).join('');
  }

  // ASS：Dialogue: 0,0:00:01.00,0:00:03.00,...（百分之一秒）
  function assTime(str, tf) {
    var m = /^(\d+):(\d{2}):(\d{2})\.(\d{2})$/.exec(str.trim());
    if (!m) return str;
    var t = tf(((+m[1]) * 3600 + (+m[2]) * 60 + (+m[3])) * 1000 + (+m[4]) * 10);
    var cs = Math.round(t / 10);
    var h = Math.floor(cs / 360000); cs -= h * 360000;
    var mi = Math.floor(cs / 6000); cs -= mi * 6000;
    var s = Math.floor(cs / 100); cs -= s * 100;
    return h + ':' + pad(mi, 2) + ':' + pad(s, 2) + '.' + pad(cs, 2);
  }

  function shiftASS(text, tf) {
    return text.split(/(\r?\n)/).map(function (line) {
      var m = /^((?:Dialogue|Comment):\s*)([^,]*),([^,]*),([^,]*),(.*)$/.exec(line);
      if (!m) return line;
      return m[1] + m[2] + ',' + assTime(m[3], tf) + ',' + assTime(m[4], tf) + ',' + m[5];
    }).join('');
  }

  // SBV：0:00:01.000,0:00:03.000
  function shiftSBV(text, tf) {
    return text.split(/(\r?\n)/).map(function (line) {
      if (!/^\d+:\d{2}:\d{2}\.\d{3},\d+:\d{2}:\d{2}\.\d{3}\s*$/.test(line)) return line;
      return line.replace(/(\d+):(\d{2}):(\d{2})\.(\d{3})/g, function (a, h, m, s, ms) {
        var p = splitMs(tf(((+h) * 3600 + (+m) * 60 + (+s)) * 1000 + (+ms)));
        return p.h + ':' + pad(p.m, 2) + ':' + pad(p.s, 2) + '.' + pad(p.ms, 3);
      });
    }).join('');
  }

  // LRC：[01:02.34]（可以一行有多個時間標籤）
  function shiftLRC(text, tf) {
    return text.split(/(\r?\n)/).map(function (line) {
      return line.replace(/\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g, function (a, m, s, frac) {
        var fracMs = frac ? Math.round(+('0.' + frac) * 1000) : 0;
        var t = tf((+m) * 60000 + (+s) * 1000 + fracMs);
        var mm = Math.floor(t / 60000), ss = Math.floor((t % 60000) / 1000), cs = Math.floor((t % 1000) / 10);
        return '[' + pad(mm, 2) + ':' + pad(ss, 2) + '.' + pad(cs, 2) + ']';
      });
    }).join('');
  }

  // SMI：<SYNC Start=12345>
  function shiftSMI(text, tf) {
    return text.replace(/(<SYNC\s+Start\s*=\s*"?)(\d+)/gi, function (a, pre, ms) {
      return pre + tf(+ms);
    });
  }

  var SUPPORTED = { srt: 1, vtt: 1, ass: 1, ssa: 1, sbv: 1, lrc: 1, smi: 1 };

  function extOf(name) {
    var m = /\.([^.]+)$/.exec(name || '');
    return m ? m[1].toLowerCase() : '';
  }

  function shiftSubtitle(text, filename, offsetMs, scale) {
    var tf = makeTransform(offsetMs, scale);
    switch (extOf(filename)) {
      case 'srt': case 'vtt': return shiftSRTorVTT(text, tf);
      case 'ass': case 'ssa': return shiftASS(text, tf);
      case 'sbv': return shiftSBV(text, tf);
      case 'lrc': return shiftLRC(text, tf);
      case 'smi': return shiftSMI(text, tf);
      default: return null;
    }
  }

  var api = { shiftSubtitle: shiftSubtitle, SUPPORTED: SUPPORTED, extOf: extOf };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ZimuTime = api;
})(this);
