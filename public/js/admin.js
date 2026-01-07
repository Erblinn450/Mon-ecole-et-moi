// Vérifier si l'admin est connecté
if (sessionStorage.getItem("admin_logged") !== "true") {
  alert(
    "⚠️ Accès refusé ! Vous devez être connecté en tant qu'administrateur."
  );
  window.location.href = "/login";
}

// Afficher l'email de l'admin connecté
const adminEmail = sessionStorage.getItem("admin_email");
console.log("Admin connecté :", adminEmail);

// Gérer la déconnexion
const btnDeconnexion = document.getElementById("btn-deconnexion");
if (btnDeconnexion) {
  btnDeconnexion.addEventListener("click", function (e) {
    e.preventDefault();
    sessionStorage.clear();
    window.location.href = "/login";
  });
}

// État du filtre
let masquerCompteCrees = false;

// Fonction de tri des dossiers
function trierDossiers(dossiers) {
  return dossiers.sort((a, b) => {
    // Ordre de priorité des statuts : En attente > Validé > Refusé
    const prioriteStatut = {
      "En attente": 1,
      Validé: 2,
      Refusé: 3,
    };

    const prioriteA = prioriteStatut[a.statut] || 4;
    const prioriteB = prioriteStatut[b.statut] || 4;

    // Trier d'abord par statut
    if (prioriteA !== prioriteB) {
      return prioriteA - prioriteB;
    }

    // Si même statut, trier par date de demande (plus récent en premier)
    const dateA = new Date(a.date_demande);
    const dateB = new Date(b.date_demande);
    return dateB - dateA;
  });
}

// Charger les préinscriptions depuis localStorage
function loadPreinscriptions() {
  let preinscriptions = JSON.parse(
    localStorage.getItem("preinscriptions") || "[]"
  );
  const tbody = document.getElementById("dossiers-list");

  console.log("📋 Chargement des préinscriptions...");
  console.log("Nombre de préinscriptions :", preinscriptions.length);
  console.log("Données :", preinscriptions);

  // Filtrer si l'option "masquer compte créés" est activée
  let dossiersAffiches = preinscriptions;
  if (masquerCompteCrees) {
    dossiersAffiches = preinscriptions.filter(
      (dossier) => !dossier.compte_cree
    );
  }

  // Trier les dossiers
  dossiersAffiches = trierDossiers([...dossiersAffiches]);

  if (dossiersAffiches.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: #999;">
          ${
            masquerCompteCrees
              ? "Aucun dossier à traiter.<br><br>💡 Tous les dossiers affichés ont été traités."
              : 'Aucun dossier de préinscription pour le moment.<br><br>💡 <strong>Astuce :</strong> Allez sur <a href="/formulaire" style="color: var(--primary-color);">le formulaire de préinscription</a> pour créer un dossier de test.'
          }
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = "";

  dossiersAffiches.forEach((dossier) => {
    // Trouver l'index réel dans le tableau complet (pas le tableau filtré)
    const indexReel = preinscriptions.findIndex(
      (d) =>
        d.id === dossier.id ||
        (d.num_dossier === dossier.num_dossier &&
          d.prenom_enfant === dossier.prenom_enfant)
    );
    const index =
      indexReel !== -1 ? indexReel : preinscriptions.indexOf(dossier);

    const row = document.createElement("tr");

    const statusClass =
      dossier.statut === "Validé"
        ? "status-validated"
        : dossier.statut === "Refusé"
        ? "status-refused"
        : "status-pending";

    // Support pour les deux formats de données (ancien et nouveau)
    let nomParent = "";
    if (dossier.responsables && dossier.responsables.length > 0) {
      const responsable = dossier.responsables[0];
      nomParent = `${responsable.prenom} ${responsable.nom}`;
    } else if (dossier.responsable1_nom) {
      nomParent = `${dossier.responsable1_prenom || ""} ${
        dossier.responsable1_nom
      }`;
    }

    const nomEnfant = `${dossier.prenom_enfant} ${dossier.nom_enfant}`;

    const dateDemandeObj = new Date(dossier.date_demande);
    const dateDemandeFormatee = dateDemandeObj.toLocaleDateString("fr-FR");

    const dateIntegration = dossier.date_integration
      ? new Date(dossier.date_integration).toLocaleDateString("fr-FR")
      : "Non renseignée";

    const statusBadge = `<span class="status-badge ${statusClass}">${dossier.statut}</span>`;

    let actions = "";

    if (dossier.statut === "En attente") {
      actions = `
        <button class="valider" onclick="validerDossier(${index})">✓ Valider</button>
        <button class="refuser" onclick="refuserDossier(${index})">✗ Refuser</button>
      `;
    } else if (dossier.statut === "Validé" && !dossier.compte_cree) {
      actions = `
        <a href="/creer-compte?id=${index}" class="creer-compte">👤 Créer compte</a>
      `;
    } else if (dossier.compte_cree) {
      actions = `
        <span style="color: var(--success-color); font-weight: 600;">✓ Compte créé</span>
        <button class="btn-small" style="background: #607d8b; margin-left: 5px;" onclick="masquerDossier(${index})">👁️ Masquer</button>
      `;
    }

    actions += `<button class="supprimer" onclick="supprimerDossier(${index})">🗑️ Supprimer</button>`;

    row.innerHTML = `
      <td><strong>#${dossier.num_dossier}</strong></td>
      <td>${nomParent}</td>
      <td>${nomEnfant}</td>
      <td>${dossier.annee_scolaire}</td>
      <td>${dateIntegration}</td>
      <td>${dateDemandeFormatee}</td>
      <td>${statusBadge}</td>
      <td>${actions}</td>
    `;

    // Rendre la ligne cliquable
    row.classList.add("table-row-clickable");
    row.addEventListener("click", function (e) {
      // Ne pas rediriger si on clique sur un bouton
      if (e.target.tagName === "BUTTON" || e.target.tagName === "A") {
        return;
      }
      window.location.href = `/dossier-detail?id=${index}`;
    });

    tbody.appendChild(row);
  });
}

// Basculer le filtre pour masquer/afficher les comptes créés
function toggleMasquerCompteCrees() {
  masquerCompteCrees = !masquerCompteCrees;
  const checkbox = document.getElementById("filter-compte-cree");
  if (checkbox) {
    checkbox.checked = masquerCompteCrees;
  }
  loadPreinscriptions();
}

// Masquer un dossier spécifique (marquer comme "archivé" ou simplement ne plus l'afficher)
function masquerDossier(index) {
  // Active le filtre pour masquer tous les dossiers avec compte créé
  masquerCompteCrees = true;
  const checkbox = document.getElementById("filter-compte-cree");
  if (checkbox) {
    checkbox.checked = true;
  }
  loadPreinscriptions();
  alert(
    "✅ Filtre activé : les dossiers avec compte créé sont maintenant masqués."
  );
}

function validerDossier(index) {
  const preinscriptions = JSON.parse(
    localStorage.getItem("preinscriptions") || "[]"
  );
  preinscriptions[index].statut = "Validé";
  localStorage.setItem("preinscriptions", JSON.stringify(preinscriptions));
  loadPreinscriptions();
  alert("✅ Dossier validé avec succès !");
}

function refuserDossier(index) {
  if (confirm("⚠️ Êtes-vous sûr de vouloir refuser ce dossier ?")) {
    const preinscriptions = JSON.parse(
      localStorage.getItem("preinscriptions") || "[]"
    );
    preinscriptions[index].statut = "Refusé";
    localStorage.setItem("preinscriptions", JSON.stringify(preinscriptions));
    loadPreinscriptions();
    alert("❌ Dossier refusé.");
  }
}

function supprimerDossier(index) {
  if (
    confirm("⚠️ Êtes-vous sûr de vouloir supprimer définitivement ce dossier ?")
  ) {
    const preinscriptions = JSON.parse(
      localStorage.getItem("preinscriptions") || "[]"
    );
    preinscriptions.splice(index, 1);
    localStorage.setItem("preinscriptions", JSON.stringify(preinscriptions));
    loadPreinscriptions();
    alert("🗑️ Dossier supprimé.");
  }
}

// Charger au démarrage
loadPreinscriptions();
