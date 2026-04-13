import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '隱私政策 | adlo 數位行銷',
  description: 'adlo 數位行銷隱私政策，說明我們如何收集、使用和保護您的個人資料。',
}

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">隱私政策</h1>
      <p className="text-slate-500 mb-10">最後更新：2026 年 4 月 13 日</p>

      <div className="prose prose-slate max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">1. 資料收集</h2>
          <p className="text-slate-600 leading-relaxed">
            adlo 數位行銷（以下簡稱「本公司」）在提供服務過程中，可能收集您的姓名、電子郵件地址、聯絡電話等基本資料，以及您主動提供的業務相關資訊。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">2. 資料用途</h2>
          <p className="text-slate-600 leading-relaxed">
            收集的資料僅用於：提供您所申請的行銷服務、發送服務相關通知、改善我們的服務品質。本公司不會將您的個人資料出售或出租予第三方。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">3. 社群媒體整合</h2>
          <p className="text-slate-600 leading-relaxed">
            本公司使用 Meta 平台（包含 Facebook、Instagram、Threads）提供社群行銷服務。在您授權的情況下，我們可能代您管理社群媒體帳戶並發布內容。所有授權均遵守 Meta 平台政策。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">4. 資料保護</h2>
          <p className="text-slate-600 leading-relaxed">
            本公司採取適當的技術與組織措施，保護您的個人資料免於未經授權的存取、使用或洩露。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">5. 用戶資料刪除</h2>
          <p className="text-slate-600 leading-relaxed">
            您可隨時要求刪除您的個人資料。請發送電子郵件至{' '}
            <a href="mailto:adlo.hello.tw@gmail.com" className="text-[#1D9E75] hover:underline">
              adlo.hello.tw@gmail.com
            </a>
            ，本公司將於 30 個工作天內處理您的請求。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">6. 聯絡我們</h2>
          <p className="text-slate-600 leading-relaxed">
            如有任何隱私相關問題，請聯絡：
            <br />
            電子郵件：<a href="mailto:adlo.hello.tw@gmail.com" className="text-[#1D9E75] hover:underline">adlo.hello.tw@gmail.com</a>
          </p>
        </section>

      </div>
    </main>
  )
}
