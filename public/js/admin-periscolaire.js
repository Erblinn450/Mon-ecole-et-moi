// admin-periscolaire.js - Gestion du périscolaire pour l'admin (BDD + enfants via EnfantController)

let toutesLesInscriptions = [];
let inscriptionsFiltrees = [];

const classesMaternelle = ["PS", "MS", "GS"];
const classesPrimaire = ["CP", "CE1", "CE2", "CM1", "CM2"];
const classesCollege = ["6ème", "5ème", "4ème", "3ème"];

// ================== OUTILS AUTH API ==================
function getAuthHeaders() {
  const token = localStorage.getItem("auth_token") || "";
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: "Bearer " + token } : {}),
  };
}

// ================== INIT ==================

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM chargé (admin-periscolaire)");

  chargerInscriptionsDepuisApi().then(() => {
    calculerStatistiques();
    remplirListeEnfants();
  });

  chargerEnfantsPourAjout(); // utilise /api/eleves (EnfantController@index)
  initEventListeners();
});

// ================== EVENT LISTENERS ==================

function initEventListeners() {
  const btnDeconnexion = document.getElementById("btn-deconnexion");
  if (btnDeconnexion) {
    btnDeconnexion.addEventListener("click", function (e) {
      e.preventDefault();
      sessionStorage.clear();
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    });
  }

  const btnOuvrirModal = document.getElementById("btn-ouvrir-modal-ajout");
  if (btnOuvrirModal)
    btnOuvrirModal.addEventListener("click", ouvrirModalAjout);

  const btnCloseModal = document.getElementById("btn-close-modal");
  if (btnCloseModal) btnCloseModal.addEventListener("click", fermerModalAjout);

  const btnAnnuler = document.getElementById("btn-annuler-modal");
  if (btnAnnuler) btnAnnuler.addEventListener("click", fermerModalAjout);

  const btnExporter = document.getElementById("btn-exporter-tout");
  if (btnExporter)
    btnExporter.addEventListener("click", exporterToutPeriscolaire);

  const btnAppliquerFiltres = document.getElementById("btn-appliquer-filtres");
  if (btnAppliquerFiltres)
    btnAppliquerFiltres.addEventListener("click", appliquerFiltres);

  const btnReinitialiser = document.getElementById("btn-reinitialiser-filtres");
  if (btnReinitialiser)
    btnReinitialiser.addEventListener("click", reinitialiserFiltres);

  const formAjout = document.getElementById("formAjoutPeriscolaire");
  if (formAjout) formAjout.addEventListener("submit", ajouterPeriscolaire);

  const selectEnfant = document.getElementById("ajoutEnfant");
  if (selectEnfant) selectEnfant.addEventListener("change", chargerInfosEnfant);
}

// ================== CHARGEMENT INSCRIPTIONS (API) ==================

async function chargerInscriptionsDepuisApi() {
  try {
    const response = await fetch("/api/periscolaire", {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      console.error("Erreur API /api/periscolaire", response.status);
      toutesLesInscriptions = [];
      inscriptionsFiltrees = [];
      afficherInscriptions();
      return;
    }

    const data = await response.json();
    // data attendu : [{ id, date, enfantPrenom, enfantNom, classe, parentEmail }]

    toutesLesInscriptions = data.map((ins) => ({
      id: ins.id,
      date: ins.date,
      enfantNom: ins.enfantNom,
      enfantPrenom: ins.enfantPrenom,
      classe: ins.classe,
      parentEmail: ins.parentEmail,
    }));

    toutesLesInscriptions.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    inscriptionsFiltrees = [...toutesLesInscriptions];
    afficherInscriptions();
  } catch (e) {
    console.error("Erreur chargement périscolaire:", e);
    toutesLesInscriptions = [];
    inscriptionsFiltrees = [];
    afficherInscriptions();
  }
}

// ================== AFFICHAGE TABLEAU ==================

function afficherInscriptions() {
  const tbody = document.getElementById("periscolaireTableBody");

  if (!tbody) return;

  if (inscriptionsFiltrees.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="no-data">Aucune inscription périscolaire trouvée</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = inscriptionsFiltrees
    .map((ins) => {
      const dateFormatee = new Date(ins.date).toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      return `
      <tr>
        <td>${dateFormatee}</td>
        <td>${ins.enfantPrenom} ${ins.enfantNom}</td>
        <td><span class="badge-classe">${ins.classe}</span></td>
        <td>${ins.parentEmail}</td>
        <td>
          <button class="btn-danger btn-small" onclick="supprimerPeriscolaireApi(${ins.id})">
            🗑️ Supprimer
          </button>
        </td>
      </tr>
    `;
    })
    .join("");
}

// ================== STATISTIQUES ==================

function calculerStatistiques() {
  const total = inscriptionsFiltrees.length;

  const totalMaternelle = inscriptionsFiltrees.filter((ins) =>
    classesMaternelle.includes(ins.classe)
  ).length;

  const totalPrimaire = inscriptionsFiltrees.filter((ins) =>
    classesPrimaire.includes(ins.classe)
  ).length;

  const totalCollege = inscriptionsFiltrees.filter((ins) =>
    classesCollege.includes(ins.classe)
  ).length;

  document.getElementById("totalPeriscolaire").textContent = total;
  document.getElementById("totalMaternelle").textContent = totalMaternelle;
  document.getElementById("totalPrimaire").textContent = totalPrimaire;
  document.getElementById("totalCollege").textContent = totalCollege;
}

// ================== FILTRES ==================

function appliquerFiltres() {
  const dateDebut = document.getElementById("filterDateDebut").value;
  const dateFin = document.getElementById("filterDateFin").value;
  const classe = document.getElementById("filterClasse").value;
  const enfant = document.getElementById("filterEnfant").value;

  inscriptionsFiltrees = toutesLesInscriptions.filter((ins) => {
    let valide = true;

    if (dateDebut && ins.date < dateDebut) valide = false;
    if (dateFin && ins.date > dateFin) valide = false;
    if (classe && ins.classe !== classe) valide = false;
    if (enfant && `${ins.enfantPrenom} ${ins.enfantNom}` !== enfant)
      valide = false;

    return valide;
  });

  afficherInscriptions();
  calculerStatistiques();
}

function reinitialiserFiltres() {
  document.getElementById("filterDateDebut").value = "";
  document.getElementById("filterDateFin").value = "";
  document.getElementById("filterClasse").value = "";
  document.getElementById("filterEnfant").value = "";

  inscriptionsFiltrees = [...toutesLesInscriptions];
  afficherInscriptions();
  calculerStatistiques();
}

// ================== SUPPRESSION (API) ==================

async function supprimerPeriscolaireApi(id) {
  if (
    !confirm(
      "Êtes-vous sûr de vouloir supprimer cette inscription périscolaire ?"
    )
  )
    return;

  try {
    const response = await fetch(`/api/periscolaire/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      alert("Erreur lors de la suppression (API).");
      return;
    }

    await chargerInscriptionsDepuisApi();
    calculerStatistiques();
    alert("Inscription périscolaire supprimée avec succès !");
  } catch (e) {
    console.error("Erreur suppression périscolaire:", e);
    alert("Erreur réseau lors de la suppression du périscolaire.");
  }
}

// ================== MODAL AJOUT ==================

function ouvrirModalAjout() {
  document.getElementById("modalAjoutPeriscolaire").classList.add("show");
}

function fermerModalAjout() {
  document.getElementById("modalAjoutPeriscolaire").classList.remove("show");
  document.getElementById("formAjoutPeriscolaire").reset();
}

// ================== ENFANTS (via EnfantController@index) ==================

async function chargerEnfantsPourAjout() {
  console.log("chargerEnfantsPourAjout appelé");
  const select = document.getElementById("ajoutEnfant");
  if (!select) {
    console.error("Pas de select #ajoutEnfant trouvé");
    return;
  }

  select.innerHTML = '<option value="">-- Sélectionner un enfant --</option>';

  try {
    const response = await fetch("/api/eleves", {
      method: "GET",
      headers: getAuthHeaders(),
    });

    console.log("Status /api/eleves =", response.status);

    if (!response.ok) {
      console.error("Erreur API /api/eleves", response.status);
      return;
    }

    const enfants = await response.json();
    console.log("Enfants reçus :", enfants.length);

    enfants.forEach((enfant) => {
      const option = document.createElement("option");
      option.value = enfant.id_enfant; // PK définie dans Enfant.php
      option.textContent = `${enfant.prenom} ${enfant.nom} (${
        enfant.classe || "Non assigné"
      })`;

      // Classe
      option.dataset.classe = enfant.classe || "";

      // Parent : d'abord champ à plat, sinon objet parent1
      const nomCompletParent =
        enfant.parent1_nom_complet ||
        (enfant.parent1
          ? `${enfant.parent1.prenom || ""} ${
              enfant.parent1.nom || ""
            }`.trim()
          : "") ||
        "";

      option.dataset.parent = nomCompletParent;
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
    document.getElementById("ajoutParent").value =
      selectedOption.dataset.parent || "";
  } else {
    document.getElementById("ajoutClasse").value = "";
    document.getElementById("ajoutParent").value = "";
  }
}

// ================== AJOUT PÉRISCOLAIRE (API) ==================

async function ajouterPeriscolaire(event) {
  event.preventDefault();

  const select = document.getElementById("ajoutEnfant");
  const selectedOption = select.options[select.selectedIndex];

  if (!selectedOption.value) {
    alert("Veuillez sélectionner un enfant");
    return;
  }

  const enfantId = parseInt(selectedOption.value, 10);
  const date = document.getElementById("ajoutDate").value;

  if (!date) {
    alert("Veuillez choisir une date");
    return;
  }

  try {
    const response = await fetch("/api/periscolaire", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        id_enfant: enfantId,
        date_periscolaire: date,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      await chargerInscriptionsDepuisApi();
      calculerStatistiques();
      fermerModalAjout();
      alert("Inscription périscolaire ajoutée avec succès !");
      return;
    } else {
      console.warn("Erreur API ajout périscolaire :", data);
      alert(data.message || "Erreur lors de l'ajout du périscolaire.");
    }
  } catch (e) {
    console.error("Erreur ajout périscolaire:", e);
    alert("Impossible de contacter le serveur pour ajouter le périscolaire.");
  }
}

// ================== LISTE ENFANTS (FILTRE) ==================

function remplirListeEnfants() {
  const select = document.getElementById("filterEnfant");
  if (!select) return;

  const enfantsUniques = new Set();

  toutesLesInscriptions.forEach((ins) => {
    enfantsUniques.add(`${ins.enfantPrenom} ${ins.enfantNom}`);
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

// ================== EXPORT TOUT (CSV) ==================

function exporterToutPeriscolaire() {
  if (toutesLesInscriptions.length === 0) {
    alert("Aucune inscription à exporter.");
    return;
  }

  let csvContent = "Date;Enfant;Classe;Parent\n";

  toutesLesInscriptions.forEach((ins) => {
    const dateObj = new Date(ins.date);
    const dateFr = dateObj.toLocaleDateString("fr-FR");
    const enfantNom = (ins.enfantPrenom + " " + ins.enfantNom).replace(
      /;/g,
      ","
    );
    const parent = (ins.parentEmail || "").replace(/;/g, ",");

    const row = `${dateFr};${enfantNom};${ins.classe};${parent}`;
    csvContent += row + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `periscolaire_complet.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
