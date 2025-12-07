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
  uploaderEmail?: string;
  photos: Array<{ id: string; thumbnailPath: string; path: string }>;
  species?: string;
  category?: string;
  createdAt: string;
  rejectionReason?: string;
}

export default function AdminPage() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [typeFilter, setTypeFilter] = useState<'all' | 'souvenir' | 'record'>('all');
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

  const handleStatusChange = async (
    id: string,
    newStatus: string
  ) => {
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

      if (!response.ok) throw new Error('Erreur serveur');

      // Refresh data
      await fetchUploads();
      setSelectedUpload(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUploads = uploads.filter((u) => {
    const statusMatch = filter === 'all' || u.status === filter;
    const typeMatch = typeFilter === 'all' || u.type === typeFilter;
    return statusMatch && typeMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳ En attente';
      case 'approved':
        return '✅ Approuvée';
      case 'rejected':
        return '❌ Refusée';
      default:
        return status;
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <section className="hunting-header text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-serif font-bold">🔧 Administration</h1>
            <p className="text-hunting-accent mt-2">
              Modération des soumissions
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          {/* Auth reminder */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded">
            <h3 className="font-bold text-blue-900 mb-2">🔒 Authentification</h3>
            <p className="text-sm text-blue-800">
              Cette page est actuellement accessible en développement sans authentification.
              <br />
              <strong>TODO:</strong> Brancher Cloudflare Access, JWT, ou un autre système d’auth avant de mettre en production.
            </p>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-hunting-dark mb-2">
                Statut
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-hunting-orange"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvées</option>
                <option value="rejected">Refusées</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-hunting-dark mb-2">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-hunting-orange"
              >
                <option value="all">Tous les types</option>
                <option value="souvenir">Souvenirs</option>
                <option value="record">Records</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="hunting-card p-4 text-center">
              <div className="text-3xl font-bold text-hunting-orange">
                {uploads.filter((u) => u.status === 'pending').length}
              </div>
              <p className="text-sm text-gray-600">En attente</p>
            </div>
            <div className="hunting-card p-4 text-center">
              <div className="text-3xl font-bold text-green-600">
                {uploads.filter((u) => u.status === 'approved').length}
              </div>
              <p className="text-sm text-gray-600">Approuvées</p>
            </div>
            <div className="hunting-card p-4 text-center">
              <div className="text-3xl font-bold text-red-600">
                {uploads.filter((u) => u.status === 'rejected').length}
              </div>
              <p className="text-sm text-gray-600">Refusées</p>
            </div>
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* List */}
            <div className="lg:col-span-1">
              {loading ? (
                <p className="text-gray-600">Chargement...</p>
              ) : filteredUploads.length === 0 ? (
                <p className="text-gray-600">Aucune soumission</p>
              ) : (
                <div className="space-y-3">
                  {filteredUploads.map((upload) => (
                    <button
                      key={upload.id}
                      onClick={() => setSelectedUpload(upload)}
                      className={`hunting-card p-4 w-full text-left hover:shadow-lg transition-shadow cursor-pointer ${
                        selectedUpload?.id === upload.id
                          ? 'border-2 border-hunting-orange'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-hunting-dark truncate">
                            {upload.title}
                          </h3>
                          <p className="text-xs text-gray-600 truncate">
                            Par {upload.uploaderName}
                          </p>
                        </div>
                        <span
                          className={`hunting-badge text-xs whitespace-nowrap ${getStatusColor(
                            upload.status
                          )}`}
                        >
                          {getStatusLabel(upload.status)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(upload.createdAt).toLocaleDateString('fr-CA')}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Detail */}
            <div className="lg:col-span-2">
              {selectedUpload ? (
                <div className="hunting-card p-6">
                  {/* Photos */}
                  {selectedUpload.photos.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-bold text-hunting-dark mb-3">Photos</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedUpload.photos.map((photo) => (
                          <Image
                            key={photo.id}
                            src={photo.path}
                            alt="Soumission"
                            width={800}
                            height={600}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Info */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <h3 className="font-bold text-hunting-dark mb-1">
                        {selectedUpload.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedUpload.description}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nom:</span>
                        <span className="font-semibold">{selectedUpload.uploaderName}</span>
                      </div>
                      {selectedUpload.uploaderEmail && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-semibold text-xs">
                            {selectedUpload.uploaderEmail}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-semibold">
                          {selectedUpload.type === 'souvenir' ? '📸 Souvenir' : '🏆 Record'}
                        </span>
                      </div>
                      {selectedUpload.species && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Espèce:</span>
                          <span className="font-semibold">{selectedUpload.species}</span>
                        </div>
                      )}
                      {selectedUpload.category && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Catégorie:</span>
                          <span className="font-semibold">{selectedUpload.category}</span>
                        </div>
                      )}
                    </div>

                    {selectedUpload.status === 'rejected' && selectedUpload.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 p-3 rounded text-sm">
                        <p className="font-semibold text-red-800 mb-1">Motif du refus:</p>
                        <p className="text-red-700">{selectedUpload.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {selectedUpload.status === 'pending' && (
                    <div className="space-y-3">
                      <button
                        onClick={() => handleStatusChange(selectedUpload.id, 'approved')}
                        disabled={updatingId === selectedUpload.id}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {updatingId === selectedUpload.id ? 'Mise à jour...' : '✅ Approuver'}
                      </button>

                      <div>
                        <textarea
                          placeholder="Motif du refus (optionnel)"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm mb-2 focus:outline-none focus:border-hunting-orange"
                          rows={2}
                        />
                        <button
                          onClick={() => handleStatusChange(selectedUpload.id, 'rejected')}
                          disabled={updatingId === selectedUpload.id}
                          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {updatingId === selectedUpload.id ? 'Mise à jour...' : '❌ Refuser'}
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedUpload.status !== 'pending' && (
                    <button
                      onClick={() => handleStatusChange(selectedUpload.id, 'pending')}
                      disabled={updatingId === selectedUpload.id}
                      className="w-full px-4 py-2 bg-hunting-orange text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                      {updatingId === selectedUpload.id
                        ? 'Mise à jour...'
                        : '⏳ Remettre en attente'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">
                    Sélectionnez une soumission pour voir les détails
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
