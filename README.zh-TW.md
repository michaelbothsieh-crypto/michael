# Michael Product Lab

繁體中文 | [English](./README.md)

這是一個雙語作品集，把 Michael 的 public / private GitHub 專案整理成產品案例，而不是單純列 repo。

這個專案使用 Next.js、TypeScript、Tailwind CSS、GSAP，以及基於 GitHub CLI 的靜態資料管線。

## 作品集會呈現什麼

- 所有整理過的 GitHub repo 產品卡
- 繁中 / 英文切換
- 產品線分類篩選
- 精選產品區
- 建立時間與最後更新時間
- 可用 demo 的實際截圖
- 沒有公開 demo 或部署失效時的 fallback preview
- 以「解決什麼問題」為主的產品文案
- Telegram 工具會寫出指令輸入後會得到什麼

private repo 會以產品案例展示，但不會在 UI 裡公開原始碼連結。

## 常用指令

```bash
npm run dev
npm run lint
npm run build
npm run projects -- list
npm run sync:repos
npm run sync:previews
npm run sync:all
```

`sync:repos` 使用本機的 `gh` 登入狀態，因此需要 GitHub CLI 已經登入，且有權限讀取 Michael 的 repo。

`sync:previews` 使用 Playwright Chromium。repo 有可用 `homepageUrl` 時會截實際畫面；沒有公開首頁或部署失效時，會產生 fallback preview。

截圖腳本也會偵測常見的 404、missing deployment 頁面，避免把壞掉的部署頁當成產品預覽。

## 資料檔

- `src/data/repos.generated.json`：由 GitHub metadata 產生。
- `src/data/preview-manifest.generated.json`：由 preview capture script 產生。
- `src/data/project-overrides.json`：人工維護的產品文案層，包含分類、雙語文案、功能、精選狀態與排序。

`personal-bot-gateway` 的部署網址只是 webhook health page，不是產品首頁，所以作品集使用實際 Telegram 輸出截圖。

## 專案內容 CRUD

用本地 CRUD helper 維護產品文案。它只會修改 `src/data/project-overrides.json`，不會碰 generated GitHub metadata，也不會讓 UI component 直接做資料寫入。

```bash
npm run projects -- list
npm run projects -- get personal-bot-gateway
npm run projects -- upsert personal-bot-gateway \
  --category "AI Automation" \
  --featured true \
  --sort-weight 120 \
  --title-zh "Personal Bot Gateway" \
  --title-en "Personal Bot Gateway" \
  --summary-zh "我最常用的 Telegram 驅動工作中樞。" \
  --summary-en "My most-used Telegram-driven operations hub." \
  --features-zh "Telegram 指令中樞|KOL 每日掃描|NotebookLM 連動" \
  --features-en "Telegram command hub|Daily KOL scanning|NotebookLM handoff"
npm run projects -- delete old-project-name
```

## 架構邊界

這個 app 會把資料、產品文案和 UI 行為拆開，避免互相干擾。

- `scripts/`：負責資料產生與 preview capture。
- `src/data/`：存 generated metadata 和人工覆寫的產品文案。
- `src/lib/projects.ts`：project catalog read model。UI component 只讀正規化後的 `Project`。
- `src/components/PortfolioExperience.tsx`：只負責頁面狀態，例如語言、分類、選取的 project。
- `src/components/portfolio/`：只放展示元件與小型 UI 元件。
- `scripts/project-overrides.mjs`：負責本地 CRUD 操作。

之後如果要做線上 CRUD 編輯，create / update / delete 應該放在資料層或 API route 後面。卡片、modal、section 都應該保持 display-only。

## 本機開發

```bash
npm install
npx playwright install chromium
npm run sync:all
npm run dev
```

打開 `http://localhost:3000`。
