import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BackLink } from "@/components/BackLink";
import { displayName } from "@/lib/display-name";

export const Route = createFileRoute("/compte")({
  head: () => ({
    meta: [
      { title: "Mon compte · ENSTP Go" },
      { name: "description", content: "Consultez et modifiez votre nom, email, année d’étude et spécialité sur ENSTP Go." },
      { property: "og:title", content: "Mon compte · ENSTP Go" },
      { property: "og:description", content: "Gérez votre profil étudiant ENSTP Go." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Compte,
});

const inputCls =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary";

const L = {
  fr: { t: "Mon compte", fn: "Prénom", ln: "Nom", em: "Email", yr: "Année d’étude", sp: "Spécialité", ch: "Choisir…", y: ["1ère année (Prépa)", "2ème année (Prépa)", "3ème année", "4ème année", "5ème année"], dib: "DIB – Infrastructures et Bâtiment", dms: "DMS – Matériaux et Structures", save: "Enregistrer", saving: "Enregistrement…" },
  en: { t: "My Account", fn: "First name", ln: "Last name", em: "Email", yr: "Year of study", sp: "Specialty", ch: "Choose…", y: ["1st year (Prep)", "2nd year (Prep)", "3rd year", "4th year", "5th year"], dib: "DIB – Infrastructure & Building", dms: "DMS – Materials & Structures", save: "Save", saving: "Saving…" },
  ar: { t: "حسابي", fn: "الاسم", ln: "اللقب", em: "البريد الإلكتروني", yr: "سنة الدراسة", sp: "التخصص", ch: "اختر…", y: ["السنة الأولى (تحضيري)", "السنة الثانية (تحضيري)", "السنة الثالثة", "السنة الرابعة", "السنة الخامسة"], dib: "DIB – المنشآت والبناء", dms: "DMS – المواد والهياكل", save: "حفظ", saving: "جارٍ الحفظ…" },
};

function Compte() {
  const [lang, setLang] = useState<"fr" | "en" | "ar">("fr");
  useEffect(() => { try { const v = localStorage.getItem("enstp-go-lang"); if (v === "en" || v === "ar") setLang(v); } catch { /* ignore */ } }, []);
  const t = L[lang];
  const [uid, setUid] = useState<string | null | undefined>(undefined);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [year, setYear] = useState(0);
  const [spec, setSpec] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user;
      setUid(u?.id ?? null);
      if (!u) return;
      setEmail(u.email ?? "");
      const { data: p } = await supabase
        .from("profiles")
        .select("first_name,last_name,academic_year,specialty")
        .eq("id", u.id)
        .maybeSingle();
      if (p) {
        setFirst(p.first_name);
        setLast(p.last_name);
        setYear(p.academic_year ?? 0);
        setSpec(p.specialty ?? "");
      }
    });
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!uid || busy) return;
    const f = first.trim(), l = last.trim(), em = email.trim().toLowerCase();
    if (!f || !l) return setMsg("Nom et prénom requis.");
    if (year < 1 || year > 5) return setMsg("Choisissez votre année.");
    if (year > 2 && spec !== "DIB" && spec !== "DMS") return setMsg("Choisissez votre spécialité.");
    setBusy(true);
    setMsg("");
    const { error } = await supabase
      .from("profiles")
      .update({ first_name: f.slice(0, 60), last_name: l.slice(0, 60), academic_year: year, specialty: year > 2 ? spec : null })
      .eq("id", uid);
    let note = error ? `Erreur : ${error.message}` : "Profil enregistré ✅";
    if (!error) {
      const { data } = await supabase.auth.getUser();
      if (em && em !== data.user?.email) {
        const r = await supabase.auth.updateUser({ email: em }, { emailRedirectTo: window.location.origin });
        note = r.error
          ? `Profil enregistré, mais l’email n’a pas pu être changé : ${r.error.message}`
          : "Profil enregistré. Confirmez votre nouvel email via le lien reçu.";
      }
    }
    setBusy(false);
    setMsg(note);
  }

  if (uid === undefined) return <main className="p-8 text-sm text-muted-foreground">Chargement…</main>;
  if (uid === null)
    return (
      <main className="grid min-h-screen place-items-center bg-background p-6 text-center">
        <div>
          <p className="font-semibold">Connectez-vous pour voir votre compte.</p>
          <Link to="/" className="mt-3 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Se connecter</Link>
        </div>
      </main>
    );

  return (
    <main lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-background px-4 pb-20 pt-8 text-foreground">
      <div className="mx-auto max-w-xl space-y-6">
        <BackLink />
        <header className="rounded-3xl bg-primary p-6 text-primary-foreground">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">{t.t}</p>
          <h1 className="mt-1 text-2xl font-extrabold">
            {displayName({ first_name: first, last_name: last, academic_year: year || null, specialty: spec || null }, "Étudiant")}
          </h1>
        </header>
        <form onSubmit={save} className="grid gap-4 rounded-2xl border border-border bg-card p-6" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-sm font-semibold">{t.fn}<input className={inputCls} value={first} maxLength={60} onChange={(e) => setFirst(e.target.value)} /></label>
            <label className="grid gap-1.5 text-sm font-semibold">{t.ln}<input className={inputCls} value={last} maxLength={60} onChange={(e) => setLast(e.target.value)} /></label>
          </div>
          <label className="grid gap-1.5 text-sm font-semibold">{t.em}<input className={inputCls} type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-sm font-semibold">{t.yr}
              <select className={inputCls} value={year} onChange={(e) => setYear(Number(e.target.value))}>
                <option value={0}>{t.ch}</option>
                <option value={1}>{t.y[0]}</option>
                <option value={2}>{t.y[1]}</option>
                <option value={3}>{t.y[2]}</option>
                <option value={4}>{t.y[3]}</option>
                <option value={5}>{t.y[4]}</option>
              </select>
            </label>
            {year > 2 && (
              <label className="grid gap-1.5 text-sm font-semibold">{t.sp}
                <select className={inputCls} value={spec} onChange={(e) => setSpec(e.target.value)}>
                  <option value="">{t.ch}</option>
                  <option value="DIB">{t.dib}</option>
                  <option value="DMS">{t.dms}</option>
                </select>
              </label>
            )}
          </div>
          <button disabled={busy} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {busy ? t.saving : t.save}
          </button>
          {msg && <p role="status" className="text-sm font-medium text-primary">{msg}</p>}
        </form>
      </div>
    </main>
  );
}
