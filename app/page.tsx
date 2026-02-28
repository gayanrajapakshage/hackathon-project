"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Axe, Shield, RefreshCw, Zap } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { UploadZone } from "@/components/UploadZone";
import { Gauge } from "@/components/Gauge";
import { TerminalOutput } from "@/components/TerminalOutput";

type AppState = "idle" | "loading" | "result";

interface JudgeResult {
  score: number;
  aura_level: "Negative" | "Neutral" | "Infinite";
  breakdown: {
    fit_check: string;
    cinematography: string;
    absurdity_factor: string;
  };
  verdict: string;
}

const LOADING_LINES = [
  "INITIALIZING AURA SCANNER...",
  "CALIBRATING GRIT DETECTOR...",
  "ANALYZING SWAGGER LEVELS...",
  "CROSS-REFERENCING TUFF DATABASE...",
  "COMPUTING FINAL VERDICT...",
];

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [loadingLine, setLoadingLine] = useState(0);

  const handleImageReady = useCallback(
    (b64: string, previewUrl: string, mime: string) => {
      setBase64(b64);
      setPreview(previewUrl);
      setMimeType(mime);
    },
    []
  );

  const handleClear = useCallback(() => {
    setBase64(null);
    setPreview(null);
  }, []);

  const handleJudge = async () => {
    if (!base64) return;
    setAppState("loading");

    let lineIdx = 0;
    const lineTimer = setInterval(() => {
      lineIdx = (lineIdx + 1) % LOADING_LINES.length;
      setLoadingLine(lineIdx);
    }, 900);

    try {
      const res = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mimeType }),
      });

      if (!res.ok) throw new Error("API error");

      const data: JudgeResult = await res.json();
      setResult(data);
      setAppState("result");
    } catch {
      toast.error("SYSTEM FAILURE // Could not analyze tuffness. Try again.", {
        style: {
          background: "#000",
          border: "2px solid #FF3333",
          color: "#FF3333",
          fontFamily: "'Space Mono', monospace",
          fontSize: "12px",
        },
      });
      setAppState("idle");
    } finally {
      clearInterval(lineTimer);
    }
  };

  const handleReset = () => {
    setAppState("idle");
    setPreview(null);
    setBase64(null);
    setResult(null);
    setLoadingLine(0);
  };

  return (
    <div className="h-screen bg-black text-[#39FF14] font-mono flex flex-col overflow-hidden relative">
      {/* Global scanline overlay */}
      <div className="fixed inset-0 scanline pointer-events-none z-50" />

      <Toaster />

      {/* ── Header ─────────────────────────────────────── */}
      <header className="flex-none border-b-4 border-[#39FF14] px-5 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Axe size={22} strokeWidth={1.5} className="neon-text" />
          <h1 className="text-base sm:text-lg font-bold tracking-[0.4em] uppercase neon-text">
            TUFF-O-METER
          </h1>
        </div>
        <div className="flex items-center gap-2 text-[#39FF14]/40 text-[10px] tracking-widest">
          <Shield size={12} />
          <span className="hidden sm:inline">SYS:ACTIVE // BUILD:1.0</span>
          <span className="sm:hidden">ACTIVE</span>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* ── IDLE STATE ── */}
          {appState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md space-y-5"
            >
              <div className="text-center space-y-0.5">
                <p className="text-[10px] tracking-[0.5em] text-[#39FF14]/40 uppercase">
                  SYSTEM READY // INSERT SUBJECT
                </p>
                <h2 className="text-2xl font-bold tracking-[0.15em] uppercase neon-text">
                  DROP YOUR FIT.
                </h2>
              </div>

              <UploadZone
                onImageReady={handleImageReady}
                preview={preview}
                onClear={handleClear}
              />

              <AnimatePresence>
                {base64 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      onClick={handleJudge}
                      className="w-full bg-[#39FF14] text-black font-bold text-sm py-4 border-4 border-[#39FF14] hover:bg-black hover:text-[#39FF14] transition-colors duration-150 uppercase tracking-[0.3em] brutalist-shadow hover:shadow-none flex items-center justify-center gap-2"
                    >
                      <Zap size={16} />
                      JUDGE MY TUFFNESS
                      <Zap size={16} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── LOADING STATE ── */}
          {appState === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-8 text-center"
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                className="text-3xl sm:text-4xl font-bold tracking-[0.3em] uppercase neon-text"
              >
                SCANNING...
              </motion.div>

              {/* Bar visualizer */}
              <div className="flex items-end gap-1.5 h-12">
                {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 0.3, 1, 0.7, 0.5].map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-2 bg-[#39FF14]"
                    animate={{ scaleY: [h * 0.3, h, h * 0.3] }}
                    transition={{
                      duration: 0.6 + i * 0.05,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.07,
                    }}
                    style={{
                      height: "100%",
                      originY: 1,
                      filter: "drop-shadow(0 0 4px #39FF14)",
                    }}
                  />
                ))}
              </div>

              {/* Cycling status line */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingLine}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="text-[11px] tracking-[0.35em] text-[#39FF14]/60 uppercase"
                >
                  {LOADING_LINES[loadingLine]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── RESULT STATE ── */}
          {appState === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md space-y-4"
            >
              <p className="text-center text-[10px] tracking-[0.5em] text-[#39FF14]/40 uppercase">
                TUFF ANALYSIS COMPLETE
              </p>

              <div className="flex justify-center">
                <Gauge score={result.score} auraLevel={result.aura_level} />
              </div>

              <TerminalOutput
                verdict={result.verdict}
                breakdown={result.breakdown}
              />

              <button
                onClick={handleReset}
                className="w-full border-4 border-[#39FF14]/60 text-[#39FF14] bg-black hover:bg-[#39FF14] hover:text-black hover:border-[#39FF14] font-bold uppercase tracking-[0.3em] py-3 text-sm transition-colors duration-150 flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} />
                TRY AGAIN
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="flex-none border-t-4 border-[#39FF14]/20 py-2 px-4 text-center">
        <p className="text-[9px] tracking-[0.35em] text-[#39FF14]/20 uppercase">
          TUFF-O-METER // POWERED BY GEMINI 1.5 FLASH // UNAUTHORIZED TUFFNESS PROHIBITED
        </p>
      </footer>
    </div>
  );
}
