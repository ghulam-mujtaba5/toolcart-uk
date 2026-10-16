'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { useVAT } from '@/context/vat-context';
import { Button } from '@/components/ui/button';
import { DragHandle } from '@/components/ui/drag-handle';
import { useSwipeToDismiss } from '@/hooks/use-swipe-to-dismiss';
import { X, Send, AlertTriangle, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PublicProductDTO } from '@/types/product';
import { AiScannerPulse } from '@/components/motion';
import { ChatbotRobot3DLazy } from '@/components/ui/3d';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  recommendedProducts?: PublicProductDTO[];
  safetyCaveat?: string;
  suggestedActions?: string[];
  projectPlan?: {
    title: string;
    steps: string[];
    estimatedMaterials?: { name: string; quantity: string }[];
  };
}

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIAssistantDrawer({ isOpen, onClose }: AIAssistantDrawerProps) {
  const { addItem } = useCart();
  const { formatPriceDisplay } = useVAT();

  const { sheetRef, style, dragHandleProps } = useSwipeToDismiss({
    onDismiss: onClose,
    threshold: 80,
    direction: 'down',
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedSkus, setAddedSkus] = useState<Record<string, boolean>>({});
  const [addedAllIdx, setAddedAllIdx] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am your ToolCart AI Technical Agent. I can help calculate fixing counts for projects, verify British Standards (BS 7671, BS EN IEC 60900, BS EN 14183), check trade specs, or assemble complete toolkits.',
      suggestedActions: [
        'Fixings for heavy shelving into brick',
        'BS 7671 safe electrical isolation tools',
        '3-step ladder duty rating & site access',
        'Crepe masking tape for clean paint lines',
      ],
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
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/store/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.reply,
          recommendedProducts: data.recommendedProducts || [],
          safetyCaveat: data.safetyCaveat,
          suggestedActions: data.suggestedActions || [],
          projectPlan: data.projectPlan,
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

  const handleAddProduct = (prod: PublicProductDTO) => {
    addItem(prod, 1, false, { openDrawer: false });
    setAddedSkus((prev) => ({ ...prev, [prod.supplier_sku]: true }));
    setTimeout(() => {
      setAddedSkus((prev) => ({ ...prev, [prod.supplier_sku]: false }));
    }, 2000);
  };

  const handleAddAllProducts = (products: PublicProductDTO[], messageIdx: number) => {
    products.forEach((prod) => addItem(prod, 1, false, { openDrawer: false }));
    setAddedAllIdx(messageIdx);
    setTimeout(() => {
      setAddedAllIdx(null);
    }, 2500);
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
        ref={sheetRef}
        style={style}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-assistant-title"
        className="relative w-full max-w-lg bg-tc-surface-soft h-full shadow-2xl flex flex-col z-10 border-l border-[#C8D9F9] animate-in slide-in-from-right-full duration-300"
      >
        {/* Tactile Grab Handle */}
        <div className="bg-white pt-1 border-b border-[#C8D9F9]/40 flex justify-center">
          <DragHandle {...dragHandleProps} />
        </div>

        {/* Header: Cobalt accent, Brand V3 */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#C8D9F9] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-tc-surface-soft border border-[#C8D9F9] p-0.5 flex items-center justify-center shadow-xs shrink-0 overflow-visible group">
              <ChatbotRobot3DLazy
                size={40}
                className="w-full h-full drop-shadow-xs group-hover:scale-110 transition-transform"
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
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-tc-text-secondary hover:text-tc-ink transition-colors"
            aria-label="Close AI assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto overscroll-y-contain p-4 sm:p-5 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={cn(
                'flex flex-col space-y-2 max-w-[95%]',
                m.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              )}
            >
              <div
                className={cn(
                  'p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs whitespace-pre-line',
                  m.role === 'user'
                    ? 'bg-tc-primary text-white rounded-br-xs'
                    : 'bg-white text-tc-ink border border-[#C8D9F9] rounded-bl-xs'
                )}
              >
                {m.content}
              </div>

              {/* Safety Caveat Callout */}
              {m.safetyCaveat && (
                <div className="p-3 rounded-xl bg-[#FFF7E8] border border-[#E8CB91] text-xs text-tc-ink flex items-start gap-2.5 shadow-xs w-full">
                  <AlertTriangle className="w-4 h-4 text-tc-warning shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-snug">
                    <span className="font-bold text-tc-ink">British Safety Standard Notice: </span>
                    <span className="text-tc-graphite">{m.safetyCaveat}</span>
                  </div>
                </div>
              )}

              {/* Project Plan & Estimation Breakdown Card */}
              {m.projectPlan && (
                <div className="w-full bg-white rounded-xl border border-tc-primary/30 p-3.5 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[#C8D9F9] pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-tc-primary animate-pulse" />
                      <h4 className="text-xs font-bold font-heading text-tc-ink">
                        {m.projectPlan.title || 'Project Method Statement & Estimator'}
                      </h4>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-tc-primary bg-tc-primary/10 px-2 py-0.5 rounded">
                      Trade Checklist
                    </span>
                  </div>

                  {m.projectPlan.steps && m.projectPlan.steps.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold text-tc-ink">Sequence of Work:</p>
                      <ul className="space-y-1 text-[11px] text-tc-graphite">
                        {m.projectPlan.steps.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-1.5">
                            <span className="text-tc-primary font-bold shrink-0">{sIdx + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {m.projectPlan.estimatedMaterials && m.projectPlan.estimatedMaterials.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-tc-border/60">
                      <p className="text-[11px] font-semibold text-tc-ink">Estimated Fixings & Materials:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                        {m.projectPlan.estimatedMaterials.map((mat, mIdx) => (
                          <div
                            key={mIdx}
                            className="p-1.5 bg-tc-canvas rounded border border-tc-border flex items-center justify-between"
                          >
                            <span className="truncate text-tc-graphite">{mat.name}</span>
                            <span className="font-mono font-bold text-tc-primary shrink-0 ml-1">
                              {mat.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recommended Catalog Products */}
              {m.recommendedProducts && m.recommendedProducts.length > 0 && (
                <div className="w-full space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-tc-primary uppercase tracking-wider">
                      Verified UK Catalog Products ({m.recommendedProducts.length})
                    </p>
                    {m.recommendedProducts.length > 1 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-[11px] h-7 px-2.5 font-bold"
                        onClick={() => handleAddAllProducts(m.recommendedProducts!, idx)}
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        <span>
                          {addedAllIdx === idx
                            ? 'All Added ✓'
                            : `Add All (${m.recommendedProducts.length})`}
                        </span>
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {m.recommendedProducts.map((prod) => {
                      const price = formatPriceDisplay(
                        prod.retail_price_inc_vat_gbp,
                        prod.retail_price_ex_vat_gbp
                      );
                      const isAdded = !!addedSkus[prod.supplier_sku];
                      return (
                        <div
                          key={prod.id}
                          className="p-3 bg-white rounded-xl border border-tc-border shadow-xs flex items-center justify-between gap-3 hover:border-tc-primary/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-tc-ink truncate">{prod.title}</p>
                            <div className="flex items-center gap-2 text-[11px] text-tc-text-secondary mt-0.5">
                              <span className="font-mono font-semibold">{prod.supplier_sku}</span>
                              <span>•</span>
                              <span className="font-semibold tabular-nums text-tc-ink">
                                {price.primaryText}
                              </span>
                              <span className="text-[10px] text-[#2C6E49] bg-[#E8F5E9] px-1.5 py-0.2 rounded font-semibold">
                                In Stock
                              </span>
                            </div>
                          </div>

                          <Button
                            variant={isAdded ? 'secondary' : 'primary'}
                            size="sm"
                            className="min-h-[44px] sm:min-h-[36px] text-xs px-3 shrink-0 flex items-center transition-all"
                            onClick={() => handleAddProduct(prod)}
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            <span>{isAdded ? 'Added ✓' : 'Add'}</span>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Suggested Action Chips */}
              {m.suggestedActions && m.suggestedActions.length > 0 && (
                <div className="w-full flex flex-wrap gap-1.5 pt-1.5">
                  {m.suggestedActions.map((action, aIdx) => (
                    <button
                      key={aIdx}
                      type="button"
                      disabled={loading}
                      onClick={() => handleSend(action)}
                      className="text-[11px] font-semibold text-tc-primary bg-white hover:bg-tc-surface-soft border border-[#C8D9F9] hover:border-tc-primary px-2.5 py-1.5 rounded-full shadow-2xs transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50 text-left"
                    >
                      <span>💬 {action}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="mr-auto p-4 rounded-2xl bg-white border border-[#C8D9F9] rounded-bl-xs text-xs text-tc-text-secondary flex items-center gap-3 shadow-xs">
              <AiScannerPulse size={40} className="shrink-0" />
              <div>
                <p className="font-bold text-tc-ink text-xs">Consulting UK Trade Knowledge & Standards...</p>
                <span className="text-[11px] text-tc-text-secondary">
                  Calculating project requirements across 115 live catalog lines with zero safety hallucinations
                </span>
              </div>
            </div>
          )}
        </div>




        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-[#C8D9F9] shrink-0 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
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
              className="flex-1 h-11 min-h-[44px] px-3.5 bg-tc-canvas border border-tc-border-strong rounded-lg text-base sm:text-xs text-tc-ink placeholder:text-tc-text-secondary focus:outline-none focus:ring-2 focus:ring-tc-primary"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading || !input.trim()}
              className="min-h-[44px] min-w-[44px] px-4 flex items-center justify-center"
              aria-label="Send message to AI assistant"
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
