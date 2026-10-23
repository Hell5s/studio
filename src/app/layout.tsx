import type {Metadata} from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/contexts/CartContext';

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], display: 'swap', variable: '--font-inter' });

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '700'], style: ['normal', 'italic'], display: 'swap', variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Toda Bela | Moda Feminina Moderna',
  description: 'Descubra looks modernos e elegantes para todas as ocasiões na Toda Bela.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
      </head>
      <body 
        className="font-sans antialiased bg-[#FFF9F7] text-[#2A1F22]" 
        style={{ overflowX: 'hidden' }}
      >
        <FirebaseClientProvider>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}