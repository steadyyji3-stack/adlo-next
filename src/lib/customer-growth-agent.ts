import 'server-only';
import { generatePosts, INDUSTRY_TAGS, type Industry } from '@/lib/gbp-post-writer';
import { generateBroadcasts } from '@/lib/line-broadcast';
import { growthTaskSchema, type CustomerGrowthCycle, type GrowthTask } from '@/lib/customer-growth-types';
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
  instruction?: string;
}): Promise<AgentResult> {
  const evidence = buildEvidence(input.profile, input.history);
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return fallbackTask(input.profile, input.history, evidence);

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
    return fallbackTask(input.profile, input.history, evidence);
  }
}

const systemPrompt = `你是台灣在地店家的每週成長店長。只能根據輸入的 evidence 提出一個 5-30 分鐘能完成的任務，不得虛構分數、排名、評論或成效。任務類型只能是 gbp_post、line_broadcast、review_request。recentTasks 的 resultNote 是客戶實際回饋；優先延續有效做法，避免重複客戶明確表示不適合的任務。回傳符合以下欄位的純 JSON：type、title、objective、whyNow、scoreDimension、estimatedMinutes、steps（2-4項）、deliverables（1-3項，每項 label/content/usage）、successCheck。文案用台灣繁中、直接自然，不使用「賦能、打造、卓越、優質」。若使用者有 instruction，調整語氣或角度，但仍只能交付一個任務。`;

function buildEvidence(profile: StoreProfile, history: CustomerGrowthCycle[]) {
  const evidence = [
    `店家已提供產業：${profile.industry}`,
    `店家已選擇 ${profile.selectedTags.length} 個服務或客群標籤`,
  ];
  if (profile.weekTheme) evidence.push(`店家本週主題：${profile.weekTheme}`);
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
  evidence: string[],
): AgentResult {
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
