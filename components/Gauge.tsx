"use client";

import { motion } from "framer-motion";

interface GaugeProps {
  score: number; // 1–10
  auraLevel: "Negative" | "Neutral" | "Infinite";
}

const CX = 110;
const CY = 110;
const R = 90;

function getColor(score: number): string {
  if (score <= 3) return "#FF3333";
  if (score <= 7) return "#FFD700";
  return "#39FF14";
}


const ARC_PATH = `M ${CX - R} ${CY} A ${R} ${R} 0 0 0 ${CX + R} ${CY}`;

export function Gauge({ score, auraLevel }: GaugeProps) {
  const color = getColor(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={CX * 2}
        height={CY + 20}
        viewBox={`0 0 ${CX * 2} ${CY + 20}`}
        aria-label={`Tuff score: ${score} out of 10`}
      >
        {/* Tick marks */}
        {Array.from({ length: 11 }).map((_, i) => {
          const angle = Math.PI - (i / 10) * Math.PI;
          const innerR = R - 18;
          const outerR = R - 8;
          const x1 = CX + outerR * Math.cos(angle);
          const y1 = CY - outerR * Math.sin(angle);
          const x2 = CX + innerR * Math.cos(angle);
          const y2 = CY - innerR * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={i % 5 === 0 ? "rgba(57,255,20,0.5)" : "rgba(57,255,20,0.15)"}
              strokeWidth={i % 5 === 0 ? 2 : 1}
            />
          );
        })}

        {/* Background track */}
        <path
          d={ARC_PATH}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth={16}
          strokeLinecap="butt"
        />

        {/* Colored filled arc */}
        <motion.path
          d={ARC_PATH}
          fill="none"
          stroke={color}
          strokeWidth={16}
          strokeLinecap="butt"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: score / 10 }}
          transition={{ duration: 1.8, ease: [0.25, 1, 0.5, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />

        {/* Score number */}
        <motion.text
          x={CX}
          y={CY - 14}
          textAnchor="middle"
          fill={color}
          fontSize="48"
          fontFamily="'Space Mono', monospace"
          fontWeight="700"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 1.2 }}
          style={{ filter: `drop-shadow(0 0 12px ${color})` }}
        >
          {score}
        </motion.text>

        {/* "/10" label */}
        <motion.text
          x={CX}
          y={CY + 8}
          textAnchor="middle"
          fill="rgba(57,255,20,0.4)"
          fontSize="13"
          fontFamily="'Space Mono', monospace"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          / 10
        </motion.text>
      </svg>

      {/* Aura level label */}
      <motion.p
        className="text-xs tracking-[0.25em] uppercase font-bold"
        style={{ color }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
      >
        {auraLevel}
      </motion.p>
    </div>
  );
}
