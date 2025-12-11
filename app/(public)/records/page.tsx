'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TrophyCard } from '@/components/TrophyCard';
import { useEffect, useState } from 'react';

interface Trophy {
  id: string;
  title: string;
  species: string;
  uploaderName: string;
  weight: number | null;
  points: number | null;
  huntDate: string | null;
  region: string | null;
  photos: Array<{ thumbnailPath: string }>;
}

export default function Records() {
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [filteredTrophies, setFilteredTrophies] = useState<Trophy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  useEffect(() => {
    const fetchTrophies = async () => {
      try {
        const response = await fetch('/api/uploads?status=approved&type=record');
        const data = await response.json();
        setTrophies(data);
        setFilteredTrophies(data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrophies();
  }, []);

  useEffect(() => {
    let filtered = trophies;
    if (selectedSpecies !== 'all') {
      filtered = filtered.filter((t) => t.species === selectedSpecies);
    }
    if (selectedRegion !== 'all') {
      filtered = filtered.filter((t) => t.region === selectedRegion);
    }
    setFilteredTrophies(filtered);
  }, [selectedSpecies, selectedRegion, trophies]);

  const species = Array.from(new Set(trophies.map((t) => t.species).filter(Boolean)));
  const regions = Array.from(new Set(trophies.map((t) => t.region).filter(Boolean)));

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* HEADER */}
        <section className="bg-gradient-warm text-white py-16">
          <div className="section-container">
            <h1 className="font-heading text-5xl mb-3 uppercase tracking-wider">
              🏆 Hall of Fame
            </h1>
            <p className="text-lg text-hunting-gold opacity-90">
              Les plus beaux trophées et records de notre communauté
            </p>
          </div>
        </section>

        {/* FILTERS */}
        <section className="section-padding bg-white border-b border-hunting-gold/20">
          <div className="section-container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-hunting-slate mb-3">
                  Espèce
                </label>
                <select
                  value={selectedSpecies}
                  onChange={(e) => setSelectedSpecies(e.target.value)}
                  className="form-input"
                >
                  <option value="all">Toutes les espèces</option>
                  {species.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-hunting-slate mb-3">
                  Région
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="form-input"
                >
                  <option value="all">Toutes les régions</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedSpecies('all');
                    setSelectedRegion('all');
                  }}
                  className="btn-ghost"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section className="section-padding bg-hunting-cream">
          <div className="section-container">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-hunting-gold border-t-hunting-orange mb-4" />
                  <p className="text-hunting-slate font-semibold">Chargement des records...</p>
                </div>
              </div>
            ) : filteredTrophies.length === 0 ? (
              <div className="card-premium p-12 text-center bg-white">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="font-heading text-2xl text-hunting-dark mb-2">
                  Aucun record trouvé
                </h3>
                <p className="text-hunting-slate/70">
                  Soumettez votre meilleur trophée!
                </p>
              </div>
            ) : (
              <div className="gallery-masonry">
                {filteredTrophies.map((trophy) => (
                  <div key={trophy.id} className="gallery-item">
                    <TrophyCard
                      title={trophy.title}
                      image={trophy.photos[0]?.thumbnailPath || '/placeholder.jpg'}
                      species={trophy.species}
                      uploaderName={trophy.uploaderName}
                      weight={trophy.weight}
                      points={trophy.points}
                      region={trophy.region}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        {filteredTrophies.length > 0 && (
          <section className="section-padding bg-gradient-forest text-white text-center">
            <div className="section-container max-w-2xl">
              <h2 className="font-heading text-4xl mb-4 uppercase tracking-wider">
                Avez-vous un record?
              </h2>
              <p className="text-lg mb-8 opacity-95">
                Partagez votre meilleur trophée et rejoignez le Hall of Fame!
              </p>
              <a href="/upload" className="btn-primary">
                Soumettre un Record
              </a>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
