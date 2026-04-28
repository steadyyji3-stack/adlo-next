import 'server-only';
import type { GeneratedPost, PostWriterInput } from '@/components/post-writer/mock-data';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `你是台灣中小店家的 Google 商家貼文文案助手。你寫的是「台灣老闆會點頭」的口吻——直白、有溫度、不文謅謅、不業配感、不像中國公眾號。

【絕對禁止詞（出現任何一個就 fail）】
賦能、打造、優質、極致、傾力、煥新、深度、深度賦能、業界領先、最強、第一名、璀璨、輝煌、邁進、共創、共榮、品牌升級、賦予、致力、躍升、煥發、彰顯、卓越、典範。

【絕對禁止套話】
「歡迎大家來詢問～」、「希望對大家有幫助」、「今天要跟大家分享」、「一起來看看」、「讓我們一起」、「為您提供」、「值得期待」、「敬請關注」、「邀請您」、「不容錯過」。

【台灣語感檢查】
✓ 用「我們」「你」，不用「您」
✓ 用「揪一下」「順手帶」「想試試看」「先存起來」
✓ 不用「讓您體驗到」「為您打造」「致力於提供」
✓ 連續驚嘆號（！！！）禁止，每篇 emoji ≤ 2 個

【七天主題（順序固定）】
週一：節慶或時事連結
週二：產業教育（一個小知識）
週三：客戶見證（虛構一則 5 星評論的回應）
週四：幕後故事（現場、人、製程）
週五：新品或限定品
週六：促銷或週末活動
週日：QA（常被問的一題）

【每篇必須有 6 個欄位（一個都不能少）】
- day：「週一」/「週二」/.../「週日」
- category：「節慶」/「教育」/「客戶見證」/「幕後」/「新品」/「促銷」/「QA」
- title：≤ 16 字
- content：150–250 字繁中正文
- bestTime：建議貼文時段，HH:MM 格式（如 09:00）
- imageHint：建議拍什麼，一句話

【正確範例（學這個口吻）】
{
  "day": "週四",
  "category": "幕後",
  "title": "凌晨 4:30，店裡其實沒在睡",
  "content": "你來吃早餐的時候，麵糰已經揉了 2 個小時。有人問為什麼不前一晚做？答案很簡單：放隔夜的皮，吃起來就是不一樣。我們也想偷懶，但只要試過一次，客人下次就嚐得出來。所以還是 4:30 起床、揉麵糰、發酵、煎台預熱。等你 7:00 走進來那一刻，所有準備剛好對齊。",
  "bestTime": "20:00",
  "imageHint": "凌晨店內備料的廣角照，光線從後門斜射進來"
}

【錯誤範例（這種不要）】
{
  "title": "為您打造優質早餐體驗",
  "content": "我們致力於為每位顧客打造優質的早餐體驗，讓您感受到品牌升級後的卓越服務..."
}

回傳純 JSON object：{ "posts": [7 個物件 in 週一→週日 順序] }。
禁止前後文字、禁止 markdown code fence、禁止任何說明。`;

const BANNED_WORDS = [
  // 簡中味重的字
  '賦能', '打造', '優質', '極致', '傾力', '煥新', '璀璨', '輝煌', '邁進',
  '共創', '共榮', '品牌升級', '賦予', '致力', '躍升', '煥發', '彰顯', '卓越', '典範',
  '業界領先', '最強', '第一名', '深度賦能',
  // 套話
  '歡迎大家來詢問', '希望對大家有幫助', '今天要跟大家分享', '一起來看看',
  '讓我們一起', '為您提供', '值得期待', '敬請關注', '邀請您', '不容錯過',
];

const FIXED_DAYS = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
const FIXED_CATEGORIES = [
  '節慶', '教育', '客戶見證', '幕後', '新品', '促銷', 'QA',
] as const;

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqChoice {
  message: { content: string };
  finish_reason: string;
}

interface GroqResponse {
  choices: GroqChoice[];
  usage?: { prompt_tokens: number; completion_tokens: number };
  error?: { message: string; type: string };
}

function buildUserPrompt(input: PostWriterInput): string {
  const lines = [
    `店名：${input.storeName}`,
    `產業：${input.industry}`,
  ];
  if (input.weekTheme) {
    lines.push(`本週主打：${input.weekTheme}`);
  } else {
    lines.push(`本週主打：（沒指定，自由發揮）`);
  }
  lines.push('');
  lines.push('請生成下週 7 天的貼文初稿，回傳 { "posts": [...] }。');
  return lines.join('\n');
}

/** 只驗 title/content/bestTime/imageHint。day 和 category 由 index 補。 */
function hasCoreFields(p: unknown): p is Pick<GeneratedPost, 'title' | 'content' | 'bestTime' | 'imageHint'> {
  if (typeof p !== 'object' || p === null) return false;
  const r = p as Record<string, unknown>;
  return (
    typeof r.title === 'string' && r.title.length > 0 &&
    typeof r.content === 'string' && r.content.length >= 30 &&
    typeof r.bestTime === 'string' &&
    typeof r.imageHint === 'string'
  );
}

/** 用 index 補 day + category，回完整 GeneratedPost。 */
function normalizePost(raw: Record<string, unknown>, idx: number): GeneratedPost {
  return {
    day: typeof raw.day === 'string' && FIXED_DAYS.includes(raw.day) ? raw.day : FIXED_DAYS[idx],
    category:
      typeof raw.category === 'string' && (FIXED_CATEGORIES as readonly string[]).includes(raw.category)
        ? (raw.category as GeneratedPost['category'])
        : FIXED_CATEGORIES[idx],
    title: String(raw.title),
    content: String(raw.content),
    bestTime: String(raw.bestTime),
    imageHint: String(raw.imageHint),
  };
}

/**
 * 後處理過濾：把最 obviously 的簡中味/套話拿掉。
 * 只做整詞/整句移除或 您→你 這類零風險替換，避免破壞語法。
 */
/** 軟替換：保留語法但置換成中性詞，避免 PHRASE_REMOVAL 直接 drop 造成「最的咖啡」這種破句 */
const WORD_REPLACEMENTS: Record<string, string> = {
  最優質的: '最好的',
  高優質: '高品質',
  優質: '不錯',
  打造的: '做的',
  打造一個: '做一個',
  打造: '做',
  極致的: '十足的',
  極致: '十足',
  卓越的: '出色的',
  卓越: '出色',
  璀璨: '亮眼',
  邁進: '前進',
  致力於: '專注在',
  致力: '專注',
  賦能: '幫',
  傾力: '用心',
  煥新: '更新',
  煥發: '看起來',
  彰顯: '看得出',
  典範: '榜樣',
  共創: '一起做',
  共榮: '一起好',
  品牌升級: '更新',
  輝煌: '不錯',
  業界領先: '領先',
};

const PHRASE_REMOVALS = [
  '希望大家',
  '希望你能夠',
  '讓我們一起',
  '歡迎大家來詢問',
  '今天我們要跟大家分享',
  '今天要跟大家分享',
  '我們要跟大家分享',
  '一起來看看',
  '邀請您',
  '敬請關注',
  '值得期待',
  '不容錯過',
  '為您提供',
  '讓您',
  '總之',
];

const SIMP_TO_TRAD: Record<string, string> = {
  您: '你',
  们: '們',
  这: '這',
  里: '裡',
  带: '帶',
  个: '個',
  学: '學',
  发: '發',
  实: '實',
  时: '時',
  来: '來',
  说: '說',
  开: '開',
  对: '對',
  会: '會',
  从: '從',
  让: '讓',
  门: '門',
  与: '與',
  风: '風',
  种: '種',
  么: '麼',
  业: '業',
  师: '師',
  务: '務',
  处: '處',
  体: '體',
  设: '設',
  计: '計',
  单: '單',
  总: '總',
  验: '驗',
  钱: '錢',
  转: '轉',
  经: '經',
  张: '張',
  妈: '媽',
  这样: '這樣',
};

function sanitizeText(s: string): string {
  let out = s;
  // 1. 軟替換（先做，最長 key 優先以避免 子字串先被吃掉，例如「最優質的」要先於「優質」）
  const sortedReplacements = Object.entries(WORD_REPLACEMENTS).sort(
    (a, b) => b[0].length - a[0].length,
  );
  for (const [bad, good] of sortedReplacements) {
    out = out.split(bad).join(good);
  }
  // 2. 整句移除
  for (const phrase of PHRASE_REMOVALS) {
    out = out.split(phrase).join('');
  }
  // 3. 簡→繁 字符
  for (const [simp, trad] of Object.entries(SIMP_TO_TRAD)) {
    out = out.split(simp).join(trad);
  }
  // 4. 連續空白與多餘標點清理
  return out.replace(/  +/g, ' ').replace(/。{2,}/g, '。').trim();
}

function sanitizePost(p: GeneratedPost): GeneratedPost {
  return {
    ...p,
    title: sanitizeText(p.title),
    content: sanitizeText(p.content),
    imageHint: sanitizeText(p.imageHint),
  };
}

function detectBannedWords(posts: GeneratedPost[]): string[] {
  const hits = new Set<string>();
  for (const p of posts) {
    const text = `${p.title}\n${p.content}`;
    for (const w of BANNED_WORDS) {
      if (text.includes(w)) hits.add(w);
    }
  }
  return Array.from(hits);
}

/**
 * Call Groq Llama 3.3 70B, return 7 posts.
 * Throws on any failure (caller should fall back to mock).
 */
export async function generatePostsViaGroq(
  input: PostWriterInput,
): Promise<{ posts: GeneratedPost[]; bannedHits: string[]; tokensUsed: number }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY 未設定');

  const messages: GroqMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserPrompt(input) },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000); // 25s

  let res: Response;
  try {
    res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.65,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Groq API HTTP ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as GroqResponse;
  if (data.error) throw new Error(`Groq error: ${data.error.message}`);

  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Groq 回應為空');

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    // 試著從 markdown code fence 中救出 JSON
    const m = content.match(/\{[\s\S]*\}/);
    if (!m) throw new Error(`Groq 回應非 JSON：${content.slice(0, 100)}`);
    parsed = JSON.parse(m[0]);
  }

  const rawPosts = (parsed as { posts?: unknown }).posts;
  if (!Array.isArray(rawPosts) || rawPosts.length !== 7) {
    throw new Error(`期待 7 篇，實際 ${Array.isArray(rawPosts) ? rawPosts.length : '非 array'}`);
  }

  const invalidIdx = rawPosts.findIndex((p) => !hasCoreFields(p));
  if (invalidIdx >= 0) {
    const sample = JSON.stringify(rawPosts[invalidIdx]).slice(0, 300);
    throw new Error(`第 ${invalidIdx + 1} 篇核心欄位缺失: ${sample}`);
  }

  const posts: GeneratedPost[] = rawPosts
    .map((p, i) => normalizePost(p as Record<string, unknown>, i))
    .map(sanitizePost);

  const bannedHits = detectBannedWords(posts);
  const tokensUsed =
    (data.usage?.prompt_tokens ?? 0) + (data.usage?.completion_tokens ?? 0);

  return { posts, bannedHits, tokensUsed };
}
