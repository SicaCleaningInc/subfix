/* v27：試用範例及貼上字幕文字（所有處理仍在瀏覽器內完成） */
(function () {
  'use strict';
  var me = document.currentScript;
  var mode = me.getAttribute('data-mode') || 'text';      /* text = 貼上＋範例；sample = 只有範例 */
  var sample = me.getAttribute('data-sample') || 'srt';
  var mojibake = me.getAttribute('data-mojibake') === '1';  /* 亂碼修復頁：把貼上的亂碼還原成原本位元組 */
  var zh = (document.documentElement.lang || '').indexOf('zh') === 0;
  var L = zh ? {
    lead: '沒有字幕檔案？', tryBtn: '試用範例', pasteBtn: '貼上字幕文字', use: '使用貼上的內容', cancel: '取消',
    ph: mojibake ? '把出現亂碼的字幕內容貼在這裡，例如 ÄãºÃ£¬ÊÀ½ç⋯' : '把 SRT、VTT 或 ASS 字幕的內容貼在這裡⋯', empty: '請先貼上字幕內容。', fail: '你的瀏覽器不支援這個功能，請直接選擇字幕檔案。'
  } : {
    lead: 'No subtitle file at hand?', tryBtn: 'Try a sample', pasteBtn: 'Paste subtitle text', use: 'Use pasted text', cancel: 'Cancel',
    ph: mojibake ? 'Paste the garbled subtitle text here, for example ÄãºÃ£¬ÊÀ½ç…' : 'Paste the contents of an SRT, VTT or ASS subtitle here…', empty: 'Paste some subtitle text first.', fail: 'Your browser does not support this. Please choose a subtitle file instead.'
  };
  var B64 = {"gbk": "MQ0KMDA6MDA6MDEsMDAwIC0tPiAwMDowMDowMyw1MDANCsTjusOjrLu2063KudPDIFppbXVGaXihow0KDQoyDQowMDowMDowNCwwMDAgLS0+IDAwOjAwOjA2LDUwMA0K1eLKx9K7uPYgR0JLILHgwuu1xMq+t7bX1sS7oaMNCg0KMw0KMDA6MDA6MDcsMDAwIC0tPiAwMDowMDoxMCwwMDANCtDeuLS687vh16rOqiBVVEYtOKOs1NrIzrrOsqW3xcb3trzE3NX9s6PP1Mq+oaMNCg==", "sjis": "MQ0KMDA6MDA6MDEsMDAwIC0tPiAwMDowMDowMyw1MDANCoKxgvGCyYK/gs2BQY6alouCzINlg1iDZ4LFgreBQg0KDQoyDQowMDowMDowNCwwMDAgLS0+IDAwOjAwOjA2LDUwMA0KgrGC6oLNIFNoaWZ0LUpJUyCCzIyplnuDdINAg0ODi4LFgreBQg0K", "euckr": "MQ0KMDA6MDA6MDEsMDAwIC0tPiAwMDowMDowMyw1MDANCr7Is+fHz7y8v+QsIMDauLcgxde9usauwNS0z7TZLg0KDQoyDQowMDowMDowNCwwMDAgLS0+IDAwOjAwOjA2LDUwMA0KwMwgxsTAz8C6IEVVQy1LUiC/ub3DwNS0z7TZLg0K"};
  var TXT = {"srt": "1\n00:00:01,000 --> 00:00:03,500\n你好，歡迎使用 ZimuFix。\n\n2\n00:00:04,000 --> 00:00:06,500\n這是一段示範字幕。\n\n3\n00:00:07,000 --> 00:00:10,000\n試用完成後，再選擇你自己的字幕檔案。\n", "srt_en": "1\n00:00:01,000 --> 00:00:03,500\nHello, welcome to ZimuFix.\n\n2\n00:00:04,000 --> 00:00:06,500\nThis is a sample subtitle.\n\n3\n00:00:07,000 --> 00:00:10,000\nTry it, then choose your own subtitle file.\n", "vtt": "WEBVTT\n\n00:00:01.000 --> 00:00:03.500\n你好，歡迎使用 ZimuFix。\n\n00:00:04.000 --> 00:00:06.500\n這是一段 VTT 示範字幕。\n\n00:00:07.000 --> 00:00:10.000\n轉換後會變成 SRT 格式。\n", "ass": "[Script Info]\nTitle: ZimuFix sample\nScriptType: v4.00+\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Arial,48,&H00FFFFFF,&H000000FF,&H00000000,&H64000000,0,0,0,0,100,100,0,0,1,2,1,2,20,20,20,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\nDialogue: 0,0:00:01.00,0:00:03.50,Default,,0,0,0,,{\\b1}你好{\\b0}，歡迎使用 ZimuFix。\nDialogue: 0,0:00:04.00,0:00:06.50,Default,,0,0,0,,這是一段 ASS 示範字幕。\\N特效標籤會被移除。\nDialogue: 0,0:00:07.00,0:00:10.00,Default,,0,0,0,,轉換後會變成 SRT 格式。\n", "long": "1\n00:00:01,000 --> 00:00:05,000\n你對他不滿，可能是因為他酗酒，更有可能是他剛甩掉他老婆\n\n2\n00:00:05,500 --> 00:00:09,000\n我昨天晚上一直在想，到底要不要把這件事告訴她\n\n3\n00:00:09,500 --> 00:00:12,000\n算了，明天再說吧\n", "long_en": "1\n00:00:01,000 --> 00:00:05,000\nI have been thinking about this all night and I still do not know whether I should tell her the truth\n\n2\n00:00:05,500 --> 00:00:09,000\nMaybe it is better to wait until tomorrow morning when everyone has calmed down\n"};

  function bytes(b64) { var s = atob(b64), u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
  function file(name, data) { return new File([data], name, { type: 'text/plain' }); }
  function samples() {
    switch (sample) {
      case 'gbk': return [[file(zh ? '示範-GBK.srt' : 'sample-gbk.srt', bytes(B64.gbk))]];
      case 'cjk': return [[file(zh ? '示範-日文.srt' : 'sample-japanese.srt', bytes(B64.sjis)), file(zh ? '示範-韓文.srt' : 'sample-korean.srt', bytes(B64.euckr))]];
      case 'vtt': return [[file(zh ? '示範.vtt' : 'sample.vtt', TXT.vtt)]];
      case 'ass': return [[file(zh ? '示範.ass' : 'sample.ass', TXT.ass)]];
      case 'long': return [[file(zh ? '示範-長句.srt' : 'sample-long.srt', zh ? TXT.long : TXT.long_en)]];
      case 'merge': return [[file(zh ? '示範-中文.srt' : 'sample-chinese.srt', TXT.srt)], [file(zh ? '示範-英文.srt' : 'sample-english.srt', TXT.srt_en)]];
      default: return [[file(zh ? '示範.srt' : 'sample.srt', TXT.srt)]];
    }
  }
  function inputs() {
    var a = document.getElementById('file-a'), b = document.getElementById('file-b');
    if (a && b) return [a, b];
    return [document.getElementById('file-input')];
  }
  function feed(input, files) {
    try {
      var dt = new DataTransfer();
      files.forEach(function (f) { dt.items.add(f); });
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    } catch (e) { return false; }
  }
  function warn(text) {
    var box = document.getElementById('messages') || bar;
    var p = document.createElement('p'); p.className = 'status status-warn'; p.textContent = text;
    box.appendChild(p); setTimeout(function () { p.remove(); }, 8000);
  }

  /* 西歐編碼（Windows-1252）讀錯造成嘅亂碼可以逐字還原為原本位元組，再交俾編碼偵測 */
  var CP1252 = {0x20AC:0x80,0x201A:0x82,0x0192:0x83,0x201E:0x84,0x2026:0x85,0x2020:0x86,0x2021:0x87,0x02C6:0x88,0x2030:0x89,0x0160:0x8A,0x2039:0x8B,0x0152:0x8C,0x017D:0x8E,
    0x2018:0x91,0x2019:0x92,0x201C:0x93,0x201D:0x94,0x2022:0x95,0x2013:0x96,0x2014:0x97,0x02DC:0x98,0x2122:0x99,0x0161:0x9A,0x203A:0x9B,0x0153:0x9C,0x017E:0x9E,0x0178:0x9F};
  function unMojibake(text) {
    var out = new Uint8Array(text.length), high = 0;
    for (var i = 0; i < text.length; i++) {
      var c = text.charCodeAt(i);
      if (c < 0x100) out[i] = c; else if (CP1252[c]) out[i] = CP1252[c]; else return null;
      if (out[i] >= 0x80) high++;
    }
    return high ? out : null;
  }
  function extOf(text) {
    var t = text.replace(/^﻿/, '').trim();
    if (/^\[Script Info\]/i.test(t) || /^Dialogue:/m.test(t)) return 'ass';
    if (/^WEBVTT/.test(t)) return 'vtt';
    return 'srt';
  }

  var ins = inputs();
  if (!ins[0]) return;
  var anchor = ins.length > 1 ? (document.querySelector('.merge-slots') || ins[1].closest('.tool').querySelector('.merge-opts') || ins[1].parentNode) : document.getElementById('drop');
  if (!anchor) return;

  var bar = document.createElement('div'); bar.className = 'try-row';
  var lead = document.createElement('span'); lead.className = 'muted'; lead.textContent = L.lead; bar.appendChild(lead);
  var tryBtn = document.createElement('button'); tryBtn.type = 'button'; tryBtn.className = 'btn btn-ghost'; tryBtn.textContent = L.tryBtn; bar.appendChild(tryBtn);
  tryBtn.addEventListener('click', function () {
    var sets = samples(), ok = true;
    ins.forEach(function (inp, i) { if (sets[i]) ok = feed(inp, sets[i]) && ok; });
    if (!ok) warn(L.fail);
  });

  var box;
  if (mode === 'text' && ins.length === 1) {
    var pasteBtn = document.createElement('button'); pasteBtn.type = 'button'; pasteBtn.className = 'btn btn-ghost'; pasteBtn.textContent = L.pasteBtn; bar.appendChild(pasteBtn);
    box = document.createElement('div'); box.className = 'try-paste'; box.hidden = true;
    var ta = document.createElement('textarea'); ta.rows = 8; ta.placeholder = L.ph; ta.setAttribute('aria-label', L.pasteBtn); box.appendChild(ta);
    var row = document.createElement('div'); row.className = 'file-row';
    var use = document.createElement('button'); use.type = 'button'; use.className = 'btn btn-primary'; use.textContent = L.use; row.appendChild(use);
    var cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'btn btn-ghost'; cancel.textContent = L.cancel; row.appendChild(cancel);
    box.appendChild(row);
    pasteBtn.addEventListener('click', function () { box.hidden = !box.hidden; if (!box.hidden) ta.focus(); });
    cancel.addEventListener('click', function () { box.hidden = true; });
    use.addEventListener('click', function () {
      var text = ta.value;
      if (!text.trim()) { warn(L.empty); return; }
      var name = (zh ? '貼上的字幕.' : 'pasted-subtitle.') + extOf(text);
      var raw = mojibake ? unMojibake(text.replace(/\r?\n/g, '\r\n')) : null;
      if (feed(ins[0], [file(name, raw || text)])) { ta.value = ''; box.hidden = true; } else warn(L.fail);
    });
  }
  anchor.parentNode.insertBefore(bar, anchor.nextSibling);
  if (box) bar.parentNode.insertBefore(box, bar.nextSibling);
})();
