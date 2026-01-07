// Configuration API
const API_URL = "http://localhost:8000/api";

// Vérifier si déjà connecté
const token = localStorage.getItem("auth_token");
if (token) {
  // Rediriger vers la page d'administration
  window.location.href = "preinscriptions.html";
}

// Gérer la soumission du formulaire
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const btnLogin = document.getElementById("btn-login");
  const errorMessage = document.getElementById("error-message");

  // Cacher les messages d'erreur précédents
  errorMessage.classList.add("hidden");

  // Désactiver le bouton pendant la requête
  btnLogin.disabled = true;
  btnLogin.textContent = "Connexion en cours...";

  try {
    // Appeler l'API de login
    const response = await fetch(`${API_URL}/parents/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Succès - Sauvegarder le token
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user_name", data.user.name);
      localStorage.setItem("user_email", data.user.email);

      // Afficher un message de succès
      alert("✅ Connexion réussie ! Bienvenue " + data.user.name);

      // Rediriger vers la page d'administration
      window.location.href = "preinscriptions.html";
    } else {
      // Erreur - Afficher le message
      errorMessage.textContent =
        "❌ " + (data.message || "Email ou mot de passe incorrect");
      errorMessage.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Erreur:", error);
    errorMessage.textContent =
      "❌ Erreur de connexion au serveur. Vérifiez que le backend est démarré.";
    errorMessage.classList.remove("hidden");
  } finally {
    // Réactiver le bouton
    btnLogin.disabled = false;
    btnLogin.textContent = "Se connecter";
  }
});
