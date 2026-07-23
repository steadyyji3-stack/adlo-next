import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: '隱私權政策 | adlo' },
  description:
    'adlo 隱私權政策：完整說明我們蒐集哪些個人資料、如何使用與保護、使用哪些第三方服務（Google Analytics、Stripe、AI 生成服務等），以及您依個人資料保護法享有的權利。',
}

const sections = [
  { id: 'scope', title: '1. 適用範圍' },
  { id: 'collection', title: '2. 我們蒐集哪些資料' },
  { id: 'purpose', title: '3. 蒐集目的與法律依據' },
  { id: 'usage', title: '4. 資料利用之期間、地區、對象與方式' },
  { id: 'third-party', title: '5. 第三方服務清單' },
  { id: 'ai', title: '6. AI 生成功能的資料處理' },
  { id: 'cookies', title: '7. Cookie 與追蹤技術' },
  { id: 'security', title: '8. 資料保護措施' },
  { id: 'rights', title: '9. 您的權利（個資法第 3 條）' },
  { id: 'minors', title: '10. 未成年人保護' },
  { id: 'revision', title: '11. 政策修訂' },
  { id: 'contact', title: '12. 聯絡我們' },
]

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">隱私權政策</h1>
      <p className="text-slate-500 mb-2">最後更新：2026 年 7 月 23 日</p>
      <p className="text-slate-500 mb-10 text-sm">
        本政策依中華民國《個人資料保護法》（下稱「個資法」）訂定。
      </p>

      {/* 目錄 */}
      <nav className="mb-12 rounded-lg border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-semibold text-slate-700 mb-3">目錄</p>
        <ul className="grid sm:grid-cols-2 gap-y-1.5 text-sm">
          {sections.map(s => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-slate-600 hover:text-[#1D9E75] transition-colors">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="prose prose-slate max-w-none space-y-10">
        <section id="scope">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">1. 適用範圍</h2>
          <p className="text-slate-600 leading-relaxed">
            adlo 數位行銷（以下簡稱「本公司」或「adlo」）尊重並保護您的個人資料。本政策適用於您使用
            adlo.tw 網站及其提供之所有服務時（包含免費工具、深度診斷、月訂閱服務與客戶專區），本公司對您個人資料之蒐集、處理與利用。
            本政策不適用於本網站連結之第三方網站，該等網站之隱私保護依其各自政策辦理。
          </p>
        </section>

        <section id="collection">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">2. 我們蒐集哪些資料</h2>
          <p className="text-slate-600 leading-relaxed mb-3">依您使用的功能不同，本公司可能蒐集：</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-slate-700 bg-slate-50">
                <tr>
                  <th className="px-4 py-2 font-semibold">使用情境</th>
                  <th className="px-4 py-2 font-semibold">蒐集項目</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-2 align-top">諮詢／深度診斷表單</td>
                  <td className="px-4 py-2">姓名、電話、LINE ID、網站網址、行業別、服務需求與經營挑戰描述</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 align-top">電子報訂閱／等候名單</td>
                  <td className="px-4 py-2">電子郵件地址</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 align-top">客戶帳號（客戶專區）</td>
                  <td className="px-4 py-2">電子郵件地址、登入紀錄、訂閱方案狀態</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 align-top">付費訂閱</td>
                  <td className="px-4 py-2">
                    交易紀錄與訂閱狀態。<strong>信用卡號由金流服務商 Stripe 直接處理，本公司不經手、不儲存任何卡號資訊</strong>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 align-top">免費工具</td>
                  <td className="px-4 py-2">您主動輸入的店家名稱、地址、Google 地圖連結、評論內容、文案素材等</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 align-top">社群帳號連結（如 Threads）</td>
                  <td className="px-4 py-2">您授權範圍內的帳號基本資料與發布權限（OAuth 授權，可隨時撤銷）</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 align-top">自動蒐集</td>
                  <td className="px-4 py-2">IP 位址、瀏覽器類型、瀏覽頁面與停留時間（詳見第 7 條 Cookie）</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="purpose">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">3. 蒐集目的與法律依據</h2>
          <p className="text-slate-600 leading-relaxed mb-3">
            本公司基於下列特定目的蒐集您的個人資料（參照個資法特定目的項目）：
          </p>
          <ul className="list-disc pl-6 text-slate-600 space-y-1.5 leading-relaxed">
            <li>行銷（○四○）：提供您所諮詢或訂閱之行銷服務</li>
            <li>消費者、客戶管理與服務（○九○）：客戶帳號管理、服務通知、客服回覆</li>
            <li>契約、類似契約或其他法律關係事務（○六九）：訂閱契約之履行與帳務處理</li>
            <li>調查、統計與研究分析（一五七）：以去識別化方式改善服務品質</li>
          </ul>
        </section>

        <section id="usage">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">4. 資料利用之期間、地區、對象與方式</h2>
          <ul className="list-disc pl-6 text-slate-600 space-y-1.5 leading-relaxed">
            <li><strong>期間：</strong>自蒐集時起至蒐集目的消失、您要求刪除，或法令要求之保存期限屆滿為止。諮詢表單資料最長保存 2 年；帳務資料依稅法規定保存 5 年。</li>
            <li><strong>地區：</strong>本公司營運所在地及第 5 條所列第三方服務商之伺服器所在地（可能位於中華民國境外，如美國）。</li>
            <li><strong>對象：</strong>本公司及為完成服務所必要之第三方服務商（見第 5 條）。<strong>本公司不會出售、出租或交換您的個人資料予任何第三方作行銷用途。</strong></li>
            <li><strong>方式：</strong>以自動化機器或其他非自動化方式，於前述目的範圍內處理及利用。</li>
          </ul>
        </section>

        <section id="third-party">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">5. 第三方服務清單</h2>
          <p className="text-slate-600 leading-relaxed mb-3">
            本網站使用下列第三方服務，各服務對資料之處理依其隱私權政策辦理：
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-slate-700 bg-slate-50">
                <tr>
                  <th className="px-4 py-2 font-semibold">服務</th>
                  <th className="px-4 py-2 font-semibold">用途</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr><td className="px-4 py-2">Vercel</td><td className="px-4 py-2">網站主機代管</td></tr>
                <tr><td className="px-4 py-2">Cloudflare</td><td className="px-4 py-2">DNS 與網路安全防護</td></tr>
                <tr><td className="px-4 py-2">Google Analytics 4 / Google Tag Manager</td><td className="px-4 py-2">流量分析（見第 7 條）</td></tr>
                <tr><td className="px-4 py-2">Stripe</td><td className="px-4 py-2">金流處理（PCI-DSS 認證）</td></tr>
                <tr><td className="px-4 py-2">Google Places API</td><td className="px-4 py-2">商家公開資料查詢（免費工具）</td></tr>
                <tr><td className="px-4 py-2">Groq（AI 推論服務）</td><td className="px-4 py-2">AI 文案生成（見第 6 條）</td></tr>
                <tr><td className="px-4 py-2">Resend / MailerLite</td><td className="px-4 py-2">交易通知信與電子報發送</td></tr>
                <tr><td className="px-4 py-2">Supabase</td><td className="px-4 py-2">客戶資料庫（帳號與訂閱狀態）</td></tr>
                <tr><td className="px-4 py-2">Upstash</td><td className="px-4 py-2">流量頻率限制（處理 IP 位址）</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="ai">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">6. AI 生成功能的資料處理</h2>
          <p className="text-slate-600 leading-relaxed">
            本網站部分免費工具（如貼文產生器、評論回覆產生器、命名工具）使用第三方 AI
            推論服務即時生成內容。您輸入的內容僅用於當次生成，本公司不會將其用於訓練 AI
            模型。請避免在工具中輸入身分證字號、信用卡號或其他敏感性個人資料；您輸入的內容視為您同意於當次生成目的內傳輸予
            AI 服務商處理。
          </p>
        </section>

        <section id="cookies">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Cookie 與追蹤技術</h2>
          <p className="text-slate-600 leading-relaxed mb-3">本網站使用下列類型之 Cookie：</p>
          <ul className="list-disc pl-6 text-slate-600 space-y-1.5 leading-relaxed">
            <li><strong>必要性 Cookie：</strong>維持登入狀態與網站基本運作，無法停用。</li>
            <li><strong>分析性 Cookie：</strong>Google Analytics 4（經 Google Tag Manager 佈署）用於統計瀏覽行為，協助我們了解哪些內容對訪客有幫助。資料以匿名化方式處理。</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-3">
            您可透過瀏覽器設定拒絕或刪除 Cookie，亦可安裝{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-[#1D9E75] hover:underline">
              Google Analytics 不透露資訊瀏覽器外掛程式
            </a>
            停用分析追蹤。停用 Cookie 可能影響部分功能（如客戶專區登入）。
          </p>
        </section>

        <section id="security">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">8. 資料保護措施</h2>
          <ul className="list-disc pl-6 text-slate-600 space-y-1.5 leading-relaxed">
            <li>全站以 TLS（HTTPS）加密傳輸</li>
            <li>客戶專區採無密碼驗證（Magic Link），降低密碼外洩風險</li>
            <li>資料庫存取採最小權限原則，僅授權必要人員於必要範圍內接觸</li>
            <li>信用卡資訊完全由 Stripe 處理，本公司系統不留存</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-3">
            如發生個人資料外洩事故，本公司將依個資法第 12 條規定，查明後以適當方式通知受影響之當事人。
          </p>
        </section>

        <section id="rights">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">9. 您的權利（個資法第 3 條）</h2>
          <p className="text-slate-600 leading-relaxed mb-3">就本公司保有之您的個人資料，您得行使下列權利：</p>
          <ul className="list-disc pl-6 text-slate-600 space-y-1.5 leading-relaxed">
            <li>查詢或請求閱覽</li>
            <li>請求製給複製本</li>
            <li>請求補充或更正</li>
            <li>請求停止蒐集、處理或利用</li>
            <li>請求刪除</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-3">
            行使上述權利請來信{' '}
            <a href="mailto:hello@adlo.tw" className="text-[#1D9E75] hover:underline">hello@adlo.tw</a>
            ，本公司將於 15 個工作天內回覆並處理。若您請求刪除或停止利用之資料為履行契約（如進行中之訂閱服務）所必要，本公司將向您說明影響後依您的確認辦理。
          </p>
        </section>

        <section id="minors">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">10. 未成年人保護</h2>
          <p className="text-slate-600 leading-relaxed">
            本網站服務對象為商家經營者。未滿 18 歲者請勿提供個人資料；若本公司知悉在未經法定代理人同意下蒐集了未成年人之個人資料，將儘速刪除。
          </p>
        </section>

        <section id="revision">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">11. 政策修訂</h2>
          <p className="text-slate-600 leading-relaxed">
            本公司得因法令變更或服務調整修訂本政策，修訂後將於本頁面公告並更新「最後更新」日期；重大變更將另以電子郵件通知已註冊之客戶。修訂公告後您繼續使用本服務，視為同意修訂後之內容。
          </p>
        </section>

        <section id="contact">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">12. 聯絡我們</h2>
          <p className="text-slate-600 leading-relaxed">
            對本政策或個人資料處理有任何疑問，請聯絡：
            <br />
            電子郵件：<a href="mailto:hello@adlo.tw" className="text-[#1D9E75] hover:underline">hello@adlo.tw</a>
          </p>
        </section>
      </div>
    </main>
  )
}
