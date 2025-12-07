# 🚀 Guide de démarrage - Groupe de Chasse

Suivez ces étapes pour lancer le projet localement.

## 1️⃣ Installation des dépendances

```bash
cd "/Users/yannheppell/Documents/Yann site chasse "
npm install
```

Cela installera:
- ✅ Next.js 15
- ✅ React 18
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Prisma + SQLite
- ✅ sharp (traitement images)

Temps estimé: 2-3 minutes (selon vitesse internet)

## 2️⃣ Configuration de la base de données

```bash
# Créer et initialiser la BD
npx prisma migrate dev --name init
```

Cela:
- ✅ Crée le fichier `prisma/dev.db` (SQLite)
- ✅ Applique le schéma des tables
- ✅ Lance Prisma Studio pour visualiser les données (optionnel)

## 3️⃣ (Optionnel) Charger des données de test

```bash
# Seed la base avec quelques exemples
npx prisma db seed
```

Cela créera:
- 2 soumissions approuvées (exemple souvenir + record)
- 1 soumission en attente (pour tester la modération)

**Note:** Ces données utilisent des placeholders d'images. C'est juste pour voir la structure.

## 4️⃣ Démarrer le serveur de développement

```bash
npm run dev
```

Vous verrez:
```
  ▲ Next.js 15.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local
```

## 5️⃣ Accéder au site

Ouvrez **http://localhost:3000** dans votre navigateur.

### Pages à visiter:

| URL | Description |
|-----|-------------|
| `http://localhost:3000/` | Accueil |
| `http://localhost:3000/galerie` | Galerie de souvenirs |
| `http://localhost:3000/records` | Hall of Fame |
| `http://localhost:3000/upload` | Formulaire d'upload |
| `http://localhost:3000/admin` | Interface de modération (sans auth) |

---

## 📸 Test complet du workflow

### A. Soumettre une photo

1. Allez à `http://localhost:3000/upload`
2. Choisissez "Souvenir" ou "Record"
3. Remplissez le formulaire (les champs avec * sont obligatoires)
4. Uploadez 1-5 photos (JPG, PNG, WebP)
5. Cliquez "Soumettre"
6. ✅ Vous verrez le message: "Soumission reçue! Elle sera modérée avant publication."

### B. Modérer la soumission

1. Allez à `http://localhost:3000/admin`
2. Vous verrez une soumission en statut "⏳ En attente"
3. Cliquez sur la soumission pour voir les détails
4. Boutons d'action:
   - ✅ **Approuver** → publique immédiatement
   - ❌ **Refuser** → (optionnel) ajouter un motif
5. Après action, le statut change

### C. Voir le résultat public

1. Allez à `http://localhost:3000/galerie` (souvenirs) ou `/records` (records)
2. Vous verrez votre soumission approuvée si c'est un souvenir ou un record

---

## 🛠️ Commandes utiles (développement)

```bash
# Démarrer dev server
npm run dev

# Voir et modifier BD (interface visuelle)
npx prisma studio

# Créer une nouvelle migration (après changement schema.prisma)
npx prisma migrate dev --name description_de_votre_changement

# Réinitialiser complètement la BD
npx prisma migrate reset

# Générer le client Prisma (si jamais besoin)
npx prisma generate

# Vérifier les types TypeScript
npm run lint
```

---

## 📁 Où trouver les choses importantes

### 📝 Traitement des images
**Fichier:** `/lib/imageProcessor.ts`
- Conversion WebP
- Génération vignettes
- Suppression EXIF (GPS, métadonnées)

### 💾 API d'upload
**Fichiers:**
- `/app/api/uploads/route.ts` - POST (créer), GET (lister)
- `/app/api/uploads/[id]/route.ts` - GET détails
- `/app/api/uploads/[id]/status/route.ts` - PATCH (modifier statut)

### 🎨 Design
**Fichier:** `/tailwind.config.ts`
- Couleurs de chasse (brun, kaki, orange)
- Autres configurations

**CSS:** `/app/globals.css`
- Classes custom (`.hunting-card`, `.btn-primary`, etc.)

### 🧩 Composants
**Dossier:** `/components/`
- `Header.tsx` - Navigation
- `Footer.tsx` - Pied de page
- `MemoryCard.tsx` - Card souvenir
- `TrophyCard.tsx` - Card record

### 📊 Base de données
**Schéma:** `/prisma/schema.prisma`
- Tables: `UserUpload`, `Photo`
- Relations et champs

---

## ⚠️ Problèmes courants

### "Cannot find module 'sharp'"
```bash
npm install sharp
npm run dev
```

### "EADDRINUSE :::3000"
Le port 3000 est occupé:
```bash
# Tuer le processus (macOS/Linux)
lsof -i :3000
kill -9 <PID>

# Ou lancer sur un autre port
PORT=3001 npm run dev
```

### "Prisma migration error"
```bash
# Réinitialiser complètement
npx prisma migrate reset
```

### Images ne s'affichent pas
- Vérifier que `/public/uploads/` existe
- Vérifier que `sharp` est installé
- Voir les logs du serveur pour erreurs

---

## 🔒 Authentification Admin (TODO)

**Actuellement:** Pas de protection. Tout le monde peut accéder `/admin`.

**À faire avant production:**

Choisir une option et modifier `/api/uploads/[id]/status/route.ts`:

```typescript
// TODO: Décommenter l'une de ces options:

// Option 1: Cloudflare Access
// const cfAuth = request.headers.get('cf-authorization');
// if (!cfAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

// Option 2: JWT simple
// const token = request.headers.get('authorization')?.split(' ')[1];
// const decoded = jwt.verify(token, process.env.JWT_SECRET);
// if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

// Option 3: NextAuth.js
// const session = await getServerSession(authOptions);
// if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
```

---

## 📦 Build pour production

```bash
# Compiler le projet
npm run build

# Tester le build localement
npm start
```

---

## 🚀 Déploiement Vercel

Recommandé pour Next.js:

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Configurer variables (BD externe, etc.)
vercel env add DATABASE_URL
```

⚠️ **Important:** Vercel ne persist pas le filesystem. Vous devez:
1. Utiliser une BD externalisée (Neon, Supabase, etc.)
2. Remplacer `sharp` par une API cloud (Cloudinary, imgix)

Voir `ARCHITECTURE.md` pour détails.

---

## 📞 Besoin d'aide?

1. Vérifier les logs du terminal
2. Consulter `README.md` pour plus de détails
3. Voir `ARCHITECTURE.md` pour la structure technique
4. Documentation officielles:
   - Next.js: https://nextjs.org/docs
   - Prisma: https://www.prisma.io/docs
   - Tailwind: https://tailwindcss.com/docs

---

**Vous êtes prêt!** 🎉 Le site est maintenant fonctionnel localement.

Amusez-vous à tester le workflow complet!
