import React from 'react';
import {
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
  Audio,
  OffthreadVideo,
} from 'remotion';

export const TradeSizerCommercial: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Anamorphic horizontal flare streak animation
  const flare1X = interpolate(frame, [0, 35], [-400, 2400], { extrapolateRight: 'clamp' });
  const flare1Opacity = interpolate(frame, [0, 15, 35], [0, 0.95, 0], { extrapolateRight: 'clamp' });

  const flare2X = interpolate(frame, [110, 145], [-400, 2400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const flare2Opacity = interpolate(frame, [110, 125, 145], [0, 0.9, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const flare3X = interpolate(frame, [440, 475], [-400, 2400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const flare3Opacity = interpolate(frame, [440, 455, 475], [0, 0.9, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const flare4X = interpolate(frame, [580, 615], [-400, 2400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const flare4Opacity = interpolate(frame, [580, 595, 615], [0, 0.95, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'relative',
        width: 1920,
        height: 1080,
        backgroundColor: '#05070b',
        color: '#f8fafc',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* ================= AUDIO CHANNELS ================= */}
      {/* 1. Master ElevenLabs Voiceover Narration (22.4s) */}
      <Audio
        src={staticFile('demo_assets/voice/tradesizer_brag_narration.mp3')}
        startFrom={0}
        volume={1.0}
      />

      {/* 2. Ende High-Energy Electronic Score (Ducked cleanly) */}
      <Audio
        src={staticFile('demo_assets/music/happy-beats-business-moves-vol-11-by-ende-dot-app.mp3')}
        startFrom={0}
        volume={0.24}
      />

      {/* 3. Tactile UI SFX & Sub-Impacts */}
      <Sequence from={114} durationInFrames={30}>
        <Audio src={staticFile('demo_assets/sfx/interface/switch_001.ogg')} volume={0.7} />
      </Sequence>
      <Sequence from={270} durationInFrames={30}>
        <Audio src={staticFile('demo_assets/sfx/interface/switch_001.ogg')} volume={0.7} />
      </Sequence>
      <Sequence from={350} durationInFrames={20}>
        <Audio src={staticFile('demo_assets/sfx/interface/click_001.ogg')} volume={0.8} />
      </Sequence>
      <Sequence from={515} durationInFrames={40}>
        <Audio src={staticFile('demo_assets/sfx/interface/bong_001.ogg')} volume={0.85} />
      </Sequence>
      <Sequence from={585} durationInFrames={60}>
        <Audio src={staticFile('demo_assets/sfx/impact/impactBell_heavy_000.ogg')} volume={0.9} />
      </Sequence>

      {/* ================= SCENE 1: HOOK (0 – 114 frames, 0.0s – 3.8s) ================= */}
      <Sequence from={0} durationInFrames={114}>
        <Scene1Hook frame={frame} fps={fps} />
      </Sequence>

      {/* ================= SCENE 2: MODEL A & 3R/2R-BANKED PARTIALS (114 – 270 frames, 3.8s – 9.0s) ================= */}
      <Sequence from={114} durationInFrames={156}>
        <Scene2ModelA frame={frame - 114} fps={fps} />
      </Sequence>

      {/* ================= SCENE 3: MULTI-ASSET TELEMETRY & BREAKEVEN (270 – 444 frames, 9.0s – 14.8s) ================= */}
      <Sequence from={270} durationInFrames={174}>
        <Scene3MultiAsset frame={frame - 270} fps={fps} />
      </Sequence>

      {/* ================= SCENE 4: 3D ORDER TICKET & INSTANT COPY (444 – 585 frames, 14.8s – 19.5s) ================= */}
      <Sequence from={444} durationInFrames={141}>
        <Scene4Ticket frame={frame - 444} fps={fps} />
      </Sequence>

      {/* ================= SCENE 5: OUTRO SLAM (585 – 720 frames, 19.5s – 24.0s) ================= */}
      <Sequence from={585} durationInFrames={135}>
        <Scene5Outro frame={frame - 585} fps={fps} />
      </Sequence>

      {/* ================= GLOBAL AFTER EFFECTS HUD OVERLAY ================= */}
      <div
        style={{
          position: 'absolute',
          top: 86,
          left: 60,
          right: 60,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'ui-monospace, monospace',
          fontSize: 13,
          letterSpacing: '0.15em',
          color: 'rgba(148, 163, 184, 0.85)',
          zIndex: 90,
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#10b981', fontWeight: 800 }}>[SYS:ONLINE]</span>
          <span>TRADESIZER RISK RUNTIME v2.0</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>//</span>
          <span>10/10 MATH TESTS VERIFIED</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ color: '#38bdf8' }}>EURUSD 1.08500 ▲</span>
          <span style={{ color: '#fbbf24' }}>XAUUSD 2342.10 ▲</span>
          <span style={{ color: '#f43f5e' }}>VOL75 428120.4 ▼</span>
          <span style={{ color: '#10b981' }}>LATENCY: 0.12ms</span>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 86,
          left: 60,
          right: 60,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'ui-monospace, monospace',
          fontSize: 13,
          letterSpacing: '0.15em',
          color: 'rgba(148, 163, 184, 0.85)',
          zIndex: 90,
          pointerEvents: 'none',
        }}
      >
        <div>DETERMINISTIC POSITION SIZING // MULTI-MODEL RISK GOVERNANCE</div>
        <div>STRICT LOT STEP FLOOR ENFORCED // BROKER MARGIN VALIDATED</div>
      </div>

      {/* Crosshair Corner Reticles */}
      <div style={{ position: 'absolute', top: 120, left: 60, width: 24, height: 24, borderTop: '2px solid rgba(16, 185, 129, 0.6)', borderLeft: '2px solid rgba(16, 185, 129, 0.6)', zIndex: 90, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 120, right: 60, width: 24, height: 24, borderTop: '2px solid rgba(16, 185, 129, 0.6)', borderRight: '2px solid rgba(16, 185, 129, 0.6)', zIndex: 90, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 120, left: 60, width: 24, height: 24, borderBottom: '2px solid rgba(16, 185, 129, 0.6)', borderLeft: '2px solid rgba(16, 185, 129, 0.6)', zIndex: 90, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 120, right: 60, width: 24, height: 24, borderBottom: '2px solid rgba(16, 185, 129, 0.6)', borderRight: '2px solid rgba(16, 185, 129, 0.6)', zIndex: 90, pointerEvents: 'none' }} />

      {/* ================= DAVINCI RESOLVE ANAMORPHIC FLARES ================= */}
      {flare1Opacity > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '46%',
            left: flare1X,
            width: 700,
            height: 10,
            background: 'linear-gradient(90deg, transparent, #10b981, #38bdf8, transparent)',
            filter: 'blur(5px)',
            boxShadow: '0 0 50px #10b981, 0 0 100px #38bdf8',
            opacity: flare1Opacity,
            zIndex: 99,
            pointerEvents: 'none',
            transform: 'rotate(-6deg)',
          }}
        />
      )}
      {flare2Opacity > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '48%',
            left: flare2X,
            width: 700,
            height: 10,
            background: 'linear-gradient(90deg, transparent, #38bdf8, #10b981, transparent)',
            filter: 'blur(5px)',
            boxShadow: '0 0 50px #38bdf8, 0 0 100px #10b981',
            opacity: flare2Opacity,
            zIndex: 99,
            pointerEvents: 'none',
            transform: 'rotate(-5deg)',
          }}
        />
      )}
      {flare3Opacity > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: flare3X,
            width: 700,
            height: 10,
            background: 'linear-gradient(90deg, transparent, #10b981, #fbbf24, transparent)',
            filter: 'blur(5px)',
            boxShadow: '0 0 50px #10b981, 0 0 100px #fbbf24',
            opacity: flare3Opacity,
            zIndex: 99,
            pointerEvents: 'none',
            transform: 'rotate(-6deg)',
          }}
        />
      )}
      {flare4Opacity > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '45%',
            left: flare4X,
            width: 800,
            height: 12,
            background: 'linear-gradient(90deg, transparent, #10b981, #34d399, transparent)',
            filter: 'blur(6px)',
            boxShadow: '0 0 60px #10b981, 0 0 120px #34d399',
            opacity: flare4Opacity,
            zIndex: 99,
            pointerEvents: 'none',
            transform: 'rotate(-5deg)',
          }}
        />
      )}

      {/* ================= DAVINCI RESOLVE 2.39:1 ANAMORPHIC LETTERBOX ================= */}
      {/* Top Black Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 72,
          backgroundColor: '#000000',
          borderBottom: '1px solid rgba(16, 185, 129, 0.35)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.9)',
          zIndex: 100,
        }}
      />
      {/* Bottom Black Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 72,
          backgroundColor: '#000000',
          borderTop: '1px solid rgba(16, 185, 129, 0.35)',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.9)',
          zIndex: 100,
        }}
      />
    </div>
  );
};

/* =========================================================================
   SCENE 1: HOOK (0 – 114 frames, 0.0s – 3.8s)
   Stock B-roll of Frankfurt Trading Floor + Kinetic Typography Slam
   ========================================================================= */
const Scene1Hook: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = interpolate(frame, [0, 114], [1.0, 1.08]);
  const titleY = interpolate(frame, [0, 15], [40, 0], { extrapolateRight: 'clamp' });
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  
  const glitch = frame > 45 && frame < 55;
  const redTitleScale = spring({
    frame: frame - 40,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Authentic DaVinci-Graded Frankfurt Stock Exchange B-Roll */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <OffthreadVideo
          src={staticFile('demo_assets/stock_clips/stock_01_exchange_wide.mp4')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.35) contrast(1.28) saturate(1.22)',
          }}
        />
      </div>

      {/* Obsidian Vignette Gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(5,7,11,0.4) 0%, rgba(5,7,11,0.92) 80%)',
        }}
      />

      {/* 3D Kinetic Hook Content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '8px 26px',
            backgroundColor: 'rgba(16, 185, 129, 0.16)',
            border: '1px solid rgba(16, 185, 129, 0.5)',
            borderRadius: 9999,
            fontFamily: 'ui-monospace, monospace',
            fontSize: 14,
            fontWeight: 800,
            color: '#34d399',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 28,
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.35)',
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 14px #10b981' }} />
          INSTITUTIONAL RISK ARCHITECTURE
        </div>

        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: '#ffffff',
            textTransform: 'uppercase',
            textShadow: '0 10px 40px rgba(0,0,0,0.8)',
          }}
        >
          Trading Without Precise Math
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: '#ffffff',
            textTransform: 'uppercase',
            textShadow: '0 10px 40px rgba(0,0,0,0.8)',
          }}
        >
          Isn't Risk Management.
        </div>

        <div
          style={{
            fontSize: 92,
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: '#f43f5e',
            textTransform: 'uppercase',
            marginTop: 10,
            textShadow: '0 0 50px rgba(244, 63, 94, 0.75)',
            transform: glitch ? 'scale(1.04) skewX(-4deg)' : `scale(${Math.max(1, redTitleScale)})`,
          }}
        >
          It's Gambling.
        </div>

        {/* Brand Reveal Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginTop: 38,
            padding: '16px 36px',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 24,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(16, 185, 129, 0.2)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.7)',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="18" rx="4" />
              <path d="M7 10h10" />
              <path d="M7 14h6" />
            </svg>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#ffffff' }}>TradeSizer</div>
            <div style={{ fontSize: 14, color: '#94a3b8', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.1em' }}>
              DETERMINISTIC POSITION SIZING &amp; RISK ENGINE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   SCENE 2: MODEL A & 3R/2R-BANKED PARTIAL EXIT (114 – 270 frames, 3.8s – 9.0s)
   Combines live app recording inside a 3D Apple Pro display + Motion Tracking HUD
   ========================================================================= */
const Scene2ModelA: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const cardScale = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  const hudSlide = interpolate(frame, [0, 20], [60, 0], { extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Background DaVinci Graded Stock Footage */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <OffthreadVideo
          src={staticFile('demo_assets/stock_clips/stock_02_workstations.mp4')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.24) blur(5px) contrast(1.25)',
          }}
        />
      </div>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(5, 7, 11, 0.75)' }} />

      {/* Main Split Stage */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 80px',
          gap: 50,
          zIndex: 10,
        }}
      >
        {/* Left: 3D Floating Apple Display with REAL App Recording */}
        <div
          style={{
            width: 920,
            height: 580,
            borderRadius: 24,
            overflow: 'hidden',
            backgroundColor: '#0a0d14',
            border: '2px solid rgba(255, 255, 255, 0.16)',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85), 0 0 50px rgba(16, 185, 129, 0.25)',
            transform: `perspective(1400px) rotateY(-6deg) rotateX(3deg) scale(${cardScale})`,
            position: 'relative',
          }}
        >
          {/* Top Display Bezel Bar */}
          <div
            style={{
              height: 38,
              backgroundColor: '#111827',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              gap: 8,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981' }} />
            <div style={{ marginLeft: 16, fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#94a3b8' }}>
              TradeSizer — Model A: Confirmation Setup (Live Interaction)
            </div>
          </div>

          {/* Real Screen Recording of Actual App in Use */}
          <div style={{ width: '100%', height: 'calc(100% - 38px)', overflow: 'hidden' }}>
            <OffthreadVideo
              src={staticFile('demo_assets/tradesizer_live_app_recording.mp4')}
              startFrom={0}
              endAt={156}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top left',
              }}
            />
          </div>

          {/* Interactive Bounding Box Indicator */}
          <div
            style={{
              position: 'absolute',
              top: 130,
              left: 40,
              width: 280,
              height: 60,
              border: '2px dashed #10b981',
              borderRadius: 12,
              pointerEvents: 'none',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)',
              opacity: interpolate(frame, [15, 30], [0, 1], { extrapolateRight: 'clamp' }),
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: -12,
                left: 12,
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontSize: 10,
                fontWeight: 900,
                fontFamily: 'ui-monospace, monospace',
                padding: '2px 8px',
                borderRadius: 4,
              }}
            >
              SELECTED: MODEL A (0.75%)
            </span>
          </div>
        </div>

        {/* Right: Motion Graphics HUD Breakdown Cards */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            transform: `translateX(${hudSlide}px)`,
          }}
        >
          {/* Header Card */}
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 20,
              padding: '24px 30px',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#ffffff' }}>Model A: Confirmation</div>
                <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>Account Equity: $25,000 USD // 15 Pips Stop</div>
              </div>
              <div
                style={{
                  padding: '6px 16px',
                  borderRadius: 9999,
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.5)',
                  color: '#34d399',
                  fontFamily: 'ui-monospace, monospace',
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                1.25 Standard Lots
              </div>
            </div>
          </div>

          {/* 3R Trigger Card */}
          <div
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.75)',
              border: '1px solid rgba(96, 165, 250, 0.35)',
              borderRadius: 18,
              padding: '20px 26px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#93c5fd' }}>3R Partial Target (First Exit)</div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>Close 66.67% of lot size (0.83 Lots)</div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#60a5fa', fontFamily: 'ui-monospace, monospace' }}>
              +$375.00 <span style={{ fontSize: 16, color: '#93c5fd' }}>(+2.00R Banked)</span>
            </div>
          </div>

          {/* 4R Final Card */}
          <div
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.75)',
              border: '1px solid rgba(52, 211, 153, 0.35)',
              borderRadius: 18,
              padding: '20px 26px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#a7f3d0' }}>4R Final Target (Runner)</div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>Remaining 33.33% runs (0.42 Lots)</div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#34d399', fontFamily: 'ui-monospace, monospace' }}>
              +$250.00 <span style={{ fontSize: 16, color: '#a7f3d0' }}>(+1.33R Added)</span>
            </div>
          </div>

          {/* Full Win Reality Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.28) 0%, rgba(5, 150, 105, 0.15) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.6)',
              borderRadius: 20,
              padding: '22px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 0 35px rgba(16, 185, 129, 0.3)',
            }}
          >
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#34d399' }}>Full Win Reality</div>
              <div style={{ fontSize: 13, color: '#d1fae5' }}>Mathematically realized profit</div>
            </div>
            <div style={{ fontSize: 34, fontWeight: 900, color: '#34d399', fontFamily: 'ui-monospace, monospace' }}>
              +$625.00 <span style={{ fontSize: 22, color: '#a7f3d0' }}>(3.33R)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   SCENE 3: MULTI-ASSET PARAMETERS & BREAKEVEN (270 – 444 frames, 9.0s – 14.8s)
   Shows Stop Distance 25 pips -> 0.75 lots + Breakeven Toggle Switch
   ========================================================================= */
const Scene3MultiAsset: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const cardScale = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Background DaVinci Stock Footage */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <OffthreadVideo
          src={staticFile('demo_assets/stock_clips/stock_03_tickers.mp4')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.24) blur(4px) contrast(1.22)',
          }}
        />
      </div>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(5, 7, 11, 0.78)' }} />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 80px',
          zIndex: 10,
        }}
      >
        {/* Ticker Selector Ribbon */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 26 }}>
          <div style={{ padding: '10px 24px', borderRadius: 14, backgroundColor: 'rgba(59, 130, 246, 0.25)', border: '1px solid rgba(59, 130, 246, 0.65)', color: '#60a5fa', fontWeight: 800, fontFamily: 'ui-monospace, monospace', fontSize: 16 }}>
            EURUSD (Forex)
          </div>
          <div style={{ padding: '10px 24px', borderRadius: 14, backgroundColor: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', fontWeight: 700, fontFamily: 'ui-monospace, monospace', fontSize: 16 }}>
            XAUUSD (Gold)
          </div>
          <div style={{ padding: '10px 24px', borderRadius: 14, backgroundColor: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', fontWeight: 700, fontFamily: 'ui-monospace, monospace', fontSize: 16 }}>
            NAS100 (Index)
          </div>
          <div style={{ padding: '10px 24px', borderRadius: 14, backgroundColor: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', fontWeight: 700, fontFamily: 'ui-monospace, monospace', fontSize: 16 }}>
            BTCUSD (Crypto)
          </div>
          <div style={{ padding: '10px 24px', borderRadius: 14, backgroundColor: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', fontWeight: 700, fontFamily: 'ui-monospace, monospace', fontSize: 16 }}>
            VOLATILITY 75 (Synthetics)
          </div>
        </div>

        {/* 2-Column Terminal Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, width: 1480 }}>
          {/* Left: Real App Interaction Recording */}
          <div
            style={{
              height: 480,
              borderRadius: 22,
              overflow: 'hidden',
              backgroundColor: '#0a0d14',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(59, 130, 246, 0.2)',
              transform: `scale(${cardScale})`,
              position: 'relative',
            }}
          >
            <div
              style={{
                height: 36,
                backgroundColor: '#111827',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                gap: 8,
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981' }} />
              <div style={{ marginLeft: 16, fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#94a3b8' }}>
                TradeSizer — 25.0 Pips Stop Loss &amp; Breakeven Protection
              </div>
            </div>
            <div style={{ width: '100%', height: 'calc(100% - 36px)', overflow: 'hidden' }}>
              <OffthreadVideo
                src={staticFile('demo_assets/tradesizer_live_app_recording.mp4')}
                startFrom={80}
                endAt={254}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Right: Telemetry & Breakeven Governance Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(16, 185, 129, 0.45)',
                borderRadius: 22,
                padding: '30px',
                boxShadow: '0 0 35px rgba(16, 185, 129, 0.2)',
              }}
            >
              <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13, color: '#34d399', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                OUTPUT: NORMALIZED POSITION SIZE
              </div>
              <div style={{ fontSize: 72, fontWeight: 900, color: '#ffffff', lineHeight: 1.1, marginTop: 8 }}>
                0.75 <span style={{ fontSize: 32, color: '#94a3b8', fontWeight: 700 }}>Standard Lots</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'ui-monospace, monospace' }}>STOP DISTANCE</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>25.0 Pips</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'ui-monospace, monospace' }}>MAX RISK BUDGET</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#f43f5e', marginTop: 4 }}>-$187.50 (0.75%)</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'ui-monospace, monospace' }}>MARGIN REQUIRED</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#38bdf8', marginTop: 4 }}>$750.00 (Pass)</div>
                </div>
              </div>
            </div>

            {/* Breakeven Toggle Governance */}
            <div
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.75)',
                border: '1px solid rgba(251, 191, 36, 0.4)',
                borderRadius: 20,
                padding: '24px 28px',
                boxShadow: '0 0 30px rgba(251, 191, 36, 0.15)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#fbbf24' }}>Move Stop to Breakeven Active</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>Locks in guaranteed worst-case floor after partial</div>
                </div>
                <div style={{ padding: '6px 14px', borderRadius: 9999, backgroundColor: 'rgba(251, 191, 36, 0.2)', color: '#fde68a', fontWeight: 800, fontSize: 14 }}>
                  ON
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: 15, color: '#ffffff' }}>Breakeven Stopped Case:</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#34d399', fontFamily: 'ui-monospace, monospace' }}>
                  +$375.00 (+2.00R Protected)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   SCENE 4: 3D ORDER TICKET & INSTANT COPY (444 – 585 frames, 14.8s – 19.5s)
   Live button click with tactile feedback and ticket verification
   ========================================================================= */
const Scene4Ticket: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const cardScale = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const copied = frame > 70;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Background DaVinci Stock Footage */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <OffthreadVideo
          src={staticFile('demo_assets/stock_clips/stock_04_trading_floor.mp4')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.25) blur(4px) contrast(1.25)',
          }}
        />
      </div>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(5, 7, 11, 0.8)' }} />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        {/* 3D Glass Order Ticket */}
        <div
          style={{
            width: 1080,
            padding: '42px 50px',
            backgroundColor: 'rgba(13, 20, 36, 0.88)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85), 0 0 50px rgba(16, 185, 129, 0.25)',
            borderRadius: 28,
            backdropFilter: 'blur(30px)',
            transform: `perspective(1400px) rotateX(5deg) scale(${cardScale})`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14, color: '#34d399', letterSpacing: '0.12em' }}>
                ORDER EXECUTION TICKET // DETERMINISTIC EXPORT
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>
                BUY EURUSD — 0.75 LOTS
              </div>
            </div>
            <div
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: 14,
                fontWeight: 700,
                padding: '8px 20px',
                borderRadius: 9999,
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.5)',
                color: '#34d399',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
              }}
            >
              VERIFIED READY
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, margin: '26px 0' }}>
            <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.55)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: '16px 22px' }}>
              <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#94a3b8' }}>ENTRY PRICE</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>1.08500</div>
            </div>
            <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.55)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: '16px 22px' }}>
              <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#94a3b8' }}>STOP LOSS (25.0 PIPS)</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#f43f5e', marginTop: 4 }}>1.08250 <span style={{ fontSize: 16, color: '#94a3b8' }}>(-$187.50)</span></div>
            </div>
            <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.55)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: '16px 22px' }}>
              <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#94a3b8' }}>TAKE PROFIT 1 (3R PARTIAL)</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#60a5fa', marginTop: 4 }}>1.09250 <span style={{ fontSize: 16, color: '#94a3b8' }}>(Close 0.50 L)</span></div>
            </div>
            <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.55)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: '16px 22px' }}>
              <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#94a3b8' }}>TAKE PROFIT 2 (4R RUNNER)</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#34d399', marginTop: 4 }}>1.09500 <span style={{ fontSize: 16, color: '#94a3b8' }}>(Close 0.25 L)</span></div>
            </div>
          </div>

          {/* Action Button */}
          <div
            style={{
              width: '100%',
              padding: '22px',
              borderRadius: 18,
              background: copied
                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#ffffff',
              boxShadow: copied ? '0 0 50px rgba(16, 185, 129, 0.8)' : '0 15px 40px rgba(16, 185, 129, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              transition: 'all 0.2s ease',
            }}
          >
            {copied ? (
              <>
                <span style={{ fontSize: 26 }}>✓</span>
                <span>Copied to Clipboard! Ready for MT4 / MT5</span>
              </>
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Copy Trade Setup</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   SCENE 5: OUTRO SLAM (585 – 720 frames, 19.5s – 24.0s)
   Final Cinematic Resolution & Product Call to Action
   ========================================================================= */
const Scene5Outro: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const scale = spring({ frame, fps, config: { damping: 14, stiffness: 130 } });

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Background DaVinci Stock Footage */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <OffthreadVideo
          src={staticFile('demo_assets/stock_clips/stock_01_exchange_wide.mp4')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.28) contrast(1.3) saturate(1.15)',
          }}
        />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(5,7,11,0.6) 0%, #05070b 85%)' }} />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          zIndex: 10,
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 24,
            background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 26,
            boxShadow: '0 0 45px rgba(16, 185, 129, 0.75)',
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="18" rx="4" />
            <path d="M7 10h10" />
            <path d="M7 14h6" />
          </svg>
        </div>

        <div
          style={{
            fontSize: 84,
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            color: '#ffffff',
            textTransform: 'uppercase',
          }}
        >
          Trade The Math.
        </div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            color: '#10b981',
            textTransform: 'uppercase',
            textShadow: '0 0 50px rgba(16, 185, 129, 0.75)',
          }}
        >
          Not The Emotion.
        </div>

        <div style={{ fontSize: 26, fontWeight: 800, color: '#ffffff', marginTop: 18 }}>
          TradeSizer
        </div>
        <div style={{ fontSize: 16, color: '#94a3b8', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.12em', marginTop: 4 }}>
          INSTITUTIONAL POSITION SIZING &amp; RISK ARCHITECTURE
        </div>

        <div style={{ display: 'flex', gap: 18, marginTop: 36 }}>
          <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 15, fontWeight: 700, padding: '10px 22px', borderRadius: 9999, backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#f1f5f9' }}>
            <span style={{ color: '#10b981', marginRight: 6 }}>✓</span> 10/10 Math Verified
          </div>
          <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 15, fontWeight: 700, padding: '10px 22px', borderRadius: 9999, backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#f1f5f9' }}>
            <span style={{ color: '#10b981', marginRight: 6 }}>✓</span> 4 Trading Models
          </div>
          <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 15, fontWeight: 700, padding: '10px 22px', borderRadius: 9999, backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#f1f5f9' }}>
            <span style={{ color: '#10b981', marginRight: 6 }}>✓</span> Multi-Asset Contract Specs
          </div>
          <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 15, fontWeight: 700, padding: '10px 22px', borderRadius: 9999, backgroundColor: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#f1f5f9' }}>
            <span style={{ color: '#10b981', marginRight: 6 }}>✓</span> Production Ready
          </div>
        </div>
      </div>
    </div>
  );
};
