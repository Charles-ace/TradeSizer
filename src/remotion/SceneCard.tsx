import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface SceneData {
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  heroNumber?: string;
  heroLabel?: string;
  metrics: Array<{ label: string; value: string; color?: string }>;
  accentColor?: string;
}

export const SceneCard: React.FC<{ data: SceneData }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring animation
  const cardScale = spring({
    frame,
    fps,
    config: { damping: 18, mass: 0.8, stiffness: 120 },
  });

  const cardOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(frame, [0, 20], [40, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 10,
        width: 1080,
        background: 'rgba(13, 17, 26, 0.78)',
        backdropFilter: 'blur(30px) saturate(190%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.65), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)',
        borderRadius: 36,
        padding: '50px 60px',
        color: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        opacity: cardOpacity,
        transform: `translateY(${translateY}px) scale(${cardScale})`,
      }}
    >
      {/* Top Header Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: data.accentColor || '#38bdf8',
              boxShadow: `0 0 12px ${data.accentColor || '#38bdf8'}`,
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: 2.5,
              textTransform: 'uppercase',
              color: '#94a3b8',
            }}
          >
            TRADESIZER // RISK GOVERNANCE
          </span>
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            padding: '6px 16px',
            borderRadius: 9999,
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: data.badgeColor || '#38bdf8',
          }}
        >
          {data.badge}
        </span>
      </div>

      {/* Title & Subtitle */}
      <h1
        style={{
          fontSize: 48,
          fontWeight: 900,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          margin: 0,
          color: '#ffffff',
        }}
      >
        {data.title}
      </h1>
      <p
        style={{
          fontSize: 20,
          color: '#94a3b8',
          marginTop: 12,
          marginBottom: 36,
          lineHeight: 1.4,
        }}
      >
        {data.subtitle}
      </p>

      {/* Hero Number (if present) */}
      {data.heroNumber && (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 24,
            padding: '24px 32px',
            marginBottom: 32,
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.5 }}>
              {data.heroLabel || 'Calculated Metric'}
            </span>
            <div style={{ fontSize: 64, fontWeight: 900, fontFamily: 'monospace', color: '#ffffff', letterSpacing: '-0.02em', marginTop: 4 }}>
              {data.heroNumber}
            </div>
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              padding: '8px 18px',
              borderRadius: 14,
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
            }}
          >
            Verified Sizing
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data.metrics.length}, 1fr)`, gap: 16 }}>
        {data.metrics.map((m, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: 18,
              padding: '18px 22px',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
              {m.label}
            </span>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                fontFamily: 'monospace',
                color: m.color || '#ffffff',
                marginTop: 6,
              }}
            >
              {m.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
