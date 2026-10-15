'use client';

import React from 'react';
import dynamic from 'next/dynamic';

interface ChatbotRobot3DLazyProps {
  size?: number | string;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  autoRotate?: boolean;
  modelUrl?: string;
}

// Dynamically import the 3D WebGL component to completely isolate Three.js from SSR
export const ChatbotRobot3DLazy = dynamic(
  () => import('./chatbot-robot-3d').then((mod) => mod.ChatbotRobot3D),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <img
          src="/images/3d/icons/icon-ai-robot.webp"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-contain opacity-80"
        />
      </div>
    ),
  }
);

export default ChatbotRobot3DLazy;
