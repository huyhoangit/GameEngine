import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Game Portal - Classic Games',
  description: 'Play classic games in the Game Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div className="app-container">
          {children}
        </div>
      </body>
    </html>
  );
}
