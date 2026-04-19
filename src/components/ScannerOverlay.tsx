"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const scanLines = Array.from({ length: 20 });

export function ScannerOverlay() {
    const [text, setText] = useState("Initializing Neural Link...");

    useEffect(() => {
        const texts = [
            "Resolving DNS...",
            "Handshaking SSL...",
            "Bypassing Firewalls...",
            "Injecting Probes...",
            "Capturing DOM Snapshot...",
            "Downloading Assets...",
            "Rendering Virtual Viewport...",
            "Analyzing Visual Hierarchy...",
            "Extracting Computed Styles...",
            "Synthesizing UX Report..."
        ];
        let i = 0;
        const interval = setInterval(() => {
            setText(texts[i % texts.length]);
            i++;
        }, 800);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl"
        >
            <div className="relative w-full max-w-3xl h-[400px] border border-indigo-500/30 rounded-lg overflow-hidden bg-black/50 shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)]">

                {/* Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0)_1px,transparent_1px)] bg-[size:40px_40px] [background-position:center] opacity-20" />

                {/* Scanning Line */}
                <motion.div
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                    className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,1)] z-10"
                />

                {/* Decorator Lines */}
                {scanLines.map((_, i) => (
                    <div key={i} className="absolute left-0 right-0 h-[1px] bg-indigo-500/5" style={{ top: `${i * 5}%` }} />
                ))}

                {/* Center Loader */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                    <div className="relative mb-8">
                        <div className="w-24 h-24 border-4 border-indigo-500/30 rounded-full animate-spin-slow" />
                        <div className="absolute inset-0 w-24 h-24 border-t-4 border-indigo-400 rounded-full animate-spin" />
                        <div className="absolute inset-4 w-16 h-16 border-4 border-purple-500/20 rounded-full animate-spin-reverse" />
                    </div>

                    <motion.div
                        key={text}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-indigo-300 font-mono text-lg tracking-widest uppercase"
                    >
                        {text}
                    </motion.div>
                </div>

                {/* Terminal Text */}
                <div className="absolute bottom-4 left-4 font-mono text-xs text-green-500/50">
                    {">"} SYSTEM_READY<br />
                    {">"} PROXY_CHAIN_ACTIVE
                </div>
            </div>
        </motion.div>
    );
}
