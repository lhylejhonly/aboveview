'use client';

import { useEffect, useState } from 'react';
import { Check, Play, Power, Save } from 'lucide-react';

type SettingsState = { storeName: string; storeEmail: string; storeDescription: string; adminEmail: string; timezone: string; currency: string; lowStockThreshold: number; maintenanceMode: boolean };
type VoucherState = { code: string; discountPercent: number; isActive: boolean; startsAt: string; expiresAt: string; usageLimit: number | null; usedCount: number };
const defaults: SettingsState = { storeName: 'Above Viewing', storeEmail: '', storeDescription: '', adminEmail: '', timezone: 'Asia/Manila', currency: 'PHP', lowStockThreshold: 5, maintenanceMode: false };
const defaultVoucher: VoucherState = { code: '10.10', discountPercent: 10, isActive: true, startsAt: '', expiresAt: '', usageLimit: null, usedCount: 0 };

function toDateTimeLocal(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function AdminSettings() {
  const [settings, setSettings] = useState(defaults);
  const [voucher, setVoucher] = useState(defaultVoucher);
  const [saved, setSaved] = useState(false);
  const [voucherSaved, setVoucherSaved] = useState(false);
  const [voucherLoading, setVoucherLoading] = useState(true);
  const [voucherSaving, setVoucherSaving] = useState(false);
  const [voucherError, setVoucherError] = useState('');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('aboveview-admin-settings');
      if (raw) setSettings({ ...defaults, ...JSON.parse(raw) });
    } catch {
      // Keep defaults when old local settings cannot be read.
    }
    void fetch('/api/admin/vouchers', { cache: 'no-store' })
      .then(async response => {
        const data = await response.json() as { voucher?: { code: string; discount_percent: number; is_active: boolean; starts_at?: string | null; expires_at?: string | null; usage_limit?: number | null; used_count?: number } };
        if (!response.ok) throw new Error('Unable to load voucher settings.');
        if (data.voucher) setVoucher({ code: data.voucher.code, discountPercent: Number(data.voucher.discount_percent), isActive: data.voucher.is_active, startsAt: toDateTimeLocal(data.voucher.starts_at), expiresAt: toDateTimeLocal(data.voucher.expires_at), usageLimit: data.voucher.usage_limit ?? null, usedCount: Number(data.voucher.used_count ?? 0) });
      })
      .catch(error => setVoucherError(error instanceof Error ? error.message : 'Unable to load voucher settings.'))
      .finally(() => setVoucherLoading(false));
  }, []);

  const set = (key: keyof SettingsState, value: unknown) => setSettings(prev => ({ ...prev, [key]: value }));
  const setVoucherValue = (key: keyof VoucherState, value: string | number | boolean | null) => setVoucher(prev => ({ ...prev, [key]: value }));
  const save = (event: React.FormEvent) => { event.preventDefault(); localStorage.setItem('aboveview-admin-settings', JSON.stringify(settings)); setSaved(true); window.setTimeout(() => setSaved(false), 2200); };
  const persistVoucher = async (nextVoucher: VoucherState) => {
    setVoucherSaving(true); setVoucherError('');
    try {
      const response = await fetch('/api/admin/vouchers', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: nextVoucher.code, discountPercent: nextVoucher.discountPercent, isActive: nextVoucher.isActive, startsAt: nextVoucher.startsAt ? new Date(nextVoucher.startsAt).toISOString() : null, expiresAt: nextVoucher.expiresAt ? new Date(nextVoucher.expiresAt).toISOString() : null, usageLimit: nextVoucher.usageLimit }) });
      const data = await response.json() as { voucher?: { code: string; discount_percent: number; is_active: boolean; starts_at?: string | null; expires_at?: string | null; usage_limit?: number | null; used_count?: number }; error?: string };
      if (!response.ok || !data.voucher) throw new Error(data.error ?? 'Unable to save voucher settings.');
      setVoucher({ code: data.voucher.code, discountPercent: Number(data.voucher.discount_percent), isActive: data.voucher.is_active, startsAt: toDateTimeLocal(data.voucher.starts_at), expiresAt: toDateTimeLocal(data.voucher.expires_at), usageLimit: data.voucher.usage_limit ?? null, usedCount: Number(data.voucher.used_count ?? 0) });
      setVoucherSaved(true); window.setTimeout(() => setVoucherSaved(false), 2200);
    } catch (error) { setVoucherError(error instanceof Error ? error.message : 'Unable to save voucher settings.'); }
    finally { setVoucherSaving(false); }
  };
  const saveVoucher = async (event: React.FormEvent) => { event.preventDefault(); await persistVoucher(voucher); };
  const activateVoucherNow = () => void persistVoucher({ ...voucher, isActive: true, startsAt: '' });
  const deactivateVoucher = () => void persistVoucher({ ...voucher, isActive: false });

  const input = 'mt-2 w-full rounded-lg border border-[#d9dad4] bg-[#fbfbf8] px-3 py-2.5 text-sm outline-none focus:border-[#74784f]';
  const startMs = voucher.startsAt ? new Date(voucher.startsAt).getTime() : null;
  const expiryMs = voucher.expiresAt ? new Date(voucher.expiresAt).getTime() : null;
  const scheduleStatus = !voucher.isActive ? 'Inactive' : startMs && now < startMs ? 'Scheduled' : expiryMs && now >= expiryMs ? 'Expired' : voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit ? 'Fully redeemed' : 'Active';
  const countdownTarget = scheduleStatus === 'Scheduled' ? startMs : scheduleStatus === 'Active' ? expiryMs : null;
  const formatCountdown = (target: number | null) => {
    if (!target) return 'No expiry set';
    const seconds = Math.max(0, Math.floor((target - now) / 1000));
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(remainingSeconds).padStart(2, '0')}s`;
  };
  return <div className="max-w-4xl space-y-6">
    <form onSubmit={save} className="space-y-6"><section className="rounded-xl border border-[#deded8] bg-white p-5 sm:p-6"><h2 className="font-semibold">Store information</h2><p className="mt-1 text-sm text-[#85898a]">The details shown across your storefront.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-[#555a5e]">Store name<input className={input} value={settings.storeName} onChange={event => set('storeName', event.target.value)} /></label><label className="text-xs font-semibold text-[#555a5e]">Store email<input type="email" className={input} value={settings.storeEmail} onChange={event => set('storeEmail', event.target.value)} /></label><label className="text-xs font-semibold text-[#555a5e] sm:col-span-2">Store description<textarea rows={3} className={input} value={settings.storeDescription} onChange={event => set('storeDescription', event.target.value)} /></label></div></section><section className="rounded-xl border border-[#deded8] bg-white p-5 sm:p-6"><h2 className="font-semibold">Account & security</h2><p className="mt-1 text-sm text-[#85898a]">Admin account preferences for this workspace.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-[#555a5e]">Admin email<input type="email" className={input} value={settings.adminEmail} onChange={event => set('adminEmail', event.target.value)} /></label><label className="text-xs font-semibold text-[#555a5e]">Timezone<select className={input} value={settings.timezone} onChange={event => set('timezone', event.target.value)}><option>Asia/Manila</option><option>UTC</option><option>America/New_York</option><option>Europe/London</option></select></label></div></section><section className="rounded-xl border border-[#deded8] bg-white p-5 sm:p-6"><h2 className="font-semibold">Store preferences</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-[#555a5e]">Currency<select className={input} value={settings.currency} onChange={event => set('currency', event.target.value)}><option>USD</option><option>PHP</option><option>EUR</option></select></label><label className="text-xs font-semibold text-[#555a5e]">Low stock threshold<input type="number" min="0" className={input} value={settings.lowStockThreshold} onChange={event => set('lowStockThreshold', Number(event.target.value))} /></label></div><label className="mt-5 flex items-center gap-3 text-sm text-[#555a5e]"><input type="checkbox" checked={settings.maintenanceMode} onChange={event => set('maintenanceMode', event.target.checked)} className="h-4 w-4 accent-[#74784f]" /> Enable storefront maintenance mode</label></section><button className="inline-flex items-center gap-2 rounded-lg bg-[#74784f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#626741]">{saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}{saved ? 'Saved' : 'Save settings'}</button></form>
    <form onSubmit={saveVoucher} className="rounded-xl border border-[#deded8] bg-white p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold">Customer voucher</h2><p className="mt-1 text-sm text-[#85898a]">Set the code customers can use during checkout.</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${scheduleStatus === 'Active' ? 'bg-[#e7eadb] text-[#58603c]' : scheduleStatus === 'Scheduled' ? 'bg-[#e8edf4] text-[#52657a]' : 'bg-[#f5e2dc] text-[#a5523b]'}`}>{scheduleStatus}</span></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-[#555a5e]">Voucher code<input required disabled={voucherLoading} className={input} value={voucher.code} onChange={event => setVoucherValue('code', event.target.value.toUpperCase())} placeholder="Example: ABOVE10" /></label><label className="text-xs font-semibold text-[#555a5e]">Discount percent<input required disabled={voucherLoading} type="number" min="0.01" max="100" step="0.01" className={input} value={voucher.discountPercent} onChange={event => setVoucherValue('discountPercent', Number(event.target.value))} /></label><label className="text-xs font-semibold text-[#555a5e]">Starts at <span className="font-normal text-[#85898a]">(optional)</span><input disabled={voucherLoading} type="datetime-local" className={input} value={voucher.startsAt} onChange={event => setVoucherValue('startsAt', event.target.value)} /></label><label className="text-xs font-semibold text-[#555a5e]">Expires at <span className="font-normal text-[#85898a]">(optional)</span><input disabled={voucherLoading} type="datetime-local" className={input} value={voucher.expiresAt} onChange={event => setVoucherValue('expiresAt', event.target.value)} /></label><label className="text-xs font-semibold text-[#555a5e]">Maximum uses <span className="font-normal text-[#85898a]">(blank = unlimited)</span><input disabled={voucherLoading} type="number" min="1" step="1" className={input} value={voucher.usageLimit ?? ''} onChange={event => setVoucherValue('usageLimit', event.target.value ? Number(event.target.value) : null)} /></label></div><div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg bg-[#f5f6f1] px-3 py-2.5 text-xs text-[#626741]"><span>Used: {voucher.usedCount}{voucher.usageLimit ? ` / ${voucher.usageLimit}` : ' / unlimited'}</span><span className="font-mono font-semibold">{scheduleStatus === 'Scheduled' ? 'Activates in' : scheduleStatus === 'Active' ? 'Expires in' : scheduleStatus}</span><span className="font-mono font-semibold text-[#24272b]">{formatCountdown(countdownTarget)}</span></div><div className="mt-5 flex flex-wrap items-center gap-3"><label className="flex items-center gap-3 text-sm text-[#555a5e]"><input type="checkbox" checked={voucher.isActive} onChange={event => setVoucherValue('isActive', event.target.checked)} className="h-4 w-4 accent-[#74784f]" /> Allow customers to use this voucher</label><button type="button" onClick={activateVoucherNow} disabled={voucherLoading || voucherSaving} className="inline-flex items-center gap-2 rounded-lg border border-[#74784f] px-4 py-2.5 text-sm font-semibold text-[#626741] hover:bg-[#f2f3eb] disabled:cursor-wait disabled:opacity-60"><Play className="h-4 w-4" /> Activate now</button><button type="button" onClick={deactivateVoucher} disabled={voucherLoading || voucherSaving} className="inline-flex items-center gap-2 rounded-lg border border-[#d9dad4] px-4 py-2.5 text-sm font-semibold text-[#666a6d] hover:bg-[#f7f7f4] disabled:cursor-wait disabled:opacity-60"><Power className="h-4 w-4" /> Deactivate</button></div>{voucherError && <p className="mt-4 rounded-lg border border-[#f0c9bd] bg-[#fff6f2] p-3 text-xs text-[#a5523b]">{voucherError}</p>}<button disabled={voucherLoading || voucherSaving} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#74784f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#626741] disabled:cursor-wait disabled:opacity-60">{voucherSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}{voucherSaving ? 'Saving...' : voucherSaved ? 'Voucher saved' : 'Save voucher'}</button></form>
  </div>;
}
