// Gestion de la création de comptes pour tous les responsables

// Récupérer l'ID du dossier depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const dossierId = urlParams.get("id");

let dossierData = null;

if (dossierId) {
  loadDossierData(dossierId);
}

function loadDossierData(id) {
  const preinscriptions = JSON.parse(
    localStorage.getItem("preinscriptions") || "[]"
  );

  const index = parseInt(id);
  dossierData = preinscriptions[index];

  if (dossierData) {
    // Afficher les infos du dossier
    document.getElementById("num-dossier").textContent =
      dossierData.num_dossier;
    document.getElementById(
      "nom-enfant"
    ).textContent = `${dossierData.prenom_enfant} ${dossierData.nom_enfant}`;
    document.getElementById("nb-responsables").textContent =
      dossierData.responsables.length;

    // Créer un formulaire pour chaque responsable
    const container = document.getElementById("responsables-container");
    container.innerHTML = "";

    dossierData.responsables.forEach((responsable, index) => {
      const parentDiv = document.createElement("div");
      parentDiv.className = "responsable-entry";
      parentDiv.innerHTML = `
        <h3>👤 Responsable ${index + 1}</h3>
        <div style="display: grid; gap: 15px;">
          <div>
            <label><strong>Nom :</strong></label>
            <p>${responsable.prenom} ${responsable.nom}</p>
          </div>
          <div>
            <label><strong>Email :</strong></label>
            <input
              type="email"
              id="email-${index}"
              value="${responsable.email}"
              readonly
              class="bg-light-gray"
              style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px;"
            />
          </div>
          <div>
            <label for="password-${index}"><strong>Mot de passe temporaire *</strong></label>
            <input
              type="text"
              id="password-${index}"
              placeholder="Minimum 8 caractères"
              required
              style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px;"
            />
            <small class="text-muted d-block mt-10">
              Ce mot de passe sera envoyé par email à ${responsable.prenom}
            </small>
          </div>
        </div>
      `;
      container.appendChild(parentDiv);
    });
  }
}

// Gérer la création de tous les comptes
document
  .getElementById("btn-creer-comptes")
  .addEventListener("click", function () {
    if (!dossierData) {
      alert("Erreur : Dossier non trouvé");
      return;
    }

    // Valider tous les mots de passe
    const comptes = [];
    let erreur = false;

    dossierData.responsables.forEach((responsable, index) => {
      const password = document.getElementById(`password-${index}`).value;

      if (!password || password.length < 8) {
        alert(
          `Le mot de passe pour ${responsable.prenom} ${responsable.nom} doit contenir au moins 8 caractères.`
        );
        erreur = true;
        return;
      }

      comptes.push({
        email: responsable.email,
        nom: responsable.nom,
        prenom: responsable.prenom,
        password: password,
      });
    });

    if (erreur) return;

    // Confirmer la création
    const message =
      `Créer ${comptes.length} compte(s) parent et envoyer les identifiants par email ?\n\n` +
      comptes.map((c) => `- ${c.prenom} ${c.nom} (${c.email})`).join("\n");

    if (confirm(message)) {
      // Sauvegarder les comptes créés dans localStorage
      const comptesParents = JSON.parse(
        localStorage.getItem("comptes_parents") || "[]"
      );

      comptes.forEach((compte) => {
        comptesParents.push({
          ...compte,
          dossierId: dossierId,
          date_creation: new Date().toISOString(),
        });
      });

      localStorage.setItem("comptes_parents", JSON.stringify(comptesParents));

      // Marquer le dossier comme ayant un compte créé
      const preinscriptions = JSON.parse(
        localStorage.getItem("preinscriptions") || "[]"
      );

      const index = parseInt(dossierId);
      if (preinscriptions[index]) {
        preinscriptions[index].compte_cree = true;
        preinscriptions[index].date_creation_compte = new Date().toISOString();
        preinscriptions[index].nb_comptes_crees = comptes.length;
        localStorage.setItem(
          "preinscriptions",
          JSON.stringify(preinscriptions)
        );
      }

      alert(
        `✅ ${comptes.length} compte(s) créé(s) avec succès !\n\nLes emails ont été envoyés aux parents.`
      );
      window.location.href = "/admin";
    }
  });
