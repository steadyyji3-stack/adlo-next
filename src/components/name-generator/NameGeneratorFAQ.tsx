const faqs = [
  {
    q: '產生的店名可以直接使用嗎？',
    a: '可以作為靈感起點，但正式使用前建議到智慧財產局商標資料庫（tmcloud.tipo.gov.tw）確認沒有相同或近似的已註冊商標，並與設計師確認視覺可行性。',
  },
  {
    q: '一次可以產生幾組？',
    a: '每次產生 15 組店名 + 10 組 slogan，全部有命名方式分類和「為什麼好記」的說明。不滿意可以點「重新產生」，調整風格或客群後再試一次。',
  },
  {
    q: '這個工具免費嗎？要登入嗎？',
    a: '完全免費，不需要登入或留 email。每個 IP 每日有基本使用次數，留 email 可解鎖更多次數。',
  },
  {
    q: 'Slogan 和店名有什麼差別，我應該先選哪個？',
    a: 'Slogan 是品牌的副標語，通常 6–15 字，用於招牌、名片、IG 簡介。建議先選定店名，再選搭配的 slogan，讓兩者的語氣和風格一致。這個工具一次產生兩者，方便你組合搭配。',
  },
  {
    q: '為什麼 AI 產的名字感覺不像台灣店名？',
    a: '可以嘗試在「想包含的概念」欄位加入更在地的關鍵字，例如「台南」「鹿港」「眷村」「阿嬤」「柑仔店」，AI 會把這些概念融入命名，讓名字更有在地感。',
  },
];

export default function NameGeneratorFAQ() {
  return (
    <section className="py-14 sm:py-16 bg-slate-50">
      <div className="max-w-2xl mx-auto px-6">
        <h2
          className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-8"
          style={{ fontFamily: 'var(--font-manrope)' }}
        >
          常見問題
        </h2>
        <dl className="space-y-5">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="bg-white border border-slate-200 rounded-xl p-5"
            >
              <dt className="text-sm font-bold text-slate-900 mb-2">{faq.q}</dt>
              <dd className="text-sm text-slate-600 leading-relaxed">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
