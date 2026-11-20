/*
 * ZimuFix — 線上字幕播放器
 * 本機影片 + 字幕（SRT、VTT、ASS、SSA、SBV），全部喺瀏覽器內處理
 * 自動修正亂碼、即時調整字幕快慢、簡繁轉換、下載修正後嘅 SRT
 */
(function () {
  'use strict';
  var S = window.ZIMU_STRINGS || {};
  function t(k, d) { return S[k] || d; }
  var E = window.ZimuFixEncoding, F = window.ZimuFormat;

  var $ = function (id) { return document.getElementById(id); };
  var video = $('pl-video'), drop = $('pl-drop'), input = $('pl-input');
  var info = $('pl-info'), offsetLabel = $('pl-offset'), zhSel = $('pl-zh');
  var dl = $('pl-download'), wrap = $('pl-wrap'), cueStyle = $('pl-cue-style'), main = $('pl-main');
  var vname = $('pl-vname'), sname = $('pl-sname'), sinfo = $('pl-sinfo');
  var cueSize = '100%';

  var SUB_EXT = ['srt', 'vtt', 'ass', 'ssa', 'sbv'];
  var VIDEO_EXT = ['mp4', 'm4v', 'webm', 'mkv', 'mov', 'ogv', 'ogg', 'mp3', 'm4a', 'wav'];
  var state = { cues: [], shown: [], offset: 0, subName: '', videoURL: null, track: null };
  var ZH = {
    cn2hk: { src: '/assets/vendor/opencc-cn2t.js', from: 'cn', to: 'hk' },
    cn2tw: { src: '/assets/vendor/opencc-cn2t.js', from: 'cn', to: 'twp' },
    t2cn: { src: '/assets/vendor/opencc-t2cn.js', from: 'hk', to: 'cn' }
  };
  var converters = {}, loaded = {};

  function msg(text, isError) {
    info.textContent = text;
    info.className = isError ? 'pl-info error' : 'pl-info';
  }

  function loadScript(src) {
    if (loaded[src]) return loaded[src];
    loaded[src] = new Promise(function (ok, fail) {
      var s = document.createElement('script');
      s.src = src; s.onload = ok; s.onerror = fail;
      document.head.appendChild(s);
    });
    return loaded[src];
  }

  function getConverter(mode) {
    if (mode === 'none') return Promise.resolve(null);
    if (converters[mode]) return Promise.resolve(converters[mode]);
    var c = ZH[mode];
    // 兩個 OpenCC 檔會覆蓋同一個全域變數，所以每次都重新載入對應嗰個
    delete loaded[c.src];
    return loadScript(c.src).then(function () {
      converters[mode] = window.OpenCC.Converter({ from: c.from, to: c.to });
      return converters[mode];
    });
  }

  function cueText(text) {
    return text.replace(/\{[^}]*\}/g, '')
      .replace(/<(?!\/?(?:i|b|u)>)[^>]*>/g, '')
      .replace(/&/g, '&amp;').replace(/<(?!\/?(?:i|b|u)>)/g, '&lt;')
      .replace(/\\N/g, '\n').trim();
  }

  function ensureTrack() {
    if (!state.track) {
      state.track = video.addTextTrack('subtitles', 'ZimuFix', 'zh');
    }
    state.track.mode = 'showing';
    return state.track;
  }

  function renderCues() {
    if (!state.cues.length) return;
    var track = ensureTrack();
    var Cue = window.VTTCue || window.TextTrackCue;
    while (track.cues && track.cues.length) track.removeCue(track.cues[0]);
    var off = state.offset;
    state.shown.forEach(function (c) {
      var s = (c.start + off) / 1000, e = (c.end + off) / 1000;
      if (e <= 0) return;
      try { track.addCue(new Cue(Math.max(0, s), e, cueText(c.text))); } catch (err) { /* 略過壞句子 */ }
    });
    offsetLabel.textContent = (off > 0 ? '+' : '') + (off / 1000).toFixed(1) + ' s';
  }

  function applyZh() {
    var mode = zhSel.value;
    return getConverter(mode).then(function (conv) {
      state.shown = state.cues.map(function (c) {
        return { start: c.start, end: c.end, text: conv ? conv(c.text) : c.text };
      });
      renderCues();
    }).catch(function () { msg(t('zhFail', '簡繁轉換載入失敗，請檢查網絡後再試。'), true); });
  }

  function loadSubtitle(file) {
    file.arrayBuffer().then(function (buf) {
      var bytes = new Uint8Array(buf);
      var det = E.detectEncoding(bytes);
      var text = E.convert(bytes, det.encoding, false).text;
      var cues = F.parse(text, file.name);
      if (!cues.length) { msg(t('noCues', '讀不到字幕內容，請確認檔案是 SRT、VTT、ASS、SSA 或 SBV 格式。'), true); return; }
      state.cues = cues; state.subName = file.name; state.offset = 0;
      dl.disabled = false;
      sname.textContent = file.name;
      var enc = det.encoding.toUpperCase();
      var isUtf = /^UTF/.test(enc);
      sinfo.textContent = (isUtf ? t('sinfoOk', 'UTF-8 · {n} 句') : t('sinfoFixed', '{enc} → UTF-8 已修正 · {n} 句')).replace('{enc}', enc).replace('{n}', cues.length);
      sinfo.className = isUtf ? '' : 'fixed';
      msg(video.src ? '' : t('needVideo', '請再選擇影片檔。'));
      applyZh();
    });
  }

  function loadVideo(file) {
    if (state.videoURL) URL.revokeObjectURL(state.videoURL);
    state.videoURL = URL.createObjectURL(file);
    video.src = state.videoURL;
    wrap.hidden = false;
    drop.hidden = true;
    vname.textContent = file.name;
    if (state.cues.length) renderCues();
    msg(state.cues.length ? '' : t('needSub', '請再選擇字幕檔。'));
  }

  function handleFiles(list) {
    var files = Array.prototype.slice.call(list);
    var v = null, s = null;
    files.forEach(function (f) {
      var ext = F.extOf(f.name);
      if (SUB_EXT.indexOf(ext) !== -1) s = s || f;
      else if (VIDEO_EXT.indexOf(ext) !== -1 || /^(video|audio)\//.test(f.type)) v = v || f;
    });
    if (!v && !s) { msg(t('unknown', '不支援的檔案類型。請選擇影片（MP4、WebM、MKV）及字幕（SRT、VTT、ASS）。'), true); return; }
    if (v) loadVideo(v);
    if (s) loadSubtitle(s);
  }

  video.addEventListener('error', function () {
    if (!video.src) return;
    msg(t('videoError', '瀏覽器無法播放這個影片格式（例如 HEVC／H.265 或部分 MKV）。可改用 Chrome 或 Edge，或把影片轉為 MP4（H.264）。'), true);
  });

  input.addEventListener('change', function () { handleFiles(input.files); input.value = ''; });
  ['dragenter', 'dragover'].forEach(function (ev) { main.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('drag'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { main.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('drag'); }); });
  main.addEventListener('drop', function (e) { handleFiles(e.dataTransfer.files); });
  document.querySelectorAll('[data-pick]').forEach(function (b) { b.addEventListener('click', function () { input.click(); }); });
  drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });

  function shift(ms) { state.offset += ms; renderCues(); }
  document.querySelectorAll('[data-shift]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = +b.getAttribute('data-shift');
      if (v === 0) { state.offset = 0; renderCues(); } else shift(v);
    });
  });
  // 鍵盤：G 提早 0.1 秒、H 延遲 0.1 秒（同 VLC 一樣）
  document.addEventListener('keydown', function (e) {
    if (/input|select|textarea/i.test(e.target.tagName) || !state.cues.length) return;
    if (e.key === 'g' || e.key === 'G') shift(-100);
    if (e.key === 'h' || e.key === 'H') shift(100);
  });

  function applySize() { cueStyle.textContent = '#pl-video::cue{font-size:' + cueSize + ';background:rgba(0,0,0,.6);color:#fff;line-height:1.35}'; }
  var sizeBtns = document.querySelectorAll('[data-size]');
  sizeBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      cueSize = b.getAttribute('data-size');
      sizeBtns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      applySize();
    });
  });
  applySize();
  zhSel.addEventListener('change', function () { if (state.cues.length) applyZh(); });

  dl.addEventListener('click', function () {
    var off = state.offset;
    var out = state.shown.map(function (c) { return { start: Math.max(0, c.start + off), end: Math.max(0, c.end + off), text: c.text }; })
      .filter(function (c) { return c.end > 0; });
    var bytes = E.encodeUTF8(F.toSRT(out), true);
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([bytes], { type: 'application/x-subrip' }));
    a.download = F.replaceExt(state.subName || 'subtitle', 'srt');
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  });
})();
