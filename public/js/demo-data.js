// Script pour générer des données de démonstration

(function () {
  window.generateDemoData = function () {
    console.log("🚀 Génération des données de démonstration...");

    // 1. Créer le compte parent avec 3 enfants
    const parentAccount = {
      email: "parent@test.com",
      password: "test123",
      nom: "Martin",
      prenom: "Sophie",
      telephone: "0612345678",
      enfants: [
        {
          id: "ENF001",
          nom: "Martin",
          prenom: "Lucas",
          dateNaissance: "2018-05-15",
          classe: "PS",
          niveau: "maternelle",
          typeRepas: "normal",
          periscolaire: true,
        },
        {
          id: "ENF002",
          nom: "Martin",
          prenom: "Emma",
          dateNaissance: "2015-09-20",
          classe: "CP",
          niveau: "primaire",
          typeRepas: "vegetarien",
          periscolaire: false,
        },
        {
          id: "ENF003",
          nom: "Martin",
          prenom: "Tom",
          dateNaissance: "2012-03-10",
          classe: "6ème",
          niveau: "college",
          typeRepas: "normal",
          periscolaire: true,
        },
      ],
    };

    // 2. Générer 20 enfants déjà inscrits dans l'école
    const prenoms = [
      "Alexandre",
      "Léa",
      "Hugo",
      "Chloé",
      "Louis",
      "Camille",
      "Nathan",
      "Sarah",
      "Gabriel",
      "Zoé",
      "Arthur",
      "Manon",
      "Jules",
      "Inès",
      "Paul",
      "Louise",
      "Adam",
      "Alice",
      "Raphaël",
      "Jade",
    ];

    const noms = [
      "Dupont",
      "Bernard",
      "Dubois",
      "Moreau",
      "Laurent",
      "Simon",
      "Michel",
      "Lefebvre",
      "Leroy",
      "Roux",
      "David",
      "Bertrand",
      "Morel",
      "Fournier",
      "Girard",
      "Bonnet",
      "Durand",
      "Blanc",
      "Guerin",
      "Muller",
    ];

    const classes = {
      maternelle: ["PS", "MS", "GS"],
      primaire: ["CP", "CE1", "CE2", "CM1", "CM2"],
      college: ["6ème", "5ème", "4ème", "3ème"],
    };

    const enfantsInscrits = [];

    for (let i = 0; i < 20; i++) {
      const niveaux = ["maternelle", "primaire", "college"];
      const niveau = niveaux[Math.floor(Math.random() * niveaux.length)];
      const classesList = classes[niveau];
      const classe =
        classesList[Math.floor(Math.random() * classesList.length)];
      const typeRepas = Math.random() > 0.7 ? "vegetarien" : "normal";
      const periscolaire = Math.random() > 0.5;

      enfantsInscrits.push({
        id: `ENF${String(i + 4).padStart(3, "0")}`,
        nom: noms[i],
        prenom: prenoms[i],
        dateNaissance: `201${Math.floor(Math.random() * 8) + 2}-${String(
          Math.floor(Math.random() * 12) + 1
        ).padStart(2, "0")}-${String(
          Math.floor(Math.random() * 28) + 1
        ).padStart(2, "0")}`,
        classe: classe,
        niveau: niveau,
        typeRepas: typeRepas,
        periscolaire: periscolaire,
        email: `parent${i + 1}@test.com`,
      });
    }

    // 3. Créer des dossiers de préinscription pour chaque classe
    const preinscriptions = [];
    let dossierId = 1001;

    // Ajouter d'abord les 3 enfants du compte parent@test.com
    parentAccount.enfants.forEach((enfant, index) => {
      preinscriptions.push({
        id: dossierId++,
        num_dossier: `DOSS-${dossierId}`,
        nom_enfant: enfant.nom,
        prenom_enfant: enfant.prenom,
        date_naissance: enfant.dateNaissance,
        sexe: enfant.prenom === "Emma" ? "Féminin" : "Masculin",
        lieu_naissance: "Strasbourg",
        nationalite: "Française",
        adresse: "12 rue des Écoles",
        ville: "Strasbourg",
        code_postal: "67000",
        classe: enfant.classe,
        regime: enfant.typeRepas,
        annee_scolaire: "2025-2026",
        date_integration: "2025-09-01",
        responsable1_nom: parentAccount.nom,
        responsable1_prenom: parentAccount.prenom,
        responsable1_telephone: parentAccount.telephone,
        responsable1_email: parentAccount.email,
        responsable1_profession: "Ingénieur",
        statut: "Validé",
        date_demande: "2025-01-15",
        compte_cree: true,
      });
    });

    // Dossiers pour toutes les classes (au moins un par classe)
    Object.keys(classes).forEach((niveau) => {
      classes[niveau].forEach((classe) => {
        const prenomIndex = Math.floor(Math.random() * prenoms.length);
        const nomIndex = Math.floor(Math.random() * noms.length);

        const anneeScolaire = "2025-2026";
        const dateIntegration = `2025-09-${String(
          Math.floor(Math.random() * 5) + 1
        ).padStart(2, "0")}`;
        const dateDemande = `2025-${String(
          Math.floor(Math.random() * 3) + 1
        ).padStart(2, "0")}-${String(
          Math.floor(Math.random() * 28) + 1
        ).padStart(2, "0")}`;

        preinscriptions.push({
          id: dossierId,
          num_dossier: `DOSS-${dossierId++}`,
          nom_enfant: noms[nomIndex],
          prenom_enfant: prenoms[prenomIndex],
          date_naissance: `201${Math.floor(Math.random() * 8) + 2}-${String(
            Math.floor(Math.random() * 12) + 1
          ).padStart(2, "0")}-${String(
            Math.floor(Math.random() * 28) + 1
          ).padStart(2, "0")}`,
          sexe: Math.random() > 0.5 ? "Masculin" : "Féminin",
          lieu_naissance: "Paris",
          nationalite: "Française",
          adresse: `${Math.floor(Math.random() * 100)} rue de la République`,
          ville: "Strasbourg",
          code_postal: "67000",
          classe: classe,
          annee_scolaire: anneeScolaire,
          date_integration: dateIntegration,
          responsable1_civilite: Math.random() > 0.5 ? "Madame" : "Monsieur",
          responsable1_nom: noms[nomIndex],
          responsable1_prenom: Math.random() > 0.5 ? "Marie" : "Pierre",
          responsable1_lien: "Père/Mère",
          responsable1_telephone: `06${Math.floor(Math.random() * 100000000)
            .toString()
            .padStart(8, "0")}`,
          responsable1_email: `parent.demo${dossierId}@test.com`,
          responsable1_adresse: `${Math.floor(
            Math.random() * 100
          )} rue de la République, 67000 Strasbourg`,
          responsable1_profession: "Employé",
          responsables: [
            {
              nom: noms[nomIndex],
              prenom: Math.random() > 0.5 ? "Marie" : "Pierre",
              relation: "Père/Mère",
              telephone: `06${Math.floor(Math.random() * 100000000)
                .toString()
                .padStart(8, "0")}`,
              email: `parent.demo${dossierId}@test.com`,
              profession: "Employé",
              adresse_identique: true,
            },
          ],
          statut: Math.random() > 0.3 ? "Validé" : "En attente",
          date_demande: dateDemande,
          date_creation_compte:
            Math.random() > 0.3
              ? new Date(dateIntegration).toISOString()
              : undefined,
        });

        // Si le statut est "Validé", créer le compte
        const lastPreinscription = preinscriptions[preinscriptions.length - 1];
        if (lastPreinscription.statut === "Validé") {
          lastPreinscription.compte_cree = true;
          if (!lastPreinscription.date_creation_compte) {
            lastPreinscription.date_creation_compte = new Date(
              dateIntegration
            ).toISOString();
          }
        } else {
          lastPreinscription.compte_cree = false;
        }
      });
    });

    // 4. Créer des commandes de repas pour les 2 prochaines semaines
    const commandes = [];
    const today = new Date();

    // Trouver le prochain lundi
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));

    // Générer des commandes pour les 3 enfants du compte parent@test.com
    parentAccount.enfants.forEach((enfant) => {
      for (let semaine = 0; semaine < 2; semaine++) {
        for (let jour = 0; jour < 5; jour++) {
          // Lundi à vendredi
          const date = new Date(nextMonday);
          date.setDate(nextMonday.getDate() + semaine * 7 + jour);

          // 80% de chance de commander un repas
          if (Math.random() > 0.2) {
            commandes.push({
              id: `CMD${commandes.length + 1}`,
              dossierId: enfant.id,
              parentEmail: parentAccount.email,
              enfantNom: enfant.nom,
              enfantPrenom: enfant.prenom,
              classe: enfant.classe,
              repas: true,
              typeRepas: enfant.typeRepas,
              periscolaire: enfant.periscolaire && Math.random() > 0.3,
              date: date.toISOString().split("T")[0],
              dates: [date.toISOString().split("T")[0]],
              dateCommande: new Date().toISOString(),
            });
          }
        }
      }
    });

    // Générer des commandes pour les 20 autres enfants
    enfantsInscrits.forEach((enfant) => {
      for (let semaine = 0; semaine < 2; semaine++) {
        for (let jour = 0; jour < 5; jour++) {
          const date = new Date(nextMonday);
          date.setDate(nextMonday.getDate() + semaine * 7 + jour);

          // 70% de chance de commander un repas pour les autres enfants
          if (Math.random() > 0.3) {
            commandes.push({
              id: `CMD${commandes.length + 1}`,
              dossierId: enfant.id,
              parentEmail: enfant.email,
              enfantNom: enfant.nom,
              enfantPrenom: enfant.prenom,
              classe: enfant.classe,
              repas: true,
              typeRepas: enfant.typeRepas,
              periscolaire: enfant.periscolaire && Math.random() > 0.4,
              date: date.toISOString().split("T")[0],
              dates: [date.toISOString().split("T")[0]],
              dateCommande: new Date().toISOString(),
            });
          }
        }
      }
    });

    // 5. Créer des comptes parents validés
    const comptesParents = [
      {
        email: parentAccount.email,
        password: parentAccount.password,
        nom: parentAccount.nom,
        prenom: parentAccount.prenom,
        telephone: parentAccount.telephone,
        dossierId: "DOSS001",
        status: "validé",
        dateCreation: "2025-11-14",
      },
    ];

    // Ajouter des comptes pour quelques autres parents
    for (let i = 0; i < 10; i++) {
      comptesParents.push({
        email: `parent${i + 1}@test.com`,
        password: "test123",
        nom: noms[i],
        prenom: i % 2 === 0 ? "Marie" : "Pierre",
        telephone: `06${Math.floor(Math.random() * 100000000)
          .toString()
          .padStart(8, "0")}`,
        dossierId: `DOSS${String(i + 2).padStart(3, "0")}`,
        status: "validé",
        dateCreation: `2025-11-${String(14 + i).padStart(2, "0")}`,
      });
    }

    // 6. Sauvegarder dans localStorage
    localStorage.setItem("preinscriptions", JSON.stringify(preinscriptions));
    localStorage.setItem("commandes_repas", JSON.stringify(commandes));
    localStorage.setItem("comptes_parents", JSON.stringify(comptesParents));
    localStorage.setItem(
      `enfants_${parentAccount.email}`,
      JSON.stringify(parentAccount.enfants)
    );

    // Sauvegarder les enfants pour chaque parent
    for (let i = 0; i < 10; i++) {
      const parentEmail = `parent${i + 1}@test.com`;
      const enfantsParent = enfantsInscrits.slice(i * 2, i * 2 + 2);
      if (enfantsParent.length > 0) {
        localStorage.setItem(
          `enfants_${parentEmail}`,
          JSON.stringify(enfantsParent)
        );
      }
    }

    console.log("✅ Données de démonstration générées avec succès !");
    console.log("📊 Statistiques :");
    console.log(`   - ${preinscriptions.length} dossiers de préinscription`);
    console.log(`   - ${comptesParents.length} comptes parents`);
    console.log(
      `   - ${
        parentAccount.enfants.length + enfantsInscrits.length
      } enfants inscrits`
    );
    console.log(`   - ${commandes.length} commandes de repas/périscolaire`);
    console.log(
      "\n🔐 Connexion parent : parent@test.com / test123 (3 enfants)"
    );
    console.log("🔐 Connexion admin : admin@ecole.com / admin123");

    // Afficher l'alerte de succès
    alert(`✅ Données de démonstration générées avec succès !

📊 Statistiques :
   - ${preinscriptions.length} dossiers de préinscription
   - ${comptesParents.length} comptes parents
   - ${parentAccount.enfants.length + enfantsInscrits.length} enfants inscrits
   - ${commandes.length} commandes de repas/périscolaire

🔐 Connexion parent : parent@test.com / test123 (3 enfants)
🔐 Connexion admin : admin@ecole.com / admin123`);

    return {
      preinscriptions,
      commandes,
      comptesParents,
      parentAccount,
      enfantsInscrits,
      stats: {
        dossiers: preinscriptions.length,
        comptes: comptesParents.length,
        enfants: parentAccount.enfants.length + enfantsInscrits.length,
        commandes: commandes.length,
      },
    };
  };

  window.clearDemoData = function () {
    localStorage.removeItem("preinscriptions");
    localStorage.removeItem("commandes_repas");
    localStorage.removeItem("comptes_parents");

    // Supprimer les enfants de tous les comptes
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("enfants_")) {
        localStorage.removeItem(key);
      }
    });

    console.log("✅ Toutes les données de démonstration ont été supprimées !");
  };
})();
