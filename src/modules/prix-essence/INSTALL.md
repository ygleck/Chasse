# 📦 Installation Complète - Setup Exact

Copier/coller les commandes dans l'ordre exact.

## 1️⃣ Installer Dépendances

```bash
npm install \
  react \
  react-dom \
  leaflet \
  xlsx \
  vitest

npm install -D \
  @astrojs/react \
  @types/leaflet \
  @testing-library/react
```

## 2️⃣ Modifier astro.config.mjs

Ouvrir `astro.config.mjs` et ajouter :

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  integrations: [react(), cloudflare()],
  adapter: cloudflare(),
  output: 'hybrid',

  // Si vous avez déjà d'autres config, les fusionner
});
```

## 3️⃣ Copier les Fichiers du Module

Si intégration dans votre site existant :

```bash
# Structure à créer/copier:

src/
├── modules/prix-essence/           # Le module complet
│   ├── types.ts
│   ├── config.ts
│   ├── lib/
│   │   ├── geo/distance.ts
│   │   ├── geo/geocoder.ts
│   │   ├── scoring/scoringEngine.ts
│   │   ├── data/xlsxFetcher.ts
│   │   ├── data/xlsxParser.ts
│   │   ├── cache/kvCache.ts
│   │   └── utils/
│   │       ├── storage.ts
│   │       ├── errors.ts
│   │       └── formatting.ts
│   ├── components/PrixEssenceApp.jsx
│   ├── __tests__/index.test.ts
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   └── QUICKSTART.md
│
├── pages/
│   ├── prix-essence.astro         # Page d'entrée
│   └── api/prix-essence/
│       ├── search.ts              # API search
│       ├── geocode.ts             # API geocode
│       └── refresh.ts             # API refresh
│
.env.prix-essence.example
vitest.config.ts
```

## 4️⃣ Configurer Package.json

Ajouter à `package.json` :

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "deploy": "npm run build && wrangler deploy",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "prix-essence:test": "vitest src/modules/prix-essence",
    "prix-essence:sync": "node scripts/sync-prix-essence.js",
    "prix-essence:refresh": "curl -X POST http://localhost:3000/api/prix-essence/refresh"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "leaflet": "^1.9.4",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@astrojs/react": "^4.0.0",
    "@astrojs/cloudflare": "^9.0.0",
    "@types/leaflet": "^1.9.0",
    "@testing-library/react": "^14.0.0",
    "vitest": "^1.0.0"
  }
}
```

## 5️⃣ Configurer Cloudflare (wrangler.toml)

Modifier ou créer `wrangler.toml` :

```toml
name = "votre-site"
type = "service"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# KV Namespaces
[[kv_namespaces]]
binding = "PRIX_ESSENCE_KV"
id = "abcd1234efgh5678ijkl9012mnop3456"
preview_id = "abcd1234efgh5678ijkl9012mnop3456"

# Env Production
[env.production]
route = "votre-domaine.com/*"
zone_id = "your-cloudflare-zone-id"

[env.production.vars]
PRIX_ESSENCE_REFRESH_SECRET = "your-secret-token"
PRIX_ESSENCE_CACHE_TTL = "3600"

# Preview/Staging
[env.preview]
route = "staging.votre-domaine.com/*"

[env.preview.vars]
PRIX_ESSENCE_REFRESH_SECRET = "preview-secret"
```

### Créer les KV Namespaces

```bash
# Production
wrangler kv:namespace create "prix_essence"

# Preview
wrangler kv:namespace create "prix_essence" --preview

# Copier les IDs retournés dans wrangler.toml
```

## 6️⃣ Configurer Variables d'Environnement

Créer `.env.local` (NE PAS committer):

```bash
PRIX_ESSENCE_REFRESH_SECRET=votre-secret-super-securise

# Optionnel:
# PRIX_ESSENCE_XLSX_URL=https://regieessenciquebec.ca/data/stations-*.xlsx
# PRIX_ESSENCE_XLSX_URL_FALLBACK=...
# GOOGLE_MAPS_API_KEY=...
```

Et configurer secrets Cloudflare :

```bash
# Production
wrangler secret put PRIX_ESSENCE_REFRESH_SECRET --env production

# Entrer votre secret quand demandé

# Preview
wrangler secret put PRIX_ESSENCE_REFRESH_SECRET --env preview
```

## 7️⃣ Ajouter script Sync (optionnel)

Créer `scripts/sync-prix-essence.js` :

```javascript
#!/usr/bin/env node
/**
 * Synchroniser les données XLSX vers KV (pré-populate cache)
 */

import * as XLSX from 'xlsx';
import { detectLatestXLSXUrl, downloadXLSXFile } from '../src/modules/prix-essence/lib/data/xlsxFetcher.js';
import { parseXLSXData } from '../src/modules/prix-essence/lib/data/xlsxParser.js';

async function syncData() {
  console.log('🔄 Synchronisation données Prix Essence...');

  try {
    const xlsxUrl = await detectLatestXLSXUrl();
    console.log(`📥 Téléchargement: ${xlsxUrl}`);

    const buffer = await downloadXLSXFile(xlsxUrl);
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(sheet);

    const stations = parseXLSXData(rawData);
    console.log(`✅ ${stations.length} stations parsées`);
    
    // Vous devez ensuite appeler l'endpoint de refresh en production
    console.log('💾 Exécuter: npm run prix-essence:refresh');

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

syncData();
```

Rendre exécutable :
```bash
chmod +x scripts/sync-prix-essence.js
```

## 8️⃣ Vérifier Installation

```bash
# 1. Build test
npm run build

# 2. Dev local
npm run dev

# 3. Visiter http://localhost:3000/prix-essence

# 4. Tester API
curl "http://localhost:3000/api/prix-essence/geocode?query=Montréal"
```

## 9️⃣ Tester Localement

```bash
# Terminal 1 : Lancer dev
npm run dev

# Terminal 2 : Exécuter tests
npm run test

# Terminal 3 : Actions manuelles
curl "http://localhost:3000/api/prix-essence/geocode?query=Montréal"
curl "http://localhost:3000/prix-essence"
```

## 🔟 Déploiement Production

### Build finalisé

```bash
npm run build
```

### Déployer à Cloudflare

```bash
npm run deploy
```

Ou manuellement :

```bash
wrangler deploy --env production
```

### Initialiser les données

Une fois le déploiement successful :

```bash
curl -X POST https://votre-domaine.com/api/prix-essence/refresh \
  -H "Authorization: Bearer YOUR_SECRET_TOKEN" \
  -H "Content-Type: application/json"
```

Vérifier la réponse :
```json
{
  "error": false,
  "data": {
    "message": "1250 stations mises en cache",
    "xlsxUrl": "https://regieessencequebec.ca/data/stations-20260404015005.xlsx"
  }
}
```

## ✅ Checklist Final

- [ ] npm install (toutes dépendances)
- [ ] astro.config.mjs modifié (react + cloudflare)
- [ ] Files du module copiés correctement
- [ ] wrangler.toml avec KV bindings
- [ ] KV namespaces créés (`wrangler kv:namespace create`)
- [ ] .env.local configuré
- [ ] Secrets Cloudflare configurés (`wrangler secret put`)
- [ ] Build test : `npm run build` sans erreurs
- [ ] Dev test : `npm run dev` et page accessible
- [ ] Tests passent : `npm run test`
- [ ] Déploiement prod : `npm run deploy`
- [ ] Refresh données : `curl POST /api/prix-essence/refresh`
- [ ] Page prix-essence.com/prix-essence accessible
- [ ] Recherche fonctionne

## 🆘 Troubleshooting rapide

| Erreur | Solution |
|--------|----------|
| `Module not found: @astrojs/react` | Relancer `npm install @astrojs/react` |
| `Cannot find binding for name "PRIX_ESSENCE_KV"` | Ajouter `[[kv_namespaces]]` à wrangler.toml |
| `KV namespace not found` | Exécuter `wrangler kv:namespace create "prix_essence"` |
| `React not rendering` | Vérifier `@astrojs/react` dans `astro.config.mjs` |
| `API returns 500` | Vérifier logs : `npm run dev` et ouvrir console |
| `Geocoding timeout` | Vérifier connectivité internet ou utiliser override XLSX_URL |

---

**Installation complète : ~10 minutes ⏱️**

Prêt pour production! 🚀
