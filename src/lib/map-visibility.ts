/**
 * Google 地圖曝光優化清單 — 規則引擎（deterministic，無 API）
 *
 * 定位：/check（GBP 健診＝診斷現況分數）的「處方版」。
 * 輸入店家現況自評 → 輸出依優先序（P0/P1/P2）的行動清單，
 * 每個行動 cross-link 到可代勞的 adlo 工具。
 *
 * 規則內容為 GBP 事實性最佳實務（Kael 起草）；行銷語氣與在地化範例待 Ada 潤飾
 * （見 docs/design/map-visibility-brief.md）。
 */

export type PhotoLevel = 'none' | 'few' | 'some' | 'many';
export type ReviewLevel = 'none' | 'low' | 'mid' | 'high';
export type Priority = 'P0' | 'P1' | 'P2';

export interface MapVisibilityStatus {
  hasGbp: boolean;
  categorySet: boolean;
  napConsistent: boolean;
  hoursFilled: boolean;
  photoCount: PhotoLevel;
  reviewCount: ReviewLevel;
  postedLast30d: boolean;
  repliesReviews: boolean;
}

export interface MapVisibilityInput {
  industry: string;
  city: string;
  keyword?: string;
  status: MapVisibilityStatus;
}

export interface ActionItem {
  id: string;
  priority: Priority;
  title: string;
  why: string;
  effortMin: number;
  toolHref?: string;
  toolName?: string;
}

export interface MapVisibilityResult {
  priorityActions: ActionItem[];
  thisWeekTop3: ActionItem[];
  passedCount: number;
  totalChecks: number;
}

const PRIORITY_ORDER: Record<Priority, number> = { P0: 0, P1: 1, P2: 2 };

interface Rule {
  id: string;
  priority: Priority;
  /** 同優先序內的排序權重，越大越前面 */
  weight: number;
  /** 是否為「缺口」（true = 需要做這個行動） */
  gap: (input: MapVisibilityInput) => boolean;
  title: string;
  why: string;
  effortMin: number;
  toolHref?: string;
  toolName?: string;
}

const RULES: Rule[] = [
  // ── P0：地圖根本進不來 ──
  {
    id: 'gbp-claim',
    priority: 'P0',
    weight: 100,
    gap: (i) => !i.status.hasGbp,
    title: '建立並認領你的 Google 商家檔案',
    why: '沒有 Google 商家檔案（GBP），店家不會出現在 Google 地圖與「附近的{industry}」搜尋裡。這是所有地圖曝光的前提。',
    effortMin: 20,
  },
  {
    id: 'category',
    priority: 'P0',
    weight: 95,
    gap: (i) => !i.status.categorySet,
    title: '設定正確的主要 + 次要商家類別',
    why: '類別是 Google 判斷「你是什麼店、該在哪些搜尋出現」最主要的訊號。{industry} 請選最精準的主類別，再補 2–3 個次類別。',
    effortMin: 10,
  },
  {
    id: 'nap',
    priority: 'P0',
    weight: 90,
    gap: (i) => !i.status.napConsistent,
    title: '統一店名 / 電話 / 地址（NAP）在各平台一致',
    why: 'Google 會交叉比對你在官網、FB、各目錄的 NAP。{city}在地排名很吃可信度，一個字、一個括號不同都會扣分。',
    effortMin: 30,
  },
  // ── P1：排名訊號偏弱 ──
  {
    id: 'reviews',
    priority: 'P1',
    weight: 80,
    gap: (i) => i.status.reviewCount === 'none' || i.status.reviewCount === 'low',
    title: '啟動評論收集，先把總數衝過 20 則',
    why: '評論數與星等是在地排名前三強的訊號。20 則是跨過「看起來有人氣」的心理門檻，{city}同區對手多半也卡在這關。',
    effortMin: 15,
    toolHref: '/tools/review-link',
    toolName: '評論收集連結',
  },
  {
    id: 'posts',
    priority: 'P1',
    weight: 75,
    gap: (i) => !i.status.postedLast30d,
    title: '恢復每週發 GBP 貼文的節奏',
    why: 'Google 看「商家是否持續活躍」。近 30 天沒發文會被判定低活躍而壓低曝光。一週一篇就能維持訊號。',
    effortMin: 15,
    toolHref: '/tools/post-writer',
    toolName: 'GBP 貼文產生器',
  },
  {
    id: 'photos',
    priority: 'P1',
    weight: 70,
    gap: (i) => i.status.photoCount === 'none' || i.status.photoCount === 'few',
    title: '補上門面、內部、服務 / 商品實景照',
    why: '照片多的商家地圖點擊率明顯較高。{industry}尤其需要實景照建立信任——客人是先看照片才決定要不要點進來。',
    effortMin: 20,
  },
  {
    id: 'hours',
    priority: 'P1',
    weight: 65,
    gap: (i) => !i.status.hoursFilled,
    title: '填好營業時間（含特休 / 連假）',
    why: '營業時間缺漏會降低「附近現在營業」類搜尋的曝光，客人也容易撲空、轉頭給負評。',
    effortMin: 10,
  },
  // ── P2：進階優化 ──
  {
    id: 'reply-reviews',
    priority: 'P2',
    weight: 50,
    gap: (i) => i.status.reviewCount !== 'none' && !i.status.repliesReviews,
    title: '回覆每一則評論（好評壞評都回）',
    why: '回覆率是「對顧客高度回應」的訊號，Google 會據此加分，也直接影響潛在客的決策。',
    effortMin: 15,
    toolHref: '/tools/review-link',
    toolName: '評論收集連結',
  },
  {
    id: 'keyword',
    priority: 'P2',
    weight: 45,
    gap: (i) => Boolean(i.keyword && i.keyword.trim()),
    title: '把「{keyword}」自然寫進商家簡介與貼文',
    why: '在商家描述、貼文、評論回覆中自然出現目標關鍵字，有助於該字的在地排名。先確認這個字值不值得做。',
    effortMin: 10,
    toolHref: '/tools/keyword',
    toolName: '關鍵字難度檢查',
  },
];

function interpolate(text: string, input: MapVisibilityInput): string {
  return text
    .replace(/\{industry\}/g, input.industry || '你的店')
    .replace(/\{city\}/g, input.city || '在地')
    .replace(/\{keyword\}/g, input.keyword?.trim() || '目標關鍵字');
}

/**
 * 分析現況，回傳依優先序排好的行動清單。
 * 純函式、無副作用、可在 client 端同步執行。
 */
export function analyzeMapVisibility(input: MapVisibilityInput): MapVisibilityResult {
  // keyword 規則只在有填關鍵字時納入「總檢查數」
  const activeRules = RULES.filter((r) => r.id !== 'keyword' || (input.keyword && input.keyword.trim()));

  const gaps = activeRules.filter((r) => r.gap(input));

  const priorityActions: ActionItem[] = gaps
    .slice()
    .sort((a, b) => {
      const p = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      return p !== 0 ? p : b.weight - a.weight;
    })
    .map((r) => ({
      id: r.id,
      priority: r.priority,
      title: interpolate(r.title, input),
      why: interpolate(r.why, input),
      effortMin: r.effortMin,
      toolHref: r.toolHref,
      toolName: r.toolName,
    }));

  return {
    priorityActions,
    thisWeekTop3: priorityActions.slice(0, 3),
    passedCount: activeRules.length - gaps.length,
    totalChecks: activeRules.length,
  };
}
