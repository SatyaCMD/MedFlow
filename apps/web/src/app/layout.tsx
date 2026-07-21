import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'MediCore 360 - Enterprise Hospital Management System',
  description: 'Enterprise EHMS platform for modern healthcare systems.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-slate-950">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

