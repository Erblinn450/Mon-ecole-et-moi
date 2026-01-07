// Gestion de la connexion administrateur

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("form-login-admin");

    if (!form) {
        console.error("Formulaire de connexion admin non trouvé");
        return;
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        try {
            // Appel à l'API de connexion
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.ok && data.token) {
                // Connexion réussie
                sessionStorage.setItem("admin_logged", "true");
                sessionStorage.setItem("admin_email", email);
                localStorage.setItem("auth_token", data.token);

                // Redirection vers la page des rapports (page d'accueil par défaut)
                window.location.href = "/admin-rapports-repas";
            } else {
                // Erreur de connexion
                alert(
                    "❌ Identifiants incorrects !\n\nVérifiez votre email et mot de passe."
                );
            }
        } catch (error) {
            console.error("Erreur lors de la connexion :", error);
            alert("❌ Erreur de connexion. Veuillez réessayer.");
        }
    });
});
