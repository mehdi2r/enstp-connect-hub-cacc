import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BackLink } from "@/components/BackLink";
import { Assistant } from "@/components/LazyAssistant";
import { DetailedTimetable } from "@/components/DetailedTimetable";
import { GROUPS, PLACES, groupFor, routeBetween } from "@/lib/enstp-data";

export const Route = createFileRoute("/salles")({
  head: () => ({
    meta: [
      { title: "Où est ma salle ? · ENSTP Go" },
      { name: "description", content: "Votre emploi du temps selon votre année et spécialité, et l’itinéraire vers chaque salle de l’ENSTP." },
      { property: "og:title", content: "Où est ma salle ? · ENSTP Go" },
      { property: "og:description", content: "Emplois du temps et itinéraires sur le campus de l’ENSTP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Salles,
});

function Salles() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [group, setGroup] = useState("CP1");
  const [place, setPlace] = useState(PLACES[0]!.id);
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("entree");
  const [full, setFull] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setAuthed(!!data.user);
      if (!data.user) return;
      const { data: p } = await supabase.from("profiles").select("academic_year,specialty").eq("id", data.user.id).maybeSingle();
      if (p) setGroup(groupFor(p.academic_year, p.specialty));
    });
  }, []);

  const g = GROUPS.find((x) => x.id === group)!;
  const filtered = PLACES.filter((p) => (p.name + p.kind + p.zone).toLowerCase().includes(q.toLowerCase()));
  const sel = PLACES.find((p) => p.id === place)!;

  if (authed === false)
    return (
      <main className="grid min-h-screen place-items-center bg-background p-6 text-center">
        <div>
          <p className="font-semibold">Connectez-vous pour voir votre emploi du temps.</p>
          <Link to="/" className="mt-3 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Se connecter</Link>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen bg-background px-4 pb-28 pt-8 text-foreground">

      <div className="mx-auto max-w-6xl space-y-8"><BackLink />
        <header>
          <h1 className="text-3xl font-extrabold">Où est ma salle ?</h1>
          <p className="mt-1 text-sm text-muted-foreground">Votre emploi du temps du semestre 1 (2026/2027), choisi selon votre année et spécialité.</p>
        </header>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-semibold" htmlFor="grp">Groupe</label>
            <select id="grp" value={group} onChange={(e) => setGroup(e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm">
              {GROUPS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
            </select>
            <button onClick={() => setFull(true)} className="rounded-xl border border-border px-3 py-2 text-sm font-semibold">Plein écran</button>
            <a href={`${g.pdf}#page=${g.page}`} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-border px-3 py-2 text-sm font-semibold">Voir le PDF officiel (p. {g.page})</a>
            <a href={g.pdf} download className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">Télécharger le PDF</a>
          </div>
          <DetailedTimetable key={g.id} group={g.id} />
          <p className="mt-6 text-sm font-semibold">Emploi du temps officiel</p>
          <button onClick={() => setFull(true)} className="mt-2 block w-full overflow-hidden rounded-xl border border-border bg-muted" aria-label="Agrandir l’emploi du temps">
            <img key={g.id} src={g.img} alt={`Emploi du temps ${g.label}`} className="w-full" loading="lazy" decoding="async" />
          </button>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold">Tous les emplois du temps officiels</h2>
          {[
            { t: "Classes préparatoires (1ACP · 2ACP)", ids: ["CP1", "CP2"] },
            { t: "Département DIB (3ème · 4ème · 5ème année)", ids: ["DIB1", "DIB2", "DIB3"] },
            { t: "Département DMS (3ème · 4ème · 5ème année)", ids: ["DMS1", "DMS2", "DMS3"] },
          ].map((s) => (
            <div key={s.t}>
              <h3 className="mb-3 font-bold">{s.t}</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {GROUPS.filter((x) => s.ids.includes(x.id)).map((x) => (
                  <article key={x.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                    <button onClick={() => { setGroup(x.id); setFull(true); }} className="block aspect-[4/3] w-full overflow-hidden bg-muted" aria-label={`Agrandir ${x.label}`}>
                      <img src={x.img} alt={`Emploi du temps ${x.label}`} className="h-full w-full object-cover object-top" loading="lazy" decoding="async" />
                    </button>
                    <div className="space-y-2 p-3">
                      <p className="text-sm font-semibold">{x.label}</p>
                      <div className="flex flex-wrap gap-2">
                        <a href={`${x.pdf}#page=${x.page}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold">Voir le PDF (p. {x.page})</a>
                        <a href={x.pdf} download className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Télécharger</a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>
        {full && (
          <div className="fixed inset-0 z-[60] flex flex-col bg-hero-shade/95" role="dialog" aria-modal="true">
            <div className="flex items-center justify-between gap-3 p-3">
              <p className="text-sm font-semibold text-mint">{g.label}</p>
              <div className="flex gap-2">
                <button onClick={() => setZoom((z) => Math.max(1, z - 0.5))} className="rounded-lg bg-card px-3 py-1.5 text-sm font-bold">−</button>
                <button onClick={() => setZoom((z) => Math.min(4, z + 0.5))} className="rounded-lg bg-card px-3 py-1.5 text-sm font-bold">+</button>
                <a href={g.pdf} download className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">Télécharger</a>
                <button onClick={() => { setFull(false); setZoom(1); }} className="rounded-lg bg-card px-3 py-1.5 text-sm font-semibold">Fermer</button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-3">
              <img src={g.img} alt={`Emploi du temps ${g.label}`} style={{ width: `${zoom * 100}%`, maxWidth: "none" }} className="mx-auto rounded-lg" />
            </div>
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-[320px_1fr]">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="font-extrabold">Trouver un lieu</h2>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Amphi A, Salle 13, labo…" className="mt-3 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" />
            <ul className="mt-3 grid gap-1">
              {filtered.map((p) => (
                <li key={p.id}>
                  <button onClick={() => setPlace(p.id)} className={`w-full rounded-lg px-3 py-2 text-left text-sm ${p.id === place ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                    <span className="font-semibold">{p.name}</span> <span className="opacity-70">· {p.kind}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">{sel.zone}</p>
            <label className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold">
              Départ :
              <select value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl border border-input bg-background px-3 py-1.5 text-sm">
                <option value="entree">Entrée principale</option>
                {PLACES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <h2 className="mt-2 text-2xl font-extrabold">{from === "entree" ? "Entrée principale" : PLACES.find((p) => p.id === from)?.name} → {sel.name}</h2>
            <ol className="mt-4 space-y-3">
              {(from === "entree" ? sel.steps : routeBetween(from, sel.id)).map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
                  <p className="pt-0.5 text-sm">{s}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
      {authed && <Assistant />}
    </main>
  );
}
