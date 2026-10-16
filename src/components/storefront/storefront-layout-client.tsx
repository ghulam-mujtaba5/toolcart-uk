'use client';

import React, { useState } from 'react';
import { Microbar } from './microbar';
import { Header } from './header';
import { NavBar } from './nav-bar';
import { Footer } from './footer';
import { CompareDrawer } from './compare-drawer';
import { MiniBasket } from './mini-basket';
import { AIAssistantDrawer } from './ai-assistant-drawer';
import { BottomNav } from './bottom-nav';
import { CookieConsentBanner } from './cookie-consent-banner';
import { CookiePreferencesModal } from './cookie-preferences-modal';

export function StorefrontLayoutClient({ children }: { children: React.ReactNode }) {
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-tc-canvas">
      <Microbar />
      <Header onOpenAiAssistant={() => setIsAiOpen(true)} />
      <NavBar />
      <main className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0">{children}</main>
      <CompareDrawer />
      <MiniBasket />
      <AIAssistantDrawer isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
      <BottomNav onOpenAiAssistant={() => setIsAiOpen(true)} />
      <Footer />
      <CookieConsentBanner />
      <CookiePreferencesModal />
    </div>
  );
}
