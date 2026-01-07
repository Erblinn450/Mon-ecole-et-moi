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

// Token pour les appels API (optionnel si la route est publique, mais recommandé)
const token = localStorage.getItem("auth_token") || "1|PcANsd4FoG4AkpxwedAdZgTIBbjhJqSAKT0brunp63847bbb";

function initEventListeners() {
  const btnDeconnexion = document.getElementById("btn-deconnexion");
  if (btnDeconnexion) {
    btnDeconnexion.addEventListener("click", function (e) {
      e.preventDefault();
      sessionStorage.clear();
      window.location.href = "/login";
    });
  }
}

// Charger les comptes parents depuis l'API
async function loadComptesParents() {
  const tbody = document.getElementById("comptes-list");

  try {
    console.log("📋 Chargement des comptes parents via API...");

    const response = await fetch(`${API_URL}/parents`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const parents = await response.json();
    console.log("Parents récupérés :", parents.length);

    if (parents.length === 0) {
      tbody.innerHTML = `
          <tr>
            <td colspan="7" class="no-dossiers">
              Aucun compte parent actif trouvé.<br><br>
              💡 <strong>Note :</strong> Les comptes sont créés automatiquement lors de la validation des préinscriptions.
            </td>
          </tr>
        `;
      return;
    }

    tbody.innerHTML = "";

    // Pour chaque parent, et pour chaque enfant de ce parent, créer une ligne
    // Note: Le tableau affiche "Dossier #", "Parent", "Email", "Enfant", etc.
    // Si un parent a plusieurs enfants, on affichera plusieurs lignes pour le même parent.

    parents.forEach(parent => {
      // Si le parent n'a pas d'enfants associés visible dans la réponse, on affiche quand même une ligne générique ?
      // L'API retourne 'enfants' qui contient l'info.

      if (!parent.enfants || parent.enfants.length === 0) {
        // Cas rare: Parent sans enfant lié (ex: erreur synchro)
        renderRow(tbody, parent, null);
      } else {
        parent.enfants.forEach(enfant => {
          renderRow(tbody, parent, enfant);
        });
      }
    });

  } catch (error) {
    console.error("Erreur lors du chargement des comptes parents:", error);
    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="error-message" style="color: red; text-align: center;">
                Erreur lors du chargement des données. Veuillez réessayer plus tard.<br>
                (${error.message})
            </td>
        </tr>
      `;
  }
}

function renderRow(tbody, parent, enfant) {
  const row = document.createElement("tr");

  const nomParent = `${parent.prenom} ${parent.nom}`;
  const emailParent = parent.email;

  let nomEnfant = "Aucun enfant associé";
  let numDossier = parent.num_dossier ? `#${parent.num_dossier}` : "N/A";
  let linkId = parent.preinscription_id;

  if (enfant) {
    nomEnfant = `${enfant.prenom} ${enfant.nom}`;
    // Si l'enfant a un dossier spécifique, on l'utilise, sinon on garde celui du parent
    if (enfant.num_dossier) {
      numDossier = `#${enfant.num_dossier}`;
    }
    if (enfant.preinscription_id) {
      linkId = enfant.preinscription_id;
    }
  }

  const dateCreation = parent.created_at
    ? new Date(parent.created_at).toLocaleDateString("fr-FR")
    : "N/A";

  const statusBadge = `<span class="status-badge status-validated">✓ Actif</span>`;

  let actions = "";
  if (linkId) {
    actions = `
          <a href="/dossier-detail?id=${linkId}" class="btn-primary" style="padding: 6px 12px; font-size: 0.9em;">👁️ Voir dossier</a>
        `;
  } else {
    actions = `<span class="text-muted">Pas de dossier</span>`;
  }

  row.innerHTML = `
      <td><strong>${numDossier}</strong></td>
      <td>${nomParent}</td>
      <td>${emailParent}</td>
      <td>${nomEnfant}</td>
      <td>${dateCreation}</td>
      <td>${statusBadge}</td>
      <td>${actions}</td>
    `;

  tbody.appendChild(row);
}

// Charger au démarrage
initEventListeners();
loadComptesParents();
