import type { Metadata } from 'next';
import { Sora } from 'next/font/google';
import './globals.css';
import SessionExpiryModal from "./components/SessionExpiryModal";


const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KROWN BRAIDS — Book Your Perfect Hairstyle',
  description:
    'Premium braiding & beauty salons across the UK. Discover trusted stylists and book your appointment today.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={sora.variable}>
      <body className="font-body">{children}
      <SessionExpiryModal />
      </body>
    </html>
  );
}