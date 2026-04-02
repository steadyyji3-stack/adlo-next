'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';

const industryOptions = [
  '餐飲 / 咖啡廳',
  '診所 / 醫療 / 醫美',
  '美容 / 美髮 / 美甲',
  '居家修繕 / 清潔服務',
  '汽車 / 機車 / 保養',
  '房仲 / 不動產 / 代銷',
  '教育 / 補習班 / 才藝',
  '傳統零售 / 當鋪 / 二手',
  '電商品牌 / 網路商店',
  '健身 / 運動 / 瑜伽',
  '寵物 / 動物醫院',
  '法律 / 會計 / 顧問',
  '工廠 / 批發 / B2B',
  '其他行業',
];

const serviceOptions = [
  'Google 商家優化（地圖排名）',
  '在地 SEO 深度佈局',
  '精準廣告投放（Google / Meta）',
  '廣告文案撰寫與優化',
  '內容行銷 / 社群經營',
  '整合方案（全部服務）',
  '還不確定，需要建議',
];

const challenges = [
  'Google 地圖排名不佳',
  '關鍵字搜尋找不到我',
  '廣告預算花了但沒效果',
  '不知道從哪裡開始',
  '競爭對手一直搶排名',
  '想做電商但不知如何投放',
];

const schema = z.object({
  name:        z.string().min(1, '姓名為必填欄位'),
  phone:       z.string().min(1, '電話為必填欄位'),
  lineId:      z.string().optional(),
  website:     z.string().optional(),
  industry:    z.string().optional(),
  service:     z.string().optional(),
  challenges:  z.array(z.string()),
  notes:       z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ContactForm() {
  const [successId, setSuccessId] = useState<number | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', phone: '', lineId: '', website: '',
      industry: '', service: '', challenges: [], notes: '',
    },
  });

  async function onSubmit(data: FormData) {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      setSuccessId(json.id);
      form.reset();
    } else {
      form.setError('root', { message: json.message || '送出失敗，請稍後再試' });
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* 姓名 + 電話 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>負責人姓名 <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input placeholder="王小明" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>聯絡電話 <span className="text-red-500">*</span></FormLabel>
                <FormControl><Input type="tel" placeholder="0912-345-678" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {/* LINE + 網站 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="lineId" render={({ field }) => (
              <FormItem>
                <FormLabel>LINE ID</FormLabel>
                <FormControl><Input placeholder="your_line_id" {...field} /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="website" render={({ field }) => (
              <FormItem>
                <FormLabel>官方網站（如有）</FormLabel>
                <FormControl><Input placeholder="https://..." {...field} /></FormControl>
              </FormItem>
            )} />
          </div>

          {/* 行業 + 需要的服務 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="industry" render={({ field }) => (
              <FormItem>
                <FormLabel>你的行業類型</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="請選擇行業" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {industryOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
            <FormField control={form.control} name="service" render={({ field }) => (
              <FormItem>
                <FormLabel>希望的服務項目</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="請選擇服務" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {serviceOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
          </div>

          {/* 挑戰 checkboxes */}
          <FormField control={form.control} name="challenges" render={() => (
            <FormItem>
              <FormLabel>目前遇到的行銷挑戰（可複選）</FormLabel>
              <div className="grid gap-2 mt-2">
                {challenges.map((c) => (
                  <FormField key={c} control={form.control} name="challenges" render={({ field }) => (
                    <FormItem className="flex items-center gap-3 border border-slate-200 rounded-lg px-4 py-3 hover:bg-slate-50 hover:border-[#1D9E75]/30 transition-colors cursor-pointer">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(c)}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            field.onChange(checked ? [...current, c] : current.filter((v) => v !== c));
                          }}
                        />
                      </FormControl>
                      <Label className="text-sm text-slate-600 cursor-pointer font-normal">{c}</Label>
                    </FormItem>
                  )} />
                ))}
              </div>
            </FormItem>
          )} />

          {/* 補充說明 */}
          <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem>
              <FormLabel>補充說明</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="請描述你的生意狀況、服務範圍、目前行銷方式，或任何想讓我們了解的事項…"
                  className="min-h-[100px] resize-y"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )} />

          {form.formState.errors.root && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm">
              {form.formState.errors.root.message}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full cta-gradient text-white font-bold hover:opacity-90 shadow-lg"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? '送出中…' : '送出諮詢申請'}
          </Button>

          <p className="text-center text-xs text-slate-400">
            送出即表示您同意我們使用此資訊進行服務諮詢，我們不會將資料分享給第三方。
          </p>
        </form>
      </Form>

      {/* Success Dialog */}
      <Dialog open={successId !== null} onOpenChange={() => setSuccessId(null)}>
        <DialogContent className="max-w-sm text-center">
          <div className="w-16 h-16 bg-[#E1F5EE] rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-8 h-8 text-[#1D9E75]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl text-center">申請成功！</DialogTitle>
            <DialogDescription className="text-center">
              申請編號：<span className="text-[#1D9E75] font-mono font-bold">#{successId}</span>
              <br />我們會在 24 小時內透過電話或 LINE 聯繫您。
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => setSuccessId(null)}
            className="w-full cta-gradient text-white font-bold hover:opacity-90 mt-2"
          >
            確認
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
