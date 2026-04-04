# 🗺️ Prix Essence Québec - Module Autonome

Architecture 100% indépendante et portable pour recherche de prix essence au Québec.

## 📋 Vue d'ensemble

Fonctionnalités :
- ✅ Recherche par adresse, code postal ou ville
- ✅ Géolocalisation GPS
- ✅ Scoring intelligent (prix + proximité)
- ✅ Top 10 des meilleures stations
- ✅ Filtres par type de carburant
- ✅ Rayons de recherche progressifs
- ✅ Carte interactive Leaflet + OpenStreetMap
- ✅ Historique et favoris (localStorage)
- ✅ Cache Cloudflare Workers KV
- ✅ Architecture PWA-ready

## 🏗️ Architecture

```
src/modules/prix-essence/
├── types.ts                    # Types centralisés
├── config.ts                   # Configuration
├── lib/
│   ├── geo/
│   │   ├── distance.ts        # Calcul Haversine
│   │   └── geocoder.ts        # Nominatim + Architecture multi-provider
│   ├── scoring/
│   │   └── scoringEngine.ts   # Moteur de scoring intelligent
│   ├── data/
│   │   ├── xlsxFetcher.ts     # Détection + téléchargement XLSX
│   │   └── xlsxParser.ts      # Parsing flexible des colonnes
│   ├── cache/
│   │   └── kvCache.ts         # Cloudflare Workers KV
│   └── utils/
│       ├── storage.ts         # localStorage (historique, favoris)
│       ├── errors.ts          # Gestion d'erreurs FR
│       └── formatting.ts      # Formatage affichage
├── components/
│   └── PrixEssenceApp.jsx     # Composant React principal
├── __tests__/
│   └── index.test.ts          # Tests unitaires
└── styles/
    └── main.css               # Styles autonomes

src/pages/
├── prix-essence.astro         # Page d'entrée
└── api/prix-essence/
    ├── search.ts              # Recherche stations
    ├── geocode.ts             # Géocodage adresse
    └── refresh.ts             # Refresh données (POST)
```

## 🚀 Installation & Setup

### 1. Dépendances NPM

```bash
npm install \
  react react-dom \
  leaflet \
  xlsx \
  vitest
```

Pour Astro + Cloudflare :
```bash
npm install -D \
  @astrojs/react \
  @astrojs/cloudflare
```

### 2. Configuration Astro

Ajouter React à `astro.config.mjs` :

```javascript
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  integrations: [react(), cloudflare()],
  // ... reste config
});
```

### 3. Configuration Cloudflare Workers KV

Dans `wrangler.toml`, ajouter le binding KV :

```toml
[[kv_namespaces]]
binding = "PRIX_ESSENCE_KV"
id = "your-namespace-id"
preview_id = "your-preview-namespace-id"
```

Créer les namespaces :
```bash
wrangler kv:namespace create "prix_essence"
wrangler kv:namespace create "prix_essence" --preview
```

### 4. Variables d'environnement

Copier et configurer :
```bash
cp .env.prix-essence.example .env.local
```

```env
# Optionnel : Override URL XLSX
# PRIX_ESSENCE_XLSX_URL=https://...

# Optionnel : Secret pour rafraîchissement
PRIX_ESSENCE_REFRESH_SECRET=super-secret-token
```

### 5. Tsconfig

Ajouter les paths pour faciliter les imports :

```json
{
  "compilerOptions": {
    "paths": {
      "@prix-essence/*": ["./src/modules/prix-essence/*"]
    }
  }
}
```

## 🧪 Tests

Exécuter les tests :

```bash
npm run test
```

Tests inclus :
- Calcul distance Haversine
- Scoring intelligent
- Parsing flexible XLSX
- Détection colonnes
- Auto-expansion rayon
- Validation données

## 📊 Scoring Intelligent

Formule utilisée :

```
Score = (prixNorm * 70% + distanceNorm * 30%) * 100
```

Où :
- `prixNorm` = 1 - (prix - minPrix) / (maxPrix - minPrix)
- `distanceNorm` = 1 - (distance - minDist) / (maxDist - minDist)

Plus bas = mieux pour les deux critères.

Stations avec prix invalides sont exclues du scoring.

## 🗺️ Cartographie

Par défaut : **Leaflet + OpenStreetMap** (gratuit, aucune API key requis).

Pour migrer vers **Google Maps** :
1. Configurer `GOOGLE_MAPS_API_KEY` en env var
2. Implémenter `GoogleMapsProvider` dans `lib/geo/geocoder.ts`
3. Adapter composants carte

Architecture prête à cette évolution.

## 🌐 Données Source

### Détection automatique

```typescript
// Scrape regieessencequebec.ca/data/
// Extrait tous les /data/stations-*.xlsx
// Sélectionne le plus récent par timestamp
```

### Fallback manuel

```bash
PRIX_ESSENCE_XLSX_URL=https://regieessencequebec.ca/data/stations-20260404015005.xlsx
```

### Parsing robuste

- Détection auto colonnes (variation de noms)
- Gestion cellules vides et mal formatées
- Normalisation prix (décimal et virgule)
- Génération ID station stable
- Logging des anomalies

## 🔄 Cache & Refresh

### TTL par défaut : 1 heure

Configurable dans `config.ts`:
```typescript
CACHE_TTL: 3600 // secondes
```

### Rafraîchissement manuel

```bash
curl -X POST http://localhost:3000/api/prix-essence/refresh \
  -H "Authorization: Bearer your-secret-token"
```

Alterne automatiquement entre :
1. Rappel depuis cache si frais
2. Refresh si expiré

## 🛡️ Gestion d'erreurs

Messages français pour :
- Adresse introuvable
- Géolocalisation refusée
- Aucune station trouvée
- XLSX inaccessible

Fallbacks intelligents et auto-expansion rayon.

## 📱 PWA-Ready

Architecture préparée migration vers PWA :
- Service worker ready
- Manifest ready
- Composants réutilisables
- Séparation data/UI claire
- App shell pattern applicable

## 💾 localStorage

Histori​que et favoris stockés automatiquement :
```javascript
// localStorage keys
{
  prix_essence_preferences: {...},
  prix_essence_history: [...],
  prix_essence_favorites: [...]
}
```

## 🚢 Déploiement Cloudflare

### Build

```bash
npm run build
```

### Deploy

```bash
npm run deploy
```

Ou avec Wrangler :

```bash
wrangler deploy
```

### Environnement

Configurer les secrets Cloudflare :
```bash
wrangler secret put PRIX_ESSENCE_XLSX_URL
wrangler secret put PRIX_ESSENCE_REFRESH_SECRET
```

## 📋 API Endpoints

### GET /api/prix-essence/search

Query params:
- `latitude` (required)
- `longitude` (required)
- `radius` (required, km)
- `fuelType` : regular|diesel|premium|all

Response:
```json
{
  "error": false,
  "data": {
    "bestOption": {...},
    "topStations": [...],
    "averagePrice": 1.55,
    "expandedRadius": 30,
    "message": "Aucune station à 20 km..."
  }
}
```

### GET /api/prix-essence/geocode

Query params:
- `query` (required, adresse/CP/ville)

Response:
```json
{
  "error": false,
  "data": {
    "latitude": 45.5017,
    "longitude": -73.5673,
    "displayName": "Montréal, Quebec, Canada",
    "city": "Montréal",
    "postalCode": "H1H"
  }
}
```

### POST /api/prix-essence/refresh

Headers:
- `Authorization: Bearer YOUR_SECRET` (si configuré)

Response:
```json
{
  "error": false,
  "data": {
    "message": "1250 stations mises en cache",
    "xlsxUrl": "..."
  }
}
```

## 🔧 Configuration avancée

### Pondération scoring

Dans `src/modules/prix-essence/config.ts`:

```javascript
SCORING: {
  priceWeight: 0.7,      // 70% prix
  distanceWeight: 0.3,   // 30% distance
}
```

### Auto-expansion rayon

```javascript
AUTO_EXPAND_RADII: [5, 10, 20, 30, 50]
```

Élargit progressivement jusqu'à trouver stations.

### Rayons disponibles

```javascript
RadiusOption.FIVE = 5
RadiusOption.TEN = 10
RadiusOption.TWENTY = 20
RadiusOption.THIRTY = 30
```

## 🎨 Design

- Mobile first
- Responsive >= 320px
- Dark mode ready (ajouter CSS vars)
- Accessibilité AA
- Performance optimisée

## 🐛 Dépannage

### KV not available

Vérifier `PRIX_ESSENCE_KV` binding dans `wrangler.toml` et contexte Astro.

### XLSX parse error

Vérifier format colonnes source et logs parser.

### Nominatim rate limit

Nominatim gratuit limité à ~ 1 req/sec. Pour production, utiliser instance privée.

### Leaflet not loading

Vérifier CDN unpkg accessible.

## 📖 Documentation complète

Structure docs :
- [Types](./types.ts) - Interfaces TypeScript
- [Config Hotspot](./config.ts) - Paramètres systè
- [Scoring Docs](./lib/scoring/) - Algo détaillé
- [Tests](./../../test/prix-essence.test.ts) - Cas d'usage

## 🔐 Conformité

- ✅ Attribution Régie l'énergie Québec
- ✅ Disclaimer prix variables
- ✅ Fallback élégant si source devient indisponible
- ✅ Pas de tracking utilisateur (localStorage uniquement)

## 🔜 Améliorations futures

- [ ] PWA avec Service Worker
- [ ] Notifications prix
- [ ] Partage lien résultats
- [ ] Historique synced cloud
- [ ] Support multi-région (Canada)
- [ ] Pagination top stations
- [ ] Filtres avancés (station chain, services) - [ ] Dark mode UI
- [ ] Intégration Google Maps optionnel
- [ ] Export/partage data

## 📄 Licence

À adapter selon votre politique.

---

**Module 100% autonome et portable.** Copiez le dossier `src/modules/prix-essence/`, la page `src/pages/prix-essence.astro` et l'API `src/pages/api/prix-essence/` dans n'importe quel projet Astro.
