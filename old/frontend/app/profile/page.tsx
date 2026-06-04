'use client';

import Link from 'next/link';

export default function ProfilePage() {
  return (
    <main className="container" style={{ paddingTop: '60px', color: 'white' }}>
      <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>
        ← Back to Home
      </Link>

      <h1 style={{ marginTop: '20px', marginBottom: '40px' }}>👤 Player Profile</h1>

      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px' }}>
        <p>Profile coming soon...</p>
      </div>
    </main>
  );
}
