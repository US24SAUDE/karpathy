"use client";

import { motion } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MicButtonProps {
  value: string;
  onChange: (next: string) => void;
  // BCP-47 tag; defaults to the browser's locale (e.g. pt-BR) at runtime.
  lang?: string;
}

export default function MicButton({ value, onChange, lang }: MicButtonProps) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const baseRef = useRef("");
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    const SR =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition
        : null;
    if (!SR) {
      setSupported(false);
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang || navigator.language || "en-US";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      const base = baseRef.current;
      const sep = base && !base.endsWith(" ") ? " " : "";
      onChange(base + sep + transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
    };
  }, [lang, onChange]);

  function toggle() {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      baseRef.current = valueRef.current;
      try {
        recognition.start();
        setListening(true);
      } catch {
        /* start() throws if invoked while already active */
      }
    }
  }

  if (!supported) {
    return (
      <button
        type="button"
        disabled
        title="Voice input isn't supported in this browser — try Chrome or Edge"
        className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-xl text-faint opacity-40"
      >
        <MicOff size={16} />
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggle}
      title={listening ? "Stop dictation" : "Speak to type"}
      className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition ${
        listening ? "text-white" : "text-muted hover:text-ink"
      }`}
      style={
        listening
          ? { background: "linear-gradient(135deg,#A83722,#8E5916)" }
          : { background: "rgba(255,255,255,0.05)" }
      }
    >
      <Mic size={16} />
      {listening && (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-xl"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(251,113,133,0.5)",
              "0 0 0 8px rgba(251,113,133,0)",
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}
