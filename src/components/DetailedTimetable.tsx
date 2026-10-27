import { useState } from "react";
import data from "@/lib/edt-data.json";
import { STRUCTURE, normalizeSessions, sessionMatches } from "@/lib/edt-structure";

type S = { day: string; start: string; end: string; subject: string; teacher: string; room: string; kind: string; sections: string[] };
const DAYS: Record<string, string> = { Saturday: "Samedi", Sunday: "Dimanche", Monday: "Lundi", Tuesday: "Mardi", Wednesday: "Mercredi", Thursday: "Jeudi" };

export function DetailedTimetable({ group }: { group: string }) {
  const g = (data as Record<string, { sessions: S[] }>)[group];
  const sessions = normalizeSessions(group, g?.sessions ?? []);
  const st = STRUCTURE[group];
  const days = Object.keys(DAYS).filter((d) => sessions.some((s) => s.day === d));
  const [sec, setSec] = useState("");
  const [day, setDay] = useState("");
  const curDay = days.includes(day) ? day : days[0];
  const list = sessions.filter((s) => s.day === curDay && sessionMatches(group, s, sec));

  if (!sessions.length) return null;
  return (
    <div className="mt-4 space-y-3">
      {st && <p className="text-sm font-semibold text-primary">{st.summary}</p>}
      {st?.note && <p className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs">{st.note}</p>}
      {st && !st.promo && (
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="sec" className="text-sm font-semibold">Mon {st.unitName.toLowerCase()}</label>
          <select id="sec" value={sec} onChange={(e) => setSec(e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm">
            <option value="">Tous</option>
            {st.units.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </div>
      )}
      <div className="flex gap-1 overflow-x-auto" role="tablist">
        {days.map((d) => (
          <button key={d} role="tab" aria-selected={d === curDay} onClick={() => setDay(d)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold ${d === curDay ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
            {DAYS[d]}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">Pas de cours ce jour pour cette section.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {list.map((s, i) => (
            <li key={i} className="flex gap-3 rounded-xl border border-border bg-background p-3">
              <div className="w-16 shrink-0 text-sm font-bold text-primary">{s.start}<span className="block text-xs font-normal text-muted-foreground">{s.end}</span></div>
              <div className="min-w-0 text-sm">
                <p className="font-bold">{s.subject}{s.kind ? <span className="ml-1 font-normal text-muted-foreground">· {s.kind}</span> : null}</p>
                {s.teacher && <p className="text-muted-foreground">{s.teacher}</p>}
                <p className="mt-1 text-xs">
                  {s.room && <span className="mr-2 rounded bg-muted px-1.5 py-0.5 font-semibold">Salle {s.room}</span>}
                  {s.sections.length > 0 && <span className="text-muted-foreground">{s.sections.length > 3 ? "Plusieurs groupes" : s.sections.map((x) => (/^\d+$/.test(x) && st ? `${st.unitName} ${x}` : x)).join(", ")}</span>}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">Recopié depuis le document officiel. En cas de doute, l’emploi du temps officiel ci-dessous fait foi.</p>
    </div>
  );
}
