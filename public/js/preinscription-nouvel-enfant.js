// Gestion de la préinscription d'un nouvel enfant pour un parent existant

// Vérifier si le parent est connecté
if (sessionStorage.getItem("parent_logged") !== "true") {
  alert("⚠️ Accès refusé ! Vous devez être connecté.");
  window.location.href = "/connexion";
}

const parentEmail = sessionStorage.getItem("parent_email");

// Charger les informations de la famille existante
function chargerInfosFamille() {
  const preinscriptions = JSON.parse(
    localStorage.getItem("preinscriptions") || "[]"
  );

  // Trouver une préinscription validée du parent pour récupérer les infos familiales
  const preinscriptionExistante = preinscriptions.find(
    (p) => p.responsable1_email === parentEmail && p.statut === "Validé"
  );

  if (preinscriptionExistante) {
    const resumeDiv = document.getElementById("info-famille-resume");
    resumeDiv.innerHTML = `
      <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px;">
        <p><strong>Responsable principal :</strong><br>
        ${preinscriptionExistante.responsable1_civilite || ""} ${
      preinscriptionExistante.responsable1_prenom || ""
    } ${preinscriptionExistante.responsable1_nom || ""}<br>
        Email : ${preinscriptionExistante.responsable1_email || ""}<br>
        Téléphone : ${preinscriptionExistante.responsable1_tel || ""}<br>
        Adresse : ${preinscriptionExistante.responsable1_adresse || ""}</p>

        ${
          preinscriptionExistante.responsable2_nom
            ? `<p><strong>Responsable secondaire :</strong><br>
        ${preinscriptionExistante.responsable2_civilite || ""} ${
                preinscriptionExistante.responsable2_prenom || ""
              } ${preinscriptionExistante.responsable2_nom || ""}<br>
        Email : ${preinscriptionExistante.responsable2_email || ""}<br>
        Téléphone : ${preinscriptionExistante.responsable2_tel || ""}</p>`
            : ""
        }

        <p><strong>Situation familiale :</strong> ${
          preinscriptionExistante.situation || ""
        }</p>
      </div>
    `;

    // Stocker les infos familiales pour les réutiliser lors de la soumission
    return preinscriptionExistante;
  } else {
    // Si aucune préinscription validée trouvée, on peut quand même continuer
    const resumeDiv = document.getElementById("info-famille-resume");
    resumeDiv.innerHTML = `
      <div class="alert alert-warning">
        ⚠️ Aucune information familiale trouvée. Vos informations de contact seront utilisées.
      </div>
    `;
    return null;
  }
}

// Charger les infos au démarrage
const infosFamilleExistante = chargerInfosFamille();

// Gestion de la soumission du formulaire
document
  .getElementById("form-preinscription-nouvel")
  .addEventListener("submit", (e) => {
    e.preventDefault();

    // Collecter les données du nouvel enfant
    const formData = {
      // Informations de l'enfant
      nom_enfant: document.getElementById("nom_enfant").value,
      prenom_enfant: document.getElementById("prenom_enfant").value,
      date_naissance: document.getElementById("date_naissance").value,
      lieu_naissance: document.getElementById("lieu_naissance").value,
      nationalite: document.getElementById("nationalite").value,
      allergies: document.getElementById("allergies").value,
      etablissement_precedent: document.getElementById(
        "etablissement_precedent"
      ).value,
      classe_actuelle: document.getElementById("classe_actuelle").value,
      classe: document.getElementById("classe").value,
      date_integration: document.getElementById("date_integration").value,
      pedagogie_montessori: document.getElementById("pedagogie_montessori")
        .value,
      difficultes: document.getElementById("difficultes").value,

      // Informations familiales reprises du compte existant
      responsable1_civilite: infosFamilleExistante
        ? infosFamilleExistante.responsable1_civilite
        : "",
      responsable1_nom: infosFamilleExistante
        ? infosFamilleExistante.responsable1_nom
        : "",
      responsable1_prenom: infosFamilleExistante
        ? infosFamilleExistante.responsable1_prenom
        : "",
      responsable1_lien: infosFamilleExistante
        ? infosFamilleExistante.responsable1_lien
        : "",
      responsable1_email: parentEmail,
      responsable1_tel: infosFamilleExistante
        ? infosFamilleExistante.responsable1_tel
        : "",
      responsable1_adresse: infosFamilleExistante
        ? infosFamilleExistante.responsable1_adresse
        : "",
      responsable1_profession: infosFamilleExistante
        ? infosFamilleExistante.responsable1_profession
        : "",

      responsable2_civilite: infosFamilleExistante
        ? infosFamilleExistante.responsable2_civilite
        : "",
      responsable2_nom: infosFamilleExistante
        ? infosFamilleExistante.responsable2_nom
        : "",
      responsable2_prenom: infosFamilleExistante
        ? infosFamilleExistante.responsable2_prenom
        : "",
      responsable2_lien: infosFamilleExistante
        ? infosFamilleExistante.responsable2_lien
        : "",
      responsable2_email: infosFamilleExistante
        ? infosFamilleExistante.responsable2_email
        : "",
      responsable2_tel: infosFamilleExistante
        ? infosFamilleExistante.responsable2_tel
        : "",
      responsable2_adresse: infosFamilleExistante
        ? infosFamilleExistante.responsable2_adresse
        : "",
      responsable2_profession: infosFamilleExistante
        ? infosFamilleExistante.responsable2_profession
        : "",

      situation: infosFamilleExistante ? infosFamilleExistante.situation : "",
      situation_autre: infosFamilleExistante
        ? infosFamilleExistante.situation_autre
        : "",
      decouverte: infosFamilleExistante
        ? infosFamilleExistante.decouverte
        : "Famille déjà inscrite",

      // Métadonnées
      date_demande: new Date().toISOString(),
      statut: "En attente",
      compte_cree: false,
      id: Date.now(),
    };

    // Récupérer les préinscriptions existantes
    const preinscriptions = JSON.parse(
      localStorage.getItem("preinscriptions") || "[]"
    );

    // Ajouter la nouvelle préinscription
    preinscriptions.push(formData);
    localStorage.setItem("preinscriptions", JSON.stringify(preinscriptions));

    // Afficher le modal de confirmation
    const modal = document.getElementById("modal-confirmation");
    modal.classList.remove("hidden");

    // Bouton fermer modal
    document
      .getElementById("btn-fermer-modal")
      .addEventListener("click", () => {
        window.location.href = "/dashboard-parent";
      });
  });
