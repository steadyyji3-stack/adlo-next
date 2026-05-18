import 'server-only';

/**
 * SEO 文章計分 — 真實 HTML fetch + parse + 10 維度評分。
 *
 * 跟 keyword 工具不同，本工具給「精準分數」而非「相對等級」——
 * 因為分數從用戶提供的 URL 真實 HTML 算出來，可驗證、不需要 Google。
 *
 * 零外部 dependency：純 fetch + regex parse。
 */

export interface ScorerCheck {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  score: number; // 0-10
  found: string; // 實際偵測到的內容（給用戶看，自證）
  ideal: string; // 理想標準
  fix: string; // 該怎麼改（一句話）
}

export interface SeoScoreReport {
  url: string;
  fetchedAt: string;
  overallScore: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  checks: ScorerCheck[];
  topFixes: ScorerCheck[]; // 改善後分數增益最大的前 3 個 fail/warn
  insight: string;
}

export class SeoFetchError extends Error {
  constructor(
    public reason: 'INVALID_URL' | 'BLOCKED_HOST' | 'TIMEOUT' | 'HTTP_ERROR' | 'TOO_LARGE',
    message: string,
  ) {
    super(message);
    this.name = 'SeoFetchError';
  }
}

// ─────────────────────────────────────────────────────
// Fetch（帶安全限制）
// ─────────────────────────────────────────────────────
const MAX_BYTES = 2 * 1024 * 1024; // 2MB 文件上限
const FETCH_TIMEOUT_MS = 12_000;
const ALLOWED_PROTOCOLS = ['https:', 'http:'];

// SSRF 防護：拒絕本機 / 私有網路
const BLOCKED_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^169\.254\./,
  /^0\./,
  /\.local$/i,
  /\.internal$/i,
];

async function fetchHtml(rawUrl: string): Promise<{ html: string; finalUrl: string }> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new SeoFetchError('INVALID_URL', '請輸入完整 URL，含 https://');
  }
  if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
    throw new SeoFetchError('INVALID_URL', 'URL 必須是 http 或 https');
  }
  if (BLOCKED_HOST_PATTERNS.some((p) => p.test(url.hostname))) {
    throw new SeoFetchError('BLOCKED_HOST', '不能掃描內網 / 本機 URL');
  }

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'follow',
      signal: ctrl.signal,
      headers: {
        // 模擬一般瀏覽器，提高 success rate
        'User-Agent':
          'Mozilla/5.0 (compatible; adlo-seo-scorer/1.0; +https://adlo.tw/tools/seo-scorer)',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
      },
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new SeoFetchError('TIMEOUT', '目標網頁回應超過 12 秒，請稍後再試');
    }
    throw new SeoFetchError('HTTP_ERROR', `連線失敗：${err instanceof Error ? err.message : '未知錯誤'}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw new SeoFetchError('HTTP_ERROR', `目標網頁回 ${res.status}，可能不存在或被擋`);
  }
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('html')) {
    throw new SeoFetchError('HTTP_ERROR', `這個 URL 不是 HTML 頁面（${contentType.split(';')[0]}）`);
  }

  // 串流讀取，超過上限即中止
  const reader = res.body?.getReader();
  if (!reader) {
    throw new SeoFetchError('HTTP_ERROR', '無法讀取頁面內容');
  }
  const decoder = new TextDecoder('utf-8');
  let html = '';
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > MAX_BYTES) {
      try {
        await reader.cancel();
      } catch {
        // ignore
      }
      throw new SeoFetchError('TOO_LARGE', '頁面超過 2MB，請輸入單篇文章而非整站');
    }
    html += decoder.decode(value, { stream: true });
  }
  html += decoder.decode();

  return { html, finalUrl: res.url };
}

// ─────────────────────────────────────────────────────
// HTML parsing helpers（純 regex）
// ─────────────────────────────────────────────────────
function stripTags(html: string): string {
  // 砍 script / style 內容後再砍所有 tag
  const cleaned = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  return cleaned.replace(/&[a-zA-Z]+;|&#\d+;/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
}

function extractMetaContent(html: string, identifier: { name?: string; property?: string }): string {
  const attr = identifier.name ? 'name' : 'property';
  const val = identifier.name ?? identifier.property ?? '';
  // 兩種 attr 順序都試
  const re1 = new RegExp(
    `<meta\\s+[^>]*${attr}=["']${val}["'][^>]*content=["']([^"']*)["']`,
    'i',
  );
  const re2 = new RegExp(
    `<meta\\s+[^>]*content=["']([^"']*)["'][^>]*${attr}=["']${val}["']`,
    'i',
  );
  const m = html.match(re1) || html.match(re2);
  return m ? m[1].trim() : '';
}

function extractTags(html: string, tag: string): string[] {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const text = stripTags(m[1]).trim();
    if (text) out.push(text);
  }
  return out;
}

interface ImgInfo {
  src: string;
  alt: string | null;
}

function extractImages(html: string): ImgInfo[] {
  const re = /<img\b([^>]+)>/gi;
  const out: ImgInfo[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1];
    const srcMatch = attrs.match(/\bsrc=["']([^"']+)["']/i);
    const altMatch = attrs.match(/\balt=["']([^"']*)["']/i);
    out.push({
      src: srcMatch?.[1] ?? '',
      alt: altMatch ? altMatch[1] : null,
    });
  }
  return out;
}

interface LinkInfo {
  href: string;
  isExternal: boolean;
}

function extractLinks(html: string, baseUrl: string): LinkInfo[] {
  const baseHost = (() => {
    try {
      return new URL(baseUrl).hostname;
    } catch {
      return '';
    }
  })();
  const re = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi;
  const out: LinkInfo[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const href = m[1].trim();
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) {
      continue;
    }
    let isExternal = false;
    try {
      const linkUrl = new URL(href, baseUrl);
      isExternal = !!baseHost && linkUrl.hostname !== baseHost;
    } catch {
      isExternal = false;
    }
    out.push({ href, isExternal });
  }
  return out;
}

function hasCanonical(html: string): boolean {
  return /<link\s+[^>]*rel=["']canonical["'][^>]*href=["'][^"']+["']/i.test(html);
}

function hasJsonLd(html: string): boolean {
  return /<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i.test(html);
}

function countWords(text: string): number {
  const cjk = (text.match(/[一-鿿]/g) || []).length;
  const enWords = (text.match(/\b[a-zA-Z]+\b/g) || []).length;
  return cjk + enWords;
}

// ─────────────────────────────────────────────────────
// 評分（10 項）
// ─────────────────────────────────────────────────────
function scoreTitle(title: string): ScorerCheck {
  const len = countWords(title);
  if (!title) {
    return {
      id: 'title',
      label: 'Title 標題',
      status: 'fail',
      score: 0,
      found: '（沒有 <title> 標籤）',
      ideal: '30–60 字，含主關鍵字',
      fix: '加上 <title>，控制 30-60 字，把主關鍵字放前面',
    };
  }
  if (len < 15 || len > 80) {
    return {
      id: 'title',
      label: 'Title 標題',
      status: 'warn',
      score: 5,
      found: `「${title.slice(0, 50)}」（${len} 字）`,
      ideal: '30–60 字',
      fix: len < 15 ? '標題太短，補到 30-60 字' : '標題太長，會被 Google 截斷；縮到 60 字內',
    };
  }
  return {
    id: 'title',
    label: 'Title 標題',
    status: 'pass',
    score: 10,
    found: `「${title.slice(0, 50)}」（${len} 字）`,
    ideal: '30–60 字',
    fix: '標題長度與位置都 OK',
  };
}

function scoreMetaDescription(desc: string): ScorerCheck {
  const len = countWords(desc);
  if (!desc) {
    return {
      id: 'meta-description',
      label: 'Meta description',
      status: 'fail',
      score: 0,
      found: '（沒有 meta description）',
      ideal: '80–160 字，吸引人點擊',
      fix: '加 <meta name="description"> 用一段話描述這篇文章的價值',
    };
  }
  if (len < 50 || len > 200) {
    return {
      id: 'meta-description',
      label: 'Meta description',
      status: 'warn',
      score: 5,
      found: `${len} 字`,
      ideal: '80–160 字',
      fix: len < 50 ? 'description 太短，補到 80-160 字' : 'description 太長，會被截斷',
    };
  }
  return {
    id: 'meta-description',
    label: 'Meta description',
    status: 'pass',
    score: 10,
    found: `${len} 字`,
    ideal: '80–160 字',
    fix: '長度與位置都 OK',
  };
}

function scoreH1(h1s: string[]): ScorerCheck {
  if (h1s.length === 0) {
    return {
      id: 'h1',
      label: 'H1 主標題',
      status: 'fail',
      score: 0,
      found: '（沒有 H1）',
      ideal: '只有 1 個 H1，包含主關鍵字',
      fix: '在文章開頭加一個 <h1>，包含主關鍵字',
    };
  }
  if (h1s.length > 1) {
    return {
      id: 'h1',
      label: 'H1 主標題',
      status: 'warn',
      score: 4,
      found: `${h1s.length} 個 H1`,
      ideal: '只有 1 個',
      fix: 'H1 應該唯一；多餘的改成 <h2> 或 <h3>',
    };
  }
  return {
    id: 'h1',
    label: 'H1 主標題',
    status: 'pass',
    score: 10,
    found: `「${h1s[0].slice(0, 50)}」`,
    ideal: '只有 1 個 H1',
    fix: 'H1 結構 OK',
  };
}

function scoreHeadings(h2s: string[], h3s: string[]): ScorerCheck {
  if (h2s.length < 2) {
    return {
      id: 'headings',
      label: '副標題結構',
      status: 'fail',
      score: 3,
      found: `H2: ${h2s.length} 個 / H3: ${h3s.length} 個`,
      ideal: '至少 2 個 H2，建立內容階層',
      fix: '把長文章用 2-5 個 H2 切段，Google 跟讀者都能跟著走',
    };
  }
  if (h2s.length >= 2 && h3s.length === 0) {
    return {
      id: 'headings',
      label: '副標題結構',
      status: 'warn',
      score: 7,
      found: `H2: ${h2s.length} 個，沒有 H3`,
      ideal: '搭配 H3 建立子段落',
      fix: '在 H2 下加 H3 子段落，讓長文更好讀',
    };
  }
  return {
    id: 'headings',
    label: '副標題結構',
    status: 'pass',
    score: 10,
    found: `H2: ${h2s.length} 個 / H3: ${h3s.length} 個`,
    ideal: '≥ 2 H2，搭配 H3',
    fix: '結構 OK',
  };
}

function scoreWordCount(wc: number): ScorerCheck {
  if (wc < 300) {
    return {
      id: 'word-count',
      label: '文章字數',
      status: 'fail',
      score: 1,
      found: `${wc} 字`,
      ideal: '≥ 800 字',
      fix: '太短，Google 認為內容單薄。補到 800+ 字，含具體例子',
    };
  }
  if (wc < 800) {
    return {
      id: 'word-count',
      label: '文章字數',
      status: 'warn',
      score: 6,
      found: `${wc} 字`,
      ideal: '≥ 800 字',
      fix: '再加 200-500 字，增加深度（例子、數據、解析）',
    };
  }
  if (wc < 1500) {
    return {
      id: 'word-count',
      label: '文章字數',
      status: 'pass',
      score: 9,
      found: `${wc} 字`,
      ideal: '長文 1500+ 更佳',
      fix: '已達標。長文（1500+）排名通常更穩',
    };
  }
  return {
    id: 'word-count',
    label: '文章字數',
    status: 'pass',
    score: 10,
    found: `${wc} 字`,
    ideal: '≥ 800 字',
    fix: '字數 OK，主題若夠深可繼續加',
  };
}

function scoreImageAlt(imgs: ImgInfo[]): ScorerCheck {
  if (imgs.length === 0) {
    return {
      id: 'img-alt',
      label: '圖片 alt 屬性',
      status: 'warn',
      score: 5,
      found: '頁面沒有 <img>',
      ideal: '長文應有 1-3 張圖，每張帶 alt',
      fix: '加 1-3 張相關圖片，圖片標 alt（描述內容，不是 keyword stuffing）',
    };
  }
  const missing = imgs.filter((i) => !i.alt || i.alt.trim() === '').length;
  if (missing > 0) {
    return {
      id: 'img-alt',
      label: '圖片 alt 屬性',
      status: 'fail',
      score: Math.max(0, 10 - missing * 2),
      found: `${imgs.length} 張圖，${missing} 張沒 alt`,
      ideal: '每張圖都帶 alt',
      fix: `補上缺失的 ${missing} 張圖的 alt 屬性（描述圖片內容）`,
    };
  }
  return {
    id: 'img-alt',
    label: '圖片 alt 屬性',
    status: 'pass',
    score: 10,
    found: `${imgs.length} 張圖全部帶 alt`,
    ideal: '每張圖都帶 alt',
    fix: '圖片可讀性 OK',
  };
}

function scoreInternalLinks(links: LinkInfo[]): ScorerCheck {
  const internal = links.filter((l) => !l.isExternal).length;
  if (internal < 2) {
    return {
      id: 'internal-links',
      label: '內部連結',
      status: 'fail',
      score: 2,
      found: `${internal} 個內部連結`,
      ideal: '≥ 2 個，連到你自家其他文章',
      fix: '在這篇加 2-3 個連結指向你自家相關文章（強化 site authority）',
    };
  }
  if (internal < 4) {
    return {
      id: 'internal-links',
      label: '內部連結',
      status: 'pass',
      score: 8,
      found: `${internal} 個內部連結`,
      ideal: '≥ 2',
      fix: '已達標。長文可拉到 4-6 個更好',
    };
  }
  return {
    id: 'internal-links',
    label: '內部連結',
    status: 'pass',
    score: 10,
    found: `${internal} 個內部連結`,
    ideal: '≥ 2',
    fix: '內部連結密度 OK',
  };
}

function scoreExternalLinks(links: LinkInfo[]): ScorerCheck {
  const external = links.filter((l) => l.isExternal).length;
  if (external < 1) {
    return {
      id: 'external-links',
      label: '外部連結',
      status: 'warn',
      score: 5,
      found: `${external} 個外部連結`,
      ideal: '≥ 1 個，指向權威來源',
      fix: '引用 1-2 個權威來源（Google 官方、Wikipedia、industry research）會強化可信度',
    };
  }
  return {
    id: 'external-links',
    label: '外部連結',
    status: 'pass',
    score: 10,
    found: `${external} 個外部連結`,
    ideal: '≥ 1',
    fix: '外部引用 OK',
  };
}

function scoreCanonical(has: boolean): ScorerCheck {
  return has
    ? {
        id: 'canonical',
        label: 'Canonical URL',
        status: 'pass',
        score: 10,
        found: '已設定',
        ideal: '<link rel="canonical">',
        fix: 'OK',
      }
    : {
        id: 'canonical',
        label: 'Canonical URL',
        status: 'fail',
        score: 0,
        found: '（沒設定）',
        ideal: '<link rel="canonical" href="...">',
        fix: '加 canonical link 避免 Google 把不同 URL 當重複內容',
      };
}

function scoreJsonLd(has: boolean): ScorerCheck {
  return has
    ? {
        id: 'json-ld',
        label: 'Schema markup',
        status: 'pass',
        score: 10,
        found: '有 JSON-LD',
        ideal: 'Article / FAQPage / Product 等',
        fix: 'OK，結構化資料就位',
      }
    : {
        id: 'json-ld',
        label: 'Schema markup',
        status: 'warn',
        score: 5,
        found: '（沒有 JSON-LD）',
        ideal: 'Article / FAQPage / Product',
        fix: '加 Article schema（或 FAQPage 如果有 FAQ）讓 Google 更懂內容類型',
      };
}

// ─────────────────────────────────────────────────────
// 主流程
// ─────────────────────────────────────────────────────
export async function scoreUrl(url: string): Promise<SeoScoreReport> {
  const { html, finalUrl } = await fetchHtml(url);

  const title = extractTitle(html);
  const metaDesc = extractMetaContent(html, { name: 'description' });
  const h1s = extractTags(html, 'h1');
  const h2s = extractTags(html, 'h2');
  const h3s = extractTags(html, 'h3');
  const images = extractImages(html);
  const links = extractLinks(html, finalUrl);
  const textWordCount = countWords(stripTags(html));

  const checks: ScorerCheck[] = [
    scoreTitle(title),
    scoreMetaDescription(metaDesc),
    scoreH1(h1s),
    scoreHeadings(h2s, h3s),
    scoreWordCount(textWordCount),
    scoreImageAlt(images),
    scoreInternalLinks(links),
    scoreExternalLinks(links),
    scoreCanonical(hasCanonical(html)),
    scoreJsonLd(hasJsonLd(html)),
  ];

  const overall = checks.reduce((sum, c) => sum + c.score, 0); // 0-100

  const grade: SeoScoreReport['grade'] =
    overall >= 85 ? 'A' : overall >= 70 ? 'B' : overall >= 55 ? 'C' : overall >= 40 ? 'D' : 'F';

  // 找改善後分數增益最大的 3 項（fail > warn，越低分越優先）
  const topFixes = checks
    .filter((c) => c.status !== 'pass')
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  const insight =
    overall >= 85
      ? '你的 SEO 結構非常扎實，繼續穩定產出內容即可。'
      : overall >= 70
        ? '基本盤穩，補上下方 1-2 項就能進入 A 級。'
        : overall >= 55
          ? '結構有底，但有明顯缺口。先處理下方 3 個最該改的項目。'
          : overall >= 40
            ? '多個基本功沒補。用 1 個下午把下方 3 項補完，分數能跳 20 分。'
            : '基礎缺很大。先別寫新文章，把這篇的基本功補起來。';

  return {
    url: finalUrl,
    fetchedAt: new Date().toISOString(),
    overallScore: overall,
    grade,
    checks,
    topFixes,
    insight,
  };
}
