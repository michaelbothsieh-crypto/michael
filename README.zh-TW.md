# Michael Product Lab (產品實驗室)

<p align="center">
  <a href="README.md">English</a> | 繁體中文
</p>

這個專案把我開發的開源與私有專案整理成產品案例。這裡不只有程式碼，而是直接看這些工具解決了什麼實際問題。

建立這個實驗室，是為了讓合作夥伴或公司主管能快速了解我如何思考產品、如何設計系統架構，特別是在金融決策、AI 自動化與實用工具等領域。

---

## 核心技術架構與設計模式 (Core Technical Architecture & Design Patterns)

此作品集包含多個獨立的 AI 自動化與金融決策專案，它們各自解決了特定的日常痛點。以下為這些專案所採用的通用核心技術實作與設計重點：

### 技術實作與設計重點：
- **非同步任務與排程執行**：由 **GitHub Actions** 跑排程觸發 Python ETL，抓取 YouTube API 以及 Fugle/FinMind 的台股報價，接著用 `NLM_COOKIE_BASE64` 仿真 cookie session 將影音上傳到 **NotebookLM** 完成語音轉文字與摘要。
- **快取與 API 配額限制**：為防止 Webhook 流量暴增或重覆爬取導致 API 額度超支，使用 **Upstash Redis** 作為快取層，實作 TTL 緩衝與 Rate Limiting。
- **資料庫持久化**：採用 **Neon Serverless PostgreSQL** 搭配 Drizzle/Prisma 做 Schema 遷移，利用 scale-to-zero 節省閒置成本，並透過資料庫分支 (Branching) 功能開闢獨立的測試環境。
- **容錯與警報機制**：爬蟲偵測到 MOPS 網頁結構變更時會觸發 Regex 容錯，並立刻透過 **Telegram Webhook** 推送警報通知，避免排程任務默默失敗。

---

## 精選產品亮點 (Featured Product Spotlights)

這裡精選了四個核心專案，並附上開發初衷與實際運行畫面：

### 1. Personal Bot Gateway (personal-bot-gateway) [AI 自動化]
* **設計初衷**：每天追蹤 KOL、Podcast、個股、ETF 等資訊入口太分散，資訊難以系統化整理。這款 Bot 將 TG 指令輸入、NotebookLM 分析、報告連結與市場行情回覆集中在同一個 Telegram 對話框中。
* **技術亮點**：套用 `LazyTube-Assistant` 的核心語意處理與 NotebookLM 串接邏輯。使用 Vercel Serverless (TS) 實作 API 網關，並利用 Redis 快取降低 75% API 成本，整合 GitHub Actions 觸發與 NotebookLM 仿真 Session 登入。
* **實際畫面**：
  ![Personal Bot Gateway Preview](./public/previews/personal-bot-gateway-features.jpg)

### 2. Price Atlas (price-altas) [資料研究]
* **設計初衷**：採購與跨境商家在比對各國商品價格時，必須開啟多個分頁查詢並手動換算匯率。此工具一鍵併發向台、美、日主流平台查價並自動折算即時匯率。
* **技術亮點**：後端採用 FastAPI 協同 Python 異步爬蟲，以 SSE (Server-Sent Events) 串流技術即時回傳比價結果。使用 `curl_cffi` 偽裝 Chrome TLS/JA3 指紋以繞過 WAF 防爬限制。
* **實際畫面**：
  *(詳見網頁作品集內實物畫面)*

### 3. 台股健康儀表板 (tw-stock-health-dashboard) [金融決策]
* **設計初衷**：投資人每日需手動收集台股大盤、融資券與海外風險指標，流程繁瑣且不易早期察覺市場籌碼崩盤訊號。
* **技術亮點**：設計非同步 ETL Pipeline，利用 Promise.all 併發抓取並在 Redis 中進行快取，並透過簡單神經網絡進行崩盤預警因子的加權估算。

### 4. 飛皓科技形象網站 (fehow-web) [企業網站]
* **設計初衷**：電子供應鏈企業需要具備國際公信力的官方網站，以向海外客戶呈現技術與供應實力。
* **技術亮點**：採用 Next.js + CSS Grid 打造 Bento Grid 響應式佈局，並優化 GSAP 滾動動畫在行動端的流暢度。
* **實際畫面**：
  ![Fehow Corporate Site Preview](./public/previews/fehow-web-hero.png)

---

## 全部專案與技術矩陣 (All Projects &amp; Tech Matrix)

以下整理出全部 22 個專案的分類、核心技術、外部服務整合以及部署狀態，方便快速檢索與對照：

| 專案名稱 (Repo) | 產品線 (Category) | 核心技術 (Tech Stack) | 對外整合服務 (Integrations) | 部署與展示 (Deployment) |
| :--- | :--- | :--- | :--- | :--- |
| [personal-bot-gateway](https://github.com/michaelbothsieh-crypto/personal-bot-gateway) | AI 自動化 | TypeScript, FastAPI | Telegram/LINE Webhook, Neon DB, Upstash Redis, NotebookLM | [Vercel](https://personal-bot-gateway.vercel.app) (Private) |
| [LazyTube-Assistant](https://github.com/michaelbothsieh-crypto/LazyTube-Assistant) | AI 自動化 | Python | GitHub Actions, NotebookLM API, Telegram Bot, Neon DB | [Vercel](https://lazy-tube-assistant.vercel.app) |
| [tw-stock-health-dashboard](https://github.com/michaelbothsieh-crypto/tw-stock-health-dashboard) | 金融決策 | TypeScript, Next.js | GitHub Actions, Upstash Redis, Telegram Bot | [Vercel](https://tw-stock-health-dashboard.vercel.app) |
| [price-altas](https://github.com/michaelbothsieh-crypto/price-altas) | 資料研究 | Python, FastAPI | Amazon/Yahoo APIs, Exchange Rate API, Upstash Redis | [Render](https://price-altas-frontend.vercel.app/) (Private) |
| [fortune-telling](https://github.com/michaelbothsieh-crypto/fortune-telling) | 實驗原型 | TypeScript, React | Google Gemini AI API, PWA | [GitHub Pages](https://fortune-telling-sigma.vercel.app/) |
| [fehow-web](https://github.com/michaelbothsieh-crypto/fehow-web) | 企業形象 | Next.js, Tailwind | GSAP ScrollTrigger, Bento Grid | Vercel (Local Preview) |
| [xiexing-pwa](https://github.com/michaelbothsieh-crypto/xiexing-pwa) | 企業形象 | TypeScript, Next.js | Service Worker, PWA, Next-Gen Image Pipeline | Vercel (Local Preview) |
| [yellowstone-clinic](https://github.com/michaelbothsieh-crypto/yellowstone-clinic) | 企業形象 | TypeScript, Next.js | PWA, WCAG Accessibility Guidelines | Vercel (Local Preview) |
| [insider-watch-bot](https://github.com/michaelbothsieh-crypto/insider-watch-bot) | 金融決策 | TypeScript | GitHub Actions, MOPS Scraper, Telegram Webhook | [GitHub](https://github.com/michaelbothsieh-crypto/insider-watch-bot) |
| [msg-converter](https://github.com/michaelbothsieh-crypto/msg-converter) | 工具產品 | HTML5, JavaScript | WebCrypto, OLE2 Binary Parser | GitHub Pages |
| [financial-news-analysis](https://github.com/michaelbothsieh-crypto/financial-news-analysis) | 金融決策 | Streamlit, Python | OpenAI GPT API, Streamlit Cloud | [Render](https://github.com/michaelbothsieh-crypto/financial-news-analysis) (Private) |
| [taiwan-nhi-calculator](https://github.com/michaelbothsieh-crypto/taiwan-nhi-calculator) | 工具產品 | HTML5, JavaScript | Decimals Math Library, Unit Testing | GitHub Pages (Private) |
| [team-eats](https://github.com/michaelbothsieh-crypto/team-eats) | 工具產品 | TypeScript, React | WebSocket, LocalStorage, PWA | GitHub Pages (Private) |
| [socket-swiss-knife](https://github.com/michaelbothsieh-crypto/socket-swiss-knife) | 工具產品 | Python | MTF TCP Socket, Tauri/Electron, GUI | Desktop App (Private) |
| [warrant-screener-tw](https://github.com/michaelbothsieh-crypto/warrant-screener-tw) | 金融決策 | JavaScript, Python | Black-Scholes Greeks Engine, requestAnimationFrame | [Vercel](https://warrant-screener-tw.vercel.app) (Private) |
| [Config-Diff-Viewer](https://github.com/michaelbothsieh-crypto/Config-Diff-Viewer) | 工具產品 | TypeScript, React | Web Worker, Myer's Diff, Virtual Scroll | [Vercel](https://config-diff-viewer.vercel.app) |
| [PodScribe](https://github.com/michaelbothsieh-crypto/PodScribe) | AI 自動化 | TypeScript, Next.js | Gemini AI API, Whisper API, Mermaid Mindmap | [Vercel](https://podscribe-six.vercel.app) |
| [presale-radar](https://github.com/michaelbothsieh-crypto/presale-radar) | 資料研究 | Python, Next.js | Leaflet Map, Pandas ETL Pipeline | [Vercel](https://presale-radar.vercel.app) (Private) |
| [neighbor-profiler](https://github.com/michaelbothsieh-crypto/neighbor-profiler) | 資料研究 | TypeScript, React | JCIC Finance Registry, 3D Radar Charts | [Vercel](https://house-dun-one.vercel.app) (Private) |
| [FastAPI-project](https://github.com/michaelbothsieh-crypto/FastAPI-project) | 實驗原型 | Python, FastAPI | Model Context Protocol (MCP), PydanticAI | Jupyter / Local Run (Private) |
| [digit_recognition](https://github.com/michaelbothsieh-crypto/digit_recognition) | 實驗原型 | Python, FastAPI | Scikit-learn (MLP), OpenCV, HTML5 Canvas | [Render](https://github.com/michaelbothsieh-crypto/digit_recognition) (Private) |
| [AIA-Training-Viewer](https://github.com/michaelbothsieh-crypto/AIA-Training-Viewer) | 資料研究 | Jupyter, Python | TFEvent Binary Parser, Recharts | Vercel (Local Preview) (Private) |

---

## 產品研發與自動化維運

除了產品本身，這個實驗室的基礎設施也展示了我的工程自動化能力：

### 1. 自動化預覽管線 (Automated Preview Pipeline)
- **解決方案**：使用 Playwright 建立自動化擷取腳本，自動偵測各專案的官方網站連結並進行截圖。同時，腳本會自動辨識常見的 404 或失效部署頁面，避免將錯誤畫面作為產品預覽呈現。對於沒有公開首頁的專案，會自動生成預覽圖。

### 2. 靜態資料管線 (Static Data Pipeline)
- **解決方案**：透過 GitHub CLI 建立靜態資料管線，在建置（build）階段將 GitHub 專案資訊匯出為 JSON，實現零 API 呼叫的靜態網頁生成（SSG），提升網頁載入速度。

### 3. 多維度資料覆寫機制 (Data Overrides)
- **解決方案**：設計了專案屬性覆寫機制，在不改動 GitHub 原始資料的情況下，補充各專案的分類、中英文產品敘述、痛點分析與精選排序，將程式碼庫提升為產品展示卡。
