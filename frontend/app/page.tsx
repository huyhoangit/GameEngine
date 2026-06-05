'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="container" style={{ paddingTop: '60px' }}>
      <div style={{ textAlign: 'center', color: 'white', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}> Game Portal</h1>
        <p style={{ fontSize: '20px', opacity: 0.9 }}>
          Play classic games and challenge yourself
        </p>
      </div>

      <div className="grid">
        <Link href="/games" style={{ textDecoration: 'none' }}>
          <div className="card">
            <h2>Play Games</h2>
            <p>Browse and play all available games</p>
            <button className="btn btn-primary" style={{ marginTop: '15px' }}>
              Explore →
            </button>
          </div>
        </Link>

        <Link href="/achievements" style={{ textDecoration: 'none' }}>
          <div className="card">
            <h2>Achievements</h2>
            <p>View your achievements and progress</p>
            <button className="btn btn-primary" style={{ marginTop: '15px' }}>
              View →
            </button>
          </div>
        </Link>

        <Link href="/leaderboard" style={{ textDecoration: 'none' }}>
          <div className="card">
            <h2>Leaderboard</h2>
            <p>See top scores and rankings</p>
            <button className="btn btn-primary" style={{ marginTop: '15px' }}>
              Leaderboard →
            </button>
          </div>
        </Link>

        <Link href="/profile" style={{ textDecoration: 'none' }}>
          <div className="card">
            <h2>Profile</h2>
            <p>Your game statistics and profile</p>
            <button className="btn btn-primary" style={{ marginTop: '15px' }}>
              Profile →
            </button>
          </div>
        </Link>
      </div>
    </main>
  );
}
