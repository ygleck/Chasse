# 🚀 Démarrage Rapide - Prix Essence Module

Intégrer le module Prix Essence dans votre site Astro en < 15 min.

## 📦 Installation Rapide

### Étape 1 : Dépendances

```bash
npm install react react-dom leaflet xlsx vitest @testing-library/react
npm install -D @astrojs/react
```

### Étape 2 : Activer React dans Astro

**astro.config.mjs**
```javascript
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
});
```

### Étape 3 : Ajouter Script de Scraping/Parsing XLSX

Créer un script `scripts/sync-prix-essence.js` pour pré-charger le cache :

```javascript
#!/usr/bin/env node

/**
 * Script: Synchroniser les données XLSX vers KV
 * À exécuter lors du deploy ou régulièrement
 */

import * as XLSX from 'xlsx';
import { detectLatestXLSXUrl, downloadXLSXFile } from './src/modules/prix-essence/lib/data/xlsxFetcher';
import { parseXLSXData } from './src/modules/prix-essence/lib/data/xlsxParser';

async function syncData() {
  console.log('🔄 Synchronisation Prix Essence...');

  try {
    // Détecter le XLSX
    const xlsxUrl = await detectLatestXLSXUrl();
    console.log(`📥 Téléchargement: ${xlsxUrl}`);

    // Télécharger
    const buffer = await downloadXLSXFile(xlsxUrl);

    // Parser
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(sheet);

    const stations = parseXLSXData(rawData);

    console.log(`✅ ${stations.length} stations parsées`);
    console.log('💾 À déployer: utiliser endpoint POST /api/prix-essence/refresh');

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

syncData();
```

### Étape 4 : Package.json Scripts

Ajouter à votre `package.json`:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "deploy": "npm run build && wrangler deploy",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "prix-essence:sync": "node scripts/sync-prix-essence.js",
    "prix-essence:refresh": "curl -X POST http://localhost:3000/api/prix-essence/refresh"
  }
}
```

### Étape 5 : Configuration Cloudflare (wrangler.toml)

```toml
[[kv_namespaces]]
binding = "PRIX_ESSENCE_KV"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-namespace-id"

[env.production.vars]
PRIX_ESSENCE_REFRESH_SECRET = "your-secret"
```

### Étape 6 : Variables d'environnement (.env.local)

```bash
PRIX_ESSENCE_REFRESH_SECRET=your-secret-token
# Optionnel:
# PRIX_ESSENCE_XLSX_URL=https://regieessencequebec.ca/data/stations-*.xlsx
```

## ✅ Vérification Installation

### 1. Tester localement

```bash
npm run dev
```

Puis visiter: `http://localhost:3000/prix-essence`

### 2. Vérifier les endpoints

```bash
# Geocoding
curl "http://localhost:3000/api/prix-essence/geocode?query=Montréal"

# Search (après avoir ajouté des données au cache)
curl "http://localhost:3000/api/prix-essence/search?latitude=45.5&longitude=-73.5&radius=20&fuelType=regular"
```

### 3. Initialiser le cache

Via script :
```bash
npm run prix-essence:sync
```

Puis déployer en production.

## 🧪 Tester en Local

```bash
# Lancer Astro en dev
npm run dev

# Accéder à la page
open http://localhost:3000/prix-essence

# Tester les recherches:
# 1. Entrer une adresse (ex: "1375 Rue Saint-Laurent, Montréal")
# 2. Cliquer "Rechercher" ou "Ma Position"
```

## 🚢 Déploiement

### Build

```bash
npm run build
```

### Déployer à Cloudflare Pages

Si vous utilisez Cloudflare Pages + Workers :

```bash
npm run deploy
```

### Initialiser les données

Une fois déployé en production :

```bash
curl -X POST https://votre-domaine.com/api/prix-essence/refresh \
  -H "Authorization: Bearer YOUR_SECRET_TOKEN"
```

## 📝 Structure Fichiers

Le module complète est situé à:

```
src/modules/prix-essence/         ← Module autonome
src/pages/prix-essence.astro      ← Page d'entrée
src/pages/api/prix-essence/       ← Endpoints API
```

**Vous pouvez copier uniquement ces 3 éléments dans n'importe quel autre site Astro.**

## 🔧 Configurer les Paramètres

### Scoring

Éditer `src/modules/prix-essence/config.ts`:

```typescript
SCORING: {
  priceWeight: 0.7,      // Augmenter pour privilégier le prix
  distanceWeight: 0.3,   // Augmenter pour privilégier la proximité
}
```

### Rayons d'auto-expansion

```typescript
AUTO_EXPAND_RADII: [5, 10, 20, 30, 50]
```

### TTL Cache

```typescript
CACHE_TTL: 3600  // secondes (1h)
```

## 🐛 Common Issues

| Problème | Solution |
|----------|----------|
| `KV storage not available` | Configurer KV dans wrangler.toml + redéployer |
| `XLSX parse error` | Vérifier format du fichier source, voir logs parser |
| `Geocoding timeout` | Vérifier connectivité Nominatim, ou utiliser override XLSX_URL |
| `Aucune station trouvée` | Vérifier que KV contient des données (refresh), ou élargir rayon |
| `React not rendering` | Vérifier @astrojs/react installé et configuré |

## 📚 Documentation Complète

- **README.md** - Architecture et fonctionnalités
- **DEPLOYMENT.md** - Guide déploiement Cloudflare détaillé
- **src/modules/prix-essence/types.ts** - Interfaces TypeScript
- **src/modules/prix-essence/config.ts** - Tous les paramètres

## 🎯 Prochaines Étapes

1. ✅ Dépendances installées
2. ✅ Astro configuré
3. ✅ Page créée et accessible
4. ✅ API endpoints testés
5. ⏭️ **Déployer** : `npm run deploy`
6. ⏭️ Initialiser données : `curl -X POST .../refresh`
7. ⏭️ Monitorer performance

## 💬 Support

Pour toute question, consultez :
- Les logs du terminal (dev mode)
- Les erreurs navigateur (console)
- Les logs Cloudflare Dashboard (production)

---

**Module complètement autonome, portable et production-ready! 🚀**
