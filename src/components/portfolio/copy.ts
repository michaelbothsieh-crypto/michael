export const copy = {
  zh: {
    nav: ["精選", "分類", "全部作品"],
    eyebrow: "MICHAEL PRODUCT LAB",
    headlineA: "把 TG 工作流、AI",
    headlineB: "和資料產品",
    headlineC: "做成可用工具",
    intro:
      "這裡整理了我的 GitHub public 和 private 專案。每個 repo 都被當成一個產品案例來看：它解決什麼問題、怎麼被使用、目前維護到哪裡。",
    primaryAction: "看精選作品",
    secondaryAction: "瀏覽全部",
    featured: "精選產品",
    featuredIntro: "最常用的 Telegram 工作中樞放在第一位，後面再看金融、AI、資料和工具產品。",
    categories: "用產品線瀏覽",
    categoryStory:
      "Telegram 指令、KOL 掃描、NotebookLM、金融決策、資料研究和工具產品放在同一個產品實驗室裡看，會比單純列 repo 更接近我真正想展示的東西。",
    all: "全部",
    allProjects: "全部作品",
    projectsCount: "個案例",
    created: "建立",
    updated: "更新",
    stack: "技術",
    openDemo: "Demo",
    openSource: "GitHub",
    close: "關閉",
    noSource: "這是內部或私人作品，所以這裡只展示產品脈絡與截圖。",
    footer:
      "部分作品是內部工具或客戶案例，因此只展示產品截圖與功能摘要。需要看更細的實作，再另外打開就好。",
  },
  en: {
    nav: ["Featured", "Categories", "All Work"],
    eyebrow: "MICHAEL PRODUCT LAB",
    headlineA: "Turning TG workflows, AI",
    headlineB: "and data products",
    headlineC: "into usable tools",
    intro:
      "This portfolio organizes my public and private GitHub projects as product cases: what each one solves, how it is used, and how active it is.",
    primaryAction: "View featured",
    secondaryAction: "Browse all",
    featured: "Featured products",
    featuredIntro:
      "The Telegram operations hub comes first because it is the product I use most, followed by finance, AI, data, and utility work.",
    categories: "Browse by product line",
    categoryStory:
      "Telegram commands, KOL scanning, NotebookLM handoff, financial intelligence, data research, and product utilities make more sense as a product lab than as a raw repo list.",
    all: "All",
    allProjects: "All projects",
    projectsCount: "cases",
    created: "Created",
    updated: "Updated",
    stack: "Stack",
    openDemo: "Demo",
    openSource: "GitHub",
    close: "Close",
    noSource: "This is internal or private work, so the portfolio shows product context and screenshots instead of source.",
    footer:
      "Some projects are internal tools or client-facing work, so I show product context and screenshots instead of source links. Deeper implementation details can be opened case by case.",
  },
} as const;

export type PortfolioCopy = (typeof copy)[keyof typeof copy];
