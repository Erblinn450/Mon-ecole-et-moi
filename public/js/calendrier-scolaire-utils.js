// ===================================
// UTILITAIRES CALENDRIER SCOLAIRE
// Fonctions communes pour gérer les dates, vacances et jours fériés
// ===================================

// Jours fériés en Alsace 2025/2026 (spécifique Alsace avec Vendredi Saint et Saint-Étienne)
const joursFeries = [
    // Année 2025 (septembre à décembre)
    "2025-11-01", // Toussaint
    "2025-11-11", // Armistice 1918
    "2025-12-25", // Noël
    "2025-12-26", // Saint-Étienne (Alsace uniquement)

    // Année 2026 (janvier à août)
    "2026-01-01", // Jour de l'an
    "2026-04-06", // Lundi de Pâques
    "2026-04-03", // Vendredi Saint (Alsace uniquement)
    "2026-05-01", // Fête du travail
    "2026-05-08", // Victoire 1945
    "2026-05-14", // Ascension
    "2026-05-25", // Lundi de Pentecôte
    "2026-07-14", // Fête nationale
    "2026-08-15", // Assomption
];

// Vacances scolaires Alsace 2025/2026
const vacances = [
    { debut: "2025-10-18", fin: "2025-11-03" }, // Toussaint 2025
    { debut: "2025-12-20", fin: "2026-01-05" }, // Noël 2025
    { debut: "2026-02-07", fin: "2026-02-23" }, // Hiver 2026
    { debut: "2026-04-04", fin: "2026-04-20" }, // Printemps 2026
    { debut: "2026-07-04", fin: "2026-09-01" }, // Été 2026
];

/**
 * Vérifier si une date est un jour férié
 * @param {Date} date - Date à vérifier
 * @returns {boolean}
 */
function estJourFerie(date) {
    const dateStr = date.toISOString().split("T")[0];
    return joursFeries.includes(dateStr);
}

/**
 * Vérifier si une date est en vacances
 * @param {Date} date - Date à vérifier
 * @returns {boolean}
 */
function estVacances(date) {
    const dateStr = date.toISOString().split("T")[0];
    return vacances.some((v) => dateStr >= v.debut && dateStr <= v.fin);
}

/**
 * Vérifier si une date est un week-end
 * @param {Date} date - Date à vérifier
 * @returns {boolean}
 */
function estWeekend(date) {
    const jour = date.getDay();
    return jour === 0 || jour === 6; // Dimanche ou Samedi
}

/**
 * Vérifier si une date est un mercredi (pas de repas)
 * @param {Date} date - Date à vérifier
 * @returns {boolean}
 */
function estMercredi(date) {
    return date.getDay() === 3;
}

/**
 * Vérifier si on peut commander pour une date donnée
 * (pas de week-end, pas de mercredi, pas de vacances, pas de jour férié)
 * @param {Date} date - Date à vérifier
 * @returns {boolean}
 */
function peutCommander(date) {
    return (
        !estWeekend(date) &&
        !estMercredi(date) &&
        !estVacances(date) &&
        !estJourFerie(date)
    );
}

/**
 * Vérifier si une date est dans les délais de commande (2 jours ouvrés)
 * @param {Date} dateCommande - Date de la commande souhaitée
 * @returns {boolean}
 */
function estDansLesDelais(dateCommande) {
    const maintenant = new Date();
    maintenant.setHours(0, 0, 0, 0);

    let joursOuvres = 0;
    let dateCurseur = new Date(maintenant);

    while (dateCurseur < dateCommande && joursOuvres < 2) {
        dateCurseur.setDate(dateCurseur.getDate() + 1);
        if (peutCommander(dateCurseur)) {
            joursOuvres++;
        }
    }

    return joursOuvres >= 2;
}

/**
 * Générer une liste de dates selon le type de commande
 * @param {string} typeCommande - Type: "jour", "semaine", "mois", "annee"
 * @param {Date} dateDebut - Date de début
 * @param {Date} dateFin - Date de fin (optionnel)
 * @returns {Array<Date>}
 */
function genererDates(typeCommande, dateDebut, dateFin = null) {
    const dates = [];

    if (typeCommande === "jour") {
        if (peutCommander(dateDebut) && estDansLesDelais(dateDebut)) {
            dates.push(dateDebut);
        }
    } else if (typeCommande === "semaine") {
        const debut = new Date(dateDebut);
        debut.setDate(debut.getDate() - debut.getDay() + 1); // Lundi

        for (let i = 0; i < 5; i++) {
            const date = new Date(debut);
            date.setDate(date.getDate() + i);
            if (peutCommander(date) && estDansLesDelais(date)) {
                dates.push(date);
            }
        }
    } else if (typeCommande === "mois") {
        const annee = dateDebut.getFullYear();
        const mois = dateDebut.getMonth();
        const dernierJour = new Date(annee, mois + 1, 0).getDate();

        for (let jour = 1; jour <= dernierJour; jour++) {
            const date = new Date(annee, mois, jour);
            if (peutCommander(date) && estDansLesDelais(date)) {
                dates.push(date);
            }
        }
    } else if (typeCommande === "annee") {
        const aujourdhui = new Date();
        aujourdhui.setHours(0, 0, 0, 0);

        const debutAnnee = new Date(2025, 8, 1); // 1er septembre 2025
        const finAnnee = new Date(2026, 5, 30); // 30 juin 2026

        let current = new Date(
            Math.max(debutAnnee.getTime(), aujourdhui.getTime())
        );

        while (current <= finAnnee) {
            if (peutCommander(current) && estDansLesDelais(current)) {
                dates.push(new Date(current));
            }
            current.setDate(current.getDate() + 1);
        }
    }

    return dates;
}

/**
 * Générer la liste des mois disponibles pour l'année scolaire
 * @returns {Array<{value: string, label: string, date: Date}>}
 */
function genererMoisDisponibles() {
    const moisDisponibles = [];
    const maintenant = new Date();
    const anneeActuelle = maintenant.getFullYear();
    const moisActuel = maintenant.getMonth();

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

    // Année scolaire 2025/2026: septembre 2025 à juin 2026
    const moisScolaires = [
        { annee: 2025, mois: 8 }, // Septembre
        { annee: 2025, mois: 9 }, // Octobre
        { annee: 2025, mois: 10 }, // Novembre
        { annee: 2025, mois: 11 }, // Décembre
        { annee: 2026, mois: 0 }, // Janvier
        { annee: 2026, mois: 1 }, // Février
        { annee: 2026, mois: 2 }, // Mars
        { annee: 2026, mois: 3 }, // Avril
        { annee: 2026, mois: 4 }, // Mai
        { annee: 2026, mois: 5 }, // Juin
    ];

    for (const { annee, mois } of moisScolaires) {
        const dateMois = new Date(annee, mois, 1);

        // Ne proposer que les mois futurs ou le mois actuel
        if (dateMois >= new Date(anneeActuelle, moisActuel, 1)) {
            // Vérifier s'il y a des jours disponibles dans ce mois
            const joursDisponibles = genererDates("mois", dateMois);

            if (joursDisponibles.length > 0) {
                moisDisponibles.push({
                    value: `${annee}-${String(mois + 1).padStart(2, "0")}`,
                    label: `${nomsMois[mois]} ${annee}`,
                    date: dateMois,
                });
            }
        }
    }

    return moisDisponibles;
}

/**
 * Formater une date en français
 * @param {Date} date - Date à formater
 * @param {boolean} avecJour - Inclure le jour de la semaine
 * @returns {string}
 */
function formaterDate(date, avecJour = false) {
    const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
    };

    if (avecJour) {
        options.weekday = "long";
    }

    return date.toLocaleDateString("fr-FR", options);
}

/**
 * Obtenir le nom du jour de la semaine
 * @param {Date} date - Date
 * @returns {string}
 */
function getNomJour(date) {
    const jours = [
        "Dimanche",
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi",
    ];
    return jours[date.getDay()];
}
