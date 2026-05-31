"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  FolderSearch,
  KeyRound,
  Loader2,
  Rocket,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { APP_CONFIG } from "@/config";
import { PROVIDERS } from "@/lib/providers";

interface DetectedCli {
  id: string;
  name: string;
  path: string | null;
  docsUrl: string;
}

interface DetectResponse {
  cli: DetectedCli[];
  vaults: string[];
  platform: string;
  home: string;
}

export default function SetupWizard({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [detect, setDetect] = useState<DetectResponse | null>(null);
  const [vault, setVault] = useState("");
  const [keys, setKeys] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/detect")
      .then((r) => r.json())
      .then((d: DetectResponse) => {
        setDetect(d);
        if (d.vaults[0]) setVault(d.vaults[0]);
      })
      .catch(() => setDetect({ cli: [], vaults: [], platform: "", home: "" }));
  }, []);

  function finish() {
    if (vault.trim()) {
      localStorage.setItem(APP_CONFIG.storage.vault, vault.trim());
    }
    for (const p of PROVIDERS) {
      const k = keys[p.id]?.trim();
      if (k) localStorage.setItem(p.storageKey, k);
    }
    localStorage.setItem(APP_CONFIG.storage.setupComplete, "1");
    onDone();
  }

  function skip() {
    localStorage.setItem(APP_CONFIG.storage.setupComplete, "1");
    onDone();
  }

  const installedCli = detect?.cli.filter((c) => c.path) ?? [];
  const missingCli = detect?.cli.filter((c) => !c.path) ?? [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center p-6"
      >
        <div className="absolute inset-0 bg-void/70 backdrop-blur-md" />
        <motion.div
          initial={{ scale: 0.96, y: 8, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="relative w-[640px] max-w-[94vw] overflow-hidden rounded-3xl glass-strong shadow-2xl"
          style={{ boxShadow: "0 30px 90px rgba(0,0,0,0.7)" }}
        >
          {/* header */}
          <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
            <div className="flex items-center gap-2">
              <Sparkles className="text-violet" size={18} />
              <span className="text-sm font-semibold tracking-wide text-ink">
                {APP_CONFIG.name} · Setup
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-6 rounded-full transition ${
                      i <= step ? "bg-violet" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={skip}
                className="ml-3 text-faint hover:text-muted"
                title="Skip setup"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* body */}
          <div className="min-h-[340px] p-6">
            {step === 0 && (
              <div className="space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-magenta via-violet to-cyan text-2xl">
                  ✦
                </div>
                <h2 className="text-2xl font-bold text-ink">
                  Welcome to {APP_CONFIG.name}
                </h2>
                <p className="text-sm text-muted">
                  {APP_CONFIG.description} This wizard will set up the dashboard
                  in three steps: detect your AI agents, link your Obsidian
                  vault, and (optionally) save provider API keys.
                </p>
                <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3 text-[11px] text-faint">
                  Everything is stored locally on this machine. No data leaves
                  your computer except direct calls to providers you configure.
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
                  <Rocket size={20} className="text-violet" /> Agents on this
                  machine
                </h2>
                {!detect ? (
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Loader2 size={16} className="animate-spin" /> Scanning…
                  </div>
                ) : (
                  <>
                    {installedCli.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald">
                          Detected
                        </div>
                        {installedCli.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center gap-3 rounded-xl border border-emerald/20 bg-emerald/5 px-3 py-2"
                          >
                            <Check size={14} className="text-emerald" />
                            <div className="flex-1">
                              <div className="text-sm text-ink">{c.name}</div>
                              <div className="truncate font-mono text-[10px] text-faint">
                                {c.path}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {missingCli.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-faint">
                          Not installed
                        </div>
                        {missingCli.map((c) => (
                          <a
                            key={c.id}
                            href={c.docsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 transition hover:border-white/15"
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-faint" />
                            <div className="flex-1">
                              <div className="text-sm text-muted">{c.name}</div>
                              <div className="text-[10px] text-faint">
                                Install instructions →
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                    {installedCli.length === 0 && missingCli.length === 0 && (
                      <div className="text-sm text-muted">
                        No agents detected. You can still chat via API keys.
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
                  <FolderSearch size={20} className="text-cyan" /> Obsidian vault
                </h2>
                <p className="text-sm text-muted">
                  Chats, goals, and journal entries auto-save into{" "}
                  <code>{APP_CONFIG.vaultRootFolder}/</code> inside your vault.
                  Paste the path or pick one we detected.
                </p>
                {detect && detect.vaults.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-faint">
                      Detected vaults
                    </div>
                    {detect.vaults.map((v) => (
                      <button
                        key={v}
                        onClick={() => setVault(v)}
                        className={`w-full rounded-xl border px-3 py-2 text-left font-mono text-xs transition ${
                          vault === v
                            ? "border-cyan/40 bg-cyan/5 text-cyan"
                            : "border-white/8 bg-white/[0.02] text-muted hover:border-white/20"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  value={vault}
                  onChange={(e) => setVault(e.target.value)}
                  placeholder={
                    detect?.platform === "win32"
                      ? "C:\\Users\\you\\Documents\\Obsidian Vault"
                      : "/Users/you/Documents/Obsidian Vault"
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 font-mono text-sm text-ink outline-none transition focus:border-cyan/50"
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
                  <KeyRound size={20} className="text-amber" /> Provider keys
                  (optional)
                </h2>
                <p className="text-sm text-muted">
                  Drop any keys you already have. Skip what you don&apos;t —
                  you can always add them later in Settings.
                </p>
                <div className="space-y-2">
                  {PROVIDERS.map((p) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <div className="w-32 text-xs text-muted">{p.name}</div>
                      <input
                        type="password"
                        value={keys[p.id] || ""}
                        onChange={(e) =>
                          setKeys((prev) => ({ ...prev, [p.id]: e.target.value }))
                        }
                        placeholder={p.placeholder}
                        className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-ink outline-none focus:border-violet/50"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* footer */}
          <div className="flex items-center justify-between border-t border-white/8 px-6 py-4">
            <button
              onClick={skip}
              className="text-xs text-faint hover:text-muted"
            >
              Skip setup
            </button>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => (s - 1) as 0 | 1 | 2 | 3)}
                  className="rounded-lg px-3 py-2 text-xs text-muted hover:bg-white/5"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep((s) => (s + 1) as 0 | 1 | 2 | 3)}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg,#d4af37,#1d4ed8)" }}
                >
                  Next <ArrowRight size={14} />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={finish}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg,#c0c5ce,#d4af37)" }}
                >
                  <Check size={14} /> Finish
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
