// dossier-detail.js - Gestion du détail d'un dossier de préinscription
// Token par défaut pour la démo
const token =
    localStorage.getItem("auth_token") ||
    "1|PcANsd4FoG4AkpxwedAdZgTIBbjhJqSAKT0brunp63847bbb";

// Vérifier l'authentification
if (!token) {
    alert("Vous devez être connecté pour accéder à cette page.");
    window.location.href = "/admin/login.html";
}

// Récupérer l'ID du dossier depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const dossierId = urlParams.get("id");

if (!dossierId) {
    alert("❌ Aucun dossier spécifié");
    window.location.href = "/admin-preinscription";
}

let dossier = null;
let modeEdition = false;

// Fonction helper pour afficher une valeur
function displayValue(value) {
    return value && value !== null && value !== ""
        ? value
        : '<span class="empty-value">Non renseigné</span>';
}

// Fonction pour créer un champ éditable
function createEditableField(name, value, type = "text", options = null) {
    if (!modeEdition) {
        if (type === "select" && options) {
            return displayValue(value);
        }
        if (type === "textarea") {
            return displayValue(value);
        }
        if (type === "date" && value) {
            return new Date(value).toLocaleDateString("fr-FR");
        }
        return displayValue(value);
    }

    if (type === "select" && options) {
        let html = `<select class="edit-field" data-field="${name}">`;
        html += `<option value="">-- Sélectionnez --</option>`;
        options.forEach((opt) => {
            html += `<option value="${opt}" ${
                value === opt ? "selected" : ""
            }>${opt}</option>`;
        });
        html += `</select>`;
        return html;
    }

    if (type === "textarea") {
        return `<textarea class="edit-field" data-field="${name}" rows="3">${
            value || ""
        }</textarea>`;
    }

    if (type === "date") {
        // Formater la date pour l'input date HTML (format YYYY-MM-DD)
        let dateValue = "";
        if (value) {
            // Si c'est une chaîne de date, extraire la partie date seulement
            if (typeof value === 'string') {
                // Si format complet avec heure (ex: "2024-01-15 00:00:00"), prendre seulement la date
                dateValue = value.split(' ')[0];
                // Si format ISO (ex: "2024-01-15T00:00:00.000000Z"), prendre seulement la date
                dateValue = dateValue.split('T')[0];
            } else if (value instanceof Date) {
                // Si c'est un objet Date, formater en YYYY-MM-DD
                const year = value.getFullYear();
                const month = String(value.getMonth() + 1).padStart(2, '0');
                const day = String(value.getDate()).padStart(2, '0');
                dateValue = `${year}-${month}-${day}`;
            }
        }
        return `<input type="date" class="edit-field" data-field="${name}" value="${dateValue}" />`;
    }

    return `<input type="${type}" class="edit-field" data-field="${name}" value="${
        value || ""
    }" />`;
}

// Fonction pour déterminer le niveau éducatif
function getNiveau(classe) {
    const maternelle = ["PS", "MS", "GS"];
    const primaire = ["CP", "CE1", "CE2", "CM1", "CM2"];
    const college = ["6ème", "5ème", "4ème", "3ème"];

    if (maternelle.includes(classe)) return "👶 Maternelle";
    if (primaire.includes(classe)) return "📚 Primaire";
    if (college.includes(classe)) return "🎓 Collège";
    return "📖";
}

// Charger les détails du dossier
async function chargerDossier() {
    try {
        const response = await fetch(
            `${API_URL}/preinscriptions/${dossierId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            }
        );

        if (!response.ok) {
            throw new Error("Erreur lors du chargement du dossier");
        }

        dossier = await response.json();
        afficherDossier();
    } catch (error) {
        console.error("Erreur:", error);
        alert("❌ Impossible de charger le dossier");
        window.location.href = "/admin-preinscription";
    }
}

// Afficher les détails du dossier
function afficherDossier() {
    // Titre et statut
    document.getElementById(
        "dossier-title"
    ).textContent = `Dossier ${dossier.numero_dossier}`;

    const statusClass =
        dossier.statut === "Validé"
            ? "status-validated"
            : dossier.statut === "Refusé"
            ? "status-refused"
            : "status-pending";

    document.getElementById("dossier-status").innerHTML = `
    <span class="status-badge ${statusClass}">${dossier.statut}</span>
  `;

    // Informations de l'enfant
    document.getElementById("enfant-details").innerHTML = `
    <div class="detail-grid">
      <div class="detail-label">Nom :</div>
      <div class="detail-value"><strong>${createEditableField(
          "nom_enfant",
          dossier.nom_enfant
      )}</strong></div>

      <div class="detail-label">Prénom :</div>
      <div class="detail-value"><strong>${createEditableField(
          "prenom_enfant",
          dossier.prenom_enfant
      )}</strong></div>

      <div class="detail-label">Date de naissance :</div>
      <div class="detail-value">${createEditableField(
          "date_naissance",
          dossier.date_naissance,
          "date"
      )}</div>

      <div class="detail-label">Lieu de naissance :</div>
      <div class="detail-value">${createEditableField(
          "lieu_naissance",
          dossier.lieu_naissance
      )}</div>

      <div class="detail-label">Nationalité :</div>
      <div class="detail-value">${createEditableField(
          "nationalite",
          dossier.nationalite
      )}</div>

      <div class="detail-label">Allergies / Santé :</div>
      <div class="detail-value">${createEditableField(
          "allergies",
          dossier.allergies,
          "textarea"
      )}</div>
    </div>
  `;

    // Scolarité
    const classesOptions = [
        "PS",
        "MS",
        "GS",
        "CP",
        "CE1",
        "CE2",
        "CM1",
        "CM2",
        "6ème",
        "5ème",
        "4ème",
        "3ème",
    ];
    document.getElementById("scolarite-details").innerHTML = `
    <div class="detail-grid">
      <div class="detail-label">Établissement précédent :</div>
      <div class="detail-value">${createEditableField(
          "etablissement_precedent",
          dossier.etablissement_precedent
      )}</div>

      <div class="detail-label">Classe actuelle :</div>
      <div class="detail-value">${createEditableField(
          "classe_actuelle",
          dossier.classe_actuelle
      )}</div>

      <div class="detail-label">Niveau :</div>
      <div class="detail-value"><strong>${getNiveau(
          dossier.classe_souhaitee
      )}</strong></div>

      <div class="detail-label">Classe souhaitée :</div>
      <div class="detail-value"><strong>${createEditableField(
          "classe_souhaitee",
          dossier.classe_souhaitee,
          "select",
          classesOptions
      )}</strong></div>

      <div class="detail-label">Date d'intégration :</div>
      <div class="detail-value">${createEditableField(
          "date_integration",
          dossier.date_integration,
          "date"
      )}</div>
    </div>
  `;

    // Responsables
    const civilitesOptions = ["Madame", "Monsieur"];
    const liensOptions = ["Père", "Mère", "Tuteur légal", "Autre"];

    let responsablesHTML = `
    <div class="responsable-block">
      <h3>Responsable 1 - ${
          modeEdition
              ? createEditableField(
                    "lien_parente",
                    dossier.lien_parente || "Parent",
                    "select",
                    liensOptions
                )
              : displayValue(dossier.lien_parente || "Parent")
      }</h3>
      <div class="detail-grid">
        <div class="detail-label">Civilité :</div>
        <div class="detail-value">${createEditableField(
            "civilite_parent",
            dossier.civilite_parent,
            "select",
            civilitesOptions
        )}</div>

        <div class="detail-label">Nom :</div>
        <div class="detail-value">${createEditableField(
            "nom_parent",
            dossier.nom_parent
        )}</div>

        <div class="detail-label">Prénom :</div>
        <div class="detail-value">${createEditableField(
            "prenom_parent",
            dossier.prenom_parent
        )}</div>

        <div class="detail-label">Email :</div>
        <div class="detail-value">${
            modeEdition
                ? createEditableField(
                      "email_parent",
                      dossier.email_parent,
                      "email"
                  )
                : '<a href="mailto:' +
                  dossier.email_parent +
                  '">' +
                  displayValue(dossier.email_parent) +
                  "</a>"
        }</div>

        <div class="detail-label">Téléphone :</div>
        <div class="detail-value">${
            modeEdition
                ? createEditableField(
                      "telephone_parent",
                      dossier.telephone_parent,
                      "tel"
                  )
                : '<a href="tel:' +
                  dossier.telephone_parent +
                  '">' +
                  displayValue(dossier.telephone_parent) +
                  "</a>"
        }</div>

        <div class="detail-label">Adresse :</div>
        <div class="detail-value">${createEditableField(
            "adresse_parent",
            dossier.adresse_parent,
            "textarea"
        )}</div>

        <div class="detail-label">Profession :</div>
        <div class="detail-value">${createEditableField(
            "profession_parent",
            dossier.profession_parent
        )}</div>
      </div>
    </div>
  `;

    // Parent 2
    responsablesHTML += `
    <div class="responsable-block">
      <h3>Responsable 2 - ${
          modeEdition
              ? createEditableField(
                    "lien_parente2",
                    dossier.lien_parente2 || "",
                    "select",
                    liensOptions
                )
              : displayValue(dossier.lien_parente2 || "Parent")
      }</h3>
      <div class="detail-grid">
        <div class="detail-label">Civilité :</div>
        <div class="detail-value">${createEditableField(
            "civilite_parent2",
            dossier.civilite_parent2,
            "select",
            civilitesOptions
        )}</div>

        <div class="detail-label">Nom :</div>
        <div class="detail-value">${createEditableField(
            "nom_parent2",
            dossier.nom_parent2
        )}</div>

        <div class="detail-label">Prénom :</div>
        <div class="detail-value">${createEditableField(
            "prenom_parent2",
            dossier.prenom_parent2
        )}</div>

        <div class="detail-label">Email :</div>
        <div class="detail-value">${
            modeEdition
                ? createEditableField(
                      "email_parent2",
                      dossier.email_parent2,
                      "email"
                  )
                : dossier.email_parent2
                ? '<a href="mailto:' +
                  dossier.email_parent2 +
                  '">' +
                  displayValue(dossier.email_parent2) +
                  "</a>"
                : displayValue(dossier.email_parent2)
        }</div>

        <div class="detail-label">Téléphone :</div>
        <div class="detail-value">${
            modeEdition
                ? createEditableField(
                      "telephone_parent2",
                      dossier.telephone_parent2,
                      "tel"
                  )
                : dossier.telephone_parent2
                ? '<a href="tel:' +
                  dossier.telephone_parent2 +
                  '">' +
                  displayValue(dossier.telephone_parent2) +
                  "</a>"
                : displayValue(dossier.telephone_parent2)
        }</div>

        <div class="detail-label">Adresse :</div>
        <div class="detail-value">${createEditableField(
            "adresse_parent2",
            dossier.adresse_parent2,
            "textarea"
        )}</div>

        <div class="detail-label">Profession :</div>
        <div class="detail-value">${createEditableField(
            "profession_parent2",
            dossier.profession_parent2
        )}</div>
      </div>
    </div>
  `;

    document.getElementById("responsables-details").innerHTML =
        responsablesHTML;

    // Informations complémentaires
    const situationsOptions = [
        "Marié(e)",
        "Pacsé(e)",
        "Célibataire",
        "Divorcé(e)",
        "Veuf/Veuve",
        "Autre",
    ];
    document.getElementById("infos-complementaires").innerHTML = `
    <div class="detail-grid">
      <div class="detail-label">Date de demande :</div>
      <div class="detail-value">${new Date(
          dossier.date_demande
      ).toLocaleDateString("fr-FR")} à ${new Date(
        dossier.date_demande
    ).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>

      <div class="detail-label">Situation familiale :</div>
      <div class="detail-value">${createEditableField(
          "situation_familiale",
          dossier.situation_familiale,
          "select",
          situationsOptions
      )}</div>

      ${
          dossier.situation_familiale === "Autre" || modeEdition
              ? `
        <div class="detail-label">Précision :</div>
        <div class="detail-value">${createEditableField(
            "situation_autre",
            dossier.situation_autre
        )}</div>
      `
              : ""
      }

      ${
          dossier.commentaire_refus
              ? `
        <div class="detail-label">Motif du refus :</div>
        <div class="detail-value" style="color: #721c24; background: #f8d7da; padding: 10px; border-radius: 5px;">
          ${
              modeEdition
                  ? createEditableField(
                        "commentaire_refus",
                        dossier.commentaire_refus,
                        "textarea"
                    )
                  : dossier.commentaire_refus
          }
        </div>
      `
              : ""
      }
    </div>
  `;

    // Questions ouvertes
    const questionsDetails = document.getElementById("questions-details");
    if (questionsDetails) {
        let questionsHTML = "";

        questionsHTML += `
      <div class="info-group">
        <label>Comment nous avez-vous découvert ? *</label>
        <div class="info-value">${createEditableField(
            "decouverte",
            dossier.decouverte,
            "textarea"
        )}</div>
      </div>
    `;

        questionsHTML += `
      <div class="info-group">
        <label>En quoi la pédagogie Montessori répond-elle à vos attentes pour l'accompagnement de votre enfant ? *</label>
        <div class="info-value">${createEditableField(
            "pedagogie_montessori",
            dossier.pedagogie_montessori,
            "textarea"
        )}</div>
      </div>
    `;

        questionsHTML += `
      <div class="info-group">
        <label>Votre enfant rencontre-t-il des difficultés que nous aurions besoin de connaître pour faciliter son intégration ? *</label>
        <div class="info-value">${createEditableField(
            "difficultes",
            dossier.difficultes,
            "textarea"
        )}</div>
      </div>
    `;

        questionsDetails.innerHTML = questionsHTML;
    }

    // Gérer les boutons d'action
    const btnValider = document.getElementById("btn-valider");
    const btnRefuser = document.getElementById("btn-refuser");
    const btnAnnulerDemande = document.getElementById("btn-annuler-demande");

    if (dossier.statut === "Validé") {
        btnValider.style.display = "none";
        btnRefuser.style.display = "none";
        btnAnnulerDemande.style.display = "none";

        // Afficher la section de validation d'inscription
        afficherSectionValidationInscription();
    } else if (dossier.statut === "Refusé") {
        btnValider.style.display = "none";
        btnRefuser.style.display = "none";
        btnAnnulerDemande.style.display = "none";
    } else if (dossier.statut === "Annulé") {
        btnValider.style.display = "none";
        btnRefuser.style.display = "none";
        btnAnnulerDemande.style.display = "none";
    }
}

// Bouton Retour
document.getElementById("btn-retour-liste").addEventListener("click", () => {
    window.location.href = "/admin-preinscription";
});

// Bouton Valider
document.getElementById("btn-valider").addEventListener("click", async () => {
    if (!confirm("✅ Confirmer la validation de ce dossier ?")) {
        return;
    }

    try {
        // Mettre le dossier au statut "Validé"
        // Laravel créera automatiquement les comptes parents et enverra l'email
        const response = await fetch(
            `${API_URL}/preinscriptions/${dossierId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                body: JSON.stringify({ statut: "Validé" }),
            }
        );

        if (!response.ok) {
            alert("❌ Erreur lors de la validation");
            return;
        }

        alert(
            "✅ Dossier validé ! Les comptes parents ont été créés et l'email envoyé."
        );
        window.location.reload();
    } catch (error) {
        console.error("Erreur:", error);
        alert("❌ Erreur lors de la validation");
    }
});

// Bouton Refuser
// Bouton Refuser
document.getElementById("btn-refuser").addEventListener("click", async () => {
    if (!confirm("❌ Confirmer le refus de ce dossier ?")) return;

    try {
        const response = await fetch(
            `${API_URL}/preinscriptions/${dossierId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                body: JSON.stringify({ statut: "Refusé" }),
            }
        );

        if (!response.ok) {
            alert("❌ Erreur lors du refus du dossier");
            return;
        }

        alert("✅ Dossier refusé et email envoyé !");
        window.location.reload();
    } catch (error) {
        console.error("Erreur:", error);
        alert("❌ Impossible de refuser le dossier...");
    }
});

// Bouton Annuler la demande
document
    .getElementById("btn-annuler-demande")
    .addEventListener("click", async () => {
        const motif = prompt("🚫 Motif de l'annulation (optionnel) :");
        if (confirm("⚠️ Confirmer l'annulation de cette demande ?")) {
            try {
                const response = await fetch(
                    `${API_URL}/preinscriptions/${dossierId}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                        body: JSON.stringify({
                            statut: "Annulé",
                            commentaire_refus:
                                motif || "Demande annulée par l'administration",
                        }),
                    }
                );

                if (response.ok) {
                    alert("🚫 Demande annulée.");
                    window.location.reload();
                } else {
                    alert("❌ Erreur lors de l'annulation");
                }
            } catch (error) {
                console.error("Erreur:", error);
                alert("❌ Erreur lors de l'annulation");
            }
        }
    });

// Bouton Modifier
document.getElementById("btn-modifier").addEventListener("click", () => {
    modeEdition = true;
    afficherDossier();

    // Afficher/masquer les boutons appropriés
    document.getElementById("btn-modifier").classList.add("hidden");
    document.getElementById("btn-valider").classList.add("hidden");
    document.getElementById("btn-refuser").classList.add("hidden");
    document.getElementById("btn-enregistrer").classList.remove("hidden");
    document.getElementById("btn-annuler").classList.remove("hidden");
});

// Bouton Annuler
document.getElementById("btn-annuler").addEventListener("click", () => {
    modeEdition = false;
    afficherDossier();

    // Afficher/masquer les boutons appropriés
    document.getElementById("btn-modifier").classList.remove("hidden");
    if (dossier.statut === "En attente") {
        document.getElementById("btn-valider").classList.remove("hidden");
        document.getElementById("btn-refuser").classList.remove("hidden");
    }
    document.getElementById("btn-enregistrer").classList.add("hidden");
    document.getElementById("btn-annuler").classList.add("hidden");
});

// Bouton Enregistrer
document
    .getElementById("btn-enregistrer")
    .addEventListener("click", async () => {
        if (!confirm("💾 Enregistrer les modifications ?")) {
            return;
        }

        // Récupérer toutes les valeurs des champs éditables
        const fields = document.querySelectorAll(".edit-field");
        const updatedData = {};

        fields.forEach((field) => {
            const fieldName = field.getAttribute("data-field");
            const value = field.value;

            // Gérer les dates : date_integration peut être null, date_naissance est obligatoire
            if (fieldName === "date_integration") {
                if (value && value.trim() !== "") {
                    updatedData[fieldName] = value;
                } else {
                    updatedData[fieldName] = null;
                }
            } else if (fieldName === "date_naissance") {
                // Toujours envoyer la date de naissance, même si vide (sera validée côté serveur)
                if (value && value.trim() !== "") {
                    updatedData[fieldName] = value;
                } else {
                    // Si vide, envoyer la valeur actuelle du dossier pour ne pas perdre la date
                    if (dossier.date_naissance) {
                        // Formater la date existante si nécessaire
                        let existingDate = dossier.date_naissance;
                        if (typeof existingDate === 'string') {
                            existingDate = existingDate.split(' ')[0].split('T')[0];
                        }
                        updatedData[fieldName] = existingDate;
                    }
                }
            } else {
                // Pour tous les autres champs, envoyer la valeur telle quelle
                updatedData[fieldName] = value || null;
            }
        });

        try {
            const response = await fetch(
                `${API_URL}/preinscriptions/${dossierId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                    body: JSON.stringify(updatedData),
                }
            );

            if (response.ok) {
                alert("✅ Modifications enregistrées avec succès !");
                modeEdition = false;
                await chargerDossier(); // Recharger les données

                // Afficher/masquer les boutons appropriés
                document
                    .getElementById("btn-modifier")
                    .classList.remove("hidden");
                if (dossier.statut === "En attente") {
                    document
                        .getElementById("btn-valider")
                        .classList.remove("hidden");
                    document
                        .getElementById("btn-refuser")
                        .classList.remove("hidden");
                }
                document
                    .getElementById("btn-enregistrer")
                    .classList.add("hidden");
                document.getElementById("btn-annuler").classList.add("hidden");
            } else {
                const error = await response.json();
                alert(
                    "❌ Erreur lors de l'enregistrement : " +
                        (error.message || "Erreur inconnue")
                );
            }
        } catch (error) {
            console.error("Erreur:", error);
            alert("❌ Erreur lors de l'enregistrement des modifications");
        }
    });

// Fonction pour afficher la section de validation d'inscription
async function afficherSectionValidationInscription() {
    const section = document.getElementById("section-validation-inscription");
    if (!section) return;

    // Afficher la section
    section.classList.remove("hidden");

    try {
        // Récupérer les justificatifs déposés par le parent pour cet enfant
        // TODO: Pour test, on utilise l'enfant 1 si id_enfant n'est pas défini
        const idEnfant = dossier.id_enfant || 1;
        const responseJustifs = await fetch(
            `${API_URL}/justificatifs/enfant/${idEnfant}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            }
        );

        if (!responseJustifs.ok) {
            throw new Error("Erreur lors du chargement des justificatifs");
        }

        const justificatifs = await responseJustifs.json();
        const listeContainer = document.getElementById("liste-justificatifs");

        if (justificatifs.length === 0) {
            listeContainer.innerHTML =
                '<p class="text-gray">Aucun document déposé pour le moment.</p>';
            return;
        }

        let html = '<div class="justificatifs-list">';

        justificatifs.forEach((justif) => {
            const isValide = justif.valide === 1 || justif.valide === true;
            const isRefuse =
                (justif.valide === 0 || justif.valide === false) &&
                justif.date_validation;

            let statutHtml = "";
            let dateValidationHtml = "";
            let motifHtml = "";
            let actionsHtml = "";

            if (isValide) {
                statutHtml =
                    '<span class="badge badge-success">✓ Validé</span>';
                if (justif.date_validation) {
                    const dateValidation = new Date(
                        justif.date_validation
                    ).toLocaleDateString("fr-FR");
                    dateValidationHtml = `<span class="text-gray">le ${dateValidation}</span>`;
                }
            } else if (isRefuse) {
                statutHtml = '<span class="badge badge-danger">✗ Refusé</span>';
                if (justif.date_validation) {
                    const dateRefus = new Date(
                        justif.date_validation
                    ).toLocaleDateString("fr-FR");
                    dateValidationHtml = `<span class="text-gray">le ${dateRefus}</span>`;
                }
                if (justif.commentaire_validation) {
                    motifHtml = `<span class="text-gray">Motif : ${justif.commentaire_validation}</span>`;
                }
            } else {
                statutHtml =
                    '<span class="badge badge-warning">En attente</span>';
                actionsHtml = `
                    <div class="justificatif-actions">
                        <button class="btn-small btn-success" onclick="validerDocument(${justif.id_justificatif})">
                            ✓ Valider
                        </button>
                        <button class="btn-small btn-danger" onclick="refuserDocument(${justif.id_justificatif})">
                            ✗ Refuser
                        </button>
                    </div>
                `;
            }

            html += `
                <div class="justificatif-item" data-id="${
                    justif.id_justificatif
                }">
                    <div class="justificatif-grid">
                        <div class="justificatif-col-titre">
                            <strong>${justif.nom_type || "Document"}</strong>
                            <div class="justificatif-info">
                                ${
                                    justif.fichier_url
                                        ? `<a href="/storage/${justif.fichier_url}" target="_blank" class="lien-document">
                                            📄 Voir le document
                                        </a>`
                                        : '<span class="text-gray">Fichier : Non disponible</span>'
                                }
                                ${
                                    justif.date_depot
                                        ? `<span class="text-gray">• Déposé le ${new Date(
                                              justif.date_depot
                                          ).toLocaleDateString("fr-FR")}</span>`
                                        : ""
                                }
                            </div>
                        </div>
                        <div class="justificatif-col-statut">
                            ${statutHtml}
                        </div>
                        <div class="justificatif-col-date">
                            ${dateValidationHtml}
                        </div>
                        <div class="justificatif-col-motif">
                            ${motifHtml}
                        </div>
                        <div class="justificatif-col-actions">
                            ${actionsHtml}
                        </div>
                    </div>
                </div>
            `;
        });

        html += "</div>";
        listeContainer.innerHTML = html;

        // Gérer l'affichage du règlement intérieur
        const checkboxReglement = document.getElementById("reglement-accepte");
        const dateAcceptationReglement = document.getElementById(
            "date-acceptation-reglement"
        );

        // Récupérer l'info du règlement depuis l'inscription
        try {
            const inscriptionResponse = await fetch(
                `${API_URL}/inscriptions/enfant/${idEnfant}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            const reglementLabel = document.getElementById("reglement-label");

            if (inscriptionResponse.ok) {
                const inscription = await inscriptionResponse.json();
                if (inscription && inscription.reglement_accepte) {
                    checkboxReglement.checked = true;
                    const dateAcceptation = new Date(
                        inscription.date_acceptation_reglement
                    ).toLocaleDateString("fr-FR");
                    dateAcceptationReglement.textContent = `✓ Accepté le ${dateAcceptation}`;
                    dateAcceptationReglement.style.color = "#28a745";
                    // Forcer le style de la checkbox en vert
                    checkboxReglement.style.accentColor = "#28a745";
                    checkboxReglement.style.filter =
                        "hue-rotate(0deg) saturate(1.5)";
                } else {
                    checkboxReglement.checked = false;
                    dateAcceptationReglement.textContent =
                        "⚠️ Le parent n'a pas encore accepté le règlement intérieur";
                    dateAcceptationReglement.style.color = "#dc3545";
                    checkboxReglement.style.accentColor = "";
                }
            } else {
                checkboxReglement.checked = false;
                dateAcceptationReglement.textContent =
                    "⚠️ Le parent n'a pas encore accepté le règlement intérieur";
                dateAcceptationReglement.style.color = "#dc3545";
                checkboxReglement.style.accentColor = "";
            }
        } catch (error) {
            console.error("Erreur lors du chargement de l'inscription:", error);
            checkboxReglement.checked = false;
            dateAcceptationReglement.textContent =
                "⚠️ Le parent n'a pas encore accepté le règlement intérieur";
            dateAcceptationReglement.style.color = "#dc3545";
        }
    } catch (error) {
        console.error("Erreur:", error);
        section.innerHTML =
            '<p class="text-error">❌ Erreur lors du chargement des justificatifs</p>';
    }
}

// Fonction pour valider un document
window.validerDocument = async function (idJustificatif) {
    const confirmed = await showConfirm(
        "Êtes-vous sûr de vouloir valider ce document ?",
        "Validation du document"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/justificatifs/${idJustificatif}/valider`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }
        );

        if (!response.ok) {
            throw new Error("Erreur lors de la validation du document");
        }

        // Recharger la section pour afficher le nouveau statut
        await afficherSectionValidationInscription();
        showSuccess("Document validé avec succès");
    } catch (error) {
        console.error("Erreur:", error);
        showError("Erreur lors de la validation du document");
    }
};

// Fonction pour refuser un document
window.refuserDocument = async function (idJustificatif) {
    const motif = await showPrompt(
        "Veuillez indiquer le motif du refus :",
        "Refus du document",
        "Ex: Document illisible, informations manquantes..."
    );

    if (motif === null) {
        return; // Annulé
    }

    try {
        const response = await fetch(
            `${API_URL}/justificatifs/${idJustificatif}/refuser`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ motif }),
            }
        );

        if (!response.ok) {
            throw new Error("Erreur lors du refus du document");
        }

        // Recharger la section pour afficher le nouveau statut
        await afficherSectionValidationInscription();
        showWarning("Document refusé");
    } catch (error) {
        console.error("Erreur:", error);
        showError("Erreur lors du refus du document");
    }
};

// Charger le dossier au démarrage
chargerDossier();
// Charger le dossier au chargement de la page
chargerDossier();
