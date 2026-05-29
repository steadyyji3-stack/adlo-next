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
  | '其他';

export interface LineBroadcastInput {
  storeName: string;
  industry: LineIndustry;
  weekTheme?: string;
  /**
   * 店家自建描述：本週發生的事、店家獨特賣點、想突出的觀點。
   * 會被自然嵌入到「歡迎/教育/幕後/新品」四篇模板裡。
   * 不是 AI 聊天輸入——只是給模板一個可植入的「你的素材」欄位。
   * 建議 30-300 字。
   */
  customContext?: string;
}

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

const INDUSTRY_TEMPLATES: Record<LineIndustry, DraftBuilder[]> = {
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
      `週六🌙\n\n本月底前，憑這則 LINE 預約「染 + 護 + 剪」組合，多送一次居家護髮（價值 NT$500，現場帶走）。\n\n不是清貨，是這個組合本來就最值得做完整。\n\n要排時間直接回「我要」。\n\n— ${name}`,
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
        ? `${name} 本月引入：${what} 💉\n\n適合誰、不適合誰、預期效果、恢復期，都已寫在 LINE 圖文選單。\n\n第一批先給長期 LINE 好友 25% 優惠（最多 10 位）。`
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
      `常被問：「需不需要請律師」。\n\n判準：\n・金額 < 5 萬、文件 < 1 頁、沒對方反對 → 自己處理可以\n・任何一項超過 → 至少諮詢一次\n\n諮詢費比起後續處理成本，永遠是最便宜的一段。\n\n要諮詢 LINE 約時間，第一次 30 分鐘 NT$1,500。\n\n— ${name}`,
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
      `週六☀️\n\n${name} 想跟 LINE 好友說：本月底前，介紹新同學報名，雙方各享 1 堂免費試聽 + 一份新生講義。\n\n不是促銷，是想讓「同路上的孩子」一起學。\n\n要約試聽直接回「試聽」。`,
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
      `週六🛍️\n\n${name} 想跟 LINE 好友說：本月底前，憑這則 LINE 來店消費，多送一個小禮（不公開、只給 LINE 好友）。\n\n不是清庫存，是想多認識常聯絡的客人。\n\n要哪天來方便的可以先 LINE 跟我說。`,
    ({ name, theme }) =>
      `週日晚安🌙\n\n本週${theme ? `主推：${theme}` : '商品銷售依正常節奏'}。下週一持續營業。\n\n想看的款式現場剛好缺，LINE 問補貨時間。\n\n— ${name}`,
  ],

  // ═══════════════════════════════ 其他 ═══════════════════════════════
  其他: [
    ({ name, theme, ctxFirst }) =>
      `早安☀️\n\n${name} 本週服務時段照常。${theme ? `\n本週主要在：${theme}。` : ''}${ctxFirst ? `\n\n想先跟你說：${ctxFirst}。` : ''}\n\n要詢問或預約，LINE 直接傳需求，我會回最近可預約的時段。`,
    ({ name, ctxFirst }) =>
      `常被問：「為什麼你們的服務跟別家不太一樣」。\n\n${name} 的做法：流程透明 + 預期值對齊 + 不過度承諾。可能比同業多花 10-15 分鐘溝通，但後續返工率明顯較低。\n\n有不確定的地方 LINE 直接問。${ctxFirst ? `\n\n（這禮拜想多聊：${ctxFirst}）` : ''}`,
    ({ name }) =>
      `常被問：「初次合作要準備什麼」。\n\n${name} 的回答：給我們你目前的狀況（圖、文字、需求都行），我們會回你「需要哪些資訊才能正式估」。\n\n第一次溝通不收費、不綁約。你看完評估再決定要不要進入下一步。`,
    ({ name, ctxFirst }) =>
      `${ctxFirst || '這禮拜花了不少時間做幕後流程整理'}。\n\n做久了會發現，客戶看不到的細節，反而是讓「再來一次」的決定因素。\n\n你有任何想知道我們怎麼做的，LINE 問都可以。\n\n— ${name}`,
    ({ name, theme, ctxFirst }) => {
      const what = theme || ctxFirst;
      return what
        ? `${name} 本月新增：${what}\n\n細節已放在 LINE 圖文選單。\n\nLINE 好友本月諮詢享優惠。`
        : `${name} 本月新增了一個服務項目。\n\n細節 LINE 圖文選單。要評估直接 LINE 預約諮詢。`;
    },
    ({ name }) =>
      `週六☀️\n\n${name} 想跟 LINE 好友說：本月底前，新合作的客戶多送一次後續確認諮詢（書面 + 30 分鐘）。\n\n不是促銷，是讓你「不用為了第一次合作多付一筆」。\n\n要約直接回「我要」。`,
    ({ name, theme }) =>
      `週日晚安🌙\n\n本週服務${theme ? `主要在：${theme}` : '按進度進行中'}。下週一持續。\n\n有不確定要不要約的，先 LINE 問。\n\n— ${name}`,
  ],
};

/**
 * 把用戶自建描述拆成可植入的片段。
 * - 第 1 句：用作「開場引語」
 * - 整段：保留供 v3 擴充
 * - 不做 AI 改寫，原文直接嵌入
 */
function splitContext(raw: string): { firstSentence: string; full: string } | null {
  const trimmed = raw.trim();
  if (trimmed.length < 8) return null;
  const match = trimmed.match(/^[^。！？.!?\n]{1,80}/);
  let firstSentence = (match?.[0] ?? trimmed.slice(0, 40)).trim();
  // 移除末尾標點，因為會被嵌入到「：xxx。」這種句型
  firstSentence = firstSentence.replace(/[。！？.!?,，、]+$/, '');
  return { firstSentence, full: trimmed };
}

/**
 * 產出 7 天 LINE 推播草稿。Deterministic — 同樣 input 同樣 output。
 */
export function generateBroadcasts(input: LineBroadcastInput): GeneratedBroadcast[] {
  const name = input.storeName.trim() || '我們';
  const theme = input.weekTheme?.trim() || '';
  const ctx = input.customContext ? splitContext(input.customContext) : null;

  const buildCtx: BuildCtx = {
    name,
    theme,
    ctxFirst: ctx?.firstSentence ?? '',
    ctxFull: ctx?.full ?? '',
  };

  const builders = INDUSTRY_TEMPLATES[input.industry] ?? INDUSTRY_TEMPLATES['其他'];

  return DAY_META.map((meta, idx) => {
    const message = builders[idx](buildCtx);
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
