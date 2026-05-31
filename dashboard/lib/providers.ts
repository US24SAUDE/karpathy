"use client";

export interface ModelOption {
  id: string;
  label: string;
}

export type ProviderId =
  | "anthropic"
  | "openai"
  | "xai"
  | "glm"
  | "hermes"
  | "claude-cli"
  | "openclaw";

export type ProviderKind = "api" | "cli";

export interface ProviderMeta {
  id: ProviderId;
  name: string;
  blurb: string;
  storageKey: string;
  placeholder: string;
  accent: string;
  docsUrl: string;
  models: ModelOption[];
  kind: ProviderKind;
  cli?: { cmd: string; args?: string[] };
}

export const PROVIDERS: ProviderMeta[] = [
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    blurb: "Powers Claude models in the Console",
    storageKey: "claude-os-key",
    placeholder: "sk-ant-...",
    accent: "#B9822D",
    docsUrl: "https://console.anthropic.com/settings/keys",
    kind: "api",
    models: [
      { id: "claude-opus-4-7", label: "Opus 4.7" },
      { id: "claude-sonnet-4-6", label: "Sonnet 4.6" },
      { id: "claude-haiku-4-5", label: "Haiku 4.5" },
    ],
  },
  {
    id: "claude-cli",
    name: "Claude Code (local CLI)",
    blurb: "Uses your Claude Max subscription via the local CLI",
    storageKey: "claude-os-cli-claude",
    placeholder: "no key needed",
    accent: "#B9822D",
    docsUrl: "https://docs.claude.com/claude-code",
    kind: "cli",
    cli: { cmd: "claude", args: ["--print"] },
    models: [{ id: "claude-cli-default", label: "Claude Code" }],
  },
  {
    id: "hermes",
    name: "Hermes Agent (local CLI)",
    blurb: "Self-improving agent from Nous Research, runs locally",
    storageKey: "claude-os-cli-hermes",
    placeholder: "no key needed",
    accent: "#f59e0b",
    docsUrl: "https://github.com/nousresearch/hermes-agent",
    kind: "cli",
    cli: { cmd: "hermes", args: ["-z"] },
    models: [{ id: "hermes-default", label: "Hermes" }],
  },
  {
    id: "openclaw",
    name: "OpenClaw (local CLI)",
    blurb: "Personal AI assistant that runs locally on your device",
    storageKey: "claude-os-cli-openclaw",
    placeholder: "no key needed",
    accent: "#6B7E4E",
    docsUrl: "https://github.com/openclaw/openclaw",
    kind: "cli",
    cli: { cmd: "openclaw", args: ["agent", "--message"] },
    models: [{ id: "openclaw-default", label: "OpenClaw" }],
  },
  {
    id: "openai",
    name: "OpenAI (ChatGPT)",
    blurb: "GPT-4o and o-series models",
    storageKey: "claude-os-key-openai",
    placeholder: "sk-...",
    accent: "#10a37f",
    docsUrl: "https://platform.openai.com/api-keys",
    kind: "api",
    models: [
      { id: "gpt-4o", label: "GPT-4o" },
      { id: "gpt-4o-mini", label: "GPT-4o mini" },
      { id: "o3-mini", label: "o3-mini" },
    ],
  },
  {
    id: "xai",
    name: "xAI (Grok)",
    blurb: "Grok models from xAI",
    storageKey: "claude-os-key-xai",
    placeholder: "xai-...",
    accent: "#e5e7eb",
    docsUrl: "https://console.x.ai",
    kind: "api",
    models: [
      { id: "grok-2-latest", label: "Grok 2" },
      { id: "grok-beta", label: "Grok Beta" },
    ],
  },
  {
    id: "glm",
    name: "Zhipu (GLM)",
    blurb: "GLM models from Zhipu AI",
    storageKey: "claude-os-key-glm",
    placeholder: "your-glm-key...",
    accent: "#3b82f6",
    docsUrl: "https://open.bigmodel.cn/usercenter/apikeys",
    kind: "api",
    models: [
      { id: "glm-4-plus", label: "GLM-4 Plus" },
      { id: "glm-4", label: "GLM-4" },
      { id: "glm-4-flash", label: "GLM-4 Flash" },
    ],
  },
];

export function getProviderKey(storageKey: string): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(storageKey) || "";
}

export function providerForModel(modelId: string): ProviderMeta {
  return (
    PROVIDERS.find((p) => p.models.some((m) => m.id === modelId)) ?? PROVIDERS[0]
  );
}

export const ALL_MODELS: { provider: ProviderMeta; model: ModelOption }[] =
  PROVIDERS.flatMap((provider) =>
    provider.models.map((model) => ({ provider, model }))
  );
