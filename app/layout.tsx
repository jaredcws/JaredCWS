import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PwaRegister } from '@/components/PwaRegister';

export const metadata: Metadata = {
  title: 'SVOV Academy',
  description: 'Spec, Orchestrate, Verify learning platform'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="app-shell">
          <header className="topbar">
            <h1>SVOV Academy</h1>
            <p>Spec. Orchestrate. Verify.</p>
          </header>
          <PwaRegister />
          {children}
          <nav className="bottom-nav">
            <Link href="/">Modules</Link>
            <Link href="/vocab">Vocabulary</Link>
            <Link href="/benchmarks">Benchmarks</Link>
            <Link href="/admin">Admin</Link>
          </nav>
        </main>
      </body>
    </html>
  );
}
