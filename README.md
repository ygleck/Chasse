# 🦌 Groupe de Chasse - Site Web Complet

Site web pour votre groupe de chasse avec galerie de souvenirs, hall of fame et système de modération.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+ et npm
- SQLite3 (inclus dans la plupart des systèmes)

### Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Initialiser la base de données
npx prisma migrate dev --name init

# 3. Démarrer le serveur de développement
npm run dev
```

Le site sera accessible à `http://localhost:3000`

## 📁 Structure du projet

```
/
├── app/
│   ├── (public)/              # Pages publiques
│   │   ├── page.tsx           # Accueil /
│   │   ├── galerie/           # Galerie de souvenirs /galerie
│   │   ├── records/           # Hall of Fame /records
│   │   │   └── [id]/          # Détails d'un record /records/[id]
│   │   └── upload/            # Formulaire d'upload /upload
│   ├── admin/                 # Pages d'administration
│   │   └── page.tsx           # Interface de modération /admin
│   ├── api/                   # API routes
│   │   └── uploads/           # Endpoints de gestion des uploads
│   ├── layout.tsx             # Layout global
│   └── globals.css            # Styles globaux
├── components/                # Composants React réutilisables
│   ├── Header.tsx             # En-tête navigation
│   ├── Footer.tsx             # Pied de page
│   ├── MemoryCard.tsx         # Card pour souvenirs
│   └── TrophyCard.tsx         # Card pour records
├── lib/                       # Utilitaires
│   ├── prisma.ts              # Client Prisma singleton
│   └── imageProcessor.ts      # Traitement d'images (sharp)
├── prisma/                    # Configuration base de données
│   └── schema.prisma          # Schéma des tables
├── public/
│   └── uploads/               # Dossier où les images sont stockées
├── .env.local                 # Variables d'environnement
├── next.config.js             # Configuration Next.js
├── tailwind.config.ts         # Configuration Tailwind
├── tsconfig.json              # Configuration TypeScript
└── package.json               # Dépendances

```

## 🎯 Fonctionnalités principales

### Pages publiques

- **Accueil** (`/`): Présentation, quelques featured items, rappel des règles
- **Galerie** (`/galerie`): Grille de souvenirs avec filtres (catégorie, année)
- **Hall of Fame** (`/records`): Liste des records avec filtres (espèce, région, année)
- **Détails d'un record** (`/records/[id]`): Page détaillée avec infos complètes
- **Upload** (`/upload`): Formulaire pour soumettre souvenirs ou records

### Modération

- **Admin** (`/admin`): Interface de modération
  - Liste des soumissions en attente
  - Filtrage par statut et type
  - Aperçu des photos
  - Actions: Approuver, Refuser (avec motif)
  - Statistiques

## 📊 Modèle de données

### UserUpload
```
- id (string)
- type: "souvenir" | "record"
- status: "pending" | "approved" | "rejected"
- title (string)
- description (text)
- uploaderName (string)
- uploaderEmail (string, optionnel)
- photos (relation vers Photo[])
- createdAt, updatedAt

Champs record-spécifiques:
- species
- huntDate
- region
- weight, weightUnit
- points
- weaponType
- caliber

Champs souvenir-spécifiques:
- category
- eventDate
- participants
```

### Photo
```
- id (string)
- uploadId (FK vers UserUpload)
- path (chemin au fichier .webp)
- thumbnailPath (chemin à la vignette)
- createdAt
```

## 🖼️ Traitement des images

Les images uploadées sont automatiquement:
1. **Converties en WebP** (compression efficace, qualité 80%)
2. **Optimisées** (réduction de taille pour le web)
3. **Nettoyées de métadonnées EXIF** (GPS, etc. - protège vos spots!)
4. **Redimensionnées en vignettes** (300x300px pour affichage grille)

**Bibliothèque:** `sharp` (Node.js natif, pas de dépendances externes)

### Limitations et TODO

- **Vercel/Edge deployments:** `sharp` peut causer des problèmes. Solution: remplacer par une API externe (Cloudinary, imgix, Imgui). À adapter dans `lib/imageProcessor.ts`
- **Self-hosted:** installer `libvips` (dépendance système)

## 🔐 Authentification admin

**État actuel:** Pas d'authentification (dev mode)

**TODO pour production:**

Choisir une solution et implémenter dans `/api/uploads/[id]/status/route.ts`:

### Option 1: Cloudflare Access
```typescript
// Vérifier le header CF-Authorization
const cfAuth = request.headers.get('cf-authorization');
if (!cfAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
```

### Option 2: JWT simple
```typescript
const token = request.headers.get('authorization')?.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### Option 3: NextAuth.js
```typescript
const session = await getServerSession(authOptions);
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
```

## 🎨 Design & Couleurs

Palette de chasse (configurable dans `tailwind.config.ts`):
- **Brun foncé** (#3D2817): Headers, accents principaux
- **Kaki/Vert forêt** (#8B9467): Détails, textures
- **Orange chasse** (#FF8C00): Accents, boutons, badges
- **Noir/Gris** (#2C2C2C): Texte principal

Classe utilitaire Tailwind personnalisée: `hunting-*` (cards, badges, etc.)

## 📝 Commandes utiles

```bash
# Développement
npm run dev              # Démarrer le serveur dev avec hot-reload

# Base de données
npm run db:push          # Synchroniser le schéma Prisma → SQLite
npm run db:studio        # Ouvrir l'interface Prisma Studio

# Production
npm run build            # Compiler pour production
npm start                # Lancer le serveur de production
npm run lint             # Vérifier les erreurs ESLint

# Prisma
npx prisma migrate dev   # Créer une migration et l'appliquer
npx prisma generate      # Régénérer le client Prisma
```

## 🚀 Déploiement

### Vercel (recommandé pour Next.js)

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Déployer
vercel
```

**Points importants:**
- `DATABASE_URL`: Pointer vers une base de données externe (ex. Neon, Supabase) car Vercel ne persist pas le filesystem
- `sharp`: Peut ne pas compiler. Considérer Cloudinary pour le traitement d'images.

### Self-hosted (VPS, Docker)

1. Installer Node.js et SQLite
2. Cloner le repo
3. `npm install && npm run build`
4. `npm start`

Utiliser PM2 ou systemd pour gérer le processus.

## 🛡️ Sécurité

- ✅ Suppression automatique des métadonnées EXIF (protège les spots)
- ✅ Upload size limit (10MB max par image)
- ✅ Validation de type de fichier
- ✅ Stockage des infos d'upload : nom/pseudo seulement (emails non affichés)
- ⚠️ TODO: Authentification pour /admin
- ⚠️ TODO: CSRF protection
- ⚠️ TODO: Rate limiting sur les uploads

## 🐛 Troubleshooting

### "Cannot find module 'sharp'"
```bash
npm install sharp
```

### "database already exists with the same name"
```bash
rm prisma/dev.db
npx prisma migrate dev --name init
```

### Images non traitées / API timeout
- Vérifier que `sharp` est bien installé
- Si déployé sur Vercel: implémenter solution externe

## 📞 Support & Contact

Ce projet est configuré comme scaffold. Pour des questions:
1. Consulter la documentation Next.js: https://nextjs.org/docs
2. Documentation Prisma: https://www.prisma.io/docs
3. Documentation Tailwind: https://tailwindcss.com/docs

---

**Statut:** 🚧 Production-ready, authentification admin à implémenter

**Stack:** Next.js 15 + TypeScript + Tailwind + Prisma + SQLite

