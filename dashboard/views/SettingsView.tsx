"use client";

import { motion } from "framer-motion";
import {
  Check,
  FolderSync,
  Loader2,
  Settings,
  Shield,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getVaultPath, pingVault, setVaultPath } from "@/lib/vault";
import { PROVIDERS } from "@/lib/providers";
import ProviderKeyCard from "@/components/ProviderKeyCard";

export default function SettingsView() {
  const [vault, setVault] = useState("");
  const [vaultStored, setVaultStored] = useState(false);
  const [testing, setTesting] = useState(false);
  const [vaultResult, setVaultResult] = useState<
    { ok: boolean; msg: string } | null
  >(null);

  useEffect(() => {
    const v = getVaultPath();
    if (v) {
      setVault(v);
      setVaultStored(true);
    }
  }, []);

  async function saveVault() {
    setVaultPath(vault);
    setVaultStored(!!vault.trim());
    setVaultResult(null);
    if (!vault.trim()) return;
    setTesting(true);
    const res = await pingVault(vault.trim());
    setTesting(false);
    setVaultResult(
      res.ok
        ? { ok: true, msg: `Connected — writing to ${res.path}` }
        : { ok: false, msg: res.error || "Could not reach the vault" }
    );
  }

  function clearVault() {
    setVaultPath("");
    setVault("");
    setVaultStored(false);
    setVaultResult(null);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Settings className="text-indigo" size={24} /> Settings
        </h1>
        <p className="mt-1 text-sm text-muted">
          Connect CLAUDE OS to your own models
        </p>
      </div>

      {/* provider API keys */}
      {PROVIDERS.map((p, i) => (
        <ProviderKeyCard key={p.id} provider={p} delay={i * 0.03} />
      ))}

      <div className="flex items-start gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[11px] text-faint">
        <Shield size={14} className="mt-0.5 flex-shrink-0 text-emerald" />
        <span>
          Keys never leave your machine except to call each provider directly
          through this local server. They are kept in <code>localStorage</code>{" "}
          and sent only with console requests. Without a key, the console runs
          in simulation mode. Pick which model to use in the Console&apos;s model
          selector.
        </span>
      </div>

      {/* obsidian vault */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
        className="rounded-2xl glass-strong p-5"
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan/20 text-cyan">
            <FolderSync size={18} />
          </span>
          <div>
            <div className="text-sm font-semibold text-ink">Obsidian Vault</div>
            <div className="text-[11px] text-faint">
              Auto-save chats, goals &amp; journal to an <code>Agentic OS</code> folder
            </div>
          </div>
          {vaultStored && (
            <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald/15 px-2.5 py-1 text-[10px] font-semibold text-emerald">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald" /> syncing
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={vault}
            onChange={(e) => setVault(e.target.value)}
            placeholder="/Users/you/Documents/Obsidian Vault"
            className="w-full flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 font-mono text-sm text-ink outline-none transition focus:border-cyan/50"
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={saveVault}
            disabled={testing}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#c0c5ce,#1d4ed8)" }}
          >
            {testing ? <Loader2 size={16} className="animate-spin" /> : null}
            {testing ? "Testing" : "Save & Test"}
          </motion.button>
          {vaultStored && (
            <button
              onClick={clearVault}
              className="flex items-center justify-center rounded-xl border border-rose/30 bg-rose/10 px-3 text-rose transition hover:bg-rose/20"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {vaultResult && (
          <div
            className={`mt-3 flex items-start gap-2 rounded-xl border p-3 text-[11px] ${
              vaultResult.ok
                ? "border-emerald/20 bg-emerald/5 text-emerald"
                : "border-rose/20 bg-rose/5 text-rose"
            }`}
          >
            {vaultResult.ok ? (
              <Check size={14} className="mt-0.5 flex-shrink-0" />
            ) : (
              <Shield size={14} className="mt-0.5 flex-shrink-0" />
            )}
            <span className="break-all">{vaultResult.msg}</span>
          </div>
        )}

        <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[11px] text-faint">
          <Shield size={14} className="mt-0.5 flex-shrink-0 text-cyan" />
          <span>
            Point this at your local Obsidian vault folder. Files are written by
            the local server to <code>&lt;vault&gt;/Agentic OS/</code> — chats land
            in <code>Chats/</code> (one file per agent per day), plus
            <code> Goals/</code> and <code>Journal/</code>. Only works when CLAUDE
            OS runs on the same machine as the vault.
          </span>
        </div>
      </motion.div>

      {/* about */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="rounded-2xl glass-strong p-5"
      >
        <div className="text-sm font-semibold text-ink">About CLAUDE OS</div>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">
          A locally-hosted mission control for orchestrating Claude and a fleet
          of autonomous agents. Built with Next.js, Tailwind CSS, and Framer
          Motion. Telemetry on this build is simulated for demonstration; the
          Console is a real link to Claude when an API key is set.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["Next.js", "Tailwind CSS", "Framer Motion", "Anthropic API"].map(
            (t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-muted"
              >
                {t}
              </span>
            )
          )}
        </div>
      </motion.div>
    </div>
  );
}
