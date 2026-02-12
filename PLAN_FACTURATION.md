# Plan Module Facturation - Mon École et Moi

**Période** : Février - Mars 2026 (8 semaines)
**Source** : Cahier des charges Audrey Ballester + réponses SMS du 5 février 2026
**Priorité** : #1 - Module le plus important pour la cliente

---

## 1. Cahier des Charges (Résumé)

### 1.1 Les différentes facturations

#### Frais d'inscription 1ère année
| | Montant |
|--|---------|
| 1 enfant | 350,00 € |
| Fratrie* | 150,00 € |

#### Frais d'inscription (années suivantes)
| | Montant |
|--|---------|
| 1 enfant | 195,00 € |
| Fratrie* | 160,00 € |

#### Frais de matériel pédagogique
| Tranche d'âge | Montant |
|----------------|---------|
| 3 à 6 ans (maternelle) | 65,00 € |
| 6 à 12 ans (élémentaire) | 85,00 € |
| Collège | 95,00 € |

#### Frais de scolarité - Maison des enfants et 6-12 ans
| | Mensuel (12x) | Trimestriel (4x) | Annuel (1x) |
|--|---------------|-------------------|-------------|
| 1 enfant | 575 € | 1 725 € | 6 900 € |
| Fratrie* | 540 € | 1 620 € | 6 480 € |

*Encaissement mensuel entre le 1 et le 5 du mois correspondant.*
*Trimestriel : avant les 31 août, 30 novembre, 28 février et 31 mai.*

#### Frais de scolarité - Collège
| | Mensuel (12x) | Trimestriel (4x) | Annuel (1x) |
|--|---------------|-------------------|-------------|
| 1 enfant | 710 € | 2 130 € | 8 520 € |
| Fratrie* | 640 € | 1 920 € | 7 680 € |

> *Fratrie = tarif réduit à partir du 2e enfant inscrit
> Réduction fratrie : -6% pour maison des enfants / 6-12 ans
> Augmentation de 1% par an des frais de scolarité possible

#### Réduction RFR (Revenu Fiscal de Référence)
- Maison des enfants / 6-12 ans : -6%
- Collège : -19%
- Sur demande, sur justificatif, décision de l'admin au cas par cas
- En expérimentation depuis 2025

#### Restauration et périscolaire
| Service | Tarif |
|---------|-------|
| Repas (végé ou tradi) | 5,45 € |
| Périscolaire (jusqu'à 17h30, goûter inclus) | 6,20 € |
| Dépassement périscolaire | Montant variable, ligne manuelle ajoutée par l'admin avec commentaire |

### 1.2 La facture - Obligations légales

Éléments obligatoires sur chaque facture :
- Coordonnées école : nom, adresse, IBAN, SIRET, logo, email
- Date de facturation
- Numéro de facturation unique (format : `FA-YYYYMM-XXXX`)
- Coordonnées parentales
- Nom de l'enfant
- Les différents articles (lignes de facturation)
- Date d'échéance
- Mode de paiement + date de prélèvement si applicable

#### Informations école pour la facture
```
Mon École Montessori et Moi
58 rue Damberg, 68350 Brunstatt-Didenheim
contact@montessorietmoi.com
www.mon-ecole-et-moi.com
SIRET : 813 743 978 00021
IBAN : FR76 3008 7332 2800 0204 5700 129
BIC : CMCIFRPP
```

#### Pas de TVA
L'école est exonérée de TVA sur son activité. Aucune TVA à afficher sur les factures.

### 1.3 Le moment de la facturation

#### Principe
- **Scolarité** = comme un loyer, facturée en **début de mois** (le mois précédent)
- **Repas + Périscolaire** = au **réel**, facturés en **fin de mois**

#### Exemple concret
- Août : facturation des frais de scolarité de septembre pour 575 € le 25/08
- Fin septembre : 15 repas (81,75 €) + 7 périscolaire (43,40 €) → facturés avec les frais de scolarité d'octobre

#### Calendrier selon la fréquence

**Mensuel (12 versements)** : facturation chaque fin de mois pour le mois suivant

**Trimestriel (4 versements)** :
- Fin août → règlement début septembre
- Fin novembre → règlement début décembre
- Fin février → règlement début mars
- Fin mai → règlement début juin

**Semestriel (2 versements)** :
- Fin août → règlement début septembre
- Fin février → règlement début mars

**Annuel (1 versement)** : avant le 31 août précédant la rentrée scolaire

> Note : repas et périscolaire sont TOUJOURS facturés mensuellement au réel, quelle que soit la fréquence de scolarité.

### 1.4 Modes de paiement
- **Prélèvement SEPA** (à privilégier) - Audrey a déjà un système en place avec sa banque
- **Virement**

### 1.5 Gestion des prélèvements
- Si incident bancaire (prélèvement rejeté), l'admin doit pouvoir marquer la facture comme "impayée" / "incident"

### 1.6 Fonctionnalités admin (direction)
- Modifier les tarifs (prix repas, péri, scolarité, inscription, etc.) directement dans l'app
- Créer des articles personnalisés (sortie scolaire, classe verte, activité...)
- Ajouter une ligne de réduction sur une facture
- Ajouter un commentaire sur une facture
- Modifier manuellement le montant d'une ligne (prorata, ajustement)
- Déclencher la facturation de TOUTES les familles en un clic (batch)

### 1.7 Visibilité pour les familles (parents)
- Voir la liste de leurs factures
- Télécharger les factures en PDF

---

## 2. Réponses d'Audrey (5 février 2026)

| Question | Réponse |
|----------|---------|
| Collège prévu ? | **Oui** → ajouter COLLEGE à l'enum Classe |
| Fréquence par famille ou enfant ? | **Par famille** |
| Facturation 2 parents ? | **Choix** : envoyer aux 2, ou mère seule, ou père seul (cas de divorce) |
| SEPA en place ? | **Oui**, déjà en place avec la banque |
| Dépassement péri ? | **Ligne manuelle** avec montant modifiable + zone commentaire pour le calcul |
| Réduction RFR ? | **Oui**, admin décide au cas par cas |
| Prorata arrivée en cours d'année ? | **Oui**, et admin peut modifier le montant manuellement sur la facture |
| TVA ? | **Pas de TVA**, exonéré |

---

## 3. Décisions Techniques

### 3.1 Modifications Prisma nécessaires

#### Nouveaux enums
```prisma
// Ajouter COLLEGE à l'enum existante
enum Classe { MATERNELLE, ELEMENTAIRE, COLLEGE }

// Fréquence de paiement (par famille)
enum FrequencePaiement { MENSUEL, TRIMESTRIEL, SEMESTRIEL, ANNUEL }

// Mode de paiement
enum ModePaiement { PRELEVEMENT, VIREMENT }

// Destinataire facture
enum DestinataireFacture { LES_DEUX, PARENT1, PARENT2 }
```

#### Nouvelle table : ConfigTarifs
Table pour stocker les tarifs modifiables par l'admin (pas de prix hardcodé dans le code).
```
config_tarifs:
  - id, cle (ex: "scolarite_mensuel_normal"), valeur (Decimal), description, anneeScolaire, updatedAt
```

#### Nouvelle table : ArticlePersonnalise
Articles créés par l'admin (sortie scolaire, classe verte, etc.)
```
articles_personnalises:
  - id, nom, description, prixDefaut, actif, createdAt, updatedAt
```

#### Nouvelle table : Paiement
Suivi des paiements reçus pour chaque facture.
```
paiements:
  - id, factureId, montant, datePaiement, modePaiement, reference, commentaire, createdAt
```

#### Modifications table Facture existante
- Ajouter : `enfantId` (nom de l'enfant sur la facture)
- Ajouter : `destinataire` (enum DestinataireFacture)
- Ajouter : `modePaiement` (enum ModePaiement)
- Ajouter : `datePrelevement` (Date, nullable)
- Ajouter : `commentaire` (String, nullable)
- Ajouter : `anneeScolaire` (String, ex: "2025-2026")

#### Modifications table LigneFacture existante
- Ajouter : `commentaire` (String, nullable) - pour le calcul du dépassement péri par ex
- Ajouter : `type` (enum TypeLigne: SCOLARITE, REPAS, PERISCOLAIRE, DEPASSEMENT, INSCRIPTION, MATERIEL, REDUCTION, PERSONNALISE)

#### Modifications table User existante
- Ajouter : `frequencePaiement` (enum FrequencePaiement, default MENSUEL)
- Ajouter : `modePaiement` (enum ModePaiement, default PRELEVEMENT)
- Ajouter : `destinataireFacture` (enum DestinataireFacture, default LES_DEUX)
- Ajouter : `reductionRFR` (Boolean, default false)
- Ajouter : `tauxReductionRFR` (Decimal, nullable) - pourcentage de réduction
- Ajouter : `ibanParent` (String, nullable) - pour le prélèvement SEPA
- Ajouter : `mandatSepaRef` (String, nullable) - référence du mandat SEPA

### 3.2 Architecture backend

```
backend/src/modules/facturation/
├── facturation.module.ts          # Module principal
├── facturation.controller.ts      # Endpoints API
├── facturation.service.ts         # Logique métier (calculs, génération)
├── facturation-pdf.service.ts     # Génération PDF factures
├── facturation-sepa.service.ts    # Export XML SEPA
├── dto/
│   ├── create-facture.dto.ts
│   ├── update-facture.dto.ts
│   ├── generer-batch.dto.ts
│   └── enregistrer-paiement.dto.ts
└── config/
    └── tarifs.config.ts           # Clés de configuration des tarifs
```

### 3.3 Endpoints API prévus

#### Admin
- `POST /facturation/generer-batch` - Générer les factures de toutes les familles pour une période
- `POST /facturation/generer/:parentId` - Générer une facture individuelle
- `GET /facturation` - Liste toutes les factures (filtres : mois, statut, parent)
- `GET /facturation/:id` - Détail d'une facture
- `PATCH /facturation/:id` - Modifier une facture (montant, lignes, commentaire)
- `POST /facturation/:id/lignes` - Ajouter une ligne à une facture
- `PATCH /facturation/:id/lignes/:ligneId` - Modifier une ligne
- `DELETE /facturation/:id/lignes/:ligneId` - Supprimer une ligne
- `POST /facturation/:id/paiement` - Enregistrer un paiement
- `PATCH /facturation/:id/statut` - Changer statut (payé, impayé, incident)
- `GET /facturation/:id/pdf` - Télécharger PDF
- `POST /facturation/export-sepa` - Générer fichier XML SEPA
- `GET /facturation/stats` - Statistiques (total facturé, payé, impayé)

#### Config tarifs (admin)
- `GET /facturation/config/tarifs` - Voir tous les tarifs
- `PUT /facturation/config/tarifs` - Mettre à jour les tarifs
- `GET /facturation/config/articles` - Liste articles personnalisés
- `POST /facturation/config/articles` - Créer un article
- `PATCH /facturation/config/articles/:id` - Modifier un article
- `DELETE /facturation/config/articles/:id` - Supprimer un article

#### Parent
- `GET /facturation/mes-factures` - Liste mes factures
- `GET /facturation/mes-factures/:id` - Détail d'une facture
- `GET /facturation/mes-factures/:id/pdf` - Télécharger PDF

### 3.4 Pages frontend prévues

#### Admin
- `admin/facturation/` - Dashboard facturation (stats + liste factures)
- `admin/facturation/generer` - Page génération batch
- `admin/facturation/[id]` - Détail facture (modifier lignes, paiements, statut)
- `admin/facturation/config` - Configuration tarifs + articles personnalisés
- `admin/facturation/sepa` - Export SEPA

#### Parent
- `(parent)/mes-factures/` - Liste mes factures
- `(parent)/mes-factures/[id]` - Détail + télécharger PDF

---

## 4. Planning Semaine par Semaine

### FÉVRIER - Construction Backend

#### Semaine 1 (3-7 février) - Fondations
- [ ] Mise à jour schema Prisma (enum COLLEGE, tables ConfigTarifs, ArticlePersonnalise, Paiement)
- [ ] Migration BDD
- [ ] CRUD ConfigTarifs côté admin (pour qu'Audrey modifie les prix)
- [ ] CRUD ArticlePersonnalise
- [ ] Seed des tarifs par défaut

#### Semaine 2 (10-14 février) - Moteur de calcul
- [ ] Service de calcul scolarité selon fréquence (mensuel/trimestriel/semestriel/annuel)
- [ ] Calcul réduction fratrie (-6% maison/élémentaire, adapté collège)
- [ ] Réduction RFR (manuelle par admin, pourcentage configurable)
- [ ] Calcul repas + périscolaire au réel (basé sur les données du mois)
- [ ] Tests unitaires des calculs

#### Semaine 3 (17-21 février) - Génération factures
- [ ] Création facture individuelle avec toutes les lignes
- [ ] Génération batch (toutes les familles en un clic)
- [ ] Ajout/modification/suppression de lignes manuelles
- [ ] Articles personnalisés + lignes de réduction + commentaires
- [ ] Numérotation automatique (format FA-YYYYMM-XXXX)
- [ ] Gestion destinataire (2 parents / 1 seul)

#### Semaine 4 (24-28 février) - PDF + Emails
- [ ] Template PDF professionnel conforme aux obligations légales
- [ ] Logo, IBAN, SIRET, coordonnées, nom enfant
- [ ] Tableau articles avec montants, quantités, sous-totaux
- [ ] Section paiement (mode, date échéance, date prélèvement)
- [ ] Envoi facture par email avec PDF joint
- [ ] Template email Handlebars pour envoi facture

### MARS - Admin + Parent + SEPA

#### Semaine 5 (3-7 mars) - Interface admin facturation
- [ ] Dashboard facturation (stats : total facturé, payé, impayé, en retard)
- [ ] Page liste factures avec filtres (mois, statut, parent, enfant)
- [ ] Page détail facture (modifier lignes, ajouter réduction, commentaire)
- [ ] Page génération batch avec prévisualisation

#### Semaine 6 (10-14 mars) - Suivi paiements + Config
- [ ] Enregistrer paiement reçu (montant, date, mode, référence)
- [ ] Statuts factures (payé, impayé, partiel, incident bancaire, en retard)
- [ ] Relances automatiques par email (factures en retard)
- [ ] Page configuration tarifs côté admin (modifier tous les prix)
- [ ] Page gestion articles personnalisés

#### Semaine 7 (17-21 mars) - SEPA + Espace parent
- [ ] Génération fichier XML SEPA pain.008 (prélèvements)
- [ ] Interface export SEPA côté admin
- [ ] Côté parent : page liste mes factures
- [ ] Côté parent : page détail facture + télécharger PDF

#### Semaine 8 (24-28 mars) - Tests + Corrections
- [ ] Tests complets de tout le module (endpoints, calculs, PDF, SEPA)
- [ ] Corrections bugs
- [ ] Export CSV comptable (intégration avec module export existant)
- [ ] Tests avec données réalistes (plusieurs familles, fréquences différentes)

---

## 5. État d'Avancement

### Existant (déjà en place)
- Table `Facture` dans Prisma (basique : numero, parentId, montantTotal, statut, type, période)
- Table `LigneFacture` dans Prisma (description, quantité, prixUnit, montant)
- Table `CalendrierScolaire` dans Prisma
- Enums `StatutFacture` (EN_ATTENTE, ENVOYEE, PAYEE, PARTIELLE, EN_RETARD, ANNULEE)
- Enum `TypeFacture` (MENSUELLE, PONCTUELLE, AVOIR)
- Module NestJS basique avec 3 endpoints placeholder
- Config tarifs frontend (`frontend/src/config/tarifs.ts`) - **À REMPLACER par config BDD**

### À faire
Tout le reste : calculs, PDF, SEPA, interfaces admin/parent, configuration tarifs BDD, etc.

---

## 6. Questions en suspens

- [ ] Audrey doit montrer le fonctionnement du prorata / modification manuelle des montants (prévu demain 6 février)
- [ ] Format exact attendu par sa banque pour le SEPA (pain.008.001.02 ?)
- [ ] Référence mandat SEPA : comment sont-ils gérés actuellement ? (papier ? numérique ?)

---

**Créé le** : 5 février 2026
**Dernière mise à jour** : 5 février 2026
