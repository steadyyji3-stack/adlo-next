/**
 * /tools/line-broadcast 核心邏輯
 *
 * 用途：輸入店名 + 產業 + 本週主題（選填）+ 自建描述（選填），
 *      產出 7 天 LINE OA 推播文案初稿。
 *
 * 純 deterministic template，不打外部 AI API → 零成本、無速率限制、無 cost-cap。
 *
 * v2 變更（2026-05-30）：
 * - 移除「字串拼接 industryFlavor」（會產出「吃一道湯一道菜」這種怪句）
 * - 改為「每個產業有獨立 7 篇模板」（INDUSTRY_TEMPLATES）
 * - 文案從台灣 SMB 老闆視角寫，避免 AI 翻譯腔與簡中語感
 */

export type LineCategory =
  | '歡迎'
  | '教育'
  | 'QA'
  | '幕後'
  | '新品'
  | '促銷'
  | '節慶';

export type LineIndustry =
  | '餐飲'
  | '美髮美容'
  | '醫美'
  | '牙科'
  | '律師'
  | '補教'
  | '零售'
  | '其他'
  // 裝潢修繕父類別下的 4 子項（共用同一套模板）
  | '裝潢'
  | '裝修'
  | '安裝'
  | '維修';

export interface LineBroadcastInput {
  storeName: string;
  industry: LineIndustry;
  weekTheme?: string;
  /**
   * 用戶從 INDUSTRY_TAGS 勾選的標籤。建議 3-5 個。
   * 標籤會依組別（產品 / 客群 / 訴求）拆開、嵌入到不同篇模板。
   * 取代了 v2 的自由文字 customContext——標籤點選 ≠ AI 聊天。
   */
  selectedTags?: string[];
}

/**
 * 標籤組別。每個產業有 3 組標籤，每組 5-10 個。
 * - product: 產品 / 服務 / 餐型 / 療程類型
 * - audience: 客群 / 場景 / 預約方式
 * - value: 訴求 / 風格 / 堅持點
 */
export type TagGroupKey = 'product' | 'audience' | 'value';

export interface TagGroup {
  key: TagGroupKey;
  label: string;
  description: string;
  tags: string[];
}

/**
 * 各產業可用的標籤池。用戶從中勾選，組合為模板的可植入素材。
 * 每組標籤都從台灣中小店家視角設計，不堆 SaaS / 簡中常見詞。
 */
// 裝潢修繕共用標籤（裝潢／裝修／安裝／維修 4 子項共用）
const RENOVATION_TAGS: TagGroup[] = [
  {
    key: 'product',
    label: '服務項目',
    description: '你做哪些工程？',
    tags: ['全室裝潢', '老屋翻新', '局部裝修', '水電', '泥作防水', '木作系統櫃', '油漆粉刷', '衛浴廚房', '冷氣安裝', '居家維修'],
  },
  {
    key: 'audience',
    label: '客群／場景',
    description: '誰來找你？',
    tags: ['新屋裝潢', '中古屋翻新', '租屋小修', '店面商空', '辦公室', '屋主自住', '包租公', '緊急修繕'],
  },
  {
    key: 'value',
    label: '訴求／堅持',
    description: '你跟別家最大的不同？',
    tags: ['報價透明', '不追加報價', '工程保固', '材料可選', '準時交屋', '工地乾淨', '免費丈量', '只接在地'],
  },
];

export const INDUSTRY_TAGS: Record<LineIndustry, TagGroup[]> = {
  裝潢: RENOVATION_TAGS,
  裝修: RENOVATION_TAGS,
  安裝: RENOVATION_TAGS,
  維修: RENOVATION_TAGS,
  餐飲: [
    {
      key: 'product',
      label: '餐型／品項',
      description: '你提供什麼樣的餐？',
      tags: ['早午餐', '便當簡餐', '麵食', '火鍋', '燒烤', '咖啡飲料', '甜點烘焙', '居酒屋', '異國料理', '無菜單料理'],
    },
    {
      key: 'audience',
      label: '客群／場景',
      description: '誰常來、什麼場合來？',
      tags: ['上班族午餐', '家庭聚餐', '學生平價', '約會晚餐', '宵夜場', '外帶外送族', '寵物友善', '親子座位'],
    },
    {
      key: 'value',
      label: '訴求／堅持',
      description: '你跟別家最大的不同？',
      tags: ['手作備料', '本土食材', '招牌品堅持', '季節限定', '不接外送', '不訂位先到先吃', '開放廚房', '當日新鮮'],
    },
  ],

  美髮美容: [
    {
      key: 'product',
      label: '服務類型',
      description: '你主要做哪些？',
      tags: ['剪髮', '染髮', '燙髮', '護髮', '頭皮 SPA', '燙染同次', '接髮', '婚禮造型', '男士剪髮'],
    },
    {
      key: 'audience',
      label: '客群／預約',
      description: '誰常來？',
      tags: ['上班族', '學生', '新手第一次', '媽媽族', '中性風', '熟客為主', '一對一不重疊', '可線上預約'],
    },
    {
      key: 'value',
      label: '訴求／風格',
      description: '你的風格定位？',
      tags: ['低敏染劑', '韓系日系', '自然修剪', '不傷髮質', '頭皮先養', '低限度燙', '不接趕單'],
    },
  ],

  醫美: [
    {
      key: 'product',
      label: '療程類型',
      description: '你主推哪些？',
      tags: ['肉毒', '玻尿酸', '雷射', '電音波', '痘疤治療', '美白點滴', '微針', '童顏針', '埋線'],
    },
    {
      key: 'audience',
      label: '客群／部位',
      description: '主要客群與部位？',
      tags: ['25-30 預防', '40+ 維持', '男性微整', '眼周', '輪廓', '法令紋', '頸部', '手部'],
    },
    {
      key: 'value',
      label: '訴求／溝通',
      description: '你的服務風格？',
      tags: ['自然不腫', '無術後恢復期', '漸進改善', '醫師親自操作', '不推銷追加', '面診不收費'],
    },
  ],

  牙科: [
    {
      key: 'product',
      label: '服務項目',
      description: '主要看哪些？',
      tags: ['洗牙', '補牙', '根管', '矯正', '植牙', '美白', '假牙', '兒童牙科', '齒顎矯正'],
    },
    {
      key: 'audience',
      label: '客群／場景',
      description: '誰常來？',
      tags: ['兒童', '長輩', '孕婦', '怕看牙者', '上班族下班看診', '假日門診'],
    },
    {
      key: 'value',
      label: '訴求／設備',
      description: '你的特色？',
      tags: ['健保給付', '自費透明', '舒眠麻醉', '3D 數位', '夜間門診', '預約準時不久候', '無痛麻醉'],
    },
  ],

  律師: [
    {
      key: 'product',
      label: '專業領域',
      description: '主要承辦哪些案件？',
      tags: ['合約審閱', '勞資糾紛', '家事繼承', '商標智財', '訴訟', '車禍', '商務', '不動產', '刑事辯護'],
    },
    {
      key: 'audience',
      label: '客群',
      description: '主要服務誰？',
      tags: ['個人', '家族企業', '新創公司', '中小企業', '外國人', '房東房客'],
    },
    {
      key: 'value',
      label: '服務風格',
      description: '你的承辦風格？',
      tags: ['線上諮詢', '固定費用', '案件式收費', '保密承諾', '不打沒贏面的官司', '先諮詢再委任'],
    },
  ],

  補教: [
    {
      key: 'product',
      label: '科目',
      description: '主要教哪些？',
      tags: ['數學', '英文', '自然', '國文', '社會', '程式', '美術', '音樂', '全科'],
    },
    {
      key: 'audience',
      label: '階段／班型',
      description: '主要學員？',
      tags: ['國小', '國中', '高中', '學測會考', '在職進修', '1對1', '小班', '線上課'],
    },
    {
      key: 'value',
      label: '訴求／方法',
      description: '你的教學特色？',
      tags: ['弱科加強', '進度追蹤', '適應期觀察', '不續報壓力', '考前衝刺', '家長同步報告'],
    },
  ],

  零售: [
    {
      key: 'product',
      label: '商品類別',
      description: '主要賣什麼？',
      tags: ['服飾', '3C', '文具', '生活雜貨', '寵物用品', '家電家具', '酒類', '咖啡豆茶葉', '美妝保養', '文創書籍', '食品乾貨'],
    },
    {
      key: 'audience',
      label: '客群／場景',
      description: '誰常來？',
      tags: ['自用收藏', '送禮', '商務禮品', '親子', '日常採購', '收藏家'],
    },
    {
      key: 'value',
      label: '訴求／服務',
      description: '你跟連鎖的不同？',
      tags: ['職人選品', '限量稀有', '二手寄售', '可訂製', '試用試穿', '在地小農', '可預訂', '包裝服務', '維修保固'],
    },
  ],

  其他: [
    {
      key: 'product',
      label: '服務型態',
      description: '你提供什麼？',
      tags: ['諮詢', '代辦', '代購', '設計', '修繕', '教學', '整理收納', '寵物服務', '攝影', '婚禮顧問'],
    },
    {
      key: 'audience',
      label: '客群',
      description: '主要服務誰？',
      tags: ['個人', '家庭', '中小企業', '在地店家', '新手', '熟客為主'],
    },
    {
      key: 'value',
      label: '訴求',
      description: '你的特色？',
      tags: ['彈性時間', '書面紀錄', '不限地點', '固定報價', '全程透明', '一次到位'],
    },
  ],
};

export interface GeneratedBroadcast {
  day: string;
  category: LineCategory;
  title: string;
  message: string;
  bestTime: string;
  emoji: string;
  characterCount: number;
}

/** 推薦推播時段（依台灣 LINE 流量高峰） */
const TIMES = {
  morning: '早上 8:00 - 9:00',
  noon: '中午 12:00 - 13:00',
  evening: '晚上 20:30 - 22:00',
} as const;

/** 7 天結構性 meta — 所有產業共用 */
const DAY_META: Array<{
  day: string;
  category: LineCategory;
  title: string;
  bestTime: string;
  emoji: string;
}> = [
  { day: '週一', category: '歡迎', title: '一週開頭：軟性問候 + 本週預告', bestTime: TIMES.morning, emoji: '☀️ 📋' },
  { day: '週二', category: '教育', title: '小知識 / 觀念釐清', bestTime: TIMES.evening, emoji: '💡 📝' },
  { day: '週三', category: 'QA', title: '常見問題回答', bestTime: TIMES.noon, emoji: '❓ 💬' },
  { day: '週四', category: '幕後', title: '營業日常 / 製程紀錄', bestTime: TIMES.evening, emoji: '🛠️ 🧠' },
  { day: '週五', category: '新品', title: '新品 / 新方案介紹', bestTime: TIMES.noon, emoji: '🎉 ✨' },
  { day: '週六', category: '促銷', title: '溫和促銷（避免推銷感）', bestTime: TIMES.morning, emoji: '🎁 🙏' },
  { day: '週日', category: '節慶', title: '週末總結 / 軟性節慶問候', bestTime: TIMES.evening, emoji: '🌙 💚' },
];

/**
 * 每篇模板拿到的 context。為了讓 8 產業 × 7 天既有模板不用改：
 * 由 generateBroadcasts() 依「該天該嵌什麼」預先生 ctxFirst。
 * - 週一：標籤組成的自然句（"本週主要在「威士忌、送禮」"）
 * - 週二：訴求標籤包成括弧引語（"選酒推薦這件事"）
 * - 週五：產品標籤直接當「新品名稱」
 * - 週四：tags 不驅動（保留原本場景故事）
 */
interface BuildCtx {
  name: string;
  theme: string;
  ctxFirst: string;
  ctxFull: string;
}

type DraftBuilder = (c: BuildCtx) => string;

// ─────────────────────────────────────────────────────────────────
// INDUSTRY_TEMPLATES — 每個產業 7 篇獨立文案
// 寫作守則：
//   1. 從該產業老闆的角度，跟自家 LINE 好友說話（不是泛用文案）
//   2. 講具體場景、具體時間、具體流程，不要抽象勵志
//   3. 避免：「賦能 / 閉環 / 乾貨 / 連續驚嘆號」等簡中 SaaS 語感
//   4. 句尾不用「呢」「啦」過度語助詞，保持台灣中文自然書面感
//   5. 短句、換行多、不要長段落
// ─────────────────────────────────────────────────────────────────

// ═══════════════════════════════ 裝潢修繕 ═══════════════════════════════
// 裝潢／裝修／安裝／維修 4 子項共用同一套 LINE 模板
const RENOVATION_LINE_TEMPLATES: DraftBuilder[] = [
  // 週一 歡迎
  ({ name, theme, ctxFirst }) =>
    `早安🔧\n\n${name} 本週照常接案，現場丈量跟報價都免費。${theme ? `\n本週重點：${theme}。` : ''}${ctxFirst ? `\n\n想先跟你說：${ctxFirst}。` : ''}\n\n這個月檔期比較滿，要排工程的直接 LINE 回地址跟需求，我們先幫你卡丈量時間。`,
  // 週二 教育
  ({ name, ctxFirst }) =>
    `常被問：為什麼同樣的工程，每家報價差這麼多。\n\n差別多半在看不到的地方：材料等級、防水做不做確實、舊管線換不換。\n\n一個總價數字看不出什麼，逐項列的報價單才看得出貴在哪、省在哪。${ctxFirst ? `\n\n（這禮拜想多聊：${ctxFirst}）` : ''}\n\n— ${name}`,
  // 週三 QA
  ({ name }) =>
    `常被問：保固多久、工期多長？\n\n・防水、泥作保固一年，期間有問題回來免費處理\n・局部維修通常 1-3 天\n・整間翻新多半 3-6 週，報價時給你排程表\n\n還有想問的，LINE 直接傳屋況照片，我們先初步看。\n\n— ${name}`,
  // 週四 幕後
  ({ name, ctxFirst }) =>
    `今天在工地${ctxFirst ? `——${ctxFirst}。` : '花了快一個鐘頭，就為了把一道牆角的矽利康收乾淨'}。\n\n這種地方屋主住進去半年後才會發現做得好不好。我們寧可交屋前先處理掉。\n\n看不到的地方，才是功夫。\n\n— ${name}`,
  // 週五 新品
  ({ name, theme, ctxFirst }) => {
    const what = theme || ctxFirst;
    return what
      ? `${name} 這季新增：${what} 🔧\n\n適用情況、價格範圍都放進 LINE 圖文選單。\n\n要看適不適合你家，LINE 傳屋況照片或約現場評估。`
      : `${name} 最近多接了幾種工法的案子 🔧\n\n還在累積案例，先給 LINE 好友問。有需求的傳照片，我們評估完再報。`;
  },
  // 週六 促銷
  ({ name }) =>
    `週六🔧\n\n${name} 想先把這個月的丈量檔期排一排。\n\n這個月底前預約現場丈量：報價單免費、不綁約、比過價不做也沒關係。\n\n不推銷、不叫你當場簽。要約直接回地址跟需求就行。`,
  // 週日 節慶
  ({ name, theme }) =>
    `週日晚安🌙\n\n禮拜天我們${theme ? `把「${theme}」的料件跟排程都備好了` : '把這禮拜的工地都收尾、明天的料備齊'}，明天照常開工。\n\n下週想處理但還不確定的屋況，先 LINE 傳照片問，會幫你看。\n\n— ${name}`,
];

const INDUSTRY_TEMPLATES: Record<LineIndustry, DraftBuilder[]> = {
  裝潢: RENOVATION_LINE_TEMPLATES,
  裝修: RENOVATION_LINE_TEMPLATES,
  安裝: RENOVATION_LINE_TEMPLATES,
  維修: RENOVATION_LINE_TEMPLATES,
  // ═══════════════════════════════ 餐飲 ═══════════════════════════════
  餐飲: [
    // 週一 歡迎
    ({ name, theme, ctxFirst }) =>
      `早安☕\n\n${name} 本週供應一切照常。${theme ? `\n本週重點：${theme}。` : ''}${ctxFirst ? `\n\n想先跟你說：${ctxFirst}。` : ''}\n\n中午 12:00-13:00、晚上 18:30-19:30 是滿座時段。要避開或要預訂位的，LINE 直接回時段就行。`,
    // 週二 教育
    ({ name, ctxFirst }) =>
      `常被問：為什麼我們的便當/餐點比隔壁貴 5-15 元。\n\n簡單講：菜是早上去市場挑的、米換成本土履歷米、油用新的不重複。便宜可以從別的地方省，不會從食材上省。\n\n下次看到漲價也別緊張，多半是上游菜價真的漲。${ctxFirst ? `\n\n（這禮拜想多聊：${ctxFirst}）` : ''}\n\n— ${name}`,
    // 週三 QA
    ({ name }) =>
      `常被問：可以外送嗎？\n\n外送平台有上 foodpanda / Uber Eats，但有幾個品項建議不要外送：\n・湯品（會分層）\n・油炸（30 分鐘後就軟）\n・生菜（葉子會壓壞）\n\n這幾類建議外帶自己過來，或 LINE 跟我們預留時間到店取餐。\n\n— ${name}`,
    // 週四 幕後
    ({ name, ctxFirst }) =>
      `今天早上${ctxFirst ? `——${ctxFirst}。` : '備料時被自己手邊那籃 18 顆洋蔥嚇到，這禮拜怎麼用這麼多。'}\n\n其實是新菜要試做，得多預留一倍量。試做的成品這禮拜過來吃到的話，順便告訴我們喜不喜歡——會根據反應決定要不要排進正式菜單。\n\n— ${name}`,
    // 週五 新品
    ({ name, theme, ctxFirst }) => {
      const what = theme || ctxFirst;
      return what
        ? `${name} 這禮拜新增：${what} 🍽️\n\n價格、份量、適合誰都已經寫進 LINE 圖文選單。內用、外帶價格一樣，外送平台會多 5% 平台費。\n\n第一批做的不多，先給 LINE 好友嚐。`
        : `${name} 這禮拜悄悄上了一兩道新菜 🍽️\n\n沒有大張旗鼓宣傳，因為想先看 LINE 好友的反應再決定要不要常駐。\n\n本週進店點看看就會看到。`;
    },
    // 週六 促銷
    ({ name }) =>
      `週六🍙\n\n${name} 想跟長期的 LINE 好友說 🙏\n\n本月底前，憑這則 LINE，平日中午 11:30-13:30 內用，第二份主餐半價（只給 LINE 好友、不公開、不可外帶）。\n\n要來的話直接回「我要」，我們幫你預留座位。`,
    // 週日 節慶
    ({ name, theme }) =>
      `週日晚安🌙\n\n禮拜天我們${theme ? `處理完了「${theme}」相關的事` : '把這禮拜該收的收完了'}，明天禮拜一照常 11:00 開門。\n\n下週有想吃但不確定有沒有的，先 LINE 問，會幫你留。\n\n— ${name}`,
  ],

  // ═══════════════════════════════ 美髮美容 ═══════════════════════════════
  美髮美容: [
    ({ name, theme, ctxFirst }) =>
      `早安☀️\n\n${name} 本週設計師${theme ? `主推：${theme}` : '全員到位'}。${ctxFirst ? `\n\n想先跟你說：${ctxFirst}。` : ''}\n\n要約這週的話，LINE 直接傳要的時段，比較不會打到店裡正在剪的時間。`,
    ({ name, ctxFirst }) =>
      `常被問：「染完幾天可以洗頭」「燙完要怎麼保養」。\n\n簡短版：\n・染完 48 小時內盡量不洗\n・燙完 72 小時內不要綁太緊\n\n詳細版很長，做完幫你寫一張個人保養單帶走。\n\n你最近髮況有問題可以 LINE 傳照片問。${ctxFirst ? `\n\n（這禮拜想多聊：${ctxFirst}）` : ''}\n\n— ${name}`,
    ({ name }) =>
      `常被問：「想做但不知道做什麼」「我頭髮這樣可以剪短嗎」。\n\n我們的方式：第一次來不急著做，先諮詢（免費 10-15 分鐘），看你的髮況、髮量、生活習慣，再決定做什麼。\n\n沒有「適合所有人的」剪法，只有適合你現況的。\n\n— ${name}`,
    ({ name, ctxFirst }) =>
      `${ctxFirst || '今天卡了一個比較難處理的客人——之前染過 3 種顏色疊在一起'}。\n\n沒辦法一次救回來，分了 3 次處理，這禮拜還在收尾。\n\n做久了會發現，難的從來不是技術，是「告訴客人這要分幾次做、不要太急」。\n\n— ${name}`,
    ({ name, theme, ctxFirst }) => {
      const what = theme || ctxFirst;
      return what
        ? `${name} 本週新引進：${what} ✂️\n\n細節已放 LINE 圖文選單。\n\nLINE 好友本週預約有保留名額，週末前回我會幫你卡位。`
        : `${name} 本月新進了一組染劑，是專門針對亞洲人髮質做的色階。\n\n細節 LINE 圖文選單。第一週只開 6 個名額給 LINE 好友先試。`;
    },
    ({ name }) =>
      `週六🌙\n\n本月底前，憑這則 LINE 預約「染 + 護 + 剪」組合，多送一次居家護髮組，現場直接帶走，不用另外加購。\n\n不是清貨，是這個組合本來就最值得做完整。\n\n要排時間直接回「我要」。\n\n— ${name}`,
    ({ name, theme }) =>
      `週日晚安🌙\n\n本週把該收的客人都收完。下禮拜${theme ? `主推：${theme}` : '排班正常'}，週一 11:00 開門。\n\n要剪建議週三/週四避開週末人潮。LINE 直接約。\n\n— ${name}`,
  ],

  // ═══════════════════════════════ 醫美 ═══════════════════════════════
  醫美: [
    ({ name, theme, ctxFirst }) =>
      `早安☀️\n\n${name} 本週看診時段照常。${theme ? `\n本週主推：${theme}。` : ''}${ctxFirst ? `\n\n想先跟你說：${ctxFirst}。` : ''}\n\n預約前歡迎先 LINE 諮詢，會初步看適不適合，再幫你約面診。`,
    ({ name, ctxFirst }) =>
      `常被問：「打了會不會看起來不自然」。\n\n短答：自然 = 適量 + 適部位 + 適時機。不是醫師厲害不厲害的問題，是溝通有沒有對齊期望值。\n\n${name} 每次操作前都會先用照片模擬、再執行。中途任何不確定都可以喊停。${ctxFirst ? `\n\n（這禮拜想多聊：${ctxFirst}）` : ''}`,
    ({ name }) =>
      `常被問：「我這個年紀適合做什麼」「會不會做太早」。\n\n我們的判斷：不是看年紀，是看你目前最在意的點。25 歲可能就有黑眼圈、45 歲也可能膚況很穩。\n\n第一次來建議先約面診（不收費、不施作），看完彼此確認方向再排療程。\n\n— ${name}`,
    ({ name, ctxFirst }) =>
      `${ctxFirst || '今天遇到一個客人，第一次來面診結果什麼都沒做就回去——因為我們判斷她現在的訴求不需要施作'}。\n\n拒絕生意有時候是更負責任。客人這次走了會回來，硬做反而 1 年內失去信任。\n\n慢工出細活，這個產業特別適用。\n\n— ${name}`,
    ({ name, theme, ctxFirst }) => {
      const what = theme || ctxFirst;
      return what
        ? `${name} 本月引入：${what} 💉\n\n適合誰、不適合誰、預期效果、恢復期，都已寫在 LINE 圖文選單。\n\n先開給長期 LINE 好友做評估，由我們看你適不適合再說其他。`
        : `${name} 這禮拜引入了一個新儀器/新療程。\n\n細節 LINE 圖文選單。要試的話建議先 LINE 預約面診，由我們判斷是否適合。`;
    },
    ({ name }) =>
      `週六☀️\n\n${name} 想跟長期 LINE 好友說：本月底前，第一次正式療程的客人，多送一次術後保養諮詢（NT$1,500 內容）。\n\n不是衝業績，是想讓「願意第一次相信我們的人」做完整流程。\n\n要的話直接回「我要諮詢」。`,
    ({ name, theme }) =>
      `週日晚安🌙\n\n本週${theme ? `主要在處理「${theme}」` : '看診時段都正常進行'}，下週一持續開診。\n\n如果你最近狀態有變化，下次來面診直接講，會調整療程節奏。\n\n— ${name}`,
  ],

  // ═══════════════════════════════ 牙科 ═══════════════════════════════
  牙科: [
    ({ name, theme, ctxFirst }) =>
      `早安☀️\n\n${name} 本週看診時段正常。${theme ? `\n本週主要在：${theme}。` : ''}${ctxFirst ? `\n\n想跟你說：${ctxFirst}。` : ''}\n\n要約洗牙、檢查或補牙的，LINE 直接傳要約的時段，我會回最近可預約的兩個選項。`,
    ({ ctxFirst }) =>
      `常被問：「半年要洗一次牙嗎」「牙齦流血要不要去看」。\n\n半年洗牙＝健保有給付，建議照做，不會「越洗越敏感」（這是迷思）。\n\n牙齦流血如果連續 1 週以上，建議來檢查——可能不是刷太用力，是牙周開始發炎。${ctxFirst ? `\n\n（這禮拜想多聊：${ctxFirst}）` : ''}`,
    ({ name }) =>
      `常被問：「孩子幾歲可以開始看牙」。\n\n標準答案：第一顆乳牙長出來後就可以。但實務上建議 2-3 歲第一次看牙，目的是讓孩子先「習慣看牙這件事」，不是治療。\n\n第一次「沒有治療」反而最重要——之後就不會怕。\n\n— ${name}`,
    ({ name, ctxFirst }) =>
      `${ctxFirst || '今天遇到一個怕看牙怕到 5 年沒檢查的客人。處理完看著她說「沒想到也還好」'}。\n\n怕看牙不是丟臉的事，多數人都是這樣。\n\n如果你也很久沒檢查，先 LINE 問都可以——不用一開始就預約。\n\n— ${name}`,
    ({ name, theme, ctxFirst }) => {
      const what = theme || ctxFirst;
      return what
        ? `${name} 本月引進：${what} 🦷\n\n適合誰、處置流程、費用範圍，都已寫在 LINE 圖文選單。\n\n要評估先 LINE 預約面診。`
        : `${name} 這禮拜新增了一個療程選項。\n\n細節 LINE 圖文選單。要評估是否適合，先 LINE 預約面診。`;
    },
    ({ name }) =>
      `週六🦷\n\n${name} 想跟 LINE 好友說：本月底前，第一次來檢查的新患者，多送一次 X 光 + 口腔健檢報告（書面寄家裡）。\n\n不收費、不綁療程。想試我們服務的話這個是最低成本入口。`,
    ({ name, theme }) =>
      `週日晚安🌙\n\n本週${theme ? `主要排程：${theme}` : '看診時段都依排程'}。下週一持續開診。\n\n最近有不確定要不要看的情況，先 LINE 問。\n\n— ${name}`,
  ],

  // ═══════════════════════════════ 律師 ═══════════════════════════════
  律師: [
    ({ name, theme, ctxFirst }) =>
      `早安☕\n\n${name} 本週承辦時段照常。${theme ? `\n本週主要在處理：${theme}。` : ''}${ctxFirst ? `\n\n想先跟你說：${ctxFirst}。` : ''}\n\n如果有合約、糾紛、申請文件想諮詢，LINE 先傳摘要，我會回你需不需要正式面談。`,
    ({ name, ctxFirst }) =>
      `常被問：「這個合約我簽了會怎樣」。\n\n簡短回答：合約最危險的不是條文，是「沒寫進去的部分」。\n\n${name} 看合約的習慣是先看三項：\n1) 終止條件\n2) 違約罰則\n3) 智財歸屬\n\n其他細節都在這三項脈絡下。${ctxFirst ? `\n\n（這禮拜想多聊：${ctxFirst}）` : ''}\n\n有不確定的條文可以 LINE 截圖傳，我會講大原則（個案還是要正式諮詢）。`,
    ({ name }) =>
      `常被問：「需不需要請律師」。\n\n判準：\n・金額 < 5 萬、文件 < 1 頁、沒對方反對 → 自己處理可以\n・任何一項超過 → 至少諮詢一次\n\n諮詢費比起後續處理成本，永遠是最便宜的一段。\n\n要諮詢 LINE 約時間（第一次 30 分鐘 NT$1,500）。\n\n— ${name}`,
    ({ name, ctxFirst }) =>
      `${ctxFirst || '今天接了一個案子，當事人從 LINE 第一次傳來到簽委任走了 3 週'}。\n\n這個產業最費時的不是處理案子，是「先讓當事人理解我們在幫他做什麼」。\n\n${name} 會花比同業久的時間做事前溝通——後續就不用反覆解釋。\n\n— ${name}`,
    ({ name, theme, ctxFirst }) => {
      const what = theme || ctxFirst;
      return what
        ? `${name} 本月開放：${what} ⚖️\n\n適合誰、流程、費用，都已寫在 LINE 圖文選單。\n\n要評估直接 LINE 約 30 分鐘諮詢。`
        : `${name} 本月開放一個新諮詢項目。\n\n細節 LINE 圖文選單。要試的話 LINE 直接約。`;
    },
    ({ name }) =>
      `週六☕\n\n${name} 想跟 LINE 好友說：本月底前，新諮詢客戶可以將首次 30 分鐘諮詢費抵後續委任費（限同一案件）。\n\n不是促銷，是讓你「不用為了試試看的諮詢額外付費」。\n\n要約時間直接回「諮詢」。`,
    ({ name, theme }) =>
      `週日晚安🌙\n\n本週${theme ? `主要處理：${theme}` : '案件依排程進行中'}。下週一持續處理。\n\n有想諮詢但不確定值不值得開案的，先 LINE 問，我會幫你判斷。\n\n— ${name}`,
  ],

  // ═══════════════════════════════ 補教 ═══════════════════════════════
  補教: [
    ({ name, theme, ctxFirst }) =>
      `早安☀️\n\n${name} 本週課程照常。${theme ? `\n本週重點主題：${theme}。` : ''}${ctxFirst ? `\n\n想跟家長/同學先說：${ctxFirst}。` : ''}\n\n要插班試聽或諮詢的，LINE 傳「孩子年級 + 想加強科目」，我回時段。`,
    ({ name, ctxFirst }) =>
      `常被問：「孩子明明上課專心，回家就不會了」。\n\n常見原因：上課懂 ≠ 自己會。差別在「中間有沒有讓孩子自己練 + 自己解釋給別人聽」。\n\n${name} 課堂上會故意讓孩子互教 3 分鐘——這 3 分鐘比老師講 30 分鐘留下的多。${ctxFirst ? `\n\n（這禮拜想多聊：${ctxFirst}）` : ''}`,
    ({ name }) =>
      `常被問：「跨年級可以一起上嗎」。\n\n小團體（≤ 4 人）可以——刻意混兩個年級，讓上面的講給下面的聽（再記一次）、下面的看到下個階段該長什麼樣。\n\n但超過 4 人就不混，會變成大家都吃不飽。\n\n— ${name}`,
    ({ name, ctxFirst }) =>
      `${ctxFirst || '今天備課時改了一份題目——把過去 3 年常被學生卡住的題型整理進來'}。\n\n${name} 的習慣：每學期重新看一次題庫，把「考點變化」也帶進來。\n\n上課其實是「持續整理」的過程，不是「把書教完」。`,
    ({ name, theme, ctxFirst }) => {
      const what = theme || ctxFirst;
      return what
        ? `${name} 本月新增：${what} 📚\n\n適合年級、內容、報名方式，都已放在 LINE 圖文選單。\n\nLINE 好友本週報名享優惠名額。`
        : `${name} 本月新增了一個短期班型。\n\n細節 LINE 圖文選單。報名前可以 LINE 預約 15 分鐘諮詢。`;
    },
    ({ name }) =>
      `週六☀️\n\n${name} 想跟 LINE 好友說：本月底前，介紹新同學報名，雙方各享 1 堂免費試聽 + 一份新生講義。\n\n不是促銷，是看下來一起學的效果確實比單獨上好。\n\n要約試聽直接回「試聽」。`,
    ({ name, theme }) =>
      `週日晚安🌙\n\n本週${theme ? `主軸：${theme}` : '課程依進度進行中'}。下週一持續開課。\n\n家裡孩子最近有學習狀況變化，下次 LINE 問或來談都可以。\n\n— ${name}`,
  ],

  // ═══════════════════════════════ 零售 ═══════════════════════════════
  零售: [
    ({ name, theme, ctxFirst }) =>
      `早安☀️\n\n${name} 本週${theme ? `主推：${theme}` : '商品上架照常'}。${ctxFirst ? `\n\n想先跟你說：${ctxFirst}。` : ''}\n\n喜歡的商品如果現場剛好缺貨，LINE 問下次補貨時間。`,
    ({ name, ctxFirst }) =>
      `常被問：「這個跟別家的差在哪」。\n\n${name} 挑商品的標準：用料 + 工法 + 廠商背景 三項都看過。同類型可能比量販店貴 10-20%，但用 2 年的話總成本反而便宜。\n\n你有不確定要不要買的，LINE 拍照傳，我會直接講「這個值得 / 這個其實不用」。${ctxFirst ? `\n\n（這禮拜想多聊：${ctxFirst}）` : ''}`,
    ({ name }) =>
      `常被問：「可以退換貨嗎」「保固多久」。\n\n標準：\n・未拆封 30 天可退\n・拆封 7 天有問題免費換\n・商品保固依原廠（我們會幫你處理）\n\n買來不確定合不合適，先 LINE 拍家裡狀況問，多半能先省一次來回。\n\n— ${name}`,
    ({ name, ctxFirst }) =>
      `${ctxFirst || '今天去廠商倉庫挑下一批貨，剔了 30% 我覺得品質沒到位的'}。\n\n${name} 的習慣：寧可少進貨、不要進「我自己不會買」的東西。\n\n這也是為什麼有時候你想要的款式我們沒有——不是漏了，是過不了我們這關。`,
    ({ name, theme, ctxFirst }) => {
      const what = theme || ctxFirst;
      return what
        ? `${name} 本週新到：${what} 🛍️\n\n細節、價格、適合誰，都已放在 LINE 圖文選單。\n\n第一批進貨量不多，LINE 好友先看。`
        : `${name} 本週新進了幾款值得看的商品。\n\n細節 LINE 圖文選單。本週實體店都有現貨展示。`;
    },
    ({ name }) =>
      `週六🛍️\n\n${name} 想跟 LINE 好友說：本月底前，憑這則 LINE 來店消費，多送一個小禮（不公開、只給 LINE 好友）。\n\n不是清庫存，是你 LINE 在這裡，多一個理由給你。\n\n要哪天來方便的可以先 LINE 跟我說。`,
    ({ name, theme }) =>
      `週日晚安🌙\n\n本週${theme ? `主推：${theme}` : '商品銷售依正常節奏'}。下週一持續營業。\n\n想看的款式現場剛好缺，LINE 問補貨時間。\n\n— ${name}`,
  ],

  // ═══════════════════════════════ 其他 ═══════════════════════════════
  其他: [
    ({ name, theme, ctxFirst }) =>
      `早安☀️\n\n${name} 本週服務時段照常。${theme ? `\n本週主要在：${theme}。` : ''}${ctxFirst ? `\n\n想先跟你說：${ctxFirst}。` : ''}\n\n要詢問或預約，LINE 直接傳需求，我會回最近可預約的時段。`,
    ({ name, ctxFirst }) =>
      `常被問：「為什麼你們的服務跟別家不太一樣」。\n\n${name} 的習慣是第一次就把流程講清楚，包括可能踩到的雷——這樣後面不用反覆解釋。\n\n比同業多花 10-15 分鐘溝通，但客人回來找第二次的比例反而比較高。${ctxFirst ? `\n\n（這禮拜想多聊：${ctxFirst}）` : ''}`,
    ({ name }) =>
      `常被問：「初次合作要準備什麼」。\n\n${name} 的回答：給我們你目前的狀況（圖、文字、需求都行），我們會回你「需要哪些資訊才能正式估」。\n\n第一次溝通不收費、不綁約。你看完評估再決定要不要進入下一步。`,
    ({ name, ctxFirst }) =>
      `${ctxFirst || '這禮拜花了不少時間做幕後流程整理'}。\n\n做久了才知道，那些沒說出口的部分，才是客人決定要不要再來的原因。\n\n有想知道我們怎麼做的，LINE 問都可以。\n\n— ${name}`,
    ({ name, theme, ctxFirst }) => {
      const what = theme || ctxFirst;
      return what
        ? `${name} 本月新增：${what}\n\n細節已放在 LINE 圖文選單。\n\nLINE 好友本月諮詢，我們先做一份不收費的評估摘要給你看。`
        : `${name} 本月新增了一個服務項目。\n\n細節 LINE 圖文選單。要評估直接 LINE 預約諮詢，第一份摘要不收費。`;
    },
    ({ name }) =>
      `週六☀️\n\n${name} 想跟 LINE 好友說：本月底前，新合作的客戶多送一次後續確認諮詢（書面 + 30 分鐘）。\n\n不是促銷，是讓你「不用為了第一次合作多付一筆」。\n\n要約直接回「我要」。`,
    ({ name, theme }) =>
      `週日晚安🌙\n\n本週服務${theme ? `主要在：${theme}` : '按進度進行中'}。下週一持續。\n\n有不確定要不要約的，先 LINE 問。\n\n— ${name}`,
  ],
};

/**
 * 把用戶勾選的標籤，依組別拆出第一個 hint。
 * 找不到對應組就回空字串。
 */
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
 * 模板既有的 `${ctxFirst ? ... : ''}` 三元判斷不用改，
 * 由這個 helper 控制「該不該、要嵌什麼」。
 *
 * 設計：
 * - 週一 歡迎：自然句（"本週主要在「威士忌、送禮」這幾個方向"）
 * - 週二 教育：訴求/風格 tag（會被包進「（這禮拜想多聊：__）」）
 * - 週三 QA：空（QA 不嵌個人化）
 * - 週四 幕後：空（保留原本場景故事的真實感）
 * - 週五 新品：產品 tag（會直接當「新品名稱」）
 * - 週六 促銷：空
 * - 週日 節慶：空
 */
function buildCtxByDay(
  selectedTags: string[],
  groups: TagGroup[],
): string[] {
  if (selectedTags.length === 0) return ['', '', '', '', '', '', ''];

  const productHint = pickFirstTagInGroup(selectedTags, groups, 'product');
  const audienceHint = pickFirstTagInGroup(selectedTags, groups, 'audience');
  const valueHint = pickFirstTagInGroup(selectedTags, groups, 'value');

  // 週一：用前 2 個 tag 組自然句（不論組別）
  const monLead = selectedTags.slice(0, 2).join('、');
  const monSentence =
    selectedTags.length === 1
      ? `這個月主要想多談「${selectedTags[0]}」這塊`
      : `這禮拜想多聊「${monLead}」這幾個方向`;

  // 週二：用 value tag 包成「__這件事」；沒勾就退用 audience；都沒就空
  const tueAnchor = valueHint || audienceHint;
  const tueSentence = tueAnchor ? `${tueAnchor}這件事` : '';

  // 週五：用 product tag 當新品名稱；沒勾 product 就退用第一個 tag
  const friProduct = productHint || selectedTags[0] || '';

  return [
    monSentence,    // 週一
    tueSentence,    // 週二
    '',             // 週三
    '',             // 週四（保留場景故事）
    friProduct,     // 週五
    '',             // 週六
    '',             // 週日
  ];
}

/**
 * 產出 7 天 LINE 推播草稿。Deterministic — 同樣 input 同樣 output。
 */
export function generateBroadcasts(input: LineBroadcastInput): GeneratedBroadcast[] {
  const name = input.storeName.trim() || '我們';
  const theme = input.weekTheme?.trim() || '';
  const selectedTags = (input.selectedTags ?? [])
    .map((t) => t.trim())
    .filter(Boolean);

  const groups = INDUSTRY_TAGS[input.industry] ?? INDUSTRY_TAGS['其他'];
  const ctxByDay = buildCtxByDay(selectedTags, groups);

  const builders = INDUSTRY_TEMPLATES[input.industry] ?? INDUSTRY_TEMPLATES['其他'];

  return DAY_META.map((meta, idx) => {
    const dayCtx: BuildCtx = {
      name,
      theme,
      ctxFirst: ctxByDay[idx] ?? '',
      ctxFull: '',
    };
    const message = builders[idx](dayCtx);
    return {
      ...meta,
      message,
      characterCount: Array.from(message).length,
    };
  });
}

/** LINE 推播紅線（避免封鎖率上升） */
export interface LineRedline {
  rule: string;
  why: string;
  example: string;
}

export const LINE_REDLINES: LineRedline[] = [
  {
    rule: '不要連續 3 天都推促銷',
    why: '客人收到第 3 則「限時優惠」會直接封鎖。封鎖率會影響後續推播觸及（業界普遍觀察，非 LINE 官方公開的單一指標）。',
    example: '❌ 連續 3 天「特價」「最後 1 天」「再不買沒了」\n✅ 教育 → 幕後 → 促銷，中間插非銷售內容',
  },
  {
    rule: '推播時間避開深夜與清晨',
    why: '00:00 - 07:00 推播 = 吵到客人睡眠 = 封鎖率高。',
    example: '❌ 凌晨 1 點推「新品上架」\n✅ 早 8-9 / 中午 12-13 / 晚 20:30-22:00',
  },
  {
    rule: '一週推播 ≤ 3 次',
    why: '台灣中小店家實務觀察：好友每週收到超過 3 則推播時，封鎖率明顯上升。LINE 並未公布官方上限，這是業界常見建議值。',
    example: '❌ 每天 1 則\n✅ 一週挑 2-3 個重點時段推',
  },
  {
    rule: '訊息不要全部都連結',
    why: '純連結 + 「點我」= LINE 演算法會降低觸及。',
    example: '❌「最新優惠 → https://...」\n✅ 有起承轉合的文字 + 1 個 CTA 連結',
  },
  {
    rule: '不要用「親愛的好朋友」等罐頭開頭',
    why: '客人一秒就分辨「這是群發」→ 直接滑掉。',
    example: '❌「親愛的好朋友您好～」\n✅「週一早安☀️」「常被問的一個問題：」',
  },
  {
    rule: '避免使用過多驚嘆號與全大寫',
    why: '「！！！」「優惠 SAVE NOW」這種風格在台灣會被當成詐騙。',
    example: '❌「優惠！！！只剩 3 個名額！！」\n✅「這個月底前 LINE 好友獨享」',
  },
];

/**
 * LINE OA 台灣 2026 推播方案
 * 來源：LINE Biz-Solutions Taiwan 官方公開資訊（2026 新制）
 * 注意：方案數值會隨 LINE 政策調整，使用者應以官方頁面為準。
 */
export const LINE_PLAN_HINTS = [
  {
    plan: '輕用量（免費）',
    monthlyMessages: 200,
    note: 'NT$0/月、200 則。超過會停推。適合好友 50 以下、每週 1 則以下。',
  },
  {
    plan: '中用量',
    monthlyMessages: 25000,
    note: 'NT$1,600/月、25,000 則。超過每則 NT$0.2。好友 100-3,000、每週 2-3 則推播都夠用。',
  },
  {
    plan: '高用量',
    monthlyMessages: 200000,
    note: 'NT$18,000+/月、200,000 則起跳，可加購。好友 5,000+ 才考慮。',
  },
];
