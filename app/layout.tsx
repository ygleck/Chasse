import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Groupe de Chasse | Communauté de Chasseurs Passionnés',
  description: 'Partage de souvenirs mémorables, trophées exceptionnels et histoires de chasse. Galerie, Hall of Fame et modération pour notre groupe de chasse.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-hunting-cream text-hunting-slate">
        {children}
      </body>
    </html>
  );
}
