/**
 * Central configuration for CLAUDE OS.
 * All hardcoded paths, names, and defaults live here.
 * User-specific runtime config (API keys, vault path) is stored in localStorage
 * and configured via the Settings view or first-run Setup Wizard.
 */

export const APP_CONFIG = {
  name: "CLAUDE OS",
  tagline: "Mission Control",
  description:
    "A locally-hosted mission control for orchestrating Claude and a fleet of autonomous agents.",
  port: 3005,

  // Where chats, goals, and journal entries are written inside the Obsidian vault
  vaultRootFolder: "Agentic OS",
  vaultSubfolders: {
    chats: "Chats",
    goals: "Goals",
    journal: "Journal",
  },

  // localStorage keys
  storage: {
    anthropicKey: "claude-os-key",
    vault: "claude-os-vault",
    goals: "claude-os-goals",
    journal: "claude-os-journal",
    setupComplete: "claude-os-setup-complete",
    preferredCli: "claude-os-preferred-cli",
  },

  // Default system prompt for the Claude Code CLI fallback
  defaultSystemPrompt:
    "You are the core intelligence of CLAUDE OS Mission Control — a command center orchestrating a fleet of AI agents (Atlas: research, Nova: code, Orion: ML, Echo: comms, Sentinel: monitoring, Forge: devops). Be concise, sharp, and a little futuristic in tone. Help the operator manage their agents and answer their questions.",

  // Repository for one-command install
  repo: "https://github.com/us24saude/karpathy.git",
} as const;
