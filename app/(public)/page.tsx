import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* HERO SECTION - Full Screen avec Image Orignal */}
        <section className="relative h-screen w-full overflow-hidden bg-gradient-forest flex items-center justify-center">
          {/* Background Image */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="/uploads/hero-orignal.jpg"
              alt="Crâne d'orignal - Groupe de Chasse"
              fill
              priority
              className="object-cover object-center"
            />
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Content */}
          <div className="hero-content text-center text-white max-w-3xl px-4">
            <h1 className="font-heading text-6xl md:text-7xl lg:text-8xl mb-6 tracking-wider uppercase" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
              GROUPE DE CHASSE
            </h1>
            <p className="text-lg md:text-2xl mb-8 text-hunting-gold font-bold tracking-wide" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.9)' }}>
              Communauté de Chasseurs Passionnés
            </p>
            <p className="text-base md:text-lg mb-12 max-w-2xl mx-auto leading-relaxed font-medium" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
              Partage de souvenirs mémorables, trophées exceptionnels et histoires de chasse inoubliables. 
              Une communauté unie par la passion de la nature sauvage.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/galerie" className="btn-primary text-lg">
                Découvrir la Galerie
              </Link>
              <Link href="/records" className="btn-outline text-lg">
                Hall of Fame
              </Link>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-hunting-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </section>

        {/* À PROPOS SECTION */}
        <section className="section-padding bg-white">
          <div className="section-container max-w-4xl">
            <h2 className="text-center mb-12 uppercase tracking-wider">
              Qui Sommes-Nous?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-hunting-orange rounded-full flex items-center justify-center text-white text-3xl">
                  👥
                </div>
                <h3 className="font-heading text-xl mb-3 uppercase">Communauté</h3>
                <p className="text-hunting-slate/70 leading-relaxed">
                  Une communauté soudée de chasseurs partageant la même passion pour la nature et la chasse responsable.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-hunting-orange rounded-full flex items-center justify-center text-white text-3xl">
                  🏆
                </div>
                <h3 className="font-heading text-xl mb-3 uppercase">Trophées</h3>
                <p className="text-hunting-slate/70 leading-relaxed">
                  Célébrez les meilleurs records et moments exceptionnels de chasse dans notre Hall of Fame.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-hunting-orange rounded-full flex items-center justify-center text-white text-3xl">
                  📸
                </div>
                <h3 className="font-heading text-xl mb-3 uppercase">Souvenirs</h3>
                <p className="text-hunting-slate/70 leading-relaxed">
                  Partagez vos moments mémorables et restez connecté avec vos compagnons de chasse.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* DERNIÈRES SOUMISSIONS */}
        <section className="section-padding bg-hunting-cream">
          <div className="section-container">
            <h2 className="text-center mb-16 uppercase tracking-wider">
              Dernières Contributions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card-premium card-hover">
                  <div className="card-image bg-gradient-to-br from-hunting-forest to-hunting-brown">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-2">🦌</div>
                        <p className="text-white text-sm">Souvenir #{i}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-3">
                      <span className="badge-primary">Souvenir</span>
                    </div>
                    <h3 className="font-heading text-xl mb-2 text-hunting-dark">
                      Moment de chasse mémorable
                    </h3>
                    <p className="text-hunting-slate/70 text-sm mb-4 line-clamp-2">
                      Une belle journée en compagnie du groupe dans les bois profonds.
                    </p>
                    <p className="text-xs text-hunting-gold font-semibold">
                      Par Jean Chasseur
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link href="/galerie" className="btn-primary">
                Voir la Galerie Complète →
              </Link>
            </div>
          </div>
        </section>

        {/* RÈGLES DE COMMUNAUTÉ */}
        <section className="section-padding bg-white">
          <div className="section-container">
            <h2 className="text-center mb-16 uppercase tracking-wider">
              Règles de la Communauté
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Accepté */}
              <div className="card-premium p-8 border-2 border-hunting-orange/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-hunting-orange rounded-full flex items-center justify-center text-white font-bold">
                    ✓
                  </div>
                  <h3 className="font-heading text-2xl text-hunting-orange uppercase">
                    Accepté
                  </h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-hunting-slate/70">
                    <span className="text-hunting-orange font-bold">✓</span>
                    Photos de chasse et moments de groupe
                  </li>
                  <li className="flex gap-3 text-hunting-slate/70">
                    <span className="text-hunting-orange font-bold">✓</span>
                    Trophées et records
                  </li>
                  <li className="flex gap-3 text-hunting-slate/70">
                    <span className="text-hunting-orange font-bold">✓</span>
                    Visages (avec consentement)
                  </li>
                  <li className="flex gap-3 text-hunting-slate/70">
                    <span className="text-hunting-orange font-bold">✓</span>
                    Moments au camp ou trail cam
                  </li>
                  <li className="flex gap-3 text-hunting-slate/70">
                    <span className="text-hunting-orange font-bold">✓</span>
                    Histoires de chasse et conseils
                  </li>
                </ul>
              </div>

              {/* Non Accepté */}
              <div className="card-premium p-8 border-2 border-red-500/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                    ✗
                  </div>
                  <h3 className="font-heading text-2xl text-red-600 uppercase">
                    Non Accepté
                  </h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-hunting-slate/70">
                    <span className="text-red-500 font-bold">✗</span>
                    Armes pointées vers quelqu&apos;un
                  </li>
                  <li className="flex gap-3 text-hunting-slate/70">
                    <span className="text-red-500 font-bold">✗</span>
                    Alcool + armes de façon dangereuse
                  </li>
                  <li className="flex gap-3 text-hunting-slate/70">
                    <span className="text-red-500 font-bold">✗</span>
                    Contenu gore gratuit
                  </li>
                  <li className="flex gap-3 text-hunting-slate/70">
                    <span className="text-red-500 font-bold">✗</span>
                    Infos sensibles (emails, adresses)
                  </li>
                  <li className="flex gap-3 text-hunting-slate/70">
                    <span className="text-red-500 font-bold">✗</span>
                    Publicités ou contenu hors chasse
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="section-padding bg-gradient-forest text-white">
          <div className="section-container text-center max-w-2xl">
            <h2 className="mb-6 uppercase tracking-wider">
              Partagez Votre Moment
            </h2>
            <p className="text-lg mb-8 opacity-95 leading-relaxed">
              Vous avez une photo, un record ou un souvenir à partager? Rejoignez notre communauté et inspirez d&apos;autres chasseurs.
            </p>
            <Link href="/upload" className="btn-primary text-lg">
              Soumettre une Contribution
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
