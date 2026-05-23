import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Someday — Save the things you want to do',
  description: 'Your visual wishlist for cafés, places, and products.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
