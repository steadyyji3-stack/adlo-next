/**
 * Google 廣告浪費估算器 — 規則引擎（deterministic，無 API）
 *
 * 定位：工具箱第一支「廣告」類工具，商品化 R-01 診斷包的「浪費清單」章節。
 * 輸入月預算區間 + 帳戶現況自評 → 輸出每月浪費金額「估算區間」+ 漏錢原因排行。
 *
 * 誠實原則：所有百分比為 adlo 健檢常見發現的典型區間（heuristic），
 * 一律以「區間」呈現並在 UI 標明估算依據，不輸出偽精準單一數字。
 */

export type BudgetLevel = 'b5k' | 'b15k' | 'b30k' | 'b60k' | 'b150k' | 'b150kUp';
export type ManagerType = 'self' | 'agency' | 'employee';

export interface AdWasteStatus {
  hasNegativeKeywords: boolean;
  hasConversionTracking: boolean;
  checksSearchTerms: boolean;
  separatesBrandCampaign: boolean;
  hasGeoTargeting: boolean;
  hasAdSchedule: boolean;
  landingPageMatched: boolean;
}

export interface AdWasteInput {
  industry: string;
  budget: BudgetLevel;
  manager: ManagerType;
  status: AdWasteStatus;
}

export interface LeakItem {
  id: string;
  title: string;
  /** 這個漏洞為什麼在漏錢 */
  why: string;
  /** 今天就能做的修法 */
  fix: string;
  /** 浪費比例估算區間（%） */
  pctLo: number;
  pctHi: number;
  effortMin: number;
}

export interface AdWasteResult {
  /** 每月浪費估算區間（NT$，取百元整） */
  wasteLoNT: number;
  wasteHiNT: number;
  /** 浪費比例估算區間（%，加總後封頂） */
  pctLo: number;
  pctHi: number;
  /** 估算用的月預算中位值 */
  budgetMidNT: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  gradeLabel: string;
  leaks: LeakItem[];
  /** 本週先堵的前 3 個洞（依 pctHi 排序） */
  topLeaks: LeakItem[];
  /** 依管理方式給的提醒（非金額項） */
  notes: string[];
  allClear: boolean;
}

export const BUDGET_LEVELS: { value: BudgetLevel; label: string; mid: number }[] = [
  { value: 'b5k', label: 'NT$5,000 以下', mid: 3000 },
  { value: 'b15k', label: 'NT$5,000–15,000', mid: 10000 },
  { value: 'b30k', label: 'NT$15,000–30,000', mid: 22000 },
  { value: 'b60k', label: 'NT$30,000–60,000', mid: 45000 },
  { value: 'b150k', label: 'NT$60,000–150,000', mid: 100000 },
  { value: 'b150kUp', label: 'NT$150,000 以上', mid: 200000 },
];

export const MANAGER_TYPES: { value: ManagerType; label: string }[] = [
  { value: 'self', label: '我自己投' },
  { value: 'agency', label: '代理商 / 外包在投' },
  { value: 'employee', label: '店內員工在投' },
];

interface LeakRule extends Omit<LeakItem, 'id'> {
  id: string;
  gap: (s: AdWasteStatus) => boolean;
}

const LEAK_RULES: LeakRule[] = [
  {
    id: 'negative-keywords',
    gap: (s) => !s.hasNegativeKeywords,
    title: '沒有維護「排除關鍵字」清單',
    why: '搜「免費」「作法」「徵才」這類不會變客人的字，你的廣告照樣被點、照樣扣錢。這是中小店家帳戶最常見、金額也最大的漏洞。',
    fix: '打開 Google Ads →「關鍵字」→「排除關鍵字」，先加 10 個明顯不相關的字（免費、教學、DIY、徵才、二手⋯⋯），之後每月從搜尋字詞報表補。',
    pctLo: 8,
    pctHi: 18,
    effortMin: 20,
  },
  {
    id: 'conversion-tracking',
    gap: (s) => !s.hasConversionTracking,
    title: '沒有安裝轉換追蹤',
    why: '你看得到「幾次點擊」，看不到「哪些點擊變成來電或表單」。沒有轉換數據，預算永遠沒辦法往有效的字集中——等於閉著眼睛調預算。',
    fix: '至少先設兩個轉換動作：電話點擊 + 表單送出（Google Ads 內建，不用寫程式）。裝好兩週後，把預算往有轉換的字群移。',
    pctLo: 6,
    pctHi: 15,
    effortMin: 40,
  },
  {
    id: 'search-terms',
    gap: (s) => !s.checksSearchTerms,
    title: '沒在看「搜尋字詞報表」',
    why: '你買的關鍵字和客人實際搜的字，往往差很多。不看這份報表，你不會知道錢正被哪些意想不到的搜尋吃掉。',
    fix: '每月一次，打開「深入分析與報表」→「搜尋字詞」，把不相關的加進排除、把意外有效的加進關鍵字。一次 15 分鐘。',
    pctLo: 5,
    pctHi: 12,
    effortMin: 15,
  },
  {
    id: 'landing-page',
    gap: (s) => !s.landingPageMatched,
    title: '廣告全部導到首頁（落地頁不對題）',
    why: '客人點「植牙 費用」的廣告卻進到診所首頁，找不到答案 3 秒就關掉。品質分數被拉低，同一個字你要出比對手更高的價才擠得到版位。',
    fix: '每個廣告群組對一個專屬頁面：搜什麼、進來就看到什麼。沒有專頁的，先導到官網對應服務段落（用錨點連結）也比首頁好。',
    pctLo: 6,
    pctHi: 14,
    effortMin: 60,
  },
  {
    id: 'geo-targeting',
    gap: (s) => !s.hasGeoTargeting,
    title: '沒有限定投放地區',
    why: '你店在台中西區，廣告卻對全台灣播。高雄的人點了你的廣告，錢扣了，人不會來。服務範圍外的每一次點擊都是純浪費。',
    fix: '「地區」設定改成你的實際服務範圍（例：台中市＋周邊 10 公里），並把「曾對你的地區感興趣的人」改成「位於你的地區的人」。',
    pctLo: 5,
    pctHi: 15,
    effortMin: 10,
  },
  {
    id: 'brand-separation',
    gap: (s) => !s.separatesBrandCampaign,
    title: '品牌字和一般字混在同一個活動',
    why: '搜你店名的人本來就要找你，成本極低、轉換極高——混投會讓報表看起來很漂亮，掩蓋一般字其實在虧錢的事實，預算決策全部失真。',
    fix: '開一個獨立的「品牌字」活動放店名相關字，其餘字留在原活動。分開後你才看得到一般字的真實成本。',
    pctLo: 3,
    pctHi: 8,
    effortMin: 30,
  },
  {
    id: 'ad-schedule',
    gap: (s) => !s.hasAdSchedule,
    title: '沒有設定投放時段',
    why: '半夜 2 點的點擊對早餐店沒有意義。公休日進來的電話沒人接，客人直接打給下一家——錢花了還幫倒忙。',
    fix: '「廣告時段」對齊你的營業時間（可提前 1 小時開始），公休日暫停或降低出價。',
    pctLo: 2,
    pctHi: 6,
    effortMin: 10,
  },
];

/** 全部做對時的殘餘優化空間（任何帳戶都有的自然損耗） */
const RESIDUAL_LO = 3;
const RESIDUAL_HI = 8;
/** 加總封頂：避免疊加出不合理的誇大數字 */
const PCT_CAP_HI = 60;
const PCT_CAP_LO = 45;

function roundHundred(n: number): number {
  return Math.round(n / 100) * 100;
}

export function analyzeAdWaste(input: AdWasteInput): AdWasteResult {
  const budgetMidNT = BUDGET_LEVELS.find((b) => b.value === input.budget)?.mid ?? 10000;

  const leaks: LeakItem[] = LEAK_RULES.filter((r) => r.gap(input.status)).map((r) => ({
    id: r.id,
    title: r.title,
    why: r.why,
    fix: r.fix,
    pctLo: r.pctLo,
    pctHi: r.pctHi,
    effortMin: r.effortMin,
  }));

  const allClear = leaks.length === 0;

  let pctLo: number;
  let pctHi: number;
  if (allClear) {
    pctLo = RESIDUAL_LO;
    pctHi = RESIDUAL_HI;
  } else {
    pctLo = Math.min(
      PCT_CAP_LO,
      leaks.reduce((sum, l) => sum + l.pctLo, 0),
    );
    pctHi = Math.min(
      PCT_CAP_HI,
      leaks.reduce((sum, l) => sum + l.pctHi, 0),
    );
  }

  const mid = (pctLo + pctHi) / 2;
  let grade: AdWasteResult['grade'];
  let gradeLabel: string;
  if (mid < 10) {
    grade = 'A';
    gradeLabel = '帳戶體質精實';
  } else if (mid < 20) {
    grade = 'B';
    gradeLabel = '小漏，值得堵';
  } else if (mid < 32) {
    grade = 'C';
    gradeLabel = '有明顯漏洞';
  } else if (mid < 45) {
    grade = 'D';
    gradeLabel = '正在大量漏錢';
  } else {
    grade = 'E';
    gradeLabel = '錢在裸奔';
  }

  const topLeaks = [...leaks].sort((a, b) => b.pctHi - a.pctHi).slice(0, 3);

  const notes: string[] = [];
  if (input.manager === 'agency' && !input.status.checksSearchTerms) {
    notes.push(
      '你目前無法驗證代理商的操作品質。跟對方要兩樣東西：每月的「搜尋字詞報表」和「排除關鍵字清單異動紀錄」——正常操作的代理商拿得出來，拿不出來就是警訊。',
    );
  }
  if (input.manager === 'agency' && !input.status.hasConversionTracking) {
    notes.push(
      '代理商回報的「成效」如果只有點擊和曝光、沒有轉換數字，你付的是流量的錢，不是客人的錢。要求以轉換（來電／表單）作為月報核心指標。',
    );
  }
  if (input.manager === 'self') {
    notes.push(
      '自己投最大的優勢是你最懂客人搜什麼。上面的修法都是 Google Ads 後台內建功能，不需要額外工具，照順序做即可。',
    );
  }

  return {
    wasteLoNT: roundHundred((budgetMidNT * pctLo) / 100),
    wasteHiNT: roundHundred((budgetMidNT * pctHi) / 100),
    pctLo,
    pctHi,
    budgetMidNT,
    grade,
    gradeLabel,
    leaks,
    topLeaks,
    notes,
    allClear,
  };
}
