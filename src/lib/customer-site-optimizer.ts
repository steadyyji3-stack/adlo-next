import 'server-only';

import { lookup } from 'node:dns/promises';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { isIP } from 'node:net';
import * as cheerio from 'cheerio';
import type { CustomerDetail } from '@/lib/customers';
import type { StoreProfile } from '@/lib/store-profile';

const MAX_PAGES = 8;
const MAX_REDIRECTS = 3;
const MAX_HTML_BYTES = 1_500_000;
const MAX_SITEMAP_BYTES = 600_000;
const REQUEST_TIMEOUT_MS = 10_000;

export type SiteIndustryMode = 'restaurant' | 'clinic' | 'retail' | 'local_business';
export type SiteCheckStatus = 'pass' | 'warn' | 'fail';

export interface SiteAuditCheck {
  id: string;
  label: string;
  status: SiteCheckStatus;
  found: string;
  fix: string;
  weight: number;
}

export interface SitePageAudit {
  url: string;
  path: string;
  title: string;
  score: number;
  checks: SiteAuditCheck[];
}

export interface SitePriorityFix {
  id: string;
  title: string;
  impact: 'high' | 'medium';
  affectedPages: string[];
  action: string;
}

export interface SitePageBlueprint {
  page: string;
  title: string;
  metaDescription: string;
  h1: string;
  sections: string[];
}

export interface SiteOptimizationPack {
  schemaMarkup: string;
  missingBusinessFields: string[];
  pageBlueprints: SitePageBlueprint[];
  faqDrafts: Array<{ question: string; answer: string }>;
  implementationChecklist: string[];
  requiresHumanReview: boolean;
  complianceNote: string | null;
}

export interface SiteOptimizationReport {
  targetUrl: string;
  hostname: string;
  scannedAt: string;
  coverage: 'sitemap' | 'homepage_only';
  industryMode: SiteIndustryMode;
  overallScore: number;
  pages: SitePageAudit[];
  priorityFixes: SitePriorityFix[];
  optimizationPack: SiteOptimizationPack;
  limitations: string[];
}

export class SiteOptimizerError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = 'SiteOptimizerError';
  }
}

interface OptimizeSiteInput {
  targetUrl: string;
  customer: CustomerDetail;
  profile: StoreProfile;
}

interface FetchedDocument {
  body: string;
  finalUrl: URL;
  contentType: string;
}

interface RawHttpResponse {
  status: number;
  location: string | null;
  contentType: string;
  declaredLength: number;
  body: string;
}

interface FetchOptions {
  allowedHostname: string;
  maxBytes: number;
  acceptedContentTypes: string[];
}

const industrySignals: Record<SiteIndustryMode, string[]> = {
  restaurant: ['菜單', '餐點', '訂位', '營業時間', '外帶', 'menu', 'reservation'],
  clinic: ['診療', '醫師', '掛號', '門診', '預約', '治療', 'appointment'],
  retail: ['商品', '門市', '庫存', '選購', '到店', '詢價', 'product'],
  local_business: ['服務', '營業時間', '交通', '聯絡', '預約', 'service'],
};

export function classifySiteIndustry(industry: string | null | undefined): SiteIndustryMode {
  const value = industry?.toLowerCase() ?? '';
  if (/(餐|食|咖啡|飲料|烘焙|小吃|restaurant|cafe)/i.test(value)) return 'restaurant';
  if (/(診所|醫療|醫美|牙科|中醫|復健|clinic|medical|dental)/i.test(value)) return 'clinic';
  if (/(零售|門市|商店|選物|服飾|百貨|retail|shop|store)/i.test(value)) return 'retail';
  return 'local_business';
}

export function isRelatedHostname(left: string, right: string) {
  const normalize = (value: string) => value.toLowerCase().replace(/^www\./, '');
  return normalize(left) === normalize(right);
}

export async function optimizeCustomerSite(input: OptimizeSiteInput): Promise<SiteOptimizationReport> {
  const requestedUrl = normalizeHttpUrl(input.targetUrl);
  const homepage = await fetchText(requestedUrl, {
    allowedHostname: requestedUrl.hostname,
    maxBytes: MAX_HTML_BYTES,
    acceptedContentTypes: ['text/html', 'application/xhtml+xml'],
  });
  const siteRoot = new URL('/', homepage.finalUrl.origin);
  const pageUrls = await discoverPageUrls(siteRoot, homepage.finalUrl.hostname);
  const urls = uniqueUrls([homepage.finalUrl, ...pageUrls]).slice(0, MAX_PAGES);

  const results = await Promise.allSettled(
    urls.map(async (url, index) => {
      if (index === 0 && stripUrl(url) === stripUrl(homepage.finalUrl)) {
        return auditPage(homepage, input.customer, input.profile);
      }
      const document = await fetchText(url, {
        allowedHostname: homepage.finalUrl.hostname,
        maxBytes: MAX_HTML_BYTES,
        acceptedContentTypes: ['text/html', 'application/xhtml+xml'],
      });
      return auditPage(document, input.customer, input.profile);
    }),
  );

  const pages = results
    .filter((result): result is PromiseFulfilledResult<SitePageAudit> => result.status === 'fulfilled')
    .map((result) => result.value);

  if (pages.length === 0) {
    throw new SiteOptimizerError('SITE_UNREADABLE', '目前無法讀取網站頁面，請確認網站可公開瀏覽', 422);
  }

  const industryMode = classifySiteIndustry(input.profile.industry || input.customer.industry);
  const priorityFixes = buildPriorityFixes(pages, industryMode);
  const optimizationPack = buildOptimizationPack({
    customer: input.customer,
    profile: input.profile,
    industryMode,
    targetUrl: homepage.finalUrl,
    pages,
  });

  return {
    targetUrl: stripUrl(homepage.finalUrl),
    hostname: homepage.finalUrl.hostname,
    scannedAt: new Date().toISOString(),
    coverage: pageUrls.length > 0 ? 'sitemap' : 'homepage_only',
    industryMode,
    overallScore: Math.round(pages.reduce((sum, page) => sum + page.score, 0) / pages.length),
    pages,
    priorityFixes,
    optimizationPack,
    limitations: [
      `本次最多檢查 ${MAX_PAGES} 個 sitemap 代表頁面，不等同完整技術爬蟲。`,
      '報告產生修正建議與可貼上的內容，不會直接修改或發布到客戶網站。',
      '搜尋結果與排名由搜尋引擎決定，完成建議不代表保證排名或 Rich Result。',
    ],
  };
}

function normalizeHttpUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new SiteOptimizerError('INVALID_URL', '請輸入完整的 https:// 網址');
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new SiteOptimizerError('INVALID_URL', '只支援不含帳號密碼的公開 http 或 https 網址');
  }
  url.hash = '';
  return url;
}

async function discoverPageUrls(siteRoot: URL, allowedHostname: string) {
  try {
    const sitemap = await fetchText(new URL('/sitemap.xml', siteRoot), {
      allowedHostname,
      maxBytes: MAX_SITEMAP_BYTES,
      acceptedContentTypes: ['application/xml', 'text/xml', 'application/rss+xml', 'text/plain'],
    });
    return await parseSitemap(sitemap.body, sitemap.finalUrl, allowedHostname, 0);
  } catch {
    return [];
  }
}

async function parseSitemap(xml: string, sourceUrl: URL, allowedHostname: string, depth: number): Promise<URL[]> {
  const $ = cheerio.load(xml, { xmlMode: true });
  const pageUrls = $('url > loc')
    .map((_, element) => $(element).text().trim())
    .get()
    .map((value) => safeSitemapUrl(value, sourceUrl, allowedHostname))
    .filter((url): url is URL => Boolean(url));

  if (pageUrls.length > 0 || depth >= 1) return uniqueUrls(pageUrls).slice(0, MAX_PAGES - 1);

  const childSitemaps = $('sitemap > loc')
    .map((_, element) => $(element).text().trim())
    .get()
    .map((value) => safeSitemapUrl(value, sourceUrl, allowedHostname))
    .filter((url): url is URL => Boolean(url))
    .slice(0, 2);

  const nested = await Promise.allSettled(
    childSitemaps.map(async (url) => {
      const document = await fetchText(url, {
        allowedHostname,
        maxBytes: MAX_SITEMAP_BYTES,
        acceptedContentTypes: ['application/xml', 'text/xml', 'application/rss+xml', 'text/plain'],
      });
      return parseSitemap(document.body, document.finalUrl, allowedHostname, depth + 1);
    }),
  );
  return uniqueUrls(
    nested.flatMap((result) => result.status === 'fulfilled' ? result.value : []),
  ).slice(0, MAX_PAGES - 1);
}

function safeSitemapUrl(value: string, base: URL, allowedHostname: string) {
  try {
    const url = new URL(value, base);
    if (!['http:', 'https:'].includes(url.protocol) || !isRelatedHostname(url.hostname, allowedHostname)) return null;
    url.hash = '';
    url.search = '';
    return url;
  } catch {
    return null;
  }
}

async function fetchText(initialUrl: URL, options: FetchOptions): Promise<FetchedDocument> {
  let currentUrl = normalizeHttpUrl(initialUrl.toString());

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    if (!isRelatedHostname(currentUrl.hostname, options.allowedHostname)) {
      throw new SiteOptimizerError('HOST_MISMATCH', '網站跳轉到未授權的網域', 403);
    }
    const destination = await resolvePublicDestination(currentUrl);
    try {
      const response = await requestPinned(currentUrl, destination, options);

      if (response.status >= 300 && response.status < 400) {
        if (!response.location || redirectCount === MAX_REDIRECTS) {
          throw new SiteOptimizerError('TOO_MANY_REDIRECTS', '網站重新導向次數過多', 422);
        }
        currentUrl = normalizeHttpUrl(new URL(response.location, currentUrl).toString());
        continue;
      }

      if (response.status < 200 || response.status >= 300) {
        throw new SiteOptimizerError('SITE_FETCH_FAILED', `網站回傳 HTTP ${response.status}`, 422);
      }

      if (!options.acceptedContentTypes.some((type) => response.contentType.includes(type))) {
        throw new SiteOptimizerError('UNSUPPORTED_CONTENT', '網站回傳的內容格式不支援', 422);
      }

      if (response.declaredLength > options.maxBytes) {
        throw new SiteOptimizerError('CONTENT_TOO_LARGE', '網站頁面超過掃描大小上限', 422);
      }

      return { body: response.body, finalUrl: currentUrl, contentType: response.contentType };
    } catch (error) {
      if (error instanceof SiteOptimizerError) throw error;
      throw new SiteOptimizerError('SITE_FETCH_FAILED', '目前無法連線到網站', 422);
    }
  }

  throw new SiteOptimizerError('TOO_MANY_REDIRECTS', '網站重新導向次數過多', 422);
}

async function resolvePublicDestination(url: URL) {
  const hostname = url.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local')) {
    throw new SiteOptimizerError('PRIVATE_DESTINATION', '不支援內部網路或本機網址', 403);
  }

  const literalFamily = isIP(hostname);
  const addresses = literalFamily
    ? [{ address: hostname, family: literalFamily }]
    : await lookup(hostname, { all: true, verbatim: true }).catch(() => []);

  if (addresses.length === 0 || addresses.some(({ address }) => !isPublicIp(address))) {
    throw new SiteOptimizerError('PRIVATE_DESTINATION', '網址解析到非公開網路，已停止掃描', 403);
  }
  const destination = addresses[0];
  return { address: destination.address, family: destination.family as 4 | 6 };
}

function requestPinned(
  url: URL,
  destination: { address: string; family: 4 | 6 },
  options: FetchOptions,
): Promise<RawHttpResponse> {
  return new Promise((resolve, reject) => {
    const transport = url.protocol === 'https:' ? httpsRequest : httpRequest;
    const request = transport(url, {
      method: 'GET',
      headers: {
        accept: options.acceptedContentTypes.join(', '),
        'user-agent': 'adlo-site-optimizer/1.0 (+https://adlo.tw)',
      },
      lookup: (_hostname, _lookupOptions, callback) => {
        callback(null, destination.address, destination.family);
      },
    }, (response) => {
      const status = response.statusCode ?? 0;
      const location = typeof response.headers.location === 'string' ? response.headers.location : null;
      const contentType = String(response.headers['content-type'] ?? '').toLowerCase();
      const declaredLength = Number(response.headers['content-length'] ?? 0);

      if (status >= 300 && status < 400) {
        response.resume();
        resolve({ status, location, contentType, declaredLength, body: '' });
        return;
      }
      if (declaredLength > options.maxBytes) {
        response.destroy();
        reject(new SiteOptimizerError('CONTENT_TOO_LARGE', '網站頁面超過掃描大小上限', 422));
        return;
      }

      const chunks: Buffer[] = [];
      let total = 0;
      response.on('data', (chunk: Buffer) => {
        total += chunk.byteLength;
        if (total > options.maxBytes) {
          response.destroy(new SiteOptimizerError('CONTENT_TOO_LARGE', '網站頁面超過掃描大小上限', 422));
          return;
        }
        chunks.push(chunk);
      });
      response.on('end', () => {
        resolve({ status, location, contentType, declaredLength, body: Buffer.concat(chunks, total).toString('utf8') });
      });
      response.on('error', reject);
    });

    request.setTimeout(REQUEST_TIMEOUT_MS, () => {
      request.destroy(new SiteOptimizerError('SITE_TIMEOUT', '網站回應逾時，請稍後再試', 504));
    });
    request.on('error', reject);
    request.end();
  });
}

function isPublicIp(address: string) {
  const family = isIP(address);
  if (family === 4) return isPublicIpv4(address);
  if (family !== 6) return false;

  const normalized = address.toLowerCase();
  if (normalized.includes('.')) {
    const embedded = normalized.slice(normalized.lastIndexOf(':') + 1);
    return !normalized.startsWith('::ffff:') && isPublicIpv4(embedded);
  }
  if (
    normalized === '::' ||
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    /^fe[89ab]/.test(normalized) ||
    normalized.startsWith('ff') ||
    normalized.startsWith('2001:db8') ||
    normalized.startsWith('2001:2:') ||
    normalized.startsWith('2001:10:') ||
    normalized.startsWith('2002:') ||
    normalized.startsWith('::ffff:')
  ) return false;
  return true;
}

function isPublicIpv4(address: string) {
  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const value = (((parts[0] * 256 + parts[1]) * 256 + parts[2]) * 256 + parts[3]) >>> 0;
  const blockedRanges: Array<[number, number]> = [
    [0x00000000, 8], [0x0a000000, 8], [0x64400000, 10], [0x7f000000, 8],
    [0xa9fe0000, 16], [0xac100000, 12], [0xc0000000, 24], [0xc0000200, 24],
    [0xc0a80000, 16], [0xc6120000, 15], [0xc6336400, 24], [0xcb007100, 24],
    [0xe0000000, 4], [0xf0000000, 4],
  ];
  return !blockedRanges.some(([network, prefix]) => {
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    return (value & mask) === (network & mask);
  });
}

function auditPage(document: FetchedDocument, customer: CustomerDetail, profile: StoreProfile): SitePageAudit {
  const $ = cheerio.load(document.body);
  const title = cleanText($('title').first().text());
  const description = cleanText($('meta[name="description"]').first().attr('content') ?? '');
  const h1Count = $('h1').length;
  const canonicalValue = $('link[rel~="canonical"]').first().attr('href') ?? '';
  const robots = ($('meta[name="robots"]').first().attr('content') ?? '').toLowerCase();
  const images = $('img').toArray();
  const imagesWithAlt = images.filter((image) => Boolean($(image).attr('alt')?.trim())).length;
  const internalLinks = $('a[href]').toArray().filter((anchor) => {
    try {
      const url = new URL($(anchor).attr('href') ?? '', document.finalUrl);
      return isRelatedHostname(url.hostname, document.finalUrl.hostname);
    } catch {
      return false;
    }
  }).length;
  const schemaTypes = readSchemaTypes($);
  const pageText = cleanText($('body').text()).toLowerCase();
  const identitySignals = [profile.storeName, customer.store_city, customer.phone].filter(Boolean) as string[];
  const matchedIdentitySignals = identitySignals.filter((signal) => pageText.includes(signal.toLowerCase())).length;

  const checks: SiteAuditCheck[] = [
    lengthCheck('title', 'SEO 標題', title, 12, 65, '為每頁加入清楚且不重複的標題，包含店名、服務與地區。', 16),
    lengthCheck('description', '搜尋摘要', description, 45, 170, '補上符合頁面內容的 meta description，說明服務、地區與下一步。', 13),
    {
      id: 'h1', label: '主標題 H1', status: h1Count === 1 ? 'pass' : h1Count === 0 ? 'fail' : 'warn',
      found: h1Count === 1 ? '1 個 H1' : `${h1Count} 個 H1`, fix: '每頁保留一個清楚描述主題的 H1。', weight: 13,
    },
    {
      id: 'canonical', label: 'Canonical', status: canonicalValue ? 'pass' : 'warn',
      found: canonicalValue ? '已設定' : '未找到', fix: '加入指向正式頁面 URL 的 canonical link。', weight: 8,
    },
    {
      id: 'indexability', label: '可索引狀態', status: robots.includes('noindex') ? 'fail' : 'pass',
      found: robots.includes('noindex') ? '偵測到 noindex' : '未偵測到 noindex', fix: '確認正式頁面不含 noindex；測試頁與隱私頁可例外。', weight: 14,
    },
    {
      id: 'image_alt', label: '圖片替代文字', status: imageAltStatus(images.length, imagesWithAlt),
      found: images.length === 0 ? '本頁沒有圖片' : `${imagesWithAlt}/${images.length} 張有 alt`, fix: '為有資訊價值的圖片補上具體 alt；純裝飾圖片使用空 alt。', weight: 9,
    },
    {
      id: 'internal_links', label: '內部連結', status: internalLinks >= 3 ? 'pass' : internalLinks > 0 ? 'warn' : 'fail',
      found: `${internalLinks} 個站內連結`, fix: '從首頁與服務頁加入菜單、預約、門市或服務詳情等關鍵內部連結。', weight: 9,
    },
    {
      id: 'local_schema', label: '店家結構化資料', status: schemaTypes.some((type) => /LocalBusiness|Restaurant|MedicalClinic|Store/.test(type)) ? 'pass' : 'warn',
      found: schemaTypes.length > 0 ? schemaTypes.join('、') : '未找到 JSON-LD 類型', fix: '加入與真實店家資料一致的 LocalBusiness 子類型 JSON-LD。', weight: 10,
    },
    {
      id: 'business_identity', label: '店家識別資訊', status: matchedIdentitySignals >= Math.min(2, identitySignals.length) ? 'pass' : matchedIdentitySignals > 0 ? 'warn' : 'fail',
      found: `${matchedIdentitySignals}/${identitySignals.length} 項店名、城市或電話訊號`, fix: '在頁首、頁尾或聯絡區一致呈現店名、城市與可驗證的聯絡方式。', weight: 8,
    },
  ];

  return {
    url: stripUrl(document.finalUrl),
    path: document.finalUrl.pathname || '/',
    title: title || '未設定標題',
    score: scoreChecks(checks),
    checks,
  };
}

function lengthCheck(id: string, label: string, value: string, min: number, max: number, fix: string, weight: number): SiteAuditCheck {
  return {
    id,
    label,
    status: !value ? 'fail' : value.length >= min && value.length <= max ? 'pass' : 'warn',
    found: value ? `${value.length} 字` : '未找到',
    fix,
    weight,
  };
}

function imageAltStatus(total: number, withAlt: number): SiteCheckStatus {
  if (total === 0 || withAlt === total) return 'pass';
  return withAlt / total >= 0.75 ? 'warn' : 'fail';
}

function readSchemaTypes($: cheerio.CheerioAPI) {
  const types = new Set<string>();
  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      const parsed: unknown = JSON.parse($(element).text());
      collectSchemaTypes(parsed, types);
    } catch {
      types.add('無效 JSON-LD');
    }
  });
  return Array.from(types).slice(0, 8);
}

function collectSchemaTypes(value: unknown, types: Set<string>) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectSchemaTypes(item, types));
    return;
  }
  if (!value || typeof value !== 'object') return;
  const record = value as Record<string, unknown>;
  const type = record['@type'];
  if (typeof type === 'string') types.add(type);
  if (Array.isArray(type)) type.filter((item): item is string => typeof item === 'string').forEach((item) => types.add(item));
  if (record['@graph']) collectSchemaTypes(record['@graph'], types);
}

function scoreChecks(checks: SiteAuditCheck[]) {
  const earned = checks.reduce((sum, check) => sum + check.weight * (check.status === 'pass' ? 1 : check.status === 'warn' ? 0.5 : 0), 0);
  const possible = checks.reduce((sum, check) => sum + check.weight, 0);
  return Math.round((earned / possible) * 100);
}

function buildPriorityFixes(pages: SitePageAudit[], mode: SiteIndustryMode): SitePriorityFix[] {
  const grouped = new Map<string, { check: SiteAuditCheck; pages: string[]; severity: number }>();
  for (const page of pages) {
    for (const check of page.checks) {
      if (check.status === 'pass') continue;
      const existing = grouped.get(check.id) ?? { check, pages: [], severity: 0 };
      existing.pages.push(page.path);
      existing.severity += check.status === 'fail' ? 2 : 1;
      grouped.set(check.id, existing);
    }
  }

  const titles = pages.map((page) => page.title.toLowerCase()).filter((title) => title !== '未設定標題');
  const duplicateTitles = Array.from(new Set(titles.filter((title, index) => titles.indexOf(title) !== index)));
  const fixes: SitePriorityFix[] = Array.from(grouped.values())
    .sort((left, right) => right.severity - left.severity || right.check.weight - left.check.weight)
    .slice(0, 5)
    .map(({ check, pages: affectedPages }) => ({
      id: check.id,
      title: check.label,
      impact: check.status === 'fail' ? 'high' : 'medium',
      affectedPages: affectedPages.slice(0, MAX_PAGES),
      action: check.fix,
    }));

  if (duplicateTitles.length > 0) {
    fixes.unshift({
      id: 'duplicate_titles', title: '重複頁面標題', impact: 'high',
      affectedPages: pages.filter((page) => duplicateTitles.includes(page.title.toLowerCase())).map((page) => page.path),
      action: '讓每個代表頁面的 title 對應不同搜尋意圖，避免店名之外的內容完全相同。',
    });
  }

  const siteText = pages.map((page) => `${page.path} ${page.title}`).join(' ').toLowerCase();
  const hasIndustryDestination = industrySignals[mode].some((signal) => siteText.includes(signal.toLowerCase()));
  if (!hasIndustryDestination) {
    fixes.unshift({
      id: 'industry_destination', title: industryDestinationLabel(mode), impact: 'high',
      affectedPages: ['/'], action: industryDestinationAction(mode),
    });
  }
  return fixes.slice(0, 6);
}

function buildOptimizationPack(input: {
  customer: CustomerDetail;
  profile: StoreProfile;
  industryMode: SiteIndustryMode;
  targetUrl: URL;
  pages: SitePageAudit[];
}): SiteOptimizationPack {
  const { customer, profile, industryMode, targetUrl } = input;
  const city = customer.store_city?.trim() || '[請補城市]';
  const storeName = profile.storeName || customer.store_name;
  const services = uniqueText([...(profile.selectedTags ?? []), ...(customer.signature_items ?? [])]).slice(0, 4);
  const primaryService = services[0] || industryServiceFallback(industryMode);
  const missingBusinessFields = [
    !customer.store_address && '完整門市地址',
    !customer.store_city && '城市／行政區',
    !customer.phone && '公開電話',
  ].filter((value): value is string => Boolean(value));

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaType(industryMode),
    name: storeName,
    url: targetUrl.origin,
  };
  if (customer.phone) schema.telephone = customer.phone;
  if (customer.store_address || customer.store_city) {
    schema.address = {
      '@type': 'PostalAddress',
      ...(customer.store_address ? { streetAddress: customer.store_address } : {}),
      ...(customer.store_city ? { addressLocality: customer.store_city } : {}),
      addressCountry: 'TW',
    };
  }

  return {
    schemaMarkup: `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`,
    missingBusinessFields,
    pageBlueprints: buildPageBlueprints(industryMode, storeName, city, primaryService, services),
    faqDrafts: buildFaqDrafts(industryMode, storeName, customer.phone),
    implementationChecklist: [
      '先修正高影響項目，再處理警告項目。',
      '每頁 title、description 與 H1 對應同一個搜尋意圖，但文字不要完全重複。',
      '將 JSON-LD 放入正式網站，補齊待補欄位後再用 Google Rich Results Test 驗證。',
      '發布後重新檢查 canonical、noindex 與 sitemap 是否指向正式網址。',
      '以 Search Console 的索引與查詢資料驗證成果，不以單次分數當作排名保證。',
    ],
    requiresHumanReview: industryMode === 'clinic',
    complianceNote: industryMode === 'clinic'
      ? '診所內容發布前必須由院所負責人複核醫療廣告法規、專業資格與事實依據；本工具不產生療效保證、最佳化宣稱或虛構見證。'
      : null,
  };
}

function buildPageBlueprints(mode: SiteIndustryMode, store: string, city: string, primary: string, services: string[]): SitePageBlueprint[] {
  const serviceList = services.length > 0 ? services.join('、') : primary;
  if (mode === 'restaurant') {
    return [
      blueprint('首頁', `${city}${primary}｜${store}`, `${store} 提供 ${serviceList}。查看菜單、營業時間、門市位置與訂位方式。`, `${city}${primary}｜${store}`, ['招牌餐點', '菜單與價格', '營業時間', '交通與訂位']),
      blueprint('菜單頁', `${store} 菜單與價格｜${city}${primary}`, `查看 ${store} 最新菜單、招牌餐點與價格資訊，出發前確認供應狀況。`, `${store} 菜單與招牌餐點`, ['餐點分類', '清楚價格', '過敏原或飲食資訊', '訂位／外帶行動']),
      blueprint('訂位與交通', `${store} 訂位、營業時間與交通方式`, `查詢 ${store} 的營業時間、地址、交通與訂位方式。`, `${store} 訂位與門市資訊`, ['營業時間', '地圖與停車', '電話／線上訂位', '臨時公告']),
    ];
  }
  if (mode === 'clinic') {
    return [
      blueprint('首頁', `${city}${primary}門診資訊｜${store}`, `${store} 提供 ${serviceList} 的門診資訊、醫師資料、掛號方式與交通資訊。`, `${store} 門診與掛號資訊`, ['診療項目', '醫師與資格', '掛號方式', '地址與門診時間']),
      blueprint('診療項目', `${primary}診療項目與就診資訊｜${store}`, `了解 ${store} 的 ${primary} 診療範圍、適用情況與就診前注意事項。實際診療由醫師評估。`, `${primary}診療項目`, ['適用情況', '評估流程', '風險與注意事項', '掛號入口']),
      blueprint('醫師與掛號', `${store} 醫師團隊、門診時間與掛號方式`, `查看 ${store} 醫師專業資格、門診時間、掛號流程與交通資訊。`, `${store} 醫師與掛號資訊`, ['醫師姓名與資格', '門診表', '掛號流程', '地址與聯絡方式']),
    ];
  }
  if (mode === 'retail') {
    return [
      blueprint('首頁', `${city}${primary}門市｜${store}`, `${store} 提供 ${serviceList}。查看商品分類、門市位置、營業時間與詢價方式。`, `${city}${primary}｜${store}`, ['主力商品', '商品分類', '門市資訊', '到店／詢價行動']),
      blueprint('商品分類', `${store} ${primary}商品分類與選購資訊`, `查看 ${store} 的 ${primary} 商品分類、規格與到店選購資訊。`, `${primary}商品分類`, ['分類導覽', '規格與價格範圍', '庫存說明', '詢價入口']),
      blueprint('門市資訊', `${store} 門市地址、營業時間與交通`, `查詢 ${store} 的門市地址、營業時間、交通方式與聯絡資訊。`, `${store} 門市與到店資訊`, ['營業時間', '地圖與交通', '電話／LINE', '到店服務']),
    ];
  }
  return [
    blueprint('首頁', `${city}${primary}｜${store}`, `${store} 提供 ${serviceList}。查看服務內容、營業資訊與聯絡方式。`, `${city}${primary}｜${store}`, ['核心服務', '服務特色', '營業與交通', '聯絡行動']),
    blueprint('服務頁', `${primary}服務內容與流程｜${store}`, `了解 ${store} 的 ${primary} 服務內容、流程、適用對象與聯絡方式。`, `${primary}服務內容`, ['服務內容', '流程', '價格或詢價', '聯絡入口']),
    blueprint('店家資訊', `${store} 地址、營業時間與聯絡方式`, `查詢 ${store} 的地址、營業時間、交通與聯絡資訊。`, `${store} 店家資訊`, ['營業時間', '地址與地圖', '電話／LINE', '常見問題']),
  ];
}

function blueprint(page: string, title: string, metaDescription: string, h1: string, sections: string[]): SitePageBlueprint {
  return { page, title, metaDescription, h1, sections };
}

function buildFaqDrafts(mode: SiteIndustryMode, store: string, phone: string | null) {
  const contact = phone ? `可致電 ${phone}` : '請補上電話或線上聯絡方式';
  if (mode === 'clinic') {
    return [
      { question: `${store} 如何掛號？`, answer: `${contact} 確認門診時間與掛號方式；緊急狀況請使用所在地的緊急醫療資源。` },
      { question: '初次就診需要準備什麼？', answer: '請攜帶身分與相關醫療資料；實際所需文件與注意事項請由院所確認後發布。' },
    ];
  }
  return [
    { question: `${store} 的營業時間是什麼？`, answer: '請填入平日、週末與國定假日的實際營業時間，並與 Google 商家檔案保持一致。' },
    { question: `如何聯絡 ${store}？`, answer: `${contact}，網站上也應提供清楚的地址與行動按鈕。` },
  ];
}

function schemaType(mode: SiteIndustryMode) {
  return { restaurant: 'Restaurant', clinic: 'MedicalClinic', retail: 'Store', local_business: 'LocalBusiness' }[mode];
}

function industryServiceFallback(mode: SiteIndustryMode) {
  return { restaurant: '餐廳', clinic: '診所', retail: '零售門市', local_business: '在地服務' }[mode];
}

function industryDestinationLabel(mode: SiteIndustryMode) {
  return {
    restaurant: '缺少菜單或訂位入口', clinic: '缺少診療或掛號入口',
    retail: '缺少商品或門市入口', local_business: '缺少服務或聯絡入口',
  }[mode];
}

function industryDestinationAction(mode: SiteIndustryMode) {
  return {
    restaurant: '建立可索引的菜單頁，並從首頁連到訂位、地址與營業時間。',
    clinic: '建立診療項目與醫師資格頁，提供清楚掛號方式；所有醫療內容發布前由院所複核。',
    retail: '建立商品分類與門市頁，提供到店、詢價及庫存說明。',
    local_business: '建立核心服務與店家資訊頁，提供清楚聯絡行動。',
  }[mode];
}

function cleanText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function uniqueText(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function uniqueUrls(urls: URL[]) {
  const seen = new Set<string>();
  return urls.filter((url) => {
    const key = stripUrl(url);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function stripUrl(url: URL) {
  const clean = new URL(url);
  clean.username = '';
  clean.password = '';
  clean.hash = '';
  clean.search = '';
  return clean.toString();
}
