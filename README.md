# ZimuFix 字幕工具

純靜態網站，冇 build 步驟，可以直接喺 GitHub 網頁介面改程式，Cloudflare Pages 會自動部署。

## 檔案結構

```
index.html                     首頁
fix-garbled-subtitles/         字幕亂碼修復工具頁
about/  privacy/               關於、私隱政策（AdSense 必需）
assets/encoding.js             編碼偵測及轉換核心
assets/zip.js                  批量下載用嘅 ZIP 打包
assets/fix-garbled.js          亂碼修復頁嘅介面邏輯
assets/style.css               全站樣式
robots.txt  sitemap.xml        SEO
_headers                       Cloudflare 安全標頭
404.html                       找不到頁面
docs/SITE_PLAN.md              網站規劃
```

## 上線步驟

### 1. 域名

已經設定為 `zimufix.com`。如果將來換域名，用「搜尋及取代」將所有 `zimufix.com` 換走就得。

### 2. 部署去 Cloudflare Pages

**方法 A：連接 GitHub（建議）**
1. 喺 GitHub 開一個新 repo，例如 `subfix`，上載晒所有檔案（`docs/` 可以一齊上載，唔影響網站）
2. Cloudflare 主控台 → Workers & Pages → Create → Pages → Connect to Git
3. 揀 `subfix` repo
4. Build settings：Framework preset 揀 **None**，Build command **留空**，Build output directory 填 **`/`**
5. 撳 Save and Deploy

之後喺 GitHub 改任何檔案，Cloudflare 都會自動重新部署。

**方法 B：直接上載**
1. Cloudflare 主控台 → Workers & Pages → Create → Pages → Upload assets
2. 將成個資料夾拖入去

### 3. 綁定域名

Cloudflare Pages 專案 → Custom domains → Set up a custom domain → 輸入你嘅域名。

### 4. 提交 Google

1. 去 Google Search Console 加入網站
2. Sitemaps → 提交 `https://你的域名/sitemap.xml`

### 5. 申請 AdSense（有 15–20 頁內容之後）

AdSense 程式碼（ca-pub-8731061578516772）同 `ads.txt` 已經加好。新增頁面時，記得將 `<head>` 入面嗰段 AdSense `<script>` 一齊複製。

批核後：
1. 將廣告單元碼放入 `<div class="ad-slot">` 入面
3. 喺 `assets/style.css` 將 `.ad-slot { display: none; ...}` 改成 `display: block`

## 本機測試

喺呢個資料夾執行：

```
python3 -m http.server 8000
```

然後打開 http://localhost:8000/fix-garbled-subtitles/

（唔可以直接雙擊 index.html 開，因為網頁用 `/assets/...` 絕對路徑。）

## 加新工具

1. 複製 `fix-garbled-subtitles/` 成新資料夾，例如 `subtitle-time-shift/`
2. 改 `<title>`、description、canonical、H1、內容、FAQ
3. 寫新嘅 `assets/xxx.js`
4. 喺首頁將對應嘅「即將推出」卡片改成連結
5. 喺 `sitemap.xml` 加入新網址
