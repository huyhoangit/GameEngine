'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { gameAPI } from '@/lib/api';

const PikachuGameComponent = dynamic(() => import('@/components/PikachuGame'), {
  ssr: false,
  loading: () => <div style={{ color: 'white', padding: '60px 20px' }}>Loading game...</div>,
});

export default function GamePage({ params }: { params: { gameId: string } }) {
  const [gameData, setGameData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGame = async () => {
      try {
        const data = await gameAPI.getGame(params.gameId);
        setGameData(data);
      } catch (error) {
        console.error('Failed to load game:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [params.gameId]);

  if (loading) {
    return <div style={{ color: 'white', padding: '60px 20px' }}>Loading game...</div>;
  }

  return (
    <main style={{ minHeight: '100vh', paddingTop: '40px', paddingBottom: '40px' }}>
      <div style={{ color: 'white', marginBottom: '20px', paddingLeft: '20px' }}>
        <Link href="/games" style={{ color: 'white', textDecoration: 'none' }}>
          ← Back to Games
        </Link>
      </div>

      <Suspense fallback={<div style={{ color: 'white', textAlign: 'center' }}>Loading...</div>}>
        <PikachuGameComponent />
      </Suspense>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Link href="/games" style={{ textDecoration: 'none' }}>
          <button className="btn btn-secondary">Back to Games</button>
        </Link>
      </div>
    </main>
  );
}
