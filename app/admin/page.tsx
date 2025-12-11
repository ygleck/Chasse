'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface Upload {
  id: string;
  type: string;
  status: string;
  title: string;
  description: string;
  uploaderName: string;
  photos: Array<{ id: string; thumbnailPath: string }>;
  species?: string;
  category?: string;
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
          <div className="section-container">
            <div className="flex flex-wrap gap-3">
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status as any)}
                  className={`px-6 py-2 rounded-lg font-semibold uppercase tracking-wider transition-all ${
                    filter === status
                      ? 'bg-hunting-orange text-white'
                      : 'bg-hunting-cream text-hunting-slate hover:bg-hunting-gold/20'
                  }`}
                >
                  {status === 'all' && 'Tous'}
                  {status === 'pending' && '⏳ En attente'}
                  {status === 'approved' && '✓ Approuvé'}
                  {status === 'rejected' && '✕ Rejeté'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="section-padding bg-hunting-cream">
          <div className="section-container">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-hunting-gold border-t-hunting-orange" />
                </div>
              </div>
            ) : filteredUploads.length === 0 ? (
              <div className="card-premium bg-white p-12 text-center">
                <p className="text-hunting-slate/70 text-lg">
                  Aucune soumission {filter !== 'all' ? 'avec ce statut' : ''}.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredUploads.map((upload) => (
                  <div key={upload.id} className="card-premium bg-white overflow-hidden">
                    {/* Images */}
                    {upload.photos.length > 0 && (
                      <div className="relative h-48 bg-gradient-to-br from-hunting-forest to-hunting-dark">
                        <img
                          src={upload.photos[0].thumbnailPath}
                          alt={upload.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-xs font-bold uppercase tracking-wider ${upload.type === 'souvenir' ? 'text-hunting-orange' : 'text-hunting-forest'}`}>
                          {upload.type}
                        </span>
                        {getStatusBadge(upload.status)}
                      </div>

                      <h3 className="font-heading text-xl text-hunting-dark mb-2 line-clamp-2">
                        {upload.title}
                      </h3>

                      <p className="text-sm text-hunting-slate/70 line-clamp-2 mb-3">
                        {upload.description}
                      </p>

                      <div className="text-xs text-hunting-gold font-semibold mb-4">
                        Par <strong>{upload.uploaderName}</strong>
                        {upload.species && ` • ${upload.species}`}
                        {upload.category && ` • ${upload.category}`}
                      </div>

                      {/* Actions */}
                      {upload.status === 'pending' && (
                        <div className="space-y-3">
                          <button
                            onClick={() => handleStatusChange(upload.id, 'approved')}
                            disabled={updatingId === upload.id}
                            className="w-full btn-primary text-sm"
                          >
                            {updatingId === upload.id ? '...' : '✓ Approuver'}
                          </button>
                          <button
                            onClick={() => setSelectedUpload(upload)}
                            disabled={updatingId === upload.id}
                            className="w-full btn-secondary text-sm"
                          >
                            ✕ Rejeter
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* REJECTION MODAL */}
        {selectedUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="font-heading text-2xl text-hunting-dark mb-4">
                Rejeter la soumission
              </h3>
              <p className="text-hunting-slate/70 mb-6">
                Soumission: <strong>{selectedUpload.title}</strong>
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Raison du rejet (optionnel)..."
                className="form-textarea mb-6 h-24"
              />
              <div className="flex gap-4">
                <button
                  onClick={() => handleStatusChange(selectedUpload.id, 'rejected')}
                  disabled={updatingId === selectedUpload.id}
                  className="btn-primary flex-1"
                >
                  {updatingId === selectedUpload.id ? '...' : 'Confirmer'}
                </button>
                <button
                  onClick={() => setSelectedUpload(null)}
                  className="btn-secondary flex-1"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
