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

## 11. 第四批教學（2026-11-17）
- 8 篇播放器／裝置教學：potplayer-subtitle-garbled、kodi-chinese-subtitles、mx-player-subtitle-garbled、android-tv-subtitles、mobile-subtitles-iphone-android、youtube-upload-subtitles-garbled、premiere-davinci-srt-garbled、subtitle-boxes-squares
- 產生程式：build/guides3.py（只寫新頁，唔會覆蓋舊頁）；sitemap 共 41 個網址
- 唔做 Ko-fi／Buy Me a Coffee

## 12. 第五批（2026-11-18，v14）
- 中文教學 8 篇：subtitle-file-naming、extract-mkv-subtitles、burn-subtitles-into-video、sup-idx-to-srt、subtitle-encoding-utf8、samsung-lg-tv-subtitles、kmplayer-subtitle-garbled、windows-media-player-subtitles（build/guides4.py）
- v13 教學英文版 8 篇 /en/guides/…（build/en_guides2.py），中文版已加 hreflang
- sitemap 共 57 個網址
- 數據：11/18 首個真搜尋字「kodi 中文 亂碼」排第 9（Kodi 教學上線一日）

## 13. 線上字幕播放器（2026-11-19，v15）
- /online-subtitle-player/、/en/online-subtitle-player/（assets/player-ui.js；build/player_page.py）
- 原因：Search Console 出現「play vtt files online」搜尋
- 功能：本機影片＋SRT/VTT/ASS/SSA/SBV、自動修亂碼、±0.1s/±1s 調時間（G/H 快捷鍵）、字體大小、簡繁（按需載入 OpenCC）、下載修正後 SRT
- sitemap 共 59 個網址

## 14. 全站改版（2026-11-19，v16，方案 B「簡潔工具」）
- assets/style.css 重寫：#f6f7f9 底色、白色卡片、14px 圓角、Noto Sans TC、上載圖示、按鈕高度 40px
- 播放器改為左影片右設定欄（body.page-wide 用 1180px 闊）
- build/assetver.py：全站加字型連結同 ?v= 版本號（之後改 CSS／JS 要將 V 加 1 再行）
- 產生新頁後次序：生成 → headtags.py → assetver.py

## 15. 教學頁改版（2026-11-20，v17，方案 2「先答案後步驟」）
- build/guide_layout.py：所有教學頁 h2 段落變成 A/B/C 卡片，頂部「先選擇你看到的情況」症狀卡（方格／怪字／沒有字幕），延伸閱讀變標籤；教學目錄按四個類別分組
- 已處理嘅頁面有 class="content guide g2"，重複執行唔會重複轉
- ⚠️ 教學目錄已改為分組（guide-groups），guides3／guides4 舊嘅「插入 guide-list」做法唔再適用：新教學要加入目錄 → 先喺 guide_layout.py 嘅 GROUPS 規則確認分類，再手動加卡片
- 新頁流程：生成 → guide_layout.py → headtags.py → assetver.py（V 而家係 17）

## 16. 英文教學擴充（2026-11-20，v18）
- 新增 13 篇英文教學（build/en_guides3.py），英文教學共 23 篇；每篇有 FAQ 同 FAQPage schema
- 舊有 10 篇英文教學加咗 FAQ 卡（build/en_faq.py）
- ⚠️ en_guides3.py 每次行都會重寫嗰 13 頁，行完要再行 guide_layout.py、headtags.py、assetver.py，同埋 FAQ 圖示修正（? 號）
- sitemap 共 72 個網址

## 17. 首頁改版（2026-11-20，v19，「先問問題」＋彩色圖示）
- build/home_v2.py：中英首頁改為六張問題卡（字幕變成亂碼、簡轉繁、太快太慢、格式、雙語、試播）＋裝置教學標籤＋其他工具清單；工具頁標題上加彩色圖示
- 顏色：修復＝青綠 #0f766e、簡繁＝藍紫 #4338ca、格式＝橙 #c2410c、創作＝紫紅 #a21caf
- assetver V＝18

## 18. 英文工具頁 SEO（2026-11-21，v20）
- build/en_tool_seo.py：英文時間軸調整、ASS 轉 SRT、VTT 轉 SRT 改標題、描述、H1，加教學段落同 FAQ（FAQPage schema 同步）
- 原因：Search Console 見到 adjust subtitle timing、shift subtitles online、ass to srt、webvtt to srt converter 等字排第 43–85
- ⚠️ 如果用 en.py 重新生成呢三頁，要再行 en_tool_seo.py

## 19. 第一個贊助：Subterra（2026-11-22，v21）
- 組合 US$55 × 3 個月 = US$165（Sponsored Review + Guide Sponsor），Jan（getsubterra.tv）
- /en/guides/subterra-review/（build/sponsor_subterra.py），頂部有 Sponsored 聲明，FAQPage schema
- 中英文 Kodi 教學加「贊助 · 推薦工具」框（.sponsor-box）
- 所有外部連結：https://getsubterra.tv/?ref=zimufix，rel="sponsored noopener"
- 評測入面有 <!-- SIMON: hands-on test results --> 位置，等 Simon 試用後補上
- 合約到期：收款日起計 3 個月，到時睇數字再談續約

## 20. 教學目錄改版（2026-11-22，v22，方案 2「側欄分類」）
- build/guides_index_v2.py：中英文目錄 = 左邊搜尋＋分類（附篇數），右邊深色 Subterra 贊助卡＋分組清單（短名＋一行描述）
- assets/guides-index.js：即時搜尋、分類高亮
- ⚠️ 新增教學要喺 guides_index_v2.py 嘅 DATA 加一行再行（guide_layout.py 嘅 transform_index 已經唔再用）
- ⚠️ 贊助卡要喺 Subterra 合約期內先保留；合約完結要喺 DATA 改走 sponsor 區
- 2026-11-22 v23：加中文評測 /guides/subterra-review/（build/sponsor_subterra_zh.py），中英互相 hreflang；中文 Kodi 推薦框同中文目錄贊助卡改連中文評測

## 21. 廣告合作（2026-11-22，v24）
- /advertise/、/en/advertise/（build/advertise.py）：方案、可預訂位置表（Kodi＝已售出）、準則、預訂方法
- 全站頁尾加「廣告合作／Advertise」；產生器範本已同步
- 43 個未有贊助嘅教學頁加咗低調虛線「廣告位」（.ad-open），連去廣告合作頁
- 賣出新類別時：喺該類教學頁將 .ad-open 換成 .sponsor-box，並更新廣告合作頁狀態
- 2026-11-22 v25：Jan 已付款（US$165）；中英文評測加入 Simon 親身試用結論（.tested-note）同更新總結。合約期：2026-11-22 至 2027-02-22

## 22. 執漏清單（2026-11-24，v26）
- 新頁：`/fix-garbled-japanese-korean-subtitles/`（中文日韓亂碼，hreflang 對應英文版）、`/en/subtitle-line-break/`、`/en/about/`；全部加入 sitemap。
- 首頁「日文、韓文亂碼」改連新頁；中英文工具各 11 個，一一對應。
- 英文導覽及頁腳加 About（38 頁 + en.py、merge_pages.py 範本）。
- 廣告頁數字：45 篇 = 中文 22 + 英文 23。VLC 教學引言改為「三種方法」。
- 404.html 加品牌頁頭頁腳，/en/ 路徑自動顯示英文。
- 移除 43 頁空嘅 `.ad-open`「此位置可刊登」方框。**注意：重跑 advertise.py 會加返，之後有贊助商先放實際內容。**
- `assets/try-input.js`：16 個工具頁加「試用範例／貼上字幕文字」。
- 時間軸微調改用整數毫秒（10 × 0.1 = 1）；錨點加 scroll-margin-top 避開固定頁頭。
- 後處理腳本：`build/fixlist_v26.py`（可重複執行）。資源版本 v=26。

## 23. 複檢跟進（2026-11-24，v27）
- 新增中文 `/guides/apple-tv-iphone-mac-chinese-subtitles/`（對應英文版，hreflang 互指），中英文教學各 23 篇，廣告頁改為「46 篇（中英文版各 23 篇）」。
- 22 篇教學嘅「快速導覽」補齊所有段落（例如電視教學原因三、四）。
- 404 頁腳跟語言切換。
- 亂碼修復頁（中英、日韓）加「貼上字幕文字」：西歐編碼讀錯嘅亂碼（如 ÄãºÃ）會還原位元組再偵測。
- 全站 112 個檔案，GitHub 網頁每次最多上載 100 個，所以分兩個 zip。後處理腳本 `build/fixlist_v27.py`，資源版本 v=27。
