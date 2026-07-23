import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: '服務條款 | adlo' },
  description:
    'adlo 服務條款：使用 adlo.tw 免費工具、深度診斷與月訂閱服務的權利義務，包含付費與退費規則、AI 生成內容聲明、智慧財產權、責任限制與準據法。',
}

const sections = [
  { id: 'acceptance', title: '1. 條款之接受' },
  { id: 'services', title: '2. 服務內容' },
  { id: 'account', title: '3. 帳號註冊與安全' },
  { id: 'payment', title: '4. 付費、續訂與退費' },
  { id: 'tools', title: '5. 免費工具使用規範' },
  { id: 'ai-content', title: '6. AI 生成內容聲明' },
  { id: 'authorization', title: '7. 客戶授權與資產' },
  { id: 'ip', title: '8. 智慧財產權' },
  { id: 'disclaimer', title: '9. 免責聲明與成效說明' },
  { id: 'liability', title: '10. 責任限制' },
  { id: 'termination', title: '11. 服務變更與終止' },
  { id: 'law', title: '12. 準據法與管轄' },
  { id: 'revision', title: '13. 條款修訂' },
]

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">服務條款</h1>
      <p className="text-slate-500 mb-10">最後更新：2026 年 7 月 23 日</p>

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
        <section id="acceptance">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">1. 條款之接受</h2>
          <p className="text-slate-600 leading-relaxed">
            歡迎使用 adlo 數位行銷（以下簡稱「本公司」或「adlo」）於 adlo.tw
            提供之服務。當您瀏覽本網站、使用免費工具、註冊帳號或訂閱付費服務，即表示您已閱讀、理解並同意本服務條款及
            <a href="/privacy" className="text-[#1D9E75] hover:underline">隱私權政策</a>
            之全部內容。若您不同意，請停止使用本服務。
          </p>
        </section>

        <section id="services">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">2. 服務內容</h2>
          <ul className="list-disc pl-6 text-slate-600 space-y-1.5 leading-relaxed">
            <li><strong>免費工具：</strong>商家健檢、地圖能見度檢測、AI 文案生成等線上工具，無需註冊即可使用。</li>
            <li><strong>深度診斷：</strong>依您提交之商家資訊提供的分析報告與建議。</li>
            <li><strong>月訂閱服務：</strong>依您選購之方案，提供 Google 商家檔案經營、在地 SEO 優化、內容產出等持續性服務，實際服務範圍以各方案頁面說明為準。</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-3">
            本公司保留新增、調整或停止部分服務項目之權利；對付費客戶之重大服務調整，將於生效前以電子郵件通知。
          </p>
        </section>

        <section id="account">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">3. 帳號註冊與安全</h2>
          <ul className="list-disc pl-6 text-slate-600 space-y-1.5 leading-relaxed">
            <li>客戶專區以電子郵件驗證連結（Magic Link）登入，請確保您提供之電子郵件為本人所有且可正常收信。</li>
            <li>登入連結具時效性且僅限一次使用，請勿轉寄他人。經由您的電子郵件完成之操作，視為您本人或經您授權之行為。</li>
            <li>如發現帳號遭未經授權使用，請立即通知本公司。</li>
          </ul>
        </section>

        <section id="payment">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">4. 付費、續訂與退費</h2>
          <ul className="list-disc pl-6 text-slate-600 space-y-1.5 leading-relaxed">
            <li><strong>計費方式：</strong>訂閱服務依方案頁面所示價格，以月或年為週期預先收費，透過金流服務商 Stripe 完成扣款。</li>
            <li><strong>自動續訂：</strong>訂閱期滿將自動續訂並扣款。您可隨時於客戶專區或來信取消，取消後服務持續至當期期末，<strong>次期起不再扣款</strong>。</li>
            <li><strong>退費：</strong>已開始履行之當期服務費用，除法令另有規定或本公司另有承諾外，恕不按比例退還。</li>
            <li><strong>價格調整：</strong>方案價格如有調整，將於下一個計費週期生效，並於生效前至少 30 天以電子郵件通知。</li>
            <li><strong>發票：</strong>依中華民國稅法規定開立。</li>
          </ul>
        </section>

        <section id="tools">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">5. 免費工具使用規範</h2>
          <p className="text-slate-600 leading-relaxed mb-3">使用本網站免費工具時，您同意不從事下列行為：</p>
          <ul className="list-disc pl-6 text-slate-600 space-y-1.5 leading-relaxed">
            <li>以程式、爬蟲或其他自動化方式大量呼叫，規避流量頻率限制</li>
            <li>輸入違法、侵權、誹謗或含惡意程式之內容</li>
            <li>利用工具生成內容從事違反法令之行為（包含但不限於製造不實評論）</li>
            <li>轉售工具產出或以本公司名義對第三方提供服務</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-3">
            違反上述規範者，本公司得暫停或終止您對服務之使用，且不負任何補償責任。
          </p>
        </section>

        <section id="ai-content">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">6. AI 生成內容聲明</h2>
          <p className="text-slate-600 leading-relaxed">
            本網站部分功能由 AI 模型即時生成內容。AI 產出僅供參考，可能包含不準確或不合宜之內容，<strong>您應自行審閱、修改並確認合法性後再行使用</strong>。因直接採用
            AI 產出內容所生之任何爭議或損害，由使用者自行承擔。本公司對 AI 產出不主張著作權，您可自由使用於自身商業用途。
          </p>
        </section>

        <section id="authorization">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">7. 客戶授權與資產</h2>
          <ul className="list-disc pl-6 text-slate-600 space-y-1.5 leading-relaxed">
            <li>訂閱服務如需存取您的 Google 商家檔案、社群帳號（如 Threads），將透過官方授權機制（OAuth）取得您明示授權後為之，授權範圍以授權畫面所示為準，您可隨時撤銷。</li>
            <li>您的商家帳號、粉絲專頁、評論與內容資產所有權始終屬於您；服務終止後本公司將停止存取。</li>
            <li>您保證對提供予本公司之素材（圖片、文案、商標等）擁有合法權利；因素材侵權所生之第三方求償，由您負責。</li>
          </ul>
        </section>

        <section id="ip">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">8. 智慧財產權</h2>
          <p className="text-slate-600 leading-relaxed">
            本網站之程式、介面設計、工具邏輯、文章與品牌標識，其智慧財產權均屬本公司或授權人所有。未經書面同意，不得重製、改作、散布或為商業利用。本公司為您產出之交付成果（如貼文、報告），於您付清當期費用後，授權您於自身商業範圍內永久使用。
          </p>
        </section>

        <section id="disclaimer">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">9. 免責聲明與成效說明</h2>
          <ul className="list-disc pl-6 text-slate-600 space-y-1.5 leading-relaxed">
            <li>搜尋排名與地圖曝光受 Google 演算法、市場競爭等本公司無法控制之因素影響，<strong>本公司不保證特定排名、流量或營收成果</strong>；所有成效數據僅代表過往案例，不構成對未來成果之承諾。</li>
            <li>免費工具依「現狀」提供，本公司不擔保其結果之完整性與正確性（商家資料來源為 Google 公開 API，可能存在延遲或誤差）。</li>
            <li>本網站可能因維護、第三方服務中斷或不可抗力暫停，本公司將盡速恢復，但不對暫停期間之損失負賠償責任。</li>
          </ul>
        </section>

        <section id="liability">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">10. 責任限制</h2>
          <p className="text-slate-600 leading-relaxed">
            於法令許可之最大範圍內，本公司就本服務所生之損害賠償責任，以您於請求發生前 3 個月內實際支付予本公司之費用總額為上限；對於免費服務之使用，本公司不負損害賠償責任。但因本公司故意或重大過失所致者，不在此限。
          </p>
        </section>

        <section id="termination">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">11. 服務變更與終止</h2>
          <ul className="list-disc pl-6 text-slate-600 space-y-1.5 leading-relaxed">
            <li>您得隨時取消訂閱（依第 4 條辦理）。</li>
            <li>您違反本條款、濫用服務或有付款糾紛時，本公司得於通知後暫停或終止服務。</li>
            <li>服務終止後，本公司將依隱私權政策處理您的個人資料；您可於終止前要求匯出屬於您的交付成果。</li>
          </ul>
        </section>

        <section id="law">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">12. 準據法與管轄</h2>
          <p className="text-slate-600 leading-relaxed">
            本條款之解釋與適用，以中華民國法律為準據法。因本條款所生之爭議，雙方同意先以誠信協商解決；協商不成時，以臺灣臺北地方法院為第一審管轄法院。但消費者保護法等法令對管轄另有規定者，從其規定。
          </p>
        </section>

        <section id="revision">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">13. 條款修訂</h2>
          <p className="text-slate-600 leading-relaxed">
            本公司得修訂本條款，修訂後於本頁面公告並更新「最後更新」日期；對付費客戶之重大變更，將於生效前以電子郵件通知。公告後您繼續使用本服務，視為同意修訂後之內容。如有疑問，請聯絡{' '}
            <a href="mailto:hello@adlo.tw" className="text-[#1D9E75] hover:underline">hello@adlo.tw</a>。
          </p>
        </section>
      </div>
    </main>
  )
}
