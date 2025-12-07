import Link from 'next/link';

/**
 * Header component avec logo placeholder et navigation
 * TODO: Remplacer le placeholder par un vrai logo (tête d'orignal, panache, etc.)
 */
export function Header() {
  return (
    <header className="hunting-header text-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Placeholder logo */}
            <div className="w-12 h-12 bg-hunting-orange rounded-full flex items-center justify-center font-bold text-lg">
              🦌
            </div>
            <h1 className="text-3xl font-serif font-bold">Groupe de Chasse</h1>
          </div>
          
          <nav className="hidden md:flex gap-8">
            <Link href="/" className="hover:text-hunting-orange transition-colors">
              Accueil
            </Link>
            <Link href="/galerie" className="hover:text-hunting-orange transition-colors">
              Galerie
            </Link>
            <Link href="/records" className="hover:text-hunting-orange transition-colors">
              Hall of Fame
            </Link>
            <Link href="/upload" className="hover:text-hunting-orange transition-colors">
              Soumettre
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-2xl">☰</button>
          </div>
        </div>
      </div>
    </header>
  );
}
