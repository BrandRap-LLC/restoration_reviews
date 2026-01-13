import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Restoration Logistics - Share Your Experience',
  description: 'Share your feedback and help us continue providing exceptional disaster restoration services to our community.',
  metadataBase: new URL('https://feedback.restoration-logistics.com'),
  keywords: ['Restoration Logistics', 'customer reviews', 'water damage', 'fire damage', 'restoration services', 'feedback'],
  robots: 'noindex, nofollow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
