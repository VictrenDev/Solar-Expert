"use client";

import { useState, useTransition } from "react";
import Header from "../_components/headers";
import DiagnosisPanel from "../_components/diagnosisPanel";
import { diagnoseIssue } from "@/lib/actions";

const QUICK_SYMPTOMS = [
  {
    code: "OVL-01",
    label: "Inverter overload beep",
    desc: "My inverter beeps with an overload warning whenever the air conditioner and water pump turn on together.",
  },
  {
    code: "FLK-02",
    label: "Lights flicker on AC start",
    desc: "Whenever our air conditioning compressor kicks in, the living room lights momentarily dim or flicker.",
  },
  {
    code: "BAT-03",
    label: "Battery drains overnight",
    desc: "Our solar batteries are fully charged at sunset but completely drain out before morning even with minimal use.",
  },
  {
    code: "GEN-04",
    label: "Low panel output",
    desc: "Even on clear, bright sunny afternoons, our solar panels seem to produce noticeably less electricity than usual.",
  },
];

export default function TroubleshootPage() {
  const [description, setDescription] = useState("");
  const [activeCode, setActiveCode] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const pickSymptom = (s) => {
    setDescription(s.desc);
    setActiveCode(s.code);
  };

  const runDiagnosis = () => {
    setError(null);
    startTransition(async () => {
      try {
        const data = await diagnoseIssue(description);
        setResult(data);
      } catch (err) {
        console.error(err);
        setError("Couldn't complete the analysis. Try again.");
      }
    });
  };

  return (
    <>
      <Header />
      <main className="w-full min-h-screen bg-[#12161C] pt-24 sm:pt-20">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          {/* Header block */}
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-8 sm:mb-10 border-b border-white/10 pb-6">
            <div>
              <h1 className="text-[26px] sm:text-[32px] font-semibold text-white tracking-tight">
                System diagnostic
              </h1>
              <p className="text-[14px] sm:text-[15px] text-white/50 mt-1 max-w-md">
                Describe what your solar setup is doing. We'll trace it to a likely cause and next step.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-white/40 font-mono tabular-nums">
              <span className={`w-2 h-2 rounded-full ${isPending ? "bg-[#F5A623] animate-pulse" : "bg-[#3DDC84]"}`} />
              {isPending ? "ANALYZING" : "READY"}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,420px)_1fr] gap-8 lg:gap-12 items-start">

            {/* Input column */}
            <div className="flex flex-col gap-6">
              <div>
                <span className="text-[13px] text-white/40 mb-3 block">
                  Common fault patterns
                </span>
                <div className="flex flex-col gap-1.5">
                  {QUICK_SYMPTOMS.map((s) => (
                    <button
                      key={s.code}
                      type="button"
                      onClick={() => pickSymptom(s)}
                      className={`text-left flex items-center gap-3 px-3 py-2.5 rounded-md border transition-colors ${
                        activeCode === s.code
                          ? "border-[#F5A623]/50 bg-[#F5A623]/10"
                          : "border-white/10 hover:border-white/25 bg-white/[0.02]"
                      }`}
                    >
                      <span className="font-mono text-[11px] tabular-nums text-white/40 shrink-0">
                        {s.code}
                      </span>
                      <span className="text-[14px] text-white/85">
                        {s.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="fault-description" className="text-[13px] text-white/40">
                  Or describe it yourself
                </label>
                <textarea
                  id="fault-description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setActiveCode(null);
                  }}
                  rows={5}
                  placeholder="What happens, and what's running when it does..."
                  className="w-full bg-white/[0.03] border border-white/10 focus:border-[#F5A623]/40 text-white text-[14px] p-3.5 rounded-md focus:outline-none transition-colors placeholder:text-white/25 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={runDiagnosis}
                disabled={isPending || !description.trim()}
                className="w-full min-h-12 bg-[#F5A623] hover:bg-[#FFB84D] disabled:opacity-30 disabled:cursor-not-allowed text-[#12161C] text-[15px] font-semibold rounded-md transition-colors active:scale-[0.99]"
              >
                {isPending ? "Running diagnostic…" : "Run diagnostic"}
              </button>

              {error && (
                <p className="text-[13px] text-[#FF6B6B] -mt-3">{error}</p>
              )}
            </div>

            {/* Results column */}
            <div className="lg:min-h-[420px]">
              {result ? (
                <DiagnosisPanel result={result} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center border border-dashed border-white/10 rounded-lg p-12 sm:p-16">
                  <p className="text-[14px] text-white/35 max-w-xs">
                    Results will appear here once you run a diagnostic.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
