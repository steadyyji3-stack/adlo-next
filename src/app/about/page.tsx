import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Globe, CheckCircle2, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: '關於 adlo | 協助本地品牌完成數位轉型',
  description: 'adlo 由 Lorenzo 創立，靈感來自阿德勒療法——我們不是半套行銷服務，而是幫助傳統產業完成完整內容工程規劃的數位夥伴。',
  alternates: { canonical: 'https://adlo.tw/about' },
  openGraph: {
    title: '關於 adlo',
    description: '人 + AI 的行銷團隊，協助台灣本地品牌完成真正的數位轉型。',
    url: 'https://adlo.tw/about',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: '關於 adlo',
  url: 'https://adlo.tw/about',
  description: 'adlo 是一間台灣在地行銷顧問公司，由 Lorenzo 創立，協助本地品牌完成數位轉型與內容工程規劃。',
  mainEntity: {
    '@type': 'Organization',
    '@id': 'https://adlo.tw/#organization',
    name: 'adlo',
    founder: { '@type': 'Person', name: 'Lorenzo' },
    foundingDate: '2024',
    areaServed: { '@type': 'Country', name: '台灣' },
    description: '專注本地品牌數位轉型的行銷顧問公司',
  },
};

const beliefs = [
  {
    title: '不做半套',
    desc: '很多行銷公司只負責「發文」或「下廣告」。我們從內容策略、SEO 架構、廣告投放到 AI 自動化，做完整的內容工程，不丟一半給客戶自己收尾。',
  },
  {
    title: '數字說話',
    desc: '每一個決策都有數據支撐。我們不靠感覺做行銷——關鍵字搜尋量、廣告受眾分析、GA4 流量結構，是我們最常說的語言。',
  },
  {
    title: '科技輔助，人來判斷',
    desc: '我們善用最新的數位工具加速執行，讓團隊把時間放在真正重要的地方：策略判斷、客戶溝通、創意發想——這也是我們服務客戶的方式。',
  },
  {
    title: '在地，才能真正轉型',
    desc: '東南亞的行銷邏輯直接套台灣不會成功。台灣有 LINE 生態、本土平台習慣、在地語感。我們從這裡長出來，才能真的幫你長根。',
  },
];

const team = [
  {
    name: 'Lorenzo',
    role: '創辦人 / 策略總監',
    bio: '8 年數位行銷資歷。看過太多本地企業花了大錢做行銷，卻得不到可量化的成果——所以決定建立一個不一樣的工作方式。',
    tags: ['SEO 策略', '整合行銷', '客戶顧問'],
  },
  {
    name: 'Ada',
    role: '行銷執行長',
    bio: '負責所有內容行銷的全端執行：SEO 文章、社群貼文、GBP 優化、客戶月報。主動規劃、主動產出，確保每個月都有可量化的成效。',
    tags: ['內容策略', 'SEO 執行', '社群行銷'],
  },
  {
    name: 'Rex',
    role: '業務開發長',
    bio: '擁有頂尖獵人嗅覺的業務專家。負責市場研究、潛在客戶分析、開發系統與提案產出——讓 Lorenzo 專注於關係與策略。',
    tags: ['市場研究', '提案策略', '業務開發'],
  },
  {
    name: 'Kael',
    role: '技術工程長',
    bio: '全端工程師。負責系統建置、API 串接、自動化流程與數據基礎建設——讓 adlo 的每一個執行都有技術支撐。',
    tags: ['系統架構', 'API 串接', '自動化工程'],
  },
];

const stats = [
  { value: '8年', label: '數位行銷資歷' },
  { value: '3+', label: '本土品牌轉型案例' },
  { value: '34萬+', label: '累積觸及新用戶' },
  { value: '2025', label: '預計拓展東南亞' },
];

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#E1F5EE] via-white to-slate-50 py-24 px-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            <Badge className="bg-[#E1F5EE] text-[#0F6E56] border-[#1D9E75]/30 text-xs font-bold mb-6">ABOUT ADLO</Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6" style={{ fontFamily: 'var(--font-manrope)' }}>
              傳統產業的<br />
              <span className="text-[#1D9E75]">數位治療師</span>
            </h1>
            <p className="text-slate-600 text-xl leading-relaxed max-w-2xl mb-10">
              adlo 的名字來自<strong className="text-slate-900">阿德勒心理療法</strong>——
              阿德勒相信每個人都有潛力，困境只是還沒找到正確的方向。
              我們相信每個本地品牌也是一樣。
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="cta-gradient text-white shadow-xl hover:opacity-90 h-13 px-8">
                <Link href="/contact">開始合作 <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
              <Link href="/cases"
                className="inline-flex items-center h-13 px-8 rounded-lg border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-all text-sm font-semibold"
                style={{ backgroundColor: 'transparent' }}>
                查看成效案例
              </Link>
            </div>
          </div>
        </section>

        {/* 品牌故事 */}
        <section className="bg-white py-20 px-6 md:px-8">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-center">
            <div>
              <Badge className="bg-[#E1F5EE] text-[#0F6E56] border-[#1D9E75]/30 text-xs font-bold mb-4">OUR STORY</Badge>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-6 leading-snug" style={{ fontFamily: 'var(--font-manrope)' }}>
                我們為什麼存在
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  Lorenzo 在數位行銷領域工作了 8 年，協助過無數品牌。他看到的最大問題不是企業「不想轉型」——而是他們找不到一個<strong className="text-slate-800">真正陪他們走完整段路</strong>的夥伴。
                </p>
                <p>
                  大部分的行銷服務是「半套的」：幫你做廣告，但不管 SEO；幫你發文，但不碰數據分析；幫你架網站，但不規劃內容策略。客戶付了錢，卻還是搞不清楚為什麼沒有效果。
                </p>
                <p>
                  adlo 因此誕生。我們的目標只有一個：<strong className="text-slate-800">讓台灣本地品牌真正完成數位轉型</strong>，不是做一半，而是從策略到執行，一路走到底。
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map(s => (
                <div key={s.label} className="bg-[#E1F5EE] border border-[#1D9E75]/20 rounded-2xl p-6 text-center">
                  <p className="text-4xl font-extrabold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-manrope)' }}>{s.value}</p>
                  <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* adlo 名字的意義 */}
        <section className="bg-slate-50 py-16 px-6 md:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="bg-[#E1F5EE] text-[#0F6E56] border-[#1D9E75]/30 text-xs font-bold mb-4">THE NAME</Badge>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6" style={{ fontFamily: 'var(--font-manrope)' }}>
              為什麼叫 adlo？
            </h2>
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-left space-y-4">
              <p className="text-slate-600 leading-relaxed">
                <strong className="text-slate-900">阿德勒（Alfred Adler）</strong>是奧地利心理學家，他的療法核心是：每個人都有克服困境的能力，只需要找到正確的社會連結與方向。
              </p>
              <p className="text-slate-600 leading-relaxed">
                我們相信這個邏輯同樣適用於本地品牌——傳統產業不是「不行」，而是還沒找到在數位時代的定位與方法。
              </p>
              <p className="text-slate-600 leading-relaxed">
                <strong className="text-slate-900">adlo = 阿德洛</strong>，我們希望成為本地品牌的數位治療師：不是給你藥方就走，而是陪你走過整個療癒過程。
              </p>
            </div>
          </div>
        </section>

        {/* 我們的信念 */}
        <section className="bg-white py-20 px-6 md:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="bg-[#E1F5EE] text-[#0F6E56] border-[#1D9E75]/30 text-xs font-bold mb-4">OUR BELIEFS</Badge>
              <h2 className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: 'var(--font-manrope)' }}>我們怎麼做事</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {beliefs.map((b, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-7 hover:border-[#1D9E75]/40 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-[#E1F5EE] border border-[#1D9E75]/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-[#1D9E75]" />
                    </div>
                    <h3 className="font-extrabold text-slate-900">{b.title}</h3>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 團隊 */}
        <section className="bg-slate-50 py-20 px-6 md:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-4">
              <Badge className="bg-[#E1F5EE] text-[#0F6E56] border-[#1D9E75]/30 text-xs font-bold mb-4">THE TEAM</Badge>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3" style={{ fontFamily: 'var(--font-manrope)' }}>人 + AI 的混合團隊</h2>
              <p className="text-slate-500 text-sm max-w-xl mx-auto">
                小而精的團隊，每個人都有明確的專業分工。
                從策略到執行、從業務到技術，我們讓每一個環節都有專人負責，不漏接。
              </p>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
              {team.map(member => (
                <div key={member.name}
                  className="bg-white border border-slate-200 rounded-2xl p-7 flex flex-col hover:border-[#1D9E75]/40 hover:shadow-md transition-all">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shrink-0 bg-[#E1F5EE] border border-[#1D9E75]/20">
                    <span className="text-2xl font-extrabold text-[#1D9E75]">{member.name[0]}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-extrabold text-slate-900">{member.name}</h3>
                  </div>
                  <p className="text-xs text-[#1D9E75] font-semibold mb-3">{member.role}</p>
                  <p className="text-slate-500 text-sm leading-relaxed flex-1 mb-5">{member.bio}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {member.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 服務地區 */}
        <section className="bg-white py-16 px-6 md:px-8 border-t border-slate-100">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <Badge className="bg-[#E1F5EE] text-[#0F6E56] border-[#1D9E75]/30 text-xs font-bold mb-4">WHERE WE WORK</Badge>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-manrope)' }}>
                深根台灣，<br />預備東南亞
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                我們目前所有客戶來自台灣，且幾乎全部透過網路找到我們——這本身就證明了我們的數位行銷能力。
                2025 年我們計畫將相同的方法論擴展到東南亞市場，從台灣出發，複製可規模化的在地轉型模式。
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#1D9E75]" /> 台灣（現在）</span>
                <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-slate-300" /> 東南亞（2025 計畫）</span>
              </div>
            </div>
            <div className="flex-1 bg-[#E1F5EE] rounded-2xl p-8 border border-[#1D9E75]/20">
              <p className="text-xs font-bold text-[#1D9E75] uppercase tracking-widest mb-4">目前服務城市</p>
              <div className="space-y-3">
                {[
                  { city: '台北', note: '主要服務重心，SEO + 廣告 + AI' },
                  { city: '台中', note: '在地 SEO + Google 商家優化' },
                  { city: '高雄', note: '在地 SEO + 廣告代管' },
                ].map(c => (
                  <div key={c.city} className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-[#1D9E75] shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{c.city}</span>
                      <span className="text-slate-500 text-xs ml-2">{c.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 md:px-8 bg-[#E1F5EE]">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-900" style={{ fontFamily: 'var(--font-manrope)' }}>
              準備好開始轉型了嗎？
            </h2>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              我們的客戶幾乎都是透過網路找到我們的。
              現在你也在這裡——<strong className="text-slate-900">也許這就是你的起點。</strong>
            </p>
            <Button asChild size="lg" className="cta-gradient text-white shadow-xl hover:opacity-90 h-14 px-10 text-base">
              <Link href="/contact">
                免費諮詢，今天開始 <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
