// admin-rapports-repas.js - Génération de rapports pour l'admin

const classes = {
    maternelle: ["PS", "MS", "GS"],
    primaire: ["CP", "CE1", "CE2", "CM1", "CM2"],
    college: ["6ème", "5ème", "4ème", "3ème"],
};

let rapportData = {
    totalRepas: 0,
    totalNormaux: 0,
    totalVegetariens: 0,
    totalPeriscolaire: 0,
    parClasse: {},
    parJour: {},
};

// Fonction pour afficher les messages
function showMessage(message, type = "info") {
    const alertClass = `alert-${type}`;
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert ${alertClass}`;
    alertDiv.textContent = message;

    const main = document.querySelector(".main");
    if (main) {
        main.insertBefore(alertDiv, main.firstChild);
    } else {
        document.body.insertBefore(alertDiv, document.body.firstChild);
    }

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function initEventListeners() {
    const btnDeconnexion = document.getElementById("btn-deconnexion");
    if (btnDeconnexion) {
        btnDeconnexion.addEventListener("click", function (e) {
            e.preventDefault();
            sessionStorage.clear();
            window.location.href = "/login";
        });
    }

    const btnImprimer = document.getElementById("btn-imprimer-rapport");
    if (btnImprimer) {
        btnImprimer.addEventListener("click", imprimerRapport);
    }
}

// Charger les données au chargement de la page
document.addEventListener("DOMContentLoaded", function () {
    initEventListeners();
    genererRapportSemaineProchaine();
});

// Générer le rapport pour la semaine prochaine
async function genererRapportSemaineProchaine() {
    // Calculer les dates de la semaine prochaine (lundi à vendredi)
    const aujourdhui = new Date();

    // Si on est vendredi (5), samedi (6) ou dimanche (0), on prend le lundi suivant
    // Sinon on prend le lundi de la semaine prochaine
    let joursJusquaLundi;
    const jourActuel = aujourdhui.getDay();

    if (jourActuel === 0) {
        // Dimanche
        joursJusquaLundi = 1;
    } else if (jourActuel === 6) {
        // Samedi
        joursJusquaLundi = 2;
    } else if (jourActuel === 5) {
        // Vendredi
        joursJusquaLundi = 3;
    } else {
        // Lundi à jeudi
        joursJusquaLundi = 8 - jourActuel;
    }

    const lundiProchain = new Date(aujourdhui);
    lundiProchain.setDate(aujourdhui.getDate() + joursJusquaLundi);
    lundiProchain.setHours(0, 0, 0, 0); // Mettre à minuit

    const vendrediProchain = new Date(lundiProchain);
    vendrediProchain.setDate(lundiProchain.getDate() + 4);
    vendrediProchain.setHours(23, 59, 59, 999); // Mettre à 23h59

    // Afficher les dates
    const semaineDatesEl = document.getElementById("semaineDates");
    if (semaineDatesEl) {
        semaineDatesEl.textContent = `Semaine du ${lundiProchain.toLocaleDateString(
            "fr-FR"
        )} au ${vendrediProchain.toLocaleDateString("fr-FR")}`;
    }

    // Charger les commandes depuis l'API
    let commandes = [];
    try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            showMessage("Vous devez être connecté", "error");
            return;
        }

        const response = await fetch("/api/admin/repas", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Erreur lors du chargement des repas");
        }

        const repas = await response.json();

        // Transformer les données de l'API pour correspondre au format attendu
        commandes = repas.map((r) => ({
            date: r.date_repas,
            enfantNom: r.enfant.nom,
            enfantPrenom: r.enfant.prenom,
            classe: r.enfant.classe,
            parentEmail: r.parent_email,
            typeRepas: r.type,
            dateCommande: r.created_at,
            idRepas: r.id_repas,
            valide: r.valide,
        }));
    } catch (error) {
        console.error("Erreur:", error);
        showMessage("Erreur lors du chargement des repas", "error");
        return;
    }

    // Réinitialiser les données
    rapportData = {
        totalRepas: 0,
        totalNormaux: 0,
        totalVegetariens: 0,
        totalPeriscolaire: 0,
        parClasse: {},
        parJour: {},
    };

    // Initialiser les compteurs par classe
    [...classes.maternelle, ...classes.primaire, ...classes.college].forEach(
        (classe) => {
            rapportData.parClasse[classe] = {
                normal: 0,
                vegetarien: 0,
                periscolaire: 0,
            };
        }
    );

    // Parcourir toutes les commandes
    commandes.forEach((commande) => {
        // Vérifier que la commande a bien un tableau de dates
        if (!commande.dates || !Array.isArray(commande.dates)) {
            return;
        }

        commande.dates.forEach((dateStr) => {
            const date = new Date(dateStr);

            // Vérifier si la date est dans la semaine prochaine
            if (date >= lundiProchain && date <= vendrediProchain) {
                // Si le type de repas est null, on ne comptabilise que le périscolaire
                if (commande.typeRepas) {
                    // Comptabiliser dans le total général
                    rapportData.totalRepas++;

                    if (commande.typeRepas === "normal") {
                        rapportData.totalNormaux++;
                    } else if (commande.typeRepas === "vegetarien") {
                        rapportData.totalVegetariens++;
                    }
                }

                if (commande.periscolaire) {
                    rapportData.totalPeriscolaire++;
                }

                // Comptabiliser par classe
                const classe = commande.classe;
                if (rapportData.parClasse[classe]) {
                    if (commande.typeRepas === "normal") {
                        rapportData.parClasse[classe].normal++;
                    } else if (commande.typeRepas === "vegetarien") {
                        rapportData.parClasse[classe].vegetarien++;
                    }

                    if (commande.periscolaire) {
                        rapportData.parClasse[classe].periscolaire++;
                    }
                }

                // Comptabiliser par jour
                const jourKey = dateStr;
                if (!rapportData.parJour[jourKey]) {
                    rapportData.parJour[jourKey] = {
                        date: date,
                        normal: 0,
                        vegetarien: 0,
                        periscolaire: 0,
                    };
                }
                if (commande.typeRepas === "normal") {
                    rapportData.parJour[jourKey].normal++;
                } else if (commande.typeRepas === "vegetarien") {
                    rapportData.parJour[jourKey].vegetarien++;
                }
                if (commande.periscolaire) {
                    rapportData.parJour[jourKey].periscolaire++;
                }
            }
        });
    });

    afficherRapport();
}

// Afficher le rapport
function afficherRapport() {
    // Résumé général
    updateElement("totalRepas", rapportData.totalRepas);
    updateElement("totalNormaux", rapportData.totalNormaux);
    updateElement("totalVegetariens", rapportData.totalVegetariens);
    updateElement("totalPeriscolaire", rapportData.totalPeriscolaire);

    // Par classe
    let totalMaternelle = 0;
    let totalMaternelleNormal = 0;
    let totalMaternelleVege = 0;
    let totalMaternellePeri = 0;

    let totalPrimaire = 0;
    let totalPrimaireNormal = 0;
    let totalPrimaireVege = 0;
    let totalPrimairePeri = 0;

    let totalCollege = 0;
    let totalCollegeNormal = 0;
    let totalCollegeVege = 0;
    let totalCollegePeri = 0;

    // Maternelle
    classes.maternelle.forEach((classe) => {
        const data = rapportData.parClasse[classe];
        const total = data.normal + data.vegetarien;
        totalMaternelle += total;
        totalMaternelleNormal += data.normal;
        totalMaternelleVege += data.vegetarien;
        totalMaternellePeri += data.periscolaire;

        const classeKey = classe.toLowerCase();
        updateElement(`${classeKey}-normal`, data.normal);
        updateElement(`${classeKey}-vege`, data.vegetarien);
        updateElement(`${classeKey}-peri`, data.periscolaire);
    });

    // Primaire
    classes.primaire.forEach((classe) => {
        const data = rapportData.parClasse[classe];
        const total = data.normal + data.vegetarien;
        totalPrimaire += total;
        totalPrimaireNormal += data.normal;
        totalPrimaireVege += data.vegetarien;
        totalPrimairePeri += data.periscolaire;

        const classeKey = classe.toLowerCase();
        updateElement(`${classeKey}-normal`, data.normal);
        updateElement(`${classeKey}-vege`, data.vegetarien);
        updateElement(`${classeKey}-peri`, data.periscolaire);
    });

    // Collège
    classes.college.forEach((classe) => {
        const data = rapportData.parClasse[classe];
        const total = data.normal + data.vegetarien;
        totalCollege += total;
        totalCollegeNormal += data.normal;
        totalCollegeVege += data.vegetarien;
        totalCollegePeri += data.periscolaire;

        // Normaliser les IDs en enlevant les accents pour correspondre au HTML
        const classeKey = classe
            .toLowerCase()
            .replace("è", "e")
            .replace("é", "e");
        updateElement(`${classeKey}-normal`, data.normal);
        updateElement(`${classeKey}-vege`, data.vegetarien);
        updateElement(`${classeKey}-peri`, data.periscolaire);
    });

    updateElement("totalMaternelle", `${totalMaternelle} repas`);
    updateElement("totalMaternelleNormal", totalMaternelleNormal);
    updateElement("totalMaternelleVege", totalMaternelleVege);
    updateElement("totalMaternellePeri", totalMaternellePeri);

    updateElement("totalPrimaire", `${totalPrimaire} repas`);
    updateElement("totalPrimaireNormal", totalPrimaireNormal);
    updateElement("totalPrimaireVege", totalPrimaireVege);
    updateElement("totalPrimairePeri", totalPrimairePeri);

    updateElement("totalCollege", `${totalCollege} repas`);
    updateElement("totalCollegeNormal", totalCollegeNormal);
    updateElement("totalCollegeVege", totalCollegeVege);
    updateElement("totalCollegePeri", totalCollegePeri);

    // Détail par jour
    afficherDetailJours();
}

// Afficher le détail par jour
function afficherDetailJours() {
    const container = document.getElementById("detailsJours");
    if (!container) return;

    // Trier les jours
    const jours = Object.keys(rapportData.parJour).sort();

    if (jours.length === 0) {
        container.innerHTML =
            '<p class="no-data">Aucune commande pour la semaine prochaine.</p><p class="no-data" style="font-size: 0.9em; color: #666;">Pour tester: connectez-vous en tant que parent et commandez des repas pour la semaine prochaine.</p>';
        return;
    }

    let html = '<table class="admin-table"><thead><tr>';
    html += "<th>Date</th>";
    html += "<th>Repas Normaux</th>";
    html += "<th>Repas Végétariens</th>";
    html += "<th>Total Repas</th>";
    html += "<th>Périscolaire</th>";
    html += "</tr></thead><tbody>";

    let totalNormaux = 0;
    let totalVegetariens = 0;
    let totalRepasGeneral = 0;
    let totalPeriscolaireGeneral = 0;

    jours.forEach((jourKey) => {
        const jour = rapportData.parJour[jourKey];
        const dateFormatee = jour.date.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
        });
        const totalRepas = jour.normal + jour.vegetarien;

        totalNormaux += jour.normal;
        totalVegetariens += jour.vegetarien;
        totalRepasGeneral += totalRepas;
        totalPeriscolaireGeneral += jour.periscolaire;

        html += `<tr onclick="afficherDetailJour('${jourKey}')" style="cursor: pointer;">`;
        html += `<td><strong>${dateFormatee}</strong></td>`;
        html += `<td>${jour.normal}</td>`;
        html += `<td>${jour.vegetarien}</td>`;
        html += `<td><strong>${totalRepas}</strong></td>`;
        html += `<td>${jour.periscolaire}</td>`;
        html += "</tr>";
    });

    // Ligne de total
    html += '<tr class="total-row">';
    html += "<td><strong>TOTAL SEMAINE</strong></td>";
    html += `<td><strong>${totalNormaux}</strong></td>`;
    html += `<td><strong>${totalVegetariens}</strong></td>`;
    html += `<td><strong>${totalRepasGeneral}</strong></td>`;
    html += `<td><strong>${totalPeriscolaireGeneral}</strong></td>`;
    html += "</tr>";

    html += "</tbody></table>";
    container.innerHTML = html;
}

// Afficher le détail d'un jour spécifique
// TODO: Utiliser les données chargées depuis l'API au lieu de localStorage
function afficherDetailJour(jourKey) {
    showMessage("Détail du jour : fonctionnalité à implémenter", "info");
    return;

    // Code désactivé - à refactoriser avec les données de l'API
    /*
    const jour = rapportData.parJour[jourKey];

    if (!jour) return;

    const dateFormatee = jour.date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    // TODO: Filtrer depuis les données déjà chargées de l'API
    const commandesDuJour = []; // À implémenter

    // Trier par classe puis par nom
    commandesDuJour.sort((a, b) => {
        if (a.classe !== b.classe) {
            return a.classe.localeCompare(b.classe);
        }
        return `${a.enfantNom} ${a.enfantPrenom}`.localeCompare(
            `${b.enfantNom} ${b.enfantPrenom}`
        );
    });
    */

    // Créer le contenu de la modal
    let html = `
    <div class="modal-commande" id="modalDetailJour" style="display: flex;">
      <div class="modal-commande-content">
        <div class="modal-commande-header">
          <h3>📅 Détail du ${dateFormatee}</h3>
          <button class="modal-close" onclick="fermerModalDetailJour()">✕</button>
        </div>
        <div class="modal-commande-body">
          <div class="rapport-stat" style="margin-bottom: 20px; background: #f8f9fa; padding: 15px; border-radius: 8px;">
            <strong>Récapitulatif du jour :</strong>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px;">
              <div>Repas normaux : <strong>${jour.normal}</strong></div>
              <div>Repas végétariens : <strong>${jour.vegetarien}</strong></div>
              <div>Total repas : <strong>${
                  jour.normal + jour.vegetarien
              }</strong></div>
              <div>Périscolaire : <strong>${jour.periscolaire}</strong></div>
            </div>
          </div>
          <h4 style="margin-bottom: 15px;">Liste des commandes (${
              commandesDuJour.length
          })</h4>
          <div style="overflow-x: auto;">
            <table class="admin-table" style="font-size: 0.9em;">
              <thead>
                <tr>
                  <th>Classe</th>
                  <th>Enfant</th>
                  <th>Type Repas</th>
                  <th>Périscolaire</th>
                </tr>
              </thead>
              <tbody>`;

    if (commandesDuJour.length === 0) {
        html +=
            '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #999;">Aucune commande pour ce jour</td></tr>';
    } else {
        commandesDuJour.forEach((cmd) => {
            const typeRepasLabel =
                cmd.typeRepas === "normal"
                    ? "🍽️ Normal"
                    : cmd.typeRepas === "vegetarien"
                    ? "🥗 Végétarien"
                    : "-";
            const periscolaireLabel = cmd.periscolaire ? "✅ Oui" : "-";

            html += `
        <tr>
          <td><span class="badge-classe">${cmd.classe}</span></td>
          <td>${cmd.enfantNom} ${cmd.enfantPrenom}</td>
          <td>${typeRepasLabel}</td>
          <td>${periscolaireLabel}</td>
        </tr>`;
        });
    }

    html += `
            </tbody>
          </table>
          </div>
        </div>
        <div class="modal-commande-footer">
          <button class="btn-secondary" onclick="fermerModalDetailJour()">Fermer</button>
        </div>
      </div>
    </div>`;

    // Ajouter la modal au body
    const existingModal = document.getElementById("modalDetailJour");
    if (existingModal) {
        existingModal.remove();
    }
    document.body.insertAdjacentHTML("beforeend", html);
}

// Fermer la modal de détail jour
function fermerModalDetailJour() {
    const modal = document.getElementById("modalDetailJour");
    if (modal) {
        modal.remove();
    }
}

// Fonction utilitaire pour mettre à jour un élément
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Imprimer le rapport
function imprimerRapport() {
    // Ajouter la date d'impression au conteneur
    const container = document.querySelector(".rapport-container");
    if (container) {
        const now = new Date();
        const dateStr = now.toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
        container.setAttribute("data-print-date", dateStr);
    }

    window.print();
}
