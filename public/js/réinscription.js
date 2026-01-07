// Gestion du formulaire de réinscription

const enfantsContainer = document.getElementById("enfants-container");
const addEnfantBtn = document.getElementById("ajouter-enfant");

let enfantCount = 0;
let enfantsInscrits = [];

// Charger les enfants inscrits au chargement de la page
document.addEventListener("DOMContentLoaded", function () {
  chargerEnfantsInscrits();
});

// Charger les enfants inscrits du parent connecté
function chargerEnfantsInscrits() {
  const parentEmail = sessionStorage.getItem("parent_email");
  if (!parentEmail) {
    alert("Erreur : impossible de récupérer vos informations.");
    window.location.href = "connexion.blade.php";
    return;
  }

  // Récupérer toutes les préinscriptions validées
  const preinscriptions = JSON.parse(
    localStorage.getItem("preinscriptions") || "[]"
  );

  // Filtrer les enfants de ce parent avec statut "Validé"
  enfantsInscrits = preinscriptions.filter(
    (p) => p.responsable1_email === parentEmail && p.statut === "Validé"
  );

  console.log("Enfants inscrits trouvés:", enfantsInscrits);

  // Ajouter le premier enfant au chargement APRÈS avoir chargé les données
  enfantCount++;
  enfantsContainer.appendChild(createEnfantBlock(enfantCount));
}

// Options des années scolaires
const anneesOptions = `
    <optgroup label="🎨 Maternelle">
        <option value="PS">Petite Section</option>
        <option value="MS">Moyenne Section</option>
        <option value="GS">Grande Section</option>
    </optgroup>
    <optgroup label="📖 Primaire">
        <option value="CP">CP</option>
        <option value="CE1">CE1</option>
        <option value="CE2">CE2</option>
        <option value="CM1">CM1</option>
        <option value="CM2">CM2</option>
    </optgroup>
    <optgroup label="📚 Collège">
        <option value="6ème">6ème</option>
        <option value="5ème">5ème</option>
        <option value="4ème">4ème</option>
        <option value="3ème">3ème</option>
    </optgroup>
`;

// Fonction pour créer un bloc enfant
function createEnfantBlock(index) {
  const div = document.createElement("div");
  div.classList.add("enfant-entry");

  // Créer la liste déroulante des enfants inscrits
  let enfantsSelectOptions =
    '<option value="">-- Sélectionner un enfant déjà inscrit --</option>';
  enfantsInscrits.forEach((enfant) => {
    enfantsSelectOptions += `<option value="${enfant.id}" data-nom="${enfant.nom_enfant}" data-prenom="${enfant.prenom_enfant}" data-classe="${enfant.classe}">${enfant.prenom_enfant} ${enfant.nom_enfant} (${enfant.classe})</option>`;
  });

  div.innerHTML = `
        <h3>Enfant ${index}</h3>

        <label for="enfant_select_${index}">Sélectionner un enfant inscrit *</label>
        <select id="enfant_select_${index}" name="enfant_select[]" required onchange="remplirInfosEnfant(${index})">
            ${enfantsSelectOptions}
        </select>

        <label for="nom_enfant_${index}">Nom de l'enfant *</label>
        <input type="text" id="nom_enfant_${index}" name="nom_enfant[]" required readonly />

        <label for="prenom_enfant_${index}">Prénom de l'enfant *</label>
        <input type="text" id="prenom_enfant_${index}" name="prenom_enfant[]" required readonly />

        <label for="annee_actuelle_${index}">Année scolaire actuelle *</label>
        <select id="annee_actuelle_${index}" name="annee_actuelle[]" required disabled>
            <option value="">-- Sélectionnez --</option>
            ${anneesOptions}
        </select>

        <label for="annee_prochaine_${index}">Année scolaire souhaitée (prochaine année) *</label>
        <select id="annee_prochaine_${index}" name="annee_prochaine[]" required>
            <option value="">-- Sélectionnez --</option>
            ${anneesOptions}
        </select>

        ${
          index > 1
            ? '<button type="button" class="remove-enfant">Supprimer cet enfant</button>'
            : ""
        }
    `;

  if (index > 1) {
    div.querySelector(".remove-enfant").addEventListener("click", () => {
      div.remove();
    });
  }

  return div;
}

// Remplir les informations de l'enfant sélectionné
function remplirInfosEnfant(index) {
  const select = document.getElementById(`enfant_select_${index}`);
  const selectedOption = select.options[select.selectedIndex];

  if (selectedOption.value) {
    document.getElementById(`nom_enfant_${index}`).value =
      selectedOption.dataset.nom || "";
    document.getElementById(`prenom_enfant_${index}`).value =
      selectedOption.dataset.prenom || "";

    const classeActuelle = selectedOption.dataset.classe || "";
    const selectAnnee = document.getElementById(`annee_actuelle_${index}`);
    selectAnnee.value = classeActuelle;
    selectAnnee.disabled = true;
  } else {
    document.getElementById(`nom_enfant_${index}`).value = "";
    document.getElementById(`prenom_enfant_${index}`).value = "";
    document.getElementById(`annee_actuelle_${index}`).value = "";
  }
}

// Ajouter un enfant au clic
addEnfantBtn.addEventListener("click", () => {
  enfantCount++;
  enfantsContainer.appendChild(createEnfantBlock(enfantCount));
});

// Validation du formulaire
document
  .getElementById("form-reinscription")
  .addEventListener("submit", (e) => {
    e.preventDefault();

    showMessage(
      "Votre demande de réinscription a été envoyée avec succès !",
      "success"
    );

    setTimeout(() => {
      window.location.href = "/dashboard-parent";
    }, 2000);
  });
