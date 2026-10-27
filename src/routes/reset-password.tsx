import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe · ENSTP Go" },
      { name: "description", content: "Choisissez un nouveau mot de passe pour votre compte ENSTP Go." },
      { property: "og:title", content: "Nouveau mot de passe · ENSTP Go" },
      { property: "og:description", content: "Réinitialisez le mot de passe de votre compte ENSTP Go." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((e) => {
      if (e === "PASSWORD_RECOVERY" || e === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data: s }) => s.session && setReady(true));
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    if (pw.length < 8) return setErr("Au moins 8 caractères.");
    if (pw !== pw2) return setErr("Les mots de passe ne correspondent pas.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setErr("Impossible de changer le mot de passe. Le lien a peut-être expiré.");
    setDone(true);
  }

  const input = "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary";
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/60 px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl">
        <h1 className="text-2xl font-extrabold">Nouveau mot de passe</h1>
        {done ? (
          <>
            <p className="mt-3 text-sm text-primary">Mot de passe mis à jour ✔</p>
            <Link to="/" className="mt-6 block rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground">
              Accéder au guide
            </Link>
          </>
        ) : !ready ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Ouvrez cette page depuis le lien reçu par email. <Link to="/" className="text-primary underline">Retour</Link>
          </p>
        ) : (
          <form onSubmit={submit} className="mt-5 grid gap-4" noValidate>
            <input className={input} type="password" placeholder="Nouveau mot de passe" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
            <input className={input} type="password" placeholder="Confirmer" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
            <button disabled={busy} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              Enregistrer
            </button>
            {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
          </form>
        )}
      </div>
    </main>
  );
}
