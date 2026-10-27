import { displayName } from "@/lib/display-name";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { BackLink } from "@/components/BackLink";
import { containsProfanity, PROFANITY_MSG } from "@/lib/profanity";
const badMsg = (t: { brand: string }) => PROFANITY_MSG[t.brand === "ENSTP Community" ? "en" : t.brand === "Communauté ENSTP" ? "fr" : "ar"];

export const Route = createFileRoute("/aide")({
  validateSearch: (search: Record<string, unknown>) => ({
    embed: search["embed"] === true || search["embed"] === "true",
    lang: (["ar", "fr", "en"].includes(String(search["lang"])) ? String(search["lang"]) : undefined) as Lang | undefined,
  }),
  head: () => ({
    meta: [
      { title: "Communauté ENSTP · Centre d’aide" },
      { name: "description", content: "Groupes d’entraide par wilaya, vidéo de présentation et partage de cours entre étudiants de l’ENSTP." },
      { property: "og:title", content: "Communauté ENSTP · Centre d’aide" },
      { property: "og:description", content: "Échangez par wilaya et partagez cours et résumés entre étudiants de l’ENSTP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Aide,
});

type Lang = "ar" | "fr" | "en";
type Tab = "home" | "wilayas" | "knowledge";

const T = {
  ar: { brand: "فضاء طلبة ENSTP", statFiles: "ملفات مشتركة", statMsgs: "رسائل في الولايات", msgs: "رسالة", replyBtn: "رد", replyPh: "اكتب ردك…", brandSub: "فضاء الطلبة حسب الولاية", navHome: "الرئيسية", navVideo: "🎬 فيديو تعريفي", navWilayas: "الولايات", navKnowledge: "فضاء المعارف", heroSchool: "المدرسة الوطنية العليا للأشغال العمومية", heroWelcome: "مرحبًا بك في الدعم والمساعدة", heroDesc: "مجموعات نقاش لطلبة ENSTP مصنّفة حسب الولاية، وفضاء لتبادل الملفات والمعارف مع زملائك.", watchVideoBtn: "شاهد الفيديو التعريفي", exploreBtn: "تصفح الولايات", videoTitle: "تعرف على مدرسة ENSTP", videoDesc: "نبذة تاريخية، البرامج الأكاديمية، الهيكل التنظيمي ومعلومات الاتصال.", wilayasTitle: "مجموعات الولايات", wilayasDesc: "اختر ولايتك وتابع رسائل زملائك أو شارك استفسارك.", newPostBtn: "+ منشور جديد", shareFileBtn: "+ مشاركة ملف", knowledgeDesc: "دروس، ملخصات ومواضيع امتحانات يشاركها طلبة ENSTP.", wilaya: "الولاية", search: "ابحث عن ولاية…", noPosts: "لا توجد رسائل بعد. كن أول من يكتب!", write: "اكتب رسالتك…", publish: "نشر", back: "← كل الولايات", noFiles: "لا توجد ملفات بعد.", fileTitle: "عنوان الملف", pickFile: "اختر ملفًا (حتى 20 ميغابايت)", send: "مشاركة", cancel: "إلغاء", download: "تحميل", del: "حذف", login: "سجّل الدخول للمشاركة في المجتمع.", loginBtn: "تسجيل الدخول", chooseWilaya: "اختر الولاية" },
  fr: { brand: "Communauté ENSTP", statFiles: "fichiers partagés", statMsgs: "messages dans les wilayas", msgs: "messages", replyBtn: "Répondre", replyPh: "Votre réponse…", brandSub: "L’espace étudiant par wilaya", navHome: "Accueil", navVideo: "🎬 Vidéo", navWilayas: "Wilayas", navKnowledge: "Espace savoirs", heroSchool: "École Nationale Supérieure des Travaux Publics", heroWelcome: "Bienvenue au centre d’aide", heroDesc: "Des groupes de discussion d’étudiants ENSTP par wilaya et un espace de partage de fichiers.", watchVideoBtn: "Voir la vidéo", exploreBtn: "Parcourir les wilayas", videoTitle: "Découvrez l’ENSTP", videoDesc: "Histoire, programmes, organigramme et contact.", wilayasTitle: "Groupes par wilaya", wilayasDesc: "Choisissez votre wilaya, lisez les messages ou posez votre question.", newPostBtn: "+ Nouveau message", shareFileBtn: "+ Partager un fichier", knowledgeDesc: "Cours, résumés et sujets d’examen partagés par les étudiants.", wilaya: "Wilaya", search: "Rechercher une wilaya…", noPosts: "Aucun message. Soyez le premier !", write: "Votre message…", publish: "Publier", back: "← Toutes les wilayas", noFiles: "Aucun fichier pour l’instant.", fileTitle: "Titre du fichier", pickFile: "Choisir un fichier (20 Mo max)", send: "Partager", cancel: "Annuler", download: "Télécharger", del: "Supprimer", login: "Connectez-vous pour participer.", loginBtn: "Se connecter", chooseWilaya: "Choisir la wilaya" },
  en: { brand: "ENSTP Community", statFiles: "shared files", statMsgs: "wilaya messages", msgs: "messages", replyBtn: "Reply", replyPh: "Your reply…", brandSub: "Student space by wilaya", navHome: "Home", navVideo: "🎬 Video", navWilayas: "Wilayas", navKnowledge: "Knowledge hub", heroSchool: "National Higher School of Public Works", heroWelcome: "Welcome to help & support", heroDesc: "ENSTP student discussion groups by wilaya and a file-sharing space.", watchVideoBtn: "Watch the video", exploreBtn: "Browse wilayas", videoTitle: "Discover ENSTP", videoDesc: "History, programs, org chart and contact.", wilayasTitle: "Wilaya groups", wilayasDesc: "Pick your wilaya to read classmates’ messages or ask a question.", newPostBtn: "+ New post", shareFileBtn: "+ Share a file", knowledgeDesc: "Courses, summaries and exam papers shared by students.", wilaya: "Wilaya", search: "Search a wilaya…", noPosts: "No messages yet. Be the first!", write: "Write your message…", publish: "Post", back: "← All wilayas", noFiles: "No files yet.", fileTitle: "File title", pickFile: "Choose a file (max 20 MB)", send: "Share", cancel: "Cancel", download: "Download", del: "Delete", login: "Sign in to join the community.", loginBtn: "Sign in", chooseWilaya: "Choose wilaya" },
} as const;

const WILAYAS_LAT = ["Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","Béchar","Blida","Bouira","Tamanrasset","Tébessa","Tlemcen","Tiaret","Tizi Ouzou","Alger","Djelfa","Jijel","Sétif","Saïda","Skikda","Sidi Bel Abbès","Annaba","Guelma","Constantine","Médéa","Mostaganem","M'Sila","Mascara","Ouargla","Oran","El Bayadh","Illizi","Bordj Bou Arréridj","Boumerdès","El Tarf","Tindouf","Tissemsilt","El Oued","Khenchela","Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma","Aïn Témouchent","Ghardaïa","Relizane","Timimoun","Bordj Badji Mokhtar","Ouled Djellal","Béni Abbès","In Salah","In Guezzam","Touggourt","Djanet","El M'Ghair","El Meniaa"];
const wName = (c: number, lang: string): string => (lang === "ar" ? WILAYAS[c - 1] : WILAYAS_LAT[c - 1]) ?? "";
const WILAYAS = ["أدرار","الشلف","الأغواط","أم البواقي","باتنة","بجاية","بسكرة","بشار","البليدة","البويرة","تمنراست","تبسة","تلمسان","تيارت","تيزي وزو","الجزائر","الجلفة","جيجل","سطيف","سعيدة","سكيكدة","سيدي بلعباس","عنابة","قالمة","قسنطينة","المدية","مستغانم","المسيلة","معسكر","ورقلة","وهران","البيض","إليزي","برج بوعريريج","بومرداس","الطارف","تندوف","تيسمسيلت","الوادي","خنشلة","سوق أهراس","تيبازة","ميلة","عين الدفلى","النعامة","عين تموشنت","غرداية","غليزان","تيميمون","برج باجي مختار","أولاد جلال","بني عباس","عين صالح","عين قزام","تقرت","جانت","المغير","المنيعة"];

type Post = { id: string; user_id: string; author_name: string; wilaya_code: number; content: string; parent_id?: string | null; category?: string; created_at: string };
type FileRow = { id: string; user_id: string; author_name: string; title: string; path: string; file_type: string; subject?: string; created_at: string };

function Aide() {
  const { embed, lang: initial } = Route.useSearch();
  const root = useRef<HTMLElement>(null);
  const [lang] = useState<Lang>(initial ?? "fr");
  const [tab, setTab] = useState<Tab>("home");
  const [uid, setUid] = useState<string | null | undefined>(undefined);
  const [name, setName] = useState("");
  const t = T[lang];
  const [stats, setStats] = useState<{ files: number; msgs: number; by: Record<number, number> }>({ files: 0, msgs: 0, by: {} });
  useEffect(() => {
    if (!uid) return;
    (async () => {
      const [f, w] = await Promise.all([
        supabase.from("shared_files").select("id", { count: "exact", head: true }),
        supabase.from("wilaya_posts").select("wilaya_code").limit(10000),
      ]);
      const by: Record<number, number> = {};
      (w.data ?? []).forEach((r) => { by[r.wilaya_code] = (by[r.wilaya_code] ?? 0) + 1; });
      setStats({ files: f.count ?? 0, msgs: (w.data ?? []).length, by });
    })();
  }, [uid, tab]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUid(data.user?.id ?? null);
      if (!data.user) return;
      const { data: p } = await supabase.from("profiles").select("first_name,last_name,academic_year,specialty").eq("id", data.user.id).maybeSingle();
      setName(displayName(p, (data.user.email ?? "").split("@")[0] ?? ""));
    });
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!embed || !el) return;
    // Height messages must reach the parent page even when the guide is hosted
    // on another origin (e.g. GitHub Pages): target the embedder's origin.
    const report = () => {
      let target = window.location.origin;
      try { const r = new URL(document.referrer, window.location.href); if (r.origin && r.origin !== "null") target = r.origin; } catch {}
      window.parent.postMessage({ type: "enstp-aide-height", height: Math.ceil(el.getBoundingClientRect().height) }, target);
    };
    const ob = new ResizeObserver(report);
    ob.observe(el);
    report();
    return () => ob.disconnect();
  }, [embed]);

  const dir = lang === "ar" ? "rtl" : "ltr";
  const tabs: [Tab, string][] = [["home", t.navHome], ["wilayas", t.navWilayas], ["knowledge", t.navKnowledge]];

  return (
    <main ref={root} className={embed ? "bg-background text-foreground" : "min-h-screen bg-background px-4 py-8 text-foreground"}>
      <div className="mx-auto max-w-6xl">
        <Toaster />
        {!embed && <BackLink />}
        <div dir={dir} lang={lang}>
          <nav className="mb-6 flex flex-wrap gap-2">
            {tabs.map(([k, label]) => (
              <button key={k} onClick={() => setTab(k)} className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${tab === k ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-foreground hover:bg-accent"}`}>{label}</button>
            ))}
          </nav>
          {tab === "home" && <Home t={t} uid={uid} name={name} stats={stats} go={setTab} lang={lang} />}
          {(tab === "wilayas" || tab === "knowledge") && uid === null && (
            <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
              <p className="text-sm font-semibold">{t.login}</p>
              <Link to="/" target={embed ? "_top" : "_self"} className="mt-3 rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground">{t.loginBtn}</Link>
            </div>
          )}
          {tab === "wilayas" && uid && <Wilayas t={t} uid={uid} name={name} counts={stats.by} lang={lang} />}
          {tab === "knowledge" && uid && <Knowledge t={t} uid={uid} name={name} lang={lang} />}
        </div>
      </div>
    </main>
  );
}

type TT = (typeof T)[Lang];
const fmt = (d: string) => new Date(d).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
const day = (d: string, l: Lang) => new Date(d).toLocaleDateString(l === "ar" ? "ar-DZ" : l, { day: "numeric", month: "long", year: "numeric" });
const code = (n: number) => String(n).padStart(2, "0");
const L3 = (l: Lang, fr: string, en: string, ar: string) => (l === "fr" ? fr : l === "en" ? en : ar);
const CATS: [string, string, string, string][] = [["discussion", "Discussion", "Discussion", "نقاش"], ["advice", "Conseil", "Advice", "استشارة"], ["exchange", "Échange de savoirs", "Knowledge exchange", "تبادل معارف"]];
const SUBJECTS: [string, string, string, string][] = [["analysis", "Analyse", "Analysis", "تحليل رياضي"], ["algebra", "Algèbre", "Algebra", "جبر"], ["physics", "Physique", "Physics", "فيزياء"], ["chemistry", "Chimie", "Chemistry", "كيمياء"], ["mechanics", "Mécanique", "Mechanics", "ميكانيك"], ["rdm", "RDM", "Strength of materials", "مقاومة المواد"], ["concrete", "Béton armé", "Reinforced concrete", "خرسانة مسلحة"], ["numerical", "Analyse numérique", "Numerical analysis", "تحليل عددي"], ["topo", "Topographie", "Surveying", "طبوغرافيا"], ["geotech", "Géotechnique", "Geotechnics", "جيوتقنية"], ["roads", "Routes", "Road engineering", "هندسة الطرق"], ["hydraulics", "Hydraulique", "Hydraulics", "هيدروليك"], ["drawing", "Dessin technique", "Technical drawing", "رسم تقني"], ["cs", "Informatique", "Computer science", "إعلام آلي"], ["languages", "Langues", "Languages", "لغات"], ["culture", "Culture générale", "General culture", "ثقافة عامة"], ["other", "Autre", "Other", "أخرى"]];
const lbl = (list: [string, string, string, string][], k: string, l: Lang) => { const r = list.find((x) => x[0] === k) ?? list[list.length - 1]!; return L3(l, r[1], r[2], r[3]); };
const card = "rounded-2xl border border-border bg-card shadow-sm transition-colors";
const pill = (on: boolean) => `rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${on ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-accent"}`;
const Ic = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
const IC = { msg: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5", pin: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z", dl: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3", search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3", plus: "M12 5v14M5 12h14" };

function Home({ t, uid, name, stats, go, lang }: { t: TT; uid: string | null | undefined; name: string; stats: { files: number; msgs: number; by: Record<number, number> }; go: (k: Tab) => void; lang: Lang }) {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => {
    if (!uid) return;
    supabase.from("shared_files").select("*").order("created_at", { ascending: false }).limit(3).then(({ data }) => setFiles(data ?? []));
    supabase.from("wilaya_posts").select("*").is("parent_id", null).order("created_at", { ascending: false }).limit(4).then(({ data }) => setPosts(data ?? []));
  }, [uid]);
  const active = Object.keys(stats.by).length;
  const st: [number, string, string, boolean][] = [[stats.msgs, L3(lang, "Messages des étudiants", "Student posts", "منشورات الطلبة"), IC.msg, false], [stats.files, L3(lang, "Fichiers partagés", "Shared files", "ملفات متبادلة"), IC.file, true], [active, L3(lang, "Wilayas actives", "Active wilayas", "ولايات نشطة"), IC.pin, false], [posts.length, L3(lang, "Discussions récentes", "Recent discussions", "نقاشات حديثة"), IC.msg, false]];
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-[image:var(--gradient-community)] px-6 py-10 shadow-lg md:px-10 md:py-12" style={{ color: "var(--on-gradient)" }}>
        <p className="mb-3 text-xs font-medium opacity-80">{t.heroSchool}</p>
        <h2 className="mb-3 text-3xl font-extrabold md:text-4xl">{L3(lang, "Bienvenue", "Welcome", "مرحبًا")}{name ? ` ${name.split(" •")[0]}` : ""}</h2>
        <p className="mb-7 max-w-2xl text-sm opacity-90">{t.heroDesc}</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => go("wilayas")} className="rounded-full bg-[color:var(--accent-warm)] px-6 py-2.5 text-sm font-bold text-[color:var(--on-gradient)] shadow transition-transform hover:scale-[1.02]">{t.exploreBtn}</button>
          <button onClick={() => go("knowledge")} className="rounded-full border border-current/40 px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-[color:var(--on-gradient)]/10">{t.navKnowledge}</button>
        </div>
      </section>
      {uid && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {st.map(([n, l, ic, warm], i) => (
              <div key={i} className={`${card} flex items-center gap-3 p-4`}>
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${warm ? "bg-[color:var(--accent-warm)]/15 text-[color:var(--accent-warm)]" : "bg-secondary text-primary"}`}><Ic d={ic} /></span>
                <div className="min-w-0"><div className="text-xl font-extrabold">{n}</div><div className="truncate text-xs text-muted-foreground">{l}</div></div>
              </div>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-[3fr_2fr]">
            <div>
              <div className="mb-3 flex items-baseline justify-between"><h3 className="text-lg font-bold">{L3(lang, "Dernières discussions", "Latest discussions", "أحدث المناقشات")}</h3><button onClick={() => go("wilayas")} className="text-xs text-muted-foreground hover:text-foreground">{L3(lang, "Toutes les wilayas", "All wilayas", "كل الولايات")}</button></div>
              {posts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center"><p className="mb-4 text-sm text-muted-foreground">{L3(lang, "Aucun message pour l’instant. Choisissez votre wilaya et lancez la discussion.", "No posts yet. Pick your wilaya and start the first discussion.", "لا توجد منشورات بعد. اختر ولايتك وابدأ أول نقاش مع زملائك.")}</p><button onClick={() => go("wilayas")} className={pill(false)}>{t.exploreBtn}</button></div>
              ) : (
                <div className="space-y-3">{posts.map((p) => (
                  <button key={p.id} onClick={() => go("wilayas")} className={`${card} block w-full p-4 text-start hover:border-primary/40`}>
                    <div className="mb-1 flex justify-between gap-2 text-xs text-muted-foreground"><span className="font-semibold text-foreground">{p.author_name}</span><span>{wName(p.wilaya_code, lang)}</span></div>
                    <p className="line-clamp-2 text-sm">{p.content}</p>
                  </button>))}</div>
              )}
            </div>
            <div>
              <div className="mb-3 flex items-baseline justify-between"><h3 className="text-lg font-bold">{L3(lang, "Derniers fichiers", "Latest files", "أحدث الملفات")}</h3><button onClick={() => go("knowledge")} className="text-xs text-muted-foreground hover:text-foreground">{t.navKnowledge}</button></div>
              <div className="space-y-3">
                {files.length === 0 && <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">{t.noFiles}</p>}
                {files.map((f) => <FileCard key={f.id} f={f} lang={lang} t={t} onOpen={() => go("knowledge")} />)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FileCard({ f, lang, t, onOpen, onDel, mine }: { f: FileRow; lang: Lang; t: TT; onOpen: () => void; onDel?: () => void; mine?: boolean }) {
  return (
    <div className={`${card} p-4`}>
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><Ic d={IC.file} /></span>
        <div className="min-w-0 flex-1"><div className="truncate font-bold">{f.title}</div><div className="text-xs text-muted-foreground">{f.file_type || "FILE"} · {day(f.created_at, lang)}</div></div>
      </div>
      <div className="mt-3 flex justify-end"><span className="rounded-full bg-secondary px-3 py-0.5 text-xs">{lbl(SUBJECTS, f.subject ?? "other", lang)}</span></div>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
        <span className="truncate text-xs text-muted-foreground">{f.author_name || "—"}</span>
        <div className="flex shrink-0 items-center gap-2">
          {mine && onDel && <button onClick={onDel} className="text-xs text-destructive hover:underline">{t.del}</button>}
          <button onClick={onOpen} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-accent"><Ic d={IC.dl} />{t.download}</button>
        </div>
      </div>
    </div>
  );
}

function Wilayas({ t, uid, name, counts, lang }: { t: TT; uid: string; name: string; counts: Record<number, number>; lang: Lang }) {
  const [sel, setSel] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [text, setText] = useState("");
  const [cat, setCat] = useState("discussion");
  const [filter, setFilter] = useState("all");
  const [compose, setCompose] = useState(false);
  const [busy, setBusy] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (!sel) return;
    supabase.from("wilaya_posts").select("*").eq("wilaya_code", sel).order("created_at", { ascending: true }).limit(200).then(({ data }) => setPosts(data ?? []));
  }, [sel]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const c = text.trim();
    if (!c || !sel) return;
    if (containsProfanity(c)) { toast.error(badMsg(t)); return; }
    setBusy(true);
    const { data, error } = await supabase.from("wilaya_posts").insert({ user_id: uid, author_name: name, wilaya_code: sel, content: c.slice(0, 1000), category: cat }).select().single();
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setPosts((p) => [...p, data]);
    setText(""); setCompose(false);
  }
  async function remove(id: string) {
    const { error } = await supabase.from("wilaya_posts").delete().eq("id", id);
    if (!error) setPosts((p) => p.filter((x) => x.id !== id && x.parent_id !== id));
  }
  async function sendReply(parent: string) {
    const c = replyText.trim();
    if (!c || !sel) return;
    if (containsProfanity(c)) { toast.error(badMsg(t)); return; }
    setBusy(true);
    const { data, error } = await supabase.from("wilaya_posts").insert({ user_id: uid, author_name: name, wilaya_code: sel, content: c.slice(0, 1000), parent_id: parent }).select().single();
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setPosts((p) => [...p, data]);
    setReplyText(""); setReplyTo(null);
  }
  const roots = posts.filter((p) => !p.parent_id && (filter === "all" || p.category === filter)).reverse();
  const initials = (n: string) => (n || "?").split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();

  if (sel) {
    const wn = wName(sel, lang);
    return (
      <div className="mx-auto max-w-5xl">
        <button onClick={() => setSel(null)} className="mb-6 text-sm text-muted-foreground hover:text-foreground">{t.back}</button>
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div className="min-w-0">
            <p className="text-xs font-bold text-[color:var(--accent-warm)]">{t.wilaya} {code(sel)}</p>
            <h2 className="text-3xl font-extrabold">{L3(lang, `Groupe ${wn}`, `${wn} group`, `مجموعة ${wn}`)}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{L3(lang, `Espace de discussion des étudiants ENSTP originaires de ${wn}.`, `Discussion space for ENSTP students from ${wn}.`, `فضاء نقاش طلبة ENSTP المنتمين إلى ولاية ${wn} — تبادلوا الرسائل والملفات.`)}</p>
          </div>
          <button onClick={() => setCompose((c) => !c)} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow"><Ic d={IC.plus} />{t.newPostBtn.replace("+ ", "")}</button>
        </div>
        <div className="my-6 flex flex-wrap gap-2">
          <button onClick={() => setFilter("all")} className={pill(filter === "all")}>{L3(lang, "Tout", "All", "الكل")}</button>
          {CATS.map((c) => <button key={c[0]} onClick={() => setFilter(c[0])} className={pill(filter === c[0])}>{L3(lang, c[1], c[2], c[3])}</button>)}
        </div>
        {compose && (
          <form onSubmit={submit} className={`${card} mb-4 space-y-3 p-4`}>
            <div className="flex flex-wrap gap-2">{CATS.map((c) => <button type="button" key={c[0]} onClick={() => setCat(c[0])} className={pill(cat === c[0])}>{L3(lang, c[1], c[2], c[3])}</button>)}</div>
            <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} rows={3} placeholder={t.write} className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm" />
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setCompose(false)} className="rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent">{t.cancel}</button><button disabled={busy || !text.trim()} className="rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50">{t.publish}</button></div>
          </form>
        )}
        <div className="flex flex-col gap-3">
          {roots.length === 0 && <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center"><p className="text-lg font-bold">{L3(lang, "Aucun message ici pour l’instant", "No posts here yet", "لا توجد منشورات هنا بعد")}</p><p className="mt-1 text-sm text-muted-foreground">{L3(lang, `Soyez le premier à lancer une discussion dans le groupe ${wn}.`, `Be the first to start a discussion in the ${wn} group.`, `كن أول من يبدأ نقاشًا في مجموعة ${wn}.`)}</p></div>}
          {roots.map((p) => (
            <div key={p.id} className={`${card} p-4`}>
              <div className="mb-2"><span className="rounded-full bg-secondary px-3 py-0.5 text-[11px]">{lbl(CATS, p.category ?? "discussion", lang)}</span></div>
              <PostBody p={p} uid={uid} t={t} onDel={remove} initials={initials} />
              <div className="ms-11 mt-2 flex flex-col gap-2">
                {posts.filter((r) => r.parent_id === p.id).map((r) => (
                  <div key={r.id} className="rounded-xl border border-border bg-background p-3"><PostBody p={r} uid={uid} t={t} onDel={remove} initials={initials} /></div>
                ))}
                {replyTo === p.id ? (
                  <div className="flex gap-2">
                    <input autoFocus value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendReply(p.id)} maxLength={1000} placeholder={t.replyPh} className="flex-1 rounded-full border border-border bg-background px-4 py-1.5 text-sm" />
                    <button disabled={busy || !replyText.trim()} onClick={() => sendReply(p.id)} className="rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground disabled:opacity-50">{t.publish}</button>
                  </div>
                ) : (
                  <button onClick={() => { setReplyTo(p.id); setReplyText(""); }} className="self-start text-xs font-semibold text-primary hover:underline">↩ {t.replyBtn}</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const list = WILAYAS.map((_, i) => ({ n: wName(i + 1, lang), c: i + 1 })).filter((w) => w.n.toLowerCase().includes(q.toLowerCase()) || (WILAYAS[w.c - 1] ?? "").includes(q) || code(w.c).includes(q));
  return (
    <div>
      <h2 className="text-3xl font-extrabold">{t.wilayasTitle}</h2>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">{t.wilayasDesc}</p>
      <div className="relative mb-6 max-w-md"><span className="absolute inset-y-0 start-4 grid place-items-center text-muted-foreground"><Ic d={IC.search} /></span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} className="w-full rounded-full border border-border bg-card py-2.5 pe-4 ps-11 text-sm" /></div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((w) => (
          <button key={w.c} onClick={() => setSel(w.c)} className={`${card} group flex items-center justify-between gap-3 p-5 text-start hover:border-primary/50`}>
            <div className="min-w-0"><div className="truncate text-lg font-bold group-hover:text-primary">{w.n}</div><div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><span className="[&_svg]:h-3.5 [&_svg]:w-3.5"><Ic d={IC.msg} /></span>{counts[w.c] ?? 0} {t.msgs}</div></div>
            <span className="shrink-0 text-2xl font-extrabold text-muted-foreground/40 group-hover:text-primary/50">{code(w.c)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Knowledge({ t, uid, name, lang }: { t: TT; uid: string; name: string; lang: Lang }) {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("other");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [sub, setSub] = useState("all");

  useEffect(() => {
    supabase.from("shared_files").select("*").order("created_at", { ascending: false }).limit(200).then(({ data }) => setFiles(data ?? []));
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!file || !title.trim()) return;
    if (containsProfanity(title) || containsProfanity(file.name)) { toast.error(badMsg(t)); return; }
    if (file.size > 20 * 1024 * 1024) { toast.error("20 MB max"); return; }
    setBusy(true);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const path = `${uid}/${crypto.randomUUID()}${ext ? "." + ext : ""}`;
    const up = await supabase.storage.from("knowledge").upload(path, file, { contentType: file.type });
    if (up.error) { setBusy(false); toast.error(up.error.message); return; }
    const { data, error } = await supabase.from("shared_files").insert({ user_id: uid, author_name: name, title: title.trim().slice(0, 150), path, file_type: ext.toUpperCase(), subject }).select().single();
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setFiles((f) => [data, ...f]);
    setTitle(""); setFile(null); setOpen(false);
  }
  async function download(f: FileRow) {
    const { data, error } = await supabase.storage.from("knowledge").download(f.path);
    if (error || !data) { toast.error(error?.message ?? "Download failed"); return; }
    const ext = f.path.split(".").pop();
    const safe = f.title.replace(/[\\/:*?"<>|]+/g, "_").slice(0, 100) || "fichier";
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = ext && !safe.toLowerCase().endsWith("." + ext) ? `${safe}.${ext}` : safe;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }
  async function remove(f: FileRow) {
    await supabase.storage.from("knowledge").remove([f.path]);
    const { error } = await supabase.from("shared_files").delete().eq("id", f.id);
    if (!error) setFiles((x) => x.filter((y) => y.id !== f.id));
  }
  const shown = files.filter((f) => (sub === "all" || (f.subject ?? "other") === sub) && (!q || f.title.toLowerCase().includes(q.toLowerCase())));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0"><h2 className="text-3xl font-extrabold">{L3(lang, "Espace d’échange de savoirs", "Knowledge exchange hub", "فضاء تبادل المعارف")}</h2><p className="mt-1 text-sm text-muted-foreground">{t.knowledgeDesc}</p></div>
        <button onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow"><Ic d={IC.plus} />{t.shareFileBtn.replace("+ ", "")}</button>
      </div>
      {open && (
        <form onSubmit={submit} className={`${card} mb-6 flex flex-col gap-3 p-4`}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} placeholder={t.fileTitle} className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">{SUBJECTS.map((s) => <option key={s[0]} value={s[0]}>{L3(lang, s[1], s[2], s[3])}</option>)}</select>
          <label className="text-xs text-muted-foreground">{t.pickFile}
            <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-1 block w-full cursor-pointer rounded-xl border border-dashed border-border bg-background p-3 text-xs file:me-3 file:rounded-full file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-primary-foreground" />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent">{t.cancel}</button>
            <button disabled={busy || !file || !title.trim()} className="rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50">{busy ? "…" : t.send}</button>
          </div>
        </form>
      )}
      <div className="relative mb-5 max-w-md"><span className="absolute inset-y-0 start-4 grid place-items-center text-muted-foreground"><Ic d={IC.search} /></span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={L3(lang, "Rechercher un fichier…", "Search files…", "ابحث في الملفات…")} className="w-full rounded-full border border-border bg-card py-2.5 pe-4 ps-11 text-sm" /></div>
      <div className="mb-6 flex flex-wrap gap-2">
        <button onClick={() => setSub("all")} className={pill(sub === "all")}>{L3(lang, "Tout", "All", "الكل")}</button>
        {SUBJECTS.map((s) => <button key={s[0]} onClick={() => setSub(s[0])} className={pill(sub === s[0])}>{L3(lang, s[1], s[2], s[3])}</button>)}
      </div>
      {shown.length === 0 && <p className="rounded-2xl border border-dashed border-border bg-card py-10 text-center text-sm text-muted-foreground">{t.noFiles}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((f) => <FileCard key={f.id} f={f} lang={lang} t={t} mine={f.user_id === uid} onDel={() => remove(f)} onOpen={() => download(f)} />)}
      </div>
    </div>
  );
}

function PostBody({ p, uid, t, onDel, initials }: { p: Post; uid: string; t: TT; onDel: (id: string) => void; initials: (n: string) => string }) {
  return (
    <div className="flex gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mint text-[11px] font-bold text-foreground">{initials(p.author_name)}</div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm font-bold">{p.author_name || "—"}</span>
          <span className="text-[10px] text-muted-foreground">{fmt(p.created_at)}</span>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed">{p.content}</p>
        {p.user_id === uid && <button onClick={() => onDel(p.id)} className="mt-1 text-[10px] text-destructive hover:underline">{t.del}</button>}
      </div>
    </div>
  );
}
