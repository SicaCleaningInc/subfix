# ZimuFix 字幕工具站：網站規劃

## 1. 定位

- **一句講晒**：專為中文字幕而設嘅免費工具箱，所有處理喺瀏覽器內完成，檔案唔會上傳
- **目標用戶**：香港、台灣、海外華人，睇劇、睇動畫、自己整字幕嘅人
- **第一階段語言**：繁體中文（頁面內容用書面語，方便港台兩邊用戶搜尋）
- **第二階段**：英文版（`/en/`），主打 CJK 字幕編碼處理

## 2. 域名

- **已購買：`zimufix.com`**（Cloudflare Registrar，每年 US$11.17，已設自動續期）
- 網站名：**ZimuFix 字幕工具**
- Cloudflare Pages 專案名：`subfix`（後備網址 `subfix-3as.pages.dev`）
- GitHub repo：`SicaCleaningInc/subfix`

## 3. 網址結構

規則：網址用英文小寫加連字號，每個工具一個資料夾，唔用 `.html` 結尾。

```
/                                   首頁（所有工具列表）
/fix-garbled-subtitles/             字幕亂碼修復         ✅ 已完成
/simplified-to-traditional-subtitles/  簡體字幕轉繁體     ✅ 已完成
/traditional-to-simplified-subtitles/  繁體字幕轉簡體     ✅ 已完成
/subtitle-time-shift/               字幕時間軸調整       ✅ 已完成
/srt-to-txt/                        SRT 轉 TXT           ✅ 已完成
/vtt-to-srt/                        VTT 轉 SRT           ✅ 已完成
/ass-to-srt/                        ASS 轉 SRT           ✅ 已完成

/bilingual-subtitles-merge/         雙語字幕合併          ✅ 已完成
/en/merge-bilingual-subtitles/      英文雙語字幕合併      ✅ 已完成
/guides/                            教學文章（引流用）
/guides/tv-subtitles-garbled/       電視、USB 播放字幕亂碼    ✅ 已完成
/guides/vlc-subtitle-encoding/      VLC 字幕亂碼設定          ✅ 已完成
/guides/srt-ass-vtt-difference/     SRT、ASS、VTT 分別        ✅ 已完成
/guides/subtitle-out-of-sync/       字幕不同步原因            ✅ 已完成

/about/                             關於（AdSense 必需）
/privacy/                           私隱政策（AdSense 必需）
/en/                                英文首頁                  ✅ 已完成
/en/fix-garbled-chinese-subtitles/  英文亂碼修復              ✅ 已完成
/en/simplified-to-traditional-chinese-subtitles/  英文簡轉繁 ✅ 已完成
/en/traditional-to-simplified-chinese-subtitles/  英文繁轉簡 ✅ 已完成
/en/privacy/                        英文私隱政策              ✅ 已完成
（英文版主攻「中日韓字幕」niche，唔同大站搶通用格式轉換關鍵字）
```

## 4. 工具頁面模板

每個工具頁都跟同一個結構，複製 `fix-garbled-subtitles/index.html` 再改內容就得。

| 區塊 | 內容 | 目的 |
|---|---|---|
| `<title>` | 「工具名 — 一句賣點｜ZimuFix」，60 字元內 | 搜尋結果標題 |
| `<meta description>` | 120–160 字元，包含主關鍵字同「免費」「不會上傳」 | 搜尋結果描述 |
| 結構化資料 | WebApplication + FAQPage（JSON-LD） | 有機會喺搜尋結果顯示常見問題 |
| H1 | 主關鍵字，例如「字幕亂碼修復」 | SEO 核心 |
| 一句說明 + 私隱標籤 | 「檔案只在你的瀏覽器內處理」 | 差異化賣點 |
| **工具本身** | 要喺第一屏見到，唔使碌 | 用戶體驗 |
| 廣告位 1 | 工具下方 | 收入 |
| 使用方法 | 3 個步驟 | 用戶體驗 + SEO |
| 原理說明 | 300–800 字，解釋點解會有呢個問題 | SEO 內容量，AdSense 審批需要 |
| 例子或對照表 | 例如常見亂碼樣子 | 長尾關鍵字 |
| 廣告位 2 | 內容中段 | 收入 |
| 播放器 / 軟件設定教學 | 唔想用工具嘅人都有答案 | 食埋「教學型」搜尋 |
| 常見問題 | 4–6 條，同 FAQPage 結構化資料一致 | SEO + 信任 |
| 相關工具 | 連去其他工具 | 內部連結，增加瀏覽頁數 |

### 廣告擺位守則（AdSense 政策）

- **唔好**將廣告放喺上載按鈕或下載按鈕旁邊，容易被判定為誘導誤撳，會被封戶口
- 每頁最多 2–3 個廣告位
- 廣告位已預留做 `<div class="ad-slot">`，批核前隱藏

## 5. 上線時間表

| 週末 | 任務 |
|---|---|
| 第 1 個 | 買域名、上載網站去 Cloudflare Pages、提交 Google Search Console |
| 第 2 個 | 做「簡體字幕轉繁體」 |
| 第 3 個 | 做「字幕時間軸調整」+ 寫 2 篇教學文章 |
| 第 4 個 | 做「繁體字幕轉簡體」「SRT 轉 TXT」 |
| 第 5–6 個 | 再寫教學文章，總共有 15–20 頁之後申請 AdSense |
| 之後 | 每個週末加 1 個工具或 2 篇文章 |

## 6. 成功指標

| 時間 | 目標 | 做唔到點算 |
|---|---|---|
| 第 1 個月 | Google 收錄晒所有頁面 | 檢查 Search Console 有冇錯誤 |
| 第 3 個月 | 每月 1,000 次瀏覽 | 檢討關鍵字揀得啱唔啱 |
| 第 6 個月 | 每月 10,000 次瀏覽 | 加英文版 |
| 第 12 個月 | 每月 US$50+ | 唔夠就考慮停手 |

## 7. 未來功能（V2）

- **雙重亂碼修復**：檔案本身係 UTF-8，但內容係「浣犲ソ」呢類曾經被轉錯嘅亂碼。需要內置 GBK 對照表，技術上較複雜
- 拖放成個資料夾
- 簡繁轉換同亂碼修復一次過做
- PWA：可以加到手機主畫面，離線使用

## 8. 短劇／短片創作者方向（2026-11-15 驗證）

| 關鍵字 | 結果 | 決定 |
|---|---|---|
| 雙語字幕合併 | 只有 2 個工具，冇繁體專頁 | ✅ 已做 |
| 字幕斷句 | 冇工具，只有文章 | ✅ 已做 /subtitle-line-break/ |
| bilingual subtitles merge | 有 Reddit 帖排前 | ✅ 已做英文版 |
| srt 翻譯 | 已有 AI 翻譯工具 | 暫時唔做 |
| 剪映 字幕 導出 srt | 電腦版剪映已可直接匯出 | ✅ 已寫教學 /guides/capcut-export-srt/ |

## 9. 第三批（2026-11-15）
- 日文 Shift-JIS、韓文 EUC-KR 自動偵測（encoding.js），英文頁 /en/fix-garbled-japanese-korean-subtitles/
- 英文版第二批：/en/subtitle-time-shift/、/en/srt-to-txt/、/en/vtt-to-srt/、/en/ass-to-srt/（已加 hreflang）
- 產生程式喺 build/（en.py、en2.py、guides.py、formats.py、merge_pages.py、break_page.py、headtags.py）；重新產生後要再行 headtags.py

## 10. 引流（2026-11-16）
- 播放器教學：/guides/plex-jellyfin-emby-chinese-subtitles/、/en/guides/plex-jellyfin-emby-chinese-subtitles/、/en/guides/apple-tv-iphone-mac-chinese-subtitles/、英文教學目錄 /en/guides/
- 開源 repo：github.com/SicaCleaningInc/cjk-subtitle-encoding（關於頁同英文首頁有連結）
- AlternativeTo 登記
- 產生程式：build/en_guides.py（英文教學）
