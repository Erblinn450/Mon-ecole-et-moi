# 📅 Planning Stage - Mon École et Moi

**Stagiaire :** Erblin Potoku (L3 Informatique - UHA 4.0)  
**Client :** Mon École et Moi (Audrey Ballester)  
**Période :** 6 janvier - 23 juin 2026 (24 semaines)  
**Objectif :** Application opérationnelle pour la rentrée septembre 2026

---

## 🧠 Logique de Priorisation (Approche Expert)

### Principe 1 : Dépendances
On ne peut pas facturer sans avoir des familles inscrites.
→ **Inscriptions en premier** (✅ déjà fait)

### Principe 2 : Risque technique
La facturation est complexe (PDF, SEPA, calculs).
→ **L'attaquer tôt** pour avoir du temps si ça déborde

### Principe 3 : Valeur business
Ce qui fait gagner le plus de temps à Audrey = facturation auto.
→ **Facturation = priorité #1**

### Principe 4 : Buffer
Toujours prévoir du temps pour les imprévus.
→ **4 semaines de marge** (tests, bugs, formation)

---

## 📊 Répartition des 24 semaines

```
24 semaines totales
 - 4 semaines buffer (tests, imprévus, formation)
 = 20 semaines de développement effectif

20 semaines réparties :
├── Inscriptions (finaliser)     : 2 semaines
├── FACTURATION                  : 8 semaines ← PRIORITÉ
├── Repas/Périscolaire          : 4 semaines
├── Communication               : 4 semaines
└── PWA Mobile                  : 2 semaines (si temps)
```

---

## 📆 Planning Détaillé

### 🗓️ JANVIER : Finaliser Inscriptions + Démarrer Facturation

#### Semaines 1-2 (6-17 janvier)
**Objectif :** Inscriptions 100% terminées

| Tâche | Temps | Statut |
|-------|-------|--------|
| ✅ Setup projet (FAIT) | - | ✅ |
| ✅ Préinscription (FAIT) | - | ✅ |
| ✅ Auth + Sécurité (FAIT) | - | ✅ |
| ✅ Modal d'authentification optimisé | 1 jour | ✅ 14/01 |
| ✅ Templates emails conformes aux modèles | 1 jour | ✅ 14/01 |
| ✅ Email uniformisé (contact@montessorietmoi.com) | - | ✅ 14/01 |
| ✅ Suppression section tarifs formulaire | - | ✅ 14/01 |
| ✅ Nettoyage code mort | - | ✅ 14/01 |
| Dashboard parent complet | 2 jours | 🔄 |
| Upload justificatifs | 3 jours | 📋 |
| Interface admin inscriptions | 3 jours | 📋 |
| Tests + corrections | 2 jours | 📋 |

**🎯 Livrable S2 :** Module inscriptions terminé et testé

**📊 Avancées 14/01/2026 :**
- ✅ **Modal d'authentification** : Code nettoyé, email + téléphone corrigés
- ✅ **Templates emails** : 3 templates conformes aux modèles de la cliente (acceptation, refus, annulation)
- ✅ **Backend** : Nouvelle méthode `sendPreinscriptionCancelled()` intégrée
- ✅ **Uniformisation** : Email `contact@montessorietmoi.com` partout
- ✅ **Commit** : `391e5d8` poussé sur GitHub

#### Semaines 3-4 (20-31 janvier)
**Objectif :** Démarrer facturation (modèle de données)

| Tâche | Temps |
|-------|-------|
| Analyse besoins facturation avec Audrey | 1 jour |
| Modèle BDD (factures, lignes, paiements) | 2 jours |
| CRUD factures basique (admin) | 3 jours |
| Vue factures côté parent | 2 jours |
| Tests | 2 jours |

**🎯 Livrable S4 :** Admin peut créer une facture manuellement

---

### 🗓️ FÉVRIER : Facturation - Automatisation

#### Semaines 5-6 (3-14 février)
**Objectif :** Calculs automatiques

| Tâche | Temps |
|-------|-------|
| Calcul montant scolarité | 2 jours |
| Calcul repas du mois | 2 jours |
| Calcul périscolaire du mois | 2 jours |
| Réduction fratrie (-20%) | 1 jour |
| Tests calculs | 3 jours |

**🎯 Livrable S6 :** Facture calculée automatiquement

#### Semaines 7-8 (17-28 février)
**Objectif :** Génération PDF + envoi

| Tâche | Temps |
|-------|-------|
| Génération PDF facture | 3 jours |
| Template PDF professionnel | 2 jours |
| Envoi email avec PDF | 2 jours |
| Historique factures | 1 jour |
| Tests | 2 jours |

**🎯 Livrable S8 :** Facture PDF envoyée par email

---

### 🗓️ MARS : Facturation - Export + Suivi

#### Semaines 9-10 (3-14 mars)
**Objectif :** Export SEPA (prélèvements)

| Tâche | Temps |
|-------|-------|
| Comprendre format XML SEPA | 1 jour |
| Génération fichier XML | 3 jours |
| Interface export admin | 2 jours |
| Validation format avec banque | 2 jours |
| Tests | 2 jours |

**🎯 Livrable S10 :** Export SEPA fonctionnel

#### Semaines 11-12 (17-28 mars)
**Objectif :** Suivi paiements + exports comptables

| Tâche | Temps |
|-------|-------|
| Statuts factures (payé, en attente, retard) | 2 jours |
| Dashboard suivi paiements | 2 jours |
| Relances automatiques (email) | 2 jours |
| Export CSV/Excel comptable | 2 jours |
| Tests complets facturation | 2 jours |

**🎯 Livrable S12 :** Module facturation COMPLET ✅

---

### 🗓️ AVRIL : Repas + Périscolaire

#### Semaines 13-14 (31 mars - 11 avril)
**Objectif :** Commandes repas complètes

| Tâche | Temps |
|-------|-------|
| Calendrier scolaire admin | 2 jours |
| Gestion vacances/fériés | 1 jour |
| Commandes repas (améliorer) | 2 jours |
| Vue admin "qui mange aujourd'hui" | 2 jours |
| Lien avec facturation | 1 jour |
| Tests | 2 jours |

**🎯 Livrable S14 :** Repas liés à la facturation

#### Semaines 15-16 (14-25 avril)
**Objectif :** Périscolaire + absences

| Tâche | Temps |
|-------|-------|
| Commandes périscolaire (améliorer) | 2 jours |
| Déclaration absences (parent) | 2 jours |
| Vue admin présences/absences | 2 jours |
| Rapports de fréquentation | 2 jours |
| Tests | 2 jours |

**🎯 Livrable S16 :** Gestion quotidienne complète

---

### 🗓️ MAI : Communication

#### Semaines 17-18 (28 avril - 9 mai)
**Objectif :** Messagerie interne

| Tâche | Temps |
|-------|-------|
| Messagerie parent ↔ école | 3 jours |
| Historique conversations | 2 jours |
| Pièces jointes | 2 jours |
| Notifications nouveaux messages | 1 jour |
| Tests | 2 jours |

**🎯 Livrable S18 :** Messagerie fonctionnelle

#### Semaines 19-20 (12-23 mai)
**Objectif :** Emails groupés

| Tâche | Temps |
|-------|-------|
| Emails groupés (par classe) | 3 jours |
| Emails groupés (toute l'école) | 1 jour |
| Templates personnalisables | 2 jours |
| Historique envois | 1 jour |
| Tests | 3 jours |

**🎯 Livrable S20 :** Communication complète

---

### 🗓️ JUIN : Finalisation + Déploiement

#### Semaines 21-22 (26 mai - 6 juin)
**Objectif :** PWA + Tests globaux

| Tâche | Temps |
|-------|-------|
| Configuration PWA | 2 jours |
| Optimisation mobile | 2 jours |
| Tests complets application | 3 jours |
| Corrections bugs | 3 jours |

**🎯 Livrable S22 :** Application testée et stable

#### Semaines 23-24 (9-20 juin)
**Objectif :** Production + Formation

| Tâche | Temps |
|-------|-------|
| Déploiement serveur | 2 jours |
| Configuration domaine/SSL | 1 jour |
| Tests en production | 2 jours |
| Formation Audrey | 2 jours |
| Documentation utilisateur | 2 jours |
| Handover | 1 jour |

**🎯 Livrable FINAL (23 juin) :** Application en production + Audrey formée

---

## 📊 Vue d'Ensemble

```
         JANVIER          FÉVRIER          MARS            AVRIL           MAI             JUIN
    ┌─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┬─────────────────┐
S1  │ ██ Inscriptions │                 │                 │                 │                 │                 │
S2  │ ██ (finaliser)  │                 │                 │                 │                 │                 │
    ├─────────────────┤                 │                 │                 │                 │                 │
S3  │ ████████████████│█████████████████│█████████████████│                 │                 │                 │
S4  │ ████████████████│█████████████████│█████████████████│                 │                 │                 │
S5  │                 │████ FACTURATION █████████████████│                 │                 │                 │
S6  │                 │████ (8 semaines) ████████████████│                 │                 │                 │
S7  │                 │█████████████████│█████████████████│                 │                 │                 │
S8  │                 │█████████████████│█████████████████│                 │                 │                 │
    │                 │                 ├─────────────────┤                 │                 │                 │
S9  │                 │                 │                 │ ████ REPAS ████ │                 │                 │
S10 │                 │                 │                 │ ███ PÉRISCOL ██ │                 │                 │
S11 │                 │                 │                 │ ██ (4 sem) ████ │                 │                 │
S12 │                 │                 │                 │ █████████████████                 │                 │
    │                 │                 │                 ├─────────────────┤                 │                 │
S13 │                 │                 │                 │                 │ ████ COMMUNI ██ │                 │
S14 │                 │                 │                 │                 │ ████ CATION ███ │                 │
S15 │                 │                 │                 │                 │ ██ (4 sem) ████ │                 │
S16 │                 │                 │                 │                 │ █████████████████                 │
    │                 │                 │                 │                 ├─────────────────┤                 │
S17 │                 │                 │                 │                 │                 │ ██ TESTS ██████ │
S18 │                 │                 │                 │                 │                 │ ██ DÉPLOIE ████ │
S19 │                 │                 │                 │                 │                 │ ██ FORMATION ██ │
S20 │                 │                 │                 │                 │                 │ ██ (4 sem) ████ │
    └─────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

---

## 🎯 Jalons de Validation

| Date | Jalon | Ce qu'Audrey peut tester |
|------|-------|--------------------------|
| **17 janvier** | Inscriptions complètes | S'inscrire, uploader docs |
| **31 janvier** | Facturation basique | Créer une facture |
| **28 février** | Factures PDF | Voir facture PDF par email |
| **31 mars** | Facturation complète | Export SEPA, suivi paiements |
| **30 avril** | Gestion quotidienne | Repas, périscolaire, absences |
| **31 mai** | Communication | Messagerie, emails groupés |
| **23 juin** | 🎓 LIVRAISON FINALE | Application complète en prod |

---

## ⚠️ Risques et Mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Facturation plus complexe que prévu | HAUT | 8 semaines prévues (marge) |
| Format SEPA refusé par banque | MOYEN | Valider tôt avec la banque |
| Bugs en cascade | MOYEN | Tests continus, pas à la fin |
| Absence maladie | FAIBLE | 4 semaines de buffer |
| Audrey change les specs | MOYEN | Points réguliers, valider tôt |

---

## 📞 Points avec Audrey

| Fréquence | Type | Objectif |
|-----------|------|----------|
| **Lundi 9h** | 📞 Appel (10 min) | Ce que je fais cette semaine |
| **Vendredi** | 🎬 Démo sur place | Montrer les avancées |
| **Fin de mois** | ✅ Validation jalon | Valider le livrable |

---

## 💡 Ce qui peut être sacrifié (si retard)

**En dernier recours seulement :**

1. ❌ PWA mobile → Les parents utilisent le site web
2. ❌ Notifications push → Ils reçoivent des emails
3. ❌ Emails groupés fancy → Email simple sans template
4. ❌ Rapports avancés → Export CSV basique

**JAMAIS sacrifier :**
- ✅ Inscriptions (base de tout)
- ✅ Facturation (valeur #1 pour Audrey)
- ✅ Repas/Périscolaire (gestion quotidienne)

---

## ✅ Checklist Fin de Stage (23 juin)

### Application
- [ ] Inscriptions en ligne ✅
- [ ] Facturation automatique avec PDF
- [ ] Export SEPA pour la banque
- [ ] Commandes repas/périscolaire
- [ ] Messagerie parent-école
- [ ] Emails groupés
- [ ] Application déployée en production

### Documentation
- [ ] Guide utilisateur pour Audrey
- [ ] Documentation technique (RECAP_PROJET.md)
- [ ] Variables d'environnement documentées
- [ ] Procédure de déploiement

### Formation
- [ ] Audrey sait utiliser l'admin
- [ ] Audrey sait générer les factures
- [ ] Audrey sait exporter pour la banque
- [ ] Contact d'urgence si bug critique

---

**Créé le :** 6 janvier 2026  
**Méthodologie :** Priorisation par risque + valeur business  
**Fin de stage :** 23 juin 2026

---

## 🎓 CONTRAINTE LICENCE L3

### En parallèle du stage (Juin 2026)
- 📝 Mémoire de **40 pages** à rédiger
- 🎤 **Oral de soutenance** à préparer

### Impact sur le planning
Le mois de juin est donc plus léger en développement :
- Semaines 21-22 : Tests + corrections (peut être fait en parallèle du mémoire)
- Semaines 23-24 : Déploiement + formation (moins intense)

**Objectif réaliste** : Toutes les fonctionnalités principales terminées **fin mai** pour avoir le temps de respirer en juin.

### Le mémoire peut porter sur ce projet !
Sujet idéal : *"Migration d'une application web Laravel vers une architecture moderne Next.js/NestJS"*

Chapitres possibles :
1. Contexte et analyse de l'existant
2. Choix technologiques et justifications
3. Architecture et implémentation
4. Sécurité et bonnes pratiques
5. Gestion de projet et communication client
6. Résultats et perspectives
