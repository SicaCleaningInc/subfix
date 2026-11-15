/*
 * SubFix — 字幕編碼偵測與轉換（純瀏覽器端，檔案唔會上傳）
 * 可同時喺瀏覽器同 Node.js 使用（方便測試）
 */
(function (root) {
  'use strict';

  // 對白常用字（繁＋簡）。正確解碼時命中率高，解錯編碼時命中率極低。
  var COMMON =
    '的一是不了人我在有他這这個个們们中來来上大為为和國国地到以說说時时要就出會会可也你對对生能而子那得於于著着下自之年過过發发後后作裡里用道行所然家種种事成方多經经麼么去法學学如都同現现當当沒没動动面起看定天分還还進进好小部其些主樣样理心她本前開开但因只從从想實实日意無无力它與与長长把機机十第公此已工使情明知全三又關关點点正外將将兩两高間间由問问很最重並并物手應应向頭头文體体相見见被利什二等或新己身果加西月話话合回特代內内信給给世位次度門门常先通教兒儿原東东聲声立比解水名真論论處处走各入幾几口認认條条平氣气題题活更別别打女變变四神總总何電电數数安少報报才結结反受目太量再感做接必場场件計计期直命山指許许保至形便空決决展馬马五眼書书非則则聽听白卻却光放強强即像難难且思王完色路記记品住告求北邊边死張张該该交萬万取拉望覺觉領领確确傳传師师清今切讓让識识候帶带爭争笑飛飞步改收根造言持每車车親亲極极服快辦办往元近失轉转夫令始怎呢存未遠远叫單单字愛爱流連连深算團团百需價价花城級级離离請请示病息似火斷断滿满照須须九寫写八功嗎吗包早找裝装吧念六首醫医突費费號号另較较考落青隨随選选紅红雖虽怕夠够音跟站例孩驗验責责章底母段依故按米害雙双客殺杀父密低朝友止細细願愿千仍男錢钱破熱热助倒坐限臉脸刻樂乐否剛刚獨独般苦假久錯错晚試试拿誰谁若哪送急血驚惊傷伤夜初喜待習习居歡欢停疑冷射竟室判擔担靜静退衣您痛差富角善媽妈讀读啊免買买養养懷怀幫帮歲岁怪著背腳脚壞坏敢守酒哥換换危忙暗姐介討讨麗丽良亮露永呼味掉誤误跑夢梦溫温困救貴贵缺樓楼朋畫画班短恐遇幸鐘钟藏趕赶舊旧端春附禮礼雨呀婚脫脱飯饭順顺睡借君禁逃束跳頂顶練练爺爷嘴館馆遍凡紙纸私翻默握戲戏熟骨弱歌店鬼軟软欲爸弄忘刺齊齐趣床迎玩窗醒妻替休虎兄套街促棄弃甲燈灯抱忍頁页染盛怒舞圓圆搞狂姓秋迷誠诚猛擺摆末悲拍硬妹浪桌啦燒烧勇觸触課课敬哭懂牆墙巧冒享乘掛挂獎奖厚爆描洗妙唱煩烦騙骗菜閉闭茶奶狗偷奔蟲虫累嘆叹寒伴恨聚恰挑袋灰尖忠零窮穷婆魂腿膽胆胸偶圈摸碰稍遲迟淨净冬蛋吹雞鸡杯租騎骑乏渡甘耐搶抢粗肩幻碎叔壯壮薄悄掃扫敏詳详剩罵骂賞赏箱貼贴漫酸腰舒眉餐嚇吓辭辞昨尺黎輩辈滑躲吐狠咬椅陪割悟聰聪霧雾貓猫祥賀贺抛鼠瓶惱恼燕狼池疼冠淺浅敲寂熊濕湿暖糖帽哀踏爛烂抖夾夹擦豬猪醉嗯哦喔嘛呃哈喂嘿噢嗨唉哇嘻吵謝谢歉麻煩烦晚安早拜見见謊谎媽妈咱倆俩俺誰谁嚕噜咦耶';

  var COMMON_SET = {};
  for (var i = 0; i < COMMON.length; i++) COMMON_SET[COMMON[i]] = 1;

  // 自動偵測時比較嘅編碼
  var AUTO_CANDIDATES = ['utf-8', 'gb18030', 'big5'];

  // 手動揀選時可用嘅編碼
  var MANUAL_ENCODINGS = [
    { id: 'utf-8', label: 'UTF-8' },
    { id: 'gb18030', label: 'GBK / GB18030（簡體）' },
    { id: 'big5', label: 'Big5（繁體）' },
    { id: 'utf-16le', label: 'UTF-16 LE' },
    { id: 'utf-16be', label: 'UTF-16 BE' },
    { id: 'shift_jis', label: 'Shift-JIS（日文）' },
    { id: 'euc-kr', label: 'EUC-KR（韓文）' }
  ];

  function decode(bytes, enc, fatal) {
    try {
      return new TextDecoder(enc, { fatal: !!fatal }).decode(bytes);
    } catch (e) {
      return null;
    }
  }

  function detectBOM(bytes) {
    if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return 'utf-8';
    if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) return 'utf-16le';
    if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) return 'utf-16be';
    return null;
  }

  // 冇 BOM 嘅 UTF-16：英文字元會出現大量 0x00
  function guessUTF16(bytes) {
    var n = Math.min(bytes.length, 4000);
    if (n < 4) return null;
    var evenZero = 0, oddZero = 0;
    for (var i = 0; i < n; i++) {
      if (bytes[i] === 0) {
        if (i % 2 === 0) evenZero++; else oddZero++;
      }
    }
    var half = n / 2;
    if (oddZero / half > 0.3 && evenZero / half < 0.05) return 'utf-16le';
    if (evenZero / half > 0.3 && oddZero / half < 0.05) return 'utf-16be';
    return null;
  }

  function isAscii(bytes) {
    for (var i = 0; i < bytes.length; i++) if (bytes[i] > 0x7f) return false;
    return true;
  }

  /**
   * 為一段解碼後嘅文字評分：
   * 常用中文字比例愈高愈好；亂碼符號（�）同私用區字元扣分。
   */
  function scoreText(text) {
    if (text == null) return { score: -Infinity, cjk: 0, hits: 0, bad: 0 };
    var cjk = 0, hits = 0, bad = 0, nonAscii = 0;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      var c = text.charCodeAt(i);
      if (c < 0x80) continue;
      nonAscii++;
      if (c === 0xfffd) { bad += 1; continue; }
      if ((c >= 0xe000 && c <= 0xf8ff) || (c >= 0x80 && c <= 0x9f)) { bad += 1; continue; }
      if (c >= 0x4e00 && c <= 0x9fff) {
        cjk++;
        if (COMMON_SET[ch]) hits++;
      }
    }
    var ratio = cjk ? hits / cjk : 0;
    var badRatio = nonAscii ? bad / nonAscii : 0;
    return {
      score: ratio - badRatio * 3,
      cjk: cjk,
      hits: hits,
      bad: bad,
      ratio: ratio
    };
  }

  /**
   * 偵測編碼。回傳：
   * { encoding, confidence: 'high'|'medium'|'low', reason, ascii, results:[{encoding, score}] }
   */
  function detectEncoding(bytes) {
    var bom = detectBOM(bytes);
    if (bom) return { encoding: bom, confidence: 'high', reason: 'bom', ascii: false, results: [] };

    var u16 = guessUTF16(bytes);
    if (u16) return { encoding: u16, confidence: 'high', reason: 'utf16-pattern', ascii: false, results: [] };

    if (isAscii(bytes)) return { encoding: 'utf-8', confidence: 'high', reason: 'ascii', ascii: true, results: [] };

    // 成個檔都係合法 UTF-8，基本上就一定係 UTF-8
    var utf8 = decode(bytes, 'utf-8', true);
    if (utf8 !== null) {
      return { encoding: 'utf-8', confidence: 'high', reason: 'valid-utf8', ascii: false, results: [] };
    }

    // 簡體 GBK vs 繁體 Big5：用常用字命中率比較
    var results = [];
    for (var i = 0; i < AUTO_CANDIDATES.length; i++) {
      var enc = AUTO_CANDIDATES[i];
      var s = scoreText(decode(bytes, enc, false));
      results.push({ encoding: enc, score: s.score, ratio: s.ratio, bad: s.bad, cjk: s.cjk });
    }
    results.sort(function (a, b) { return b.score - a.score; });
    var best = results[0], second = results[1];
    var gap = best.score - second.score;
    var confidence = best.score > 0.25 && gap > 0.15 ? 'high' : best.score > 0.1 && gap > 0.05 ? 'medium' : 'low';
    return { encoding: best.encoding, confidence: confidence, reason: 'scored', ascii: false, results: results };
  }

  /** 將文字轉成 UTF-8 bytes，可選加 BOM（舊式播放器同 Windows 記事本較易認得） */
  function encodeUTF8(text, withBOM) {
    // 先移除開頭已有嘅 BOM 字元，避免重複
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    var body = new TextEncoder().encode(text);
    if (!withBOM) return body;
    var out = new Uint8Array(body.length + 3);
    out.set([0xef, 0xbb, 0xbf], 0);
    out.set(body, 3);
    return out;
  }

  function convert(bytes, encoding, withBOM) {
    var text = decode(bytes, encoding, false);
    return { text: text, bytes: encodeUTF8(text, withBOM) };
  }

  var api = {
    detectEncoding: detectEncoding,
    decode: decode,
    convert: convert,
    encodeUTF8: encodeUTF8,
    scoreText: scoreText,
    MANUAL_ENCODINGS: MANUAL_ENCODINGS
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SubFixEncoding = api;
})(this);
