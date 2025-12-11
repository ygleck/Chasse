import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-hunting-dark relative overflow-hidden" style={{
      backgroundImage: 'linear-gradient(to bottom, rgba(45, 31, 26, 0.98), rgba(45, 31, 26, 1)), url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4a574\' fill-opacity=\'0.02\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
    }}>
      {/* Bordure décorative supérieure */}
      <div className="h-1 bg-gradient-to-r from-transparent via-hunting-gold to-transparent"></div>
      
      {/* Main Footer Content */}
      <div className="section-container section-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-hunting-orange to-orange-700 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg">
                🦌
              </div>
              <h3 className="font-heading text-white text-2xl tracking-wider drop-shadow-md">
                CHASSE
              </h3>
            </div>
            <p className="text-hunting-gold/90 text-sm leading-relaxed mb-6">
              Communauté de chasseurs passionnés. Partage de souvenirs, records et histoires de chasse.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-12 h-12 bg-hunting-orange/20 hover:bg-hunting-orange rounded-full flex items-center justify-center text-hunting-gold hover:text-white transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg text-lg font-bold">
                f
              </a>
              <a href="#" className="w-12 h-12 bg-hunting-orange/20 hover:bg-hunting-orange rounded-full flex items-center justify-center text-hunting-gold hover:text-white transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg text-lg font-bold">
                @
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-white text-lg mb-6 uppercase tracking-wider flex items-center gap-2">
              <span className="text-hunting-orange">→</span> Navigation
            </h4>
            <ul className="space-y-4">
              {[
                { href: '/', label: 'Accueil' },
                { href: '/galerie', label: 'Galerie' },
                { href: '/records', label: 'Hall of Fame' },
                { href: '/upload', label: 'Soumettre' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-hunting-gold/90 hover:text-hunting-orange transition-all duration-300 text-sm font-semibold hover:translate-x-2 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-heading text-white text-lg mb-6 uppercase tracking-wider flex items-center gap-2">
              <span className="text-hunting-orange">→</span> Ressources
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/admin" className="text-hunting-gold/90 hover:text-hunting-orange transition-all duration-300 text-sm font-semibold hover:translate-x-2 inline-block">
                  Modération
                </Link>
              </li>
              <li>
                <a href="#" className="text-hunting-gold/90 hover:text-hunting-orange transition-all duration-300 text-sm font-semibold hover:translate-x-2 inline-block">
                  Règles
                </a>
              </li>
              <li>
                <a href="#" className="text-hunting-gold/90 hover:text-hunting-orange transition-all duration-300 text-sm font-semibold hover:translate-x-2 inline-block">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-hunting-gold/90 hover:text-hunting-orange transition-all duration-300 text-sm font-semibold hover:translate-x-2 inline-block">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-white text-lg mb-6 uppercase tracking-wider flex items-center gap-2">
              <span className="text-hunting-orange">→</span> Contact
            </h4>
            <p className="text-hunting-gold/90 text-sm mb-4 font-medium">
              Groupe privé de chasseurs
            </p>
            <div className="space-y-3 text-sm">
              <p className="text-hunting-gold/90 hover:text-hunting-orange transition-colors">
                <span className="font-bold text-hunting-orange">📧</span> <span className="font-semibold">Email:</span> contact@chasse.local
              </p>
              <p className="text-hunting-gold/90 hover:text-hunting-orange transition-colors">
                <span className="font-bold text-hunting-orange">👥</span> <span className="font-semibold">Facebook:</span> Groupe de Chasse
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
              Conditions d&apos;utilisation
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
