"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { site } from "../../../../site.config";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: authError } = await supabaseBrowser().auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setError("Identifiants incorrects.");
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="wrap flex min-h-[70vh] items-center justify-center py-16">
      <div className="card w-full max-w-sm p-8">
        <LockKeyhole className="h-8 w-8 text-primary" aria-hidden />
        <h1 className="font-display mt-4 text-xl font-bold text-ink">
          Espace propriétaire
        </h1>
        <p className="mt-1 text-[13.5px] text-ink/60">
          Dashboard {site.brandName} — accès réservé.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="admin-email" className="label">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="label">
              Mot de passe
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
            />
          </div>
          {error && (
            <p role="alert" className="text-[13.5px] font-medium text-red-600">
              {error}
            </p>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading && <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden />}
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
