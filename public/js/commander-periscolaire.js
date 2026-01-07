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

// Vérifier si le parent est connecté
if (sessionStorage.getItem("parent_logged") !== "true") {
    showMessage(
        "⚠️ Accès refusé ! Vous devez être connecté en tant que parent.",
        "error"
    );
    setTimeout(() => {
        window.location.href = "/connexion";
    }, 1000);
}

const parentEmail = sessionStorage.getItem("parent_email");

// ===================================
// NOTE: Les constantes et fonctions suivantes sont définies dans calendrier-scolaire-utils.js :
// - joursFeries, vacances
// - estJourFerie(), estVacances(), estWeekend(), peutCommander(), estDansLesDelais()
// - genererDates(), genererMoisDisponibles()
// ===================================

// Charger les enfants du parent connecté depuis l'API
async function chargerEnfants() {
    const select = document.getElementById("select-enfant");
    const token = localStorage.getItem("auth_token");

    if (!token) {
        select.innerHTML = '<option value="">Erreur: Non authentifié</option>';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/parents/enfants`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Erreur lors du chargement des enfants");
        }

        const enfants = await response.json();

        if (enfants.length === 0) {
            select.innerHTML = '<option value="">Aucun enfant inscrit</option>';
            return;
        }

        // Garder l'option par défaut et ajouter les enfants
        select.innerHTML =
            '<option value="">-- Choisissez un enfant --</option>';

        enfants.forEach((enfant) => {
            const option = document.createElement("option");
            option.value = JSON.stringify({
                id_enfant: enfant.id_enfant,
                nom: enfant.nom,
                prenom: enfant.prenom,
                classe: enfant.classe,
            });
            option.textContent = `${enfant.prenom} ${enfant.nom} (${enfant.classe})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Erreur lors du chargement des enfants:", error);
        select.innerHTML =
            '<option value="">Erreur de chargement des enfants</option>';
    }
}

// Variable globale pour stocker les commandes
let commandesInit = [];

// Charger les commandes périscolaires existantes depuis l'API
async function chargerCommandes() {
    const token = localStorage.getItem("auth_token");
    if (!token) {
        console.error("Token non trouvé");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/parents/periscolaire`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Erreur lors du chargement des commandes");
        }

        const periscolaires = await response.json();

        // Transformer les données pour correspondre au format attendu
        commandesInit = periscolaires.map((p) => ({
            id: p.id_periscolaire,
            enfantNom: p.enfant.nom,
            enfantPrenom: p.enfant.prenom,
            enfantClasse: p.enfant.classe,
            dossierId: p.id_enfant,
            date: p.date_periscolaire,
        }));

        const tbody = document.getElementById("liste-commandes");
        appliquerFiltresCommandes(commandesInit, tbody);

        // Remplir le filtre des enfants
        remplirFiltreEnfants(commandesInit);

        // Afficher le calendrier des commandes
        if (modeVueCommandes === "calendrier") {
            afficherCommandesCalendrier();
        }
    } catch (error) {
        console.error("Erreur:", error);
    }
}

// Remplir le select de filtrage par enfant (appelé UNE SEULE fois)
function remplirFiltreEnfants(commandesParent) {
    const selectEnfant = document.getElementById("filterEnfantCommandes");
    if (!selectEnfant) {
        console.error("Element filterEnfantCommandes not found");
        return;
    }

    // Ne remplir que si le select est vide (première fois)
    if (selectEnfant.options.length > 1) {
        return; // Déjà rempli
    }

    // Récupérer les enfants uniques
    const enfantsUniques = new Set();
    commandesParent.forEach((cmd) => {
        const enfantNom = `${cmd.enfantPrenom} ${cmd.enfantNom}`;
        enfantsUniques.add(enfantNom);
    });

    // Ajouter les options
    Array.from(enfantsUniques)
        .sort()
        .forEach((enfantNom) => {
            const option = document.createElement("option");
            option.value = enfantNom;
            option.textContent = enfantNom;
            selectEnfant.appendChild(option);
        });
}

// Appliquer les filtres sur les commandes
function appliquerFiltresCommandes(commandesParent, tbody) {
    const filterEnfant =
        document.getElementById("filterEnfantCommandes")?.value || "";
    const filterPeriode = document.getElementById("filterPeriode")?.value || "";

    // Filtrer les commandes
    let commandesFiltrees = commandesParent.filter((cmd) => {
        // Filtre par enfant
        if (filterEnfant) {
            const enfantNom = `${cmd.enfantPrenom} ${cmd.enfantNom}`;
            if (enfantNom !== filterEnfant) return false;
        }

        // Filtre par période
        if (filterPeriode) {
            const dateCmd = new Date(cmd.date);
            const maintenant = new Date();
            maintenant.setHours(0, 0, 0, 0);

            if (filterPeriode === "futur" && dateCmd < maintenant) return false;
            if (filterPeriode === "passe" && dateCmd >= maintenant)
                return false;

            if (filterPeriode === "semaine") {
                const debutSemaine = new Date(maintenant);
                const jourSemaine = maintenant.getDay();
                const joursAvantLundi = jourSemaine === 0 ? 6 : jourSemaine - 1;
                debutSemaine.setDate(maintenant.getDate() - joursAvantLundi);

                const finSemaine = new Date(debutSemaine);
                finSemaine.setDate(debutSemaine.getDate() + 6);

                if (dateCmd < debutSemaine || dateCmd > finSemaine)
                    return false;
            }

            if (filterPeriode === "mois") {
                if (
                    dateCmd.getMonth() !== maintenant.getMonth() ||
                    dateCmd.getFullYear() !== maintenant.getFullYear()
                ) {
                    return false;
                }
            }
        }

        return true;
    });

    // Afficher les résultats
    if (commandesFiltrees.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="4" class="no-dossiers">Aucune commande correspondante</td></tr>';
        return;
    }

    tbody.innerHTML = "";
    commandesFiltrees.forEach((cmd) => {
        const date = new Date(cmd.date);

        const row = document.createElement("tr");

        // Bouton pour annuler le périscolaire
        const actionsHTML = `
      <button class="btn-danger btn-small" onclick="annulerPeriscolaire(${cmd.id})" title="Annuler le périscolaire">❌ Annuler</button>
    `;

        row.innerHTML = `
      <td>${cmd.enfantPrenom} ${cmd.enfantNom}</td>
      <td>${date.toLocaleDateString("fr-FR", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
      })}</td>
      <td>${actionsHTML}</td>
    `;
        tbody.appendChild(row);
    });
}

// Annuler un périscolaire
async function annulerPeriscolaire(idPeriscolaire) {
    const token = localStorage.getItem("auth_token");
    if (!token) {
        showMessage("Vous devez être connecté", "error");
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/parents/periscolaire/${idPeriscolaire}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            }
        );

        if (!response.ok) {
            throw new Error("Erreur lors de l'annulation");
        }

        showMessage("✓ Périscolaire annulé.", "success");
        chargerCommandes();
        if (modeVueCommandes === "calendrier") {
            afficherCommandesCalendrier();
        }
    } catch (error) {
        console.error("Erreur:", error);
        showMessage("Une erreur est survenue lors de l'annulation", "error");
    }
}

// Annuler un périscolaire depuis le modal calendrier
async function annulerPeriscolaireModal(idPeriscolaire) {
    const token = localStorage.getItem("auth_token");
    if (!token) {
        showMessage("Vous devez être connecté", "error");
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/parents/periscolaire/${idPeriscolaire}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            }
        );

        if (!response.ok) {
            throw new Error("Erreur lors de l'annulation");
        }

        showMessage("✓ Périscolaire annulé.", "success");

        // Fermer le modal
        const modal = document.querySelector(".modal-commande");
        if (modal) {
            modal.remove();
        }

        // Recharger les commandes
        await chargerCommandes();
        afficherCommandesCalendrier();
    } catch (error) {
        console.error("Erreur:", error);
        showMessage("Une erreur est survenue lors de l'annulation", "error");
    }
}

// Gestion de l'interface
let enfantSelectionne = null;
let datesSelectionnees = [];
let calendrierMoisActuel = new Date();

// Variables globales pour le calendrier
let joursCalendrierSelectionnes = new Set();

document
    .getElementById("select-enfant")
    .addEventListener("change", function (e) {
        if (e.target.value) {
            enfantSelectionne = JSON.parse(e.target.value);
            document
                .getElementById("type-commande-section")
                .classList.remove("hidden");

            // Afficher le calendrier par défaut
            document
                .getElementById("calendrier-section")
                .classList.remove("hidden");
            document.getElementById("periode-section").classList.add("hidden");
            genererCalendrier(calendrierMoisActuel);
        } else {
            enfantSelectionne = null;
            document
                .getElementById("type-commande-section")
                .classList.add("hidden");
            document
                .getElementById("calendrier-section")
                .classList.add("hidden");
            document.getElementById("periode-section").classList.add("hidden");
        }
    });

// Gestion du mode de sélection (calendrier ou période)
document.querySelectorAll('input[name="type-commande"]').forEach((radio) => {
    radio.addEventListener("change", function () {
        const type = this.value;

        // Réinitialiser les sélections
        datesSelectionnees = [];
        joursCalendrierSelectionnes.clear();

        if (type === "calendrier") {
            document
                .getElementById("calendrier-section")
                .classList.remove("hidden");
            document.getElementById("periode-section").classList.add("hidden");
            genererCalendrier(calendrierMoisActuel);
        } else if (type === "periode") {
            document
                .getElementById("calendrier-section")
                .classList.add("hidden");
            document
                .getElementById("periode-section")
                .classList.remove("hidden");
            afficherOptionsPeriode();
        }
    });
});

// Générer le calendrier pour un mois donné
function genererCalendrier(date) {
    const container = document.getElementById("calendrier-grid");
    const moisAnnee = document.getElementById("current-month-year");

    const annee = date.getFullYear();
    const mois = date.getMonth();

    // Afficher le mois et l'année
    const nomsMois = [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Décembre",
    ];
    moisAnnee.textContent = `${nomsMois[mois]} ${annee}`;

    // Vider le container
    container.innerHTML = "";

    // Headers des jours de la semaine
    const joursNoms = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    joursNoms.forEach((jour) => {
        const header = document.createElement("div");
        header.className = "calendrier-header";
        header.textContent = jour;
        container.appendChild(header);
    });

    // Premier jour du mois
    const premierJour = new Date(annee, mois, 1);
    let premierJourSemaine = premierJour.getDay();
    premierJourSemaine = premierJourSemaine === 0 ? 6 : premierJourSemaine - 1;

    // Nombre de jours dans le mois
    const dernierJour = new Date(annee, mois + 1, 0);
    const nbJours = dernierJour.getDate();

    // Jours du mois précédent
    const moisPrecedent = new Date(annee, mois, 0);
    const joursAvant = moisPrecedent.getDate();

    // Ajouter les jours du mois précédent
    for (let i = premierJourSemaine - 1; i >= 0; i--) {
        const jourDiv = creerJourCalendrier(
            new Date(annee, mois - 1, joursAvant - i),
            true
        );
        container.appendChild(jourDiv);
    }

    // Ajouter les jours du mois actuel
    for (let jour = 1; jour <= nbJours; jour++) {
        const dateJour = new Date(annee, mois, jour);
        const jourDiv = creerJourCalendrier(dateJour, false);
        container.appendChild(jourDiv);
    }

    // Compléter avec les jours du mois suivant
    const joursRestants = 42 - (premierJourSemaine + nbJours);
    for (let jour = 1; jour <= joursRestants; jour++) {
        const jourDiv = creerJourCalendrier(
            new Date(annee, mois + 1, jour),
            true
        );
        container.appendChild(jourDiv);
    }
}

// Créer un élément jour du calendrier
function creerJourCalendrier(date, autreMois = false) {
    const div = document.createElement("div");
    div.className = "calendrier-jour";

    const dateStr = date.toISOString().split("T")[0];
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);

    const dateComparaison = new Date(date);
    dateComparaison.setHours(0, 0, 0, 0);

    // Numéro du jour
    const numeroSpan = document.createElement("span");
    numeroSpan.className = "jour-numero";
    numeroSpan.textContent = date.getDate();
    div.appendChild(numeroSpan);

    // Info supplémentaire
    const infoSpan = document.createElement("span");
    infoSpan.className = "jour-info";
    div.appendChild(infoSpan);

    // Classes et disponibilité
    if (autreMois) {
        div.classList.add("autre-mois", "indisponible");
        return div;
    }

    const estWeekendJour = estWeekend(date);
    const estMercrediJour = estMercredi(date);
    const estFerie = estJourFerie(date);
    const estEnVacances = estVacances(date);
    const estPasse = dateComparaison < aujourdhui;

    // Déterminer la disponibilité
    const disponible =
        !estWeekendJour &&
        !estMercrediJour &&
        !estFerie &&
        !estEnVacances &&
        !estPasse;

    if (disponible) {
        div.classList.add("disponible");
        infoSpan.textContent = "Dispo";
    } else {
        div.classList.add("indisponible");
        if (estMercrediJour) {
            div.classList.add("mercredi");
            infoSpan.textContent = "Mercredi";
        } else if (estWeekendJour) {
            div.classList.add("weekend");
            infoSpan.textContent = "Week-end";
        } else if (estFerie) {
            div.classList.add("ferie");
            infoSpan.textContent = "Férié";
        } else if (estEnVacances) {
            div.classList.add("vacances");
            infoSpan.textContent = "Vacances";
        } else if (estPasse) {
            infoSpan.textContent = "Passé";
        }
    }

    // Vérifier si déjà sélectionné
    if (joursCalendrierSelectionnes.has(dateStr)) {
        div.classList.add("selected");
    }

    // Ajouter l'événement de clic
    if (disponible) {
        div.addEventListener("click", function () {
            toggleJourSelection(dateStr, div);
        });
    }

    return div;
}

// Toggle sélection d'un jour
function toggleJourSelection(dateStr, jourDiv) {
    if (joursCalendrierSelectionnes.has(dateStr)) {
        joursCalendrierSelectionnes.delete(dateStr);
        jourDiv.classList.remove("selected");
    } else {
        joursCalendrierSelectionnes.add(dateStr);
        jourDiv.classList.add("selected");
    }

    // Mettre à jour datesSelectionnees
    datesSelectionnees = Array.from(joursCalendrierSelectionnes).map(
        (ds) => new Date(ds + "T12:00:00")
    );

    // Mettre à jour le récapitulatif
    if (datesSelectionnees.length > 0) {
        mettreAJourRecap();
    }
}

// Navigation calendrier - Mois précédent
document.getElementById("prev-month")?.addEventListener("click", function () {
    calendrierMoisActuel.setMonth(calendrierMoisActuel.getMonth() - 1);
    genererCalendrier(calendrierMoisActuel);
});

// Navigation calendrier - Mois suivant
document.getElementById("next-month")?.addEventListener("click", function () {
    calendrierMoisActuel.setMonth(calendrierMoisActuel.getMonth() + 1);
    genererCalendrier(calendrierMoisActuel);
});

// Afficher les options de période
function afficherOptionsPeriode() {
    // Écouter les changements de type de période
    document.querySelectorAll('input[name="type-periode"]').forEach((radio) => {
        radio.addEventListener("change", function () {
            afficherChampsPeriode(this.value);
        });
    });

    // Afficher initialement pour semaine
    afficherChampsPeriode("semaine");
}

// Afficher les champs selon le type de période
function afficherChampsPeriode(typePeriode) {
    const periodeInputs = document.getElementById("periode-inputs");

    if (typePeriode === "semaine") {
        periodeInputs.innerHTML = `
      <label for="date-semaine">Semaine du :</label>
      <input type="date" id="date-semaine" class="input-large" min="${
          new Date().toISOString().split("T")[0]
      }" />
      <small class="text-muted">Sélectionnez un jour de la semaine souhaitée (lundi à vendredi)</small>
    `;

        document
            .getElementById("date-semaine")
            .addEventListener("change", function () {
                const dateSelectionnee = new Date(this.value + "T12:00:00");
                datesSelectionnees = genererDates("semaine", dateSelectionnee);
                if (datesSelectionnees.length > 0) {
                    mettreAJourRecap();
                }
            });
    } else if (typePeriode === "mois") {
        const moisDisponibles = genererMoisDisponibles();
        let optionsMois = moisDisponibles
            .map((m) => `<option value="${m.value}">${m.label}</option>`)
            .join("");

        periodeInputs.innerHTML = `
      <label for="select-mois">Mois :</label>
      <select id="select-mois" class="input-large">
        <option value="">-- Choisissez un mois --</option>
        ${optionsMois}
      </select>
    `;

        document
            .getElementById("select-mois")
            .addEventListener("change", function () {
                if (this.value) {
                    const dateDebut = new Date(this.value + "T12:00:00");
                    datesSelectionnees = genererDates("mois", dateDebut);
                    if (datesSelectionnees.length > 0) {
                        mettreAJourRecap();
                    }
                }
            });
    } else if (typePeriode === "annee") {
        periodeInputs.innerHTML = `
      <p class="text-muted">Année scolaire 2025/2026 (septembre à juin, hors vacances et jours fériés)</p>
    `;
        datesSelectionnees = genererDates("annee");
        mettreAJourRecap();
    }
}

// Gestion du type de périscolaire - SUPPRIMÉ (plus de choix)

function mettreAJourRecap() {
    const recapContent = document.getElementById("recap-content");
    recapContent.innerHTML = `
    <p><strong>Enfant :</strong> ${enfantSelectionne.prenom} ${
        enfantSelectionne.nom
    } (${enfantSelectionne.classe})</p>
    <p><strong>Nombre de jours :</strong> ${datesSelectionnees.length}</p>
    ${
        datesSelectionnees.length <= 10
            ? `
      <p><strong>Dates :</strong></p>
      <ul style="margin-left: 20px;">
        ${datesSelectionnees
            .map(
                (d) =>
                    `<li>${d.toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}</li>`
            )
            .join("")}
      </ul>
    `
            : ""
    }
  `;

    document.getElementById("recap-section").classList.remove("hidden");
    document.getElementById("actions-section").classList.remove("hidden");
}

document
    .getElementById("btn-valider-commande")
    .addEventListener("click", async function () {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            showMessage("Vous devez être connecté pour commander", "error");
            return;
        }

        const dates = datesSelectionnees.map(
            (d) => d.toISOString().split("T")[0]
        );

        try {
            const response = await fetch(`${API_URL}/parents/periscolaire`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    id_enfant: enfantSelectionne.id_enfant,
                    dates: dates,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                console.error("Erreur API:", data);
                showMessage(
                    data.message || "Erreur lors de la commande",
                    "error"
                );
                return;
            }

            const data = await response.json();

            let message = "";
            if (data.created.length > 0) {
                message += `✓ ${data.created.length} périscolaire(s) commandé(s) avec succès !`;
            }
            if (data.ignored.length > 0) {
                message += ` - ⚠️ ${data.ignored.length} date(s) ignorée(s) (déjà commandée(s))`;
            }

            showMessage(message, "success");

            // Réinitialiser
            document.getElementById("select-enfant").value = "";
            document
                .getElementById("type-commande-section")
                .classList.add("hidden");
            document
                .getElementById("calendrier-section")
                .classList.add("hidden");
            document.getElementById("periode-section").classList.add("hidden");
            document.getElementById("recap-section").classList.add("hidden");
            document.getElementById("actions-section").classList.add("hidden");
            joursCalendrierSelectionnes.clear();
            datesSelectionnees = [];

            chargerCommandes();
            if (modeVueCommandes === "calendrier") {
                afficherCommandesCalendrier();
            }
        } catch (error) {
            console.error("Erreur:", error);
            showMessage("Une erreur est survenue lors de la commande", "error");
        }
    });

// Event listeners pour les filtres de commandes
document
    .getElementById("filterEnfantCommandes")
    ?.addEventListener("change", chargerCommandes);
document
    .getElementById("filterPeriode")
    ?.addEventListener("change", chargerCommandes);

// Bouton reset des filtres
document
    .getElementById("btn-reset-filters")
    ?.addEventListener("click", function () {
        document.getElementById("filterEnfantCommandes").value = "";
        document.getElementById("filterPeriode").value = "";
        chargerCommandes();
        if (modeVueCommandes === "calendrier") {
            afficherCommandesCalendrier();
        }
    });

// ===== GESTION VUE CALENDRIER DES COMMANDES =====
let commandesMoisActuel = new Date();
let modeVueCommandes = "calendrier";

// Boutons de changement de vue
document
    .getElementById("btn-view-calendrier")
    ?.addEventListener("click", function () {
        modeVueCommandes = "calendrier";
        document
            .getElementById("commandes-calendrier-view")
            .classList.remove("hidden");
        document.getElementById("commandes-liste-view").classList.add("hidden");
        this.classList.add("btn-primary");
        document
            .getElementById("btn-view-liste")
            .classList.remove("btn-primary");
        afficherCommandesCalendrier();
    });

document
    .getElementById("btn-view-liste")
    ?.addEventListener("click", function () {
        modeVueCommandes = "liste";
        document
            .getElementById("commandes-calendrier-view")
            .classList.add("hidden");
        document
            .getElementById("commandes-liste-view")
            .classList.remove("hidden");
        this.classList.add("btn-primary");
        document
            .getElementById("btn-view-calendrier")
            .classList.remove("btn-primary");
        chargerCommandes();
    });

// Navigation calendrier commandes
document
    .getElementById("prev-month-commandes")
    ?.addEventListener("click", function () {
        commandesMoisActuel.setMonth(commandesMoisActuel.getMonth() - 1);
        afficherCommandesCalendrier();
    });

document
    .getElementById("next-month-commandes")
    ?.addEventListener("click", function () {
        commandesMoisActuel.setMonth(commandesMoisActuel.getMonth() + 1);
        afficherCommandesCalendrier();
    });

// Afficher le calendrier des commandes
function afficherCommandesCalendrier() {
    const container = document.getElementById("calendrier-commandes-grid");
    const moisAnnee = document.getElementById("current-month-year-commandes");

    const annee = commandesMoisActuel.getFullYear();
    const mois = commandesMoisActuel.getMonth();

    const nomsMois = [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Décembre",
    ];
    moisAnnee.textContent = `${nomsMois[mois]} ${annee}`;

    container.innerHTML = "";

    // Headers
    const joursNoms = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    joursNoms.forEach((jour) => {
        const header = document.createElement("div");
        header.className = "calendrier-header";
        header.textContent = jour;
        container.appendChild(header);
    });

    // Charger les commandes depuis commandesInit (déjà chargé via API)
    const filterEnfant =
        document.getElementById("filterEnfantCommandes")?.value || "";

    const commandesParent = commandesInit.filter((cmd) => {
        if (filterEnfant) {
            const enfantNom = `${cmd.enfantPrenom} ${cmd.enfantNom}`;
            if (enfantNom !== filterEnfant) return false;
        }
        return true;
    });

    // Créer un index des commandes par date
    const commandesParDate = {};
    commandesParent.forEach((cmd) => {
        const dateStr = new Date(cmd.date).toISOString().split("T")[0];
        if (!commandesParDate[dateStr]) {
            commandesParDate[dateStr] = [];
        }
        commandesParDate[dateStr].push(cmd);
    });

    // Générer le calendrier
    const premierJour = new Date(annee, mois, 1);
    let premierJourSemaine = premierJour.getDay();
    premierJourSemaine = premierJourSemaine === 0 ? 6 : premierJourSemaine - 1;

    const dernierJour = new Date(annee, mois + 1, 0);
    const nbJours = dernierJour.getDate();

    const moisPrecedent = new Date(annee, mois, 0);
    const joursAvant = moisPrecedent.getDate();

    // Jours du mois précédent
    for (let i = premierJourSemaine - 1; i >= 0; i--) {
        const jourDiv = creerJourCommandeCalendrier(
            new Date(annee, mois - 1, joursAvant - i),
            commandesParDate,
            true
        );
        container.appendChild(jourDiv);
    }

    // Jours du mois actuel
    for (let jour = 1; jour <= nbJours; jour++) {
        const dateJour = new Date(annee, mois, jour);
        const jourDiv = creerJourCommandeCalendrier(
            dateJour,
            commandesParDate,
            false
        );
        container.appendChild(jourDiv);
    }

    // Jours du mois suivant
    const joursRestants = 42 - (premierJourSemaine + nbJours);
    for (let jour = 1; jour <= joursRestants; jour++) {
        const jourDiv = creerJourCommandeCalendrier(
            new Date(annee, mois + 1, jour),
            commandesParDate,
            true
        );
        container.appendChild(jourDiv);
    }
}

// Créer un jour du calendrier des commandes
function creerJourCommandeCalendrier(
    date,
    commandesParDate,
    autreMois = false
) {
    const div = document.createElement("div");
    div.className = "calendrier-jour";

    const dateStr = date.toISOString().split("T")[0];

    const numeroSpan = document.createElement("span");
    numeroSpan.className = "jour-numero";
    numeroSpan.textContent = date.getDate();
    div.appendChild(numeroSpan);

    if (autreMois) {
        div.classList.add("autre-mois");
        return div;
    }

    // Vérifier s'il y a des commandes ce jour-là
    const commandesJour = commandesParDate[dateStr] || [];

    if (commandesJour.length > 0) {
        div.classList.add("has-commande");

        const infoDiv = document.createElement("div");
        infoDiv.className = "jour-commandes-info";

        // Périscolaire - toutes les commandes sont des commandes périscolaires
        const periscolaireCount = commandesJour.length;
        if (periscolaireCount > 0) {
            const periscolaireSpan = document.createElement("span");
            periscolaireSpan.className = "commande-badge periscolaire";
            periscolaireSpan.textContent = `🎨 ${periscolaireCount}`;
            infoDiv.appendChild(periscolaireSpan);
        }

        div.appendChild(infoDiv);

        // Clic pour voir les détails
        div.style.cursor = "pointer";
        div.addEventListener("click", () => {
            afficherModalCommande(date, commandesJour);
        });
    }

    return div;
}

// Afficher le modal avec les détails d'une commande
function afficherModalCommande(date, commandesJour) {
    const modal = document.createElement("div");
    modal.className = "modal-commande";

    const dateFormatee = date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    let contenuCommandes = "";
    commandesJour.forEach((commande) => {
        contenuCommandes += `
      <div class="commande-item">
        <p><strong>👤 ${commande.enfantPrenom} ${commande.enfantNom}</strong></p>
        <div class="modal-actions">
          <button class="btn-small btn-danger" onclick="annulerPeriscolaireModal(${commande.id}); this.closest('.modal-commande').remove();">Annuler périscolaire</button>
        </div>
      </div>
      <hr />
    `;
    });

    modal.innerHTML = `
    <div class="modal-content">
      <h3>📅 ${dateFormatee}</h3>
      ${contenuCommandes}
      <div class="modal-actions">
        <button class="btn-secondary" onclick="this.closest('.modal-commande').remove()">Fermer</button>
      </div>
    </div>
  `;

    modal.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
}

// Initialisation
chargerEnfants();

// Charger les commandes (affichera aussi le calendrier si nécessaire)
chargerCommandes();

// Recharger le calendrier quand les filtres changent
document
    .getElementById("filterEnfantCommandes")
    ?.addEventListener("change", function () {
        if (modeVueCommandes === "calendrier") {
            afficherCommandesCalendrier();
        }
    });
