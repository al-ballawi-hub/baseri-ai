"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Zap, Code2, Copy, Check, TrendingUp, MonitorPlay } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AnalysisResult } from "@/types";

interface Props {
    data: AnalysisResult;
    screenshot: string;
}

export function AnalysisResults({ data, screenshot }: Props) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
        >
            {/* Top Dashboard */}
            <div className="grid lg:grid-cols-12 gap-6">

                {/* UX Score Card */}
                <Card className="lg:col-span-4 bg-[#0A0A0A]/80 backdrop-blur-xl border-white/10 flex flex-col justify-center items-center p-8 relative overflow-hidden group hover:border-indigo-500/50 transition-colors duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative w-56 h-56 flex items-center justify-center">
                        {/* SVG Progress Circle */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-zinc-900" />
                            <circle
                                cx="112" cy="112" r="100" stroke="currentColor" strokeWidth="16" fill="transparent"
                                strokeDasharray={2 * Math.PI * 100}
                                strokeDashoffset={2 * Math.PI * 100 - (2 * Math.PI * 100 * data.uxScore) / 100}
                                className={cn(
                                    "transition-all duration-1000 ease-out",
                                    data.uxScore >= 90 ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" :
                                        data.uxScore >= 70 ? "text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" :
                                            "text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                                )}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={cn(
                                "text-6xl font-black tabular-nums tracking-tighter",
                                data.uxScore >= 90 ? "text-emerald-400" :
                                    data.uxScore >= 70 ? "text-amber-400" : "text-rose-500"
                            )}>
                                {data.uxScore}
                            </span>
                            <span className="text-xs text-zinc-500 uppercase tracking-[0.2em] mt-2 font-semibold">UX Score</span>
                        </div>
                    </div>

                    <div className="mt-8 text-center relative z-10">
                        <h3 className="text-zinc-100 font-semibold mb-2">Executive Summary</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">{data.overallSummary}</p>
                    </div>
                </Card>

                {/* Screenshot Preview */}
                <Card className="lg:col-span-8 bg-[#0A0A0A]/80 backdrop-blur-xl border-white/10 overflow-hidden relative group">
                    <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-zinc-300 border border-white/10 flex items-center gap-2">
                        <MonitorPlay className="w-3 h-3 text-indigo-400" />
                        Live Capture
                    </div>
                    <div className="w-full h-[600px] bg-zinc-900 relative overflow-y-auto custom-scrollbar rounded-xl border border-white/5">
                        <img
                            src={screenshot}
                            alt="Full Page Analysis"
                            className="w-full h-auto block opacity-90 hover:opacity-100 transition-opacity duration-300"
                        />
                    </div>
                </Card>
            </div>

            {/* CRO & Business Impact (Dynamic Grid) */}
            {data.croTips && data.croTips.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Revenue & Conversion Optimization</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.croTips.map((tip, idx) => (
                            <Card key={idx} className="bg-gradient-to-br from-[#0A0A0A] to-emerald-950/10 border-emerald-500/20 p-6 hover:translate-y-[-2px] transition-transform duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <Zap className="w-5 h-5 text-emerald-400" />
                                    <span className={cn(
                                        "text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                        tip.impact === 'High' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-500/5 text-emerald-500/80 border-emerald-500/10"
                                    )}>
                                        {tip.impact} Impact
                                    </span>
                                </div>
                                <p className="text-zinc-300 text-sm leading-relaxed">{tip.tip}</p>
                            </Card>
                        ))}
                    </div>
                </motion.div>
            )}


            {/* Critical Analysis & Code Fixes */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                        <div className="p-2 bg-rose-500/10 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-rose-400" />
                        </div>
                        Critical Issues & Fixes
                    </h2>
                    <span className="text-sm text-zinc-500 font-mono bg-zinc-900 px-3 py-1 rounded-full border border-white/5">
                        {data.criticalIssues.length} ISSUES DETECTED
                    </span>
                </div>

                <div className="grid gap-8">
                    {data.criticalIssues.map((issue, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="bg-[#0A0A0A]/60 backdrop-blur-md border border-white/5 hover:border-indigo-500/30 transition-all duration-300 overflow-hidden group">
                                <div className="flex flex-col lg:flex-row">

                                    {/* Issue Description */}
                                    <div className="p-8 lg:w-1/2 space-y-6 flex flex-col justify-center">
                                        <div className="flex items-start justify-between">
                                            <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{issue.title}</h3>
                                            <span className="bg-indigo-500/10 text-indigo-300 text-xs px-2 py-1 rounded font-mono border border-indigo-500/20">#{issue.id}</span>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex gap-4 p-4 bg-rose-950/20 rounded-xl border border-rose-500/10">
                                                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="text-xs uppercase tracking-wider text-rose-400 font-bold block mb-1">Problem</span>
                                                    <p className="text-rose-200/80 text-sm leading-relaxed">{issue.description}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 p-4 bg-emerald-950/20 rounded-xl border border-emerald-500/10">
                                                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold block mb-1">Solution</span>
                                                    <p className="text-emerald-200/80 text-sm leading-relaxed">{issue.solution}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Code Block */}
                                    <div className="lg:w-1/2 bg-[#050505] border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col h-full min-h-[300px]">
                                        <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex items-center justify-between">
                                            <span className="text-xs font-mono text-zinc-400 uppercase flex items-center gap-2">
                                                <Code2 className="w-3 h-3 text-indigo-400" /> Suggested Implementation
                                            </span>
                                            <button
                                                onClick={() => copyToClipboard(issue.suggestedFix, idx)}
                                                className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-medium"
                                            >
                                                {copiedIndex === idx ? (
                                                    <>
                                                        <Check className="w-3 h-3 text-emerald-500" /> Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3 h-3" /> Copy Code
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="flex-1 p-6 overflow-x-auto custom-scrollbar font-mono text-sm relative group/code bg-[#020202]">
                                            {/* Subtle line numbers or decoration could go here */}
                                            <pre className="text-indigo-100 whitespace-pre-wrap leading-relaxed">
                                                <code>{issue.suggestedFix}</code>
                                            </pre>
                                        </div>
                                    </div>

                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
