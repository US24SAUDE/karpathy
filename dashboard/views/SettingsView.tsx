"use client";

import { motion } from "framer-motion";
import {
  Check,
  Eye,
  EyeOff,
  FolderSync,
  KeyRound,
  Loader2,
  Settings,
  Shield,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getVaultPath, pingVault, setVaultPath } from "@/lib/vault";

export default function SettingsView() {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [stored, setStored] = useState(false);

  const [vault, setVault] = useState("");
  const [vaultStored, setVaultStored] = useState(false);
  const [testing, setTesting] = useState(false);
  const [vaultResult, setVaultResult] = useState<
    { ok: boolean; msg: string } | null
  >(null);

  useEffect(() => {
    const k = localStorage.getItem("claude-os-key");
    if (k) {
      setKey(k);
      setStored(true);
    }
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

  function save() {
    if (key.trim()) {
      localStorage.setItem("claude-os-key", key.trim());
      setStored(true);
    } else {
      localStorage.removeItem("claude-os-key");
      setStored(false);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  function clear() {
    localStorage.removeItem("claude-os-key");
    setKey("");
    setStored(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Settings className="text-indigo" size={24} /> Settings
        </h1>
        <p className="mt-1 text-sm text-muted">
          Connect CLAUDE OS to your own Claude
        </p>
      </div>

      {/* API key */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl glass-strong p-5"
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet/20 text-violet">
            <KeyRound size={18} />
          </span>
          <div>
            <div className="text-sm font-semibold text-ink">
              Anthropic API Key
            </div>
            <div className="text-[11px] text-faint">
              Powers the Claude Console · stored only in your browser
            </div>
          </div>
          {stored && (
            <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald/15 px-2.5 py-1 text-[10px] font-semibold text-emerald">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald" /> connected
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={reveal ? "text" : "password"}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 pr-10 font-mono text-sm text-ink outline-none transition focus:border-violet/50"
            />
            <button
              onClick={() => setReveal((r) => !r)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-muted"
            >
              {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={save}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#a855f7,#6366f1)" }}
          >
            {saved ? <Check size={16} /> : null}
            {saved ? "Saved" : "Save"}
          </motion.button>
          {stored && (
            <button
              onClick={clear}
              className="flex items-center justify-center rounded-xl border border-rose/30 bg-rose/10 px-3 text-rose transition hover:bg-rose/20"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[11px] text-faint">
          <Shield size={14} className="mt-0.5 flex-shrink-0 text-emerald" />
          <span>
            Your key never leaves your machine except to call Anthropic directly
            through this local server. It is kept in <code>localStorage</code>{" "}
            and sent only with console requests. Without a key, the console runs
            in simulation mode.
          </span>
        </div>
      </motion.div>

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
            style={{ background: "linear-gradient(135deg,#22d3ee,#6366f1)" }}
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
