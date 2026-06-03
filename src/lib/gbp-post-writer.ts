/**
 * /tools/post-writer 核心邏輯
 *
 * 用途：輸入店名 + 產業 + 本週主題（選填）+ 標籤（選填），
 *      產出 7 天 Google 商家（GBP）貼文初稿。
 *
 * 純 deterministic template，不打外部 AI API → 零成本、無速率限制、無 cost-cap。
 *
 * v3 變更（2026-06-03）：
 * - 移除 Groq AI 依賴（與 line-broadcast 一致：「不是 AI 聊天」品牌定位）
 * - 共用 line-broadcast 的 INDUSTRY_TAGS（同樣 8 產業 × 3 組標籤）
 * - 8 產業 × 7 篇獨立 GBP 模板（節慶 / 教育 / 客戶見證 / 幕後 / 新品 / 促銷 / QA）
 * - 標籤點選驅動「歡迎 / 教育 / 新品」3 篇的個性化錨點
 */

import {
  INDUSTRY_TAGS,
  type LineIndustry,
  type TagGroup,
  type TagGroupKey,
} from './line-broadcast';

// 共用 LINE 工具的 industry 列舉
export type Industry = LineIndustry;
export type { TagGroup, TagGroupKey };
export { INDUSTRY_TAGS };

export type PostCategory =
  | '節慶'
  | '教育'
  | '客戶見證'
  | '幕後'
  | '新品'
  | '促銷'
  | 'QA';

export interface GeneratedPost {
  day: string;
  category: PostCategory;
  title: string;
  content: string;
  bestTime: string;
  imageHint: string;
  /**
   * Optional — generatePosts() 一定會給；
   * 既有 Groq path（/tools/name-generator 仍在用）的 GeneratedPost 不會帶。
   */
  characterCount?: number;
}

export interface PostWriterInput {
  storeName: string;
  industry: Industry;
  weekTheme?: string;
  /**
   * 用戶從 INDUSTRY_TAGS 勾選的標籤。建議 1-5 個。
   * 取代了 v2 的 Groq AI 生成——標籤點選 ≠ AI 聊天。
   */
  selectedTags?: string[];
}

/** GBP 推薦發文時段（依台灣 Google 搜尋流量） */
const TIMES = {
  morning: '08:30',
  noon: '12:30',
  afternoon: '17:00',
  evening: '20:00',
} as const;

/** 7 天結構性 meta — 所有產業共用 */
const DAY_META: Array<{
  day: string;
  category: PostCategory;
  bestTime: string;
  imageHint: string;
}> = [
  { day: '週一', category: '節慶', bestTime: TIMES.morning, imageHint: '店面外觀 + 招牌特寫，自然光，避免店內凌亂背景' },
  { day: '週二', category: '教育', bestTime: TIMES.noon, imageHint: '工作中的手部特寫（製程、工具），不要露臉' },
  { day: '週三', category: '客戶見證', bestTime: TIMES.evening, imageHint: '客人滿意的環境氛圍照（不露臉），暖色調為主' },
  { day: '週四', category: '幕後', bestTime: TIMES.evening, imageHint: '清晨/開店前的店內準備畫面，光線從窗戶斜射進來' },
  { day: '週五', category: '新品', bestTime: TIMES.afternoon, imageHint: '新品 45 度角特寫，背景單純' },
  { day: '週六', category: '促銷', bestTime: '11:00', imageHint: '兩人/兩個位置一起的畫面，傳達「揪人」氛圍' },
  { day: '週日', category: 'QA', bestTime: '14:00', imageHint: '預約系統介面截圖、電話、QR Code，乾淨單張' },
];

interface BuildCtx {
  name: string;
  theme: string;
  /** 已預生：依當日角色而定的可植入字串（空字串代表不嵌） */
  ctxFirst: string;
  /** 用戶 raw tags（供需要 join 的模板使用） */
  tagsJoined: string;
}

type PostBuilder = (c: BuildCtx) => { title: string; content: string };

// ─────────────────────────────────────────────────────────────────
// INDUSTRY_TEMPLATES — 每個產業 7 篇獨立 GBP 模板
// ─────────────────────────────────────────────────────────────────

const INDUSTRY_TEMPLATES: Record<Industry, PostBuilder[]> = {
  // ═══════════════════════════════ 餐飲 ═══════════════════════════════
  餐飲: [
    // 週一 節慶 — 一週開頭、店面定位
    ({ name, theme, ctxFirst }) => ({
      title: '新的一週，先看一眼這個',
      content: `${name} 本週供應一切照常，平日 11:00-21:00、週末延長到 22:00。${theme ? `\n\n本週重點：${theme}。` : ''}${ctxFirst ? `\n\n想先跟你說：${ctxFirst}。` : ''}\n\n要避開 12:00-13:00、18:30-19:30 滿座時段，建議先打電話訂位。`,
    }),
    // 週二 教育
    ({ name, ctxFirst }) => ({
      title: '為什麼我們的便當比連鎖貴 5-15 元',
      content: `常被問：「為什麼比連鎖貴？」\n\n簡單講：菜是早上去市場挑的、米換成本土履歷米、油用新的不重複用。便宜可以從別的地方省，不會從食材上省。${ctxFirst ? `\n\n（這禮拜想多聊「${ctxFirst}」這件事）` : ''}\n\n下次看到漲價也別緊張，多半是上游菜價真的漲。\n\n— ${name}`,
    }),
    // 週三 客戶見證
    ({ name }) => ({
      title: '謝謝這位客人寫的這段',
      content: `「來了三次，第一次同事推薦、第二次帶家人、第三次自己一個人。每次吃完都覺得值。」\n\n上週收到的 Google 評論，5 顆星。${name} 看到的時候有點不好意思（真的有這麼好嗎？），也很感激。\n\n會被人記得三次，是做這行最想要的事。`,
    }),
    // 週四 幕後
    ({ name }) => ({
      title: '${name}的早晨，從這裡開始',
      content: `每天早上 5:00 前，${name} 的師傅已經開始備料。\n\n工序看起來簡單，但每個動作的時間差都會影響最後口感。我們不會把這些細節寫在菜單上，但你吃起來會感覺到差別。\n\n這就是這份工作存在的理由。`,
    }),
    // 週五 新品
    ({ name, theme, ctxFirst }) => {
      const what = theme || ctxFirst;
      return {
        title: '這週開始，多了這個選擇',
        content: what
          ? `${name} 本週新增：${what} 🍽️\n\n試了 5 版才確定要放上菜單。價格不便宜但我們覺得值——你來吃過會懂。\n\n先放週末限定，反應好下個月排固定菜單。量沒做太多，建議早一點來。`
          : `${name} 本週悄悄上了一道新菜 🍽️\n\n沒大張旗鼓宣傳，因為想先看常客的反應再決定要不要常駐。\n\n本週進店點看看就會看到。`,
      };
    },
    // 週六 促銷
    ({ name }) => ({
      title: '週末來坐一下',
      content: `週末通常是最忙的兩天，但 ${name} 還是想做點不一樣的——\n\n本月底前，平日中午 11:30-13:30 內用，憑這則貼文截圖第二份主餐打 8 折（不限品項、不可外帶）。\n\n沒有要你加 LINE、沒有要你註冊會員。座位有限，建議先打電話訂位。`,
    }),
    // 週日 QA
    ({ name }) => ({
      title: '常被問：可以外帶／外送嗎',
      content: `每週都被問同一題：\n\n「可以外帶嗎？」可以，但建議先電話預訂，我們會幫你預備好。\n\n「可以外送嗎？」有上 foodpanda / Uber Eats，但湯品、油炸、生菜建議不要外送（會分層／軟掉／壓壞）。\n\n${name} 平日座位比較好進，週末會等。`,
    }),
  ],

  // ═══════════════════════════════ 美髮美容 ═══════════════════════════════
  美髮美容: [
    ({ name, theme, ctxFirst }) => ({
      title: '新的一週，設計師排班',
      content: `${name} 本週設計師${theme ? `主推：${theme}` : '全員到位'}。${ctxFirst ? `\n\n想先跟你說：${ctxFirst}。` : ''}\n\n要約這週的話，建議線上預約或 LINE 直接傳要的時段，比較不會打到店裡正在剪的時段。`,
    }),
    ({ name, ctxFirst }) => ({
      title: '染完幾天可以洗頭',
      content: `常被問：染完、燙完要怎麼保養。\n\n簡短版：\n・染完 48 小時內盡量不洗\n・燙完 72 小時內不要綁太緊\n\n詳細版很長，做完幫你寫一張個人保養單帶走。${ctxFirst ? `\n\n（這禮拜想多聊「${ctxFirst}」這件事）` : ''}\n\n— ${name}`,
    }),
    ({ name }) => ({
      title: '這位客人的修剪過程',
      content: `「本來只是想剪短一點，結果整顆頭都不一樣。」\n\n上週的客人留言，分了 3 次處理才完成（之前染過 3 種顏色疊在一起，沒辦法一次救回）。\n\n做久了會發現，難的從來不是技術，是「告訴客人這要分幾次做、不要太急」。\n\n— ${name}`,
    }),
    ({ name }) => ({
      title: '${name}開店前的準備',
      content: `每天開店前 1 小時，${name} 會把所有工具消毒、剪刀換新片、染劑庫存盤點。\n\n看起來瑣碎，但這 1 小時做不到位，當天每一位客人都會受影響。\n\n你不會看到這些，但會感覺到差別。`,
    }),
    ({ name, theme, ctxFirst }) => {
      const what = theme || ctxFirst;
      return {
        title: '本月新引進',
        content: what
          ? `${name} 本月引進：${what} ✂️\n\n細節已放在 LINE 圖文選單。\n\n第一週只開 6 個名額給長期客人先試。要排時間直接 LINE 或電話。`
          : `${name} 本月新進了一組染劑，是專門針對亞洲人髮質做的色階。\n\n第一週只開 6 個名額給長期客人先試。`,
      };
    },
    ({ name }) => ({
      title: '本月底前的組合優惠',
      content: `本月底前，預約「染 + 護 + 剪」組合，${name} 多送一次居家護髮組，現場直接帶走，不用另外加購。\n\n不是清貨，是這個組合本來就最值得做完整。\n\n要排時間直接 LINE 或電話。`,
    }),
    ({ name }) => ({
      title: '常被問：第一次來要做什麼',
      content: `常被問：「想做但不知道做什麼」「我頭髮這樣可以剪短嗎」。\n\n${name} 的方式：第一次來不急著做，先諮詢（免費 10-15 分鐘），看你的髮況、髮量、生活習慣，再決定。\n\n沒有「適合所有人的」剪法，只有適合你現況的。`,
    }),
  ],

  // ═══════════════════════════════ 醫美 ═══════════════════════════════
  醫美: [
    ({ name, theme, ctxFirst }) => ({
      title: '新的一週，看診時段',
      content: `${name} 本週看診時段照常。${theme ? `\n\n本週主推：${theme}。` : ''}${ctxFirst ? `\n\n想先跟你說：${ctxFirst}。` : ''}\n\n預約前歡迎先 LINE 或電話諮詢，會初步看適不適合，再幫你約面診。`,
    }),
    ({ name, ctxFirst }) => ({
      title: '打了會不會看起來不自然',
      content: `常被問：「打了會不會看起來不自然」。\n\n短答：自然 = 適量 + 適部位 + 適時機。不是醫師厲害不厲害的問題，是溝通有沒有對齊期望值。\n\n${name} 每次操作前都會先用照片模擬、再執行。中途任何不確定都可以喊停。${ctxFirst ? `\n\n（這禮拜想多聊「${ctxFirst}」這件事）` : ''}`,
    }),
    ({ name }) => ({
      title: '這位客人的話',
      content: `「面診當下決定不施作，但回家後很有信心。」——上週的客人留言。\n\n那次我們判斷她的訴求暫時不需要施作，請她半年後再回來追蹤。\n\n${name} 想說：拒絕生意有時候是更負責任。慢工出細活，這個產業特別適用。`,
    }),
    ({ name }) => ({
      title: '${name}的療程設計流程',
      content: `每次客人進診間前，${name} 已經看過她過去的療程紀錄、皮膚狀態、想改善的點。\n\n面診時不是「她想做什麼」，是「她現在最該做什麼」。\n\n這 30 分鐘看不到的準備，是決定療程成效的關鍵。`,
    }),
    ({ name, theme, ctxFirst }) => {
      const what = theme || ctxFirst;
      return {
        title: '本月新引入',
        content: what
          ? `${name} 本月引入：${what} 💉\n\n適合誰、不適合誰、預期效果、恢復期，都已寫在 LINE 圖文選單。\n\n先開給長期客人做評估，由我們看你適不適合再說其他。`
          : `${name} 這禮拜引入了一個新儀器/新療程。\n\n細節在 LINE 圖文選單。要試的話建議先 LINE 預約面診。`,
      };
    },
    ({ name }) => ({
      title: '第一次正式療程的客人',
      content: `本月底前，第一次正式療程的客人，${name} 多送一次術後保養諮詢（NT$1,500 內容）。\n\n不是衝業績，是想讓「願意第一次相信我們的人」做完整流程。\n\n要評估直接 LINE 預約面診。`,
    }),
    ({ name }) => ({
      title: '常被問：這個年紀適合什麼',
      content: `常被問：「我這個年紀適合做什麼」「會不會做太早」。\n\n${name} 的判斷：不是看年紀，是看你目前最在意的點。25 歲可能就有黑眼圈、45 歲也可能膚況很穩。\n\n第一次來建議先約面診（不收費、不施作），確認方向再排療程。`,
    }),
  ],

  // ═══════════════════════════════ 牙科 ═══════════════════════════════
  牙科: [
    ({ name, theme, ctxFirst }) => ({
      title: '新的一週，看診時段',
      content: `${name} 本週看診時段正常。${theme ? `\n\n本週主要在：${theme}。` : ''}${ctxFirst ? `\n\n想跟你說：${ctxFirst}。` : ''}\n\n要約洗牙、檢查或補牙的，LINE 或電話直接傳要約的時段，我會回最近可預約的兩個選項。`,
    }),
    ({ name, ctxFirst }) => ({
      title: '半年要洗一次牙嗎',
      content: `常被問：「半年要洗一次牙嗎」「牙齦流血要不要去看」。\n\n半年洗牙＝健保有給付，建議照做，不會「越洗越敏感」（這是迷思）。\n\n牙齦流血連續 1 週以上，建議來檢查——可能是牙周開始發炎。${ctxFirst ? `\n\n（這禮拜想多聊「${ctxFirst}」這件事）` : ''}\n\n— ${name}`,
    }),
    ({ name }) => ({
      title: '這位媽媽的話',
      content: `「孩子第一次看牙以為會大哭，結果走出來說『阿姨還好欸』。」\n\n上週的家長留言。我們刻意第一次不做治療，只讓孩子熟悉環境、坐上椅子玩看看。\n\n第一次「沒有治療」反而最重要——之後就不會怕。\n\n— ${name}`,
    }),
    ({ name }) => ({
      title: '${name}的看診流程',
      content: `每位新患者進診間前，${name} 已經看過病歷、X 光、過往治療紀錄。\n\n看診時不是「客人說哪裡痛」，是「整體口腔健康現在在哪個階段」。\n\n10 分鐘看不到的準備，決定當天能不能幫你看清楚。`,
    }),
    ({ name, theme, ctxFirst }) => {
      const what = theme || ctxFirst;
      return {
        title: '本月引進',
        content: what
          ? `${name} 本月引進：${what} 🦷\n\n適合誰、處置流程、費用範圍，都已寫在 LINE 圖文選單。\n\n要評估先 LINE 預約面診。`
          : `${name} 這禮拜新增了一個療程選項。\n\n細節在 LINE 圖文選單。要評估先 LINE 預約面診。`,
      };
    },
    ({ name }) => ({
      title: '新患者的健檢福利',
      content: `本月底前，第一次來檢查的新患者，${name} 多送一次 X 光 + 口腔健檢報告（書面寄家裡）。\n\n不收費、不綁療程。想試我們服務的話這個是最低成本入口。`,
    }),
    ({ name }) => ({
      title: '常被問：孩子幾歲看牙',
      content: `常被問：「孩子幾歲可以開始看牙」。\n\n標準：第一顆乳牙長出來後就可以。實務上建議 2-3 歲第一次看牙，目的是讓孩子先「習慣看牙這件事」，不是治療。\n\n${name} 第一次不收費（5 分鐘環境熟悉），預約電話或 LINE。`,
    }),
  ],

  // ═══════════════════════════════ 律師 ═══════════════════════════════
  律師: [
    ({ name, theme, ctxFirst }) => ({
      title: '新的一週，承辦時段',
      content: `${name} 本週承辦時段照常。${theme ? `\n\n本週主要在處理：${theme}。` : ''}${ctxFirst ? `\n\n想先跟你說：${ctxFirst}。` : ''}\n\n有合約、糾紛、申請文件想諮詢，建議用 LINE 或電話先傳摘要，我會回是否需要正式面談。`,
    }),
    ({ name, ctxFirst }) => ({
      title: '這個合約我簽了會怎樣',
      content: `常被問：「這個合約我簽了會怎樣」。\n\n簡短回答：合約最危險的不是條文，是「沒寫進去的部分」。\n\n${name} 看合約先看三項：終止條件、違約罰則、智財歸屬。其他細節都在這三項脈絡下。${ctxFirst ? `\n\n（這禮拜想多聊「${ctxFirst}」這件事）` : ''}`,
    }),
    ({ name }) => ({
      title: '這位當事人的話',
      content: `「從第一次 LINE 到簽委任花了 3 週，但每次討論完都覺得問題更清楚。」\n\n上週結案的當事人留言。\n\n${name} 這個產業最費時的不是處理案子，是「先讓當事人理解我們在幫他做什麼」——所以前期溝通會花比同業久。`,
    }),
    ({ name }) => ({
      title: '${name}承辦案件的流程',
      content: `每件案子受理前，${name} 會先做 30 分鐘的事前判斷：勝算、預期費用、預期時間。\n\n如果判斷勝算 < 50%、或當事人對費用沒準備，我們會誠實告知。\n\n不打沒贏面的官司，是律師最重要的職業道德。`,
    }),
    ({ name, theme, ctxFirst }) => {
      const what = theme || ctxFirst;
      return {
        title: '本月開放',
        content: what
          ? `${name} 本月開放：${what} ⚖️\n\n適合誰、流程、費用，都已寫在 LINE 圖文選單。\n\n要評估直接 LINE 約 30 分鐘諮詢。`
          : `${name} 本月開放一個新諮詢項目。\n\n細節在 LINE 圖文選單。`,
      };
    },
    ({ name }) => ({
      title: '本月新諮詢客戶',
      content: `本月底前，新諮詢客戶可以將首次 30 分鐘諮詢費抵後續委任費（限同一案件）。\n\n不是促銷，是讓你不用為了「試試看的諮詢」額外付費。\n\n${name}，要約時間直接 LINE 或電話。`,
    }),
    ({ name }) => ({
      title: '常被問：需不需要請律師',
      content: `常被問：「需不需要請律師」。\n\n${name} 的判準：\n・金額 < 5 萬、文件 < 1 頁、沒對方反對 → 自己處理可以\n・任何一項超過 → 至少諮詢一次\n\n諮詢費比起後續處理成本，永遠是最便宜的一段。`,
    }),
  ],

  // ═══════════════════════════════ 補教 ═══════════════════════════════
  補教: [
    ({ name, theme, ctxFirst }) => ({
      title: '新的一週，課程時段',
      content: `${name} 本週課程照常。${theme ? `\n\n本週重點主題：${theme}。` : ''}${ctxFirst ? `\n\n想跟家長/同學先說：${ctxFirst}。` : ''}\n\n要插班試聽或諮詢的，LINE 傳「孩子年級 + 想加強科目」，我回時段。`,
    }),
    ({ name, ctxFirst }) => ({
      title: '上課懂，回家就不會',
      content: `常被問：「孩子上課專心，回家就不會了」。\n\n${name} 的觀察：上課懂 ≠ 自己會。差別在「中間有沒有讓孩子自己練 + 自己解釋給別人聽」。\n\n${name} 課堂上會故意讓孩子互教 3 分鐘——這 3 分鐘比老師講 30 分鐘留下的多。${ctxFirst ? `\n\n（這禮拜想多聊「${ctxFirst}」這件事）` : ''}`,
    }),
    ({ name }) => ({
      title: '這位家長的話',
      content: `「孩子原本說補習班煩，現在每週還會主動問哪天上課。」\n\n上週家長留言。\n\n${name} 一直在練習的事是：把「教完進度」轉成「孩子覺得自己學會了」——這兩件事的差別比想像中大。`,
    }),
    ({ name }) => ({
      title: '${name}的備課',
      content: `每堂課前，${name} 會先看過去 3 年常被學生卡住的題型。\n\n上課時除了教進度，也會插這些「考點變化」進來。\n\n上課其實是「持續整理」的過程，不是「把書教完」。`,
    }),
    ({ name, theme, ctxFirst }) => {
      const what = theme || ctxFirst;
      return {
        title: '本月新增班型',
        content: what
          ? `${name} 本月新增：${what} 📚\n\n適合年級、內容、報名方式，都已放在 LINE 圖文選單。\n\n報名前可以 LINE 預約 15 分鐘諮詢。`
          : `${name} 本月新增了一個短期班型。\n\n細節在 LINE 圖文選單。報名前可以 LINE 預約 15 分鐘諮詢。`,
      };
    },
    ({ name }) => ({
      title: '介紹新同學優惠',
      content: `本月底前，介紹新同學報名，雙方各享 1 堂免費試聽 + 一份新生講義。\n\n不是促銷，是${name}看下來，一起學的效果確實比單獨上好。\n\n要約試聽 LINE 或電話。`,
    }),
    ({ name }) => ({
      title: '常被問：跨年級可以一起上嗎',
      content: `常被問：「跨年級可以一起上嗎」。\n\n小團體（≤ 4 人）可以——${name} 刻意混兩個年級，讓上面的講給下面的聽（再記一次）、下面的看到下個階段該長什麼樣。\n\n超過 4 人就不混，會變成大家都吃不飽。`,
    }),
  ],

  // ═══════════════════════════════ 零售 ═══════════════════════════════
  零售: [
    ({ name, theme, ctxFirst }) => ({
      title: '新的一週，商品上架',
      content: `${name} 本週${theme ? `主推：${theme}` : '商品上架照常'}。${ctxFirst ? `\n\n想先跟你說：${ctxFirst}。` : ''}\n\n喜歡的商品如果現場剛好缺貨，LINE 或電話問下次補貨時間。`,
    }),
    ({ name, ctxFirst }) => ({
      title: '這個跟別家的差在哪',
      content: `常被問：「這個跟別家的差在哪」。\n\n${name} 挑商品的標準：用料 + 工法 + 廠商背景 三項都看過。同類型可能比量販店貴 10-20%，但用 2 年的話總成本反而便宜。${ctxFirst ? `\n\n（這禮拜想多聊「${ctxFirst}」這件事）` : ''}\n\n你有不確定要不要買的，LINE 拍照傳，我直接講「這個值得 / 這個其實不用」。`,
    }),
    ({ name }) => ({
      title: '這位常客的話',
      content: `「來這裡買東西，老闆會告訴我哪些不需要。」\n\n上週常客的留言。\n\n${name} 這個店做久了學到：客人記住你，是因為你誠實告訴他「這個不需要買」，不是因為你推薦得多有說服力。`,
    }),
    ({ name }) => ({
      title: '${name}的選品標準',
      content: `每次去廠商倉庫進貨，${name} 會剔除 30% 覺得品質沒到位的款式。\n\n寧可少進貨、不要進「我自己不會買」的東西。\n\n這也是為什麼有時候你想要的款式我們沒有——不是漏了，是過不了我們這關。`,
    }),
    ({ name, theme, ctxFirst }) => {
      const what = theme || ctxFirst;
      return {
        title: '本週新到',
        content: what
          ? `${name} 本週新到：${what} 🛍️\n\n細節、價格、適合誰，都已放在 LINE 圖文選單。\n\n第一批進貨量不多，常客先看。`
          : `${name} 本週新進了幾款值得看的商品。\n\n細節在 LINE 圖文選單。實體店都有現貨展示。`,
      };
    },
    ({ name }) => ({
      title: '本月底前的小禮',
      content: `本月底前，憑這則貼文截圖到 ${name} 來店消費，多送一個小禮（不公開、只給看到貼文的你）。\n\n不是清庫存，是你 Google 找得到我們，多一個理由給你。\n\n哪天來方便的可以先 LINE 或電話。`,
    }),
    ({ name }) => ({
      title: '常被問：可以退換貨嗎',
      content: `常被問：「可以退換貨嗎」「保固多久」。\n\n${name} 標準：\n・未拆封 30 天可退\n・拆封 7 天有問題免費換\n・商品保固依原廠（我們會幫你處理）\n\n買來不確定合不合適，先 LINE 拍家裡狀況問，多半能先省一次來回。`,
    }),
  ],

  // ═══════════════════════════════ 其他 ═══════════════════════════════
  其他: [
    ({ name, theme, ctxFirst }) => ({
      title: '新的一週，服務時段',
      content: `${name} 本週服務時段照常。${theme ? `\n\n本週主要在：${theme}。` : ''}${ctxFirst ? `\n\n想先跟你說：${ctxFirst}。` : ''}\n\n要詢問或預約，LINE 或電話直接傳需求，我會回最近可預約的時段。`,
    }),
    ({ name, ctxFirst }) => ({
      title: '為什麼跟別家不太一樣',
      content: `常被問：「為什麼你們的服務跟別家不太一樣」。\n\n${name} 的習慣是第一次就把流程講清楚，包括可能踩到的雷——這樣後面不用反覆解釋。\n\n比同業多花 10-15 分鐘溝通，但客人回來找第二次的比例反而比較高。${ctxFirst ? `\n\n（這禮拜想多聊「${ctxFirst}」這件事）` : ''}`,
    }),
    ({ name }) => ({
      title: '這位客戶的話',
      content: `「服務完還會主動問我幾個月後狀況有沒有變化。」\n\n上週客戶留言。\n\n${name} 想說：第一次合作後的追蹤，是我們刻意保留的時間——不是禮貌，是想知道有沒有需要調整的地方。`,
    }),
    ({ name }) => ({
      title: '${name}的服務流程',
      content: `每位新客戶接洽前，${name} 會先做 30 分鐘的需求釐清：你想解決什麼、預期時間、預算範圍。\n\n如果判斷我們不適合，會直接推薦你其他人選。\n\n不適合的案子硬接，雙方都會痛。`,
    }),
    ({ name, theme, ctxFirst }) => {
      const what = theme || ctxFirst;
      return {
        title: '本月新增服務',
        content: what
          ? `${name} 本月新增：${what}\n\n細節已放在 LINE 圖文選單。\n\n要評估直接 LINE 預約諮詢，第一份摘要不收費。`
          : `${name} 本月新增了一個服務項目。\n\n細節在 LINE 圖文選單。要評估直接 LINE 預約諮詢。`,
      };
    },
    ({ name }) => ({
      title: '新合作客戶的福利',
      content: `本月底前，新合作的客戶，${name} 多送一次後續確認諮詢（書面 + 30 分鐘）。\n\n不是促銷，是讓你不用為了「第一次合作」多付一筆。\n\n要約直接 LINE 或電話。`,
    }),
    ({ name }) => ({
      title: '常被問：初次合作要準備什麼',
      content: `常被問：「初次合作要準備什麼」。\n\n${name} 的回答：給我們你目前的狀況（圖、文字、需求都行），我們會回你「需要哪些資訊才能正式估」。\n\n第一次溝通不收費、不綁約。`,
    }),
  ],
};

// ─────────────────────────────────────────────────────────────────
// 標籤 → 每日 ctx 邏輯（與 line-broadcast 同思路）
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
 * 依當日「在模板裡的角色」，為每篇預生 ctxFirst 字串。
 * - 週一 節慶：tag 自然句
 * - 週二 教育：value tag 包成「__這件事」
 * - 週五 新品：product tag 當「新品名稱」
 * - 其他天：空（保留場景故事的真實感）
 */
function buildCtxByDay(
  selectedTags: string[],
  groups: TagGroup[],
): string[] {
  if (selectedTags.length === 0) return ['', '', '', '', '', '', ''];

  const productHint = pickFirstTagInGroup(selectedTags, groups, 'product');
  const audienceHint = pickFirstTagInGroup(selectedTags, groups, 'audience');
  const valueHint = pickFirstTagInGroup(selectedTags, groups, 'value');

  const monLead = selectedTags.slice(0, 2).join('、');
  const monSentence =
    selectedTags.length === 1
      ? `這個月主要想多談「${selectedTags[0]}」這塊`
      : `這禮拜想多聊「${monLead}」這幾個方向`;

  const tueAnchor = valueHint || audienceHint;
  const tueSentence = tueAnchor ? tueAnchor : '';

  const friProduct = productHint || selectedTags[0] || '';

  return [monSentence, tueSentence, '', '', friProduct, '', ''];
}

/**
 * 產出 7 天 GBP 貼文初稿。Deterministic — 同樣 input 同樣 output。
 */
export function generatePosts(input: PostWriterInput): GeneratedPost[] {
  const name = input.storeName.trim() || '我們';
  const theme = input.weekTheme?.trim() || '';
  const selectedTags = (input.selectedTags ?? [])
    .map((t) => t.trim())
    .filter(Boolean);

  const groups = INDUSTRY_TAGS[input.industry] ?? INDUSTRY_TAGS['其他'];
  const ctxByDay = buildCtxByDay(selectedTags, groups);
  const tagsJoined = selectedTags.join('、');

  const builders = INDUSTRY_TEMPLATES[input.industry] ?? INDUSTRY_TEMPLATES['其他'];

  return DAY_META.map((meta, idx) => {
    const dayCtx: BuildCtx = {
      name,
      theme,
      ctxFirst: ctxByDay[idx] ?? '',
      tagsJoined,
    };
    const built = builders[idx](dayCtx);
    // 模板中可能用 ${name} 字串字面（不是 template literal）— 做最後 placeholder 取代
    const title = built.title.replace(/\$\{name\}/g, name);
    const content = built.content.replace(/\$\{name\}/g, name);
    return {
      ...meta,
      title,
      content,
      characterCount: Array.from(content).length,
    };
  });
}
