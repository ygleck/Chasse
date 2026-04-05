# Prix Essence Québec

Application web pour trouver les stations-service avec les meilleurs prix au Québec.

## 🚀 Déploiement Public

### Option 1: Cloudflare Pages (Recommandé)

1. **Connecter votre repo GitHub à Cloudflare Pages**
   - Allez sur [Cloudflare Pages](https://pages.cloudflare.com/)
   - Connectez votre compte GitHub
   - Sélectionnez ce repository

2. **Configuration du build**
   ```
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   ```

3. **Variables d'environnement** (optionnel)
   ```
   PRIX_ESSENCE_XLSX_FALLBACK_URL=https://example.com/data.xlsx
   ```

4. **URL publique**
   Votre app sera disponible sur : `https://votre-projet.pages.dev`

### Option 2: Netlify

1. **Connecter à Netlify**
   - Allez sur [Netlify](https://netlify.com)
   - Connectez votre repo GitHub

2. **Configuration**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

### Option 3: GitHub Pages

1. **Ajouter le workflow GitHub Actions**
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [ main ]
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: 18
         - run: npm install
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

## 📱 Installation sur Mobile

L'app supporte l'installation PWA (Progressive Web App) :

1. **Sur iOS Safari** : Tapez sur le bouton partage → "Ajouter à l'écran d'accueil"
2. **Sur Android Chrome** : Menu → "Ajouter à l'écran d'accueil"
3. **Sur Desktop** : Bouton "Télécharger l'App" dans le header

## 🔧 Développement Local

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run build

# Preview du build
npm run preview

# Tests
npm run test
```

## 🌐 Accès depuis Mobile

Pour tester depuis votre téléphone :

1. Lancez `npm run dev` sur votre ordinateur
2. Trouvez l'IP de votre ordinateur : `ipconfig getifaddr en0` (sur Mac)
3. Sur votre téléphone, allez sur : `http://[IP]:4173`

## 📊 Fonctionnalités

- 🔍 Recherche par adresse ou géolocalisation
- 🗺️ Carte interactive avec Leaflet
- ⭐ Système de scoring intelligent (prix + proximité)
- 💾 Historique et favoris locaux
- 📱 Interface responsive et PWA
- 🔄 Mise à jour automatique des données

## 🛠️ Technologies

- **Frontend**: Astro + React
- **Cartes**: Leaflet.js
- **Styling**: CSS Modules
- **API**: Astro endpoints
- **Cache**: Cloudflare Workers KV
- **Données**: XLSX parsing depuis Régie de l'énergie du Québec