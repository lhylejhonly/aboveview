'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Product, Category } from '@/types';
import { X, Plus, Pencil, Trash2, LogOut, Package, LayoutDashboard, Tag, Settings } from 'lucide-react';

const CATEGORIES: Category[] = [
  'ua-prime-shirts','ua-premium-plains','ua-premium-hoodies-v3','ua-french-terries',
  'ua-fco-hoodies-sweatpants','ua-essentials','ua-cropped-tees','ua-caps',
  'ua-box-tees','ua-architect-tees','ua-athleisure-elite','ua-pocket-tees'
];

const emptyProduct = (): Omit<Product, 'id'> => ({
  name: '', code: '', category: 'ua-prime-shirts', price: 0, currency: '₱',
  description: '', frontImage: '', backImage: '', fabricDetails: '',
  gsm: 0, fitType: '', colors: [], sizes: [], tags: [],
  tiktokShopUrl: '', stockCount: 0, rating: 5.0, reviewCount: 0,
});

function ProductForm({ initial, onSave, onCancel }: {
  initial?: Product;
  onSave: (p: Product) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Omit<Product, 'id'>>(initial ? { ...initial } : emptyProduct());
  const [tagsInput, setTagsInput] = useState(initial?.tags.join(', ') ?? '');
  const [sizesInput, setSizesInput] = useState(initial?.sizes.join(', ') ?? '');

  const set = (key: keyof Omit<Product, 'id'>, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      id: initial?.id ?? `apprl-${Date.now()}`,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      sizes: sizesInput.split(',').map(s => s.trim()).filter(Boolean),
    });
  };

  const inputCls = "w-full border border-[#D6CFC7] bg-white px-3 py-2 text-sm font-sans text-[#1F1D1B] outline-none focus:border-[#5A5A40]";
  const labelCls = "text-[10px] font-black uppercase tracking-widest text-[#5A5A40] mb-1 block";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Product Name</label><input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} required /></div>
        <div><label className={labelCls}>Code</label><input className={inputCls} value={form.code} onChange={e => set('code', e.target.value)} required /></div>
        <div><label className={labelCls}>Price ($)</label><input type="number" step="0.01" className={inputCls} value={form.price} onChange={e => set('price', parseFloat(e.target.value))} required /></div>
        <div><label className={labelCls}>Original Price ($)</label><input type="number" step="0.01" className={inputCls} value={form.originalPrice ?? ''} onChange={e => set('originalPrice', e.target.value ? parseFloat(e.target.value) : undefined)} /></div>
        <div><label className={labelCls}>Stock Count</label><input type="number" className={inputCls} value={form.stockCount} onChange={e => set('stockCount', parseInt(e.target.value))} required /></div>
        <div><label className={labelCls}>GSM</label><input type="number" className={inputCls} value={form.gsm} onChange={e => set('gsm', parseInt(e.target.value))} required /></div>
        <div>
          <label className={labelCls}>Category</label>
          <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value as Category)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div><label className={labelCls}>Fit Type</label><input className={inputCls} value={form.fitType} onChange={e => set('fitType', e.target.value)} required /></div>
      </div>
      <div><label className={labelCls}>Description</label><textarea className={inputCls + ' resize-none'} rows={3} value={form.description} onChange={e => set('description', e.target.value)} required /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Front Image URL</label><input className={inputCls} value={form.frontImage} onChange={e => set('frontImage', e.target.value)} required /></div>
        <div><label className={labelCls}>Back Image URL</label><input className={inputCls} value={form.backImage} onChange={e => set('backImage', e.target.value)} required /></div>
        <div><label className={labelCls}>Fabric Details</label><input className={inputCls} value={form.fabricDetails} onChange={e => set('fabricDetails', e.target.value)} required /></div>
        <div><label className={labelCls}>TikTok Shop URL</label><input className={inputCls} value={form.tiktokShopUrl} onChange={e => set('tiktokShopUrl', e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Sizes (comma separated)</label><input className={inputCls} value={sizesInput} onChange={e => setSizesInput(e.target.value)} placeholder="S, M, L, XL" /></div>
        <div><label className={labelCls}>Tags (comma separated)</label><input className={inputCls} value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="Heavyweight, Organic, ..." /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <input type="checkbox" id="isNew" checked={!!form.isNew} onChange={e => set('isNew', e.target.checked)} />
          <label htmlFor="isNew" className={labelCls + ' mb-0'}>Mark as New</label>
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="isBestseller" checked={!!form.isBestseller} onChange={e => set('isBestseller', e.target.checked)} />
          <label htmlFor="isBestseller" className={labelCls + ' mb-0'}>Mark as Bestseller</label>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" className="flex-1 bg-[#1F1D1B] text-[#F7F5F0] text-xs font-black uppercase tracking-widest py-2.5 hover:bg-[#5A5A40] transition-colors">
          {initial ? 'Save Changes' : 'Add Product'}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 border border-[#D6CFC7] text-xs font-black uppercase tracking-widest py-2.5 hover:bg-[#E5E0DA] transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const { products, addProduct, updateProduct, deleteProduct, logout } = useAdmin();
  const [editing, setEditing] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState('products');

  const handleLogout = () => { logout(); onClose(); };

  return (
    <div className="fixed inset-0 z-50 bg-[#F7F5F0] flex flex-col">
      <div className="shrink-0 bg-[#1F1D1B] text-[#F7F5F0] px-6 py-4 flex items-center justify-between border-b border-[#3A3530]">
        <div className="flex items-center gap-3">
          <Package className="w-4 h-4 text-[#C2B280]" />
          <span className="font-sans text-xs font-black uppercase tracking-widest">Admin Panel — Product Manager</span>
          <span className="px-2 py-0.5 bg-[#5A5A40] text-[9px] font-sans uppercase tracking-widest rounded">{products.length} products</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setActiveNav('products'); setAdding(true); setEditing(null); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5A5A40] text-[#F7F5F0] text-[10px] font-black uppercase tracking-widest hover:bg-[#6B6B50] transition-colors">
            <Plus className="w-3 h-3" /> Add Product
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 border border-[#3A3530] text-[10px] font-black uppercase tracking-widest hover:bg-[#3A3530] transition-colors">
            <LogOut className="w-3 h-3" /> Logout
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-[#3A3530] transition-colors rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-52 shrink-0 bg-[#1F1D1B] text-[#F7F5F0] flex flex-col border-r border-[#3A3530]">
          <nav className="flex flex-col gap-0.5 p-3 flex-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveNav(id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest transition-colors text-left ${activeNav === id ? 'bg-[#5A5A40] text-[#F7F5F0]' : 'text-[#9E9387] hover:bg-[#3A3530] hover:text-[#F7F5F0]'}`}>
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-[#3A3530]">
            <p className="text-[9px] uppercase tracking-widest text-[#5A5A40]">Above Viewing</p>
            <p className="text-[9px] text-[#3A3530] mt-0.5">Admin v1.0</p>
          </div>
        </aside>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 py-6">
            {(adding || editing) && (
              <div className="mb-8 bg-white border border-[#D6CFC7] p-6">
                <h2 className="text-xs font-black uppercase tracking-widest text-[#1F1D1B] mb-5">
                  {editing ? `Editing: ${editing.name}` : 'New Product'}
                </h2>
                <ProductForm
                  initial={editing ?? undefined}
                  onSave={(p) => { editing ? updateProduct(p) : addProduct(p); setEditing(null); setAdding(false); }}
                  onCancel={() => { setEditing(null); setAdding(false); }}
                />
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D6CFC7]">
                    {['Image', 'Name', 'Code', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                      <th key={h} className="pb-3 pr-4 text-[10px] font-black uppercase tracking-widest text-[#5A5A40]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b border-[#E5E0DA] hover:bg-[#F0EDE8] transition-colors">
                      <td className="py-3 pr-4"><img src={product.frontImage} alt={product.name} className="w-12 h-14 object-cover bg-[#E5E0DA]" /></td>
                      <td className="py-3 pr-4"><p className="text-xs font-semibold text-[#1F1D1B] max-w-[160px] leading-tight">{product.name}</p></td>
                      <td className="py-3 pr-4 text-[11px] text-[#5A5A40] font-mono">{product.code}</td>
                      <td className="py-3 pr-4 text-[11px] text-[#5A5A40]">{product.category}</td>
                      <td className="py-3 pr-4 text-xs font-semibold text-[#1F1D1B]">
                        ${product.price.toFixed(2)}
                        {product.originalPrice && <span className="block text-[10px] text-[#9E9387] line-through">${product.originalPrice.toFixed(2)}</span>}
                      </td>
                      <td className="py-3 pr-4">
                        <input type="number" value={product.stockCount}
                          onChange={e => updateProduct({ ...product, stockCount: parseInt(e.target.value) || 0 })}
                          className="w-16 border border-[#D6CFC7] px-2 py-1 text-xs text-center outline-none focus:border-[#5A5A40]" />
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-col gap-1">
                          {product.isBestseller && <span className="px-1.5 py-0.5 bg-[#5A5A40] text-[#F7F5F0] text-[9px] uppercase tracking-wider w-fit">Bestseller</span>}
                          {product.isNew && <span className="px-1.5 py-0.5 bg-[#B85D3D] text-[#F7F5F0] text-[9px] uppercase tracking-wider w-fit">New</span>}
                          {product.stockCount === 0 && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] uppercase tracking-wider w-fit">Out of Stock</span>}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setEditing(product); setAdding(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-1.5 border border-[#D6CFC7] hover:bg-[#E5E0DA] transition-colors" title="Edit">
                            <Pencil className="w-3 h-3 text-[#5A5A40]" />
                          </button>
                          {confirmDelete === product.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => { deleteProduct(product.id); setConfirmDelete(null); }} className="px-2 py-1 bg-red-600 text-white text-[9px] font-black uppercase">Confirm</button>
                              <button onClick={() => setConfirmDelete(null)} className="px-2 py-1 border border-[#D6CFC7] text-[9px] font-black uppercase">No</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDelete(product.id)} className="p-1.5 border border-[#D6CFC7] hover:bg-red-50 transition-colors" title="Delete">
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
