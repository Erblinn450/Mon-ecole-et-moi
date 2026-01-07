// mes-dossiers.js - Gestion des dossiers (préinscriptions)
document.addEventListener("DOMContentLoaded", function () {
    chargerDossiers();
});

function deconnexion() {
    localStorage.removeItem("auth_token");
    window.location.href = "/connexion";
}

async function chargerDossiers() {
    const token = localStorage.getItem("auth_token");
    if (!token) {
        window.location.href = "/connexion";
        return;
    }

    const container = document.getElementById("dossiersContainer");
    const noDossiers = document.getElementById("noDossiers");

    try {
        const response = await fetch('/api/parents/dossiers', {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error("Erreur chargement dossiers");

        const dossiers = await response.json();

        container.innerHTML = ""; // Clear loading

        if (dossiers.length === 0) {
            container.classList.add("hidden");
            noDossiers.classList.remove("hidden");
            return;
        }

        container.classList.remove("hidden");
        noDossiers.classList.add("hidden");

        // Charger les statuts d'ouverture des PDFs et des signatures pour tous les dossiers
        const pdfStatuses = {};
        const signatureStatuses = {};
        
        for (const dossier of dossiers) {
            try {
                console.log(`🔍 Vérification PDF pour dossier ${dossier.id} (${dossier.prenom_enfant} ${dossier.nom_enfant})`);
                
                const statusResponse = await fetch(`/api/documents/reglement-ouvert/${dossier.id}`, {
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Accept': 'application/json'
                    }
                });
                
                const statusData = await statusResponse.json();
                console.log(`📊 Réponse pour dossier ${dossier.id}:`, statusData, 'Status HTTP:', statusResponse.status);
                
                if (statusResponse.ok) {
                    pdfStatuses[dossier.id] = statusData.opened || false;
                    console.log(`✅ PDF ouvert pour dossier ${dossier.id}:`, pdfStatuses[dossier.id]);
                } else {
                    pdfStatuses[dossier.id] = false;
                    console.warn(`⚠️ Erreur HTTP ${statusResponse.status} pour dossier ${dossier.id}`);
                }
            } catch (error) {
                console.error(`❌ Erreur vérification PDF pour dossier ${dossier.id}:`, error);
                pdfStatuses[dossier.id] = false;
            }
            
            // Charger le statut de signature (réglement accepté)
            try {
                const sigResponse = await fetch(`/api/signatures/enfant/${dossier.id}`, {
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Accept': 'application/json'
                    }
                });
                
                if (sigResponse.ok) {
                    const sigData = await sigResponse.json();
                    signatureStatuses[dossier.id] = sigData.reglement_accepte || false;
                    console.log(`📋 Réglement signé pour dossier ${dossier.id}:`, signatureStatuses[dossier.id]);
                } else {
                    signatureStatuses[dossier.id] = false;
                }
            } catch (error) {
                console.error(`❌ Erreur vérification signature pour dossier ${dossier.id}:`, error);
                signatureStatuses[dossier.id] = false;
            }
        }
        
        console.log('📋 Statuts finaux des PDFs:', pdfStatuses);

        dossiers.forEach(dossier => {
            // Formatage de la date
            const dateDemande = new Date(dossier.created_at).toLocaleDateString("fr-FR", {
                day: 'numeric', month: 'long', year: 'numeric'
            });

            // Statut avec badge et icône
            let badgeClass = "badge-info";
            let statusIcon = "⏳";
            let statusText = dossier.statut;
            let footerContent = '';

            if (dossier.statut === "Validé") {
                badgeClass = "badge-success";
                statusIcon = "✅";
                statusText = "Pré-inscription validée";

                // Déterminer l'état du bouton basé sur l'ouverture du PDF
                const pdfOuvert = pdfStatuses[dossier.id] || false;
                const buttonDisabled = pdfOuvert ? '' : 'disabled';
                const buttonCursor = pdfOuvert ? 'pointer' : 'not-allowed';
                const buttonOpacity = pdfOuvert ? '1' : '0.5';
                const buttonColor = pdfOuvert ? '#28a745' : '#ff9800';
                const buttonTitle = pdfOuvert ? 'Cliquez pour signer le réglement' : 'Veuillez d\'abord ouvrir le réglement';

                // Si validé, on invite à finaliser et affiche le réglement intérieur + signature
                footerContent = `
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <span class="info-text">Compte créé. Veuillez finaliser l'inscription.</span>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <button class="btn-secondary" style="padding: 8px 16px; font-size: 0.9em; text-decoration: none; display: inline-block; border-radius: 5px; background-color: #6c757d; color: white; border: none; cursor: pointer;" onclick="ouvrirReglementEtTracker('${dossier.id}')">
                                📄 Réglement
                            </button>
                            ${signatureStatuses[dossier.id] 
                                ? `<span style="padding: 8px 16px; font-size: 1.2em; font-weight: bold; color: #28a745;">✅ Réglement signé</span>`
                                : `<button id="btn-signer-${dossier.id}" class="btn-signature" data-enfant-id="${dossier.id}" style="padding: 8px 16px; font-size: 0.9em; background-color: ${buttonColor}; color: white; border: none; border-radius: 5px; cursor: ${buttonCursor}; opacity: ${buttonOpacity};" onclick="ouvrirModalSignature('${dossier.id}', '${dossier.prenom_enfant} ${dossier.nom_enfant}')" title="${buttonTitle}" ${buttonDisabled}>
                                ✍️ Signer le réglement
                            </button>`
                            }
                            <button class="btn-primary" style="padding: 8px 16px; font-size: 0.9em; border-radius: 5px;" onclick="finaliserDossier('${dossier.numero_dossier || dossier.id}')">
                                📂 Fournir docs
                            </button>
                        </div>
                    </div>
                `;
            } else if (dossier.statut === "Refusé") {
                badgeClass = "badge-danger";
                statusIcon = "❌";
                footerContent = '<span class="error-text">Dossier refusé. Veuillez contacter l\'administration pour plus de détails.</span>';
            } else if (dossier.statut === "En attente") {
                badgeClass = "badge-warning";
                statusIcon = "⏳";
                footerContent = '<span class="info-text">Votre dossier est en cours d\'étude par l\'administration.</span>';
            }

            const card = document.createElement("div");
            card.className = "dossier-card"; // Removed glass-card for simplicity

            card.innerHTML = `
                <div class="dossier-header">
                    <div style="display:flex; align-items:center;">
                        <div class="dossier-icon">📂</div>
                        <div class="dossier-info">
                            <h3>${dossier.prenom_enfant} ${dossier.nom_enfant}</h3>
                            <span class="dossier-ref">Ref: #${dossier.numero_dossier || dossier.id}</span>
                        </div>
                    </div>
                    <div class="dossier-status">
                         <span class="badge ${badgeClass}">${statusIcon} ${statusText}</span>
                    </div>
                </div>
                <div class="dossier-body">
                    <div class="info-row">
                        <span class="label">📅 Date de demande :</span>
                        <span class="value">${dateDemande}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">🏫 Classe souhaitée :</span>
                        <span class="value">${dossier.classe_souhaitee}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">🏫 Classe actuelle :</span>
                        <span class="value">${dossier.classe_actuelle || "Non scolarisé"}</span>
                    </div>
                </div>
                <div class="dossier-footer">
                     ${footerContent}
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = `<p class="error">Impossible de charger les dossiers: ${error.message}</p>`;
    }
}

function finaliserDossier(dossierId) {
    alert("Fonctionnalité d'upload des documents à venir pour le dossier " + dossierId);
    // TODO: Rediriger vers une page d'upload ou ouvrir un modal
}

// ===== FONCTIONS DE SIGNATURE =====

let signatureData = {
    enfantId: null,
    enfantName: null
};

async function ouvrirModalSignature(enfantIdOrPreinscriptionId, enfantName) {
    signatureData.enfantId = enfantIdOrPreinscriptionId;
    signatureData.enfantName = enfantName;
    
    // Définir le nom de l'enfant
    const enfantNameField = document.getElementById('enfantName');
    if (enfantNameField) {
        enfantNameField.value = enfantName;
    }
    
    const parentNameField = document.getElementById('parentName');
    if (parentNameField) {
        parentNameField.value = localStorage.getItem('user_name') || '';
    }

    // Vérifier le statut de signature existant
    const token = localStorage.getItem('auth_token');
    
    try {
        const status = await SignatureService.getSignatureStatus(enfantIdOrPreinscriptionId, token);
        
        // Réinitialiser le formulaire
        const parentAccepteField = document.getElementById('parentAccepte');
        const enfantAccepteField = document.getElementById('enfantAccepte');
        
        if (parentAccepteField) {
            parentAccepteField.checked = status.reglement_accepte || false;
        }
        if (enfantAccepteField) {
            enfantAccepteField.checked = status.reglement_accepte || false;
        }
    } catch (error) {
        console.warn('⚠️ Impossible de récupérer le statut de signature (normal pour une préinscription):', error.message);
        // Réinitialiser les checkboxes
        const parentAccepteField = document.getElementById('parentAccepte');
        const enfantAccepteField = document.getElementById('enfantAccepte');
        
        if (parentAccepteField) {
            parentAccepteField.checked = false;
        }
        if (enfantAccepteField) {
            enfantAccepteField.checked = false;
        }
    }

    // Afficher le modal
    const modal = document.getElementById('signatureModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('active');
    }
}

function fermerModalSignature() {
    const modal = document.getElementById('signatureModal');
    modal.classList.add('hidden');
    modal.classList.remove('active');
    
    // Réinitialiser
    document.getElementById('signatureForm').style.display = 'block';
    document.getElementById('signatureStatus').style.display = 'none';
    signatureData = { enfantId: null, enfantName: null };
}

async function signerParent() {
    const parentName = document.getElementById('parentName').value.trim();
    const isChecked = document.getElementById('parentAccepte').checked;

    if (!parentName) {
        alert('Veuillez entrer votre nom');
        return;
    }

    if (!isChecked) {
        alert('Veuillez confirmer que vous acceptez le réglement intérieur');
        return;
    }

    try {
        const token = localStorage.getItem('auth_token');
        const result = await SignatureService.parentAccepte(signatureData.enfantId, token);
        
        // Désactiver les champs et boutons du parent
        document.getElementById('parentName').disabled = true;
        document.getElementById('parentAccepte').disabled = true;
        document.getElementById('btnSignerParent').disabled = true;
        document.getElementById('btnSignerParent').style.opacity = '0.5';
        
        // Afficher le message de confirmation
        document.getElementById('parentSignedMessage').style.display = 'block';
        
        // Recharger les dossiers après 2 secondes
        setTimeout(() => {
            chargerDossiers();
        }, 2000);
    } catch (error) {
        alert('Erreur lors de la signature: ' + error.message);
    }
}

async function signerEnfant() {
    const isChecked = document.getElementById('enfantAccepte').checked;

    if (!isChecked) {
        alert('Veuillez confirmer que vous avez lu et compris le réglement intérieur');
        return;
    }

    try {
        const token = localStorage.getItem('auth_token');
        const result = await SignatureService.enfantAccepte(signatureData.enfantId, token);
        
        // Désactiver les champs et boutons de l'enfant
        document.getElementById('enfantAccepte').disabled = true;
        document.getElementById('btnSignerEnfant').disabled = true;
        document.getElementById('btnSignerEnfant').style.opacity = '0.5';
        
        // Afficher le message de confirmation
        document.getElementById('enfantSignedMessage').style.display = 'block';
        
        // Fermer le modal et recharger après 1.5 secondes
        setTimeout(() => {
            fermerModalSignature();
            chargerDossiers();
        }, 1500);
    } catch (error) {
        alert('Erreur lors de la signature: ' + error.message);
    }
}

// ===== PDF TRACKING FUNCTIONS =====

/**
 * Track PDF opening and enable signature button
 * ANCIENNE VERSION (à remplacer par ouvrirReglementEtTracker)
 */
async function trackerPdfOuvert(enfantId) {
    try {
        const token = localStorage.getItem('auth_token');
        console.log('Tentative de tracking PDF pour enfant:', enfantId);
        
        const result = await PdfService.reglementOuvert(enfantId, token);
        console.log('Résultat du tracking:', result);
        
        // Enable the signature button
        activerBoutonSignature(enfantId);
        
        console.log('✅ PDF ouverture tracée et bouton activé pour enfant:', enfantId);
    } catch (error) {
        console.error('❌ Erreur lors du tracking PDF:', error);
    }
}

/**
 * Ouvrir le réglement PDF ET enregistrer l'ouverture
 * Enregistre dans la BD AVANT d'ouvrir le PDF
 */
async function ouvrirReglementEtTracker(enfantId) {
    try {
        const token = localStorage.getItem('auth_token');
        console.log('🔄 Enregistrement de l\'ouverture du réglement pour enfant:', enfantId);
        
        // Appeler l'API pour enregistrer l'ouverture
        const result = await PdfService.reglementOuvert(enfantId, token);
        console.log('✅ Ouverture enregistrée:', result);
        
        // Activer le bouton immédiatement
        activerBoutonSignature(enfantId);
        
        // Ouvrir le PDF dans un nouvel onglet
        setTimeout(() => {
            window.open('/documents/reglement-interieur.pdf', '_blank');
            console.log('📄 PDF ouvert dans un nouvel onglet');
        }, 100);
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'enregistrement:', error);
        alert('Erreur: ' + (error.message || 'Impossible d\'ouvrir le réglement'));
    }
}

/**
 * Enable the signature button with visual feedback
 */
function activerBoutonSignature(enfantId) {
    const button = document.getElementById(`btn-signer-${enfantId}`);
    if (button) {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.backgroundColor = '#28a745'; // Green color
        button.style.cursor = 'pointer';
        button.title = 'Cliquez pour signer le réglement';
        
        console.log('Bouton signature activé pour enfant:', enfantId);
    }
}

/**
 * Disable the signature button
 */
function desactiverBoutonSignature(enfantId) {
    const button = document.getElementById(`btn-signer-${enfantId}`);
    if (button) {
        button.disabled = true;
        button.style.opacity = '0.5';
        button.style.backgroundColor = '#ff9800'; // Orange color
        button.style.cursor = 'not-allowed';
        button.title = 'Veuillez d\'abord ouvrir le réglement';
        
        console.log('Bouton signature désactivé pour enfant:', enfantId);
    }
}

/**
 * Check on page load if PDFs were already opened, enable buttons if needed
 */
async function verifierPdfsOuverts() {
    try {
        const token = localStorage.getItem('auth_token');
        
        // Get all signature buttons on page
        const buttons = document.querySelectorAll('[id^="btn-signer-"]');
        
        for (const button of buttons) {
            const enfantId = button.getAttribute('data-enfant-id');
            if (enfantId) {
                const status = await PdfService.reglementOuvertStatus(enfantId, token);
                
                if (status && status.opened) {
                    activerBoutonSignature(enfantId);
                } else {
                    desactiverBoutonSignature(enfantId);
                }
            }
        }
        
        console.log('Vérification des PDFs ouverts terminée');
    } catch (error) {
        console.error('Erreur lors de la vérification des PDFs:', error);
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', function() {
    verifierPdfsOuverts();
});

