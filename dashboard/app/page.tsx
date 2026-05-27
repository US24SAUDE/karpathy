"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import AuroraBackground from "@/components/AuroraBackground";
import BootSequence from "@/components/BootSequence";
import TopBar from "@/components/TopBar";
import Dock, { type ViewId } from "@/components/Dock";
import CommandPalette from "@/components/CommandPalette";
import { SystemProvider } from "@/lib/system";
import MissionControl from "@/views/MissionControl";
import AgentsView from "@/views/AgentsView";
import ActivityView from "@/views/ActivityView";
import AnalyticsView from "@/views/AnalyticsView";
import ConsoleView from "@/views/ConsoleView";
import SettingsView from "@/views/SettingsView";

export default function Page() {
  const [booted, setBooted] = useState(false);
  const [view, setView] = useState<ViewId>("mission");
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <SystemProvider>
      <AuroraBackground />

      <AnimatePresence>
        {!booted && <BootSequence onDone={() => setBooted(true)} />}
      </AnimatePresence>

      <AnimatePresence>
        {booted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 flex h-screen flex-col"
          >
            <TopBar onOpenPalette={() => setPaletteOpen(true)} />
            <div className="flex min-h-0 flex-1">
              <Dock active={view} onSelect={setView} />
              <main className="min-w-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={view}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {view === "mission" && (
                      <MissionControl onOpenConsole={() => setView("console")} />
                    )}
                    {view === "agents" && <AgentsView />}
                    {view === "activity" && <ActivityView />}
                    {view === "analytics" && <AnalyticsView />}
                    {view === "console" && <ConsoleView />}
                    {view === "settings" && <SettingsView />}
                  </motion.div>
                </AnimatePresence>
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelect={setView}
      />
    </SystemProvider>
  );
}
