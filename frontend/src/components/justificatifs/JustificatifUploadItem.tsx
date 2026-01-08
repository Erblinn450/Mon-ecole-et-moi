import { useState } from "react";
import { Upload, CheckCircle, XCircle, Loader2, FileText, AlertCircle } from "lucide-react";

interface JustificatifUploadItemProps {
    typeId: number;
    nom: string;
    description: string;
    statut: "MANQUANT" | "EN_ATTENTE" | "VALIDE" | "REFUSE";
    fichierUrl?: string; // Si déjà uploadé
    enfantId: number;
    onUploadSuccess: () => void;
}

export function JustificatifUploadItem({
    typeId,
    nom,
    description,
    statut,
    fichierUrl,
    enfantId,
    onUploadSuccess,
}: JustificatifUploadItemProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation taille (max 5Mo)
        if (file.size > 5 * 1024 * 1024) {
            setError("Le fichier est trop volumineux (max 5Mo)");
            return;
        }

        // Validation type
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            setError("Format non supporté (PDF, JPG, PNG uniquement)");
            return;
        }

        setIsUploading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("enfantId", enfantId.toString());
            formData.append("typeId", typeId.toString());

            const token = localStorage.getItem("auth_token");
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

            const response = await fetch(`${API_URL}/justificatifs/upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Erreur lors de l'envoi du fichier");
            }

            onUploadSuccess();
        } catch (err) {
            setError("Erreur lors de l'envoi. Veuillez réessayer.");
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 transition-all hover:shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Icone + Infos */}
                <div className="flex-1 flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${statut === "VALIDE" ? "bg-emerald-100 text-emerald-600" :
                            statut === "EN_ATTENTE" ? "bg-amber-100 text-amber-600" :
                                statut === "REFUSE" ? "bg-rose-100 text-rose-600" :
                                    "bg-gray-100 text-gray-500"
                        }`}>
                        <FileText size={20} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900">{nom}</h4>
                        <p className="text-sm text-gray-500">{description}</p>
                        {error && (
                            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                                <AlertCircle size={12} /> {error}
                            </p>
                        )}
                    </div>
                </div>

                {/* Action / Statut */}
                <div className="flex-shrink-0 min-w-[140px] flex justify-end">
                    {isUploading ? (
                        <div className="flex items-center gap-2 text-indigo-600 px-4 py-2 bg-indigo-50 rounded-lg text-sm font-medium">
                            <Loader2 size={16} className="animate-spin" />
                            Envoi...
                        </div>
                    ) : statut === "VALIDE" ? (
                        <div className="flex items-center gap-2 text-emerald-700 px-3 py-1.5 bg-emerald-50 rounded-lg text-sm font-medium border border-emerald-100">
                            <CheckCircle size={16} />
                            Validé
                        </div>
                    ) : statut === "EN_ATTENTE" ? (
                        <div className="flex items-center gap-2 text-amber-700 px-3 py-1.5 bg-amber-50 rounded-lg text-sm font-medium border border-amber-100">
                            <Loader2 size={16} />
                            En examen
                        </div>
                    ) : (
                        <div className="relative">
                            <input
                                type="file"
                                id={`file-${typeId}`}
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                disabled={isUploading}
                            />
                            <label
                                htmlFor={`file-${typeId}`}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${statut === "REFUSE"
                                        ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                                        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                                    }`}
                            >
                                <Upload size={16} />
                                {statut === "REFUSE" ? "Renvoyer" : "Ajouter"}
                            </label>
                        </div>
                    )}
                </div>
            </div>

            {statut === "REFUSE" && (
                <div className="mt-3 text-sm text-rose-600 bg-rose-50 p-3 rounded-lg flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5" />
                    <span>Ce document a été refusé. Veuillez en fournir une nouvelle version valide.</span>
                </div>
            )}
        </div>
    );
}
