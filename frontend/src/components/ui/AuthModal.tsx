"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Mail,
    Lock,
    LogIn,
    Loader2,
    AlertCircle,
    ArrowRight,
    KeyRound,
    CheckCircle,
    ArrowLeft
} from "lucide-react";
import { authApi } from "@/lib/api";
import { Role } from "@/types";
import { useRouter } from "next/navigation";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: "login" | "forgot";
}

type TabType = "login" | "forgot" | "forgot-success";

export function AuthModal({ isOpen, onClose, initialTab = "login" }: AuthModalProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>(initialTab);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Login form
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Forgot password form
    const [forgotEmail, setForgotEmail] = useState("");

    // Reset on open/close
    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
            setError("");
            setEmail("");
            setPassword("");
            setForgotEmail("");
        }
    }, [isOpen, initialTab]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await authApi.login({ email, password });

            localStorage.setItem("auth_token", response.access_token);
            localStorage.setItem("user", JSON.stringify(response.user));
            localStorage.setItem("user_name", response.user.name || "");
            localStorage.setItem("user_email", response.user.email);
            sessionStorage.setItem("parent_logged", "true");

            onClose();

            // Check first login
            if (response.user.premiereConnexion) {
                router.push("/changer-mot-de-passe");
                return;
            }

            // Redirect based on role
            if (response.user.role === Role.ADMIN) {
                router.push("/admin/dashboard");
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Identifiants incorrects");
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/auth/forgot-password`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: forgotEmail }),
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Une erreur est survenue");
            }

            setActiveTab("forgot-success");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.3 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div
                            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-6 text-center">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                                >
                                    <X size={18} />
                                </button>

                                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/20 flex items-center justify-center">
                                    {activeTab === "login" && <LogIn size={24} className="text-white" />}
                                    {activeTab === "forgot" && <KeyRound size={24} className="text-white" />}
                                    {activeTab === "forgot-success" && <CheckCircle size={24} className="text-white" />}
                                </div>

                                <h2 className="text-xl font-bold text-white">
                                    {activeTab === "login" && "Connexion"}
                                    {activeTab === "forgot" && "Mot de passe oublié"}
                                    {activeTab === "forgot-success" && "Email envoyé !"}
                                </h2>
                                <p className="text-emerald-100 text-sm mt-1">
                                    {activeTab === "login" && "Accédez à votre espace personnel"}
                                    {activeTab === "forgot" && "Réinitialisez votre mot de passe"}
                                    {activeTab === "forgot-success" && "Vérifiez votre boîte mail"}
                                </p>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {error && (
                                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2">
                                        <AlertCircle className="text-rose-500 flex-shrink-0" size={18} />
                                        <p className="text-sm text-rose-700">{error}</p>
                                    </div>
                                )}

                                {/* Login Tab */}
                                {activeTab === "login" && (
                                    <form onSubmit={handleLogin} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Email
                                            </label>
                                            <div className="relative">
                                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="votre@email.fr"
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Mot de passe
                                            </label>
                                            <div className="relative">
                                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="password"
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    Connexion...
                                                </>
                                            ) : (
                                                <>
                                                    <LogIn size={18} />
                                                    Se connecter
                                                </>
                                            )}
                                        </button>

                                        <div className="text-center">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab("forgot")}
                                                className="text-sm text-emerald-600 hover:text-emerald-700"
                                            >
                                                Mot de passe oublié ?
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Forgot Password Tab - Simple Contact Message */}
                                {activeTab === "forgot" && (
                                    <div className="text-center py-4">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                                            <KeyRound size={32} className="text-amber-600" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Mot de passe oublié ?</h3>
                                        <p className="text-gray-600 mb-4">
                                            Contactez l&apos;administration de l&apos;école pour réinitialiser votre mot de passe :
                                        </p>
                                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                            <p className="font-medium text-gray-900">contact@monecole.fr</p>
                                            <p className="text-sm text-gray-500">ou par téléphone au 03 89 XX XX XX</p>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab("login")}
                                            className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center justify-center gap-1 mx-auto"
                                        >
                                            <ArrowLeft size={16} />
                                            Retour à la connexion
                                        </button>
                                    </div>
                                )}
                                {/* Forgot Password Success */}
                                {activeTab === "forgot-success" && (
                                    <div className="text-center py-4">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                                            <CheckCircle size={32} className="text-emerald-600" />
                                        </div>
                                        <p className="text-gray-600 mb-4">
                                            Si un compte est associé à <strong>{forgotEmail}</strong>, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
                                        </p>
                                        <button
                                            onClick={() => setActiveTab("login")}
                                            className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center justify-center gap-1 mx-auto"
                                        >
                                            <ArrowLeft size={16} />
                                            Retour à la connexion
                                        </button>
                                    </div>
                                )}

                                {/* Preinscription Link */}
                                {activeTab === "login" && (
                                    <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                                        <p className="text-gray-600 text-sm">
                                            Pas encore de compte ?{" "}
                                            <Link
                                                href="/preinscription"
                                                onClick={onClose}
                                                className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
                                            >
                                                Préinscrire un enfant
                                                <ArrowRight size={14} />
                                            </Link>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
