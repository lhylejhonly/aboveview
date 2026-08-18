'use client';
import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, ArrowRight } from 'lucide-react';

interface StylistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export const StylistDrawer: React.FC<StylistDrawerProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Greetings. I am your ABOVE APPRL Earth Stylist. Ask me anything about styling our earth-tone collection, pairing terracotta and espresso hues, or choosing the ideal fit for your silhouette.'
    }
  ]);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText })
      });
      const data = await res.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply || 'Our earth tone collection layers beautifully with raw denim, linen trousers, and mineral-washed outerwear.'
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Pair our 380GSM terracotta tees with wide-leg clay cargos or the oatmeal canvas utility jacket for an effortless high-fashion earth-tone palette.'
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const QUICK_QUESTIONS = [
    "How should I style the Terracotta Tee?",
    "What pairs with Oatmeal Canvas Jacket?",
    "Explain the 380GSM organic fabric feel",
    "Which size should I pick for an oversized look?"
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#2D2926]/70 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-[#F4F1EE] h-full shadow-2xl flex flex-col border-l border-[#D6CFC7]">

        {/* Drawer Header */}
        <div className="p-5 border-b border-[#D6CFC7] bg-[#E5E0DA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#2D2926] text-[#F4F1EE]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-cinzel text-xs font-black uppercase text-[#2D2926] tracking-wider">AI Earth Stylist</h3>
              <p className="font-sans text-[10px] text-[#4A443F] uppercase tracking-wider font-bold">Powered by Gemini AI</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-[#F4F1EE] border border-[#D6CFC7] text-[#2D2926] hover:bg-[#2D2926] hover:text-[#F4F1EE]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 bg-[#5A5A40] text-[#F4F1EE] flex items-center justify-center shrink-0 text-xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`p-3.5 max-w-[85%] font-sans text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#2D2926] text-[#F4F1EE]'
                    : 'bg-[#E5E0DA] text-[#2D2926] border border-[#D6CFC7]'
                }`}
              >
                {m.text}
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 bg-[#2D2926] text-[#F4F1EE] flex items-center justify-center shrink-0 text-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 items-center text-xs font-sans text-[#5A5A40] italic">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Consulting fashion archives...</span>
            </div>
          )}
        </div>

        {/* Quick Questions */}
        <div className="p-3 bg-[#E5E0DA] border-t border-[#D6CFC7] space-y-1.5">
          <p className="text-[9px] font-sans uppercase font-bold text-[#8E8B82] tracking-widest px-1">
            Suggested Style Prompts:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setInput(q);
                }}
                className="text-[10px] font-sans bg-[#F4F1EE] border border-[#D6CFC7] text-[#2D2926] hover:bg-[#2D2926] hover:text-[#F4F1EE] px-2.5 py-1 text-left transition-all uppercase font-bold tracking-wider"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-4 border-t border-[#D6CFC7] bg-[#E5E0DA] flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about sizing, outfit combos..."
            className="flex-1 px-4 py-2 bg-[#F4F1EE] border border-[#D6CFC7] font-sans text-xs text-[#2D2926] focus:outline-none focus:border-[#2D2926] placeholder-[#8E8B82]"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-[#2D2926] text-[#F4F1EE] hover:bg-[#5A5A40] disabled:opacity-50 transition-all uppercase font-bold"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};

