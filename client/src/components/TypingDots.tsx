import React from 'react';

/**
 * TypingDots Component
 * Displays an inline "GPT is thinking..." animation with three blinking dots.
 */
const TypingDots: React.FC = () => {
  return (
    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', paddingTop: '10px' }}>
      GPT is thinking
      <span className="typing-dots">
        {/* Animated blinking dots */}
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>

      {/* Inline style block to define staggered blink animation */}
      <style>
        {`
          .typing-dots span {
            display: inline-block;
            opacity: 0;
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
};

export default TypingDots;
