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
  const [selectedYear, setSelectedYear] = useState<string>('all');

  useEffect(() => {
    const fetchTrophies = async () => {
      try {
        const response = await fetch('/api/uploads?status=approved&type=record');
        const data = await response.json();
        setTrophies(data);
        setFilteredTrophies(data);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
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

    if (selectedYear !== 'all') {
      filtered = filtered.filter((t) => {
        const year = t.huntDate ? new Date(t.huntDate).getFullYear().toString() : '';
        return year === selectedYear;
      });
    }

    setFilteredTrophies(filtered);
  }, [selectedSpecies, selectedRegion, selectedYear, trophies]);

  const species = Array.from(new Set(trophies.map((t) => t.species).filter(Boolean)));
  const regions = Array.from(new Set(trophies.map((t) => t.region).filter(Boolean)));
  const years = Array.from(
    new Set(
      trophies
        .map((t) => (t.huntDate ? new Date(t.huntDate).getFullYear() : null))
        .filter(Boolean)
        .map((y) => y?.toString())
    )
  ).sort((a, b) => (b ? parseInt(b) : 0) - (a ? parseInt(a) : 0));

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <section className="hunting-header text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-serif font-bold">🏆 Hall of Fame</h1>
            <p className="text-hunting-accent mt-2">Les plus beaux trophées de notre groupe</p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div>
              <label className="block text-sm font-semibold text-hunting-dark mb-2">
                Espèce
              </label>
              <select
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-hunting-orange"
              >
                <option value="all">Toutes les espèces</option>
                {species.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-hunting-dark mb-2">
                Région/Zone
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-hunting-orange"
              >
                <option value="all">Toutes les régions</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-hunting-dark mb-2">
                Année
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-hunting-orange"
              >
                <option value="all">Toutes les années</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Trophy grid */}
          {loading ? (
            <div className="text-center py-20">
              <p className="text-gray-600">Chargement...</p>
            </div>
          ) : filteredTrophies.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">
                Aucun trophée trouvé avec ces critères.
              </p>
            </div>
          ) : (
            <div className="gallery-grid">
              {filteredTrophies.map((trophy) => (
                <TrophyCard
                  key={trophy.id}
                  id={trophy.id}
                  title={trophy.title}
                  image={
                    trophy.photos[0]?.thumbnailPath || '/placeholder.jpg'
                  }
                  species={trophy.species}
                  hunterName={trophy.uploaderName}
                  year={
                    trophy.huntDate
                      ? new Date(trophy.huntDate).getFullYear()
                      : new Date().getFullYear()
                  }
                  weight={trophy.weight || undefined}
                  points={trophy.points || undefined}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
