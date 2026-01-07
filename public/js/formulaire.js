// Gestion du formulaire de préinscription

const responsablesContainer = document.getElementById("responsables-container");
const addRespBtn = document.getElementById("ajouter-responsable");
const situationSelect = document.getElementById("situation");
const autreLabel = document.getElementById("label-autre");
const autreTextarea = document.getElementById("situation_autre");

let responsableCount = 0;

// Fonction pour créer un bloc responsable
function createResponsableBlock(index) {
    const div = document.createElement("div");
    div.classList.add("responsable-entry");
    div.innerHTML = `
    <h3>Responsable ${index}</h3>

    <label for="civilite_${index}">Civilité *</label>
    <select id="civilite_${index}" name="civilite_${index}" required oninvalid="this.setCustomValidity('Veuillez sélectionner une civilité')" oninput="this.setCustomValidity('')">
      <option value="">-- Sélectionnez --</option>
      <option value="Madame">Madame</option>
      <option value="Monsieur">Monsieur</option>
    </select>

    <label for="nom_responsable_${index}">Nom *</label>
    <input type="text" id="nom_responsable_${index}" name="nom_responsable_${index}" required oninvalid="this.setCustomValidity('Veuillez renseigner le nom')" oninput="this.setCustomValidity('')" />

    <label for="prenom_responsable_${index}">Prénom *</label>
    <input type="text" id="prenom_responsable_${index}" name="prenom_responsable_${index}" required oninvalid="this.setCustomValidity('Veuillez renseigner le prénom')" oninput="this.setCustomValidity('')" />

    <label for="lien_parente_${index}">Lien de parenté *</label>
    <select id="lien_parente_${index}" name="lien_parente_${index}" class="lien-parente" required oninvalid="this.setCustomValidity('Veuillez sélectionner le lien de parenté')" oninput="this.setCustomValidity('')">
      <option value="">-- Sélectionnez --</option>
      <option value="Père">Père</option>
      <option value="Mère">Mère</option>
      <option value="Tuteur légal">Tuteur légal</option>
      <option value="Autre">Autre</option>
    </select>

    <label for="lien_autre_${index}" class="label-lien-autre" style="display: none;">Précisez le lien de parenté *</label>
    <input type="text" id="lien_autre_${index}" name="lien_autre[]" class="input-lien-autre" style="display: none;" />

    <label for="email_responsable_${index}">Email *</label>
    <input type="email" id="email_responsable_${index}" name="email_responsable_${index}" required oninvalid="this.setCustomValidity('Veuillez renseigner une adresse email valide')" oninput="this.setCustomValidity('')" />

    <label for="tel_responsable_${index}">Téléphone *</label>
    <input type="tel" id="tel_responsable_${index}" name="tel_responsable_${index}" required oninvalid="this.setCustomValidity('Veuillez renseigner le numéro de téléphone')" oninput="this.setCustomValidity('')" placeholder="Ex: 06 12 34 56 78" />

    <label for="adresse_responsable_${index}">Adresse complète *</label>
    <textarea id="adresse_responsable_${index}" name="adresse_responsable_${index}" placeholder="Numéro, rue, code postal, ville" required oninvalid="this.setCustomValidity('Veuillez renseigner l\'adresse complète')" oninput="this.setCustomValidity('')"></textarea>

    <label for="profession_${index}">Profession</label>
    <input type="text" id="profession_${index}" name="profession_${index}" />

    ${
        index > 1
            ? '<button type="button" class="remove-responsable">Supprimer ce responsable</button>'
            : ""
    }
  `;

    // Gérer "Autre" pour lien de parenté
    const selectLien = div.querySelector(`#lien_parente_${index}`);
    const labelLienAutre = div.querySelector(`.label-lien-autre`);
    const inputLienAutre = div.querySelector(`#lien_autre_${index}`);

    selectLien.addEventListener("change", () => {
        if (selectLien.value === "Autre") {
            labelLienAutre.classList.remove("hidden");
            inputLienAutre.classList.remove("hidden");
            inputLienAutre.setAttribute("required", "required");
        } else {
            labelLienAutre.classList.add("hidden");
            inputLienAutre.classList.add("hidden");
            inputLienAutre.removeAttribute("required");
            inputLienAutre.value = "";
        }
    });

    if (index > 1) {
        div.querySelector(".remove-responsable").addEventListener(
            "click",
            () => {
                div.remove();
                responsableCount--;
            }
        );
    }

    return div;
}

// Ajouter le premier responsable
responsableCount++;
responsablesContainer.appendChild(createResponsableBlock(responsableCount));

// Ajouter un responsable
addRespBtn.addEventListener("click", () => {
    if (responsableCount < 2) {
        responsableCount++;
        responsablesContainer.appendChild(
            createResponsableBlock(responsableCount)
        );
    } else {
        alert("Maximum 2 responsables légaux.");
    }
});

// Gérer "Autre" situation familiale
situationSelect.addEventListener("change", () => {
    if (situationSelect.value === "Autre") {
        autreLabel.classList.remove("hidden");
        autreTextarea.classList.remove("hidden");
        autreTextarea.setAttribute("required", "required");
    } else {
        autreLabel.classList.add("hidden");
        autreTextarea.classList.add("hidden");
        autreTextarea.removeAttribute("required");
        autreTextarea.value = "";
    }
});

// Gérer les champs obligatoires de scolarité selon la classe souhaitée
const classeSouhaiteeSelect = document.getElementById("classe_souhaitee");
const etablissementPrecedent = document.getElementById(
    "etablissement_precedent"
);
const classeActuelle = document.getElementById("classe_actuelle");
const labelEtablissement = document.getElementById(
    "label_etablissement_precedent"
);
const labelClasse = document.getElementById("label_classe_actuelle");
const requiredClasse = document.getElementById("required_classe_actuelle");

// Gérer la date d'intégration selon la case à cocher
const rentreeScolaireCheckbox = document.getElementById("rentre_scolaire");
const dateIntegrationInput = document.getElementById("date_integration");
const dateIntegrationContainer = document.getElementById(
    "date_integration_container"
);

rentreeScolaireCheckbox.addEventListener("change", () => {
    if (rentreeScolaireCheckbox.checked) {
        // Si rentrée scolaire cochée, masquer complètement le champ date
        dateIntegrationContainer.style.display = "none";
        dateIntegrationInput.removeAttribute("required");
        dateIntegrationInput.value = "";
    } else {
        // Si non coché, afficher le champ date qui est obligatoire
        dateIntegrationContainer.style.display = "block";
        dateIntegrationInput.setAttribute("required", "required");
    }
});

classeSouhaiteeSelect.addEventListener("change", () => {
    const isPS = classeSouhaiteeSelect.value === "PS";

    if (isPS) {
        // Pour PS, les champs de scolarité ne sont pas obligatoires
        if (etablissementPrecedent)
            etablissementPrecedent.removeAttribute("required");
        if (classeActuelle) {
            classeActuelle.removeAttribute("required");
            if (classeActuelle instanceof HTMLSelectElement) {
                classeActuelle.value = "Non scolarisé";
            }
        }

        // Retirer les étoiles rouges
        if (labelEtablissement) {
            const span = labelEtablissement.querySelector(
                'span[style*="color: red"]'
            );
            if (span && span instanceof HTMLElement)
                span.style.display = "none";
        }
        if (requiredClasse && requiredClasse instanceof HTMLElement) {
            requiredClasse.style.display = "none";
        }
    } else {
        // Pour les autres classes, les champs sont obligatoires
        if (etablissementPrecedent)
            etablissementPrecedent.setAttribute("required", "required");
        if (classeActuelle) classeActuelle.setAttribute("required", "required");

        // Afficher les étoiles rouges
        if (labelEtablissement) {
            const span = labelEtablissement.querySelector(
                'span[style*="color: red"]'
            );
            if (span && span instanceof HTMLElement)
                span.style.display = "inline";
        }
        if (requiredClasse && requiredClasse instanceof HTMLElement) {
            requiredClasse.style.display = "inline";
        }
    }
});

function validerFormulaire(formData) {
    let erreurs = [];

    // Vérifier les champs de l'enfant
    if (!formData.nom_enfant.trim()) erreurs.push("Nom de l'enfant manquant");
    if (!formData.prenom_enfant.trim())
        erreurs.push("Prénom de l'enfant manquant");
    if (!formData.date_naissance) erreurs.push("Date de naissance manquante");
    if (!formData.lieu_naissance.trim())
        erreurs.push("Lieu de naissance manquant");

    // Vérifier au moins un responsable
    if (!formData.responsables || formData.responsables.length === 0) {
        erreurs.push("Au moins un responsable doit être ajouté");
    } else {
        formData.responsables.forEach((r, i) => {
            if (!r.nom.trim())
                erreurs.push(`Nom du responsable ${i + 1} manquant`);
            if (!r.prenom.trim())
                erreurs.push(`Prénom du responsable ${i + 1} manquant`);
            if (!r.email.trim())
                erreurs.push(`Email du responsable ${i + 1} manquant`);
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) {
                erreurs.push(`Email du responsable ${i + 1} invalide`);
            }
        });
    }

    // Vérifier la situation familiale
    if (!formData.situation) erreurs.push("Situation familiale manquante");
    if (formData.situation === "Autre" && !formData.situation_autre.trim()) {
        erreurs.push("Veuillez préciser la situation familiale");
    }

    return erreurs;
}

// Validation et soumission
document
    .getElementById("form-preinscription")
    .addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("🚀 Formulaire soumis - preventDefault activé");

        // Collecter les données
        const formData = {
            nom_enfant: document.getElementById("nom_enfant").value,
            prenom_enfant: document.getElementById("prenom_enfant").value,
            date_naissance: document.getElementById("date_naissance").value,
            lieu_naissance: document.getElementById("lieu_naissance").value,
            nationalite: document.getElementById("nationalite").value,
            allergies: document.getElementById("allergies").value,
            classe_souhaitee: document.getElementById("classe_souhaitee").value,
            etablissement_precedent: document.getElementById(
                "etablissement_precedent"
            ).value,
            classe_actuelle: document.getElementById("classe_actuelle").value,
            responsables: [],
            date_integration: document.getElementById("date_integration").value,
            situation: document.getElementById("situation").value,
            situation_autre: document.getElementById("situation_autre").value,
            decouverte: document.getElementById("decouverte").value,
            pedagogie_montessori: document.getElementById(
                "pedagogie_montessori"
            ).value,
            difficultes: document.getElementById("difficultes").value,
            date_demande: new Date().toISOString(),
            statut: "En attente",
        };

        // Collecter responsables
        for (let i = 1; i <= responsableCount; i++) {
            const lienParente = document.getElementById(
                `lien_parente_${i}`
            ).value;
            formData.responsables.push({
                civilite: document.getElementById(`civilite_${i}`).value,
                nom: document.getElementById(`nom_responsable_${i}`).value,
                prenom: document.getElementById(`prenom_responsable_${i}`)
                    .value,
                lien_parente:
                    lienParente === "Autre"
                        ? document.getElementById(`lien_autre_${i}`).value
                        : lienParente,
                email: document.getElementById(`email_responsable_${i}`).value,
                telephone: document.getElementById(`tel_responsable_${i}`)
                    .value,
                adresse: document.getElementById(`adresse_responsable_${i}`)
                    .value,
                profession: document.getElementById(`profession_${i}`).value,
            });
        }

        // ------------------------------
        // Validation avant envoi
        // ------------------------------
        const erreurs = validerFormulaire(formData);
        if (erreurs.length > 0) {
            alert("Veuillez corriger les erreurs :\n- " + erreurs.join("\n- "));
            return;
        }

        // ------------------------------
        // Envoi à Laravel
        // ------------------------------
        fetch("/api/preinscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        })
            .then((res) => {
                if (!res.ok) {
                    return res.text().then((text) => {
                        throw new Error(`Erreur HTTP: ${res.status} - ${text}`);
                    });
                }
                return res.json();
            })
            .then((data) => {
                console.log("✅ Préinscription créée:", data);

                // Afficher le modal
                const modal = document.getElementById("modal-confirmation");
                modal.classList.remove("hidden");
                modal.style.display = "flex";

                // Réinitialiser le formulaire
                document.getElementById("form-preinscription").reset();
            })
            .catch((err) => {
                console.error("Erreur détaillée:", err);
                alert(`Erreur lors de l'envoi du formulaire: ${err.message}`);
            });
    });

document.getElementById("modal-confirmation").addEventListener("click", (e) => {
    if (e.target.id === "modal-confirmation") {
        document.getElementById("modal-confirmation").classList.add("hidden");
        window.location.href = "/index";
    }
});
