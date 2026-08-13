import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = { title: 'Kasir 5 Menit - POS Pintar UMKM', description: 'Kasir online sederhana untuk UMKM F&B' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="id"><body className={`${inter.className} bg-slate-50 text-slate-800 antialiased`}>{children}</body></html>; }
