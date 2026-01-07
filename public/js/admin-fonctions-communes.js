// ===================================
// FONCTIONS COMMUNES ADMINISTRATION
// Fonctions partagées entre admin-repas.js et admin-periscolaire.js
// ===================================

/**
 * Charger la liste des enfants pour l'ajout d'une commande/inscription
 * (UTILISÉ uniquement par les anciennes pages qui stockent en localStorage)
 */
function chargerEnfantsPourAjoutLocal() {
  const enfants = JSON.parse(localStorage.getItem("enfants") || "[]");
  const selectEnfant = document.getElementById("ajouterEnfant");

  if (!selectEnfant) return;

  selectEnfant.innerHTML = '<option value="">Sélectionner un enfant</option>';

  enfants.forEach((enfant) => {
    const option = document.createElement("option");
    option.value = enfant.id;
    option.textContent = `${enfant.prenom} ${enfant.nom}`;
    selectEnfant.appendChild(option);
  });
}

/**
 * Charger les informations d'un enfant sélectionné
 * (version localStorage, pour compatibilité)
 */
function chargerInfosEnfant() {
  const selectEnfant = document.getElementById("ajouterEnfant");
  const enfantId = selectEnfant?.value;

  if (!enfantId) {
    const nomInput = document.getElementById("ajouterNom");
    const prenomInput = document.getElementById("ajouterPrenom");
    const classeInput = document.getElementById("ajouterClasse");

    if (nomInput) nomInput.value = "";
    if (prenomInput) prenomInput.value = "";
    if (classeInput) classeInput.value = "";
    return;
  }

  const enfants = JSON.parse(localStorage.getItem("enfants") || "[]");
  const enfant = enfants.find((e) => e.id === enfantId);

  if (enfant) {
    const nomInput = document.getElementById("ajouterNom");
    const prenomInput = document.getElementById("ajouterPrenom");
    const classeInput = document.getElementById("ajouterClasse");

    if (nomInput) nomInput.value = enfant.nom;
    if (prenomInput) prenomInput.value = enfant.prenom;
    if (classeInput) classeInput.value = enfant.classe;
  }
}

/**
 * Formater une date pour l'affichage (format français)
 */
function formaterDateAffichage(dateStr) {
  if (!dateStr) return "";

  const date = new Date(dateStr + "T00:00:00");
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("fr-FR", options);
}

/**
 * Formater une date pour les inputs (format ISO)
 */
function formaterDateInput(date) {
  if (!date) return "";

  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  const jour = String(date.getDate()).padStart(2, "0");

  return `${annee}-${mois}-${jour}`;
}

/**
 * Obtenir les informations d'un parent par son ID (localStorage)
 */
function getParentById(parentId) {
  const parents = JSON.parse(localStorage.getItem("parents") || "[]");
  return parents.find((p) => p.id === parentId) || null;
}

/**
 * Obtenir les informations d'un enfant par son ID (localStorage)
 */
function getEnfantById(enfantId) {
  const enfants = JSON.parse(localStorage.getItem("enfants") || "[]");
  return enfants.find((e) => e.id === enfantId) || null;
}

/**
 * Générer un ID unique
 */
function genererIdUnique() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

/**
 * Afficher un message de succès
 */
function afficherSucces(message) {
  let notification = document.getElementById("notification-success");

  if (!notification) {
    notification = document.createElement("div");
    notification.id = "notification-success";
    notification.className = "notification notification-success";
    document.body.appendChild(notification);
  }

  notification.textContent = message;
  notification.classList.remove("hidden");

  setTimeout(() => {
    notification.classList.add("hidden");
  }, 3000);
}

/**
 * Afficher un message d'erreur
 */
function afficherErreur(message) {
  let notification = document.getElementById("notification-error");

  if (!notification) {
    notification = document.createElement("div");
    notification.id = "notification-error";
    notification.className = "notification notification-error";
    document.body.appendChild(notification);
  }

  notification.textContent = message;
  notification.classList.remove("hidden");

  setTimeout(() => {
    notification.classList.add("hidden");
  }, 3000);
}
