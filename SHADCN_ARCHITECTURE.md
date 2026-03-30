# adlo 前端架構說明 — shadcn/ui + Next.js App Router

## 技術棧

| 層次 | 技術 |
|------|------|
| 框架 | Next.js 14+ App Router |
| UI 元件庫 | shadcn/ui (Radix UI 底層) |
| 樣式 | Tailwind CSS v4 + CSS Variables |
| 型別 | TypeScript (strict) |
| 表單 | react-hook-form + zod |
| 圖示 | lucide-react |
| 字型 | Playfair Display / Manrope / Inter |

---

## 設計 Token（品牌色）

```css
--primary:         #92400e   /* 主色：amber-brown（CTA、accent） */
--primary-light:   #b45309   /* 主色淡版 */
--foreground:      #1e293b   /* 深色文字 */
--muted-foreground:#64748b   /* 輔助文字 */
--border:          #e2e8f0   /* 邊框 */
--background:      #ffffff   /* 頁面背景 */
--muted:           #f1f5f9   /* 淺灰背景區塊 */
```

---

## 目錄結構

```
adlo-next/
├── src/
│   ├── app/                         # Next.js App Router 頁面
│   │   ├── layout.tsx               # 根 Layout（Nav + Footer + 字型）
│   │   ├── globals.css              # Tailwind base + CSS variables
│   │   ├── page.tsx                 # 首頁
│   │   ├── services/page.tsx        # 服務方案
│   │   ├── trends/page.tsx          # 趨勢分析
│   │   ├── process/page.tsx         # 接單流程
│   │   ├── contact/page.tsx         # 立即諮詢
│   │   ├── admin/page.tsx           # 管理後台
│   │   └── api/
│   │       ├── contact/route.ts     # POST 諮詢表單
│   │       └── submissions/
│   │           ├── route.ts         # GET 所有紀錄
│   │           └── [id]/
│   │               ├── route.ts     # DELETE
│   │               └── status/route.ts  # PATCH 狀態
│   │
│   ├── components/
│   │   ├── ui/                      # shadcn/ui 自動產生（勿手動修改）
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── label.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── table.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   └── alert-dialog.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── SiteNav.tsx          # 頂部導覽（含漢堡選單 Sheet）
│   │   │   ├── SiteFooter.tsx       # 頁尾
│   │   │   └── PageHeader.tsx       # 各頁面頂部 banner（可重用）
│   │   │
│   │   ├── home/                    # 首頁區塊元件
│   │   ├── services/                # 服務方案元件
│   │   ├── trends/                  # 趨勢分析元件（含 Client Component）
│   │   ├── process/                 # 接單流程元件
│   │   ├── contact/                 # 諮詢表單（Client Component）
│   │   └── admin/                   # 管理後台（全 Client Component）
│   │
│   └── lib/
│       ├── types.ts                 # Submission 型別定義
│       ├── submissions.ts           # Server-only：讀寫 JSON 資料
│       └── utils.ts                 # cn() 工具函式
│
└── data/
    └── submissions.json             # 表單資料持久化
```

---

## shadcn/ui 元件對應表

| 頁面 / 元件 | 使用的 shadcn 元件 |
|------------|-------------------|
| 全站導覽列 | `Sheet`, `Button` |
| 首頁 Hero | `Badge`, `Button` |
| 首頁統計卡 | `Card`, `Separator` |
| 服務方案卡片 | `Card`, `Badge` |
| 關鍵字表格 | `Table` 系列 |
| 諮詢表單 | `Form`, `Input`, `Textarea`, `Checkbox`, `Label`, `Button` |
| 成功彈窗 | `Dialog` |
| 後台資料表 | `Table`, `Select`, `Badge` |
| 後台刪除確認 | `AlertDialog` |
| 後台詳細彈窗 | `Dialog` |

---

## Server vs Client Component 分界

```
Server Component (預設)         Client Component ('use client')
──────────────────────────      ────────────────────────────────
所有頁面 shell                   SiteNav（usePathname）
PageHeader                       ContactForm（react-hook-form）
SiteFooter                       TrendsWidget（window API）
ServiceModuleCard                AdminPage 全部子元件
StepTimeline
KeywordsTable（靜態）
```

---

## 新增頁面 SOP

1. 在 `src/app/<頁面>/page.tsx` 建立 Server Component
2. 區塊元件放 `src/components/<頁面>/`
3. 需要互動的元件加 `'use client'`
4. 需要新 shadcn 元件：`npx shadcn@latest add <元件名>`
5. 絕對不要直接修改 `src/components/ui/` 裡的檔案

---

## API 規格

| Endpoint | Method | 說明 |
|----------|--------|------|
| `/api/contact` | POST | 送出諮詢（需 name + phone） |
| `/api/submissions` | GET | 取得所有紀錄（倒序） |
| `/api/submissions/[id]/status` | PATCH | 更新狀態（new/contacted/done） |
| `/api/submissions/[id]` | DELETE | 刪除紀錄 |

---

*最後更新：2026-03-30*
