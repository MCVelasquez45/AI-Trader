// ✅ Import React to define the component
import React from 'react';

/**
 * TypingDots Component
 * Shows a "GPT is thinking..." message with animated blinking dots.
 */
export default function TypingDots() {
  return (
    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', paddingTop: '10px' }}>
      GPT is thinking
      <span className="typing-dots">
        {/* Three animated dots */}
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>

      {/* Inline style block to define blinking animation */}
      <style>
        {`
          .typing-dots span {
            animation: blink 1.5s infinite;
          }

          .typing-dots span:nth-child(2) {
            animation-delay: 0.2s;
          }

          .typing-dots span:nth-child(3) {
            animation-delay: 0.4s;
          }

          @keyframes blink {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}
