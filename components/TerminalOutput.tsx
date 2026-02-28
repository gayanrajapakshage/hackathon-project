"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TerminalOutputProps {
  text: string;
  speed?: number; // ms per character
}

export function TerminalOutput({ text, speed = 45 }: TerminalOutputProps) {
  const [displayed, setDisplayed] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [done, setDone] = useState(false);

  // Typing effect
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  // Cursor blink
  useEffect(() => {
    const blink = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(blink);
  }, []);

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

      {/* Output line */}
      <div className="px-4 py-4 space-y-1">
        <p className="text-[#39FF14]/40 text-xs tracking-widest mb-2">
          {`> ANALYZING SUBJECT...`}
          {done && (
            <span className="text-[#39FF14]/80 ml-2">DONE</span>
          )}
        </p>
        <div className="flex items-start gap-2">
          <span className="text-[#39FF14]/50 shrink-0">$</span>
          <p className="text-[#39FF14] leading-relaxed tracking-wide">
            {displayed}
            <span
              className="inline-block w-[9px] h-[1.1em] bg-[#39FF14] ml-0.5 translate-y-[2px]"
              style={{ opacity: cursorVisible ? 1 : 0 }}
            />
          </p>
        </div>
      </div>
    </motion.div>
  );
}
