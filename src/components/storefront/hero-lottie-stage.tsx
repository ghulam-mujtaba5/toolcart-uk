'use client';

import React, { useEffect, useState, useRef } from 'react';

export function HeroLottieStage() {
  const [animationData, setAnimationData] = useState<unknown | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch('/animations/hero-trade-tools.json')
      .then((res) => res.json())
      .then((data) => {
        setAnimationData(data);
        setIsLoaded(true);
      })
      .catch((err) => console.error('Failed to load hero Lottie animation:', err));
  }, []);

  return (
    <div className="relative w-full max-w-md lg:max-w-lg mx-auto aspect-square flex items-center justify-center">
      {/* Ambient glow backing in Brand V3 Cobalt & Action Lime */}
      <div className="absolute inset-0 bg-gradient-to-tr from-tc-cobalt/25 via-tc-cobalt/10 to-tc-action-lime/15 rounded-3xl filter blur-2xl transform scale-95 pointer-events-none" />

      {/* Precision Trade Hardware Glassmorphic HUD Stage */}
      <div className="relative w-full h-full rounded-2xl border border-white/15 bg-tc-ink/75 backdrop-blur-md p-4 sm:p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* HUD Top Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tc-action-lime animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-tc-action-lime font-bold">
              BS EN / UKCA Hardware Vector
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#DFE8F6]/70 uppercase tracking-widest">
            30 FPS · Vector
          </span>
        </div>

        {/* Lottie Animation Canvas Area */}
        <div className="relative flex-1 flex items-center justify-center my-2 overflow-hidden">
          {animationData && isLoaded ? (
            <LottieRenderer animationData={animationData} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-xs text-white/50 font-mono animate-pulse">
              <span className="w-6 h-6 border-2 border-tc-action-lime border-t-transparent rounded-full animate-spin" />
              <span>Loading Hardware Vector...</span>
            </div>
          )}
        </div>

        {/* Bottom Hardware Spec Pills */}
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/10 text-[10px] font-mono text-[#DFE8F6]/80 z-10 text-center font-bold">
          <div className="bg-white/5 border border-white/10 rounded px-1.5 py-1 text-tc-action-lime">
            CORDLESS DRILL
          </div>
          <div className="bg-white/5 border border-white/10 rounded px-1.5 py-1 text-tc-action-lime">
            SPIRIT LEVEL
          </div>
          <div className="bg-white/5 border border-white/10 rounded px-1.5 py-1 text-tc-action-lime">
            WALL PLUG
          </div>
          <div className="bg-white/5 border border-white/10 rounded px-1.5 py-1 text-tc-action-lime">
            STEEL TAPE
          </div>
        </div>
      </div>
    </div>
  );
}

function LottieRenderer({ animationData }: { animationData: unknown }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let anim: { destroy: () => void } | undefined;

    if (containerRef.current && animationData) {
      import('lottie-web').then((lottieModule) => {
        const lottie = lottieModule.default || lottieModule;
        if (containerRef.current) {
          anim = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: animationData as object,
          });
        }
      });
    }

    return () => {
      anim?.destroy();
    };
  }, [animationData]);

  return <div ref={containerRef} className="w-full h-full flex items-center justify-center" />;
}
