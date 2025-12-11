import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-hunting-dark border-t-2 border-hunting-gold/30 mt-20">
      {/* Main Footer Content */}
      <div className="section-container section-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-hunting-orange rounded-full flex items-center justify-center font-bold text-white">
                🦌
              </div>
              <h3 className="font-heading text-white text-xl tracking-wider">
                CHASSE
              </h3>
            </div>
            <p className="text-hunting-gold text-sm leading-relaxed">
              Communauté de chasseurs passionnés. Partage de souvenirs, records et histoires de chasse.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-10 h-10 bg-hunting-orange/20 hover:bg-hunting-orange rounded-full flex items-center justify-center text-hunting-gold hover:text-white transition-all">
                f
              </a>
              <a href="#" className="w-10 h-10 bg-hunting-orange/20 hover:bg-hunting-orange rounded-full flex items-center justify-center text-hunting-gold hover:text-white transition-all">
                @
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-white text-lg mb-4 uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-3">
              {[
                { href: '/', label: 'Accueil' },
                { href: '/galerie', label: 'Galerie' },
                { href: '/records', label: 'Hall of Fame' },
                { href: '/upload', label: 'Soumettre' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-hunting-gold hover:text-hunting-orange transition-colors text-sm font-semibold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-heading text-white text-lg mb-4 uppercase tracking-wider">
              Ressources
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/admin" className="text-hunting-gold hover:text-hunting-orange transition-colors text-sm font-semibold">
                  Modération
                </Link>
              </li>
              <li>
                <a href="#" className="text-hunting-gold hover:text-hunting-orange transition-colors text-sm font-semibold">
                  Règles
                </a>
              </li>
              <li>
                <a href="#" className="text-hunting-gold hover:text-hunting-orange transition-colors text-sm font-semibold">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-hunting-gold hover:text-hunting-orange transition-colors text-sm font-semibold">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-white text-lg mb-4 uppercase tracking-wider">
              Contact
            </h4>
            <p className="text-hunting-gold text-sm mb-3">
              Groupe privé de chasseurs
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-hunting-gold">
                <span className="font-semibold">Email:</span> contact@chasse.local
              </p>
              <p className="text-hunting-gold">
                <span className="font-semibold">Facebook:</span> Groupe de Chasse
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="divider my-8" />

        {/* Bottom Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center md:text-left">
          <p className="text-hunting-gold text-sm">
            © {currentYear} Groupe de Chasse. Tous droits réservés.
          </p>
          <div className="flex flex-col md:flex-row justify-center md:justify-end gap-6">
            <a href="#" className="text-hunting-gold hover:text-hunting-orange transition-colors text-sm font-semibold">
              Politique de confidentialité
            </a>
            <a href="#" className="text-hunting-gold hover:text-hunting-orange transition-colors text-sm font-semibold">
              Conditions d'utilisation
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
