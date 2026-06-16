# Michael Product Lab

<p align="center">
  English | <a href="README.zh-TW.md">繁體中文</a>
</p>

This project curates my public and private GitHub repositories into product cases. It moves beyond raw code lists to focus on the actual problems these tools solve.

I built this lab to help partners and managers quickly understand how I approach product development and system design, especially in finance, AI, and utility tools.

---

## System Architecture & Data Flow

The platform integrates a bot gateway, ETL schedulers, caching layers, and databases into a single automated pipeline:

![AI-Driven Financial & Content Automation Platform](./public/architecture.png)

### Core technical implementation:
- **Asynchronous tasks & scheduling**: **GitHub Actions** runs cron jobs to trigger Python ETL scripts for YouTube and Fugle/FinMind API scraping. The pipeline decrypts `NLM_COOKIE_BASE64` to restore cookie sessions for uploading media to **NotebookLM**.
- **Caching & rate limits**: **Upstash Redis** buffers webhook spikes and enforces TTL rules and rate limiting to avoid exceeding third-party API quotas.
- **Database operations**: **Neon Serverless PostgreSQL** runs with Prisma/Drizzle for schema migrations. The database spins down to zero when idle and supports branching for sandbox testing.
- **Fail-safe & alerting**: Scrapers validate the HTML structure of targets like MOPS. Any unexpected changes trigger regex fallbacks and dispatch instant error notifications via a **Telegram Webhook**.

---

## The Problems This Product Lab Solves

Writing code is more than stacking tech. Without real-world utility, technical choices matter little. Resumes often list languages and frameworks, but lack product context.

I created this project to address these gaps:
- **Translates code into business value**: Every listed project starts with the problem it solves, not just a stack of technologies.
- **Showcases private repositories securely**: For proprietary work, it highlights the UI flow and system architecture without exposing source code.
- **Guarantees reliable project presentation**: It uses an automated screenshot pipeline. Even if a project is not publicly hosted or a live demo goes down, the portfolio displays generated previews to ensure constant availability.

---

## Product Lines and Key Features

Projects are divided into six categories, aligning with the product lines on the frontend:

### 1. Financial Intelligence
Aggregates and filters market data to reduce search costs and flag risks.

- **Taiwan Stock Health Dashboard (tw-stock-health-dashboard)** [Featured]
  - **Problem**: Investors waste time gathering daily index, global market, and risk data, making it hard to spot early market crash signals.
  - **Features**: Automatic market summary, global correlation analysis, market crash warning system, real-time Telegram alerts, and **GitHub Actions scheduling**.
- **Taiwan Warrant Screener (warrant-screener-tw)**
  - **Problem**: Warrant terms are complex, and default broker interfaces make cross-asset comparison difficult.
  - **Features**: Multi-criteria filters, side-by-side asset comparison, and a deployed workspace.
- **Insider Watch Bot (insider-watch-bot)**
  - **Problem**: Executive and major shareholder stock transfer announcements are scattered across public sites, making it hard to track insider trading flows.
  - **Features**: Real-time MOPS monitoring, automatic insider sale alerts, trade trend tracking, and **GitHub Actions automated schedules**.
- **Financial News Analysis (financial-news-analysis)**
  - **Problem**: Sifting through thousands of market articles is slow, and subjective bias makes sentiment analysis unreliable.
  - **Features**: Automatic news ingestion, AI-driven sentiment analysis, strategy briefs, and **Render hosting deployment**.
- **SMC Trinity AI (smc-trinity-ai)**
  - **Problem**: Smart Money Concept (SMC) trading analysis is highly subjective and prone to individual bias.
  - **Features**: Automatic SMC chart analysis, multi-agent AI debates, and objective trade adjudication.

### 2. AI Automation
Connects information streams with AI tools to handle repetitive manual workflows.

- **Personal Bot Gateway (personal-bot-gateway)** [Featured]
  - **Problem**: Tracking multiple KOLs, podcasts, news, and Threads posts daily scatters information and prevents synthesis.
  - **Features**: Unified Telegram control hub, daily KOL scans and briefs, automatic NotebookLM report handoffs, instant stock/ETF health checks, **GitHub Actions workflow integration**, and **Neon Serverless DB database integration**.
- **LazyTube Assistant (LazyTube-Assistant)** [Featured]
  - **Problem**: High-value YouTube videos are often long, and manually searching for relevant content is time-consuming.
  - **Features**: Automated search via YouTube API, NotebookLM content briefs, **GitHub Actions scheduling**, Telegram alerts, and **Neon DB persistence**.
- **PodScribe (PodScribe)** [Featured]
  - **Problem**: Podcast takeaways are easily forgotten, and users lack structured transcripts or mind maps for knowledge management.
  - **Features**: Audio transcription, Gemini analysis, structured summaries, and mind maps.
- **Faceless Hunter (faceless_hunter)**
  - **Problem**: Creators lack data on which "faceless" video topics have a higher viral potential on YouTube Shorts.
  - **Features**: YouTube Shorts data scraping, viral ratio calculation, and niche discovery.

### 3. Product Utilities
Tools built to solve specific workflow inefficiencies and boost day-to-day productivity.

- **Config Diff Viewer (Config-Diff-Viewer)**
  - **Problem**: Manually comparing configurations across directories is slow and prone to oversight.
  - **Features**: Two-directory config comparison, visual diff interface, and security reviews.
- **Socket Swiss Knife (socket-swiss-knife)**
  - **Problem**: Financial institutions testing MTF protocols lack simple, cross-platform socket utilities.
  - **Features**: Multi-broker profile management, scheduled load testing, and a cross-platform desktop GUI.
- **Team Eats (team-eats)**
  - **Problem**: Group orders, afternoon tea voting, and expense splitting are messy and time-consuming.
  - **Features**: Meal voting, group order aggregation, and expense splitting logs.
- **MSG Converter (msg-converter)**
  - **Problem**: Windows Outlook `.msg` emails cannot be opened directly on macOS, and layouts often break.
  - **Features**: Offline MSG parsing, macOS-friendly HTML conversion, and automatic attachment extraction.
- **Taiwan NHI Calculator (taiwan-nhi-calculator)**
  - **Problem**: Calculating Taiwan's second-generation National Health Insurance premiums is complex, making it hard to compute net pay.
  - **Features**: Premium calculation, role-based scenarios, and a clean form interface.
- **Broker Credential Dashboard (broker-credential-dashboard)**
  - **Problem**: Managing multiple broker API keys and tracking expiration dates across servers is disorganized.
  - **Features**: Centralized API credential vault, connection status monitoring, and secure administration.

### 4. Business Sites
Modern web portals that build credibility and showcase value for business partners.

- **Fehow Corporate Site (fehow-web)** [Featured]
  - **Problem**: Electronics supply-chain companies need clean, credible websites to win trust from global buyers.
  - **Features**: Corporate branding, Bento Grid layouts, and supply-chain storytelling.
- **Xiexing PWA (xiexing-pwa)**
  - **Problem**: Heavy machinery rental and earthwork services lack mobile exposure, missing out on smartphone traffic.
  - **Features**: Service and machinery catalog, offline-ready PWA, and direct inquiry routing.
- **Yellowstone Clinic Site (yellowstone-clinic)**
  - **Problem**: Rehabilitation clinics need clear service directories so patients can find clinic info and hours easily.
  - **Features**: Therapy and rehab guides, clinic hours, and mobile PWA support.

### 5. Data & Research
Scrapes and analyzes market data to surface opportunities and risks.

- **Price Atlas (price-altas)** [Featured]
  - **Problem**: Purchasing managers and buyers manually compare items across sites, missing exchange-rate shifts and real price gaps.
  - **Features**: Multi-site web scraping, live exchange rate conversions, price gap analysis, and **Render hosting deployment**.
- **POE Price Tracker (poe-price-tracker)**
  - **Problem**: Online game markets experience rapid price shifts, making it hard to trade assets efficiently.
  - **Features**: Live price monitoring, history trend graphs, web dashboard, and **GitHub Actions CI/CD automation**.
- **Presale Radar (presale-radar)**
  - **Problem**: Real estate transaction records are disorganized, making it difficult to spot active areas and new project trends.
  - **Features**: Public registry aggregation, regional volume mapping, real estate market radars, and **GitHub Actions ETL pipeline**.
- **Neighbor Profiler (neighbor-profiler)**
  - **Problem**: Valuations on the same street can vary widely, and local environmental risks are often hidden.
  - **Features**: Local price gap analysis, neighborhood data mapping, and real estate risk alerts.
- **AIA Training Viewer (AIA-Training-Viewer)**
  - **Problem**: Complex AI datasets lack visualization tools, making it hard to inspect and verify training data quality.
  - **Features**: Dataset visualization, training run logs, and a web explorer.

### 6. Experiments
Rapid prototypes built to evaluate new technologies and validate market potential.

- **Fortune Telling PWA (fortune-telling)**
  - **Problem**: Traditional BaZi astrology calculations are complex, and results are hard to understand without expert interpretation.
  - **Features**: Automated BaZi chart plotting, Gemini AI personalized readings, mobile PWA, and **GitHub Actions automated CI/CD**.
- **North Volley Guide (north-volley-guide)**
  - **Problem**: Northern Taiwan volleyball court and club listings are scattered, making it hard to find active locations.
  - **Features**: Curated venue directories, regional searches, and mobile-friendly layouts.
- **Golf Strategy Prototype (golf-strategy-lk-prototype)**
  - **Problem**: Golfers face complex shot decisions on the course and lack tools for strategy simulation.
  - **Features**: Fairway strategy simulation, interactive course plotting, and quick shot validation.
- **Digit Recognition (digit_recognition)**
  - **Problem**: Validating low-latency image preprocessing and machine learning predictions directly in-browser.
  - **Features**: Interactive canvas input, image scaling, real-time MLP classifier predictions, and **Render hosting deployment**.
- **FastAPI MCP Lab (FastAPI-project)**
  - **Problem**: Integrating FastAPI with the Model Context Protocol (MCP) to manage streaming AI interactions.
  - **Features**: FastAPI MCP implementation, PydanticAI exploration, and streaming chat flows.

---

## Infrastructure and Operations

Behind these projects, the portfolio includes engineering automation:

### 1. Automated Preview Pipeline
- **Solution**: Uses Playwright to detect live URLs and capture screenshots automatically. It flags 404 pages and missing deployments to prevent broken images, generating clean fallbacks when no live URL is available.

### 2. Static Data Pipeline
- **Solution**: Uses the GitHub CLI to export metadata into static JSON files during the build phase. This enables static site generation (SSG) with zero runtime API calls, ensuring fast page load times.

### 3. Data Overrides
- **Solution**: Implements a `project-overrides.json` config layer. This allows curation of titles, categories, feature highlights, and problem descriptions without modifying original GitHub metadata.
