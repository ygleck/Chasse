'use client';

import Image from 'next/image';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useState } from 'react';

type UploadType = 'souvenir' | 'record' | null;

export default function Upload() {
  const [type, setType] = useState<UploadType>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    uploaderName: '',
    uploaderEmail: '',
    category: '', // for souvenir
    eventDate: '', // for souvenir
    participants: '', // for souvenir
    species: '', // for record
    huntDate: '', // for record
    region: '',
    weight: '',
    points: '',
    weaponType: '',
    caliber: '',
  });

  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const SOUVENIR_CATEGORIES = [
    'Camp',
    'Trip',
    'Trail cam',
    'Aménagement',
    'Soirée',
    'Autre',
  ];

  const SPECIES = [
    'Orignal',
    'Chevreuil',
    'Ours',
    'Petit gibier',
    'Canard',
    'Oie',
    'Autre',
  ];

  const WEAPON_TYPES = [
    'Carabine',
    'Arc',
    'Arbalète',
    'Fusil à plomb',
    'Autre',
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length + files.length > 5) {
      setMessage({
        text: 'Maximum 5 photos par soumission',
        type: 'error',
      });
      return;
    }

    // Validate file sizes (10MB max per file)
    const validFiles = selectedFiles.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        setMessage({
          text: `${file.name} est trop volumineux (max 10MB)`,
          type: 'error',
        });
        return false;
      }
      return true;
    });

    setFiles([...files, ...validFiles]);

    // Create preview URLs
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!type) {
      setMessage({ text: 'Veuillez sélectionner un type', type: 'error' });
      return;
    }

    if (!formData.title.trim()) {
      setMessage({ text: 'Le titre est requis', type: 'error' });
      return;
    }

    if (!formData.uploaderName.trim()) {
      setMessage({ text: 'Votre nom est requis', type: 'error' });
      return;
    }

    if (files.length === 0) {
      setMessage({ text: 'Vous devez télécharger au moins une photo', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('type', type);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('uploaderName', formData.uploaderName);
      uploadFormData.append('uploaderEmail', formData.uploaderEmail);

      if (type === 'souvenir') {
        uploadFormData.append('category', formData.category);
        uploadFormData.append('eventDate', formData.eventDate);
        uploadFormData.append('participants', formData.participants);
      } else {
        uploadFormData.append('species', formData.species);
        uploadFormData.append('huntDate', formData.huntDate);
        uploadFormData.append('region', formData.region);
        uploadFormData.append('weight', formData.weight);
        uploadFormData.append('points', formData.points);
        uploadFormData.append('weaponType', formData.weaponType);
        uploadFormData.append('caliber', formData.caliber);
      }

      files.forEach((file) => {
        uploadFormData.append('photos', file);
      });

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la soumission');
      }

      setMessage({
        text: 'Soumission reçue! Elle sera modérée avant publication.',
        type: 'success',
      });

      // Reset form
      setType(null);
      setFormData({
        title: '',
        description: '',
        uploaderName: '',
        uploaderEmail: '',
        category: '',
        eventDate: '',
        participants: '',
        species: '',
        huntDate: '',
        region: '',
        weight: '',
        points: '',
        weaponType: '',
        caliber: '',
      });
      setFiles([]);
      setPreviewUrls([]);
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'Erreur lors de la soumission',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <section className="hunting-header text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-serif font-bold">Soumettre une photo</h1>
            <p className="text-hunting-accent mt-2">
              Partagez vos souvenirs ou vos records avec la communauté
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 max-w-2xl">
          {/* Type selection */}
          {!type ? (
            <div className="space-y-6 mb-12">
              <h2 className="text-2xl font-bold text-hunting-dark">
                Quel type de contenu souhaitez-vous partager?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => setType('souvenir')}
                  className="hunting-card p-8 hover:border-hunting-orange border-2 border-transparent transition-all"
                >
                  <div className="text-4xl mb-4">📸</div>
                  <h3 className="text-xl font-bold text-hunting-dark mb-2">
                    Souvenir
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Photos du camp, trip, moments de groupe, trail cam,
                    aménagements...
                  </p>
                </button>

                <button
                  onClick={() => setType('record')}
                  className="hunting-card p-8 hover:border-hunting-orange border-2 border-transparent transition-all"
                >
                  <div className="text-4xl mb-4">🏆</div>
                  <h3 className="text-xl font-bold text-hunting-dark mb-2">
                    Record / Trophée
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Partagez vos plus beaux trophées avec détails de la chasse
                  </p>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Rules reminder */}
              <div className="bg-amber-50 border-l-4 border-hunting-orange p-4 mb-8 rounded">
                <h3 className="font-bold text-hunting-dark mb-2">
                  Rappel des règles de la communauté
                </h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ Visages: acceptés (consentement requis)</li>
                    <li>✗ Armes pointées sur quelqu’un</li>
                  <li>✗ Alcool + armes de façon dangereuse</li>
                  <li>✗ Contenu gore gratuit</li>
                  <li>✗ Infos personnelles sensibles (emails, adresses)</li>
                </ul>
              </div>

              {message && (
                <div
                  className={`p-4 rounded-lg mb-8 ${
                    message.type === 'success'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Common fields */}
                <div>
                  <label className="block text-sm font-semibold text-hunting-dark mb-2">
                    Titre *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ex: Belle journée au camp"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-hunting-orange"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-hunting-dark mb-2">
                    Description
                  </label>
                    <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Racontez l’histoire..."
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-hunting-orange"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-hunting-dark mb-2">
                      Votre nom *
                    </label>
                    <input
                      type="text"
                      name="uploaderName"
                      value={formData.uploaderName}
                      onChange={handleChange}
                      placeholder="Jean Chasseur"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-hunting-orange"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-hunting-dark mb-2">
                      Email (confidentiel)
                    </label>
                    <input
                      type="email"
                      name="uploaderEmail"
                      value={formData.uploaderEmail}
                      onChange={handleChange}
                      placeholder="votre@email.com"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-hunting-orange"
                    />
                  </div>
                </div>

                {/* Souvenir specific fields */}
                {type === 'souvenir' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-hunting-dark mb-2">
                          Catégorie
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-hunting-orange"
                        >
                          <option value="">Sélectionner...</option>
                          {SOUVENIR_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-hunting-dark mb-2">
                          Date de l’événement
                        </label>
                        <input
                          type="date"
                          name="eventDate"
                          value={formData.eventDate}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-hunting-orange"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-hunting-dark mb-2">
                        Participants
                      </label>
                      <input
                        type="text"
                        name="participants"
                        value={formData.participants}
                        onChange={handleChange}
                        placeholder="Noms des gars présents..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-hunting-orange"
                      />
                    </div>
                  </>
                )}

                {/* Record specific fields */}
                {type === 'record' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-hunting-dark mb-2">
                          Espèce *
                        </label>
                        <select
                          name="species"
                          value={formData.species}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-hunting-orange"
                          required
                        >
                          <option value="">Sélectionner...</option>
                          {SPECIES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-hunting-dark mb-2">
                          Date de la chasse
                        </label>
                        <input
                          type="date"
                          name="huntDate"
                          value={formData.huntDate}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-hunting-orange"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-hunting-dark mb-2">
                          Région/Zone
                        </label>
                        <input
                          type="text"
                          name="region"
                          value={formData.region}
                          onChange={handleChange}
                          placeholder="Ex: Mauricie"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-hunting-orange"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-hunting-dark mb-2">
                          Poids (lb)
                        </label>
                        <input
                          type="number"
                          name="weight"
                          value={formData.weight}
                          onChange={handleChange}
                          placeholder="250"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-hunting-orange"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-hunting-dark mb-2">
                          Points
                        </label>
                        <input
                          type="number"
                          name="points"
                          value={formData.points}
                          onChange={handleChange}
                          placeholder="140"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-hunting-orange"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-hunting-dark mb-2">
                          Type d’arme
                        </label>
                        <select
                          name="weaponType"
                          value={formData.weaponType}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-hunting-orange"
                        >
                          <option value="">Sélectionner...</option>
                          {WEAPON_TYPES.map((w) => (
                            <option key={w} value={w}>
                              {w}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-hunting-dark mb-2">
                        Calibre / Setup
                      </label>
                      <input
                        type="text"
                        name="caliber"
                        value={formData.caliber}
                        onChange={handleChange}
                        placeholder="Ex: 7mm Rem Mag, Burris Predator 4"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-hunting-orange"
                      />
                    </div>
                  </>
                )}

                {/* File upload */}
                <div>
                  <label className="block text-sm font-semibold text-hunting-dark mb-2">
                    Photos (1-5, max 10MB chacune) *
                  </label>
                  <div className="border-2 border-dashed border-hunting-kaki rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-input"
                    />
                    <label htmlFor="file-input" className="cursor-pointer block">
                      <div className="text-3xl mb-2">📷</div>
                      <p className="font-semibold text-hunting-dark">
                        Cliquez ou glissez vos photos
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        JPG, PNG, WebP acceptés
                      </p>
                    </label>
                  </div>
                </div>

                {/* Preview */}
                {previewUrls.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-hunting-dark mb-2">
                      Aperçu ({files.length}/5)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={url}
                            alt={`Preview ${index}`}
                            width={200}
                            height={200}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setType(null)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Envoi en cours...' : 'Soumettre'}
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
