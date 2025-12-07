# Architecture du projet - Groupe de Chasse

## Vue d'ensemble

```
CLIENT (Navigation & Contenu)
    ↓
NEXT.JS APP ROUTER
    ├─ Pages publiques: /galerie, /records, /upload
    ├─ Page admin: /admin
    └─ API routes: /api/uploads
    ↓
BASE DE DONNÉES (SQLite + Prisma)
    ├─ UserUpload
    └─ Photo
    ↓
STOCKAGE D'IMAGES
    ├─ /public/uploads/*.webp (images principales)
    └─ /public/uploads/*-thumb.webp (vignettes)
```

## Flux de données

### 1. Upload de contenu

```
Utilisateur upload dans /upload
    ↓
FormData avec fichiers et métadonnées
    ↓
POST /api/uploads/route.ts
    ├─ Validation des fichiers
    ├─ sharp.processImage()
    │   ├─ Conversion WebP
    │   ├─ Génération vignettes
    │   └─ Suppression EXIF
    ├─ Prisma.userUpload.create(status: "pending")
    └─ Réponse utilisateur (confirmation)
    ↓
Base de données (status = "pending")
    ↓
Photos stockées dans /public/uploads/
```

### 2. Modération (Admin)

```
Admin accède /admin
    ↓
GET /api/uploads (tous les statuts)
    ├─ Affiche liste avec filtres
    └─ Sélection d'une soumission
    ↓
Affichage des détails (photos, infos)
    ↓
Admin clique "Approuver" ou "Refuser"
    ↓
PATCH /api/uploads/[id]/status
    ├─ Met à jour status → "approved" ou "rejected"
    └─ Optionnel: motif de refus
    ↓
Base de données mise à jour
```

### 3. Affichage public

```
Utilisateur accède /galerie ou /records
    ↓
GET /api/uploads?status=approved&type=souvenir (ou record)
    ↓
Prisma.userUpload.findMany({ where: { status: 'approved', type } })
    ↓
Rendu des cards avec thumbnailPath
    ↓
Affichage responsive (Tailwind grid)
```

## Stack technologique détaillé

### Frontend
- **Next.js 15**: Framework React avec SSR/SSG
- **TypeScript**: Type-safety
- **Tailwind CSS**: Styling (utility-first)
- **React hooks**: État client

### Backend
- **Next.js API Routes**: Endpoints serverless
- **Prisma**: ORM + migrations DB
- **sharp**: Traitement d'images (Node.js)

### Base de données
- **SQLite**: Fichier local en dev, facilement migratable en prod
- **Schéma Prisma**: Définition des tables et relations

### Déploiement
- **Vercel**: Optimal pour Next.js
- **Self-hosted**: VPS + Node.js + SQLite/PostgreSQL

## Points d'extension

### 1. Authentification Admin

**Localisation:** `/api/uploads/[id]/status/route.ts`

```typescript
// TODO: Ajouter middleware d'auth
const isAdmin = await checkAdminAuth(request);
if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
```

**Options:**
- Cloudflare Access (recommandé pour Vercel)
- JWT simple + localStorage
- NextAuth.js
- Magic links

### 2. Stockage d'images externe

**Localisation:** `lib/imageProcessor.ts`

Remplacer `sharp` par une API:
- **Cloudinary**: Traitement d'images cloud
- **imgix**: CDN + transformation
- **AWS S3**: Stockage scalable
- **R2 (Cloudflare)**: S3-compatible, bon marché

```typescript
// Exemple AWS S3
const s3 = new AWS.S3();
const url = await s3.upload({
  Bucket: process.env.AWS_BUCKET,
  Key: `uploads/${filename}`,
  Body: file,
}).promise();
```

### 3. Notifications email

Ajouter après approbation/refus:

```typescript
await sendEmail({
  to: upload.uploaderEmail,
  subject: 'Votre soumission a été approuvée!',
  template: 'approved',
});
```

Services: SendGrid, Mailgun, Resend

### 4. Analytics

Ajouter page dashboard admin avec:
- Total soumissions par mois
- Taux approbation/refus
- Trophées les plus consultés
- Populaires espèces/régions

### 5. Système de commentaires

Ajouter table Comment, permettre aux utilisateurs:
- Commenter sur les records
- Réactions emoji
- Modération des commentaires

## Sécurité - Checklist

- [x] Suppression EXIF (protège spots GPS)
- [x] Validation size fichiers
- [x] Validation type MIME
- [ ] **TODO:** Authentification admin
- [ ] **TODO:** CSRF protection (ajouter tokens)
- [ ] **TODO:** Rate limiting (uploads par IP)
- [ ] **TODO:** SQL injection prevention (Prisma le fait)
- [ ] **TODO:** XSS prevention (React échappe le contenu)
- [ ] **TODO:** Validate image content (détecter gore, armes)

## Performance

### Optimisations en place

- ✅ Images WebP (30% plus petit que JPEG)
- ✅ Thumbnails 300x300 (fast loading)
- ✅ Tailwind CSS purging (CSS minimal)
- ✅ Next.js Image optimization
- ✅ Database queries optimizées

### À améliorer

- [ ] Ajouter pagination (quand 100+ items)
- [ ] Caching (Redis, ISR)
- [ ] CDN pour images (Vercel Image Optimization, Cloudinary)
- [ ] Compression gzip (Next.js par défaut)

## Maintenance

### Backups
```bash
# SQLite backup
cp prisma/dev.db backups/dev.db.$(date +%Y%m%d)
```

### Migration vers PostgreSQL (si besoin scale)
1. Installer PostgreSQL
2. Changer DATABASE_URL dans .env
3. `npx prisma migrate deploy`
4. Tests

### Monitoring
- Logs erreurs: Sentry, LogRocket
- Analytics: Vercel Analytics, Plausible
- Uptime: Uptime Robot, Pingdom

---

**Documentation générée:** Décembre 2024
**Dernière mise à jour:** [À compléter après lancements/changements]
