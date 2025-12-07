# 🎯 Accès rapide - Toutes les URLs

## 🌐 Navigation complète

### Accueil & Navigation
| Page | URL | Description |
|------|-----|-------------|
| **Accueil** | http://localhost:3000/ | Page d'accueil du groupe |
| **Galerie** | http://localhost:3000/galerie | Grille souvenirs |
| **Hall of Fame** | http://localhost:3000/records | Grille trophées |
| **Upload** | http://localhost:3000/upload | Soumettre photos |
| **Admin** | http://localhost:3000/admin | Modération (sans auth) |

### Détail d'un Record
```
http://localhost:3000/records/[ID]
```
Remplacer `[ID]` par:
1. Aller à `/admin`
2. Cliquer sur un record
3. Copier l'ID dans la liste
4. Faire: http://localhost:3000/records/PASTE_ID_HERE

---

## 🔧 API Endpoints (développement)

### Créer une soumission
```bash
curl -X POST http://localhost:3000/api/uploads \
  -F "type=souvenir" \
  -F "title=Mon souvenir" \
  -F "description=Description..." \
  -F "uploaderName=Jean" \
  -F "photos=@/path/to/image.jpg"
```

### Lister soumissions approuvées
```bash
curl http://localhost:3000/api/uploads?status=approved
```

### Lister records approuvés
```bash
curl http://localhost:3000/api/uploads?status=approved&type=record
```

### Voir détail soumission
```bash
curl http://localhost:3000/api/uploads/[ID]
```

### Modérer (approuver)
```bash
curl -X PATCH http://localhost:3000/api/uploads/[ID]/status \
  -H "Content-Type: application/json" \
  -d '{"status":"approved"}'
```

### Modérer (refuser)
```bash
curl -X PATCH http://localhost:3000/api/uploads/[ID]/status \
  -H "Content-Type: application/json" \
  -d '{"status":"rejected","rejectionReason":"Contenu non conforme"}'
```

---

## 📱 Pages responsives (Test mobile)

### Desktop (1920x1080)
- Grille 4 colonnes
- Navigation complète

### Tablette (768x1024)
- Grille 3 colonnes
- Navigation adaptée

### Mobile (375x667)
- Grille 2 colonnes
- Navigation réduite

**Pour tester:** F12 → Toggle device toolbar

---

## 🧪 Données de test disponibles

### Souvenirs approuvés
1. **Belle journée au camp**
   - Uploader: Jean Chasseur
   - Catégorie: Camp
   - Date: 15 sept 2024
   - URL: http://localhost:3000/galerie

### Records approuvés
1. **Magnifique orignal - 2024**
   - Uploader: Marc Trappeur
   - Espèce: Orignal
   - Région: Mauricie
   - Poids: 1050 lb
   - Points: 185
   - URL: http://localhost:3000/records

### En attente de modération
1. **Trip au lac en attente**
   - Uploader: Pierre Modérateur
   - Email: pierre@example.com
   - Status: PENDING
   - URL: http://localhost:3000/admin

---

## 🎬 Scénarios de test rapides

### Scénario 1: Tester upload souvenir
1. Ouvrir: http://localhost:3000/upload
2. Cliquer: "Souvenir"
3. Remplir: Titre, nom, catégorie
4. Upload: Photo (< 10MB)
5. Soumettre
6. Vérifier: Message succès
7. Admin: http://localhost:3000/admin
8. Voir: Soumission en "En attente"

### Scénario 2: Tester modération
1. Aller à: http://localhost:3000/admin
2. Voir: "Trip au lac en attente"
3. Cliquer: Sélectionner
4. Cliquer: "✅ Approuver"
5. Vérifier: Statut change
6. Aller à: http://localhost:3000/galerie
7. Voir: Souvenir approuvé apparaît

### Scénario 3: Tester filtres
1. Aller à: http://localhost:3000/galerie
2. Filtrer par: "Camp"
3. Vérifier: Voir souvenirs campement
4. Aller à: http://localhost:3000/records
5. Filtrer par: "Orignal"
6. Vérifier: Voir orignal

---

## 🐛 Debug URLs

### Voir les logs
```bash
cd "/Users/yannheppell/Documents/Yann site chasse "
npm run dev
# Tous les logs apparaissent dans le terminal
```

### Vérifier base de données
```bash
npm run db:studio
# Prisma Studio s'ouvre
# URL: http://localhost:5555 (généralement)
```

### Vérifier types TypeScript
```bash
npm run lint
```

---

## 🔐 Admin sans authentification (DANGER!)

**Actuellement:**
- ✅ `/admin` accessible à tous
- ✅ Modération possible pour tout le monde
- ⚠️ **À sécuriser en production!**

**Pour tester publiquement:**
```
Allez directement à: http://localhost:3000/admin
```

---

## 💾 Base de données

### Voir les données
```bash
npm run db:studio
# Ouvre http://localhost:5555
# Voir UserUpload et Photo tables
```

### Réinitialiser compètement
```bash
npx prisma migrate reset
# Puis:
node prisma/seed.js  # Recharger données test
```

### Fichier BD
```
Location: prisma/dev.db
Size: ~10KB (avec données test)
Format: SQLite3
```

---

## 🚀 Commandes serveur

### Démarrer
```bash
npm run dev
# Port: 3000
# Hot reload: OUI
```

### Builder
```bash
npm run build
# Compile le projet
```

### Tester build
```bash
npm start
# Lance version compilée
```

### Arrêter serveur
```bash
Ctrl + C dans le terminal
```

---

## 📊 Chemins fichiers importants

### Images uploadées
```
Location: /public/uploads/
Format: .webp (principal) + -thumb.webp (vignette)
Example: 
  - photo-1733534861.webp
  - photo-1733534861-thumb.webp
```

### Base de données
```
Location: prisma/dev.db
Migrations: prisma/migrations/
```

### Code source
```
Pages: app/(public)/ et app/admin/
APIs: app/api/
Composants: components/
Styles: app/globals.css + tailwind.config.ts
```

---

## ⚡ Raccourcis clavier

### Dans le navigateur
- `F12` - DevTools (console, network, etc.)
- `Ctrl + Shift + M` - Mode mobile/responsive
- `Ctrl + Shift + C` - Inspecter élément

### Dans le terminal
- `Ctrl + C` - Arrêter serveur
- `Ctrl + L` - Clear terminal
- `Up arrow` - Commande précédente

---

## 📞 Aide rapide

### Ça ne marche pas?
1. Vérifier console (F12)
2. Vérifier terminal serveur
3. Redémarrer serveur: `Ctrl + C` puis `npm run dev`
4. Vérifier fichiers `.env.local`
5. Voir `TROUBLESHOOTING.md` (si existe)

### Besoin d'une info?
1. Lire `README.md` - Vue d'ensemble
2. Lire `ARCHITECTURE.md` - Structure technique
3. Lire `SETUP.md` - Installation
4. Lire `IMPORTANT.md` - Points clés

---

## 🎉 Vous êtes prêt!

Toutes les URLs, APIs et données sont listées ici.

**Commencez par:**
1. `npm run dev` → Lance serveur
2. http://localhost:3000/ → Accueil
3. http://localhost:3000/upload → Tester upload
4. http://localhost:3000/admin → Tester modération

---

**Bon développement!** 🚀
