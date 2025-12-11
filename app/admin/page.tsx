'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useState, useEffect } from 'react';

interface Photo {
  id: string;
  thumbnailPath: string;
  path: string;
}

interface Upload {
  id: string;
  type: string;
  status: string;
  title: string;
  description: string;
  uploaderName: string;
  uploaderEmail?: string;
  photos: Photo[];
  species?: string;
  category?: string;
  weight?: number;
  points?: number;
  region?: string;
  rejectionReason?: string;
  createdAt: string;
}

export default function AdminPage() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedUpload, setSelectedUpload] = useState<Upload | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/uploads');
      const data = await response.json();
      setUploads(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      const response = await fetch(`/api/uploads/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          rejectionReason: newStatus === 'rejected' ? rejectionReason : null,
        }),
      });

      if (!response.ok) throw new Error('Erreur');
      await fetchUploads();
      setSelectedUpload(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette soumission?')) return;
    try {
      const response = await fetch(`/api/uploads/${id}/status`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erreur');
      await fetchUploads();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const filteredUploads = uploads.filter((u) => filter === 'all' || u.status === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge-outline">⏳ En attente</span>;
      case 'approved':
        return <span className="badge-primary">✓ Approuvé</span>;
      case 'rejected':
        return <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-xs font-bold">✕ Rejeté</span>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'souvenir' ? '📸' : '🏆';
  };

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* HEADER */}
        <section className="bg-hunting-dark text-white py-16">
          <div className="section-container">
            <h1 className="font-heading text-5xl mb-3 uppercase tracking-wider">
              Modération
            </h1>
            <p className="text-lg text-hunting-gold opacity-90">
              Gérez les soumissions en attente d&apos;approbation
            </p>
          </div>
        </section>

        {/* FILTERS */}
        <section className="section-padding bg-white border-b border-hunting-gold/20">
          <div className="section-container max-w-6xl">
            <div className="flex flex-wrap gap-3">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    filter === s
                      ? 'bg-hunting-orange text-white'
                      : 'bg-hunting-cream text-hunting-slate hover:bg-hunting-gold/20'
                  }`}
                >
                  {s === 'all' && 'Tous'}
                  {s === 'pending' && `⏳ En attente (${uploads.filter(u => u.status === 'pending').length})`}
                  {s === 'approved' && `✓ Approuvés (${uploads.filter(u => u.status === 'approved').length})`}
                  {s === 'rejected' && `✕ Rejetés (${uploads.filter(u => u.status === 'rejected').length})`}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="section-padding bg-hunting-cream">
          <div className="section-container max-w-6xl">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-hunting-slate text-lg">Chargement...</p>
              </div>
            ) : filteredUploads.length === 0 ? (
              <div className="text-center py-12 card-premium bg-white p-8">
                <p className="text-hunting-slate text-lg">Aucune soumission à afficher</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredUploads.map((upload) => (
                  <div
                    key={upload.id}
                    className="card-premium bg-white hover:shadow-lg transition-shadow"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
                      {/* THUMBNAILS */}
                      <div className="lg:col-span-1">
                        <div className="space-y-2">
                          {upload.photos.slice(0, 3).map((photo, i) => (
                            <div key={i} className="overflow-hidden rounded-lg">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={photo.thumbnailPath}
                                alt={`${upload.title} ${i + 1}`}
                                className="w-full h-24 object-cover hover:scale-105 transition-transform cursor-pointer"
                              />
                            </div>
                          ))}
                          {upload.photos.length > 3 && (
                            <div className="w-full h-24 bg-hunting-gold/20 rounded-lg flex items-center justify-center font-bold text-hunting-dark">
                              +{upload.photos.length - 3}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* INFO */}
                      <div className="lg:col-span-2 space-y-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{getTypeIcon(upload.type)}</span>
                            <h3 className="font-heading text-2xl text-hunting-dark uppercase">
                              {upload.title}
                            </h3>
                            {getStatusBadge(upload.status)}
                          </div>
                          <p className="text-hunting-slate/70 text-sm">
                            par <strong>{upload.uploaderName}</strong>
                            {upload.uploaderEmail && ` • ${upload.uploaderEmail}`}
                          </p>
                        </div>

                        {upload.description && (
                          <p className="text-hunting-slate italic">{upload.description}</p>
                        )}

                        {/* DETAILS */}
                        <div className="grid grid-cols-2 gap-4 p-4 bg-hunting-cream rounded-lg text-sm">
                          {upload.type === 'record' ? (
                            <>
                              {upload.species && (
                                <div>
                                  <p className="text-hunting-gold font-semibold">Espèce</p>
                                  <p className="text-hunting-dark">{upload.species}</p>
                                </div>
                              )}
                              {upload.region && (
                                <div>
                                  <p className="text-hunting-gold font-semibold">Région</p>
                                  <p className="text-hunting-dark">{upload.region}</p>
                                </div>
                              )}
                              {upload.weight && (
                                <div>
                                  <p className="text-hunting-gold font-semibold">Poids</p>
                                  <p className="text-hunting-dark">{upload.weight} kg</p>
                                </div>
                              )}
                              {upload.points && (
                                <div>
                                  <p className="text-hunting-gold font-semibold">Points</p>
                                  <p className="text-hunting-dark">{upload.points}</p>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              {upload.category && (
                                <div>
                                  <p className="text-hunting-gold font-semibold">Catégorie</p>
                                  <p className="text-hunting-dark">{upload.category}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-hunting-gold font-semibold">Soumis le</p>
                                <p className="text-hunting-dark">
                                  {new Date(upload.createdAt).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            </>
                          )}
                        </div>

                        {upload.status === 'rejected' && (
                          <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                            <p className="text-red-700 text-sm">
                              <strong>Raison du rejet:</strong> {upload.rejectionReason || 'Non spécifiée'}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* ACTIONS */}
                      <div className="lg:col-span-1 space-y-3 flex flex-col">
                        {upload.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(upload.id, 'approved')}
                              disabled={updatingId === upload.id}
                              className="btn-primary text-sm"
                            >
                              {updatingId === upload.id ? '...' : '✓ Approuver'}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUpload(upload);
                                setRejectionReason('');
                              }}
                              className="btn-secondary text-sm"
                            >
                              ✕ Rejeter
                            </button>
                          </>
                        )}
                        {upload.status !== 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(upload.id, 'pending')}
                              disabled={updatingId === upload.id}
                              className="btn-secondary text-sm"
                            >
                              ↻ Réexaminer
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(upload.id)}
                          className="btn-danger text-sm"
                        >
                          🗑 Supprimer
                        </button>
                        <button
                          onClick={() => setSelectedUpload(null)}
                          className="text-hunting-slate text-sm text-center py-2 hover:text-hunting-orange transition-colors"
                        >
                          Fermer
                        </button>
                      </div>
                    </div>

                    {/* REJECTION FORM */}
                    {selectedUpload?.id === upload.id && upload.status === 'pending' && (
                      <div className="border-t border-hunting-gold/20 p-6 bg-red-50">
                        <h4 className="font-bold text-red-700 mb-3">Raison du rejet</h4>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Expliquez pourquoi cette soumission est rejetée..."
                          className="form-textarea h-20 mb-3"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleStatusChange(upload.id, 'rejected')}
                            disabled={updatingId === upload.id || !rejectionReason.trim()}
                            className="btn-danger"
                          >
                            Confirmer le rejet
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUpload(null);
                              setRejectionReason('');
                            }}
                            className="btn-secondary"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
