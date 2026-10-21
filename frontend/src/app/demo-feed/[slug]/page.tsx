"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Globe,
  Search,
  Lock,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  ShieldAlert,
  ShieldCheck,
  Building,
  MessageSquare,
  Sparkles,
  MousePointer,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface StepConfig {
  url: string;
  tabTitle: string;
  badge: string;
  badgeColor: string;
}

export default function DemoFeedPage() {
  const params = useParams();
  const slug = (params?.slug as string)?.toLowerCase() || "apex";
  const isApex = slug.includes("apex");

  const [activeStep, setActiveStep] = useState(0);
  const [isAutoCycling, setIsAutoCycling] = useState(true);

  const steps: StepConfig[] = isApex
    ? [
        {
          url: "https://www.whois.com/whois/apex-globlogistics-track.live",
          tabTitle: "WHOIS Lookup",
          badge: "11 DAYS OLD DOMAIN",
          badgeColor: "bg-neo-red text-white",
        },
        {
          url: "https://www.mca.gov.in/mcafoportal/companyLLPMasterData.do",
          tabTitle: "MCA Corporate Registry",
          badge: "ZERO REGISTRATION FOUND",
          badgeColor: "bg-neo-red text-white",
        },
        {
          url: "https://www.reddit.com/r/scams/search?q=apex+global+logistics",
          tabTitle: "Threat Intel / Forums",
          badge: "KNOWN ADVANCE FEE SCAM",
          badgeColor: "bg-neo-red text-white",
        },
      ]
    : [
        {
          url: "https://www.whois.com/whois/infosys.com",
          tabTitle: "WHOIS Registry",
          badge: "25+ YEARS CONTINUOUS DOMAIN",
          badgeColor: "bg-neo-mint text-neo-black",
        },
        {
          url: "https://www.mca.gov.in/mcafoportal/companyLLPMasterData.do",
          tabTitle: "MCA India Registry",
          badge: "CIN: L85110KA1981PLC013115",
          badgeColor: "bg-neo-mint text-neo-black",
        },
        {
          url: "https://www.bseindia.com/stock-share-price/infosys-ltd/infy/500209/",
          tabTitle: "BSE / Corporate Filings",
          badge: "TIER-1 VERIFIED PUBLIC CO",
          badgeColor: "bg-neo-mint text-neo-black",
        },
      ];

  // Auto-cycle through simulated agent tabs every 4 seconds
  useEffect(() => {
    if (!isAutoCycling) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoCycling, steps.length]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none overflow-hidden">
      {/* 1. RETRO SIMULATED BROWSER CHROME */}
      <div className="bg-neutral-900 border-b-2 border-neutral-700 px-3 py-2 flex flex-col space-y-2">
        {/* Top Window Bar with Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* macOS / Retro Window Dots */}
            <div className="flex items-center space-x-1.5 mr-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block border border-rose-700"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block border border-amber-700"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block border border-emerald-700"></span>
            </div>

            {/* Agent Tabs */}
            <div className="flex space-x-1">
              {steps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsAutoCycling(false);
                    setActiveStep(idx);
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-t-lg border-t-2 border-x-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                    activeStep === idx
                      ? "bg-neutral-800 text-white border-neutral-600 shadow-sm"
                      : "bg-neutral-950/60 text-neutral-400 border-transparent hover:text-neutral-200"
                  }`}
                >
                  <span>{step.tabTitle}</span>
                  {activeStep === idx && (
                    <span className="w-1.5 h-1.5 rounded-full bg-neo-yellow animate-ping"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* TinyFish Agent Watermark & Auto-cycle indicator */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
              agent: headless-chromium-v126
            </span>
            <button
              onClick={() => setIsAutoCycling(!isAutoCycling)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded border transition cursor-pointer ${
                isAutoCycling
                  ? "bg-neo-yellow text-neo-black border-neo-black"
                  : "bg-neutral-800 text-neutral-300 border-neutral-700"
              }`}
            >
              {isAutoCycling ? "Auto-Play: ON" : "Paused"}
            </button>
          </div>
        </div>

        {/* Address Bar Navigation */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-neutral-400">
            <button
              onClick={() => {
                setIsAutoCycling(false);
                setActiveStep((prev) => (prev > 0 ? prev - 1 : steps.length - 1));
              }}
              className="p-1 hover:bg-neutral-800 rounded transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setIsAutoCycling(false);
                setActiveStep((prev) => (prev + 1) % steps.length);
              }}
              className="p-1 hover:bg-neutral-800 rounded transition cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveStep(activeStep)}
              className="p-1 hover:bg-neutral-800 rounded transition cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* URL Input Box */}
          <div className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1 flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <Lock className="w-3 h-3 text-emerald-400 flex-shrink-0" />
              <span className="text-xs font-mono text-neutral-200 truncate">
                {steps[activeStep].url}
              </span>
            </div>
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${steps[activeStep].badgeColor}`}
            >
              {steps[activeStep].badge}
            </span>
          </div>
        </div>
      </div>

      {/* 2. SIMULATED BROWSER VIEWPORT CONTENT */}
      <div className="flex-1 bg-neutral-900/90 relative p-4 md:p-6 overflow-y-auto">
        {/* Floating TinyFish Agent Cursor Animation */}
        <div className="absolute top-12 right-20 z-20 pointer-events-none flex items-center space-x-1 bg-neo-black/90 text-white text-[10px] font-mono px-2 py-1 rounded-full border border-neutral-600 shadow-neo animate-bounce">
          <MousePointer className="w-3 h-3 text-neo-yellow" />
          <span>TinyFish Inspector</span>
        </div>

        {/* STEP 0: WHOIS INSPECTION */}
        {activeStep === 0 && (
          <div className="max-w-3xl mx-auto space-y-4 animate-fadeIn">
            <div className="bg-neutral-950 rounded-2xl border-2 border-neutral-700 p-5 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-neo-blue" />
                  <h2 className="text-base font-black uppercase tracking-wide text-neutral-200">
                    Domain Whois Record Lookup
                  </h2>
                </div>
                <span className="text-xs font-mono text-neutral-400">Source: ICANN RDAP</span>
              </div>

              {isApex ? (
                <div className="space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <span className="text-neutral-400">Domain Name:</span>
                    <span className="col-span-2 font-bold text-white">
                      apex-globlogistics-track.live
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-rose-950/40 border-2 border-rose-500/80 animate-pulse">
                    <span className="text-rose-300 font-bold">Creation Date:</span>
                    <span className="col-span-2 font-black text-rose-400 flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>11 days ago (Recent high-risk registration)</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <span className="text-neutral-400">Registrar:</span>
                    <span className="col-span-2 text-neutral-300">
                      NameCheap Inc. (Privacy Guardian Guard, Iceland)
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <span className="text-neutral-400">Registrant Country:</span>
                    <span className="col-span-2 text-rose-300 font-bold">
                      Redacted for Privacy (High Obfuscation)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <span className="text-neutral-400">Domain Name:</span>
                    <span className="col-span-2 font-bold text-white">infosys.com</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-emerald-950/40 border-2 border-emerald-500/80">
                    <span className="text-emerald-300 font-bold">Creation Date:</span>
                    <span className="col-span-2 font-black text-emerald-400 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>1997-04-18 (9,480+ days active / established 25+ years)</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <span className="text-neutral-400">Registrar:</span>
                    <span className="col-span-2 text-neutral-300">Network Solutions, LLC</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <span className="text-neutral-400">Registrant Org:</span>
                    <span className="col-span-2 text-emerald-300 font-bold">
                      Infosys Limited, Bangalore
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 1: MCA / CORPORATE REGISTRY QUERY */}
        {activeStep === 1 && (
          <div className="max-w-3xl mx-auto space-y-4 animate-fadeIn">
            <div className="bg-neutral-950 rounded-2xl border-2 border-neutral-700 p-5 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
                <div className="flex items-center space-x-2">
                  <Building className="w-5 h-5 text-neo-yellow" />
                  <h2 className="text-base font-black uppercase tracking-wide text-neutral-200">
                    Ministry of Corporate Affairs / Company Search
                  </h2>
                </div>
                <span className="text-xs font-mono text-neutral-400">MCA Portal v3.0</span>
              </div>

              {isApex ? (
                <div className="space-y-4">
                  <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 text-xs font-mono">
                    <span className="text-neutral-400">Search Query: </span>
                    <span className="text-white font-bold">&quot;Apex Global Logistics&quot;</span>
                  </div>

                  <div className="p-6 rounded-xl bg-rose-950/30 border-2 border-rose-500 text-center space-y-2">
                    <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto" />
                    <h3 className="text-sm font-black text-rose-300 uppercase tracking-wider">
                      NO MATCHING ENTITY FOUND IN PUBLIC REGISTRIES
                    </h3>
                    <p className="text-xs text-neutral-300 max-w-md mx-auto">
                      Search across MCA (India), SEC EDGAR (US), and Companies House (UK) returned 0
                      active legal registrations matching this entity name.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <span className="text-neutral-400">Company Name:</span>
                    <span className="col-span-2 font-bold text-white">INFOSYS LIMITED</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/80">
                    <span className="text-emerald-300 font-bold">CIN:</span>
                    <span className="col-span-2 font-black text-emerald-400">
                      L85110KA1981PLC013115
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <span className="text-neutral-400">ROC Code & Status:</span>
                    <span className="col-span-2 text-emerald-300 font-bold">
                      ROC Bangalore · ACTIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                    <span className="text-neutral-400">Key Signatories:</span>
                    <span className="col-span-2 text-neutral-300">
                      Salil Parekh (MD & CEO), Nandan Nilekani (Chairman)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: SCAM FORUM & THREAT INTELLIGENCE */}
        {activeStep === 2 && (
          <div className="max-w-3xl mx-auto space-y-4 animate-fadeIn">
            <div className="bg-neutral-950 rounded-2xl border-2 border-neutral-700 p-5 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-neo-pink" />
                  <h2 className="text-base font-black uppercase tracking-wide text-neutral-200">
                    Consumer Fraud & Forum Threat Intelligence Scan
                  </h2>
                </div>
                <span className="text-xs font-mono text-neutral-400">Reddit / BBB / Trustpilot</span>
              </div>

              {isApex ? (
                <div className="space-y-3">
                  <div className="p-3.5 bg-rose-950/30 rounded-xl border-2 border-rose-500/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-rose-300 uppercase">
                        r/Scams Thread · 3 days ago
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500 text-white">
                        HIGH THREAT
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white">
                      &quot;Fake shipping notification from apex-globlogistics-track.live asking for $350
                      refundable customs deposit.&quot;
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Scammers cloned a real courier tracking UI. After paying the initial deposit,
                      they demand additional inspection fees.
                    </p>
                  </div>

                  <div className="p-3.5 bg-neutral-900 rounded-xl border border-neutral-800 space-y-1">
                    <span className="text-xs font-bold text-neutral-400">
                      Trustpilot & Review Analysis
                    </span>
                    <p className="text-xs text-neutral-300">
                      Zero organic customer reviews. Domain listed on 2 threat intelligence phishing feeds.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 bg-emerald-950/30 rounded-xl border-2 border-emerald-500/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-300 uppercase">
                        BSE / NSE Capital Markets Review
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-neo-black">
                        OFFICIALLY ACCREDITED
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white">
                      Constituent of NIFTY 50 and S&P BSE SENSEX indices. Market Capitalization: ~$80B+.
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Clear regulatory compliance records with SEBI and Ministry of Corporate Affairs.
                    </p>
                  </div>

                  <div className="p-3.5 bg-neutral-900 rounded-xl border border-neutral-800 space-y-1">
                    <span className="text-xs font-bold text-neutral-400">
                      Global Verification Summary
                    </span>
                    <p className="text-xs text-neutral-300">
                      Verified corporate identity across 50+ countries. Zero consumer fraud patterns detected.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. RETRO FOOTER TICKER */}
      <div className="bg-neutral-950 border-t-2 border-neutral-800 px-3 py-1.5 flex items-center justify-between text-[11px] font-mono text-neutral-400">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>STREAM_STATUS: SIMULATED_LIVE_VIEWPORT</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>STEP {activeStep + 1} OF {steps.length}</span>
          <span className="text-neo-yellow font-bold">MODE: DEMO_REPLAY</span>
        </div>
      </div>
    </div>
  );
}
