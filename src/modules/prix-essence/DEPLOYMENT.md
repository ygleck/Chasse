# 🚀 Guide Déploiement Cloudflare - Prix Essence

## ⚡ Setup Cloudflare Workers + Pages

### 1. Pré-requis

```bash
npm install -g wrangler
wrangler login
```

### 2. Configuration wrangler.toml

Ajouter au fichier `wrangler.toml` existant :

```toml
# Configuration Astro
[env.production]
route = "exemple.com/*"
zone_id = "your-zone-id"

# Bindings KV pour Prix Essence
[[kv_namespaces]]
binding = "PRIX_ESSENCE_KV"
id = "abcd1234efgh5678"
preview_id = "abcd1234efgh5678"

# Secrets
[env.production.vars]
PRIX_ESSENCE_REFRESH_SECRET = "your-secret-token"
```

### 3. Créer les KV Namespaces

```bash
# Production
wrangler kv:namespace create "prix_essence" --preview false

# Preview (staging)
wrangler kv:namespace create "prix_essence" --preview true
```

Copier les IDs retournés dans `wrangler.toml`.

### 4. Configurer les Secrets

```bash
# Production
wrangler secret put PRIX_ESSENCE_REFRESH_SECRET --env production

# Preview
wrangler secret put PRIX_ESSENCE_REFRESH_SECRET --env preview
```

Entrer votre token secret quand demandé.

### 5. Configuration astro.config.mjs

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  integrations: [react(), cloudflare()],
  adapter: cloudflare(),
  output: 'hybrid',
});
```

### 6. Build & Deploy

```bash
# Build
npm run build

# Deploy à Cloudflare Pages
npm run deploy
```

Ou avec Wrangler direct :

```bash
wrangler deploy
```

## 🔗 URL Endpoints

Une fois déployé, vos endpoints seront accessibles à :

```
https://votre-domaine.com/api/prix-essence/search?latitude=45.5&longitude=-73.5&radius=20&fuelType=regular
https://votre-domaine.com/api/prix-essence/geocode?query=Montréal
https://votre-domaine.com/api/prix-essence/refresh
https://votre-domaine.com/prix-essence
```

## 📝 Variables d'environnement

Les secrets configurés via `wrangler secret put` sont automatiquement disponibles dans le contexte Worker.

Dans vos fonctions API, accédez-les via `process.env`:

```typescript
const secret = process.env.PRIX_ESSENCE_REFRESH_SECRET;
const xlsxUrl = process.env.PRIX_ESSENCE_XLSX_URL;
```

## 🔍 Vérification déploiement

### Tester l'endpoint search

```bash
curl "https://votre-domaine.com/api/prix-essence/search?latitude=45.5&longitude=-73.5&radius=20&fuelType=regular"
```

### Tester le geocoding

```bash
curl "https://votre-domaine.com/api/prix-essence/geocode?query=Montréal"
```

### Rafraîchir les données

```bash
curl -X POST https://votre-domaine.com/api/prix-essence/refresh \
  -H "Authorization: Bearer votre-secret-token"
```

## 📊 Monitoring Cloudflare

1. Aller sur https://dash.cloudflare.com
2. Sélectionner votre site
3. Analytics > Workers/Pages
4. Vérifier :
   - Requests
   - Latency
   - Errors

## 💾 KV Performance

Les données du XLSX sont stockées dans le KV avec TTL de 1h (configurabel).

Pour optimiser :

```typescript
// Même requête = cache côté browser (max-age: 60s)
// + cache KV côté serveur (TTL: 3600s)
// + possibilité cache Cloudflare Edge (via headers)
```

### Augmenter KV TTL

Dans `src/modules/prix-essence/config.ts`:

```typescript
CACHE_TTL: 86400 // 24 heures au lieu de 1
```

## 🔐 Sécurité

### Rate Limiting

Ajouter un Cloudflare Rule :

Page Rule: `https://votre-domaine.com/api/prix-essence/*`
- Rate Limiting: 100 requests par 10 secondes

### Secrets

Ne jamais committer `.env` ou secrets en cleartext :

```bash
# Ajouter à .gitignore
.env.local
.env.production
```

Utiliser `wrangler secret` pour tous les secrets.

## 🚨 Dépannage

### Erreur: KV namespace not found

```
Error: Could not find binding for name "PRIX_ESSENCE_KV"
```

**Solution:** Vérifier `[[kv_namespaces]]` dans `wrangler.toml` avec bon binding name.

### Erreur: Secret not accessible

```
Error: undefined variable PRIX_ESSENCE_REFRESH_SECRET
```

**Solution:** Utiliser `wrangler secret put` pour configurer, puis redéployer.

### Lenteur XLSX download

Si le téléchargement XLSX prend trop longtemps :
- Augmenter timeout Cloudflare (par défaut 30s)
- Ou pré-cacher le XLSX dans Cloudflare CDN

### Nominatim timeout

Si les requêtes Nominatim timeout :
- Utiliser instance Nominatim privée
- Ou configurer Google Maps (voir docs README)

## 📈 Optimisation Performance

### Caching Headers

Ajouter à `src/pages/api/prix-essence/search.ts`:

```typescript
// Cache 60s côté client, 1h côté edge
headers: {
  'Cache-Control': 'public, max-age=60, s-maxage=3600',
}
```

### Compression

Cloudflare compresse automatiquement les réponses JSON.

### Lazy Loading Leaflet

Le script Leaflet se charge seulement quand la page est vue.

## 🔄 CI/CD Pipeline

### GitHub Actions (exemple)

```yaml
name: Deploy Prix Essence

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - run: npm run deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## 👀 Preview Deployment

Avant de déployer en production :

```bash
wrangler dev
```

Puis visiter `http://localhost:3000/prix-essence`

## 📋 Checklist pré-déploiement

- [ ] wrangler.toml configuré avec KV namespaces
- [ ] Secrets configurés via `wrangler secret put`
- [ ] astro.config.mjs avec `cloudflare()` adapter
- [ ] Build test : `npm run build`
- [ ] Tester en local : `wrangler dev`
- [ ] Variables d'env (.env.local) pas committées
- [ ] README actualisé avec domaine final
- [ ] Attribution Régie l'énergie présente

## 🎯 Post-Déploiement

### Configurer DNS

1. Cloudflare Dashboard
2. DNS section
3. Ajouter un CNAME vers votre domaine Pages

### Monitoring

1. Activer Cloudflare Analytics
2. Configurer alertes pour erreurs 5xx
3. Monitorer latency des API endpoints

### Maintenance

Refresh hebdo des données XLSX :

```bash
# Cronjob ou GitHub Actions
0 0 * * 0 curl -X POST https://votre-domaine.com/api/prix-essence/refresh \
                  -H "Authorization: Bearer $SECRET"
```

---

**Déploiement production-ready en < 30 min.**

Questions? Voir troubleshooting dans le README principal.
