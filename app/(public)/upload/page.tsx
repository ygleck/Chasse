'use client';

import Image from 'next/image';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useState } from 'react';

type UploadType = 'souvenir' | 'record' | null;

const SOUVENIR_CATEGORIES = ['Camp', 'Trip', 'Trail cam', 'Aménagement', 'Soirée', 'Autre'];
const SPECIES = ['Orignal', 'Chevreuil', 'Ours', 'Petit gibier', 'Canard', 'Oie', 'Autre'];
const WEAPON_TYPES = ['Carabine', 'Arc', 'Arbalète', 'Fusil à plomb', 'Autre'];

export default function Upload() {
  const [type, setType] = useState<UploadType>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    uploaderName: '',
    uploaderEmail: '',
    category: '',
    eventDate: '',
    species: '',
    huntDate: '',
    region: '',
    weight: '',
    points: '',
    weaponType: '',
    caliber: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length + files.length > 5) {
      setMessage({ text: 'Maximum 5 photos par soumission', type: 'error' });
      return;
    }

    const validFiles = selectedFiles.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        setMessage({ text: `${file.name} est trop volumineux (max 10MB)`, type: 'error' });
        return false;
      }
      return true;
    });

    setFiles([...files, ...validFiles]);
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreviewUrls((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) return;

    if (!formData.title || !formData.uploaderName || files.length === 0) {
      setMessage({ text: 'Veuillez remplir tous les champs obligatoires', type: 'error' });
      return;
    }

    const form = new FormData();
    form.append('type', type);
    Object.entries(formData).forEach(([key, value]) => {
      if (value) form.append(key, value);
    });
    files.forEach((file) => form.append('photos', file));

    try {
      setLoading(true);
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: form,
      });
      if (!response.ok) throw new Error('Erreur');
      setMessage({
        text: 'Soumission reçue! Elle sera modérée avant publication.',
        type: 'success',
      });
      setType(null);
      setFiles([]);
      setPreviewUrls([]);
      setFormData({
        title: '',
        description: '',
        uploaderName: '',
        uploaderEmail: '',
        category: '',
        eventDate: '',
        species: '',
        huntDate: '',
        region: '',
        weight: '',
        points: '',
        weaponType: '',
        caliber: '',
      });
    } catch {
      setMessage({ text: 'Erreur lors de la soumission', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* HEADER */}
        <section className="bg-gradient-forest text-white py-16">
          <div className="section-container">
            <h1 className="font-heading text-5xl mb-3 uppercase tracking-wider">
              Soumettre une Contribution
            </h1>
            <p className="text-lg text-hunting-gold opacity-90">
              Partagez vos souvenirs ou records avec la communauté
            </p>
          </div>
        </section>

        {/* TYPE SELECTION */}
        {!type ? (
          <section className="section-padding bg-hunting-cream">
            <div className="section-container max-w-4xl">
              <h2 className="text-center mb-12 uppercase tracking-wider">
                Quel type de soumission?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* SOUVENIR */}
                <button
                  onClick={() => setType('souvenir')}
                  className="card-premium card-hover group p-8 text-center"
                >
                  <div className="text-6xl mb-4">📸</div>
                  <h3 className="font-heading text-3xl mb-3 text-hunting-dark uppercase group-hover:text-hunting-orange transition-colors">
                    Souvenir
                  </h3>
                  <p className="text-hunting-slate/70 leading-relaxed mb-6">
                    Partagez des moments mémorables: camp, sorties, trail cam, aménagements, soirées...
                  </p>
                  <span className="badge-primary">Sélectionner</span>
                </button>

                {/* RECORD */}
                <button
                  onClick={() => setType('record')}
                  className="card-premium card-hover group p-8 text-center"
                >
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="font-heading text-3xl mb-3 text-hunting-dark uppercase group-hover:text-hunting-orange transition-colors">
                    Record
                  </h3>
                  <p className="text-hunting-slate/70 leading-relaxed mb-6">
                    Votre meilleur trophée: espèce, poids, points, région, date de la chasse...
                  </p>
                  <span className="badge-secondary">Sélectionner</span>
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="section-padding bg-hunting-cream">
            <div className="section-container max-w-2xl">
              {/* TYPE HEADER */}
              <div className="mb-8">
                <button
                  onClick={() => {
                    setType(null);
                    setMessage(null);
                  }}
                  className="text-hunting-gold hover:text-hunting-orange font-semibold mb-4 transition-colors"
                >
                  ← Retour
                </button>
                <h2 className="uppercase tracking-wider mb-2">
                  {type === 'souvenir' ? '📸 Ajouter un Souvenir' : '🏆 Ajouter un Record'}
                </h2>
              </div>

              {/* MESSAGE */}
              {message && (
                <div
                  className={`card-premium p-4 mb-6 ${
                    message.type === 'success' ? 'border-hunting-orange/50 bg-hunting-cream' : 'border-red-500/50 bg-red-50'
                  }`}
                >
                  <p className={message.type === 'success' ? 'text-hunting-orange' : 'text-red-600'}>
                    {message.text}
                  </p>
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleSubmit} className="card-premium bg-white p-8">
                {/* PHOTOS */}
                <div className="mb-8">
                  <label className="block text-sm font-bold uppercase tracking-wider text-hunting-slate mb-3">
                    Photos (1-5 obligatoires) *
                  </label>
                  <label className="block border-2 border-dashed border-hunting-gold rounded-lg p-8 text-center cursor-pointer hover:border-hunting-orange transition-colors">
                    <svg className="w-12 h-12 mx-auto mb-3 text-hunting-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-hunting-slate font-semibold">Cliquez ou glissez vos photos ici</p>
                    <p className="text-sm text-hunting-gold mt-1">JPG, PNG, WebP - Max 10MB par photo</p>
                    <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                  
                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                      {previewUrls.map((url, i) => (
                        <div key={i} className="relative group">
                          <img src={url} alt="" className="w-full h-32 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* COMMON FIELDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wider text-hunting-slate mb-2">
                      Titre *
                    </label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="form-input" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wider text-hunting-slate mb-2">
                      Votre Nom *
                    </label>
                    <input type="text" name="uploaderName" value={formData.uploaderName} onChange={handleInputChange} className="form-input" required />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold uppercase tracking-wider text-hunting-slate mb-2">
                    Description
                  </label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} className="form-textarea h-24" />
                </div>

                {/* SOUVENIR FIELDS */}
                {type === 'souvenir' && (
                  <div className="space-y-6 mb-6 p-6 bg-hunting-cream rounded-lg border-l-4 border-hunting-orange">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold uppercase tracking-wider text-hunting-slate mb-2">
                          Catégorie
                        </label>
                        <select name="category" value={formData.category} onChange={handleInputChange} className="form-input">
                          <option value="">Sélectionner...</option>
                          {SOUVENIR_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold uppercase tracking-wider text-hunting-slate mb-2">
                          Date
                        </label>
                        <input type="date" name="eventDate" value={formData.eventDate} onChange={handleInputChange} className="form-input" />
                      </div>
                    </div>
                  </div>
                )}

                {/* RECORD FIELDS */}
                {type === 'record' && (
                  <div className="space-y-6 mb-6 p-6 bg-hunting-cream rounded-lg border-l-4 border-hunting-orange">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold uppercase tracking-wider text-hunting-slate mb-2">
                          Espèce
                        </label>
                        <select name="species" value={formData.species} onChange={handleInputChange} className="form-input">
                          <option value="">Sélectionner...</option>
                          {SPECIES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold uppercase tracking-wider text-hunting-slate mb-2">
                          Région
                        </label>
                        <input type="text" name="region" value={formData.region} onChange={handleInputChange} className="form-input" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold uppercase tracking-wider text-hunting-slate mb-2">
                          Date de chasse
                        </label>
                        <input type="date" name="huntDate" value={formData.huntDate} onChange={handleInputChange} className="form-input" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold uppercase tracking-wider text-hunting-slate mb-2">
                          Poids (kg)
                        </label>
                        <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} className="form-input" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold uppercase tracking-wider text-hunting-slate mb-2">
                          Points
                        </label>
                        <input type="number" name="points" value={formData.points} onChange={handleInputChange} className="form-input" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold uppercase tracking-wider text-hunting-slate mb-2">
                          Type d'arme
                        </label>
                        <select name="weaponType" value={formData.weaponType} onChange={handleInputChange} className="form-input">
                          <option value="">Sélectionner...</option>
                          {WEAPON_TYPES.map((w) => (
                            <option key={w} value={w}>{w}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBMIT */}
                <div className="flex gap-4">
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? 'Envoi en cours...' : 'Soumettre'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setType(null)}
                    className="btn-secondary flex-1"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
