import { useEffect, useState } from 'react';
import { DollarSign, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Payment {
  id: string;
  provider: 'stripe';
  provider_session_id: string | null;
  provider_payment_intent_id: string | null;
  amount: number;
  currency: string;
  description: string | null;
  customer_email: string | null;
  metadata: Record<string, any>;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'canceled';
  booking_id: string | null;
  created_at: string;
}

async function fetchJSON<T>(url: string) {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Request failed');
  return data.data as T;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<{ total: number; paid: number; failed: number; refunded: number; pending: number; } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [list, s] = await Promise.all([
        fetchJSON<Payment[]>(`/api/payments${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`),
        fetchJSON<{ total: number; paid: number; failed: number; refunded: number; pending: number; }>(`/api/payments/stats`),
      ]);
      setPayments(list);
      setStats(s);
    } catch (e) {
      console.error(e);
      alert('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const statusBadge = (st: Payment['status']) => {
    const map: Record<Payment['status'], { label: string; variant: any }> = {
      pending: { label: 'قيد المعالجة', variant: 'secondary' },
      paid: { label: 'مدفوع', variant: 'default' },
      failed: { label: 'فشل', variant: 'destructive' },
      refunded: { label: 'مسترجع', variant: 'outline' },
      canceled: { label: 'ملغي', variant: 'outline' },
    };
    const v = map[st];
    return <Badge variant={v.variant as any}>{v.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center gap-2"><DollarSign className="h-5 w-5 text-green-600" /> المدفوعات</h3>
        <div className="flex items-center gap-3">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded px-3 py-2">
            <option value="all">الكل</option>
            <option value="pending">قيد المعالجة</option>
            <option value="paid">مدفوع</option>
            <option value="failed">فشل</option>
            <option value="refunded">مسترجع</option>
            <option value="canceled">ملغي</option>
          </select>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className="h-4 w-4" /> تحديث
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-4 bg-white rounded-lg border"><div className="text-gray-500 text-sm">الإجمالي</div><div className="text-2xl font-bold">{stats.total}</div></div>
          <div className="p-4 bg-white rounded-lg border"><div className="text-gray-500 text-sm">مدفوع</div><div className="text-2xl font-bold text-green-600">{stats.paid}</div></div>
          <div className="p-4 bg-white rounded-lg border"><div className="text-gray-500 text-sm">قيد المعالجة</div><div className="text-2xl font-bold text-blue-600">{stats.pending}</div></div>
          <div className="p-4 bg-white rounded-lg border"><div className="text-gray-500 text-sm">فشل</div><div className="text-2xl font-bold text-red-600">{stats.failed}</div></div>
          <div className="p-4 bg-white rounded-lg border"><div className="text-gray-500 text-sm">مسترجع</div><div className="text-2xl font-bold text-amber-600">{stats.refunded}</div></div>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>التاريخ</TableHead>
              <TableHead>المعرف</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>الإيميل</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{new Date(p.created_at).toLocaleString('ar-SA')}</TableCell>
                <TableCell className="font-mono text-xs">{p.id}</TableCell>
                <TableCell>{p.description || '-'}</TableCell>
                <TableCell>{p.customer_email || '-'}</TableCell>
                <TableCell>
                  <span className="font-semibold">{(p.amount / 100).toFixed(2)} {p.currency}</span>
                </TableCell>
                <TableCell>{statusBadge(p.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableCaption>أحدث المدفوعات</TableCaption>
        </Table>
      </div>
    </div>
  );
}
