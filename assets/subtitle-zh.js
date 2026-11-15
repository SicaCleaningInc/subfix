/*
 * ZimuFix — 字幕繁簡轉換核心
 * 只轉換對白文字；ASS/SSA 嘅樣式、字型名稱同 {\特效標籤} 保持不變，
 * 避免「微软雅黑」被轉成「微軟雅黑」之後播放器搵唔到字型。
 */
(function (root) {
  'use strict';

  // 轉換一段文字，但跳過 {...} 入面嘅 ASS 特效標籤
  function convertOutsideBraces(text, conv) {
    var out = '', i = 0;
    while (i < text.length) {
      var open = text.indexOf('{', i);
      if (open === -1) { out += conv(text.slice(i)); break; }
      out += conv(text.slice(i, open));
      var close = text.indexOf('}', open);
      if (close === -1) { out += text.slice(open); break; }
      out += text.slice(open, close + 1);
      i = close + 1;
    }
    return out;
  }

  // ASS/SSA：只轉換 Dialogue 行嘅第 10 個欄位（對白文字）
  function convertASS(text, conv) {
    return text.split(/(\r?\n)/).map(function (line) {
      var m = /^(Dialogue:\s*)(.*)$/.exec(line);
      if (!m) return line;
      var fields = m[2], commas = 0, idx = -1;
      for (var i = 0; i < fields.length; i++) {
        if (fields[i] === ',') { commas++; if (commas === 9) { idx = i; break; } }
      }
      if (idx === -1) return line;
      return m[1] + fields.slice(0, idx + 1) + convertOutsideBraces(fields.slice(idx + 1), conv);
    }).join('');
  }

  function extOf(name) {
    var m = /\.([^.]+)$/.exec(name || '');
    return m ? m[1].toLowerCase() : '';
  }

  /**
   * 轉換字幕內容。
   * SRT、VTT、LRC、TXT 等格式嘅時間碼同標籤都係英文字元，OpenCC 唔會改動，所以可以整份轉換。
   */
  function convertSubtitle(text, filename, conv) {
    var ext = extOf(filename);
    if (ext === 'ass' || ext === 'ssa') return convertASS(text, conv);
    return conv(text);
  }

  /** 喺副檔名前面加語言標記，例如 movie.srt → movie.zh-Hant.srt */
  function addLangTag(name, tag) {
    if (/\.[^.]+$/.test(name)) return name.replace(/(\.[^.]+)$/, '.' + tag + '$1');
    return name + '.' + tag;
  }

  var api = { convertSubtitle: convertSubtitle, convertASS: convertASS, addLangTag: addLangTag, extOf: extOf };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ZimuZh = api;
})(this);
