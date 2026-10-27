import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageSquarePlus, Trash2, X, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Conversation, ConversationContent } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { splitTrilingual } from "@/lib/trilingual";
import { browserLanguage, detectLanguage, UI_TEXT, type Lang } from "@/lib/detect-language";
import { supabase } from "@/integrations/supabase/client";
import think from "@/assets/avatar/think.webp.asset.json";
import load from "@/assets/avatar/load.webp.asset.json";
import hai from "@/assets/avatar/hai.webp.asset.json";
import bye from "@/assets/avatar/bye.webp.asset.json";

type Thread = { id: string; title: string; updated_at: string };

export function Assistant() {
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState<"hai" | "bye" | null>("hai");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lang, setLang] = useState<Lang>("fr");
  useEffect(() => setLang(browserLanguage()), []);

  useEffect(() => {
    const t = setTimeout(() => setFlash(null), 2200);
    return () => clearTimeout(t);
  }, [flash]);

  async function loadThreads() {
    const { data } = await supabase
      .from("chat_threads")
      .select("id,title,updated_at")
      .order("updated_at", { ascending: false });
    setThreads(data ?? []);
    return data ?? [];
  }

  async function newThread() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({ user_id: u.user.id })
      .select("id,title,updated_at")
      .single();
    if (error || !data) return;
    setThreads((t) => [data, ...t]);
    setActive(data.id);
    setShowList(false);
  }

  async function del(id: string) {
    await supabase.from("chat_threads").delete().eq("id", id);
    const left = threads.filter((t) => t.id !== id);
    setThreads(left);
    if (active === id) setActive(left[0]?.id ?? null);
  }

  function toggle() {
    if (open) {
      setOpen(false);
      setFlash("bye");
    } else {
      setOpen(true);
      setFlash("hai");
      loadThreads().then((list) => {
        if (!active) {
          if (list[0]) setActive(list[0].id);
          else newThread();
        }
      });
    }
  }

  const avatar =
    flash === "hai" ? hai.url : flash === "bye" ? bye.url : busy ? load.url : think.url;

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[min(560px,75vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border bg-primary px-3 py-2 text-primary-foreground">
            <img src={avatar} alt="" className="h-9 w-9 shrink-0 rounded-full border-2 border-primary-foreground/40 object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-tight">Assistant ENSTP Go</p>
              <p className="truncate text-[11px] opacity-80">
                {busy ? UI_TEXT[lang].thinking : UI_TEXT[lang].idle}
              </p>
            </div>
            <Button
              variant="ghost"
              aria-label="Conversations"
              onClick={() => setShowList((s) => !s)}
              className="rounded p-1.5 hover:bg-primary-foreground/15"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              aria-label="Nouvelle conversation"
              onClick={newThread}
              className="rounded p-1.5 hover:bg-primary-foreground/15"
            >
              <MessageSquarePlus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              aria-label="Fermer"
              onClick={toggle}
              className="rounded p-1.5 hover:bg-primary-foreground/15"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {showList ? (
            <div className="flex-1 overflow-y-auto p-2">
              {threads.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center gap-1 rounded-lg ${t.id === active ? "bg-muted" : ""}`}
                >
                  <Button
                    variant="ghost"
                    className="min-w-0 flex-1 truncate px-3 py-2 text-left text-sm"
                    onClick={() => {
                      setActive(t.id);
                      setShowList(false);
                    }}
                  >
                    {t.title}
                  </Button>
                  <Button
                    variant="ghost"
                    aria-label="Supprimer"
                    onClick={() => del(t.id)}
                    className="p-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {!threads.length && (
                <p className="p-3 text-sm text-muted-foreground">Aucune conversation.</p>
              )}
            </div>
          ) : active ? (
            <ChatThread key={active} threadId={active} onBusy={setBusy} lang={lang} onLang={setLang} />
          ) : (
            <div className="flex-1" />
          )}
        </div>
      )}
      <button
        type="button"
        onClick={toggle}
        aria-label="Ouvrir l’assistant"
        className="fixed bottom-4 right-4 z-50 block h-16 w-16 overflow-hidden rounded-full border-4 border-primary bg-mint p-0 shadow-xl transition hover:scale-105"
      >
        <img
          src={avatar}
          alt="Assistant"
          width={64}
          height={64}
          className="block h-full w-full rounded-full object-cover"
        />
      </button>
    </>
  );
}

type LangProps = { lang: Lang; onLang: (l: Lang) => void };
function ChatThread({
  threadId,
  onBusy,
  lang,
  onLang,
}: { threadId: string; onBusy: (b: boolean) => void } & LangProps) {
  const [initial, setInitial] = useState<UIMessage[] | null>(null);
  useEffect(() => {
    supabase
      .from("chat_messages")
      .select("message")
      .eq("thread_id", threadId)
      .order("created_at")
      .then(({ data }) => {
        setInitial((data ?? []).map((r) => r.message as unknown as UIMessage));
      });
  }, [threadId]);
  if (!initial) return <div className="flex-1 p-4 text-sm text-muted-foreground">Chargement…</div>;
  return <ChatBody threadId={threadId} initial={initial} onBusy={onBusy} lang={lang} onLang={onLang} />;
}

function ChatBody({
  threadId,
  initial,
  onBusy,
  lang,
  onLang,
}: {
  threadId: string;
  initial: UIMessage[];
  onBusy: (b: boolean) => void;
} & LangProps) {
  const [input, setInput] = useState("");
  const ta = useRef<HTMLTextAreaElement>(null);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: async (): Promise<Record<string, string>> => {
          const { data } = await supabase.auth.getSession();
          return { Authorization: `Bearer ${data.session?.access_token ?? ""}` };
        },
        prepareSendMessagesRequest: ({ messages }) => ({ body: { threadId, messages } }),
      }),
    [threadId],
  );
  const { messages, sendMessage, status, error, stop } = useChat({
    id: threadId,
    messages: initial,
    transport,
  });
  const working = status === "submitted" || status === "streaming";
  useEffect(() => onBusy(working), [working, onBusy]);
  useEffect(() => {
    ta.current?.focus();
  }, [status, threadId]);

  function submit() {
    const t = input.trim();
    if (!t || working) return;
    onLang(detectLanguage(t, lang));
    sendMessage({ text: t });
    setInput("");
  }

  return (
    <>
      <Conversation className="min-h-0 flex-1 text-sm">
        <ConversationContent className="gap-4 p-3">
          {!messages.length && (
            <div dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
              <MessageResponse>{UI_TEXT[lang].hello}</MessageResponse>
            </div>
          )}
          {messages.map((m) => (
            <Message key={m.id} from={m.role} className="max-w-full">
              <MessageContent
                className={
                  m.role === "user"
                    ? "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground"
                    : "w-full"
                }
              >
                {m.parts.map((p, i) => {
                  if (p.type === "text")
                    return m.role === "assistant" ? (
                      <TrilingualResponse key={i} text={p.text} />
                    ) : (
                      <MessageResponse key={i}>{p.text}</MessageResponse>
                    );
                  if (p.type === "tool-get_timetable")
                    return p.state === "output-available" ? (
                      <PdfCard key={i} o={p.output as { label: string; pdf: string; page: number }} />
                    ) : p.state === "output-error" ? null : (
                      <Shimmer key={i}>{UI_TEXT[lang].thinking}</Shimmer>
                    );
                  if (p.type === "tool-propose_video")
                    return (
                      <Tool key={i} defaultOpen={false}>
                        <ToolHeader title="Vidéo / Video / فيديو" type={p.type} state={p.state} />
                        <ToolContent>
                          <ToolInput input={p.input} />
                          {p.state === "output-available" && (
                            <VideoCard
                              v={p.input as { title: string; url: string; description: string }}
                            />
                          )}
                          {p.state === "output-error" && (
                            <ToolOutput output={undefined} errorText={p.errorText} />
                          )}
                        </ToolContent>
                      </Tool>
                    );
                  return null;
                })}
              </MessageContent>
            </Message>
          ))}
          {status === "submitted" && <Shimmer>{UI_TEXT[lang].thinking}</Shimmer>}
          {error && <p className="text-destructive">{error.message || "Erreur de l’assistant."}</p>}
        </ConversationContent>
      </Conversation>
      <div className="border-t border-border p-2">
        <PromptInput onSubmit={submit}>
          <PromptInputTextarea
            ref={ta}
            autoFocus
            aria-label="Votre question"
            dir="auto"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={UI_TEXT[lang].placeholder}
            className="max-h-28 flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit
              aria-label={working ? "Arrêter" : "Envoyer"}
              status={status}
              onStop={stop}
              disabled={!working && !input.trim()}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </>
  );
}

function TrilingualResponse({ text }: { text: string }) {
  const sections = splitTrilingual(text);
  if (!sections.some((section) => section.text)) {
    const l = detectLanguage(text);
    return (
      <div lang={l} dir={l === "ar" ? "rtl" : "ltr"} className="[overflow-wrap:anywhere]">
        <MessageResponse>{text}</MessageResponse>
      </div>
    );
  }
  return (
    <div className="grid w-full gap-3">
      {sections
        .filter((section) => section.text)
        .map((section) => (
          <section
            key={section.id}
            lang={section.id}
            dir={section.direction}
            aria-label={section.label}
            className="min-w-0 border-s-2 border-primary/30 ps-3 [overflow-wrap:anywhere]"
          >
            <h3 className="mb-1 text-xs font-bold text-primary">{section.label}</h3>
            <MessageResponse>{section.text}</MessageResponse>
          </section>
        ))}
    </div>
  );
}

function VideoCard({ v }: { v: { title: string; url: string; description: string } }) {
  const [state, setState] = useState<"ask" | "ok" | "no">("ask");
  async function confirm() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase
      .from("approved_videos")
      .insert({ user_id: u.user.id, title: v.title, url: v.url, description: v.description });
    setState(error ? "ask" : "ok");
  }
  return (
    <div className="mt-2 rounded-xl border border-border bg-muted/60 p-3">
      <p className="font-semibold">🎬 {v.title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{v.description}</p>
      <a
        href={v.url}
        target="_blank"
        rel="noreferrer"
        className="mt-1 block truncate text-xs text-primary underline"
      >
        {v.url}
      </a>
      {state === "ask" ? (
        <>
          <p className="mt-2 text-xs font-semibold">
            Souhaitez-vous intégrer cette vidéo explicative dans le site web ?
          </p>
          <div className="mt-2 flex gap-2">
            <Button
              variant="ghost"
              onClick={confirm}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              Confirmer / Ajouter
            </Button>
            <Button
              variant="ghost"
              onClick={() => setState("no")}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
            >
              Refuser
            </Button>
          </div>
        </>
      ) : (
        <p className="mt-2 text-xs font-semibold">
          {state === "ok" ? "✅ Ajoutée à la page « L’École »." : "Vidéo refusée."}
        </p>
      )}
    </div>
  );
}

function PdfCard({ o }: { o: { label: string; pdf: string; page: number } }) {
  return (
    <div className="mt-2 rounded-xl border border-border bg-muted/60 p-3">
      <p className="text-xs font-semibold">📄 {o.label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <a href={o.pdf} download className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
          Télécharger le PDF
        </a>
        <a href={`${o.pdf}#page=${o.page}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold">
          Voir (page {o.page})
        </a>
      </div>
    </div>
  );
}
