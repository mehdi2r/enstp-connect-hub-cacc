import { useEffect, useRef, useState } from "react";
import { Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEPTS, ORG, WHO_TO_ASK } from "@/lib/enstp-data";
import hai from "@/assets/avatar/hai.webp.asset.json";
import think from "@/assets/avatar/think.webp.asset.json";
import bye from "@/assets/avatar/bye.webp.asset.json";

export const NARRATION = [
  {
    id: "histoire",
    title: "Histoire de l’école",
    text: "Salut ! Moi, c’est ton guide ENSTP Go. Commençons par l’histoire de l’école. Tout commence en 1966 avec la création de l’EITP. En 1987, elle devient un institut national, sous la double tutelle de l’Enseignement supérieur et des Travaux publics. En 1998, elle obtient le statut d’école nationale supérieure. Aujourd’hui, plus de six mille ingénieurs algériens et plus de trois cents ingénieurs internationaux y ont été formés !",
  },
  {
    id: "cursus",
    title: "Le cursus",
    text: `Passons au cursus. Tu commences par deux années de classes préparatoires. Ensuite, tu entres dans le cycle ingénieur, pendant trois ans, et tu choisis ton département : le DIB, ${DEPTS.DIB}, ou le DMS, ${DEPTS.DMS}.`,
  },
  {
    id: "organigramme",
    title: "Organigramme",
    text:
      "Voyons maintenant l’organigramme. " +
      ORG.map((o) => `${o.title} : ${o.items.map((i) => i.replace(/ — .*/, "")).join(", ")}.`).join(
        " ",
      ),
  },
  {
    id: "contacts",
    title: "À qui s’adresser",
    text:
      "Enfin, à qui t’adresser selon ton problème ? " +
      WHO_TO_ASK.map((w) => `Pour ${w.problem.toLowerCase()}, va voir : ${w.who}.`).join(" ") +
      " Et si tu as une autre question, demande-moi dans le chat ! À bientôt !",
  },
];

/** Picks a young, friendly French voice to match the chibi character. */
function pickVoice() {
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("fr"));
  const pref = ["Google français", "Thomas", "Paul", "Henri", "Denise", "Amélie"];
  return pref.map((n) => voices.find((v) => v.name.includes(n))).find(Boolean) ?? voices[0] ?? null;
}

export function Narrator() {
  const [supported, setSupported] = useState(false);
  const [current, setCurrent] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const stopped = useRef(false);

  useEffect(() => {
    setSupported("speechSynthesis" in window);
    return () => {
      if ("speechSynthesis" in window) speechSynthesis.cancel();
    };
  }, []);

  function speak(i: number) {
    if (stopped.current || i >= NARRATION.length) {
      setCurrent(null);
      return;
    }
    const part = NARRATION[i]!;
    setCurrent(i);
    document
      .getElementById(`ecole-${part.id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    const u = new SpeechSynthesisUtterance(part.text);
    u.lang = "fr-FR";
    u.voice = pickVoice();
    u.pitch = 1.35; // lighter, playful timbre for the chibi character
    u.rate = 1.05;
    u.onend = () => speak(i + 1);
    speechSynthesis.speak(u);
  }

  function start() {
    speechSynthesis.cancel();
    stopped.current = false;
    setPaused(false);
    speak(0);
  }
  function togglePause() {
    if (paused) speechSynthesis.resume();
    else speechSynthesis.pause();
    setPaused(!paused);
  }
  function stop() {
    stopped.current = true;
    speechSynthesis.cancel();
    setCurrent(null);
    setPaused(false);
  }

  if (!supported) return null;
  const playing = current !== null;
  const face = !playing
    ? hai.url
    : current === NARRATION.length - 1
      ? bye.url
      : current % 2
        ? think.url
        : hai.url;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
      <div
        className={`h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-primary bg-mint ${playing && !paused ? "animate-bounce" : ""}`}
      >
        <img
          src={face}
          alt=""
          width={80}
          height={80}
          loading="lazy"
          className="block h-full w-full rounded-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold">Écoute ton guide présenter l’école</p>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {playing
            ? `En cours : ${NARRATION[current]!.title}`
            : "Histoire, cursus, organigramme et contacts, lus à voix haute."}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {!playing ? (
            <Button size="sm" onClick={start}>
              <Play className="h-4 w-4" /> Écouter
            </Button>
          ) : (
            <>
              <Button size="sm" variant="secondary" onClick={togglePause}>
                {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {paused ? "Reprendre" : "Pause"}
              </Button>
              <Button size="sm" variant="outline" onClick={stop}>
                <Square className="h-4 w-4" /> Arrêter
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
