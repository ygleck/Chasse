# 📌 Points clés à retenir

## Fichiers critiques à connaître

### 1. **Upload & Images** 
**Fichier:** `lib/imageProcessor.ts`

C'est ici que:
- Les images sont converties en WebP
- Les métadonnées EXIF sont supprimées (📍 GPS protégé)
- Les vignettes sont générées

⚠️ **Important:** Si problème sur Vercel, remplacer `sharp` par Cloudinary/imgix

---

### 2. **API Upload**
**Fichier:** `app/api/uploads/route.ts`

```typescript
POST /api/uploads        // Créer soumission
GET /api/uploads         // Lister (filtres: status, type)
```

Fait:
- Valide fichiers
- Traite images
- Sauvegarde en BD
- Toujours crée avec `status: "pending"`

---

### 3. **Modération**
**Fichier:** `app/api/uploads/[id]/status/route.ts`

```typescript
PATCH /api/uploads/[id]/status   // Changer statut
```

**TODO:** Ajouter authentification admin ici!

```typescript
// À décommenter:
const isAdmin = await checkAdminAuth(request);
if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
```

---

### 4. **Page Admin**
**Fichier:** `app/admin/page.tsx`

Actuellement:
- ✅ Affiche soumissions
- ✅ Filtres (statut, type)
- ✅ Modération (approuver/refuser)
- ⚠️ **SANS authentification** (dev mode)

---

### 5. **Base de données**
**Fichier:** `prisma/schema.prisma`

Tables:
- `UserUpload` - Soumissions (souvenirs + records)
- `Photo` - Photos associées

**Champs à retenir:**
- `status`: "pending" | "approved" | "rejected"
- `type`: "souvenir" | "record"
- Les photos sont converties en `/public/uploads/*.webp`

---

## Commandes essentielles

```bash
# Démarrage
npm run dev                    # Lancer serveur

# Base de données
npm run db:push               # Appliquer changements schema
npm run db:studio             # Interface visuelle BD
npx prisma migrate reset      # Réinitialiser complètement

# Tests
npm run lint                  # Vérifier code

# Build production
npm run build
npm start
```

---

## Architecture résumée

```
User Upload (/upload)
    ↓ FormData
API Route (/api/uploads)
    ├─ sharp: convert WebP + strip EXIF
    ├─ save to /public/uploads/
    └─ save to Prisma (status: pending)
    ↓
Admin Page (/admin)
    ├─ GET /api/uploads
    ├─ Show pending items
    └─ PATCH /api/uploads/[id]/status
    ↓
Public Pages (/galerie, /records)
    └─ GET /api/uploads?status=approved
```

---

## 🔒 Sécurité - FAIT vs TODO

### ✅ Déjà en place
- Suppression EXIF (GPS, etc.)
- Validation size fichiers
- Validation format
- Status pending par défaut

### ⚠️ À faire avant production
1. **Authentification admin** (Cloudflare Access, JWT, NextAuth)
2. **CSRF tokens** (protection formulaires)
3. **Rate limiting** (uploads par IP)
4. **Content moderation** (détecter gore, armes dangereuses)

---

## Couleurs & Design (Tailwind)

### Palette principale
```
--hunting-dark:   #3D2817  (brun foncé) - headers
--hunting-light:  #6B4423  (brun clair)
--hunting-kaki:   #8B9467  (kaki/vert) - détails
--hunting-orange: #FF8C00  (orange) - accents, boutons
--hunting-accent: #D4A373  (beige)
--hunting-slate:  #2C2C2C  (noir) - texte
```

### Classes custom
```css
.hunting-card        /* Bordures + ombre */
.hunting-badge       /* Badges orange */
.btn-primary         /* Boutons orange */
.btn-secondary       /* Boutons brun */
.trophy-card         /* Cards records */
.gallery-grid        /* Grille responsive */
```

---

## Déploiement Vercel

**Avant de déployer:**
1. Ajouter authentification admin
2. Configurer BD externe (DATABASE_URL)
3. Remplacer `sharp` par Cloudinary/imgix (image processing)
4. Tester complet localement

**Commandes:**
```bash
npm i -g vercel
vercel
vercel env add DATABASE_URL  # Ajouter secret
```

---

## Fichiers à customiser (TODO)

1. **Logo**
   - Remplacer 🦌 dans `components/Header.tsx`
   - Ajouter image dans `public/logo.png`

2. **Textes d'accueil**
   - Modifier `app/(public)/page.tsx`
   - Ajouter description groupe, liens Facebook

3. **Règles modération**
   - Ajuster texte dans `app/(public)/upload/page.tsx`
   - Adapter à votre groupe

4. **Couleurs (optionnel)**
   - Modifier `tailwind.config.ts`
   - Tester avec palette chasse alternative

---

## Debug & Logs

### Voir les logs du serveur
```
npm run dev
# Regarder terminal pour erreurs lors des uploads
```

### Console navigateur (F12)
- Erreurs API
- Erreurs TypeScript
- Warnings React

### Studio Prisma
```bash
npm run db:studio
# Voir données directement
```

---

## Points à ne pas oublier

1. ✅ **Les soumissions naissent avec `status: "pending"`**
   - Elles n'apparaissent JAMAIS publiquement avant approbation admin
   - Toujours filtrer par `status: "approved"` sur routes publiques

2. ✅ **Les photos sont automatiquement optimisées**
   - Conversion WebP
   - Génération vignettes
   - EXIF stripping
   - Les chemins sont stockés dans Photo table

3. ✅ **Admin n'a pas d'auth actuellement**
   - Avant production: ajouter login/middleware

4. ✅ **SQLite en développement**
   - Fichier: `prisma/dev.db`
   - En production: utiliser PostgreSQL ou Neon

---

## Prochaines itérations recommandées

### Phase 1 (Critical)
- [ ] Ajouter authentification `/admin`
- [ ] Tester workflow complet
- [ ] Ajouter vrais trophées/souvenirs
- [ ] Customiser logo et textes

### Phase 2 (Important)
- [ ] Ajouter notification email (approuvé/refusé)
- [ ] Pagination (si 100+ items)
- [ ] Dashboard stats
- [ ] Système commentaires

### Phase 3 (Nice-to-have)
- [ ] Recherche full-text
- [ ] Système de tags
- [ ] Export statistiques
- [ ] API mobile

---

## Contacts & Support

- **Documentation Next.js:** https://nextjs.org/docs
- **Documentation Prisma:** https://www.prisma.io/docs
- **Documentation Tailwind:** https://tailwindcss.com/docs

---

**Dernière mise à jour:** 6 décembre 2025

🚀 **Vous êtes prêt à déployer!**
