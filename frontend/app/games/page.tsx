'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { frontendGameLoader } from '@/lib/gameLoader';
import type { GameMetadata } from '@/../shared/IGame';

export default function GamesPage() {
  const [games, setGames] = useState<GameMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGames = async () => {
      try {
        await frontendGameLoader.initialize();
        setGames(frontendGameLoader.getAllGames());
      } catch (error) {
        console.error('Failed to load games:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  if (loading) {
    return (
      <main className="container" style={{ paddingTop: '60px', color: 'white' }}>
        <h1>Loading games...</h1>
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: '60px' }}>
      <div style={{ color: 'white', marginBottom: '40px' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>
          ← Back to Home
        </Link>
        <h1 style={{ fontSize: '40px', marginTop: '20px' }}>Available Games</h1>
      </div>

      <div className="grid">
        {games.map((game) => (
          <Link key={game.id} href={`/games/${game.id}`} style={{ textDecoration: 'none' }}>
            <div className="card">
              <h2>{game.name}</h2>
              {/* <p>{game.description}</p> */}
              <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                v{game.version}
              </p>
              <button className="btn btn-primary" style={{ marginTop: '15px' }}>
                Play
              </button>
            </div>
          </Link>
        ))}
      </div>

      {games.length === 0 && (
        <div style={{ color: 'white', textAlign: 'center', marginTop: '60px' }}>
          <p style={{ fontSize: '18px' }}>No games available yet.</p>
        </div>
      )}
    </main>
  );
}
