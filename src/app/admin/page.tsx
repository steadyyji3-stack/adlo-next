'use client';

import { useEffect, useState, useCallback } from 'react';
import { Submission, SubmissionStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { RefreshCw, Trash2, Eye } from 'lucide-react';

const STATUS_LABELS: Record<SubmissionStatus, string> = { new: '新詢問', contacted: '已聯繫', done: '已完成' };
const STATUS_COLORS: Record<SubmissionStatus, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-amber-50 text-amber-700 border-amber-200',
  done: 'bg-green-50 text-green-700 border-green-200',
};

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [detail, setDetail] = useState<Submission | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Submission | null>(null);
  const [lastRefresh, setLastRefresh] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/submissions');
    if (res.ok) setSubmissions(await res.json());
    setLastRefresh(new Date().toLocaleTimeString('zh-TW'));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [load]);

  async function updateStatus(id: number, status: SubmissionStatus) {
    await fetch(`/api/submissions/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
  }

  async function deleteSubmission(id: number) {
    await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    setDeleteTarget(null);
  }

  const filtered = submissions.filter((s) => {
    const matchSearch = !search || s.name.includes(search) || s.phone.includes(search);
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: submissions.length,
    new: submissions.filter((s) => s.status === 'new').length,
    contacted: submissions.filter((s) => s.status === 'contacted').length,
    done: submissions.filter((s) => s.status === 'done').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'var(--font-manrope)' }}>後台管理</h1>
            <p className="text-slate-500 text-sm mt-1">最後更新：{lastRefresh}（每 30 秒自動刷新）</p>
          </div>
          <Button onClick={load} variant="outline" size="sm" className="gap-2" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: '總計', value: stats.total, color: 'text-slate-800' },
            { label: '新詢問', value: stats.new, color: 'text-blue-600' },
            { label: '已聯繫', value: stats.contacted, color: 'text-amber-600' },
            { label: '已完成', value: stats.done, color: 'text-green-600' },
          ].map(({ label, value, color }) => (
            <Card key={label} className="border-slate-100">
              <CardContent className="p-6 text-center">
                <div className={`text-3xl font-extrabold mb-1 ${color}`} style={{ fontFamily: 'var(--font-manrope)' }}>{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <Input
            placeholder="搜尋姓名或電話…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs bg-white"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-white">
              <SelectValue placeholder="所有狀態" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有狀態</SelectItem>
              <SelectItem value="new">新詢問</SelectItem>
              <SelectItem value="contacted">已聯繫</SelectItem>
              <SelectItem value="done">已完成</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="border-slate-100 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead>姓名</TableHead>
                <TableHead>電話</TableHead>
                <TableHead>申請時間</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                    {loading ? '載入中…' : '沒有符合的資料'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow key={s.id} className="hover:bg-slate-50">
                    <TableCell className="font-semibold text-slate-800">{s.name}</TableCell>
                    <TableCell className="text-slate-600">{s.phone}</TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(s.submittedAt).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell>
                      <Select value={s.status} onValueChange={(v) => updateStatus(s.id, v as SubmissionStatus)}>
                        <SelectTrigger className="w-28 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.entries(STATUS_LABELS) as [SubmissionStatus, string][]).map(([val, label]) => (
                            <SelectItem key={val} value={val}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDetail(s)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteTarget(s)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>諮詢詳細資料</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">姓名</span><span className="font-semibold">{detail.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">電話</span><span>{detail.phone}</span></div>
              {detail.lineId && <div className="flex justify-between"><span className="text-slate-500">LINE ID</span><span>{detail.lineId}</span></div>}
              {detail.website && <div className="flex justify-between"><span className="text-slate-500">網站</span><span>{detail.website}</span></div>}
              <div className="flex justify-between"><span className="text-slate-500">狀態</span>
                <Badge variant="outline" className={STATUS_COLORS[detail.status]}>{STATUS_LABELS[detail.status]}</Badge>
              </div>
              {detail.challenges.length > 0 && (
                <div><span className="text-slate-500">挑戰</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {detail.challenges.map((c) => <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>)}
                  </div>
                </div>
              )}
              {detail.notes && <div><span className="text-slate-500">備註</span><p className="mt-1 text-slate-700 bg-slate-50 rounded p-3">{detail.notes}</p></div>}
              <div className="flex justify-between text-xs text-slate-400">
                <span>申請時間</span><span>{new Date(detail.submittedAt).toLocaleString('zh-TW')}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除？</AlertDialogTitle>
            <AlertDialogDescription>
              即將刪除 <strong>{deleteTarget?.name}</strong> 的諮詢紀錄，此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => deleteTarget && deleteSubmission(deleteTarget.id)}
            >
              確認刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
