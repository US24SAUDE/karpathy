"use client";

import { motion } from "framer-motion";
import { Check, Copy, Loader2, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import {
  ALL_MODELS,
  PROVIDERS,
  getProviderKey,
  providerForModel,
} from "@/lib/providers";

type Phase = "idle" | "drafting" | "reviewing" | "done";

interface Panel {
  modelId: string;
  label: string;
  reply: string;
  loading: boolean;
  copied: boolean;
}

async function callModel(opts: {
  modelId: string;
  system: string;
  prompt: string;
}): Promise<string> {
  const provider = providerForModel(opts.modelId);
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: opts.prompt }],
      model: opts.modelId,
      provider: provider.id,
      apiKey:
        provider.kind === "api"
          ? getProviderKey(provider.storageKey) || undefined
          : undefined,
      system: opts.system,
    }),
  });
  const data = await res.json();
  return data.reply || data.error || "(no response)";
}

export default function DraftReviewView() {
  const defaultDraft = PROVIDERS[0].models[1]?.id ?? PROVIDERS[0].models[0].id;
  const defaultReview =
    PROVIDERS.find((p) => p.id !== "anthropic")?.models[0].id ??
    PROVIDERS[0].models[2]?.id ??
    defaultDraft;

  const [prompt, setPrompt] = useState("");
  const [draftModel, setDraftModel] = useState(defaultDraft);
  const [reviewModel, setReviewModel] = useState(defaultReview);
  const [phase, setPhase] = useState<Phase>("idle");
  const [draft, setDraft] = useState<Panel>({
    modelId: defaultDraft,
    label: "",
    reply: "",
    loading: false,
    copied: false,
  });
  const [review, setReview] = useState<Panel>({
    modelId: defaultReview,
    label: "",
    reply: "",
    loading: false,
    copied: false,
  });

  function copyPanel(which: "draft" | "review") {
    const target = which === "draft" ? draft : review;
    if (!target.reply) return;
    navigator.clipboard.writeText(target.reply).then(() => {
      const setter = which === "draft" ? setDraft : setReview;
      setter((p) => ({ ...p, copied: true }));
      setTimeout(() => setter((p) => ({ ...p, copied: false })), 1500);
    });
  }

  async function run() {
    const text = prompt.trim();
    if (!text || phase === "drafting" || phase === "reviewing") return;

    const draftProvider = providerForModel(draftModel);
    const reviewProvider = providerForModel(reviewModel);

    setDraft({
      modelId: draftModel,
      label: `${draftProvider.name} · ${draftProvider.models.find((m) => m.id === draftModel)?.label ?? draftModel}`,
      reply: "",
      loading: true,
      copied: false,
    });
    setReview({
      modelId: reviewModel,
      label: `${reviewProvider.name} · ${reviewProvider.models.find((m) => m.id === reviewModel)?.label ?? reviewModel}`,
      reply: "",
      loading: false,
      copied: false,
    });

    setPhase("drafting");
    let draftText = "";
    try {
      draftText = await callModel({
        modelId: draftModel,
        system: "You are drafting a response. Be substantive and well-structured.",
        prompt: text,
      });
    } catch (e) {
      draftText = `⚠ Draft failed: ${(e as Error).message}`;
    }
    setDraft((p) => ({ ...p, reply: draftText, loading: false }));

    setReview((p) => ({ ...p, loading: true }));
    setPhase("reviewing");
    const reviewPrompt = `Original prompt:\n${text}\n\n---\nDraft to review:\n${draftText}\n\n---\nReview this draft. Identify strengths, weaknesses, factual issues, and suggest concrete improvements. End with a 1–10 score and a one-line verdict.`;
    let reviewText = "";
    try {
      reviewText = await callModel({
        modelId: reviewModel,
        system:
          "You are an expert critical reviewer. Be specific, honest, and constructive. No throat-clearing.",
        prompt: reviewPrompt,
      });
    } catch (e) {
      reviewText = `⚠ Review failed: ${(e as Error).message}`;
    }
    setReview((p) => ({ ...p, reply: reviewText, loading: false }));
    setPhase("done");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Wand2 className="text-violet" size={22} /> Draft &amp; Review
        </h1>
        <p className="mt-1 text-sm text-muted">
          One model drafts. Another critiques. You see both side by side.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl glass-strong p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ModelPicker
            label="Draft with"
            accent="#B9822D"
            value={draftModel}
            onChange={setDraftModel}
          />
          <ModelPicker
            label="Review with"
            accent="#54718A"
            value={reviewModel}
            onChange={setReviewModel}
          />
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              run();
            }
          }}
          rows={3}
          placeholder="What should the draft be about?  (⌘/Ctrl+Enter to run)"
          className="w-full resize-none rounded-xl border border-ink/12 bg-abyss/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-violet/50"
        />

        <div className="flex items-center justify-between">
          <div className="text-[11px] text-faint">
            {phase === "drafting" && "Drafting…"}
            {phase === "reviewing" && "Sending draft to reviewer…"}
            {phase === "done" && "Both ready."}
            {phase === "idle" && "Pick two models and write a prompt."}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={run}
            disabled={!prompt.trim() || phase === "drafting" || phase === "reviewing"}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#B9822D,#54718A)" }}
          >
            {phase === "drafting" || phase === "reviewing" ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Sparkles size={15} />
            )}
            {phase === "done" ? "Run again" : "Generate"}
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReplyPanel
          kind="Draft"
          accent="#B9822D"
          panel={draft}
          onCopy={() => copyPanel("draft")}
        />
        <ReplyPanel
          kind="Review"
          accent="#54718A"
          panel={review}
          onCopy={() => copyPanel("review")}
        />
      </div>
    </div>
  );
}

function ModelPicker({
  label,
  value,
  onChange,
  accent,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  accent: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: accent }}
      >
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-ink/12 bg-abyss/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-violet/50"
        style={{ borderColor: `${accent}55` }}
      >
        {PROVIDERS.map((p) => (
          <optgroup key={p.id} label={p.name}>
            {p.models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

function ReplyPanel({
  kind,
  panel,
  accent,
  onCopy,
}: {
  kind: "Draft" | "Review";
  panel: Panel;
  accent: string;
  onCopy: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[300px] flex-col overflow-hidden rounded-2xl glass-strong"
    >
      <div
        className="flex items-center gap-2 border-b border-ink/8 px-4 py-2.5"
        style={{ background: `${accent}12` }}
      >
        <span
          className="rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{ background: `${accent}33`, color: accent }}
        >
          {kind}
        </span>
        <span className="truncate text-xs text-muted">
          {panel.label || "no model selected"}
        </span>
        <button
          onClick={onCopy}
          disabled={!panel.reply}
          title="Copy"
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-faint transition hover:bg-ink/5 hover:text-ink disabled:opacity-30"
        >
          {panel.copied ? (
            <Check size={14} className="text-emerald" />
          ) : (
            <Copy size={14} />
          )}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 text-sm leading-relaxed text-ink">
        {panel.loading ? (
          <span className="flex items-center gap-2 text-faint">
            <Loader2 size={14} className="animate-spin" />
            {kind === "Draft" ? "drafting…" : "reviewing…"}
          </span>
        ) : panel.reply ? (
          <pre className="whitespace-pre-wrap break-words font-sans">
            {panel.reply}
          </pre>
        ) : (
          <span className="text-faint">
            {kind === "Draft"
              ? "The draft will appear here."
              : "Once the draft is ready, the reviewer's critique lands here."}
          </span>
        )}
      </div>
    </motion.div>
  );
}
