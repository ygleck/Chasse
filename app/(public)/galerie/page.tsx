'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MemoryCard } from '@/components/MemoryCard';
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
        <section className="hunting-header text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-serif font-bold">Galerie de souvenirs</h1>
            <p className="text-hunting-accent mt-2">Moments mémorables de notre groupe</p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div>
              <label className="block text-sm font-semibold text-hunting-dark mb-2">
                Catégorie
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-hunting-orange"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
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

          {/* Gallery grid */}
          {loading ? (
            <div className="text-center py-20">
              <p className="text-gray-600">Chargement...</p>
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">
                Aucun souvenir trouvé avec ces filtres.
              </p>
            </div>
          ) : (
            <div className="gallery-grid">
              {filteredMemories.map((memory) => (
                <MemoryCard
                  key={memory.id}
                  title={memory.title}
                  image={
                    memory.photos[0]?.thumbnailPath || '/placeholder.jpg'
                  }
                  category={memory.category || 'Général'}
                  uploaderName={memory.uploaderName}
                  eventDate={
                    memory.eventDate
                      ? new Date(memory.eventDate).toLocaleDateString('fr-CA')
                      : undefined
                  }
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
