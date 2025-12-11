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
        <section className="section-padding bg-hunting-cream/30" style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(245, 241, 232, 0.8), rgba(245, 241, 232, 0.9)), url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23c4a57b\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")'
        }}>
          <div className="section-container max-w-5xl">
            {/* Intro Text */}
            <p className="text-center text-hunting-slate/80 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Découvrez notre communauté de passionnés unis par l&apos;amour de la chasse et du grand air.
            </p>

            {/* Séparateur décoratif */}
            <div className="flex items-center justify-center mb-12">
              <div className="h-px bg-hunting-gold/30 w-20"></div>
              <div className="mx-4 text-hunting-orange text-2xl">🦌</div>
              <div className="h-px bg-hunting-gold/30 w-20"></div>
            </div>

            <h2 className="text-center mb-16 uppercase tracking-wider">
              Qui Sommes-Nous?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center group">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-hunting-orange to-orange-700 rounded-2xl flex items-center justify-center text-white text-4xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  👥
                </div>
                <h3 className="font-heading text-2xl mb-4 uppercase text-hunting-dark">Communauté</h3>
                <p className="text-hunting-slate/70 leading-relaxed text-base">
                  Une communauté soudée de chasseurs partageant la même passion pour la nature et la chasse responsable.
                </p>
              </div>
              <div className="text-center group">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-hunting-orange to-orange-700 rounded-2xl flex items-center justify-center text-white text-4xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  🏆
                </div>
                <h3 className="font-heading text-2xl mb-4 uppercase text-hunting-dark">Trophées</h3>
                <p className="text-hunting-slate/70 leading-relaxed text-base">
                  Célébrez les meilleurs records et moments exceptionnels de chasse dans notre Hall of Fame.
                </p>
              </div>
              <div className="text-center group">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-hunting-orange to-orange-700 rounded-2xl flex items-center justify-center text-white text-4xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  📸
                </div>
                <h3 className="font-heading text-2xl mb-4 uppercase text-hunting-dark">Souvenirs</h3>
                <p className="text-hunting-slate/70 leading-relaxed text-base">
                  Partagez vos moments mémorables et restez connecté avec vos compagnons de chasse.
                </p>
              </div>
            </div>

            {/* Séparateur décoratif bas */}
            <div className="flex items-center justify-center mt-16">
              <div className="h-px bg-hunting-gold/30 w-32"></div>
              <div className="mx-4 text-hunting-gold text-xl">🌲</div>
              <div className="h-px bg-hunting-gold/30 w-32"></div>
            </div>
          </div>
        </section>

        {/* DERNIÈRES SOUMISSIONS */}
        <section className="section-padding bg-white">
          <div className="section-container">
            {/* Séparateur décoratif haut */}
            <div className="flex items-center justify-center mb-12">
              <div className="h-px bg-hunting-gold/30 w-32"></div>
              <div className="mx-4 text-hunting-orange text-2xl">⭐</div>
              <div className="h-px bg-hunting-gold/30 w-32"></div>
            </div>

            <h2 className="text-center mb-16 uppercase tracking-wider">
              Dernières Contributions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card-premium group hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:z-10" style={{
                  transform: i === 2 ? 'translateY(-8px)' : 'none'
                }}>
                  <div className="card-image bg-gradient-to-br from-hunting-forest to-hunting-brown overflow-hidden relative">
                    <div className="w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <div className="text-center">
                        <div className="text-6xl mb-2 group-hover:scale-125 transition-transform duration-300">🦌</div>
                        <p className="text-white text-sm">Souvenir #{i}</p>
                      </div>
                    </div>
                    {/* Overlay hover */}
                    <div className="absolute inset-0 bg-hunting-orange/0 group-hover:bg-hunting-orange/10 transition-all duration-300"></div>
                  </div>
                  <div className="p-6 bg-white group-hover:bg-hunting-cream/50 transition-colors duration-300">
                    <div className="mb-3">
                      <span className="badge-primary">Souvenir</span>
                    </div>
                    <h3 className="font-heading text-xl mb-2 text-hunting-dark group-hover:text-hunting-orange transition-colors">
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
              <Link href="/galerie" className="btn-primary group">
                <span>Voir la Galerie Complète</span>
                <span className="inline-block group-hover:translate-x-2 transition-transform duration-300">→</span>
              </Link>
            </div>

            {/* Séparateur décoratif bas */}
            <div className="flex items-center justify-center mt-16">
              <div className="h-px bg-hunting-gold/30 w-32"></div>
              <div className="mx-4 text-hunting-gold text-xl">🌲</div>
              <div className="h-px bg-hunting-gold/30 w-32"></div>
            </div>
          </div>
        </section>

        {/* RÈGLES DE COMMUNAUTÉ */}
        <section className="section-padding bg-hunting-dark text-white relative overflow-hidden" style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(45, 31, 26, 0.95), rgba(45, 31, 26, 0.98)), url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4a574\' fill-opacity=\'0.02\'%3E%3Cpath d=\'M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z\' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}>
          <div className="section-container">
            {/* Bordure décorative du haut */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-hunting-gold to-transparent"></div>

            <h2 className="text-center mb-16 uppercase tracking-wider text-white">
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
        <section className="section-padding bg-gradient-forest text-white relative overflow-hidden" style={{
          backgroundImage: 'linear-gradient(135deg, rgba(26, 61, 42, 0.95) 0%, rgba(45, 31, 26, 0.9) 100%), url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23d4a574\' fill-opacity=\'0.03\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")'
        }}>
          {/* Bordure décorative du haut */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-hunting-gold to-transparent"></div>

          <div className="section-container text-center max-w-2xl">
            {/* Séparateur décoratif */}
            <div className="flex items-center justify-center mb-8">
              <div className="h-px bg-hunting-gold/40 w-20"></div>
              <div className="mx-4 text-hunting-orange text-3xl">📸</div>
              <div className="h-px bg-hunting-gold/40 w-20"></div>
            </div>

            <h2 className="mb-6 uppercase tracking-wider drop-shadow-lg">
              Partagez Votre Moment
            </h2>
            
            <p className="text-lg mb-10 opacity-95 leading-relaxed drop-shadow-md">
              Vous avez une photo, un record ou un souvenir à partager? Rejoignez notre communauté et inspirez d&apos;autres chasseurs.
            </p>
            
            <Link href="/upload" className="btn-primary text-lg inline-flex items-center gap-3 shadow-xl hover:shadow-2xl group">
              <span className="text-2xl group-hover:scale-125 transition-transform duration-300">📷</span>
              <span>Soumettre une Contribution</span>
              <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">→</span>
            </Link>

            {/* Séparateur décoratif bas */}
            <div className="flex items-center justify-center mt-12">
              <div className="h-px bg-hunting-gold/40 w-32"></div>
              <div className="mx-4 text-hunting-gold text-xl">🌲</div>
              <div className="h-px bg-hunting-gold/40 w-32"></div>
            </div>
          </div>

          {/* Bordure décorative du bas */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-hunting-gold to-transparent"></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
