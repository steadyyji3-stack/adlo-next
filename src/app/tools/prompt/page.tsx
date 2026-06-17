import type { Metadata } from 'next';
import PromptGeneratorFlow from '@/components/prompt-generator/PromptGeneratorFlow';
import PromptGeneratorFAQ from '@/components/prompt-generator/PromptGeneratorFAQ';

export const metadata: Metadata = {
  title: '免費 AI 提示詞產生器｜一句話需求 → ChatGPT / Claude 指令',
  description:
    '不用學 prompt 技巧。用一句口語講你想用 AI 做什麼，自動產出結構化、可直接貼到 ChatGPT / Claude 的提示詞，還附拆解教學。台灣中小店家專用。',
  alternates: { canonical: 'https://adlo.tw/tools/prompt' },
  openGraph: {
    title: '免費 AI 提示詞產生器 | adlo',
    description:
      '一句話需求 → AI 一次就聽懂的提示詞，附拆解教學。可直接貼 ChatGPT / Claude。',
    url: 'https://adlo.tw/tools/prompt',
    siteName: 'adlo',
    locale: 'zh_TW',
    type: 'website',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '這個跟直接問 ChatGPT 有什麼不一樣？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '差在你不用會寫 prompt。工具幫你把需求補成「角色 + 背景 + 任務 + 限制 + 輸出格式」五段結構，AI 一次就抓對方向，省下來回修改的時間。',
      },
    },
    {
      '@type': 'Question',
      name: '產出的提示詞可以直接用嗎？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '可以。建議版直接複製貼到 ChatGPT、Claude 或 Gemini 都能用，再把店名、數字、日期換成你的實際資料效果更好。',
      },
    },
    {
      '@type': 'Question',
      name: '免費嗎？要登入嗎？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '完全免費，不需要登入或留 email。每個 IP 每日有基本使用次數，不抓個資、不存輸入內容。',
      },
    },
  ],
};

export default function PromptGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PromptGeneratorFlow />
      <PromptGeneratorFAQ />
    </>
  );
}
