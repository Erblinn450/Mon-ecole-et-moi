// Gestion de la connexion parent avec API Laravel

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("form-login-parent");

    if (!form) {
        console.error("Formulaire de connexion parent non trouvé");
    } else {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const btnLogin = form.querySelector('button[type="submit"]');

            // Désactiver le bouton pendant la requête
            if (btnLogin) {
                btnLogin.disabled = true;
                btnLogin.textContent = "Connexion en cours...";
            }

            try {
                console.log("Avant fetch API");
                // Appeler l'API de connexion parents (MON-144)
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
                    // Connexion réussie
                    localStorage.setItem("auth_token", data.token);
                    localStorage.setItem("user_name", data.user.name);
                    localStorage.setItem("user_email", data.user.email);
                    localStorage.setItem("user_role", data.user.role);

                    sessionStorage.setItem("parent_logged", "true");
                    sessionStorage.setItem("parent_email", email);

                    // Vérifier si c'est la première connexion
                    if (
                        data.premiere_connexion == 1 ||
                        data.premiere_connexion === true
                    ) {
                        showWarning(
                            `Bienvenue ${data.user.name} ! Pour des raisons de sécurité, vous devez changer votre mot de passe.`,
                            6000
                        );
                        setTimeout(() => {
                            window.location.href = "/changement-mot-de-passe";
                        }, 1000);
                    } else {
                        window.location.href = "/dashboard-parent";
                    }
                } else {
                    // Erreur de connexion
                    showError(
                        data.message ||
                            "Identifiants incorrects. Vérifiez votre email et mot de passe."
                    );
                }
            } catch (error) {
                console.error("Erreur de connexion:", error);
                showError(
                    "Erreur de connexion au serveur. Vérifiez que le backend est démarré."
                );
            } finally {
                // Réactiver le bouton
                if (btnLogin) {
                    btnLogin.disabled = false;
                    btnLogin.textContent = "Se connecter";
                }
            }
        });
    }
});

