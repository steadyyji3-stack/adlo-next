/**
 * EC 商品貼文模板組（電商品牌 / 實體+電商 業態用）
 *
 * 用途：輸入品牌名 + 產業 + 本週主題（選填）+ 標籤（選填），
 *      產出 7 天「商品貼文」初稿（社群 / 賣場公告通用）。
 *
 * 架構對齊 gbp-post-writer.ts：
 * - 純 deterministic template，不打外部 AI API → 零成本、無速率限制、無 cost-cap
 * - 共用 line-broadcast 的 INDUSTRY_TAGS 標籤池（標籤點選 ≠ AI 聊天）
 * - 一組 7 篇、業態通用、標籤驅動（product / audience / value 三組各自嵌入不同天）
 *
 * v1（2026-06）：第一個電商客戶為 Shopline 3C 品牌，但模板刻意寫成
 * 業態通用——零售酒商、選物店、食品電商都直接可用。
 */

import {
  INDUSTRY_TAGS,
  type LineIndustry,
  type TagGroup,
  type TagGroupKey,
} from './line-broadcast';

export type EcIndustry = LineIndustry;

export type EcPostCategory =
  | '新品主打'
  | '賣點拆解'
  | '使用情境'
  | '怎麼挑'
  | '客評見證'
  | '檔期促銷'
  | 'FAQ';

export interface GeneratedEcPost {
  day: string;
  category: EcPostCategory;
  title: string;
  content: string;
  bestTime: string;
  imageHint: string;
  characterCount: number;
}

/** 與 gbp-post-writer 的 PostWriterInput 同形。 */
export interface EcPostWriterInput {
  storeName: string;
  industry: EcIndustry;
  weekTheme?: string;
  /** 用戶從 INDUSTRY_TAGS 勾選的標籤。建議 1-5 個。 */
  selectedTags?: string[];
}

/** 電商發文高峰（台灣電商流量：午休滑手機 + 晚間下單時段） */
const TIMES = {
  noon: '12:30',
  evening: '20:30',
  night: '21:00',
} as const;

/** 7 天結構性 meta — 所有業態共用 */
const DAY_META: Array<{
  day: string;
  category: EcPostCategory;
  bestTime: string;
  imageHint: string;
}> = [
  { day: '週一', category: '新品主打', bestTime: TIMES.noon, imageHint: '商品 45 度角主圖，單純淺色背景，光線均勻' },
  { day: '週二', category: '賣點拆解', bestTime: TIMES.evening, imageHint: '商品細節特寫（材質、做工、標示），一張只講一個賣點' },
  { day: '週三', category: '使用情境', bestTime: TIMES.noon, imageHint: '商品放進真實場景（桌面、車上、包包旁）的生活感照片，自然光' },
  { day: '週四', category: '怎麼挑', bestTime: TIMES.night, imageHint: '2-3 件同類商品並排平拍，乾淨背景，不放文字壓圖' },
  { day: '週五', category: '客評見證', bestTime: TIMES.evening, imageHint: '評價截圖（遮蓋個資）或客人視角的開箱照' },
  { day: '週六', category: '檔期促銷', bestTime: TIMES.noon, imageHint: '組合商品平拍（flat lay），畫面傳達「搭在一起剛剛好」' },
  { day: '週日', category: 'FAQ', bestTime: TIMES.evening, imageHint: '出貨包裝實拍或單張 QA 圖卡，乾淨不雜亂' },
];

interface BuildCtx {
  name: string;
  theme: string;
  /** product 組第一個被勾的標籤（空字串 = 沒勾） */
  product: string;
  /** audience 組第一個被勾的標籤 */
  audience: string;
  /** value 組第一個被勾的標籤 */
  value: string;
  /** 用戶 raw tags join（供需要列舉的模板使用） */
  tagsJoined: string;
}

type EcPostBuilder = (c: BuildCtx) => { title: string; content: string };

// ─────────────────────────────────────────────────────────────────
// 7 篇模板 — 一組通用、標籤驅動
// 語感鐵律：短句、多換行、台灣品牌小編的自然書面感；
// 正文直接可用，不出現占位指示。
// ─────────────────────────────────────────────────────────────────

const EC_TEMPLATES: EcPostBuilder[] = [
  // 週一 新品主打 — weekTheme 或 product 標籤開場
  ({ name, theme, product }) => {
    const lead = theme || product;
    return {
      title: '本週主打，先看這個',
      content: lead
        ? `${name} 本週主打：${lead}。\n\n上架前我們自己先用了一陣子，\n確定會回購，才放上賣場。\n\n規格、價格、現貨數量都在商品頁，\n看完喜歡再下單就好。`
        : `${name} 本週上了一批新品。\n\n每一件都是我們自己先用過、\n確定會回購才進的。\n\n賣場已經更新，有空進來滑一下。`,
    };
  },
  // 週二 賣點拆解 — value 標籤帶入，教育型
  ({ name, value }) => ({
    title: '同樣的東西，差在哪',
    content: value
      ? `常被問：看起來差不多的商品，\n為什麼 ${name} 的價格不一樣。\n\n差別在「${value}」。\n\n我們進貨前會先確認來源、\n實際試過品質，\n不到標準的就不上架。\n\n價格不是最低，\n但拿到手會知道差在哪。`
      : `常被問：看起來差不多的商品，\n為什麼價格有差。\n\n差別多半在看不到的地方——\n選品、檢查、售後。\n\n${name} 的標準很簡單：\n自己不會買的，不上架。`,
  }),
  // 週三 使用情境 — audience 標籤帶入
  ({ name, audience }) => ({
    title: '它最常出現的幾個時刻',
    content: audience
      ? `${name} 的商品，\n最常出現在這幾個時刻：\n\n・通勤路上\n・車上\n・辦公桌前\n・外出的包包裡\n\n其中「${audience}」是客人最常跟我們聊到的情境。\n\n如果你也是，\n賣場裡有依情境整理的分類，\n找起來會快很多。`
      : `${name} 的商品，\n最常出現在這幾個時刻：\n\n・通勤路上\n・車上\n・辦公桌前\n・外出的包包裡\n\n挑東西之前，先想「會在哪裡用」，\n通常就不會買錯。`,
  }),
  // 週四 怎麼挑 — 同類商品 3 個判準，建立專業感、不貶低同業
  ({ name, product }) => ({
    title: '同類商品怎麼挑，三個判準',
    content: `${product ? `想買${product}，選擇很多` : '同類商品選擇很多'}，怎麼挑？\n${name} 給你三個判準：\n\n一、看用料和規格，\n寫得越清楚的越可靠。\n二、看保固和售後，\n願意給承諾的，通常對品質有把握。\n三、看實際使用評價，\n比廣告文案準得多。\n\n每一家都有自己的強項，\n照這三點挑，買到的不會差。`,
  }),
  // 週五 客評見證 — 引客人回饋框架 + 回應
  ({ name }) => ({
    title: '上週收到的一則評價',
    content: `「下單前問了很多問題，\n客服都有耐心回，\n到貨也比想像中快。」\n\n上週客人留下的評價。\n\n${name} 想說：\n出貨速度可以練，回覆速度可以練，\n但「願意被問」是我們最在意的事。\n\n有任何不確定的，\n下單前都可以先傳訊息問。`,
  }),
  // 週六 檔期促銷 — 免運門檻 / 組合優惠的溫和框架
  ({ name, product }) => ({
    title: '這週結帳前的小提醒',
    content: `${name} 賣場的滿額免運門檻一直都在，\n這週${product ? `「${product}」相關的` : ''}幾組商品\n搭起來剛好會超過門檻。\n\n不用硬湊。\n但如果購物車裡本來就有想買的，\n這週一起結帳會比較划算。\n\n組合內容在賣場首頁，\n自己搭配也可以。`,
  }),
  // 週日 FAQ — 出貨 / 保固 / 退換貨
  ({ name }) => ({
    title: '常被問的三件事，一次回',
    content: `每週都會被問，這裡一次回：\n\n出貨——付款後 1-2 個工作天出貨，\n遇假日順延。\n\n保固——依各商品頁標示，\n保固內有問題，我們處理到好。\n\n退換貨——鑑賞期內未使用可退，\n運費規則商品頁都有寫。\n\n其他問題，\n賣場訊息直接傳給 ${name}，\n看到都會回。`,
  }),
];

// ─────────────────────────────────────────────────────────────────
// 標籤分組 helper（私有實作，與 gbp-post-writer 同思路）
// ─────────────────────────────────────────────────────────────────

function pickFirstTagInGroup(
  selectedTags: string[],
  groups: TagGroup[],
  key: TagGroupKey,
): string {
  const g = groups.find((x) => x.key === key);
  if (!g) return '';
  return selectedTags.find((t) => g.tags.includes(t)) ?? '';
}

/**
 * 產出 7 天 EC 商品貼文初稿。Deterministic — 同樣 input 同樣 output。
 */
export function generateEcPosts(input: EcPostWriterInput): GeneratedEcPost[] {
  const name = input.storeName.trim() || '我們';
  const theme = input.weekTheme?.trim() || '';
  const selectedTags = (input.selectedTags ?? [])
    .map((t) => t.trim())
    .filter(Boolean);

  const groups = INDUSTRY_TAGS[input.industry] ?? INDUSTRY_TAGS['其他'];

  const ctx: BuildCtx = {
    name,
    theme,
    product: pickFirstTagInGroup(selectedTags, groups, 'product'),
    audience: pickFirstTagInGroup(selectedTags, groups, 'audience'),
    value: pickFirstTagInGroup(selectedTags, groups, 'value'),
    tagsJoined: selectedTags.join('、'),
  };

  return DAY_META.map((meta, idx) => {
    const built = EC_TEMPLATES[idx](ctx);
    return {
      ...meta,
      title: built.title,
      content: built.content,
      characterCount: Array.from(built.content).length,
    };
  });
}
