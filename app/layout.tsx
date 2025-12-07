import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Groupe de Chasse',
  description: 'Galerie de souvenirs et hall of fame de notre groupe de chasse',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-slate-50 text-hunting-slate">
        {children}
      </body>
    </html>
  );
}
