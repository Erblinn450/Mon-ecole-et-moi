// Système de notifications toast moderne

/**
 * Affiche une notification toast
 * @param {string} message - Le message à afficher
 * @param {string} type - Type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Durée en ms (0 = permanent)
 */
function showToast(message, type = "info", duration = 5000) {
    // Créer le conteneur s'il n'existe pas
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    // Créer la notification
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    // Icône selon le type
    const icons = {
        success: "✓",
        error: "✕",
        warning: "⚠",
        info: "ℹ",
    };

    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    // Ajouter au conteneur
    container.appendChild(toast);

    // Animation d'entrée
    setTimeout(() => toast.classList.add("toast-show"), 10);

    // Fermeture automatique
    if (duration > 0) {
        setTimeout(() => {
            toast.classList.remove("toast-show");
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    return toast;
}

// Raccourcis pour chaque type
function showSuccess(message, duration = 5000) {
    return showToast(message, "success", duration);
}

function showError(message, duration = 7000) {
    return showToast(message, "error", duration);
}

function showWarning(message, duration = 6000) {
    return showToast(message, "warning", duration);
}

function showInfo(message, duration = 5000) {
    return showToast(message, "info", duration);
}

/**
 * Affiche un dialogue de confirmation moderne
 * @param {string} message - Le message de confirmation
 * @param {string} title - Titre du dialogue (optionnel)
 * @returns {Promise<boolean>} - true si confirmé, false si annulé
 */
function showConfirm(message, title = "Confirmation") {
    return new Promise((resolve) => {
        // Créer l'overlay
        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";

        // Créer le dialogue
        const dialog = document.createElement("div");
        dialog.className = "modal-dialog";
        dialog.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary modal-cancel">Annuler</button>
                <button class="btn-primary modal-confirm">Confirmer</button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // Animation d'entrée
        setTimeout(() => {
            overlay.classList.add("modal-show");
            dialog.classList.add("modal-show");
        }, 10);

        // Fonction pour fermer le dialogue
        const close = (result) => {
            overlay.classList.remove("modal-show");
            dialog.classList.remove("modal-show");
            setTimeout(() => overlay.remove(), 300);
            resolve(result);
        };

        // Gestionnaires d'événements
        dialog.querySelector(".modal-cancel").onclick = () => close(false);
        dialog.querySelector(".modal-confirm").onclick = () => close(true);
        overlay.onclick = (e) => {
            if (e.target === overlay) close(false);
        };
    });
}

/**
 * Affiche un dialogue de saisie (prompt)
 * @param {string} message - Le message du dialogue
 * @param {string} title - Titre du dialogue
 * @param {string} placeholder - Placeholder du champ
 * @returns {Promise<string|null>} - La valeur saisie ou null si annulé
 */
function showPrompt(message, title = "Saisie", placeholder = "") {
    return new Promise((resolve) => {
        // Créer l'overlay
        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";

        // Créer le dialogue
        const dialog = document.createElement("div");
        dialog.className = "modal-dialog";
        dialog.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
            </div>
            <div class="modal-body">
                <p>${message}</p>
                <textarea class="modal-input" placeholder="${placeholder}" rows="3"></textarea>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary modal-cancel">Annuler</button>
                <button class="btn-primary modal-confirm">Valider</button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        const input = dialog.querySelector(".modal-input");

        // Animation d'entrée et focus
        setTimeout(() => {
            overlay.classList.add("modal-show");
            dialog.classList.add("modal-show");
            input.focus();
        }, 10);

        // Fonction pour fermer le dialogue
        const close = (result) => {
            overlay.classList.remove("modal-show");
            dialog.classList.remove("modal-show");
            setTimeout(() => overlay.remove(), 300);
            resolve(result);
        };

        // Gestionnaires d'événements
        dialog.querySelector(".modal-cancel").onclick = () => close(null);
        dialog.querySelector(".modal-confirm").onclick = () =>
            close(input.value);
        overlay.onclick = (e) => {
            if (e.target === overlay) close(null);
        };
    });
}
