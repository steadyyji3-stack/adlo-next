/* ─────────────────────────────────────────────────────────────────
   adlo 進階服務定義
   AI 代管協助 + 企業 Agent 建立 / 產品數位市調
───────────────────────────────────────────────────────────────── */

export interface ServiceFeature {
  title: string;
  desc: string;
}

export interface ServicePackage {
  name: string;
  items: string[];
  badge?: string;
}

export interface NewService {
  slug: 'ai-management' | 'market-research';
  name: string;
  nameEn: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  heroDesc: string;
  color: string;          // Tailwind gradient class
  iconName: string;
  /** 服務對象 */
  targets: string[];
  /** 核心功能模組 */
  features: ServiceFeature[];
  /** 交付套餐 */
  packages: ServicePackage[];
  /** 流程步驟 */
  process: { step: string; title: string; desc: string }[];
  /** FAQ */
  faqs: { q: string; a: string }[];
  coverImage: { url: string; alt: string };
}

export const newServices: NewService[] = [
  /* ── AI 代管協助 + 企業 Agent ─────────────────────────────── */
  {
    slug: 'ai-management',
    name: 'AI 代管協助',
    nameEn: 'AI Management & Enterprise Agent',
    tagline: '讓 AI 成為你的員工，24 小時不間斷運作',
    metaTitle: 'AI 代管協助 × 企業 Agent 建立 | adlo',
    metaDescription: '協助企業建立專屬 AI Agent、自動化工作流程、客服機器人與內容生成管道。讓 AI 真正融入你的商業流程，降低人力成本、提升回應速度。',
    heroDesc: '大多數企業對 AI 的使用停留在「偶爾問問 ChatGPT」。adlo 幫你建立真正能工作的企業級 AI 系統——從客服 Agent 到內部流程自動化，讓 AI 成為你團隊的一部分。',
    color: 'from-violet-900 to-slate-900',
    iconName: 'lucide:bot',
    targets: [
      '想導入 AI 但不知從何開始的中小企業',
      '客服量大、希望自動化回覆的電商 / 服務業',
      '需要大量內容生產的行銷團隊',
      '想建立競爭對手監控系統的品牌',
      '有重複性內部流程希望自動化的企業',
    ],
    features: [
      {
        title: '企業 AI Agent 建立',
        desc: '根據你的業務流程，建立專屬 AI Agent（基於 Claude / GPT-4）。可執行客服問答、報價計算、文件生成、數據摘要等任務，並串接你的現有系統。',
      },
      {
        title: '客服自動化 Chatbot',
        desc: '訓練了解你產品、政策、常見問題的 AI 客服。部署於網站、LINE、Facebook Messenger，7×24 自動回應，人工接手流程無縫銜接。',
      },
      {
        title: '內容生成管道建立',
        desc: '建立自動化內容工廠：從競爭對手監控、關鍵字研究，到初稿生成、格式排版、多平台發布——整條流程自動化，大幅降低內容生產成本。',
      },
      {
        title: 'n8n 工作流程自動化',
        desc: '使用 n8n 串接你的 CRM、表單、Email、Google Sheets、Notion 等工具，建立跨系統自動化流程。客戶填表→自動建檔→自動通知→自動追蹤，一氣呵成。',
      },
      {
        title: 'AI 系統維護與優化',
        desc: '每月審查 AI 表現數據，持續優化 prompt 策略、更新知識庫、修正錯誤回應。確保 AI 系統隨業務成長而進化，而不是裝了就放著。',
      },
      {
        title: '團隊 AI 使用培訓',
        desc: '提供客製化 AI 工具使用培訓，讓你的團隊真正會用 AI 提升工作效率——而不是只會問「幫我寫一封信」。',
      },
    ],
    packages: [
      {
        name: 'AI 入門套餐',
        badge: '最多人選',
        items: [
          'AI 客服 Chatbot 建立（網站 + LINE）',
          '知識庫建立（FAQ 上傳訓練）',
          '基礎 n8n 流程 1 條（表單→通知）',
          '月度 AI 表現報告',
          '3 小時團隊培訓',
        ],
      },
      {
        name: '企業 Agent 套餐',
        badge: '推薦',
        items: [
          '客製化企業 AI Agent 建立',
          '多平台部署（網站 / LINE / FB / 內部系統）',
          'n8n 流程 3 條（客製化）',
          'CRM 串接（Notion / Airtable / HubSpot）',
          '競爭對手自動監控系統',
          '每月維護 + 優化 + 月報',
          '無限次數問題支援',
        ],
      },
      {
        name: '全自動內容工廠',
        items: [
          '關鍵字研究 → AI 初稿生成管道',
          '多平台自動發布（部落格 / FB / IG / LINE）',
          'AI 圖片生成整合',
          '內容效果自動追蹤回報',
          '每月 30 篇內容自動產出',
        ],
      },
    ],
    process: [
      { step: '01', title: '需求訪談', desc: '深入了解你的業務流程、痛點與目標，找出 AI 介入最有 ROI 的環節。' },
      { step: '02', title: '系統設計', desc: '規劃 AI Agent 架構、知識庫來源、串接工具清單，提供完整設計文件。' },
      { step: '03', title: '開發建置', desc: '建立 AI Agent、設計 prompt 策略、串接所有系統，並進行完整功能測試。' },
      { step: '04', title: '培訓上線', desc: '提供團隊使用培訓，確保所有人都能正確使用和維護 AI 系統。' },
      { step: '05', title: '持續優化', desc: '每月審查數據，優化 AI 表現，更新知識庫，確保系統持續進化。' },
    ],
    faqs: [
      {
        q: '我不懂技術，可以導入 AI 嗎？',
        a: '完全可以。我們負責所有技術建置，你只需要告訴我們你的業務流程和目標。完成後我們會提供使用手冊和培訓，確保你的團隊能夠輕鬆使用。',
      },
      {
        q: 'AI Agent 建立需要多久？',
        a: '基礎客服 Chatbot 約 1–2 週可上線。複雜的企業 Agent（含多系統串接）通常需要 3–6 週。我們會在提案時給出精確的時程。',
      },
      {
        q: '使用哪些 AI 技術？',
        a: '主要使用 Claude（Anthropic）和 GPT-4（OpenAI）作為 AI 核心，n8n 作為自動化平台。根據你的需求和預算，選擇最合適的組合。',
      },
      {
        q: 'AI 客服的準確率有多高？',
        a: '在良好的知識庫建立下，常見問題回答準確率可達 90% 以上。我們設計「不確定時轉人工」的機制，確保客戶體驗不受影響。',
      },
      {
        q: '月費包含哪些服務？',
        a: '月費包含：系統維護、知識庫更新、prompt 優化、錯誤修正、月度表現報告，以及無限次問題支援。不另收 API 使用費（按實際用量另計）。',
      },
    ],
    coverImage: {
      url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&auto=format&fit=crop&q=80',
      alt: 'AI 企業自動化概念圖',
    },
  },

  /* ── 產品數位市調 ─────────────────────────────────────────── */
  {
    slug: 'market-research',
    name: '產品數位市調',
    nameEn: 'Digital Market Research',
    tagline: '用數據說話，在進入市場前看清全局',
    metaTitle: '產品數位市調服務 | adlo',
    metaDescription: '提供完整的數位市場調查：關鍵字搜尋量分析、競爭對手策略解構、消費者行為研究、市場規模估算，協助品牌在進入新市場或推出新產品前做出有依據的決策。',
    heroDesc: '在台灣，大多數中小企業的市場決策靠的是直覺和經驗。adlo 的數位市調服務，用搜尋數據、競爭分析、社群聆聽，給你做決策真正需要的數字——而不是感覺。',
    color: 'from-blue-900 to-slate-900',
    iconName: 'lucide:bar-chart-2',
    targets: [
      '準備推出新產品 / 服務的品牌',
      '計劃進入新城市或新市場的企業',
      '不確定目標客群在哪裡的新創',
      '想了解競爭對手在做什麼的行銷主管',
      '需要向投資人或內部提案的決策者',
    ],
    features: [
      {
        title: '關鍵字搜尋量分析',
        desc: '透過 Google Keyword Planner、Ahrefs、Search Console，精確分析台灣市場的搜尋需求規模、季節性趨勢、競爭難度，幫你找到最有效的市場切入點。',
      },
      {
        title: '競爭對手數位策略解構',
        desc: '深度分析 3–5 個主要競爭對手的 SEO 策略、廣告投放、內容佈局、社群表現，找出他們的優勢與盲點，讓你知道從哪裡超車。',
      },
      {
        title: '消費者行為與社群聆聽',
        desc: '分析 PTT、Dcard、Facebook 社團、Instagram 的真實消費者討論，了解目標客群的痛點、偏好、決策邏輯，讓你的產品定位更精準。',
      },
      {
        title: '市場規模與機會評估',
        desc: '結合搜尋數據、廣告競爭指數、社群討論量，估算目標市場的可觸及規模（TAM / SAM / SOM），幫你評估進入市場的 ROI 預期。',
      },
      {
        title: '在地化需求分析',
        desc: '針對台灣特定城市、區域、族群做深度需求分析。不同城市的消費者有不同的搜尋習慣和決策因素，我們幫你找出差異並制定策略。',
      },
      {
        title: '完整市調報告輸出',
        desc: '所有分析整合成一份結構清晰的 PDF 報告，包含執行摘要、數據圖表、策略建議、行動清單。可直接用於內部提案、投資人簡報或行銷規劃。',
      },
    ],
    packages: [
      {
        name: '快速市場掃描',
        items: [
          '核心關鍵字 Top 50 搜尋量分析',
          '主要競爭對手 × 3 快速分析',
          '市場機會摘要報告（10–15頁）',
          '1 次線上說明會（60 分鐘）',
        ],
      },
      {
        name: '完整市調報告',
        badge: '最多人選',
        items: [
          '關鍵字宇宙建立（500+ 關鍵字）',
          '競爭對手深度解構 × 5',
          '社群聆聽分析（PTT / Dcard / FB）',
          '消費者旅程地圖',
          '市場規模估算（TAM / SAM）',
          '完整報告（30–50頁 PDF）',
          '2 次策略說明會',
          '1 個月問題支援',
        ],
      },
      {
        name: '新產品上市研究',
        items: [
          '目標族群深度訪談（5–8 人）',
          '產品定位測試',
          '競品價格策略分析',
          '上市關鍵字策略規劃',
          '渠道建議（哪個平台先打）',
          '完整上市市調報告',
          '3 次策略共識會議',
        ],
      },
    ],
    process: [
      { step: '01', title: '研究範圍定義', desc: '確認市調目的、目標市場、競爭對手範圍、交付時程與報告格式。' },
      { step: '02', title: '數據收集', desc: '使用 Google Keyword Planner、Ahrefs、SEMrush、社群聆聽工具，收集多維度原始數據。' },
      { step: '03', title: '分析與洞察', desc: '整合所有數據，找出市場機會缺口、競爭弱點、消費者需求未被滿足的地方。' },
      { step: '04', title: '報告撰寫', desc: '將洞察整合成可讀性高的報告，包含圖表視覺化、具體建議與優先行動清單。' },
      { step: '05', title: '說明與問答', desc: '線上報告說明會，帶你看懂每一個數字的意義，並回答所有策略問題。' },
    ],
    faqs: [
      {
        q: '市調報告需要多久交付？',
        a: '快速市場掃描：5–7 個工作天。完整市調報告：2–3 週。新產品上市研究（含訪談）：3–4 週。我們會在提案時確認你的時程需求。',
      },
      {
        q: '報告是繁體中文嗎？',
        a: '是的，所有報告均以繁體中文撰寫，針對台灣市場數據。如有需要，可提供中英雙語版本（加收費用）。',
      },
      {
        q: '市調數據的準確性如何？',
        a: '我們使用業界主流工具（Google Keyword Planner、Ahrefs、SEMrush）並交叉驗證數據。搜尋量數據為估算值，我們會在報告中清楚標示數據來源與信心水準。',
      },
      {
        q: '可以針對特定城市做市調嗎？',
        a: '可以。我們的在地化需求分析可以針對台北、台中、高雄或特定行政區進行深度研究，幫你了解不同城市市場的差異。',
      },
      {
        q: '市調完成後可以協助執行嗎？',
        a: '可以。市調報告完成後，我們可以銜接在地 SEO、Google Ads、內容行銷等執行服務，讓研究直接轉化為行動。',
      },
    ],
    coverImage: {
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
      alt: '數位市場調查數據分析',
    },
  },
];

export function getNewServiceBySlug(slug: string): NewService | undefined {
  return newServices.find(s => s.slug === slug);
}

export function getAllNewServices(): NewService[] {
  return newServices;
}
