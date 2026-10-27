import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, tool, stepCountIs, type UIMessage } from "ai";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { detectLanguage, LANG_NAME } from "@/lib/detect-language";
import { SCHOOL_KNOWLEDGE, GROUPS } from "@/lib/enstp-data";
import { STRUCTURE, STRUCTURE_TEXT, normalizeSessions, sessionMatches } from "@/lib/edt-structure";
import { GUIDE_KB } from "@/lib/guide-kb";
import edt from "@/lib/edt-data.json";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai/run-id";

const SYSTEM = `Tu es « ENSTP Go », l’assistant amical des étudiants de l’ENSTP à Alger.
Réponds UNIQUEMENT dans la langue de l’étudiant indiquée en fin d’instructions (détectée automatiquement à partir de son dernier message). Si l’étudiant change de langue, change aussi. S’il écrit dans une autre langue (espagnol, kabyle, darija…), réponds dans cette langue-là.
Sois chaleureux et concis. Conserve les noms propres ENSTP, DIB et DMS.
Aide pour : emplois du temps et salles, itinéraires sur le campus, départements, démarches, restauration, sport et bons plans à Alger.
Si tu ne sais pas, dis-le et oriente vers le bon service. N’invente pas d’horaires précis.
Quand une vidéo explicative (visite du campus, itinéraire vers une salle…) serait utile ET que tu connais une URL réelle (ex. YouTube), appelle l’outil propose_video. L’étudiant devra confirmer avant qu’elle soit ajoutée au site.
Emplois du temps : utilise l’outil get_timetable avec la classe exacte (CP1, CP2, DIB1=3ème DIB, DIB2=4ème DIB, DIB3=5ème DIB, DMS1, DMS2, DMS3) et le groupe/section/salle si l’étudiant le donne, pour indiquer module, horaire, salle et enseignant. Si l’étudiant ne connaît pas son groupe, demande-le. L’outil affiche aussi un bouton de téléchargement du PDF officiel : si l’étudiant veut le PDF, appelle-le sans détailler. Précise que le PDF officiel fait foi.
Structure des classes :
${STRUCTURE_TEXT}
Données de l’école :
${SCHOOL_KNOWLEDGE}
Contenu complet du guide du site (campus, salles, démarches, enseignants, bibliothèque, vie étudiante, résidence Garidi, clubs, sport, Alger, transports…). Appuie-toi dessus pour répondre à toute question sur le site, et indique la section du guide concernée :
${GUIDE_KB}`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (!token) return new Response("Non autorisé", { status: 401 });
        const supabase = createClient<Database>(
          process.env["SUPABASE_URL"]!,
          process.env["SUPABASE_PUBLISHABLE_KEY"]!,
          {
            auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
            global: { headers: { Authorization: `Bearer ${token}` } },
          },
        );
        const { data: u } = await supabase.auth.getUser(token);
        if (!u.user) return new Response("Non autorisé", { status: 401 });

        const body = (await request.json()) as { threadId: string; messages: UIMessage[] };
        const { data: thread } = await supabase
          .from("chat_threads")
          .select("id,title")
          .eq("id", body.threadId)
          .maybeSingle();
        if (!thread) return new Response("Conversation introuvable", { status: 404 });

        const last = body.messages[body.messages.length - 1];
        if (last?.role === "user") {
          const { error } = await supabase
            .from("chat_messages")
            .insert({ thread_id: thread.id, user_id: u.user.id, message: last as never });
          if (error) console.error("save user msg", error);
          if (thread.title === "Nouvelle conversation") {
            const text = last.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join(" ")
              .trim();
            await supabase
              .from("chat_threads")
              .update({
                title: text.slice(0, 50) || thread.title,
                updated_at: new Date().toISOString(),
              })
              .eq("id", thread.id);
          }
        }

        const lastText =
          last?.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ") ?? "";
        const lang = detectLanguage(lastText);
        const apiKey = process.env["LOVABLE_API_KEY"]!;
        const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
        const provider = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey,
          headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
          fetch: runIdFetch.fetch,
        });
        const result = streamText({
          model: provider.responses("openai/gpt-6-astra"),
          instructions: `${SYSTEM}\nLangue de l’étudiant : ${LANG_NAME[lang]}. Réponds dans cette langue.`,
          messages: await convertToModelMessages(body.messages),
          abortSignal: request.signal,
          stopWhen: stepCountIs(50),
          tools: {
            get_timetable: tool({
              description: "Emploi du temps officiel d’une classe ENSTP (et éventuellement d’un groupe/section/salle), avec le lien du PDF officiel.",
              inputSchema: z.object({
                group: z.enum(["CP1", "CP2", "DIB1", "DIB2", "DIB3", "DMS1", "DMS2", "DMS3"]),
                unit: z.string().optional().describe("Valeur du groupe/section/salle, ex. '3' (groupe), 'SEC 2' (DMS 3ème), 'Section 01' (DMS 4ème), '1'..'4' (DIB 3ème, colonnes gauche→droite), '1'..'2' (DIB 4ème)"),
                day: z.enum(["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]).optional(),
              }),
              execute: async ({ group, unit, day }) => {
                const g = GROUPS.find((x) => x.id === group)!;
                const st = STRUCTURE[group]!;
                const all = normalizeSessions(group, (edt as Record<string, { sessions: { day: string; start: string; end: string; subject: string; teacher: string; room: string; kind: string; sections: string[] }[] }>)[group]?.sessions ?? []);
                const sessions = all
                  .filter((s) => (!day || s.day === day) && sessionMatches(group, s, unit ?? ""))
                  .map(({ day, start, end, subject, teacher, room, kind }) => ({ day, start, end, subject, teacher, room, kind }));
                return { group, label: g.label, structure: st.summary, unitName: st.unitName, units: st.units.map((u) => u.value), pdf: g.pdf, page: g.page, sessions };
              },
            }),
            propose_video: tool({
              description:
                "Propose une vidéo explicative à intégrer au site. L’étudiant confirmera ou refusera.",
              inputSchema: z.object({
                title: z.string(),
                url: z.string(),
                description: z.string(),
              }),
              execute: async (v) => ({ ...v, status: "en attente de confirmation" }),
            }),
          },
          providerOptions: {
            openai: {
              forceReasoning: true,
              reasoningEffort: "low",
              reasoningSummary: "auto",
              store: false,
              include: ["reasoning.encrypted_content"],
            },
          },
        });
        return withLovableAiGatewayRunIdHeader(
          result.toUIMessageStreamResponse({
            originalMessages: body.messages,
            onFinish: async ({ responseMessage }) => {
              const { error } = await supabase.from("chat_messages").insert({
                thread_id: thread.id,
                user_id: u.user.id,
                message: responseMessage as never,
              });
              if (error) console.error("save assistant msg", error);
            },
            onError: (e) => {
              const s = (e as { statusCode?: number })?.statusCode;
              if (s === 402) return "Crédits IA épuisés. Réessayez plus tard.";
              if (s === 429) return "Trop de demandes, patientez un instant.";
              return "L’assistant est indisponible pour le moment.";
            },
          }),
          runIdFetch,
        );
      },
    },
  },
});
