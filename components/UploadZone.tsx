"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadZoneProps {
  onImageReady: (base64: string, previewUrl: string, mimeType: string) => void;
  preview: string | null;
  onClear: () => void;
}

export function UploadZone({ onImageReady, preview, onClear }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const previewUrl = URL.createObjectURL(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const base64 = dataUrl.split(",")[1];
        onImageReady(base64, previewUrl, file.type);
      };
      reader.readAsDataURL(file);
    },
    [onImageReady]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <motion.div
      className={`relative border-4 cursor-pointer transition-colors duration-150 ${
        isDragging
          ? "border-[#39FF14] bg-[#39FF14]/10 neon-glow"
          : preview
          ? "border-[#39FF14]"
          : "border-[#39FF14]/40 hover:border-[#39FF14]/80"
      }`}
      onClick={() => !preview && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      whileHover={!preview ? { scale: 1.005 } : {}}
      transition={{ duration: 0.1 }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Upload preview"
              className="w-full h-56 object-cover"
            />
            {/* Scanline overlay */}
            <div className="absolute inset-0 scanline" />
            {/* Corner brackets */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#39FF14]" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#39FF14]" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#39FF14]" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#39FF14]" />
            {/* Clear button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="absolute top-2 right-2 bg-black border border-[#39FF14] p-1 text-[#39FF14] hover:bg-[#39FF14] hover:text-black transition-colors z-10"
            >
              <X size={14} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-3 py-1">
              <p className="text-[#39FF14] text-xs tracking-widest">SUBJECT LOADED // READY TO SCAN</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-4 p-12 select-none"
          >
            <motion.div
              animate={isDragging ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Upload size={52} strokeWidth={1} className="text-[#39FF14]/60" />
            </motion.div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold tracking-[0.35em] text-[#39FF14] uppercase">
                {isDragging ? "RELEASE TO LOAD" : "DROP IMAGE HERE"}
              </p>
              <p className="text-xs text-[#39FF14]/40 tracking-widest">
                OR CLICK TO BROWSE
              </p>
            </div>
            <p className="text-[10px] text-[#39FF14]/25 tracking-widest">
              JPG · PNG · WEBP · GIF
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
