import Link from 'next/link';

/**
 * Footer component
 */
export function Footer() {
  return (
    <footer className="hunting-header text-white py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-2">Groupe de Chasse</h3>
            <p className="text-hunting-accent text-sm">
              Partage de souvenirs et records de notre communauté de chasseurs.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Navigation</h3>
            <ul className="text-sm space-y-1">
              <li><Link href="/" className="hover:text-hunting-orange transition-colors">Accueil</Link></li>
              <li><Link href="/galerie" className="hover:text-hunting-orange transition-colors">Galerie</Link></li>
              <li><Link href="/records" className="hover:text-hunting-orange transition-colors">Hall of Fame</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Contact</h3>
            <p className="text-sm text-hunting-accent">
              Groupe privé de chasseurs<br />
              Facebook: [Lien du groupe]
            </p>
          </div>
        </div>
        <div className="border-t border-hunting-accent/30 pt-4">
          <p className="text-center text-sm text-hunting-accent">
            © 2025 Groupe de Chasse. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
