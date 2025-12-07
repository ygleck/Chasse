import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero section */}
        <section className="hunting-header text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-serif font-bold mb-4">
              Bienvenue au Groupe de Chasse
            </h1>
            <p className="text-xl text-hunting-accent mb-8">
              Partage de souvenirs, trophées et belles histoires de chasse
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/galerie" className="btn-primary">
                Voir la galerie
              </Link>
              <Link href="/records" className="btn-secondary">
                Hall of Fame
              </Link>
              <Link href="/upload" className="btn-primary">
                Soumettre une photo
              </Link>
            </div>
          </div>
        </section>

        {/* Featured section */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-serif font-bold text-hunting-dark mb-12 text-center">
            Dernières soumissions approuvées
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Placeholder cards - will be replaced with real data */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="trophy-card">
                <div className="w-full h-64 bg-gradient-to-br from-hunting-dark to-hunting-light flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="text-6xl mb-2">🦌</div>
                    <p className="text-sm">Placeholder #{i}</p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-hunting-dark">Titre du souvenir</h3>
                  <p className="text-sm text-gray-600 mt-2">Par Jean Chasseur</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/galerie" className="btn-primary">
              Voir plus →
            </Link>
          </div>
        </section>

        {/* Rules section */}
        <section className="bg-hunting-dark/10 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif font-bold text-hunting-dark mb-8 text-center">
              Règles de la communauté
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="hunting-card p-6">
                <h3 className="font-bold text-lg text-hunting-orange mb-3">✓ Accepté</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Photos de chasse et moments de groupe</li>
                  <li>✓ Trophées et records</li>
                  <li>✓ Visages (consentement requis)</li>
                  <li>✓ Moments au camp ou trail cam</li>
                </ul>
              </div>
              <div className="hunting-card p-6">
                <h3 className="font-bold text-lg text-red-600 mb-3">✗ Non accepté</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✗ Armes pointées sur quelqu’un</li>
                  <li>✗ Alcool + armes de façon dangereuse</li>
                  <li>✗ Contenu gore gratuit</li>
                  <li>✗ Infos sensibles (emails, adresses)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
