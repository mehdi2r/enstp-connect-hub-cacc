import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BackLink } from "@/components/BackLink";
import { Assistant } from "@/components/LazyAssistant";
import { DEPTS, ORG, WHO_TO_ASK } from "@/lib/enstp-data";
import presentation from "@/assets/ecole-mascotte.mp4.asset.json";

export const Route = createFileRoute("/ecole")({
  validateSearch: (search: Record<string, unknown>) => ({
    embed: search["embed"] === true || search["embed"] === "true",
  }),
  head: () => ({
    meta: [
      { title: "Présentation de l’ENSTP · ENSTP Go" },
      {
        name: "description",
        content:
          "Histoire, cursus, départements DIB et DMS, organigramme et contacts de l’ENSTP à Alger.",
      },
      { property: "og:title", content: "Présentation de l’ENSTP · ENSTP Go" },
      {
        property: "og:description",
        content: "Tout savoir sur l’École Nationale Supérieure des Travaux Publics.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Ecole,
});

const TIMELINE = [
  { y: "1966", t: "Création de l’EITP" },
  { y: "1987", t: "Institut national, double tutelle Enseignement supérieur & Travaux publics" },
  { y: "1998", t: "Statut d’école nationale supérieure" },
  { y: "Aujourd’hui", t: "6 000+ ingénieurs algériens et 300+ ingénieurs de 32 pays formés" },
];

function Ecole() {
  const { embed } = Route.useSearch();
  const content = useRef<HTMLElement>(null);
  const [videos, setVideos] = useState<
    { id: string; title: string; url: string; description: string | null }[]
  >([]);
  const [open, setOpen] = useState<number | null>(null);
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data.user);
      if (data.user)
        supabase
          .from("approved_videos")
          .select("id,title,url,description")
          .order("created_at", { ascending: false })
          .then(({ data }) => setVideos(data ?? []));
    });
  }, []);

  useEffect(() => {
    const element = content.current;
    if (!embed || !element) return;
    // Height messages must reach the parent page even when the guide is hosted
    // on another origin (e.g. GitHub Pages): target the embedder's origin.
    const report = () => {
      let target = window.location.origin;
      try { const r = new URL(document.referrer, window.location.href); if (r.origin && r.origin !== "null") target = r.origin; } catch {}
      window.parent.postMessage(
        { type: "enstp-ecole-height", height: Math.ceil(element.getBoundingClientRect().height) },
        target,
      );
    };
    const observer = new ResizeObserver(report);
    observer.observe(element);
    report();
    return () => observer.disconnect();
  }, [embed]);

  return (
    <main
      ref={content}
      className={
        embed
          ? "bg-background px-4 py-10 text-foreground"
          : "min-h-screen bg-background px-4 pb-28 pt-8 text-foreground"
      }
    >
      <div className="mx-auto max-w-4xl space-y-10">
        {!embed && <BackLink />}
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Bienvenue à l’ENSTP
          </p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
            École Nationale Supérieure des Travaux Publics « Francis Jeanson »
          </h1>
          <p className="mt-3 text-muted-foreground">
            Une école de référence en Algérie pour le génie civil, les infrastructures et les
            travaux publics — située à Alger, Gué de Constantine.
          </p>
        </header>

        <section>
          <video src={presentation.url} controls playsInline preload="metadata" className="aspect-video w-full rounded-2xl border border-border bg-muted" aria-label="Présentation animée de l’ENSTP" />
          <p className="mt-2 text-xs text-muted-foreground">
            Votre guide vous présente l’ENSTP : histoire, cursus et départements.
          </p>
        </section>

        <section id="ecole-histoire">
          <h2 className="text-xl font-extrabold">Histoire de l’école</h2>
          <ol className="mt-4 grid gap-3 md:grid-cols-4">
            {TIMELINE.map((s) => (
              <li key={s.y} className="rounded-2xl border border-border bg-card p-4">
                <p className="text-2xl font-extrabold text-primary">{s.y}</p>
                <p className="mt-1 text-sm">{s.t}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="ecole-cursus">
          <h2 className="text-xl font-extrabold">Le cursus</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-bold text-primary">2 ans · Classes Préparatoires</p>
              <p className="mt-2 text-sm">
                Sciences et techniques : mathématiques, physique, chimie, mécanique rationnelle,
                informatique, électricité.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-bold text-primary">3 ans · Cycle ingénieur</p>
              <p className="mt-2 text-sm">Spécialisation dans un département :</p>
              <ul className="mt-1 list-disc pl-5 text-sm">
                <li>
                  <b>DIB</b> — {DEPTS.DIB}
                </li>
                <li>
                  <b>DMS</b> — {DEPTS.DMS}
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="ecole-organigramme">
          <h2 className="text-xl font-extrabold">Organigramme</h2>
          <p className="text-sm text-muted-foreground">Touchez un bloc pour le détailler.</p>
          <div className="mt-4 flex flex-col items-center gap-3">
            {ORG.map((o, i) => (
              <div key={o.title} className="flex w-full flex-col items-center">
                {i > 0 && <div className="h-4 w-0.5 bg-border" />}
                <Button
                  variant="outline"
                  aria-expanded={open === i}
                  onClick={() => setOpen(open === i ? null : i)}
                  className={`block h-auto w-full max-w-md whitespace-normal rounded-lg border px-4 py-3 text-left transition ${open === i ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}
                >
                  <p className="font-bold">{o.title}</p>
                  {open === i && (
                    <ul className="mt-2 grid gap-1 text-sm">
                      {o.items.map((it) => (
                        <li key={it}>• {it}</li>
                      ))}
                    </ul>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section id="ecole-contacts">
          <h2 className="text-xl font-extrabold">À qui s’adresser selon son problème</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
            {WHO_TO_ASK.map((w) => (
              <div
                key={w.problem}
                className="grid gap-1 border-b border-border px-4 py-3 last:border-0 md:grid-cols-[1fr_auto]"
              >
                <p className="text-sm">{w.problem}</p>
                <p className="text-sm font-semibold text-primary">{w.who}</p>
              </div>
            ))}
          </div>
        </section>

        {videos.length > 0 && (
          <section>
            <h2 className="text-xl font-extrabold">Vidéos explicatives</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {videos.map((v) => (
                <a
                  key={v.id}
                  href={v.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-border bg-card p-4 hover:border-primary"
                >
                  <p className="font-bold">🎬 {v.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{v.description}</p>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
      {authed && !embed && <Assistant />}
    </main>
  );
}
