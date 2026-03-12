"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi, usersApi } from "@/lib/api";
import {
  User as UserIcon,
  Save,
  Download,
  Trash2,
  AlertTriangle,
  Check,
  Loader2,
  Shield,
  KeyRound,
} from "lucide-react";
import Link from "next/link";

export default function MonComptePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const profile = await authApi.getProfile();
      setForm({
        nom: profile.nom || "",
        prenom: profile.prenom || "",
        email: profile.email || "",
        telephone: profile.telephone || "",
        adresse: profile.adresse || "",
      });
    } catch {
      setMessage({ type: "error", text: "Impossible de charger votre profil" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await usersApi.updateMyProfile(form);
      setMessage({ type: "success", text: "Profil mis à jour avec succès" });
    } catch (err: unknown) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur lors de la mise à jour" });
    } finally {
      setSaving(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    setMessage(null);
    try {
      await usersApi.exportMesDonnees();
      setMessage({ type: "success", text: "Vos données ont été téléchargées" });
    } catch {
      setMessage({ type: "error", text: "Erreur lors de l'export" });
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (!deletePassword) return;
    setDeleting(true);
    setMessage(null);
    try {
      await usersApi.deleteMyAccount(deletePassword);
      localStorage.clear();
      router.push("/connexion?deleted=1");
    } catch (err: unknown) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur lors de la suppression" });
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon compte</h1>
        <p className="text-gray-500 mt-1">Gérez vos informations personnelles et vos droits RGPD</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {message.type === "success" ? <Check size={18} /> : <AlertTriangle size={18} />}
          {message.text}
        </div>
      )}

      {/* Formulaire profil */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <UserIcon size={20} className="text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                type="text"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                type="tel"
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0612345678"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input
              type="text"
              value={form.adresse}
              onChange={(e) => setForm({ ...form, adresse: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="12 rue des Lilas, 68000 Colmar"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Enregistrer
            </button>
            <Link
              href="/changer-mot-de-passe"
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              <KeyRound size={18} />
              Changer mon mot de passe
            </Link>
          </div>
        </form>
      </section>

      {/* Droits RGPD */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Shield size={20} className="text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Mes droits RGPD</h2>
        </div>

        <div className="space-y-4">
          {/* Export données */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div>
              <h3 className="font-medium text-gray-900">Droit d&apos;accès (Article 15)</h3>
              <p className="text-sm text-gray-600 mt-1">
                Téléchargez toutes vos données personnelles au format JSON
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              Télécharger
            </button>
          </div>

          {/* Liens vers pages légales */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <h3 className="font-medium text-gray-900">Informations légales</h3>
              <p className="text-sm text-gray-600 mt-1">
                Consultez nos engagements en matière de protection des données
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/politique-confidentialite"
                target="_blank"
                className="px-3 py-2 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Confidentialité
              </Link>
              <Link
                href="/rgpd"
                target="_blank"
                className="px-3 py-2 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Droits RGPD
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Suppression de compte */}
      <section className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <Trash2 size={20} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Supprimer mon compte</h2>
            <p className="text-sm text-gray-500">Droit à l&apos;effacement (Article 17 RGPD)</p>
          </div>
        </div>

        {!showDeleteConfirm ? (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              La suppression de votre compte est définitive. Toutes vos données personnelles,
              les informations de vos enfants et vos documents seront supprimés de manière irréversible.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 border border-red-300 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors"
            >
              <Trash2 size={18} />
              Je souhaite supprimer mon compte
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-semibold mb-1">Attention : cette action est irréversible</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>Votre compte et vos identifiants seront supprimés</li>
                    <li>Les données de vos enfants seront effacées</li>
                    <li>Vos documents uploadés seront supprimés du serveur</li>
                    <li>Vos factures seront supprimées</li>
                  </ul>
                  <p className="mt-2">
                    <strong>Note :</strong> Certaines données comptables pourront être conservées
                    pendant 10 ans conformément aux obligations légales.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmez avec votre mot de passe
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Votre mot de passe actuel"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting || !deletePassword}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                Supprimer définitivement
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); }}
                className="px-5 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
