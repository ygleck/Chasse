# ⚡ Démarrage en 2 minutes

## Installation & Lancement

```bash
# 1. Aller au dossier du projet
cd "/Users/yannheppell/Documents/Yann site chasse "

# 2. Installer dépendances
npm install

# 3. Initialiser la BD (une fois)
npm run db:push

# 4. Charger données de test (optionnel)
node prisma/seed.js

# 5. Lancer le serveur
npm run dev
```

Accédez à: **http://localhost:3000**

---

## URLs importantes

| Page | URL | Fonction |
|------|-----|----------|
| 🏠 Accueil | http://localhost:3000/ | Présentation |
| 📸 Galerie | http://localhost:3000/galerie | Voir souvenirs |
| 🏆 Records | http://localhost:3000/records | Voir trophées |
| 📤 Upload | http://localhost:3000/upload | Soumettre photos |
| 🔧 Admin | http://localhost:3000/admin | Modérer contenus |

---

## Commandes utiles

```bash
npm run dev              # Démarrer dev server
npm run build            # Build pour production
npm run db:push          # Appliquer changements schema
npm run db:studio        # Voir/éditer BD (GUI)
npm run lint             # Vérifier code
```

---

## Fichiers clés

```
/app/
  ├─ (public)/          # Pages publiques
  │  ├─ page.tsx        # Accueil
  │  ├─ galerie/        # Galerie
  │  ├─ records/        # Records
  │  └─ upload/         # Upload
  ├─ admin/page.tsx     # Modération
  └─ api/               # APIs

/lib/
  ├─ imageProcessor.ts  # Traitement images
  └─ prisma.ts          # BD

/components/            # Composants React
/prisma/
  ├─ schema.prisma      # Modèle BD
  └─ seed.js            # Données test
```

---

## Tester le workflow

1. **Upload**: Allez à `/upload` → soumettre une photo
2. **Modérer**: Allez à `/admin` → approuver/refuser
3. **Voir**: Allez à `/galerie` ou `/records` → voir contenu approuvé

---

✅ **Prêt à coder!**
