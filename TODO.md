# 📋 Checklist - À faire (TODO)

## 🔴 CRITIQUE - Avant production

### Authentification Admin
- [ ] Choisir solution (Cloudflare Access, JWT, NextAuth)
- [ ] Implémenter middleware d'auth
- [ ] Protéger `/admin`
- [ ] Protéger `PATCH /api/uploads/[id]/status`
- [ ] Tester login/logout
- [ ] **Fichier:** `/api/uploads/[id]/status/route.ts`

### Sécurité
- [ ] Ajouter CSRF tokens
- [ ] Implémenter rate limiting
- [ ] Valider email uploader
- [ ] Ajouter content moderation (détecter gore, danger)
- [ ] Tester XSS prevention
- [ ] Tester SQL injection immunity

### Base de données
- [ ] Si Vercel: migrer vers PostgreSQL/Neon
- [ ] Configurer backups automatiques
- [ ] Tester restore procedures

### Images
- [ ] Si Vercel: remplacer sharp par Cloudinary/imgix
- [ ] Tester image processing complet
- [ ] Vérifier EXIF removal
- [ ] Tester limits (taille, format)

---

## 🟡 IMPORTANT - Avant lancement public

### Contenu
- [ ] Customiser logo (remplacer 🦌)
- [ ] Ajouter vrais souvenirs/records
- [ ] Écrire texte d'accueil personnalisé
- [ ] Ajouter lien groupe Facebook
- [ ] Vérifier règles modération (adapter au groupe)

### Design
- [ ] Tester sur vrais appareils (mobile, tablet, desktop)
- [ ] Vérifier accessibility (WCAG)
- [ ] Tester sombre mode (si besoin)
- [ ] Vérifier performance (Lighthouse)
- [ ] Tester lentement connexion

### Features
- [ ] Ajouter pagination (quand 100+ items)
- [ ] Ajouter recherche simple
- [ ] Ajouter breadcrumbs
- [ ] Ajouter 404 page
- [ ] Tester tous les filtres

### Notifications
- [ ] Implémenter email approbation
- [ ] Implémenter email refus
- [ ] Tester templates emails
- [ ] Ajouter email admin notifications

---

## 🟠 OPTIONNEL - Améliorations futures

### Phase 2 (Semaines 2-4)
- [ ] Système de commentaires sur records
- [ ] Page profile utilisateur
- [ ] Historique uploads utilisateur
- [ ] Export liste records (PDF/Excel)
- [ ] Meilleur système de recherche
- [ ] Dark mode
- [ ] Langue supplémentaire (EN)

### Phase 3 (Mois 2-3)
- [ ] Mobile app (React Native)
- [ ] API publique pour tiers
- [ ] Système de tags avancé
- [ ] Comparateur records
- [ ] Map des zones de chasse
- [ ] Chat groupe
- [ ] Système de notifications temps réel

### Phase 4 (Future)
- [ ] Machine learning (auto-moderation)
- [ ] Intégration Discord
- [ ] Livestream hunts
- [ ] VR gallery
- [ ] AR trophée preview

---

## 🎯 Checklist de déploiement

### Pre-deployment
- [ ] Tous les bugs corrigés
- [ ] Tests complets passés
- [ ] Performance OK (Lighthouse 90+)
- [ ] Security audit fait
- [ ] Backups testés
- [ ] Recovery plan écrit

### Vercel setup
- [ ] Compte Vercel créé
- [ ] Git repo poussé
- [ ] Build successful
- [ ] Previews testés
- [ ] Production env vars set
- [ ] Domain configuré
- [ ] SSL/TLS actif

### Post-deployment
- [ ] Smoke tests passés
- [ ] Monitoring en place
- [ ] Alertes configurées
- [ ] Documentation mise à jour
- [ ] Admin access testé
- [ ] Users can upload
- [ ] Admin can moderate

---

## 📝 Tâches par priorité

### P0 (Blocker)
```
□ Auth admin implementé
□ Images traitées correctement  
□ BD backup strategy
□ Prod build successful
```

### P1 (Must-have)
```
□ CSRF protection
□ Rate limiting
□ Email notifications
□ Logo customisé
```

### P2 (Should-have)
```
□ Pagination
□ Commentaires
□ Export PDF
□ Analytics
```

### P3 (Nice-to-have)
```
□ Dark mode
□ Mobile app
□ API public
□ Autres langues
```

---

## 📊 Checklist par domaine

### Frontend
- [ ] Accueil page attractive
- [ ] Galerie performante
- [ ] Records avec détails complets
- [ ] Upload UX excellent
- [ ] Mobile responsive
- [ ] Accessibilité WCAG AA
- [ ] 404 & error pages
- [ ] Loading states
- [ ] Toast notifications

### Backend
- [ ] APIs documentées
- [ ] Error handling robuste
- [ ] Logging & monitoring
- [ ] Rate limiting
- [ ] CORS configué
- [ ] Cache strategy
- [ ] Graceful shutdown

### Database
- [ ] Schema final
- [ ] Indexes optimisés
- [ ] Queries performantes
- [ ] Backups automatiques
- [ ] Recovery tested
- [ ] Migration plan

### DevOps
- [ ] CI/CD pipeline
- [ ] Environment separation
- [ ] Secrets management
- [ ] Monitoring active
- [ ] Alertes configurées
- [ ] Documentation ops

### Security
- [ ] No secrets in code
- [ ] HTTPS everywhere
- [ ] SQL injection impossible
- [ ] XSS prevention
- [ ] CSRF tokens
- [ ] Rate limiting
- [ ] EXIF stripping
- [ ] Input validation

---

## 🗓️ Timeline recommandée

### Week 1
```
Mon: Auth setup + testing
Tue: Security hardening
Wed: Content + customization
Thu: Full E2E testing
Fri: Deployment preparation
```

### Week 2
```
Mon: Deploy to staging
Tue-Thu: QA & bug fixes
Fri: Production deployment
```

### Week 3+
```
Mon: Production monitoring
Tue: Gather user feedback
Wed+: Plan improvements
```

---

## 👥 Assignations suggérées

### Dev Lead
- [ ] Authentification
- [ ] Security
- [ ] API design
- [ ] Deployment

### Frontend Dev
- [ ] Pages UI/UX
- [ ] Components polish
- [ ] Responsive testing
- [ ] Performance

### QA/Tester
- [ ] Test plan complet
- [ ] Edge cases
- [ ] Performance tests
- [ ] Security audit

### Content Manager
- [ ] Textes & traductions
- [ ] Logo & design
- [ ] Règles modération
- [ ] Premiers contenus

---

## 📈 Métriques de succès

### Performance
- [ ] Page load < 2s
- [ ] Lighthouse > 90
- [ ] API response < 200ms
- [ ] 99.9% uptime

### User Experience
- [ ] Upload success rate > 95%
- [ ] 0 unhandled errors
- [ ] Mobile test positive
- [ ] Accessibility WCAG AA

### Security
- [ ] 0 critical vulnerabilities
- [ ] Penetration test passed
- [ ] All inputs validated
- [ ] No data breaches

### Growth
- [ ] X souvenirs uploadés/mois
- [ ] X records approuvés
- [ ] X utilisateurs actifs
- [ ] NPS score > 8

---

## 🔔 Reminders

- **Attention:** Pas d'auth actuellement! Ajouter avant prod!
- **Attention:** Images en local. Utiliser cloud en production!
- **Attention:** SQLite en local. Utiliser PostgreSQL en prod!
- **Todo:** Configurer monitoring & alertes
- **Todo:** Écrire SLA & incident procedures
- **Todo:** Préparer runbook ops

---

**Mis à jour:** 6 décembre 2025  
**Statut:** Ready for development  
**Prochaine révision:** Avant déploiement prod

🚀 **Prêt à commencer!**
