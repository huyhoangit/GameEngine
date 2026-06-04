'use client';

import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { PikachuScene } from './PikachuScene';

const PikachuGameComponent = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth * 0.9,
      height: Math.min(window.innerHeight * 0.9, 700),
      parent: containerRef.current,
      backgroundColor: '#1a1a2e',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: PikachuScene,
      render: {
        pixelArt: false,
        antialias: true,
      },
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />;
};

export default PikachuGameComponent;
