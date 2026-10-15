'use client';

import React, { useState } from 'react';
import { Microbar } from './microbar';
import { Header } from './header';
import { NavBar } from './nav-bar';
import { Footer } from './footer';
import { CompareDrawer } from './compare-drawer';
import { MiniBasket } from './mini-basket';
import { AIAssistantDrawer } from './ai-assistant-drawer';
import { AiAgentFloatingWidget } from './ai-agent-widget';

export function StorefrontLayoutClient({ children }: { children: React.ReactNode }) {
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-tc-canvas">
      <Microbar />
      <Header onOpenAiAssistant={() => setIsAiOpen(true)} />
      <NavBar />
      <main className="flex-1">{children}</main>
      <CompareDrawer />
      <MiniBasket />
      <AiAgentFloatingWidget onOpen={() => setIsAiOpen(true)} isOpen={isAiOpen} />
      <AIAssistantDrawer isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
      <Footer />
    </div>
  );
}
