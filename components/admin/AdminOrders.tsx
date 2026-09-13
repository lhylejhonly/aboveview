'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, Clock3, Eye, PackageCheck, RefreshCw, Search, ShoppingBag, X } from 'lucide-react';
import { formatPrice } from '@/lib/currency';

type Order = {
  id: string;
  order_number: string;
  product_name: string;
  product_code: string;
  size: string;
  quantity: number;
  unit_price: number;
  full_name: string;
  contact_number: string;
  destination: string;
  address: string;
  delivery_notes: string;
  status: string;
  created_at: string;
};

const statuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/orders', { cache: 'no-store' });
      if (!response.ok) throw new Error('Unable to load orders.');
      setOrders((await response.json()).orders ?? []);
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
    const timer = window.setInterval(loadOrders, 30000);
    return () => window.clearInterval(timer);
  }, [loadOrders]);

  const visibleOrders = useMemo(() => orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const query = search.trim().toLowerCase();
    return matchesFilter && (!query || [order.order_number, order.full_name, order.product_name, order.contact_number].some(value => value.toLowerCase().includes(query)));
  }), [filter, orders, search]);

  const pending = orders.filter(order => order.status === 'pending').length;
  const total = orders.reduce((sum, order) => sum + Number(order.unit_price) * order.quantity, 0);

  const updateStatus = async (id: string, status: string) => {
    const response = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (response.ok) setOrders(current => current.map(order => order.id === id ? { ...order, status } : order));
  };

  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-3">
      <Summary label="Total orders" value={orders.length} icon={ShoppingBag} />
      <Summary label="Awaiting review" value={pending} icon={Clock3} accent />
      <Summary label="Order value" value={formatPrice(total)} icon={PackageCheck} />
    </div>

    <section className="overflow-hidden rounded-2xl border border-[#deded8] bg-white shadow-[0_12px_35px_rgba(32,36,43,0.05)]">
      <div className="flex flex-col gap-4 border-b border-[#e8e9e4] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div><h2 className="text-lg font-semibold">Order management</h2><p className="mt-1 text-xs text-[#85898a]">Track every Above Apprl order from checkout to delivery.</p></div>
        <button onClick={() => void loadOrders()} className="flex items-center justify-center gap-2 rounded-lg border border-[#dfe0da] px-3 py-2 text-xs font-semibold text-[#626741] hover:bg-[#f2f3ed]"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
      </div>

      <div className="flex flex-col gap-3 border-b border-[#edede8] bg-[#fbfbf8] p-4 sm:flex-row">
        <label className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9d98]" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search order, customer, or product" className="w-full rounded-lg border border-[#dfe0da] bg-white py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#74784f]" /></label>
        <select value={filter} onChange={event => setFilter(event.target.value)} className="rounded-lg border border-[#dfe0da] bg-white px-3 py-2.5 text-xs font-semibold capitalize outline-none focus:border-[#74784f]"><option value="all">All statuses</option>{statuses.map(status => <option key={status} value={status}>{status}</option>)}</select>
      </div>

      {error && <p className="m-5 rounded-lg border border-[#f0c9bd] bg-[#fff6f2] p-3 text-xs text-[#a5523b]">{error}</p>}
      {loading ? <div className="p-12 text-center text-sm text-[#85898a]">Loading orders...</div> : visibleOrders.length === 0 ? <div className="p-12 text-center"><ShoppingBag className="mx-auto h-8 w-8 text-[#b5b8b1]" /><p className="mt-3 text-sm font-semibold">No orders found</p><p className="mt-1 text-xs text-[#85898a]">New customer orders will appear here automatically.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead className="border-b border-[#edede8]"><tr>{['Order', 'Customer', 'Item', 'Total', 'Status', 'Placed'].map(label => <th key={label} className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[#85898a]">{label}</th>)}</tr></thead><tbody className="divide-y divide-[#f0f0eb]">{visibleOrders.map(order => <tr key={order.id} className="transition hover:bg-[#fbfbf8]"><td className="px-5 py-4"><button onClick={() => setSelectedOrder(order)} className="text-left"><p className="text-sm font-semibold hover:text-[#74784f]">{order.order_number}</p><p className="mt-1 text-[11px] text-[#85898a]">{order.product_code} · Size {order.size}</p></button></td><td className="px-5 py-4"><button onClick={() => setSelectedOrder(order)} className="group flex items-center gap-2 text-left"><span><p className="text-sm font-medium group-hover:text-[#74784f]">{order.full_name}</p><p className="mt-1 text-[11px] text-[#85898a]">{order.contact_number}</p></span><Eye className="h-3.5 w-3.5 text-[#9a9d98] opacity-0 transition group-hover:opacity-100" /></button></td><td className="px-5 py-4 text-sm"><p>{order.product_name}</p><p className="mt-1 text-[11px] text-[#85898a]">Qty {order.quantity}</p></td><td className="px-5 py-4 text-sm font-semibold">{formatPrice(Number(order.unit_price) * order.quantity)}</td><td className="px-5 py-4"><div className="relative inline-flex items-center"><select value={order.status} onChange={event => void updateStatus(order.id, event.target.value)} className={`appearance-none rounded-full border-0 py-1.5 pl-3 pr-7 text-[10px] font-bold capitalize outline-none ${statusClass(order.status)}`}>{statuses.map(status => <option key={status} value={status}>{status}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2 h-3 w-3" /></div></td><td className="px-5 py-4 text-xs text-[#85898a]">{new Date(order.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</td></tr>)}</tbody></table></div>}
    </section>

    {selectedOrder && <OrderDetails order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
  </div>;
}

function OrderDetails({ order, onClose }: { order: Order; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17191dcc] p-4" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#fbfbf8] shadow-2xl">
      <div className="flex items-start justify-between border-b border-[#e4e5df] p-5 sm:p-6"><div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#74784f]">Customer and order details</p><h2 className="mt-2 text-xl font-semibold">{order.order_number}</h2></div><button onClick={onClose} aria-label="Close details" className="rounded-full p-2 text-[#6d706c] hover:bg-[#edeee8]"><X className="h-5 w-5" /></button></div>
      <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
        <div className="space-y-4"><h3 className="text-sm font-semibold">Customer</h3><Detail label="Full name" value={order.full_name} /><Detail label="Contact number" value={order.contact_number} /><Detail label="Destination / city" value={order.destination} /><Detail label="Complete address" value={order.address} /><Detail label="Delivery notes" value={order.delivery_notes || 'None'} /></div>
        <div className="space-y-4"><h3 className="text-sm font-semibold">Order</h3><Detail label="Product" value={order.product_name} /><Detail label="Product code" value={order.product_code} /><Detail label="Size" value={order.size} /><Detail label="Quantity" value={String(order.quantity)} /><Detail label="Total" value={formatPrice(Number(order.unit_price) * order.quantity)} /><Detail label="Status" value={order.status} /></div>
      </div>
      <div className="flex justify-end border-t border-[#e4e5df] p-5 sm:p-6"><button onClick={onClose} className="rounded-lg bg-[#2d2927] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#46403c]">Close</button></div>
    </div>
  </div>;
}

function Detail({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] font-bold uppercase tracking-widest text-[#85898a]">{label}</p><p className="mt-1 whitespace-pre-wrap text-sm text-[#292c30]">{value}</p></div>; }
function Summary({ label, value, icon: Icon, accent = false }: { label: string; value: string | number; icon: React.ElementType; accent?: boolean }) { return <div className={`rounded-2xl border p-5 shadow-[0_8px_25px_rgba(32,36,43,0.04)] ${accent ? 'border-[#74784f] bg-[#74784f] text-white' : 'border-[#e0e1dc] bg-white text-[#24272b]'}`}><div className="flex items-center gap-3"><div className={`rounded-xl p-2.5 ${accent ? 'bg-white/15' : 'bg-[#f1f2ed]'}`}><Icon className={`h-4 w-4 ${accent ? 'text-white' : 'text-[#74784f]'}`} /></div><span className={`text-xs ${accent ? 'text-white/70' : 'text-[#85898a]'}`}>{label}</span></div><p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p></div>; }
function statusClass(status: string) { if (status === 'pending') return 'bg-[#fff0db] text-[#a66327]'; if (status === 'cancelled') return 'bg-[#f5e2dc] text-[#a5523b]'; if (status === 'delivered') return 'bg-[#e7eadb] text-[#58603c]'; return 'bg-[#e8edf4] text-[#52657a]'; }
