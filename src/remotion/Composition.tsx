import React from 'react';
import { Sequence, useCurrentFrame, Audio, staticFile } from 'remotion';
import { StockBackground } from './StockBackground';
import { SceneCard } from './SceneCard';

// 7 Definitive TradeSizer Scenes
const SCENES = [
  {
    id: 'scene_01_intro',
    durationInFrames: 240, // 8 sec
    audio: 'demo_assets/scene_01_intro_elevenlabs.mp3',
    card: {
      title: 'TradeSizer: Precision Risk Engine',
      subtitle: 'Deterministic Position Sizing & Multi-Model Risk Governance for Institutional Traders.',
      badge: 'Platform Architecture',
      badgeColor: '#38bdf8',
      heroNumber: '$25,000 USD',
      heroLabel: 'Baseline Starting Account Equity',
      accentColor: '#38bdf8',
      metrics: [
        { label: 'Trading Models', value: '4 Models (A, B, C, D)', color: '#38bdf8' },
        { label: 'Supported Markets', value: 'Forex, Metals, Synthetics, Crypto', color: '#10b981' },
        { label: 'Execution Policy', value: 'Strict Volume Floor', color: '#f59e0b' },
      ],
    },
  },
  {
    id: 'scene_02_model_a',
    durationInFrames: 450, // 15 sec
    audio: 'demo_assets/scene_02_model_a_elevenlabs.mp3',
    card: {
      title: 'Model A: Confirmation System',
      subtitle: 'Allocates a strict 0.75% equity risk budget with a 15-pip stop on EURUSD.',
      badge: 'Model A (0.75% Risk)',
      badgeColor: '#60a5fa',
      heroNumber: '1.25 Lots',
      heroLabel: 'Calculated Position Size (EURUSD)',
      accentColor: '#60a5fa',
      metrics: [
        { label: 'Account Balance', value: '$25,000.00', color: '#ffffff' },
        { label: '1R Risk Budget', value: '-$187.50 (0.75%)', color: '#f43f5e' },
        { label: 'Stop Distance', value: '15.0 Pips', color: '#38bdf8' },
      ],
    },
  },
  {
    id: 'scene_03_partials',
    durationInFrames: 450, // 15 sec
    audio: 'demo_assets/scene_03_partials_elevenlabs.mp3',
    card: {
      title: 'Derived Partial Exits (Models A & B)',
      subtitle: 'Close 66.67% (2R/3R) at 3R to bank 2R profit. Remainder runs to 4R, yielding 3.33R full win.',
      badge: '4R Multi-Stage Exit',
      badgeColor: '#34d399',
      heroNumber: '+$625.00',
      heroLabel: 'Full Target Win (3.33R Net Return)',
      accentColor: '#34d399',
      metrics: [
        { label: '3R Trigger Partial', value: 'Close 0.83 Lots -> Bank +$375 (2R)', color: '#60a5fa' },
        { label: '4R Final Remainder', value: 'Run 0.42 Lots -> Add +$250 (1.33R)', color: '#34d399' },
        { label: 'Reference Unadjusted', value: '$750.00 (Plain 4R)', color: '#64748b' },
      ],
    },
  },
  {
    id: 'scene_04_breakeven',
    durationInFrames: 360, // 12 sec
    audio: 'demo_assets/scene_04_breakeven_elevenlabs.mp3',
    card: {
      title: 'Post-Partial Risk Management',
      subtitle: 'Toggle Move Stop to Breakeven to dynamically inspect worst-case trade outcomes.',
      badge: 'Risk Governance Toggle',
      badgeColor: '#fbbf24',
      heroNumber: '+$375.00',
      heroLabel: 'Worst-Case Breakeven Floor (2R Banked)',
      accentColor: '#fbbf24',
      metrics: [
        { label: 'BE Stopped Case', value: '+$375.00 (2.00R Protected)', color: '#60a5fa' },
        { label: 'Original Stop Case', value: '+$312.50 (1.67R Retained)', color: '#fbbf24' },
        { label: 'Strict Volume Step', value: 'Volume Rounded Down', color: '#10b981' },
      ],
    },
  },
  {
    id: 'scene_05_model_c',
    durationInFrames: 300, // 10 sec
    audio: 'demo_assets/scene_05_model_c_elevenlabs.mp3',
    card: {
      title: 'Models C & D: Pure Risk Systems',
      subtitle: 'Enforces a strict 0.50% risk budget with a single full exit at 3R and zero partials.',
      badge: 'Models C & D (0.50% Risk)',
      badgeColor: '#c084fc',
      heroNumber: '+$375.00',
      heroLabel: 'Headline Target Profit (3.0R)',
      accentColor: '#c084fc',
      metrics: [
        { label: '1R Risk Budget', value: '-$125.00 (0.50%)', color: '#f43f5e' },
        { label: 'Reward-to-Risk', value: '3.0 : 1', color: '#34d399' },
        { label: 'Partial Policy', value: 'No Partials Allowed', color: '#c084fc' },
      ],
    },
  },
  {
    id: 'scene_06_multi_asset',
    durationInFrames: 360, // 12 sec
    audio: 'demo_assets/scene_06_multi_asset_elevenlabs.mp3',
    card: {
      title: 'Multi-Asset Specifications & Margin Guard',
      subtitle: 'Native support for Forex, Gold, NASDAQ, Deriv Synthetics, and Bitcoin with live margin check.',
      badge: 'Institutional Multi-Asset',
      badgeColor: '#f43f5e',
      heroNumber: '1:100 Leverage',
      heroLabel: 'Automated Margin & Adequate Capital Verification',
      accentColor: '#f43f5e',
      metrics: [
        { label: 'BTCUSD & Gold', value: 'Dynamic Tick Scaling', color: '#f59e0b' },
        { label: 'Deriv Synthetics', value: 'Vol 75 / Crash / Boom', color: '#38bdf8' },
        { label: 'Trading Costs', value: 'Spread & Commission Net Sizing', color: '#10b981' },
      ],
    },
  },
  {
    id: 'scene_07_ticket',
    durationInFrames: 270, // 9 sec
    audio: 'demo_assets/scene_07_ticket_elevenlabs.mp3',
    card: {
      title: 'Execution Order Ticket Export',
      subtitle: '1-click copy exports a clean, verified order ticket ready for MT4/MT5, cTrader, or trading journals.',
      badge: 'Order Execution Ticket',
      badgeColor: '#10b981',
      heroNumber: 'Instant Copy',
      heroLabel: 'Deterministic Ticket Export',
      accentColor: '#10b981',
      metrics: [
        { label: 'Precision Rounding', value: 'Floor(Lots, Step)', color: '#38bdf8' },
        { label: 'Trade Journal Ready', value: 'Formatted ASCII Ticket', color: '#10b981' },
        { label: 'Open Source', value: 'TypeScript + React 19', color: '#ffffff' },
      ],
    },
  },
];

export const TradeSizerComposition: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#07090e',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background Cinematic Stock Video Atmosphere */}
      <StockBackground frame={frame} />

      {/* Render Scenes in sequence with ElevenLabs voiceovers */}
      {(() => {
        let cumulativeFrames = 0;
        return SCENES.map((scene) => {
          const from = cumulativeFrames;
          cumulativeFrames += scene.durationInFrames;

          return (
            <Sequence key={scene.id} from={from} durationInFrames={scene.durationInFrames}>
              {/* Voiceover audio track */}
              <Audio src={staticFile(scene.audio)} />
              {/* Scene Visual Card */}
              <SceneCard data={scene.card} />
            </Sequence>
          );
        });
      })()}
    </div>
  );
};
