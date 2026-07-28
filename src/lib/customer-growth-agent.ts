import 'server-only';
import { generatePosts, INDUSTRY_TAGS, type Industry } from '@/lib/gbp-post-writer';
import { generateBroadcasts } from '@/lib/line-broadcast';
import {
  growthTaskSchema,
  type CustomerGrowthCycle,
  type GrowthBusinessContext,
  type GrowthTask,
} from '@/lib/customer-growth-types';
import type { StoreProfile } from '@/lib/store-profile';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

interface AgentResult {
  task: GrowthTask;
  evidence: string[];
  source: 'groq' | 'template';
}

export async function generateWeeklyGrowthTask(input: {
  profile: StoreProfile;
  history: CustomerGrowthCycle[];
  business: GrowthBusinessContext;
  instruction?: string;
}): Promise<AgentResult> {
  const evidence = buildEvidence(input.profile, input.history, input.business);
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return fallbackTask(input.profile, input.history, input.business, evidence);

  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.55,
        max_tokens: 1800,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify({
            store: publicProfile(input.profile),
            business: input.business,
            evidence,
            recentTasks: input.history.slice(0, 4).map((cycle) => ({
              type: cycle.task.type,
              title: cycle.task.title,
              status: cycle.status,
              resultNote: cycle.feedback?.note ?? null,
            })),
            instruction: input.instruction || null,
          }) },
        ],
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!response.ok) throw new Error(`Groq HTTP ${response.status}`);
    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Groq response empty');
    const task = growthTaskSchema.parse(JSON.parse(content));
    return { task, evidence, source: 'groq' };
  } catch (error) {
    console.error('[GrowthAgent] AI generation failed, using template', error instanceof Error ? error.message : 'unknown error');
    return fallbackTask(input.profile, input.history, input.business, evidence);
  }
}

const systemPrompt = `你是台灣在地店家的每週成長店長。只能根據輸入的 evidence 提出一個 5-30 分鐘能完成的任務，不得虛構分數、排名、評論、客戶案例、工期、價格或成效；未知內容用方括號標示待店家補寫。任務類型只能是 gbp_post、line_broadcast、review_request、case_post、quote_clarity、photo_refresh、service_page。recentTasks 的 resultNote 是客戶實際回饋；優先延續有效做法，避免重複客戶明確表示不適合的任務。回傳符合以下欄位的純 JSON：type、title、objective、whyNow、scoreDimension、estimatedMinutes、steps（2-4項）、deliverables（1-3項，每項 label/content/usage）、successCheck。文案用台灣繁中、直接自然，不使用「賦能、打造、卓越、優質」。若使用者有 instruction，調整語氣或角度，但仍只能交付一個任務。`;

function buildEvidence(
  profile: StoreProfile,
  history: CustomerGrowthCycle[],
  business: GrowthBusinessContext,
) {
  const evidence = [
    `店家已提供產業：${profile.industry}`,
    `店家已選擇 ${profile.selectedTags.length} 個服務或客群標籤`,
  ];
  if (profile.weekTheme) evidence.push(`店家本週主題：${profile.weekTheme}`);
  if (business.storeCity) evidence.push(`店家服務城市：${business.storeCity}`);
  evidence.push(`店家${business.hasWebsite ? '已有' : '尚未提供'}網站`);
  evidence.push(`店家${business.hasGbpProfile ? '已有' : '尚未提供'} Google 商家網址`);
  if (business.signatureItems.length) {
    evidence.push(`店家已提供 ${business.signatureItems.length} 個招牌服務`);
  }
  const completed = history.filter((cycle) => cycle.status === 'completed').length;
  evidence.push(`系統內已有 ${history.length} 週任務，其中 ${completed} 週已完成`);
  const latestResultNote = history.find((cycle) => cycle.feedback?.note)?.feedback?.note;
  if (latestResultNote) evidence.push(`最近一次客戶結果回饋：${latestResultNote}`);
  return evidence;
}

function publicProfile(profile: StoreProfile) {
  return {
    storeName: profile.storeName,
    industry: profile.industry,
    selectedTags: profile.selectedTags,
    weekTheme: profile.weekTheme,
    businessType: profile.businessType,
    channels: profile.channels,
  };
}

function fallbackTask(
  profile: StoreProfile,
  history: CustomerGrowthCycle[],
  business: GrowthBusinessContext,
  evidence: string[],
): AgentResult {
  if (['裝潢', '裝修', '安裝', '維修'].includes(profile.industry)) {
    return renovationFallbackTask(profile, history, business, evidence);
  }
  const nextType = ['gbp_post', 'line_broadcast', 'review_request'][history.length % 3];
  const industry = Object.hasOwn(INDUSTRY_TAGS, profile.industry)
    ? profile.industry
    : '其他' as Industry;
  const input = {
    storeName: profile.storeName,
    industry,
    selectedTags: profile.selectedTags,
    weekTheme: profile.weekTheme,
  };
  if (nextType === 'line_broadcast') {
    const item = generateBroadcasts(input)[0];
    return { source: 'template', evidence, task: {
      type: 'line_broadcast', title: '把本週主題送到熟客面前',
      objective: '用一則清楚的 LINE 訊息，提醒熟客本週值得回店的理由。',
      whyNow: profile.weekTheme
        ? `本週主題是「${profile.weekTheme}」，現在整理成一則熟客看得懂的訊息。`
        : '持續和熟客保持聯絡，比臨時促銷更容易形成回訪。',
      scoreDimension: 'content', estimatedMinutes: 10,
      steps: ['閱讀並調整下方訊息', '貼到 LINE 官方帳號', '確認連結或預約方式後送出'],
      deliverables: [{ label: 'LINE 推播草稿', content: item.message, usage: `建議 ${item.bestTime} 發送` }],
      successCheck: '訊息已送出，且預約或聯絡方式可以正常使用。',
    } };
  }
  if (nextType === 'review_request') {
    const service = profile.selectedTags[0] ?? profile.industry;
    return { source: 'template', evidence, task: {
      type: 'review_request', title: '邀請 3 位近期客人留下真實評論',
      objective: '趁服務記憶還新鮮，讓近期客人分享具體體驗。',
      whyNow: '評論需要穩定累積；本週先從少量、真實且不施壓的邀請開始。',
      scoreDimension: 'reviews', estimatedMinutes: 10,
      steps: ['挑選 3 位近期完成服務的客人', '分別傳送下方訊息', '記下已傳送人數，不要求五星'],
      deliverables: [{ label: '評論邀請訊息', content: `嗨，謝謝你最近來 ${profile.storeName} 體驗${service}。如果方便，想請你在 Google 留下真實感受，幾句話就很有幫助；不用特別給高分，照實寫就可以。`, usage: '一對一傳送給近期客人，不要群發' }],
      successCheck: '已向 3 位真實客人發出邀請，且訊息沒有要求五星或提供交換條件。',
    } };
  }
  const post = generatePosts(input)[1];
  return { source: 'template', evidence, task: {
    type: 'gbp_post', title: '發布一篇能回答客人問題的 GBP 貼文',
    objective: '用一篇具體貼文補充店家專業資訊，讓搜尋者更容易做決定。',
    whyNow: profile.weekTheme
      ? `本週主題是「${profile.weekTheme}」，先把它變成一篇能發布的內容。`
      : 'Google 商家需要持續更新，先完成一篇比囤積整週草稿更有效。',
    scoreDimension: 'content', estimatedMinutes: 15,
    steps: ['閱讀並修正不符合現況的句子', '搭配一張真實工作或店內照片', '發布到 Google 商家檔案'],
    deliverables: [{ label: post.title, content: post.content, usage: `建議 ${post.bestTime} 發布；圖片：${post.imageHint}` }],
    successCheck: '貼文已發布，內容、營業資訊與圖片都符合店家真實現況。',
  } };
}

function renovationFallbackTask(
  profile: StoreProfile,
  history: CustomerGrowthCycle[],
  business: GrowthBusinessContext,
  evidence: string[],
): AgentResult {
  const service = business.signatureItems[0] ?? profile.selectedTags[0] ?? profile.industry;
  const city = business.storeCity ?? '你的主要服務地區';
  const index = history.length % 5;
  const tasks: GrowthTask[] = [
    {
      type: 'case_post', title: '整理一個近期工程案例',
      objective: '把真實施工過程整理成客戶能判斷專業度的案例內容。',
      whyNow: '高單價服務需要信任證據；一個具體案例比一週七篇泛用貼文更有說服力。',
      scoreDimension: 'content', estimatedMinutes: 20,
      steps: ['挑一個近期完成且可公開的案件', '補上草稿中的方括號內容', '搭配施工前、過程、完成後各一張照片並發布'],
      deliverables: [{ label: '工程案例草稿', content: `${profile.storeName} 最近在 ${city} 完成一個 ${service} 案件。\n\n施工前主要問題是：[客戶原本遇到的問題]。現場確認後，我們採用：[實際處理方式]。完成後的差異是：[可驗證的結果]。\n\n每個現場條件不同，先看過狀況再建議，不用只憑一張照片猜報價。`, usage: '方括號必須換成真實資料後再發布' }],
      successCheck: '案例已發布，三張照片與所有敘述都來自同一個真實案件。',
    },
    {
      type: 'quote_clarity', title: '先回答客戶最怕的報價問題',
      objective: '降低客戶詢價前的不確定感，讓合適的詢問更願意聯絡。',
      whyNow: '高單價工程最常卡在「會不會做到一半加價」；先說清楚流程能篩出更合適的客戶。',
      scoreDimension: 'content', estimatedMinutes: 15,
      steps: ['確認店內真實報價流程', '刪除不適用的句子', '發布到 GBP、LINE 或網站 FAQ'],
      deliverables: [{ label: '報價透明說明', content: `找 ${profile.storeName} 詢問 ${service}，我們會先確認四件事：\n1. 現場範圍與目前狀況\n2. 材料與工法選擇\n3. 哪些項目一定要做、哪些可以省\n4. 追加費用在什麼情況才會發生\n\n正式施工前會把項目寫清楚；若現場條件需要變更，也會先說明再決定，不會直接做完才通知。`, usage: '只保留符合店家真實流程的承諾' }],
      successCheck: '內容已公開，且每一項承諾都能由實際報價流程做到。',
    },
    {
      type: 'review_request', title: '邀請 3 位完工客戶留下真實評論',
      objective: '讓近期客戶描述工程溝通與完工體驗，累積可驗證信任。',
      whyNow: '工程結束後一週內記憶最完整，適合用少量一對一訊息邀請真實回饋。',
      scoreDimension: 'reviews', estimatedMinutes: 10,
      steps: ['挑選 3 位近期完工客戶', '分別傳送下方訊息', '不指定星等、不提供交換條件'],
      deliverables: [{ label: '完工評論邀請', content: `嗨，謝謝你這次找 ${profile.storeName} 處理 ${service}。如果方便，想請你在 Google 留下真實感受；可以寫溝通、施工或完工後最有感的一點，不用特別給高分，照實寫就可以。`, usage: '一對一傳送，不要群發' }],
      successCheck: '已向 3 位真實完工客戶發出邀請，訊息沒有要求五星。',
    },
    {
      type: 'photo_refresh', title: '補上 3 張能證明工法的照片',
      objective: '讓搜尋者看到工程細節，而不只有完成後的漂亮照片。',
      whyNow: '施工過程與收尾細節是專業證據，也最難被泛用 AI 內容取代。',
      scoreDimension: 'photos', estimatedMinutes: 15,
      steps: ['從同一案件挑出三個階段', '遮蔽地址、人臉與客戶個資', '加上簡短說明後手動上傳 GBP'],
      deliverables: [{ label: '三張照片清單', content: `1. 施工前：拍出原始問題\n2. 施工中：拍出材料或工法細節\n3. 完成後：用相近角度拍成果\n\n說明格式：${city}｜${service}｜[這張照片正在處理什麼]`, usage: '使用真實工程照片，不使用 AI 示意圖' }],
      successCheck: '三張照片已上傳，沒有地址、人臉或其他客戶個資。',
    },
    {
      type: 'service_page', title: `補一段「${city} ${service}」服務說明`,
      objective: '把服務項目與地區寫清楚，讓搜尋者知道店家是否適合自己的需求。',
      whyNow: business.hasWebsite ? '網站已有基礎，先補一段具體服務說明。' : '先準備可放在 Google 商家服務或未來網站的地區說明。',
      scoreDimension: 'local', estimatedMinutes: 20,
      steps: [business.hasWebsite ? '找到網站對應服務頁' : '打開 Google 商家服務或商家說明', '補齊方括號內真實內容', '發布後檢查手機版是否清楚'],
      deliverables: [{ label: '地區服務段落', content: `${profile.storeName} 提供 ${city} 的 ${service} 服務，適合：[常見客戶情境]。我們會先確認現場狀況、需求範圍與材料選擇，再說明建議做法與報價項目。服務範圍包含：[實際服務區域]。`, usage: business.hasWebsite ? '放在對應服務頁，不要塞進首頁所有段落' : '可先放在 Google 商家服務說明' }],
      successCheck: '段落已發布，地區、服務與承諾都符合實際營業範圍。',
    },
  ];
  return { source: 'template', evidence, task: tasks[index] };
}
