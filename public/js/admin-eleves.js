// Vérifier si l'admin est connecté
if (sessionStorage.getItem("admin_logged") !== "true") {
  alert(
    "⚠️ Accès refusé ! Vous devez être connecté en tant qu'administrateur."
  );
  window.location.href = "/login";
}

// Gérer la déconnexion
const btnDeconnexion = document.getElementById("btn-deconnexion");
if (btnDeconnexion) {
  btnDeconnexion.addEventListener("click", function (e) {
    e.preventDefault();
    sessionStorage.clear();
    window.location.href = "/login";
  });
}

// Mapping des niveaux par groupe
const niveauxParGroupe = {
  maternelle: [
    { value: "PS", label: "PS - Petite Section" },
    { value: "MS", label: "MS - Moyenne Section" },
    { value: "GS", label: "GS - Grande Section" },
  ],
  primaire: [
    { value: "CP", label: "CP - Cours Préparatoire" },
    { value: "CE1", label: "CE1 - Cours Élémentaire 1" },
    { value: "CE2", label: "CE2 - Cours Élémentaire 2" },
    { value: "CM1", label: "CM1 - Cours Moyen 1" },
    { value: "CM2", label: "CM2 - Cours Moyen 2" },
  ],
  college: [
    { value: "6ème", label: "6ème" },
    { value: "5ème", label: "5ème" },
    { value: "4ème", label: "4ème" },
    { value: "3ème", label: "3ème" },
  ],
};

// Déterminer automatiquement le groupe à partir du niveau (classe)
function determinerGroupe(classe) {
  if (!classe) return null;

  const niveauUpper = classe.toUpperCase();

  if (
    [
      "PS",
      "MS",
      "GS",
      "PETITE SECTION",
      "MOYENNE SECTION",
      "GRANDE SECTION",
    ].includes(niveauUpper)
  ) {
    return "maternelle";
  }
  if (["CP", "CE1", "CE2", "CM1", "CM2"].includes(niveauUpper)) {
    return "primaire";
  }
  if (
    ["6ÈME", "5ÈME", "4ÈME", "3ÈME", "6EME", "5EME", "4EME", "3EME"].includes(
      niveauUpper
    )
  ) {
    return "college";
  }

  return null;
}

// Normaliser le niveau (classe) pour uniformiser le format
function normaliserNiveau(classe) {
  if (!classe) return null;

  const mapping = {
    "PETITE SECTION": "PS",
    "MOYENNE SECTION": "MS",
    "GRANDE SECTION": "GS",
  };

  const niveauUpper = classe.toUpperCase();
  return mapping[niveauUpper] || classe;
}

let elevesData = [];

// Charger les élèves depuis les préinscriptions validées
function chargerEleves() {
    fetch("/api/eleves")
        .then(response => response.json())
        .then(data => {
            elevesData = data.map(eleve => ({
                ...eleve,
                groupe: determinerGroupe(eleve.classe),
                niveau: normaliserNiveau(eleve.classe)
            }));

            afficherEleves(elevesData);
            calculerStatistiques(elevesData);
        })
        .catch(err => {
            console.error("Erreur API :", err);
            alert("❌ Impossible de charger les élèves depuis le serveur.");
        });
}


// Afficher les élèves dans le tableau
// Afficher les élèves dans le tableau
function afficherEleves(eleves) {
    const tbody = document.getElementById("eleves-list");

    if (eleves.length === 0) {
        tbody.innerHTML = `
      <tr>
        <td colspan="6" class="no-dossiers">
          Aucun élève trouvé.<br><br>
          💡 <strong>Astuce :</strong> Les élèves apparaissent ici après validation de leur dossier et création du compte parent.
        </td>
      </tr>
    `;
        return;
    }

    tbody.innerHTML = "";

    eleves.forEach((eleve, index) => {
        const row = document.createElement("tr");

        // Nom complet de l'élève
        const nomComplet = `${eleve.prenom || eleve.prenom_enfant} ${eleve.nom || eleve.nom_enfant}`;

        // Date de naissance
        const dateNaissance = eleve.date_naissance
            ? new Date(eleve.date_naissance).toLocaleDateString("fr-FR")
            : "N/A";

        // Parent 1
        const nomParent1 = eleve.parent1
            ? `${eleve.parent1.prenom} ${eleve.parent1.nom}`
            : `${eleve.responsable1_prenom || ""} ${eleve.responsable1_nom || ""}`;

        // Parent 2 (facultatif)
        const nomParent2 = eleve.parent2
            ? `${eleve.parent2.prenom} ${eleve.parent2.nom}`
            : `${eleve.responsable2_prenom || ""} ${eleve.responsable2_nom || ""}`;

        // On peut afficher parent1 et parent2 séparément ou juste parent1
        const nomParent = nomParent1; // ici on garde seulement le parent principal

        // Groupe et niveau
        const groupeLabel = eleve.groupe
            ? {
                maternelle: "🎨 Maternelle",
                primaire: "📖 Primaire",
                college: "📚 Collège",
            }[eleve.groupe]
            : '<span style="color: #999;">Non assigné</span>';

        const niveauLabel = eleve.niveau
            ? eleve.niveau
            : '<span style="color: #999;">Non assigné</span>';

        row.innerHTML = `
      <td><strong>${nomComplet}</strong></td>
      <td>${dateNaissance}</td>
      <td>${nomParent}</td>
      <td>${groupeLabel}</td>
      <td>${niveauLabel}</td>
      <td>
        <button class="btn-small btn-primary" onclick="ouvrirModalAssignation(${index})">
          ✏️ Assigner
        </button>
      </td>
    `;

        tbody.appendChild(row);
    });
}


// Calculer et afficher les statistiques
function calculerStatistiques(eleves) {
  const stats = {
    total: eleves.length,
    maternelle: eleves.filter((e) => e.groupe === "maternelle").length,
    primaire: eleves.filter((e) => e.groupe === "primaire").length,
    college: eleves.filter((e) => e.groupe === "college").length,
    nonAssigne: eleves.filter((e) => !e.groupe).length,
  };

  document.getElementById("stat-total").textContent = stats.total;
  document.getElementById("stat-maternelle").textContent = stats.maternelle;
  document.getElementById("stat-primaire").textContent = stats.primaire;
  document.getElementById("stat-college").textContent = stats.college;
  document.getElementById("stat-non-assigne").textContent = stats.nonAssigne;
}

// Ouvrir le modal d'assignation
function ouvrirModalAssignation(index) {
    const eleve = elevesData[index];
    const modal = document.getElementById("modal-assignation");

    document.getElementById("eleve-id").value = index;
    document.getElementById(
        "eleve-nom"
    ).textContent = `${eleve.prenom || eleve.prenom_enfant} ${eleve.nom || eleve.nom_enfant}`;

    const selectGroupe = document.getElementById("select-groupe");
    const selectNiveau = document.getElementById("select-niveau");

    // Préremplir les valeurs existantes
    if (eleve.groupe) {
        selectGroupe.value = eleve.groupe;
        remplirNiveaux(eleve.groupe);
    } else {
        selectGroupe.value = "";
        selectNiveau.innerHTML = '<option value="">-- Sélectionner un niveau --</option>';
    }

    if (eleve.niveau) {
        selectNiveau.value = eleve.niveau;
    } else {
        selectNiveau.value = "";
    }

    modal.classList.add("show");
}

// Rendre la fonction accessible globalement pour les onclick dans innerHTML
window.ouvrirModalAssignation = ouvrirModalAssignation;

// Remplir la liste des niveaux selon le groupe sélectionné
function remplirNiveaux(groupe) {
  const selectNiveau = document.getElementById("select-niveau");
  selectNiveau.innerHTML =
    '<option value="">-- Sélectionner un niveau --</option>';

  if (groupe && niveauxParGroupe[groupe]) {
    niveauxParGroupe[groupe].forEach((niveau) => {
      const option = document.createElement("option");
      option.value = niveau.value;
      option.textContent = niveau.label;
      selectNiveau.appendChild(option);
    });
  }
}

// Gérer le changement de groupe
document.getElementById("select-groupe").addEventListener("change", (e) => {
  remplirNiveaux(e.target.value);
});

// Enregistrer l'assignation
document.getElementById("form-assignation").addEventListener("submit", async (e) => {
    e.preventDefault();

    const index = parseInt(document.getElementById("eleve-id").value);
    const groupe = document.getElementById("select-groupe").value;
    const niveau = document.getElementById("select-niveau").value;

    if (!groupe || !niveau) {
        alert("⚠️ Veuillez sélectionner un groupe et un niveau.");
        return;
    }

    const eleveId = elevesData[index].id_enfant; // ou id selon ton API

    try {
        const response = await fetch(`/api/eleves/${eleveId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({ groupe, classe: niveau }),
        });

        const data = await response.json();

        if (response.ok) {
            // Mettre à jour localement
            elevesData[index].groupe = data.enfant.groupe;
            elevesData[index].niveau = data.enfant.classe;
            elevesData[index].classe = data.enfant.classe;

            alert(`✅ ${elevesData[index].prenom} ${elevesData[index].nom} a été assigné(e) avec succès !`);
            document.getElementById("modal-assignation").classList.remove("show");
            chargerEleves(); // recharge depuis l'API pour actualiser
        } else {
            alert(`❌ Erreur : ${data.message}`);
        }
    } catch (err) {
        console.error(err);
        alert("❌ Impossible de communiquer avec le serveur.");
    }
});

// Annuler le modal
document.getElementById("btn-annuler").addEventListener("click", () => {
  document.getElementById("modal-assignation").classList.remove("show");
});

// Filtrer les élèves
document.getElementById("filter-groupe").addEventListener("change", (e) => {
  const groupe = e.target.value;
  let elevesFiltres = elevesData;

  if (groupe !== "tous") {
    if (groupe === "non-assigne") {
      elevesFiltres = elevesData.filter((e) => !e.groupe);
    } else {
      elevesFiltres = elevesData.filter((e) => e.groupe === groupe);
    }
  }

  afficherEleves(elevesFiltres);
});

document.getElementById("filter-niveau").addEventListener("change", (e) => {
  const niveau = e.target.value;
  let elevesFiltres = elevesData;

  if (niveau !== "tous") {
    elevesFiltres = elevesData.filter((e) => e.niveau === niveau);
  }

  afficherEleves(elevesFiltres);
});

// Charger au démarrage
chargerEleves();
