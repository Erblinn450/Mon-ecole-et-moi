// admin-repas.js - Gestion des repas pour l'admin (via API Laravel)

let toutesLesCommandes = [];
let commandesFiltrees = [];

// ================== OUTILS AUTH API ==================
function getAuthHeaders() {
  const token = localStorage.getItem("auth_token") || "";
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: "Bearer " + token } : {}),
  };
}

// Charger toutes les commandes au chargement de la page
document.addEventListener("DOMContentLoaded", function () {
  chargerCommandes();
  chargerEnfantsPourAjout();
  initEventListeners();
});

// Initialiser les event listeners
function initEventListeners() {
  // Déconnexion
  const btnDeconnexion = document.getElementById("btn-deconnexion");
  if (btnDeconnexion) {
    btnDeconnexion.addEventListener("click", function (e) {
      e.preventDefault();
      sessionStorage.clear();
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    });
  }

  // Boutons modal
  const btnOuvrirModal = document.getElementById("btn-ouvrir-modal-ajout");
  if (btnOuvrirModal) {
    btnOuvrirModal.addEventListener("click", ouvrirModalAjout);
  }

  const btnCloseModal = document.getElementById("btn-close-modal");
  if (btnCloseModal) {
    btnCloseModal.addEventListener("click", fermerModalAjout);
  }

  const btnAnnuler = document.getElementById("btn-annuler-modal");
  if (btnAnnuler) {
    btnAnnuler.addEventListener("click", fermerModalAjout);
  }

  // Filtres
  const btnAppliquerFiltres = document.getElementById("btn-appliquer-filtres");
  if (btnAppliquerFiltres) {
    btnAppliquerFiltres.addEventListener("click", appliquerFiltres);
  }

  const btnReinitialiser = document.getElementById(
    "btn-reinitialiser-filtres"
  );
  if (btnReinitialiser) {
    btnReinitialiser.addEventListener("click", reinitialiserFiltres);
  }

  // Form ajout
  const formAjout = document.getElementById("formAjoutRepas");
  if (formAjout) {
    formAjout.addEventListener("submit", ajouterRepas);
  }

  // Select enfant change (pour remplir la classe / parent)
  const selectEnfant = document.getElementById("ajoutEnfant");
  if (selectEnfant) {
    selectEnfant.addEventListener("change", chargerInfosEnfant);
  }

  // Export semaine suivante
  const btnExport = document.getElementById("btn-exporter-semaine");
  if (btnExport) {
    btnExport.addEventListener("click", exporterSemaineProchaine);
  }
}

// ================== CHARGEMENT COMMANDES ==================

// Charger toutes les commandes de repas depuis l'API admin
async function chargerCommandes() {
  try {
    const response = await fetch("/api/admin/repas", {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Erreur API /api/admin/repas : " + response.status);
    }

    const data = await response.json(); // déjà formaté par RepasController@indexAdmin

    toutesLesCommandes = data;
    // Trier par date
    toutesLesCommandes.sort((a, b) => new Date(a.date) - new Date(b.date));

    commandesFiltrees = [...toutesLesCommandes];
    afficherCommandes();
    remplirListeEnfants();
    calculerStatistiques();
  } catch (error) {
    console.error(error);
    alert("Erreur lors du chargement des repas.");
  }
}

// ================== AFFICHAGE ==================

function afficherCommandes() {
  const tbody = document.getElementById("commandesTableBody");
  if (!tbody) return;

  if (commandesFiltrees.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="no-data">Aucune commande de repas trouvée</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = commandesFiltrees
    .map((cmd) => {
      const dateFormatee = new Date(cmd.date).toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      return `
        <tr>
          <td>${dateFormatee}</td>
          <td>${cmd.enfantPrenom} ${cmd.enfantNom}</td>
          <td><span class="badge-classe">${cmd.classe}</span></td>
          <td>${cmd.parentEmail}</td>
          <td>
            <span class="badge-repas badge-repas-${cmd.typeRepas}">
              ${cmd.typeRepas === "vegetarien" ? "Végétarien" : "Normal"}
            </span>
          </td>
          <td>
            <button class="btn-danger btn-small" onclick="supprimerRepas(${
              cmd.id
            })">
              🗑️ Supprimer
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function calculerStatistiques() {
  const totalCommandes = commandesFiltrees.length;
  const totalNormal = commandesFiltrees.filter(
    (c) => c.typeRepas === "normal"
  ).length;
  const totalVege = commandesFiltrees.filter(
    (c) => c.typeRepas === "vegetarien"
  ).length;

  document.getElementById("totalCommandes").textContent = totalCommandes;
  document.getElementById("totalNormal").textContent = totalNormal;
  document.getElementById("totalVege").textContent = totalVege;
}

// ================== FILTRES ==================

function appliquerFiltres() {
  const dateDebut = document.getElementById("filterDateDebut").value;
  const dateFin = document.getElementById("filterDateFin").value;
  const classe = document.getElementById("filterClasse").value;
  const typeRepas = document.getElementById("filterTypeRepas").value;
  const enfant = document.getElementById("filterEnfant").value;

  commandesFiltrees = toutesLesCommandes.filter((cmd) => {
    let valide = true;

    if (dateDebut && cmd.date < dateDebut) valide = false;
    if (dateFin && cmd.date > dateFin) valide = false;
    if (classe && cmd.classe !== classe) valide = false;
    if (typeRepas && cmd.typeRepas !== typeRepas) valide = false;
    if (enfant && `${cmd.enfantPrenom} ${cmd.enfantNom}` !== enfant)
      valide = false;

    return valide;
  });

  afficherCommandes();
  calculerStatistiques();
}

function reinitialiserFiltres() {
  document.getElementById("filterDateDebut").value = "";
  document.getElementById("filterDateFin").value = "";
  document.getElementById("filterClasse").value = "";
  document.getElementById("filterTypeRepas").value = "";
  document.getElementById("filterEnfant").value = "";

  commandesFiltrees = [...toutesLesCommandes];
  afficherCommandes();
  calculerStatistiques();
}

function remplirListeEnfants() {
  const select = document.getElementById("filterEnfant");
  if (!select) return;

  const enfantsUniques = new Set();
  toutesLesCommandes.forEach((cmd) => {
    enfantsUniques.add(`${cmd.enfantPrenom} ${cmd.enfantNom}`);
  });

  const enfantsTriees = Array.from(enfantsUniques).sort();

  select.innerHTML = '<option value="">Tous les enfants</option>';
  enfantsTriees.forEach((nomComplet) => {
    const option = document.createElement("option");
    option.value = nomComplet;
    option.textContent = nomComplet;
    select.appendChild(option);
  });
}

// ================== SUPPRESSION ==================

async function supprimerRepas(id) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer ce repas ?")) return;

  try {
    const response = await fetch(`/api/admin/repas/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      alert("Erreur lors de la suppression du repas.");
      return;
    }

    await chargerCommandes();
    alert("Repas supprimé avec succès !");
  } catch (e) {
    console.error(e);
    alert("Erreur réseau lors de la suppression du repas.");
  }
}

// ================== MODAL AJOUT ==================

function ouvrirModalAjout() {
  document.getElementById("modalAjoutRepas").classList.add("show");
}

function fermerModalAjout() {
  document.getElementById("modalAjoutRepas").classList.remove("show");
  document.getElementById("formAjoutRepas").reset();
}

// ================== ENFANTS (API ADMIN) ==================

async function chargerEnfantsPourAjout() {
  const select = document.getElementById("ajoutEnfant");
  if (!select) return;

  select.innerHTML = '<option value="">-- Sélectionner un enfant --</option>';

  try {
    const response = await fetch("/api/admin/enfants", {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      console.error("Erreur API /api/admin/enfants", response.status);
      return;
    }

    const enfants = await response.json();

    enfants.forEach((enfant) => {
      const option = document.createElement("option");
      option.value = enfant.id_enfant;
      option.textContent = `${enfant.prenom} ${enfant.nom} (${
        enfant.classe || "Non assigné"
      })`;
      option.dataset.classe = enfant.classe || "";
      option.dataset.parent =
        enfant.parent1_nom_complet || "";
      option.dataset.parentEmail = enfant.parent1_email || "";
      select.appendChild(option);
    });
  } catch (e) {
    console.error("API enfants indisponible :", e);
  }
}

function chargerInfosEnfant() {
  const select = document.getElementById("ajoutEnfant");
  const selectedOption = select.options[select.selectedIndex];

  if (selectedOption && selectedOption.value) {
    document.getElementById("ajoutClasse").value =
      selectedOption.dataset.classe || "";
    // Dans ton HTML, tu n’affiches pas le parent dans la modale,
    // donc on ne met que la classe. Si tu ajoutes un input parent plus tard,
    // tu pourras utiliser selectedOption.dataset.parent ou parentEmail.
  } else {
    document.getElementById("ajoutClasse").value = "";
  }
}

// ================== AJOUT REPAS ==================

async function ajouterRepas(event) {
  event.preventDefault();

  const enfantId = parseInt(
    document.getElementById("ajoutEnfant").value,
    10
  );
  const date = document.getElementById("ajoutDate").value;
  const typeRepas = document.getElementById("ajoutTypeRepas").value;

  if (!enfantId || !date || !typeRepas) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  try {
    const response = await fetch("/api/admin/repas", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        id_enfant: enfantId,
        date_repas: date,
        type: typeRepas,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Erreur lors de l’ajout du repas.");
      return;
    }

    await chargerCommandes();
    fermerModalAjout();
    alert("Repas ajouté avec succès !");
  } catch (e) {
    console.error(e);
    alert("Erreur réseau lors de l’ajout du repas.");
  }
}

// ================== EXPORT SEMAINE PROCHAINE ==================

function exporterSemaineProchaine() {
  if (toutesLesCommandes.length === 0) {
    alert("Aucun repas à exporter.");
    return;
  }

  const today = new Date();
  const currentDay = today.getDay(); // 0=dimanche, 1=lundi, ...
  const daysUntilNextMonday = currentDay === 0 ? 1 : 8 - currentDay;

  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilNextMonday);
  nextMonday.setHours(0, 0, 0, 0);

  const endOfNextWeek = new Date(nextMonday);
  endOfNextWeek.setDate(nextMonday.getDate() + 6);
  endOfNextWeek.setHours(23, 59, 59, 999);

  const dateDebutStr = nextMonday.toISOString().split("T")[0];
  const dateFinStr = endOfNextWeek.toISOString().split("T")[0];

  const repasAExporter = toutesLesCommandes.filter((cmd) => {
    return cmd.date >= dateDebutStr && cmd.date <= dateFinStr;
  });

  if (repasAExporter.length === 0) {
    alert(
      `Aucun repas trouvé pour la semaine prochaine (${dateDebutStr} au ${dateFinStr}).`
    );
    return;
  }

  let csvContent = "Date;Enfant;Classe;Parent;Type Repas\n";

  repasAExporter.forEach((cmd) => {
    const dateObj = new Date(cmd.date);
    const dateFr = dateObj.toLocaleDateString("fr-FR");
    const type = cmd.typeRepas === "vegetarien" ? "Végétarien" : "Normal";
    const enfantNom = (cmd.enfantPrenom + " " + cmd.enfantNom).replace(
      /;/g,
      ","
    );
    const parent = (cmd.parentEmail || "").replace(/;/g, ",");

    const row = `${dateFr};${enfantNom};${cmd.classe};${parent};${type}`;
    csvContent += row + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `repas_semaine_${dateDebutStr}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
