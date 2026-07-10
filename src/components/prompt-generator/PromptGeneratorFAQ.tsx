const faqs = [
  {
    q: '這個跟直接問 ChatGPT 有什麼不一樣？',
    a: '差在「你不用會寫 prompt」。多數人對 AI 講需求太簡短，AI 只能猜，回出來的東西很普通。這個工具幫你把需求補成「角色 + 背景 + 任務 + 限制 + 輸出格式」五段結構，AI 一次就抓對方向，省下你來回「再改一下」的時間。',
  },
  {
    q: '產出的提示詞可以直接用嗎？',
    a: '可以。建議版那段直接複製，貼到 ChatGPT、Claude 或 Gemini 都能用。如果你有特定數字、店名、日期，貼上後再把對應位置換成你的實際資料，效果會更好。',
  },
  {
    q: '為什麼還附「拆解」？',
    a: '因為下次你想自己寫提示詞時，看得懂結構就學得起來。我們把每段在做什麼標出來（角色、背景、任務、限制、輸出格式），用個兩三次你就抓到訣竅，不一定每次都要回來用工具。',
  },
  {
    q: '免費嗎？要登入嗎？',
    a: '完全免費，不需要登入或留 email。每個 IP 每日有基本使用次數，留 email 可解鎖更多次數。不抓個資、不存你輸入的內容。',
  },
  {
    q: '什麼情境最適合用？',
    a: '寫行銷文案、社群貼文、客服罐頭回覆、Email 通知、SEO 內容、翻譯潤稿、整理一堆雜亂資料——這些「你知道要什麼、但懶得組織講法」的場景最適合。先用工具把指令架好，再交給 AI 跑。',
  },
];

export default function PromptGeneratorFAQ() {
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
