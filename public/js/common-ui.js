// common-ui.js - Fonctions UI communes à toutes les pages

/**
 * Initialise le bouton de déconnexion
 * À appeler sur toutes les pages avec un bouton de déconnexion
 */
function initDeconnexion() {
  const btnDeconnexion = document.getElementById("btn-deconnexion");
  if (btnDeconnexion) {
    btnDeconnexion.addEventListener("click", function (e) {
      e.preventDefault();
      sessionStorage.clear();
      localStorage.removeItem("parent_email");
      window.location.href = "/login";
    });
  }
}

/**
 * Initialise les modaux avec gestion du clic en dehors
 * @param {string} modalId - L'ID du modal
 * @param {Function} onClose - Fonction à appeler lors de la fermeture
 */
function initModal(modalId, onClose) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      if (onClose) {
        onClose();
      } else {
        modal.classList.remove("show");
        modal.classList.add("hidden");
      }
    }
  });
}

// Exporter les fonctions pour réutilisation
if (typeof module !== "undefined" && module.exports) {
  module.exports = { initDeconnexion, initModal };
}
