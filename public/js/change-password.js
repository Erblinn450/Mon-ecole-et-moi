// Gestion du changement de mot de passe obligatoire

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("form-change-password");

    if (!form) {
        console.error("Formulaire de changement de mot de passe non trouvé");
        return;
    }

    // Vérifier que l'utilisateur est connecté
    const authToken = localStorage.getItem("auth_token");
    if (!authToken) {
        showError("Vous devez être connecté pour changer votre mot de passe.");
        setTimeout(() => {
            window.location.href = "/connexion";
        }, 1000);
        return;
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const currentPassword =
            document.getElementById("current_password").value;
        const newPassword = document.getElementById("new_password").value;
        const newPasswordConfirmation = document.getElementById(
            "new_password_confirmation"
        ).value;
        const btnSubmit = form.querySelector('button[type="submit"]');

        // Validation côté client
        if (newPassword.length < 8) {
            showWarning(
                "Le nouveau mot de passe doit contenir au moins 8 caractères."
            );
            return;
        }

        if (newPassword !== newPasswordConfirmation) {
            showWarning("Les deux mots de passe ne correspondent pas.");
            return;
        }

        if (currentPassword === newPassword) {
            showWarning(
                "Le nouveau mot de passe doit être différent de l'ancien."
            );
            return;
        }

        // Désactiver le bouton pendant la requête
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = "Changement en cours...";
        }

        try {
            const response = await fetch(`${API_URL}/parents/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                    new_password_confirmation: newPasswordConfirmation,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess(
                    "Mot de passe changé avec succès ! Redirection vers votre espace parent..."
                );

                // Redirection vers le dashboard parent
                setTimeout(() => {
                    window.location.href = "/dashboard-parent";
                }, 1500);
            } else {
                // Gérer les erreurs de validation
                let errorMessage = "Erreur lors du changement de mot de passe";

                if (data.errors) {
                    const errors = [];
                    if (data.errors.current_password) {
                        errors.push(data.errors.current_password[0]);
                    }
                    if (data.errors.new_password) {
                        errors.push(data.errors.new_password[0]);
                    }
                    if (errors.length > 0) {
                        errorMessage = errors.join("<br>");
                    }
                } else if (data.message) {
                    errorMessage = data.message;
                }

                showError(errorMessage);
            }
        } catch (error) {
            console.error("Erreur:", error);
            showError("Erreur de connexion au serveur. Veuillez réessayer.");
        } finally {
            // Réactiver le bouton
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = "Changer mon mot de passe";
            }
        }
    });
});
