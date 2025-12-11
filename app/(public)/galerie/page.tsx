'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PhotoSwipeGallery, PhotoLink } from '@/components/PhotoSwipeGallery';
import { useEffect, useState } from 'react';

interface Photo {
  id: string;
  path: string;
  thumbnailPath: string;
}

export default function Galerie() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/uploads');
        const data = await response.json();
        setPhotos(data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* HEADER */}
        <section className="bg-gradient-forest text-white py-16">
          <div className="section-container">
            <h1 className="font-heading text-5xl mb-3 uppercase tracking-wider">
              🖼️ Galerie
            </h1>
            <p className="text-lg text-hunting-gold opacity-90">
              Toutes les photos uploadées
            </p>
          </div>
        </section>

        {/* GALLERY */}
        <section className="section-padding bg-hunting-cream">
          <div className="section-container">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-hunting-slate text-lg">Chargement...</p>
              </div>
            ) : photos.length === 0 ? (
              <div className="text-center py-12 card-premium bg-white p-8">
                <p className="text-hunting-slate text-lg">Aucune photo pour le moment</p>
                <p className="text-hunting-slate/70 mt-2">
                  <a href="/upload" className="text-hunting-orange hover:underline font-semibold">
                    Soumettez vos photos →
                  </a>
                </p>
              </div>
            ) : (
              <PhotoSwipeGallery images={photos} galleryId="main-gallery">
                <div className="gallery-masonry">
                  {photos.map((photo, i) => (
                    <PhotoLink
                      key={photo.id}
                      href={photo.path}
                      thumbnail={photo.thumbnailPath}
                      width={800}
                      height={600}
                      title={`Photo ${i + 1}`}
                      index={i}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.thumbnailPath}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer relative group"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="text-white text-3xl">🔍</span>
                      </div>
                    </PhotoLink>
                  ))}
                </div>
              </PhotoSwipeGallery>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
