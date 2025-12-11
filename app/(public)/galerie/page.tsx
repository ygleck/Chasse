'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PhotoSwipeGallery, PhotoLink } from '@/components/PhotoSwipeGallery';
import { useEffect, useState } from 'react';

interface Memory {
  id: string;
  title: string;
  description: string;
  category: string;
  uploaderName: string;
  eventDate: string | null;
  photos: Array<{ thumbnailPath: string }>;
}

export default function Galerie() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const response = await fetch('/api/uploads?status=approved&type=souvenir');
        const data = await response.json();
        setMemories(data);
        setFilteredMemories(data);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
  }, []);

  useEffect(() => {
    let filtered = memories;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((m) => m.category === selectedCategory);
    }

    if (selectedYear !== 'all') {
      filtered = filtered.filter((m) => {
        const year = m.eventDate ? new Date(m.eventDate).getFullYear().toString() : '';
        return year === selectedYear;
      });
    }

    setFilteredMemories(filtered);
  }, [selectedCategory, selectedYear, memories]);

  const categories = Array.from(
    new Set(memories.map((m) => m.category).filter(Boolean))
  );

  const years = Array.from(
    new Set(
      memories
        .map((m) => (m.eventDate ? new Date(m.eventDate).getFullYear() : null))
        .filter(Boolean)
        .map((y) => y?.toString())
    )
  ).sort((a, b) => (b ? parseInt(b) : 0) - (a ? parseInt(a) : 0));

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* HEADER SECTION */}
        <section className="bg-gradient-forest text-white py-16">
          <div className="section-container">
            <h1 className="font-heading text-5xl mb-3 uppercase tracking-wider">
              Galerie de Souvenirs
            </h1>
            <p className="text-lg text-hunting-gold opacity-90">
              Moments mémorables et précieux de notre communauté de chasse
            </p>
          </div>
        </section>

        {/* FILTERS SECTION */}
        <section className="section-padding bg-white border-b border-hunting-gold/20">
          <div className="section-container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Catégorie Filter */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-hunting-slate mb-3">
                  Catégorie
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="form-input"
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Année Filter */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-hunting-slate mb-3">
                  Année
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="form-input"
                >
                  <option value="all">Toutes les années</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-end">
                <p className="text-hunting-gold font-semibold text-lg">
                  {filteredMemories.length} souvenir{filteredMemories.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Reset Button */}
              <div className="flex items-end justify-end">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedYear('all');
                  }}
                  className="btn-ghost text-sm"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* GALLERY GRID SECTION */}
        <section className="section-padding bg-hunting-cream">
          <div className="section-container">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-hunting-gold border-t-hunting-orange mb-4" />
                  <p className="text-hunting-slate font-semibold">Chargement des souvenirs...</p>
                </div>
              </div>
            ) : filteredMemories.length === 0 ? (
              <div className="card-premium p-12 text-center bg-white">
                <div className="text-6xl mb-4">📷</div>
                <h3 className="font-heading text-2xl text-hunting-dark mb-2">
                  Aucun souvenir trouvé
                </h3>
                <p className="text-hunting-slate/70 mb-6">
                  Essayez de modifier vos filtres ou soumettez votre propre souvenir!
                </p>
                <a href="/upload" className="btn-primary">
                  Ajouter un Souvenir
                </a>
              </div>
            ) : (
              <div id="gallery">
                <PhotoSwipeGallery
                  images={filteredMemories.map((memory) => ({
                    src: memory.photos[0]?.thumbnailPath || '/placeholder.jpg',
                    width: 1200,
                    height: 800,
                    title: memory.title,
                    alt: memory.title,
                  }))}
                  galleryId="gallery"
                />
                <div className="gallery-masonry">
                  {filteredMemories.map((memory, index) => (
                    <div key={memory.id} className="gallery-item">
                      <PhotoLink
                        src={memory.photos[0]?.thumbnailPath || '/placeholder.jpg'}
                        thumbnail={memory.photos[0]?.thumbnailPath}
                        title={memory.title}
                        alt={memory.title}
                        index={index}
                        className="block w-full h-full overflow-hidden rounded-lg cursor-pointer hover:scale-105 transition-transform duration-300"
                      >
                        <div className="w-full h-full relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={memory.photos[0]?.thumbnailPath || '/placeholder.jpg'}
                            alt={memory.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                            <div className="text-white text-3xl opacity-0 hover:opacity-100 transition-opacity duration-300">
                              🔍
                            </div>
                          </div>
                        </div>
                      </PhotoLink>
                      <div className="p-4 bg-white">
                        <h3 className="font-heading text-lg mb-1 text-hunting-dark line-clamp-1">
                          {memory.title}
                        </h3>
                        <p className="text-sm text-hunting-gold font-semibold mb-2">
                          {memory.category || 'Général'}
                        </p>
                        <p className="text-xs text-hunting-slate/70">
                          Par {memory.uploaderName}
                        </p>
                        {memory.eventDate && (
                          <p className="text-xs text-hunting-slate/70 mt-1">
                            {new Date(memory.eventDate).toLocaleDateString('fr-CA')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CTA SECTION */}
        {filteredMemories.length > 0 && (
          <section className="section-padding bg-gradient-forest text-white text-center">
            <div className="section-container max-w-2xl">
              <h2 className="font-heading text-4xl mb-4 uppercase tracking-wider">
                Partagez Votre Moment
              </h2>
              <p className="text-lg mb-8 opacity-95">
                Vous avez une belle photo ou un souvenir? Rejoignez-nous et faites partie de cette galerie!
              </p>
              <a href="/upload" className="btn-primary">
                Soumettre un Souvenir
              </a>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
