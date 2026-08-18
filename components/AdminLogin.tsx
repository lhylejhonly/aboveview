'use client';
import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Lock } from 'lucide-react';

export function AdminLogin({ onCancel }: { onCancel: () => void }) {
  const { login } = useAdmin();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(password);
    if (!ok) { setError(true); setPassword(''); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1F1D1B]/90 flex items-center justify-center">
      <div className="bg-[#F7F5F0] border border-[#D6CFC7] p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="w-4 h-4 text-[#5A5A40]" />
          <span className="font-sans text-xs font-black uppercase tracking-widest text-[#1F1D1B]">Admin Access</span>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(false); }}
            placeholder="Enter admin password"
            className="w-full border border-[#D6CFC7] bg-white px-4 py-2.5 text-sm font-sans text-[#1F1D1B] outline-none focus:border-[#5A5A40]"
            autoFocus
          />
          {error && <p className="text-xs text-red-600 font-sans">Incorrect password.</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-[#1F1D1B] text-[#F7F5F0] text-xs font-black uppercase tracking-widest py-2.5 hover:bg-[#5A5A40] transition-colors"
            >
              Login
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-[#D6CFC7] text-xs font-black uppercase tracking-widest py-2.5 hover:bg-[#E5E0DA] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

