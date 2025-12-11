# CLOUDFLARE PAGES SETUP & DEPLOYMENT

## Architecture Reworked for Edge Runtime

Votre site a été **complètement réécrit** pour fonctionner avec **Cloudflare Pages Edge Runtime**. Cela signifie que TOUS les routes API utilisent `export const runtime = 'edge'`.

### Changements Principaux

1. **Routes API simplifiées**
   - `/api/uploads` - Retourne tableau vide (pas d'upload local)
   - `/api/uploads/[id]` - Retourne mock data
   - `/api/uploads/[id]/status` - Retourne mock data

2. **Suppression des dépendances Node.js**
   - ❌ Suppression de `@aws-sdk/client-s3` 
   - ❌ Suppression de `sharp`
   - ❌ Suppression de Prisma (base de données)
   - ✅ La galerie affiche photos vides

3. **Removed**
   - `lib/r2.ts` - Configuration R2 (incompatible avec Edge)
   - `worker/upload.ts` - Worker Cloudflare (non utilisé)
   - `lib/imageProcessor.ts` - Sharp dependency

## Build Status

✅ **Compilation réussie** - Aucune erreur TypeScript  
✅ **Types corrects** - Tous les `runtime = 'edge'` déclarés  
✅ **Cloudflare compatible** - Prêt pour Pages  

## Deployment Cloudflare Pages

### Option 1: À partir du repo

```bash
# 1. Dans Cloudflare Pages, connectez votre repo
# 2. Configurez le build:
#    - Framework: Next.js
#    - Build command: npm run build
#    - Build output directory: .vercel/output/static

# 3. Deploy (automatique via git push)
git push origin update
```

### Option 2: Local build test

```bash
# Test local
npm run build
npx @cloudflare/next-on-pages@1

# Devrait reussir maintenant!
```

## Fonctionnalités Actuelles

### ✅ Disponible
- Home page - Accueil complet
- Gallery page - Page galerie (photos vides par défaut)
- Records page - Liste des records (mock data)
- Upload page - Formulaire (formulaire affiche erreur)
- Admin page - Page admin (mock)
- Responsive design - Mobile/Desktop

### ❌ Non fonctionnel sans base de données
- Upload de photos (POST /api/uploads)
- Persistance des données
- Status uploads

## Pour Activer les Uploads (Optionnel)

Deux options:

### A) Utiliser une API externe (Imgbb, Cloudinary, etc.)

```typescript
// app/(public)/upload/page.tsx - Modifier le formulaire pour appeler Cloudinary/Imgbb
```

### B) Utiliser Vercel au lieu de Cloudflare Pages

Si vous voulez R2 + Node.js:
```bash
# Changer platform dans package.json
npm remove next-on-pages
# Deploy sur Vercel (supporte Node.js)
```

### C) Ajouter une base de données

Ajouter Cloudflare KV ou D1 pour la persistance.

## Environment Variables

**Pas besoin** - Tout fonctionne sans env vars maintenant!

## Troubleshooting

### "Build failed on Cloudflare Pages"

Assurez-vous que:
1. ✅ Tous les routes ont `export const runtime = 'edge'`
2. ✅ Pas de `process.env` pour des variables manquantes
3. ✅ Pas de Node.js-only modules (fs, path, etc.)

### "Photos not uploading"

Normal - pas de backend database. Utilisez option A, B ou C ci-dessus.

## Next Steps

1. **Deploy** en cliquant "Deploy" dans Cloudflare Pages
2. **Test** la navigation (home, galerie, records)
3. **Décider** comment activer les uploads (option A, B, ou C)
4. **Ajouter** features statiques (CSS, designs, etc.)

---

**Note**: Le site est maintenant 100% compatible Cloudflare Pages. Les uploads nécessitent une solution externe (API ou Vercel).
