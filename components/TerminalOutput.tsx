"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Breakdown {
  fit_check: string;
  cinematography: string;
  absurdity_factor: string;
}

interface TerminalOutputProps {
  verdict: string;
  breakdown: Breakdown;
  speed?: number; // ms per character
}

function TypingLine({ text, delay = 0, speed = 35 }: { text: string; delay?: number; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    setDisplayed("");
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [started, text, speed]);

  return <span>{displayed}</span>;
}

export function TerminalOutput({ verdict, breakdown, speed = 35 }: TerminalOutputProps) {
  const [cursorVisible, setCursorVisible] = useState(true);

  // Estimated delays: each line starts after the previous finishes
  const line1Delay = 200;
  const line2Delay = line1Delay + breakdown.fit_check.length * speed + 300;
  const line3Delay = line2Delay + breakdown.cinematography.length * speed + 300;
  const line4Delay = line3Delay + breakdown.absurdity_factor.length * speed + 300;
  const verdictDelay = line4Delay + verdict.length * speed + 300;

  useEffect(() => {
    const blink = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(blink);
  }, []);

  const rows: { label: string; value: string; delay: number }[] = [
    { label: "FIT_CHECK", value: breakdown.fit_check, delay: line1Delay },
    { label: "CINEMATOGRAPHY", value: breakdown.cinematography, delay: line2Delay },
    { label: "ABSURDITY", value: breakdown.absurdity_factor, delay: line3Delay },
  ];

  return (
    <motion.div
      className="border-4 border-[#39FF14] bg-black font-mono text-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Terminal header bar */}
      <div className="flex items-center gap-2 border-b-2 border-[#39FF14] px-3 py-1.5 bg-[#39FF14]/5">
        <div className="w-2.5 h-2.5 rounded-full bg-[#FF3333]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#FFD700]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#39FF14]" />
        <span className="ml-2 text-[10px] tracking-[0.3em] text-[#39FF14]/50">
          TUFF-O-METER VERDICT OUTPUT
        </span>
      </div>

      <div className="px-4 py-4 space-y-2 text-xs">
        <p className="text-[#39FF14]/40 tracking-widest mb-3">{`> ANALYZING SUBJECT...`}</p>

        {/* Breakdown rows */}
        {rows.map(({ label, value, delay }) => (
          <div key={label} className="flex items-start gap-2">
            <span className="text-[#39FF14]/40 shrink-0 tracking-widest">{label}:</span>
            <span className="text-[#39FF14]/80 leading-relaxed">
              <TypingLine text={value} delay={delay} speed={speed} />
            </span>
          </div>
        ))}

        {/* Divider */}
        <div className="border-t border-[#39FF14]/20 pt-2 mt-1">
          <div className="flex items-start gap-2">
            <span className="text-[#39FF14]/50 shrink-0">$</span>
            <p className="text-[#39FF14] leading-relaxed tracking-wide">
              <TypingLine text={verdict} delay={verdictDelay} speed={speed} />
              <span
                className="inline-block w-[9px] h-[1.1em] bg-[#39FF14] ml-0.5 translate-y-[2px]"
                style={{ opacity: cursorVisible ? 1 : 0 }}
              />
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
