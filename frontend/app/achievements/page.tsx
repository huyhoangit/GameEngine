'use client';

import Link from 'next/link';

export default function AchievementsPage() {
  return (
    <main className="container" style={{ paddingTop: '60px', color: 'white' }}>
      <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>
        ← Back to Home
      </Link>

      <h1 style={{ marginTop: '20px', marginBottom: '40px' }}>🏆 Achievements</h1>

      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px' }}>
        <p>Achievements coming soon...</p>
      </div>
    </main>
  );
}
