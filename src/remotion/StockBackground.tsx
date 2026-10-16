import React from 'react';

interface StockBackgroundProps {
  frame: number;
  width?: number;
}

export const StockBackground: React.FC<StockBackgroundProps> = ({
  frame,
  width = 1920,
}) => {

  // Generate procedural candlestick data that shifts across frames
  const candleCount = 28;
  const candleWidth = 18;
  const gap = 38;

  // Slow pan offset
  const panOffset = (frame * 1.5) % 1200;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#07090e',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {/* Cinematic Cyber-Financial Grid */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.12,
        }}
      >
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#38bdf8" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Ambient Gradient Flares */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '10%',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.14) 0%, transparent 70%)',
          filter: 'blur(90px)',
          transform: `translate(${Math.sin(frame * 0.02) * 50}px, ${Math.cos(frame * 0.02) * 30}px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '15%',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
          filter: 'blur(110px)',
          transform: `translate(${Math.cos(frame * 0.015) * 60}px, ${Math.sin(frame * 0.015) * 40}px)`,
        }}
      />

      {/* Stock Candlestick Chart Layer */}
      <svg
        style={{
          position: 'absolute',
          bottom: 120,
          left: -100 - panOffset * 0.2,
          width: width + 500,
          height: 480,
          opacity: 0.28,
        }}
      >
        {Array.from({ length: candleCount }).map((_, i) => {
          // Deterministic pseudo-random seed based on index
          const seed = Math.sin(i * 99 + 42) * 10000;
          const isGreen = ((seed - Math.floor(seed)) * 10) > 4.5;
          const baseHeight = 50 + (Math.abs(Math.sin(i * 1.3)) * 160);
          const yOffset = 220 + Math.sin(i * 0.4 + frame * 0.03) * 60;
          const wickHeight = baseHeight + 35 + (Math.abs(Math.cos(i)) * 40);
          const x = i * (candleWidth + gap);

          return (
            <g key={i}>
              {/* Wick */}
              <line
                x1={x + candleWidth / 2}
                y1={yOffset - wickHeight / 2}
                x2={x + candleWidth / 2}
                y2={yOffset + wickHeight / 2}
                stroke={isGreen ? '#10b981' : '#f43f5e'}
                strokeWidth="1.5"
                opacity="0.7"
              />
              {/* Candle Body */}
              <rect
                x={x}
                y={yOffset - baseHeight / 2}
                width={candleWidth}
                height={baseHeight}
                rx="3"
                fill={isGreen ? '#10b981' : '#f43f5e'}
                opacity={isGreen ? 0.75 : 0.65}
              />
            </g>
          );
        })}
      </svg>

      {/* Floating Stock Ticker Horizon Bar */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 60px',
          color: 'rgba(255, 255, 255, 0.25)',
          fontFamily: 'monospace',
          fontSize: 13,
          letterSpacing: 2,
        }}
      >
        <span>TRADESIZER // INST_FEED // EURUSD: 1.08502 (+0.42%)</span>
        <span>XAUUSD: 2,652.80 (+1.18%)</span>
        <span>NAS100: 20,488.50 (-0.14%)</span>
        <span>BTCUSD: 89,450.00 (+2.35%)</span>
        <span>VOL_75: 412,850.20</span>
      </div>
    </div>
  );
};
