"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Globe, Loader2, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScannerOverlay } from "@/components/ScannerOverlay";
import { AnalysisResults } from "@/components/AnalysisResults";
import { ScanResult } from "@/types";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error. Please try again later.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze");

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020202] text-white selection:bg-indigo-500/30 font-sans overflow-x-hidden">

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/15 rounded-[100%] blur-[120px] opacity-50" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-20 max-w-7xl">

        {/* Navigation / Header */}
        <nav className="flex items-center justify-between mb-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Baseera AI</span>
          </div>
          <a href="https://github.com" target="_blank" className="text-zinc-500 hover:text-white transition-colors text-sm font-medium">
            GitHub
          </a>
        </nav>

        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-10 mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center space-x-2 bg-indigo-950/30 border border-indigo-500/20 backdrop-blur-md rounded-full px-4 py-1.5 shadow-[0_0_20px_-5px_rgba(79,70,229,0.3)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-xs font-bold tracking-wide text-indigo-300 uppercase">AI UX Auditor v2.0</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.1]"
          >
            Perfect your product with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-text-shimmer bg-[size:200%_auto]">Digital Eyes</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg md:text-xl max-w-2xl leading-relaxed"
          >
            The world's most advanced autonomous UX auditor. Paste your URL and get a
            <span className="text-white font-medium"> Director-level design critique</span>, CRO analysis, and code fixes in seconds.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleAnalyze}
            className="w-full max-w-2xl relative group z-20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500" />
            <div className="relative flex items-center bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden p-2 shadow-2xl ring-1 ring-white/5 group-focus-within:ring-indigo-500/50 transition-all">
              <div className="pl-4 pr-2">
                <Globe className="w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="website.com"
                className="border-none bg-transparent h-12 text-lg placeholder:text-zinc-700 focus-visible:ring-0 text-white font-medium tracking-wide"
              />
              <Button
                type="submit"
                size="lg"
                className="h-12 px-8 bg-white text-black hover:bg-zinc-200 rounded-xl transition-all font-bold tracking-wide hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.5)]"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="flex items-center gap-2">Audit <ArrowRight className="w-4 h-4" /></span>}
              </Button>
            </div>
          </motion.form>

          {/* Error State */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-3 rounded-xl flex items-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {loading && <ScannerOverlay key="loader" />}

          {result && (
            <AnalysisResults key="results" data={result.data} screenshot={result.screenshot} />
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}
