"use client";

export interface ModelOption {
  id: string;
  label: string;
}

export type ProviderId = "anthropic" | "openai" | "xai" | "glm";

export interface ProviderMeta {
  id: ProviderId;
  name: string;
  blurb: string;
  storageKey: string;
  placeholder: string;
  accent: string;
  docsUrl: string;
  models: ModelOption[];
}

export const PROVIDERS: ProviderMeta[] = [
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    blurb: "Powers Claude models in the Console",
    storageKey: "claude-os-key",
    placeholder: "sk-ant-...",
    accent: "#a855f7",
    docsUrl: "https://console.anthropic.com/settings/keys",
    models: [
      { id: "claude-opus-4-7", label: "Opus 4.7" },
      { id: "claude-sonnet-4-6", label: "Sonnet 4.6" },
      { id: "claude-haiku-4-5", label: "Haiku 4.5" },
    ],
  },
  {
    id: "openai",
    name: "OpenAI (ChatGPT)",
    blurb: "GPT-4o and o-series models",
    storageKey: "claude-os-key-openai",
    placeholder: "sk-...",
    accent: "#10a37f",
    docsUrl: "https://platform.openai.com/api-keys",
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
