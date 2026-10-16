import React from 'react';
import { Composition } from 'remotion';
import { TradeSizerCommercial } from './TradeSizerCommercial';
import { TradeSizerComposition } from './Composition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 24-Second After Effects / DaVinci Resolve Master Commercial */}
      <Composition
        id="TradeSizerCommercial"
        component={TradeSizerCommercial}
        durationInFrames={720}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* 81-Second Deep-Dive Walkthrough Composition */}
      <Composition
        id="TradeSizerDemo"
        component={TradeSizerComposition}
        durationInFrames={2430}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
