# 🚀 Publier sur GitHub

Le projet est maintenant prêt à être publié sur GitHub!

## Étapes pour mettre le site sur GitHub

### 1. Créer un nouveau repository sur GitHub

1. Allez sur **https://github.com**
2. Cliquez sur le bouton **"+"** en haut à droite → **"New repository"**
3. Remplissez les informations :
   - **Repository name:** `site-groupe-chasse` (ou autre nom)
   - **Description:** Site web pour groupe de chasse avec galerie et modération
   - **Visibilité:** 
     - ✅ **Private** (recommandé pour un groupe privé)
     - ou Public (si vous voulez partager le code)
   - ❌ **NE PAS** cocher "Initialize with README" (on a déjà les fichiers)
4. Cliquez **"Create repository"**

### 2. Connecter le projet local à GitHub

GitHub vous donnera des instructions. Utilisez celles-ci :

```bash
cd "/Users/yannheppell/Documents/Yann site chasse "

# Ajouter le remote GitHub (remplacer VOTRE_USERNAME et VOTRE_REPO)
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git

# Renommer la branche en "main" (standard GitHub)
git branch -M main

# Pousser le code sur GitHub
git push -u origin main
```

**Exemple concret** (remplacez par vos vraies infos) :
```bash
git remote add origin https://github.com/yannheppell/site-groupe-chasse.git
git branch -M main
git push -u origin main
```

### 3. Vérifier

Rafraîchissez la page GitHub → vous verrez tous vos fichiers! 🎉

---

## ⚠️ Important - Sécurité

### Fichiers sensibles (déjà protégés)

Le fichier `.gitignore` empêche automatiquement :
- ❌ `.env.local` (variables d'environnement)
- ❌ `*.db` (base de données)
- ❌ `node_modules/` (dépendances)
- ❌ `public/uploads/*` (photos uploadées)

Ces fichiers restent **seulement sur votre ordinateur** ✅

### Vérifier avant de push

```bash
# Voir ce qui sera envoyé
git status

# Si vous voyez .env.local ou *.db, NE PAS PUSH!
```

---

## 🔄 Mettre à jour le code sur GitHub (après modifications)

```bash
cd "/Users/yannheppell/Documents/Yann site chasse "

# Voir les changements
git status

# Ajouter les fichiers modifiés
git add .

# Créer un commit avec message
git commit -m "Description de vos changements"

# Envoyer sur GitHub
git push
```

---

## 🌐 Déployer le site en ligne (optionnel)

### Option 1 : Vercel (Recommandé - Gratuit)

1. Allez sur **https://vercel.com**
2. Connectez-vous avec GitHub
3. Cliquez **"New Project"**
4. Sélectionnez votre repository `site-groupe-chasse`
5. Vercel détecte automatiquement Next.js
6. Configurez les variables d'environnement :
   - Ajoutez `DATABASE_URL` pointant vers une BD externe (Neon, Supabase)
7. Cliquez **"Deploy"**
8. Votre site sera en ligne à : `https://votre-projet.vercel.app`

**Note:** Sur Vercel, vous devrez :
- Utiliser une base de données externe (pas SQLite)
- Potentiellement adapter le traitement d'images (voir README.md)

### Option 2 : Netlify

Similaire à Vercel, mais moins optimisé pour Next.js.

### Option 3 : VPS (Self-hosted)

Pour garder contrôle total (DigitalOcean, AWS, etc.). Voir SETUP.md.

---

## 📊 État actuel

✅ **Git initialisé** : Repository local créé  
✅ **Premier commit** : Tous les fichiers sauvegardés  
⏳ **GitHub** : À configurer (suivre les étapes ci-dessus)  
⏳ **En ligne** : À déployer (optionnel)

---

## 🆘 Problèmes courants

### "Repository already exists"
Le repo existe déjà sur GitHub. Utilisez un autre nom ou supprimez l'ancien.

### "Permission denied (publickey)"
Configurez SSH ou utilisez HTTPS avec token GitHub.

### "Failed to push"
Vérifiez que vous avez bien créé le repo sur GitHub d'abord.

---

**Prêt à publier!** 🚀

Une fois sur GitHub, vous pourrez :
- 💾 Sauvegarder automatiquement
- 🔄 Synchroniser entre plusieurs machines
- 👥 Collaborer avec d'autres développeurs
- 🚀 Déployer facilement sur Vercel/Netlify
