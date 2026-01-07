// mes-enfants.js - Gestion des enfants inscrits pour les parents

let enfantSelectionne = null;

// Charger les enfants au chargement de la page
document.addEventListener("DOMContentLoaded", function () {
  chargerEnfantsInscrits();
});

// Charger les enfants inscrits du parent connecté via l'API
async function chargerEnfantsInscrits() {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    alert("Erreur : vous n'êtes pas connecté.");
    window.location.href = "/connexion";
    return;
  }

  const container = document.getElementById("enfantsContainer");
  const noEnfants = document.getElementById("noEnfants");

  try {
    const response = await fetch('/api/parents/enfants', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des enfants');
    }

    const enfants = await response.json();

    if (enfants.length === 0) {
      container.classList.add("hidden");
      noEnfants.classList.remove("hidden");
      return;
    }

    container.classList.remove("hidden");
    noEnfants.classList.add("hidden");
    container.innerHTML = "";

    // Charger les demandes de désinscription existantes (Local Storage pour l'instant car pas de backend pour ça encore ?)
    // TODO: Migrer les demandes de désinscription vers une API aussi quand MON-153 sera prêt
    const demandesDesinscription = JSON.parse(
      localStorage.getItem("demandes_desinscription") || "[]"
    );

    enfants.forEach((enfant) => {
      // Logique d'affichage
      // Note: l'objet enfant retourne de l'API peut avoir des clés différentes de l'objet localStorage. 
      // Laravel renvoie snake_case par défaut.

      // Vérifier si une demande de désinscription est en cours (Basé sur ID enfant)
      const demandeEnCours = demandesDesinscription.find(
        (d) => d.enfantId === enfant.id_enfant && d.statut === "En attente" // Adaptation: dossierId -> enfantId
      );

      // TODO: Vérifier date d'intégration si dispo dans DB, sinon utiliser created_at
      const dateInscription = new Date(enfant.created_at || new Date()); // Fallback date
      const aCommence = false; // Logique temporairement désactivée si date_integration pas dispo

      const card = document.createElement("div");
      card.className = "enfant-card glass-card"; // Ajout glass-card pour un petit style si dispo
      card.innerHTML = `
          <div class="enfant-header">
            <div class="enfant-icon">🧒</div>
            <div class="enfant-info">
              <h3>${enfant.prenom} ${enfant.nom}</h3>
              <span class="badge-classe">${enfant.classe}</span>
            </div>
          </div>
          <div class="enfant-details">
            <p><strong>Date de naissance :</strong> ${new Date(enfant.date_naissance).toLocaleDateString("fr-FR")}</p>
            <p><strong>Inscrit le :</strong> ${dateInscription.toLocaleDateString("fr-FR")}</p>
            ${demandeEnCours
          ? `
            <div class="alert alert-warning" style="margin-top: 1em;">
              ⏳ <strong>Demande de désinscription en cours</strong><br>
              <small>Motif : ${demandeEnCours.motif}</small>
            </div>
            `
          : `
            <button class="btn-danger btn-small" style="margin-top: 1em;" onclick="demanderDesinscription(${enfant.id_enfant}, '${configurerNom(enfant)}')">
              ❌ Demander une désinscription
            </button>
            `
        }
          </div>
        `;
      container.appendChild(card);
    });

  } catch (error) {
    console.error(error);
    container.innerHTML = `<p class="error">Impossible de charger les données: ${error.message}</p>`;
  }
}

function configurerNom(enfant) {
  // Helper pour échapper les quotes dans onclick
  return (enfant.prenom + ' ' + enfant.nom).replace(/'/g, "\\'");
}

// Demander une désinscription
function demanderDesinscription(enfantId, nomComplet) {
  // Stocker l'ID de l'enfant sélectionné globalement
  enfantSelectionne = { id: enfantId, nomComplet: nomComplet };

  // Afficher le modal de confirmation
  document.getElementById("confirmationText").textContent =
    `Vous êtes sur le point de demander la désinscription de ${nomComplet}.`;
  document.getElementById("modalDesinscription").classList.add("show");
}

// Fermer le modal
function fermerModalDesinscription() {
  document.getElementById("modalDesinscription").classList.remove("show");
  document.getElementById("formDesinscription").reset();
  enfantSelectionne = null;
}

// Soumettre la demande de désinscription (Reste en LocalStorage pour l'instant comme placeholder)
document
  .getElementById("formDesinscription")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    if (!enfantSelectionne) {
      alert("Erreur : aucun enfant sélectionné.");
      return;
    }

    const motif = document.getElementById("motifDesinscription").value.trim();

    if (!motif) {
      alert("Veuillez indiquer le motif de votre demande.");
      return;
    }

    // Créer la demande de désinscription
    const demandesDesinscription = JSON.parse(
      localStorage.getItem("demandes_desinscription") || "[]"
    );

    const nouvelleDemande = {
      id: Date.now(),
      enfantId: enfantSelectionne.id,
      motif: motif,
      statut: "En attente",
      dateDemande: new Date().toISOString(),
    };

    demandesDesinscription.push(nouvelleDemande);
    localStorage.setItem(
      "demandes_desinscription",
      JSON.stringify(demandesDesinscription)
    );

    alert(
      `✅ Votre demande de désinscription pour ${enfantSelectionne.nomComplet} a été envoyée.`
    );

    fermerModalDesinscription();
    chargerEnfantsInscrits();
  });
