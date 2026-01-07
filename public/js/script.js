// Fonctions utilitaires communes

// Validation email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validation téléphone
function validatePhone(phone) {
  const re = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return re.test(phone);
}

// Afficher un message
function showMessage(message, type = "info") {
  const alertClass = `alert-${type}`;
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert ${alertClass}`;
  alertDiv.textContent = message;

  const main = document.querySelector(".main");
  main.insertBefore(alertDiv, main.firstChild);

  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Export pour utilisation dans d'autres fichiers
if (typeof module !== "undefined" && module.exports) {
  module.exports = { validateEmail, validatePhone, showMessage };
}
