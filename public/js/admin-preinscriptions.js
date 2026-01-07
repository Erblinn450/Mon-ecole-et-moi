const API_URL = "http://localhost:8000/api";
let preinscriptions = [];
let allPreinscriptions = []; // Pour les statistiques globales
let preinscriptionsFiltrees = []; // Pour la recherche

// Token par défaut pour la démo
const token =
    localStorage.getItem("auth_token") ||
    "1|Oz9F0zIc2MRfnUydTp8udYBcNAoiCRtyt44vJpb0843549b5";

// Pagination
let currentPage = 1;
const pageSize = 50;

// Charger les préinscriptions au chargement
document.addEventListener("DOMContentLoaded", () => {
    chargerStatistiques(); // Charger stats au démarrage
    chargerPreinscriptions();

    // Événement changement filtre
    const filterType = document.getElementById("filter-type");
    if (filterType) {
        filterType.addEventListener("change", () => {
            chargerPreinscriptions();
        });
    }

    // Événement recherche en temps réel
    const searchInput = document.getElementById("search-input");
    const clearSearchBtn = document.getElementById("clear-search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const target = e.target;
            const query = target && target.value ? target.value.trim() : "";
            if (clearSearchBtn)
                clearSearchBtn.style.display = query ? "block" : "none";
            rechercherPreinscriptions(query);
        });
    }
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            clearSearchBtn.style.display = "none";
            rechercherPreinscriptions("");
        });
    }

    // Déconnexion
    const btnDeconnexion = document.getElementById("btn-deconnexion");
    if (btnDeconnexion) {
        btnDeconnexion.addEventListener("click", () => {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_name");
            localStorage.removeItem("user_email");
            window.location.href = "/login";
        });
    }

    // Pagination
    const btnPrev = document.getElementById("btn-prev-page");
    const btnNext = document.getElementById("btn-next-page");
    if (btnPrev) {
        btnPrev.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                afficherPreinscriptions();
            }
        });
    }
    if (btnNext) {
        btnNext.addEventListener("click", () => {
            const total = preinscriptionsFiltrees.length;
            const totalPages = Math.max(1, Math.ceil(total / pageSize));
            if (currentPage < totalPages) {
                currentPage++;
                afficherPreinscriptions();
            }
        });
    }

    // Navigation admin
    document
        .querySelector(".btn-nav-comptes")
        ?.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "/comptes-parents";
        });
    document
        .querySelector(".btn-nav-eleves")
        ?.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "/admin-eleves";
        });
    document.querySelector(".btn-nav-repas")?.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/admin-repas";
    });
    document
        .querySelector(".btn-nav-periscolaire")
        ?.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "/admin-periscolaire";
        });
    document
        .querySelector(".btn-nav-rapports")
        ?.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "/admin-rapports-repas";
        });
    document
        .querySelector(".btn-nav-formulaire")
        ?.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "/formulaire";
        });
    document.querySelector(".btn-logout")?.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_name");
        localStorage.removeItem("user_email");
        window.location.href = "/login";
    });
    document.querySelector(".link-accueil")?.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/index";
    });
});

// Charger statistiques globales (tous les dossiers)
async function chargerStatistiques() {
    try {
        const response = await fetch(`${API_URL}/preinscriptions?filtre=tous`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (response.ok) {
            allPreinscriptions = await response.json();
            mettreAJourStatistiques();
        }
    } catch (error) {
        console.error("Erreur chargement statistiques:", error);
    }
}

// Fonction pour charger les préinscriptions filtrées depuis l'API
async function chargerPreinscriptions() {
    try {
        const filterType = document.getElementById("filter-type");
        const filtre =
            filterType && filterType.value ? filterType.value : "tous";
        const url = `${API_URL}/preinscriptions?filtre=${filtre}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert("Session expirée. Veuillez vous reconnecter.");
                localStorage.removeItem("auth_token");
                window.location.href = "/login";
                return;
            }
            throw new Error("Erreur chargement");
        }

        preinscriptions = await response.json();
        preinscriptionsFiltrees = [...preinscriptions]; // Copie pour la recherche
        afficherPreinscriptions();
    } catch (error) {
        console.error("Erreur:", error);
        alert("Impossible de charger les préinscriptions");
    }
}

// Fonction de recherche multi-champs
function rechercherPreinscriptions(query) {
    if (!query) {
        // Si pas de recherche, afficher toutes les préinscriptions
        preinscriptionsFiltrees = [...preinscriptions];
    } else {
        // Normaliser la recherche (minuscules, sans accents)
        const normalizedQuery = query
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        // Filtrer sur tous les champs pertinents
        preinscriptionsFiltrees = preinscriptions.filter((p) => {
            const searchableFields = [
                p.numero_dossier,
                p.nom_parent,
                p.prenom_parent,
                p.nom_enfant,
                p.prenom_enfant,
                p.classe_souhaitee,
                p.email_parent,
                p.telephone_parent,
                p.nom_parent2 || "",
                p.prenom_parent2 || "",
                p.email_parent2 || "",
                p.telephone_parent2 || "",
                p.statut,
                formatDate(p.date_integration),
                formatDate(p.date_demande),
            ];

            // Combiner tous les champs en une seule chaîne
            const searchableText = searchableFields
                .join(" ")
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");

            return searchableText.includes(normalizedQuery);
        });
    }

    afficherPreinscriptions();
}

// Afficher les préinscriptions dans le tableau
function afficherPreinscriptions() {
    const tbody = document.getElementById("dossiers-list");
    const total = preinscriptionsFiltrees.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = preinscriptionsFiltrees.slice(start, end);

    if (pageData.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="8" class="text-center">Aucune préinscription trouvée</td></tr>';
    } else {
        tbody.innerHTML = pageData
            .map(
                (p) => `
        <tr>
            <td>${p.numero_dossier}</td>
            <td>${p.nom_parent} ${p.prenom_parent}</td>
            <td>${p.nom_enfant} ${p.prenom_enfant}</td>
            <td>${getNiveau(p.classe_souhaitee)} - ${p.classe_souhaitee}</td>
            <td>${formatDate(p.date_integration)}</td>
            <td>${formatDate(p.date_demande)}</td>
            <td><span style="padding: 5px 12px; border-radius: 20px; font-weight: 500; display: inline-block; ${getStatutStyle(
                p.statut
            )}">${p.statut}</span></td>
            <td>
                <button onclick="voirDetails(${
                    p.id
                })" class="btn-action">Voir</button>
                ${
                    p.statut === "Validé" && !p.compte_cree
                        ? `<button onclick="creerComptes(${p.id})" class="btn-action" style="background: #28a745; margin-left: 5px;">👤 Créer compte(s)</button>`
                        : ""
                }
                ${
                    p.compte_cree
                        ? `<span style="padding: 3px 8px; background: #d1ecf1; border-radius: 15px; font-size: 0.85em; margin-left: 5px;">✅ Compte créé</span>`
                        : ""
                }
            </td>
        </tr>
    `
            )
            .join("");
    }

    // Pagination info
    const paginationInfo = document.getElementById("pagination-info");
    if (paginationInfo) {
        paginationInfo.textContent = `Page ${currentPage} / ${totalPages}`;
    }

    // Boutons
    const btnPrev = document.getElementById("btn-prev-page");
    const btnNext = document.getElementById("btn-next-page");
    if (btnPrev) btnPrev.disabled = currentPage <= 1;
    if (btnNext) btnNext.disabled = currentPage >= totalPages;
}

// Mettre à jour les statistiques globales
function mettreAJourStatistiques() {
    const total = allPreinscriptions.length;
    const attente = allPreinscriptions.filter(
        (p) => p.statut === "En attente" && !p.compte_cree
    ).length;
    const valides = allPreinscriptions.filter(
        (p) => p.statut === "Validé" && !p.compte_cree
    ).length;
    const refuses = allPreinscriptions.filter(
        (p) => p.statut === "Refusé" && !p.compte_cree
    ).length;
    const annules = allPreinscriptions.filter(
        (p) => p.statut === "Annulé" && !p.compte_cree
    ).length;

    const statTotal = document.getElementById("stat-total");
    if (statTotal) statTotal.textContent = String(total);
    const statAttente = document.getElementById("stat-attente");
    if (statAttente) statAttente.textContent = String(attente);
    const statValides = document.getElementById("stat-valides");
    if (statValides) statValides.textContent = String(valides);
    const statRefuses = document.getElementById("stat-refuses");
    if (statRefuses) statRefuses.textContent = String(refuses);
    const statAnnules = document.getElementById("stat-annules");
    if (statAnnules) statAnnules.textContent = String(annules);
}

// Déterminer le niveau éducatif
/**
 * @param {string} classe
 */
function getNiveau(classe) {
    const maternelle = ["PS", "MS", "GS"];
    const primaire = ["CP", "CE1", "CE2", "CM1", "CM2"];
    const college = ["6ème", "5ème", "4ème", "3ème"];

    if (maternelle.includes(classe)) return "👶 Maternelle";
    if (primaire.includes(classe)) return "📚 Primaire";
    if (college.includes(classe)) return "🎓 Collège";
    return "📖";
}

// Obtenir la classe CSS pour le badge de statut
/**
 * @param {string} statut
 */
function getStatutClass(statut) {
    const classes = {
        "En attente": "warning",
        Validé: "success",
        Refusé: "danger",
    };
    return Object.prototype.hasOwnProperty.call(classes, statut)
        ? classes[statut]
        : "secondary";
}

// Obtenir le style inline pour le badge de statut
/**
 * @param {string} statut
 */
function getStatutStyle(statut) {
    const styles = {
        "En attente": "background: #fff3cd; color: #856404;",
        Validé: "background: #d4edda; color: #155724;",
        Refusé: "background: #f8d7da; color: #721c24;",
        Annulé: "background: #e9ecef; color: #6c757d;",
    };
    return Object.prototype.hasOwnProperty.call(styles, statut)
        ? styles[statut]
        : "background: #e9ecef; color: #383d41;";
} // Formater les dates
/**
 * @param {string|Date} dateString
 */
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
}

// Voir détails d'une préinscription
/**
 * @param {number|string} id
 */
function voirDetails(id) {
    window.location.href = `/dossier-detail?id=${id}`;
}

// Créer les comptes parents pour une préinscription validée
/**
 * @param {number|string} preinscriptionId
 */
async function creerComptes(preinscriptionId) {
    const allPreinscriptionsArr = Array.isArray(window.allPreinscriptions)
        ? window.allPreinscriptions
        : [];
    const preinscription = allPreinscriptionsArr.find(
        /** @param {{id:number|string}} p */
        (p) => p.id === preinscriptionId
    );

    if (!preinscription) {
        alert("Préinscription non trouvée");
        return;
    }

    // Demander les informations du/des parent(s)
    const nombreParents = confirm(
        `Créer les comptes pour le dossier ${preinscription.numero_dossier}\n\nVoulez-vous créer 2 comptes parents ?\n\nOK = 2 parents\nAnnuler = 1 seul parent`
    )
        ? 2
        : 1;

    const parents = [];

    // Pré-remplir avec les données de la préinscription pour le premier parent
    for (let i = 0; i < nombreParents; i++) {
        const nom =
            i === 0
                ? prompt(`Parent ${i + 1} - Nom:`, preinscription.nom_parent)
                : prompt(`Parent ${i + 1} - Nom:`);

        if (!nom) {
            alert("Création annulée");
            return;
        }

        const prenom =
            i === 0
                ? prompt(
                      `Parent ${i + 1} - Prénom:`,
                      preinscription.prenom_parent
                  )
                : prompt(`Parent ${i + 1} - Prénom:`);

        if (!prenom) {
            alert("Création annulée");
            return;
        }

        const email =
            i === 0
                ? prompt(
                      `Parent ${i + 1} - Email:`,
                      preinscription.email_parent
                  )
                : prompt(`Parent ${i + 1} - Email:`);

        if (!email) {
            alert("Création annulée");
            return;
        }

        const telephone =
            i === 0
                ? prompt(
                      `Parent ${i + 1} - Téléphone:`,
                      preinscription.telephone_parent
                  )
                : prompt(`Parent ${i + 1} - Téléphone:`);

        if (!telephone) {
            alert("Création annulée");
            return;
        }

        parents.push({ nom, prenom, email, telephone });
    }

    try {
        const response = await fetch(
            `${API_URL}/preinscriptions/${preinscriptionId}/creer-comptes-parents`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                body: JSON.stringify({ parents }),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            alert(
                `Erreur: ${error.message || "Impossible de créer les comptes"}`
            );
            return;
        }

        const result = await response.json();

        // Afficher les mots de passe temporaires
        let message =
            "Comptes créés avec succès !\n\nMots de passe temporaires :\n\n";
        result.mots_de_passe.forEach(
            /** @param {{email:string, mot_de_passe_temporaire:string}} mdp */
            (mdp) => {
                message += `${mdp.email}\nMot de passe: ${mdp.mot_de_passe_temporaire}\n\n`;
            }
        );
        message +=
            "\n⚠️ IMPORTANT: Notez ces mots de passe, ils ne seront plus affichés !";

        alert(message);

        // Recharger les données
        await chargerStatistiques();
        await chargerPreinscriptions();
    } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur lors de la création des comptes");
    }
}
