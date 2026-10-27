import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const KEY = "enstp-theme";
const GUIDE_DARK_CSS = `html:root{color-scheme:dark;
--background:oklch(.17 .018 170);--foreground:oklch(.95 .01 160);--card:oklch(.22 .022 170);
--primary:oklch(.74 .11 165);--primary-foreground:oklch(.17 .03 170);--secondary:oklch(.28 .022 170);
--muted:oklch(.26 .02 170);--muted-foreground:oklch(.74 .02 165);--accent:oklch(.3 .03 168);
--border:oklch(1 0 0 / 12%);--mint:oklch(.32 .05 165);--mint-ink:oklch(.85 .08 165);
--blue:oklch(.3 .05 243);--blue-ink:oklch(.85 .07 243);--violet:oklch(.3 .05 291);--violet-ink:oklch(.85 .07 291);
--peach:oklch(.32 .05 58);--peach-ink:oklch(.87 .08 58);--rose:oklch(.3 .05 13);--rose-ink:oklch(.86 .07 13);
--shadow:0 15px 50px oklch(0 0 0 / .4)}
html,body{background:var(--background)!important;color:var(--foreground)}
/* the hero stays on a photo: keep its light accents */
.hero{--mint:oklch(.86 .09 163);--primary-foreground:oklch(1 0 0);--primary:oklch(.43 .079 169)}
.btn-hero{background:oklch(1 0 0)!important;color:oklch(.43 .079 169)!important}
/* teacher directory cards hard-code forest green in the base page */
.tc-y{color:var(--foreground)!important}
.tc-card{border-color:var(--border)!important;background:color-mix(in oklab,var(--primary) 12%,transparent)!important;box-shadow:none!important}
.tc-av{background:var(--primary)!important;color:var(--primary-foreground)!important}
.tc-mod{color:oklch(.9 .07 165)!important}
.tc-tags span{background:color-mix(in oklab,var(--primary) 30%,transparent)!important;color:var(--foreground)!important;border:1px solid color-mix(in oklab,var(--primary) 50%,transparent)!important}
.tc-acts a{border-color:color-mix(in oklab,var(--primary) 65%,transparent)!important;background:color-mix(in oklab,var(--primary) 24%,transparent)!important;color:oklch(.94 .06 165)!important}
.tc-acts a:hover{background:var(--primary)!important;color:var(--primary-foreground)!important}
.xg-tabs button{color:var(--foreground)!important}
*{transition:background-color .45s cubic-bezier(.4,0,.2,1),color .45s cubic-bezier(.4,0,.2,1),border-color .45s cubic-bezier(.4,0,.2,1)}`;

/** The legacy guide page uses its own color variables; dark values are injected into it. */
function syncFrames(dark: boolean, root: Document = document) {
  root.querySelectorAll("iframe").forEach((f) => {
    try {
      const doc = f.contentDocument;
      if (!doc?.head) return;
      if (f.src.includes("guide")) {
        let el = doc.getElementById("enstp-dark");
        if (dark && !el) {
          el = doc.createElement("style");
          el.id = "enstp-dark";
          el.textContent = GUIDE_DARK_CSS;
          doc.head.appendChild(el);
        } else if (!dark && el) el.remove();
      } else if (doc.documentElement.classList.contains("dark") !== dark) {
        const h = doc.documentElement;
        h.classList.add("theme-anim");
        h.classList.toggle("dark", dark);
        setTimeout(() => h.classList.remove("theme-anim"), 500);
      }
      syncFrames(dark, doc);
    } catch {
      /* cross-origin frame */
    }
  });
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [embedded, setEmbedded] = useState(true);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setEmbedded(new URLSearchParams(window.location.search).has("embed"));
  }, []);
  useEffect(() => {
    syncFrames(dark);
    const onLoad = () => syncFrames(dark);
    document.addEventListener("load", onLoad, true);
    const t = setInterval(onLoad, 1500);
    return () => {
      document.removeEventListener("load", onLoad, true);
      clearInterval(t);
    };
  }, [dark]);

  function change(v: boolean) {
    const root = document.documentElement;
    root.classList.add("theme-anim");
    root.classList.toggle("dark", v);
    localStorage.setItem(KEY, v ? "dark" : "light");
    setDark(v);
    setTimeout(() => root.classList.remove("theme-anim"), 500);
  }

  if (embedded) return null;
  return (
    <label className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-card-foreground shadow-lg">
      <Sun className="h-4 w-4" aria-hidden />
      <Switch checked={dark} onCheckedChange={change} aria-label="Mode sombre" />
      <Moon className="h-4 w-4" aria-hidden />
    </label>
  );
}

export const THEME_INIT_SCRIPT = `try{if(localStorage.getItem("${KEY}")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;
