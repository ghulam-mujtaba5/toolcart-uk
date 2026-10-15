'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { useVAT } from '@/context/vat-context';
import { Button } from '@/components/ui/button';
import {
  X,
  Send,
  ShieldCheck,
  AlertTriangle,
  ShoppingCart,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PublicProductDTO } from '@/types/product';
import { IconToolbox } from '@/components/ui/trade-icons';
import { AiScannerPulse } from '@/components/motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  recommendedProducts?: PublicProductDTO[];
  safetyCaveat?: string;
}

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const STARTER_PROMPTS = [
  'I need fixings for a shelf on brick wall—what should I check?',
  'Which screwdriver set has 1000V electrical insulation?',
  'What masking tape gives razor-sharp lines without peeling paint?',
  'What is the safe load limit for your step ladder?',
];

export function AIAssistantDrawer({ isOpen, onClose }: AIAssistantDrawerProps) {
  const { addItem } = useCart();
  const { formatPriceDisplay } = useVAT();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am your ToolCart UK Technical Assistant. I can help you select exact tools, verify pack sizes, check British Standard ratings, and find matching consumables from our verified 115-SKU catalog.',
    },
  ]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/store/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.reply,
          recommendedProducts: data.recommendedProducts || [],
          safetyCaveat: data.safetyCaveat,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'I am having trouble accessing the catalog index right now. Please try searching directly in the catalog search bar.',
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'A network error occurred while consulting the technical catalog. Please check your connection.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-assistant-title"
        className="relative w-full max-w-lg bg-tc-surface-soft h-full shadow-2xl flex flex-col z-10 border-l border-[#C8D9F9] animate-in slide-in-from-right-full duration-300"
      >
        {/* Header: Cobalt accent, Brand V3 */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#C8D9F9] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-tc-surface-soft border border-[#C8D9F9] p-1 flex items-center justify-center shadow-xs shrink-0 overflow-hidden group">
              <img
                src="/images/3d/ai/assistant-robot-avatar.webp"
                alt="ToolCart AI Project Finder 3D Robot Mascot"
                className="w-full h-full object-contain drop-shadow-xs group-hover:scale-110 transition-transform"
              />
            </div>
            <div>
              <h2 id="ai-assistant-title" className="font-heading font-extrabold text-base text-tc-ink flex items-center gap-1.5">
                ToolCart AI Assistant
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-tc-primary/10 text-tc-primary font-bold">
                  Grounded
                </span>
              </h2>
              <p className="text-[11px] text-tc-text-secondary">
                Verified catalog tools • Zero safety hallucinations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-tc-text-secondary hover:text-tc-ink transition-colors"
            aria-label="Close AI assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={cn(
                'flex flex-col space-y-2 max-w-[90%]',
                m.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              )}
            >
              <div
                className={cn(
                  'p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs',
                  m.role === 'user'
                    ? 'bg-tc-primary text-white rounded-br-xs'
                    : 'bg-white text-tc-ink border border-[#C8D9F9] rounded-bl-xs'
                )}
              >
                {m.content}
              </div>

              {/* Safety Caveat Callout */}
              {m.safetyCaveat && (
                <div className="p-3 rounded-xl bg-[#FFF7E8] border border-[#E8CB91] text-xs text-tc-ink flex items-start gap-2 shadow-xs">
                  <AlertTriangle className="w-4 h-4 text-tc-warning shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-snug">
                    <span className="font-bold">Safety Standard Notice: </span>
                    {m.safetyCaveat}
                  </div>
                </div>
              )}

              {/* Recommended Catalog Products */}
              {m.recommendedProducts && m.recommendedProducts.length > 0 && (
                <div className="w-full space-y-2 mt-2">
                  <p className="text-[11px] font-bold text-tc-primary uppercase tracking-wider">
                    Verified Matching Products ({m.recommendedProducts.length})
                  </p>
                  <div className="space-y-2">
                    {m.recommendedProducts.map((prod) => {
                      const price = formatPriceDisplay(
                        prod.retail_price_inc_vat_gbp,
                        prod.retail_price_ex_vat_gbp
                      );
                      return (
                        <div
                          key={prod.id}
                          className="p-3 bg-white rounded-xl border border-tc-border shadow-xs flex items-center justify-between gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-tc-ink truncate">{prod.title}</p>
                            <div className="flex items-center gap-2 text-[11px] text-tc-text-secondary mt-0.5">
                              <span className="font-mono">{prod.supplier_sku}</span>
                              <span>•</span>
                              <span className="font-semibold tabular-nums text-tc-ink">
                                {price.primaryText}
                              </span>
                            </div>
                          </div>

                          <Button
                            variant="primary"
                            size="sm"
                            className="h-7 text-xs px-2.5 shrink-0"
                            onClick={() => addItem(prod, 1)}
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            <span>Add</span>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="mr-auto p-4 rounded-2xl bg-white border border-[#C8D9F9] rounded-bl-xs text-xs text-tc-text-secondary flex items-center gap-3 shadow-xs">
              <AiScannerPulse size={40} className="shrink-0" />
              <div>
                <p className="font-bold text-tc-ink">Scanning catalog specifications...</p>
                <span className="text-[11px] text-tc-text-secondary">Filtering 115 quoted trade lines with zero safety hallucinations</span>
              </div>
            </div>
          )}
        </div>

        {/* Starter Prompts (if chat is fresh) */}
        {messages.length === 1 && (
          <div className="p-4 bg-white/70 border-t border-[#C8D9F9] space-y-3 shrink-0">
            <div className="rounded-xl overflow-hidden bg-gradient-to-r from-tc-surface-soft via-white to-tc-surface-soft border border-[#C8D9F9] p-3.5 flex items-center justify-between gap-3 shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-tc-primary/10 text-tc-primary uppercase tracking-wider inline-block">
                  3D Trade AI Advisor
                </span>
                <p className="font-heading font-extrabold text-xs text-tc-ink">
                  Hardware Advice &amp; Project Matching
                </p>
                <p className="text-[11px] text-tc-text-secondary">
                  Ask about verified fixings, British Standards, or pack counts.
                </p>
              </div>
              <div className="w-14 h-14 shrink-0 relative">
                <img
                  src="/images/3d/icons/icon-ai-robot.webp"
                  alt="ToolCart AI 3D Mascot"
                  className="w-full h-full object-contain drop-shadow-xs hover:scale-105 transition-transform"
                />
              </div>
            </div>
            <p className="text-[11px] font-bold text-tc-text-secondary uppercase tracking-wider">
              Popular questions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {STARTER_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-white border border-tc-border hover:border-tc-primary hover:text-tc-primary transition-colors text-tc-ink"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-[#C8D9F9] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about screws, tape adhesion, ladder safety..."
              className="flex-1 h-10 px-3 bg-tc-canvas border border-tc-border-strong rounded-lg text-xs text-tc-ink placeholder:text-tc-text-secondary focus:outline-none focus:ring-2 focus:ring-tc-primary"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading || !input.trim()}
              className="h-10 px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-[10px] text-tc-text-secondary mt-1.5 text-center">
            ToolCart AI answers using verified UK supplier catalog data. Always observe HSE & wiring regulations.
          </p>
        </div>
      </div>
    </div>
  );
}
