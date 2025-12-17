import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Wellgreens - Share Your Experience',
  description: 'Share your feedback and help us continue providing quality natural wellness products and exceptional service to our community.',
  metadataBase: new URL('https://rateus.wellgreens.store'),
  keywords: ['Wellgreens', 'customer reviews', 'natural wellness', 'feedback', 'customer experience'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
