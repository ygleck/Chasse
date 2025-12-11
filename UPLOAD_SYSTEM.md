# 📋 Système Upload & Admin Complet

## 🎯 Vue d'ensemble

Le site inclut maintenant un système complet de gestion d'upload de photos avec modération:

### Pages publiques
- **`/upload`** - Formulaire pour soumettre des photos (souvenir ou record)
- **`/galerie`** - Galerie de toutes les photos approuvées avec PhotoSwipe
- **`/records`** - Hall of Fame avec les trophées approuvés

### Page admin
- **`/admin`** - Tableau de bord de modération (approuver/rejeter/supprimer)

---

## 🚀 Fonctionnalités

### 1️⃣ Upload de Photos
Les utilisateurs peuvent soumettre:

**Souvenirs** 📸
- Catégorie (Camp, Trip, Trail cam, Aménagement, Soirée, Autre)
- Date de l'événement
- Description
- 1-5 photos max

**Records** 🏆
- Espèce (Orignal, Chevreuil, Ours, Petit gibier, Canard, Oie, Autre)
- Poids & Points
- Région & Date de chasse
- Type d'arme (Carabine, Arc, Arbalète, Fusil à plomb, Autre)
- Calibre
- 1-5 photos max

### 2️⃣ Traitement des Photos
Chaque photo téléchargée est:
- Convertie en **WebP** (qualité 80) pour optimiser les performances
- Générée en **Thumbnail** (300x300, qualité 70)
- Stockée dans `public/uploads/`
- Enregistrée en base de données avec les métadonnées

### 3️⃣ Modération
Les admins peuvent:
- **Filtrer** par statut (En attente, Approuvés, Rejetés)
- **Approuver** une soumission pour la publier
- **Rejeter** avec raison explicite
- **Supprimer** une soumission
- **Réexaminer** une soumission rejetée/approuvée
- Voir les **thumbnails** et métadonnées

### 4️⃣ Galerie PhotoSwipe
- Visualiser toutes les photos approuvées
- **Zoom** & **Pan** sur les images
- **Swipe** pour naviguer (mobile)
- **Clavier** pour naviguer (desktop)
- Affichage des **métadonnées** en caption

---

## 📁 Structure des Fichiers

```
app/
├── (public)/
│   ├── upload/
│   │   └── page.tsx          # Formulaire d'upload
│   ├── galerie/
│   │   └── page.tsx          # Galerie avec PhotoSwipe
│   └── records/
│       └── page.tsx          # Hall of Fame
├── admin/
│   └── page.tsx              # Dashboard modération
├── api/uploads/
│   ├── route.ts              # POST upload + GET liste
│   └── [id]/status/
│       └── route.ts          # PATCH statut + DELETE
└── globals.css               # Styles (form-input, btn-*, etc.)

components/
└── PhotoSwipeGallery.tsx      # Composant lightbox réutilisable

prisma/
├── schema.prisma             # Modèle UserUpload & Photo
└── seedData.ts               # Script pour peupler la BD

public/uploads/               # Dossier des photos traitées
```

---

## 🔧 API Endpoints

### POST `/api/uploads`
Soumettre une nouvelle contribution

**Body (FormData):**
```
type: "souvenir" | "record"
title: string
uploaderName: string
uploaderEmail?: string
description?: string
photos: File[] (1-5)
// Champs souvenir:
category?: string
eventDate?: string
// Champs record:
species?: string
huntDate?: string
region?: string
weight?: number
points?: number
weaponType?: string
caliber?: string
```

### GET `/api/uploads`
Récupérer les soumissions

**Query params:**
- `type`: "souvenir" | "record"
- `status`: "pending" | "approved" | "rejected"

### PATCH `/api/uploads/[id]/status`
Changer le statut (admin)

**Body:**
```json
{
  "status": "approved|rejected|pending",
  "rejectionReason": "optional reason"
}
```

### DELETE `/api/uploads/[id]/status`
Supprimer une soumission (admin)

---

## 💾 Modèle de Données

### UserUpload
```prisma
id: String (CUID)
type: "souvenir" | "record"
status: "pending" | "approved" | "rejected"
title: String
description: String
uploaderName: String
uploaderEmail: String?
photos: Photo[] (relation)
createdAt: DateTime
updatedAt: DateTime

// Record-specific
species: String?
huntDate: DateTime?
region: String?
weight: Float?
points: Int?
weaponType: String?
caliber: String?

// Souvenir-specific
eventDate: DateTime?
category: String?
participants: String?

// Admin
rejectionReason: String?
```

### Photo
```prisma
id: String (CUID)
uploadId: String (FK)
upload: UserUpload (relation)
path: String (/uploads/xxx.webp)
thumbnailPath: String (/uploads/xxx-thumb.webp)
createdAt: DateTime
```

---

## 🎨 Style & Composants

### Classes CSS Disponibles

**Inputs & Forms:**
```css
.form-input          /* Input texte */
.form-textarea       /* Textarea */
```

**Buttons:**
```css
.btn-primary         /* Bouton orange/gold gradient */
.btn-secondary       /* Bouton gris outline */
.btn-danger          /* Bouton rouge danger */
```

**Badges:**
```css
.badge-primary       /* Fond orange/gold */
.badge-secondary     /* Outline gold */
.badge-outline       /* Outline slate */
```

**Cards:**
```css
.card-premium        /* Carte avec ombre et border */
.card-hover          /* Avec effet hover scale */
```

---

## 🧪 Tester le Système

### 1. Peupler la BD avec des données test:
```bash
npm run seed
```

### 2. Accéder aux pages:
```
http://localhost:3000/upload          # Soumettre
http://localhost:3000/galerie         # Voir photos approuvées
http://localhost:3000/records         # Hall of Fame
http://localhost:3000/admin           # Modérer les soumissions
```

### 3. Workflow de test:
1. Aller à `/upload`
2. Soumettre une "Record" ou "Souvenir"
3. Aller à `/admin`
4. Approuver la soumission
5. Voir le résultat à `/galerie` ou `/records`

---

## ⚡ Optimisations

✅ **Photos WebP** - 60-70% plus petit que JPG
✅ **Thumbnails** - Chargement rapide de la galerie
✅ **PhotoSwipe** - Lightbox professionnel, mobile-friendly
✅ **Prisma** - ORM type-safe avec SQLite
✅ **Base de données** - Relation cascade (Delete upload = Delete photos)
✅ **Next.js Server** - API routes sécurisées

---

## 🔒 Sécurité

- ✅ Validation des types de fichier (images)
- ✅ Limite de taille (10MB max)
- ✅ Limite du nombre de photos (5 max)
- ✅ Stockage sécurisé en `/public/uploads/`
- ✅ Suppression en cascade via Prisma

---

## 📝 Notes

- Le système fonctionne avec une base SQLite locale
- Les photos approuvées sont visibles publiquement
- Les soumissions en attente sont visibles uniquement en admin
- Les rejets peuvent avoir une raison explicite
- Tous les uploads sont timestampés (createdAt/updatedAt)

---

**Version:** 1.0 - Complète & Fonctionnelle ✅
