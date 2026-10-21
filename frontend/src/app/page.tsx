"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Fish,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Search,
  Globe,
  Building2,
  Users,
  AlertTriangle,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Terminal,
  History,
  Download,
  X,
  Sparkles,
  Radio,
  FileText,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface AuditOutput {
  target_name: string;
  domain_age_days: number;
  registration_verified: boolean;
  registered_directors: string[];
  risk_flags: string[];
  summary: string;
}

interface Deduction {
  reason: string;
  points: number;
}

interface ScoreReport {
  trust_score: number;
  risk_tier: "LOW_RISK" | "MODERATE_CAUTION" | "SEVERE_DANGER";
  risk_color: "green" | "orange" | "red";
  deductions: Deduction[];
  audit: AuditOutput;
}

interface PastAudit {
  id: number;
  target_name: string;
  target_url: string;
  score: number;
  risk_level: string;
  report: ScoreReport;
  created_at: string;
}

const LOCAL_DEMO_DATA: Record<string, ScoreReport> = {
  apex: {
    trust_score: 25,
    risk_tier: "SEVERE_DANGER",
    risk_color: "red",
    deductions: [
      { reason: "New domain age (< 30 days)", points: -40 },
      { reason: "Corporate registration unverified", points: -35 },
      { reason: "4 risk flags identified (capped at 30 pts)", points: -30 },
    ],
    audit: {
      target_name: "Apex Global Logistics",
      domain_age_days: 11,
      registration_verified: false,
      registered_directors: [],
      risk_flags: [
        "Domain registered 11 days ago via anonymous privacy guard in Iceland",
        "Zero matching corporate CIN or GST registrations found in MCA database",
        "Multiple reports on Reddit r/Scams regarding advance freight fee requests",
        "Cloned HTML layout matching legitimate courier portals with spoofed WhatsApp contact",
      ],
      summary:
        "CRITICAL ALERT: Apex Global Logistics displays predatory indicators of an advance-fee courier scam. The domain was registered only 11 days ago under an anonymous privacy shield. Corporate registry queries in India, the UK, and US returned no legitimate entities under this trading name. Multiple consumer threads report victims being prompted for fake customs clearance fees.",
    },
  },
  infosys: {
    trust_score: 96,
    risk_tier: "LOW_RISK",
    risk_color: "green",
    deductions: [],
    audit: {
      target_name: "Infosys Technologies Ltd",
      domain_age_days: 9480,
      registration_verified: true,
      registered_directors: [
        "Salil Parekh (MD & CEO)",
        "Nandan Nilekani (Co-Founder & Chairman)",
        "Jayesh Sanghrajka (CFO)",
      ],
      risk_flags: [],
      summary:
        "HIGH CONFIDENCE: Verified Tier-1 publicly listed enterprise (BSE: 500209, NSE: INFY). The domain infosys.com has been continuously registered for over 25 years. Active Ministry of Corporate Affairs (MCA) filings confirm valid CIN L85110KA1981PLC013115 with accredited board members and clear regulatory history.",
    },
  },
};

export default function SnoopFishHome() {
  const [targetName, setTargetName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isAuditing, setIsAuditing] = useState(false);
  const [streamingUrl, setStreamingUrl] = useState<string | null>("/demo-feed/apex");
  const [logs, setLogs] = useState<string[]>([]);
  const [report, setReport] = useState<ScoreReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMonitorExpanded, setIsMonitorExpanded] = useState(false);

  // Progressive investigation radar & latency counter
  const [investigationStep, setInvestigationStep] = useState<number>(1);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Drawer state for Past Audits
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [pastAudits, setPastAudits] = useState<PastAudit[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Elapsed time counter
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isAuditing) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuditing]);

  // Progressive pacing fallback
  useEffect(() => {
    if (!isAuditing) return;
    if (elapsedSeconds >= 9) {
      setInvestigationStep((prev) => Math.max(prev, 4));
    } else if (elapsedSeconds >= 6) {
      setInvestigationStep((prev) => Math.max(prev, 3));
    } else if (elapsedSeconds >= 3) {
      setInvestigationStep((prev) => Math.max(prev, 2));
    }
  }, [elapsedSeconds, isAuditing]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}s`;
  };

  const fetchPastAudits = async () => {
    setLoadingHistory(false);
    try {
      const res = await fetch(`${apiBase}/api/audits?limit=10`);
      if (res.ok) {
        const data = await res.json();
        setPastAudits(data.audits || []);
      }
    } catch {
      // Backend may be offline or in demo mode
    }
  };

  useEffect(() => {
    fetchPastAudits();
  }, []);

  const runLocalDemoSimulation = async (target: string) => {
    const isInfo = target.toLowerCase().includes("info");
    const key = isInfo ? "infosys" : "apex";
    const demoPayload = LOCAL_DEMO_DATA[key];
    const demoFeedUrl = `/demo-feed/${key}`;

    setStreamingUrl(demoFeedUrl);
    setInvestigationStep(1);
    setLogs((prev) => [
      ...prev,
      `[SIMULATION] Starting offline demo feed: ${demoFeedUrl}`,
    ]);

    await new Promise((r) => setTimeout(r, 600));
    setInvestigationStep(1);
    setLogs((prev) => [
      ...prev,
      `[WHOIS] Querying registrar DNS & domain age (${demoPayload.audit.domain_age_days} days)...`,
    ]);

    await new Promise((r) => setTimeout(r, 700));
    setInvestigationStep(2);
    setLogs((prev) => [
      ...prev,
      `[MCA] Searching public corporate registry & director DINs...`,
    ]);

    await new Promise((r) => setTimeout(r, 700));
    setInvestigationStep(3);
    setLogs((prev) => [
      ...prev,
      `[THREAT_INTEL] Scanning scam boards, blacklist DBs & forums...`,
    ]);

    await new Promise((r) => setTimeout(r, 500));
    setInvestigationStep(4);
    setReport(demoPayload);
    setLogs((prev) => [
      ...prev,
      `[VERDICT] Audit complete! Trust Score: ${demoPayload.trust_score}/100 (${demoPayload.risk_tier})`,
    ]);
  };

  const handleStartAudit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetName.trim()) return;

    setIsAuditing(true);
    setReport(null);
    setError(null);
    setInvestigationStep(1);
    setElapsedSeconds(0);

    // Cue up immediate simulated demo feed URL if in demo mode
    if (isDemoMode) {
      const isInfo = targetName.toLowerCase().includes("info");
      setStreamingUrl(isInfo ? "/demo-feed/infosys" : "/demo-feed/apex");
    } else {
      setStreamingUrl(null);
    }

    setLogs([
      `[00:00] snoopfish v1.1 initialized. Target: "${targetName.trim()}" (Demo Mode: ${
        isDemoMode ? "ON" : "OFF"
      })`,
    ]);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch(`${apiBase}/api/audit/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          target_name: targetName.trim(),
          target_url: targetUrl.trim() || null,
          demo: isDemoMode,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response body is not readable");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let currentEvent = "message";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) {
            currentEvent = "message";
            continue;
          }

          if (trimmed.startsWith("event:")) {
            currentEvent = trimmed.slice(6).trim();
          } else if (trimmed.startsWith("data:")) {
            const dataStr = trimmed.slice(5).trim();
            handleSSEMessage(currentEvent, dataStr);
          }
        }
      }

      if (buffer.trim().startsWith("data:")) {
        handleSSEMessage("message", buffer.trim().slice(5).trim());
      }
      fetchPastAudits();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setLogs((prev) => [...prev, "[!] Audit cancelled by user."]);
      } else {
        // If backend fails during demo mode, fail over cleanly to frontend simulation
        if (isDemoMode) {
          setLogs((prev) => [
            ...prev,
            `[NOTICE] Backend offline. Running zero-latency demo failover protocol...`,
          ]);
          await runLocalDemoSimulation(targetName);
        } else {
          const message = err instanceof Error ? err.message : "Failed to run audit";
          setError(message);
          setLogs((prev) => [...prev, `[ERROR] ${message}`]);
        }
      }
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSSEMessage = (event: string, dataStr: string) => {
    try {
      const payload = JSON.parse(dataStr);

      // Radar step advancement from SSE payload
      if (payload.step && typeof payload.step === "number") {
        setInvestigationStep((prev) => Math.max(prev, payload.step));
      }
      const rawText = `${event} ${dataStr}`.toLowerCase();
      if (rawText.includes("whois") || rawText.includes("dns") || rawText.includes("registrar")) {
        setInvestigationStep((prev) => Math.max(prev, 1));
      }
      if (rawText.includes("mca") || rawText.includes("corporate") || rawText.includes("registry") || rawText.includes("director")) {
        setInvestigationStep((prev) => Math.max(prev, 2));
      }
      if (rawText.includes("scam") || rawText.includes("threat") || rawText.includes("forum") || rawText.includes("reddit") || rawText.includes("blacklist")) {
        setInvestigationStep((prev) => Math.max(prev, 3));
      }

      if (event === "streaming_url" || payload.streaming_url) {
        const url = payload.streaming_url || payload.url;
        if (url) {
          setStreamingUrl(url);
          setLogs((prev) => [
            ...prev,
            `[LIVE CAM] Browser viewport active: ${url}`,
          ]);
        }
      } else if (event === "result" || (payload.trust_score !== undefined && payload.audit)) {
        setInvestigationStep(4);
        setReport(payload as ScoreReport);
        setLogs((prev) => [
          ...prev,
          `[VERDICT] Score: ${payload.trust_score}/100. Classification: ${payload.risk_tier}`,
        ]);
      } else if (event === "status") {
        if (payload.message) {
          setLogs((prev) => [...prev, `[STATUS] ${payload.message}`]);
        }
        if (payload.streaming_url) {
          setStreamingUrl(payload.streaming_url);
        }
      } else if (event === "progress") {
        const msg =
          payload.message || payload.action || payload.raw || JSON.stringify(payload);
        setLogs((prev) => [...prev, `[SNOOP] ${msg}`]);
      } else if (event === "error") {
        setError(payload.message || "An error occurred during audit");
        setLogs((prev) => [...prev, `[ERROR] ${payload.message}`]);
      }
    } catch {
      setLogs((prev) => [...prev, `[RAW] ${dataStr}`]);
    }
  };

  const handlePopulatePreset = (name: string, url: string) => {
    setTargetName(name);
    setTargetUrl(url);
    if (isDemoMode) {
      const isInfo = name.toLowerCase().includes("info");
      setStreamingUrl(isInfo ? "/demo-feed/infosys" : "/demo-feed/apex");
    }
  };

  const handleExportMarkdown = () => {
    if (!report) return;
    const md = `# SnoopFish Forensic Report: ${report.audit.target_name}
Generated: ${new Date().toISOString()}

## Verdict: ${report.risk_tier} (Score: ${report.trust_score}/100)

### Key Metrics
- **Domain Age**: ${report.audit.domain_age_days} days
- **Corporate Registration Status**: ${report.audit.registration_verified ? "VERIFIED" : "UNVERIFIED"}
- **Registered Directors / Officers**: ${report.audit.registered_directors.join(", ") || "None"}

### Score Deductions
${report.deductions.map((d) => `- ${d.reason}: ${d.points} pts`).join("\n") || "No deductions applied."}

### Identified Risk Flags
${report.audit.risk_flags.map((f) => `- [!] ${f}`).join("\n") || "None detected."}

### Forensic Summary
${report.audit.summary}
`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `snoopfish-report-${report.audit.target_name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neo-cream text-neo-black selection:bg-neo-yellow">
      {/* 1. TOP FLOATING NAV */}
      <nav className="sticky top-0 z-40 bg-neo-cream border-b-[3px] border-neo-black px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-2xl bg-neo-orange border-[3px] border-neo-black shadow-neo flex items-center justify-center">
              <Fish className="w-6 h-6 text-neo-black -rotate-12" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black tracking-tight text-neo-black lowercase">
                snoopfish
              </span>
              <span className="text-xs font-bold text-neo-black px-1.5 py-0.5 rounded-full bg-neo-yellow border-2 border-neo-black">
                v1.1
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            {/* Live API / Demo Mode Toggle */}
            <button
              onClick={() => {
                const nextMode = !isDemoMode;
                setIsDemoMode(nextMode);
                if (nextMode) {
                  setStreamingUrl("/demo-feed/apex");
                }
              }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border-[3px] border-neo-black shadow-neo font-bold text-xs transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover cursor-pointer ${
                isDemoMode ? "bg-neo-yellow text-neo-black" : "bg-neo-mint text-neo-black"
              }`}
            >
              <Radio
                className={`w-3.5 h-3.5 ${
                  isDemoMode ? "text-neo-black" : "text-emerald-700 animate-pulse"
                }`}
              />
              <span>{isDemoMode ? "Demo Mode (Safe)" : "Live TinyFish Agent"}</span>
            </button>

            {/* Past Audits Button */}
            <button
              onClick={() => {
                setShowHistoryModal(true);
                fetchPastAudits();
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-neo-cream hover:bg-white border-[3px] border-neo-black shadow-neo font-bold text-xs transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>Past Audits ({pastAudits.length})</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION (Pastel Pink Canvas #F7A8D8) */}
      <section className="bg-neo-pink border-b-[3px] border-neo-black py-12 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neo-cream border-2 border-neo-black shadow-neo text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-neo-orange" />
            <span>Autonomous Web Forensic Auditor</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-neo-black tracking-tight leading-none lowercase">
            background checks....kinda
          </h1>

          <p className="text-base md:text-lg font-bold text-neo-black/85 max-w-2xl mx-auto">
            Tiny fish that snoops the whole web to catch fake vendors, fraudulent recruiters,
            and ghost educational programs.
          </p>

          {/* Search Capsule */}
          <div className="mt-8 bg-neo-cream rounded-3xl border-[3px] border-neo-black shadow-neo-lg p-5 text-left max-w-3xl mx-auto">
            <form onSubmit={handleStartAudit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-7">
                  <label className="block text-xs font-black uppercase tracking-wider text-neo-black mb-1">
                    Entity / Recruiter / Vendor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    placeholder="e.g. Apex Global Logistics, or SwiftRecruit"
                    disabled={isAuditing}
                    className="w-full bg-white border-[3px] border-neo-black rounded-xl px-3.5 py-2.5 font-bold text-sm text-neo-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neo-orange"
                  />
                </div>

                <div className="md:col-span-5">
                  <label className="block text-xs font-black uppercase tracking-wider text-neo-black mb-1">
                    Target URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://suspicious-site.com"
                    disabled={isAuditing}
                    className="w-full bg-white border-[3px] border-neo-black rounded-xl px-3.5 py-2.5 font-bold text-sm text-neo-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neo-orange"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                {/* Preset Chips */}
                <div className="flex items-center space-x-2 text-xs font-bold">
                  <span className="text-neo-black/70">Presets:</span>
                  <button
                    type="button"
                    onClick={() =>
                      handlePopulatePreset(
                        "Apex Global Logistics",
                        "https://apex-globlogistics-track.live"
                      )
                    }
                    className="px-2.5 py-1 rounded-full bg-neo-red/30 hover:bg-neo-red/50 border-2 border-neo-black text-neo-black transition cursor-pointer"
                  >
                    🚨 Apex Scam (Demo)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handlePopulatePreset(
                        "Infosys Technologies Ltd",
                        "https://www.infosys.com"
                      )
                    }
                    className="px-2.5 py-1 rounded-full bg-neo-mint/40 hover:bg-neo-mint/70 border-2 border-neo-black text-neo-black transition cursor-pointer"
                  >
                    🏢 Infosys (Legit)
                  </button>
                </div>

                {/* Primary CTA */}
                <button
                  type="submit"
                  disabled={isAuditing || !targetName.trim()}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-neo-orange hover:bg-amber-400 text-neo-black font-black text-sm uppercase tracking-wider border-[3px] border-neo-black shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-hover disabled:opacity-50 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isAuditing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Snooping Web...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Unmask Target</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 3. LIVE WORKSPACE (Warm Mustard Yellow Canvas #F9D849) */}
      <section className="bg-neo-yellow border-b-[3px] border-neo-black py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-neo-black uppercase tracking-tight flex items-center space-x-2">
              <Terminal className="w-6 h-6" />
              <span>Live Investigation Command Center</span>
            </h2>
            <div className="flex items-center space-x-2">
              {isAuditing && (
                <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-neo-orange border-2 border-neo-black shadow-neo flex items-center space-x-1 animate-pulse">
                  <span>⏱️</span>
                  <span>{formatTime(elapsedSeconds)}</span>
                </span>
              )}
              <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-neo-cream border-2 border-neo-black shadow-neo">
                {isAuditing ? "⚡ Audit in progress" : report ? "✓ Audit complete" : "💤 Standby"}
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-neo-red border-[3px] border-neo-black shadow-neo-lg text-neo-black font-bold flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-black">Notice</p>
                  <p className="text-xs">{error}</p>
                </div>
              </div>
              <button
                onClick={() => setError(null)}
                className="p-1 rounded-lg border-2 border-neo-black bg-white hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Card: The TinyFish Browser Cam (Arcade Screen) */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              <div className="bg-neo-cream rounded-3xl border-[3px] border-neo-black shadow-neo-lg p-5 flex flex-col flex-1">
                {/* Retro Arcade Monitor Header */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-neo-black mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-neo-red text-white border-2 border-neo-black text-xs font-black tracking-wider uppercase">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                      <span>LIVE FEED</span>
                    </div>
                    <span className="font-black text-xs uppercase tracking-wider text-neo-black">
                      The TinyFish Browser Cam
                    </span>
                  </div>

                  {streamingUrl && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsMonitorExpanded(!isMonitorExpanded)}
                        className="text-xs font-bold text-neo-black flex items-center space-x-1 bg-neo-yellow px-2.5 py-1 rounded-full border-2 border-neo-black shadow-neo-hover cursor-pointer"
                      >
                        {isMonitorExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                        <span>{isMonitorExpanded ? "Collapse" : "Expand Monitor"}</span>
                      </button>

                      <a
                        href={streamingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-neo-black flex items-center space-x-1 bg-neo-blue px-2.5 py-1 rounded-full border-2 border-neo-black shadow-neo-hover"
                      >
                        <span>New Tab</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Viewport Screen */}
                <div className="flex-1 bg-neutral-900 rounded-2xl border-[3px] border-neo-black overflow-hidden relative min-h-[380px] flex items-center justify-center text-white">
                  {streamingUrl ? (
                    <iframe
                      src={streamingUrl}
                      title="TinyFish Remote Agent Session"
                      className="w-full h-full border-0 absolute inset-0"
                      allow="autoplay"
                    />
                  ) : (
                    <div className="text-center p-8 flex flex-col items-center space-y-3">
                      {isAuditing ? (
                        <>
                          <Loader2 className="w-12 h-12 text-neo-yellow animate-spin" />
                          <p className="font-black text-sm uppercase tracking-wider text-neo-cream">
                            TinyFish Remote Browser Navigating...
                          </p>
                          <p className="text-xs text-neutral-400 max-w-sm">
                            Querying WHOIS records, registrar DNS, and corporate registry listings...
                          </p>
                        </>
                      ) : (
                        <>
                          <Globe className="w-14 h-14 text-neutral-700" />
                          <p className="font-black text-base uppercase tracking-wider text-neo-cream">
                            Agent Viewport Standby
                          </p>
                          <p className="text-xs text-neutral-400 max-w-xs">
                            Select a preset above to preview the simulated agent browser.
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Terminal Status Ticker */}
                <div className="mt-4 pt-3 border-t-2 border-neo-black">
                  <div className="flex items-center space-x-2 mb-2">
                    <Terminal className="w-4 h-4 text-neo-black" />
                    <span className="text-xs font-black uppercase tracking-wider text-neo-black">
                      Agent Execution Ticker
                    </span>
                  </div>
                  <div className="bg-neutral-950 text-neo-mint border-2 border-neo-black rounded-xl p-3 font-mono text-xs max-h-36 overflow-y-auto space-y-1">
                    {logs.length === 0 ? (
                      <span className="text-neutral-500">Ready for target input...</span>
                    ) : (
                      logs.map((log, idx) => (
                        <div key={idx} className="leading-relaxed">
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Forensic Dossier / Progressive Radar */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              <div className="bg-neo-cream rounded-3xl border-[3px] border-neo-black shadow-neo-lg p-5">
                <div className="flex items-center justify-between pb-3 border-b-2 border-neo-black mb-4">
                  <h3 className="font-black text-sm uppercase tracking-wider text-neo-black flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-neo-orange" />
                    <span>Forensic Dossier</span>
                  </h3>
                  {report && (
                    <button
                      onClick={handleExportMarkdown}
                      className="px-3 py-1 rounded-full bg-neo-yellow hover:bg-amber-300 border-2 border-neo-black shadow-neo-hover font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export .md</span>
                    </button>
                  )}
                </div>

                {report ? (
                  <div className="space-y-4">
                    {/* Trust Score Chunky Gauge */}
                    <div
                      className={`p-4 rounded-2xl border-[3px] border-neo-black shadow-neo flex items-center justify-between ${
                        report.risk_color === "green"
                          ? "bg-neo-mint"
                          : report.risk_color === "orange"
                          ? "bg-neo-yellow"
                          : "bg-neo-red text-white"
                      }`}
                    >
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider block">
                          Trust Score
                        </span>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-5xl font-black">{report.trust_score}</span>
                          <span className="text-sm font-bold opacity-80">/ 100</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full border-2 border-neo-black bg-white text-neo-black text-xs font-black uppercase tracking-wider shadow-neo-hover">
                          {report.risk_tier === "LOW_RISK" ? (
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          ) : report.risk_tier === "MODERATE_CAUTION" ? (
                            <ShieldAlert className="w-4 h-4 text-amber-600" />
                          ) : (
                            <ShieldX className="w-4 h-4 text-rose-600" />
                          )}
                          <span>{report.risk_tier.replace("_", " ")}</span>
                        </span>
                      </div>
                    </div>

                    {/* Tag Pills */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                      <div className="p-3 bg-white rounded-xl border-2 border-neo-black">
                        <span className="text-neutral-500 block text-[10px] uppercase font-black">
                          Domain Age
                        </span>
                        <span className="text-sm font-black text-neo-black">
                          {report.audit.domain_age_days > 0
                            ? `${report.audit.domain_age_days} Days`
                            : "Unresolved"}
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border-2 border-neo-black">
                        <span className="text-neutral-500 block text-[10px] uppercase font-black">
                          Corporate Registration
                        </span>
                        <span
                          className={`text-sm font-black flex items-center space-x-1 ${
                            report.audit.registration_verified
                              ? "text-emerald-700"
                              : "text-rose-600"
                          }`}
                        >
                          {report.audit.registration_verified ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Verified</span>
                            </>
                          ) : (
                            <>
                              <ShieldX className="w-4 h-4" />
                              <span>Unverified</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Registered Directors */}
                    <div className="p-3.5 bg-white rounded-xl border-2 border-neo-black">
                      <span className="text-xs font-black uppercase tracking-wider text-neo-black flex items-center space-x-1 mb-2">
                        <Users className="w-3.5 h-3.5 text-neo-blue" />
                        <span>Registered Officers / Directors</span>
                      </span>
                      {report.audit.registered_directors.length > 0 ? (
                        <ul className="text-xs font-bold text-neutral-800 space-y-1">
                          {report.audit.registered_directors.map((dir, idx) => (
                            <li key={idx} className="flex items-center space-x-1.5">
                              <span className="w-2 h-2 rounded-full bg-neo-black"></span>
                              <span>{dir}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs font-bold text-neutral-400 italic">
                          No registered directors identified.
                        </p>
                      )}
                    </div>

                    {/* Risk Flags */}
                    <div className="p-3.5 bg-white rounded-xl border-2 border-neo-black">
                      <span className="text-xs font-black uppercase tracking-wider text-neo-black flex items-center space-x-1 mb-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-neo-red" />
                        <span>Risk Flags Identified ({report.audit.risk_flags.length})</span>
                      </span>
                      {report.audit.risk_flags.length > 0 ? (
                        <ul className="text-xs font-bold text-rose-700 space-y-1.5">
                          {report.audit.risk_flags.map((flag, idx) => (
                            <li
                              key={idx}
                              className="p-2 rounded-lg bg-rose-50 border border-rose-300 flex items-start space-x-1.5"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1 flex-shrink-0"></span>
                              <span>{flag}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs font-bold text-emerald-700 flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>No public negative alerts found.</span>
                        </p>
                      )}
                    </div>

                    {/* Executive Summary */}
                    <div className="p-3.5 bg-white rounded-xl border-2 border-neo-black">
                      <span className="text-xs font-black uppercase tracking-wider text-neo-black block mb-1">
                        Executive Summary
                      </span>
                      <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                        {report.audit.summary}
                      </p>
                    </div>
                  </div>
                ) : isAuditing ? (
                  /* PROGRESSIVE 4-STEP INVESTIGATION RADAR */
                  <div className="space-y-4">
                    {/* Radar Progress Header */}
                    <div className="p-4 rounded-2xl border-[3px] border-neo-black shadow-neo bg-neo-yellow text-neo-black">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-neo-black animate-ping"></span>
                          <span className="text-xs font-black uppercase tracking-wider">
                            Live Forensic Radar Active
                          </span>
                        </div>
                        <span className="text-xs font-mono font-black bg-white px-2 py-0.5 rounded-full border border-neo-black">
                          Step {investigationStep} of 4
                        </span>
                      </div>

                      <div className="w-full bg-white rounded-full h-3 border-2 border-neo-black overflow-hidden p-0.5">
                        <div
                          className="bg-neo-orange h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(15, (investigationStep / 4) * 100))}%` }}
                        />
                      </div>
                    </div>

                    {/* Step Cards */}
                    <div className="space-y-2.5">
                      {/* Step 1: DNS & Registrar */}
                      <div
                        className={`p-3.5 rounded-2xl border-2 border-neo-black transition-all ${
                          investigationStep > 1
                            ? "bg-emerald-50 border-emerald-700"
                            : investigationStep === 1
                            ? "bg-white shadow-neo border-neo-black"
                            : "bg-neutral-100 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-lg">🌐</span>
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-tight text-neo-black">
                                Step 1: Resolving DNS & Registrar Integrity
                              </h4>
                              <p className="text-[11px] font-bold text-neutral-500">
                                Evaluating domain creation age and WHOIS ownership shield
                              </p>
                            </div>
                          </div>
                          <div>
                            {investigationStep > 1 ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-neo-mint border border-neo-black text-[10px] font-black uppercase text-emerald-950">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Verified</span>
                              </span>
                            ) : investigationStep === 1 ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-neo-orange border border-neo-black text-[10px] font-black uppercase text-neo-black animate-pulse">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Sweeping</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-neutral-400 uppercase">Pending</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Step 2: Corporate Registries */}
                      <div
                        className={`p-3.5 rounded-2xl border-2 border-neo-black transition-all ${
                          investigationStep > 2
                            ? "bg-emerald-50 border-emerald-700"
                            : investigationStep === 2
                            ? "bg-white shadow-neo border-neo-black"
                            : "bg-neutral-100 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-lg">🏛️</span>
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-tight text-neo-black">
                                Step 2: Querying Corporate & Director Registries
                              </h4>
                              <p className="text-[11px] font-bold text-neutral-500">
                                Crawling MCA / SEC filings, DIN registration, and legal standing
                              </p>
                            </div>
                          </div>
                          <div>
                            {investigationStep > 2 ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-neo-mint border border-neo-black text-[10px] font-black uppercase text-emerald-950">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Verified</span>
                              </span>
                            ) : investigationStep === 2 ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-neo-orange border border-neo-black text-[10px] font-black uppercase text-neo-black animate-pulse">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Querying</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-neutral-400 uppercase">Pending</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Step 3: Threat Intel & Blacklists */}
                      <div
                        className={`p-3.5 rounded-2xl border-2 border-neo-black transition-all ${
                          investigationStep > 3
                            ? "bg-emerald-50 border-emerald-700"
                            : investigationStep === 3
                            ? "bg-white shadow-neo border-neo-black"
                            : "bg-neutral-100 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-lg">🛡️</span>
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-tight text-neo-black">
                                Step 3: Sweeping Consumer Threat Intel & Blacklists
                              </h4>
                              <p className="text-[11px] font-bold text-neutral-500">
                                Scanning r/Scams, BBB, Trustpilot, and courier fraud archives
                              </p>
                            </div>
                          </div>
                          <div>
                            {investigationStep > 3 ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-neo-mint border border-neo-black text-[10px] font-black uppercase text-emerald-950">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Verified</span>
                              </span>
                            ) : investigationStep === 3 ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-neo-orange border border-neo-black text-[10px] font-black uppercase text-neo-black animate-pulse">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Scanning</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-neutral-400 uppercase">Pending</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Step 4: Synthesizing Forensic Dossier */}
                      <div
                        className={`p-3.5 rounded-2xl border-2 border-neo-black transition-all ${
                          investigationStep >= 4
                            ? "bg-white shadow-neo border-neo-black"
                            : "bg-neutral-100 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-lg">⚡</span>
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-tight text-neo-black">
                                Step 4: Synthesizing Forensic Dossier
                              </h4>
                              <p className="text-[11px] font-bold text-neutral-500">
                                Compiling composite risk score and deterministic trust verdict
                              </p>
                            </div>
                          </div>
                          <div>
                            {investigationStep >= 4 ? (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-neo-mint border border-neo-black text-[10px] font-black uppercase text-emerald-950 animate-pulse">
                                <Sparkles className="w-3 h-3" />
                                <span>Compiling</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-neutral-400 uppercase">Pending</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* IDLE STANDBY STATE */
                  <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
                    <Building2 className="w-14 h-14 text-neutral-300" />
                    <p className="font-black text-sm uppercase text-neo-black">
                      Awaiting Investigation
                    </p>
                    <p className="text-xs font-bold text-neutral-500 max-w-xs">
                      Submit a target name above to compute a comprehensive risk score and
                      unmask fraudulent operations.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION (Three White Chunky Cards) */}
      <section className="py-14 px-4 bg-neo-cream">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-neo-black tracking-tight uppercase">
              How SnoopFish Works
            </h2>
            <p className="text-sm font-bold text-neutral-600 mt-1">
              Autonomous multi-source forensic inquiry performed in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Sniff */}
            <div className="bg-white rounded-3xl border-[3px] border-neo-black shadow-neo-lg p-6 flex flex-col space-y-3 hover:translate-y-[-2px] transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-neo-yellow border-2 border-neo-black flex items-center justify-center font-black text-xl shadow-neo">
                1
              </div>
              <h3 className="text-xl font-black text-neo-black uppercase tracking-tight">
                Sniff
              </h3>
              <p className="text-xs font-bold text-neutral-600 leading-relaxed">
                Queries DNS records, WHOIS domain creation dates, and registrant origins to detect
                freshly spawned fly-by-night domains.
              </p>
            </div>

            {/* Card 2: Dig */}
            <div className="bg-white rounded-3xl border-[3px] border-neo-black shadow-neo-lg p-6 flex flex-col space-y-3 hover:translate-y-[-2px] transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-neo-pink border-2 border-neo-black flex items-center justify-center font-black text-xl shadow-neo">
                2
              </div>
              <h3 className="text-xl font-black text-neo-black uppercase tracking-tight">
                Dig
              </h3>
              <p className="text-xs font-bold text-neutral-600 leading-relaxed">
                Autonomously crawls Ministry of Corporate Affairs, SEC registries, active director DINs,
                and consumer complaint databases.
              </p>
            </div>

            {/* Card 3: Expose */}
            <div className="bg-white rounded-3xl border-[3px] border-neo-black shadow-neo-lg p-6 flex flex-col space-y-3 hover:translate-y-[-2px] transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-neo-mint border-2 border-neo-black flex items-center justify-center font-black text-xl shadow-neo">
                3
              </div>
              <h3 className="text-xl font-black text-neo-black uppercase tracking-tight">
                Expose
              </h3>
              <p className="text-xs font-bold text-neutral-600 leading-relaxed">
                Synthesizes forensic signals into a deterministic 0-100 Trust Score and an actionable,
                exportable due-diligence report card.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t-[3px] border-neo-black bg-neo-cream py-6 px-4 text-center">
        <p className="text-xs font-bold text-neo-black">
          Built for <span className="underline decoration-wavy decoration-neo-orange font-black">Swim with TinyFish Hackathon</span> ·
          Powered by TinyFish Web Agent & FastAPI
        </p>
      </footer>

      {/* EXPANDED ARCADE MONITOR MODAL */}
      {isMonitorExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neo-black/75 backdrop-blur-md p-4">
          <div className="bg-neo-cream rounded-3xl border-[3px] border-neo-black shadow-neo-xl max-w-6xl w-full h-[90vh] p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b-2 border-neo-black mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-neo-red animate-ping"></div>
                <span className="font-black text-sm uppercase text-neo-black">
                  Expanded TinyFish Remote Agent Viewport
                </span>
              </div>
              <button
                onClick={() => setIsMonitorExpanded(false)}
                className="p-1.5 rounded-xl border-2 border-neo-black bg-white hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 bg-neutral-900 rounded-2xl border-[3px] border-neo-black overflow-hidden relative">
              {streamingUrl ? (
                <iframe
                  src={streamingUrl}
                  title="TinyFish Remote Agent Viewport Fullscreen"
                  className="w-full h-full border-0 absolute inset-0"
                  allow="autoplay"
                />
              ) : (
                <div className="text-center p-8 text-neutral-400 flex items-center justify-center h-full">
                  No active session to display
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PAST AUDITS MODAL / DRAWER */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neo-black/60 backdrop-blur-sm p-4">
          <div className="bg-neo-cream rounded-3xl border-[3px] border-neo-black shadow-neo-xl max-w-xl w-full p-6 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b-2 border-neo-black mb-4">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-neo-black" />
                <h3 className="text-lg font-black uppercase text-neo-black">
                  Audit History Archive
                </h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-xl border-2 border-neo-black bg-white hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingHistory ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-neo-black mb-2" />
                  <p className="text-xs font-bold text-neutral-500">Loading audit records...</p>
                </div>
              ) : pastAudits.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 font-bold text-xs">
                  No audits recorded yet. Run your first audit to see it here!
                </div>
              ) : (
                pastAudits.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.report && item.report.trust_score !== undefined) {
                        setReport(item.report);
                        setTargetName(item.target_name);
                        setTargetUrl(item.target_url);
                        setShowHistoryModal(false);
                      }
                    }}
                    className="p-4 bg-white rounded-2xl border-2 border-neo-black shadow-neo-hover hover:translate-x-[2px] hover:translate-y-[2px] transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-black text-sm text-neo-black">{item.target_name}</h4>
                      {item.target_url && (
                        <p className="text-[11px] font-bold text-neutral-400">{item.target_url}</p>
                      )}
                      <p className="text-[10px] text-neutral-500 mt-1">{item.created_at}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-sm font-black px-2.5 py-1 rounded-full border-2 border-neo-black ${
                          item.score >= 80
                            ? "bg-neo-mint"
                            : item.score >= 50
                            ? "bg-neo-yellow"
                            : "bg-neo-red text-white"
                        }`}
                      >
                        {item.score} / 100
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
