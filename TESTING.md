# 🧪 Guide de test complet

## 🚀 Avant de commencer

Assurez-vous que le serveur est en cours d'exécution:

```bash
cd "/Users/yannheppell/Documents/Yann site chasse "
npm run dev
```

Le serveur devrait écouter sur `http://localhost:3000`

---

## 📄 Pages à tester

### 1. Accueil (`/`)
**URL:** http://localhost:3000/

**À vérifier:**
- [ ] Logo placeholder s'affiche (🦌)
- [ ] Navigation header visible
- [ ] Contenu d'accueil s'affiche
- [ ] Boutons de navigation fonctionnent
- [ ] Footer visible
- [ ] Design responsive (tester mobile view)

### 2. Galerie (`/galerie`)
**URL:** http://localhost:3000/galerie

**À vérifier:**
- [ ] Grille de souvenirs affichée
- [ ] Au moins 1 souvenir visible (données de test)
- [ ] Filtre par catégorie fonctionne
- [ ] Filtre par année fonctionne
- [ ] Cards cliquables (comportement TBD)
- [ ] Pas d'erreurs console

### 3. Hall of Fame (`/records`)
**URL:** http://localhost:3000/records

**À vérifier:**
- [ ] Grille de records affichée
- [ ] Au moins 1 record visible (données de test)
- [ ] Filtre par espèce fonctionne
- [ ] Filtre par région fonctionne
- [ ] Filtre par année fonctionne
- [ ] Badge "🏆 Record" visible sur cards

### 4. Détail d'un record (`/records/[id]`)
**Instruction:**
1. Aller à `/records`
2. Cliquer sur un record (TBD - lien à ajouter)
3. Ou accédez directement: http://localhost:3000/records/[COPY-ID-FROM-ADMIN]

**À vérifier:**
- [ ] Photo du record s'affiche
- [ ] Toutes les infos présentes (poids, points, arme, etc.)
- [ ] Bouton "Retour" fonctionne
- [ ] Layout responsif

### 5. Upload (`/upload`)
**URL:** http://localhost:3000/upload

**À vérifier:**
- [ ] Deux boutons de sélection (Souvenir / Record)
- [ ] Avis des règles communautaires visible
- [ ] Après sélection: formulaire approprié s'affiche

#### 5a. Upload Souvenir
1. Cliquez sur "Souvenir"
2. Remplissez le formulaire:
   - [ ] Titre (obligatoire)
   - [ ] Description
   - [ ] Votre nom (obligatoire)
   - [ ] Email (optionnel)
   - [ ] Catégorie
   - [ ] Date
   - [ ] Participants
3. Upload photo(s):
   - [ ] Sélection fichier fonctionne
   - [ ] Aperçu affiché
   - [ ] Suppression photo (X) fonctionne
   - [ ] Max 5 photos enforced
4. Soumettez:
   - [ ] Message succès s'affiche
   - [ ] Formulaire se réinitialise
   - [ ] Pas d'erreur

#### 5b. Upload Record
1. Retournez à `/upload`
2. Cliquez sur "Record"
3. Remplissez le formulaire:
   - [ ] Espèce (obligatoire, dropdown)
   - [ ] Date de chasse
   - [ ] Région
   - [ ] Poids
   - [ ] Points
   - [ ] Type d'arme
   - [ ] Calibre/Setup
4. Upload photo(s)
5. Soumettez:
   - [ ] Même comportement que souvenir
   - [ ] Aucune erreur

### 6. Admin (`/admin`)
**URL:** http://localhost:3000/admin

**À vérifier:**
- [ ] Avis d'authentification TODO visible
- [ ] Filtres (statut, type) présents
- [ ] Statistiques affichées:
  - [ ] Nombre "En attente"
  - [ ] Nombre "Approuvées"
  - [ ] Nombre "Refusées"
- [ ] Liste des soumissions visible
  - [ ] Au moins 1 "Souvenir" approuvé
  - [ ] Au moins 1 "Record" approuvé
  - [ ] Au moins 1 "Souvenir" en attente (status "⏳ En attente")

#### 6a. Modération - Approbation
1. Cliquez sur la soumission "Trip au lac en attente"
2. Vue détail:
   - [ ] Photos affichées
   - [ ] Infos complètes visibles
   - [ ] Type identifié correctement
3. Cliquez "✅ Approuver"
4. Vérification:
   - [ ] Statut devient "✅ Approuvée"
   - [ ] Liste se met à jour
   - [ ] Stats se mettent à jour

#### 6b. Modération - Refus
1. Créez une nouvelle soumission via `/upload`
2. Retournez à `/admin`
3. Sélectionnez la nouvelle soumission (status "En attente")
4. Tapez un motif de refus dans le textarea
5. Cliquez "❌ Refuser"
6. Vérification:
   - [ ] Statut devient "❌ Refusée"
   - [ ] Motif sauvegardé
   - [ ] Nouvelle sélection montre le motif

#### 6c. Remise en attente
1. Cliquez sur une soumission approuvée
2. Cliquez "⏳ Remettre en attente"
3. Vérification:
   - [ ] Statut redevient "En attente"

---

## 📊 Workflows complets à tester

### Workflow A: Soumission → Approbation → Affichage

1. **Soumettre un souvenir:**
   - [ ] URL: `/upload`
   - [ ] Remplir formulaire souvenir
   - [ ] Upload photo
   - [ ] Message succès

2. **Modérer:**
   - [ ] URL: `/admin`
   - [ ] Voir soumission en "En attente"
   - [ ] Cliquer pour détails
   - [ ] Approuver
   - [ ] Voir dans statistiques

3. **Afficher publiquement:**
   - [ ] URL: `/galerie`
   - [ ] Voir le souvenir dans la grille
   - [ ] Filtre par catégorie le montre
   - [ ] Filtre par année le montre

### Workflow B: Upload avec erreurs

1. **Titre manquant:**
   - [ ] Soumettre sans titre → erreur
   - [ ] Message d'erreur clair

2. **Pas de photo:**
   - [ ] Remplir formulaire
   - [ ] Soumettre sans photo
   - [ ] [ ] Message d'erreur

3. **Fichier trop gros:**
   - [ ] Créer image >10MB
   - [ ] Tenter upload
   - [ ] Erreur affichée

### Workflow C: Filtrage galerie

1. **Galerie - Filtre catégorie:**
   - [ ] Sélectionner "Camp"
   - [ ] Voir que souvenirs "Camp" affichés
   - [ ] Autres catégories filtrées

2. **Galerie - Filtre année:**
   - [ ] Sélectionner "2024"
   - [ ] Voir année correcte

3. **Records - Multi-filtres:**
   - [ ] Filtrer par espèce "Orignal"
   - [ ] Filtrer par région
   - [ ] Filtrer par année
   - [ ] Voir que tous les filtres s'appliquent

---

## 🐛 Points de vérification technique

### Console navigateur (F12 > Console)
- [ ] Pas d'erreurs rouges
- [ ] Pas de CORS errors
- [ ] Pas d'erreurs TypeScript

### Réseau (F12 > Network)
- [ ] `/api/uploads` GET → 200 OK
- [ ] `/api/uploads` POST → 201 Created
- [ ] `/api/uploads/[id]/status` PATCH → 200 OK

### Images
- [ ] Photos uploadées converties en .webp
- [ ] Vignettes générées
- [ ] Métadonnées EXIF supprimées (vérifier avec outils EXIF)

### Base de données (si accès)
```bash
npm run db:studio
```
- [ ] Voir UserUpload table
- [ ] Voir Photo table
- [ ] Compter records
- [ ] Vérifier statuts

---

## ✅ Checklist finale

- [ ] Toutes les pages se chargent
- [ ] Formulaires soumettent correctement
- [ ] Images uploadées et traitées
- [ ] Admin peut modérer
- [ ] Contenu approuvé s'affiche publiquement
- [ ] Pas d'erreurs console
- [ ] Design responsive
- [ ] Filtres fonctionnent
- [ ] Navigation fluide

---

## 🚨 Problèmes et solutions

| Problème | Solution |
|----------|----------|
| Page blanche | Vérifier console (F12), restart serveur |
| Images ne chargent pas | `npm install sharp`, redémarrer |
| 404 sur API | Vérifier les routes en `/app/api/` |
| BD vide | `node prisma/seed.js` |
| Port en usage | `lsof -i :3000` et kill le process |

---

## 📝 Notes de test

**Date de test:** _____  
**Testeur:** _____  
**Problèmes trouvés:**
- [ ] Aucun
- [ ] (lister ci-dessous)

```
1. ...
2. ...
3. ...
```

**Fonctionne bien:**
```
- ...
- ...
```

---

**Bon testing! 🧪**
