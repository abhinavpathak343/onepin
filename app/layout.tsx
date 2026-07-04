import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import SessionProvider from './SessionProvider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'StreakIn - Sports Academy Check-in System',
  description: 'Build your streak, earn rewards, and stay motivated at your sports academy.',
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: 'StreakIn',
    description: 'Sports Academy Check-in System',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>
          {children}
          <Toaster position="top-center" />
        </SessionProvider>
      </body>
    </html>
  );
}
