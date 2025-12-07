'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface DetailRecord {
  id: string;
  title: string;
  description: string;
  species: string;
  uploaderName: string;
  weight: number | null;
  points: number | null;
  huntDate: string | null;
  region: string | null;
  weaponType: string | null;
  caliber: string | null;
  photos: Array<{ path: string; id: string }>;
}

interface Params {
  id: string;
}

async function getRecord(id: string): Promise<DetailRecord | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/uploads/${id}`);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export default async function RecordDetail({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const record = await getRecord(id);

  if (!record) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-hunting-dark">Trophée non trouvé</h1>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <section className="container mx-auto px-4 py-12">
          <a
            href="/records"
            className="text-hunting-orange font-semibold hover:underline mb-8 inline-block"
          >
            ← Retour au Hall of Fame
          </a>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Photos */}
            <div>
              {record.photos.length > 0 && (
                <div className="hunting-card overflow-hidden">
                  <img
                    src={record.photos[0].path}
                    alt={record.title}
                    className="w-full h-96 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <h1 className="text-4xl font-serif font-bold text-hunting-dark mb-4">
                {record.title}
              </h1>

              <div className="mb-8">
                <span className="hunting-badge">{record.species}</span>
              </div>

              <p className="text-gray-700 mb-8 leading-relaxed">
                {record.description}
              </p>

              <div className="space-y-4 mb-8">
                <div className="hunting-card p-4">
                  <h3 className="font-bold text-hunting-dark mb-3">Informations</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chasseur:</span>
                      <span className="font-semibold">{record.uploaderName}</span>
                    </div>
                    {record.huntDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date de chasse:</span>
                        <span className="font-semibold">
                          {new Date(record.huntDate).toLocaleDateString('fr-CA')}
                        </span>
                      </div>
                    )}
                    {record.region && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Région:</span>
                        <span className="font-semibold">{record.region}</span>
                      </div>
                    )}
                    {record.weight && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Poids:</span>
                        <span className="font-semibold text-hunting-orange">
                          {record.weight} lb
                        </span>
                      </div>
                    )}
                    {record.points && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Points:</span>
                        <span className="font-semibold text-hunting-orange">
                          {record.points}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {(record.weaponType || record.caliber) && (
                  <div className="hunting-card p-4">
                    <h3 className="font-bold text-hunting-dark mb-3">
                      Équipement
                    </h3>
                    <div className="space-y-2 text-sm">
                      {record.weaponType && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Arme:</span>
                          <span className="font-semibold">{record.weaponType}</span>
                        </div>
                      )}
                      {record.caliber && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Calibre:</span>
                          <span className="font-semibold">{record.caliber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
