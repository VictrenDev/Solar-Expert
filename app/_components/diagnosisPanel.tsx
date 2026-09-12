"use client";

import { useState } from "react";
import { FaultEntry } from "@/lib/knowledgeBase";

export default function DiagnosisPanel({ result }: { result: FaultEntry }) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const copySummary = () => {
    const text = `Diagnosis: ${result.title}\nFix: ${result.steps
      .map((s, i) => `${i + 1}. ${s.title}`)
      .join(" ")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-lg p-5 sm:p-7 flex flex-col gap-6">

      {/* Status row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[11px] tabular-nums px-2 py-1 rounded bg-[#F5A623]/15 text-[#F5A623] font-medium">
            {result.causeTag}
          </span>
          <span className="text-[12px] text-white/40">
            Identified cause
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[12px] tabular-nums">
          <span className="text-white/40">Confidence</span>
          <span className="text-[#3DDC84] font-semibold">{result.confidence}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="flex flex-col gap-2">
        <h3 className="text-[20px] sm:text-[24px] leading-tight text-white font-semibold tracking-tight">
          {result.title}
        </h3>
        <p className="text-[14px] sm:text-[15px] text-white/60 leading-relaxed">
          {result.summary}
        </p>
      </div>

      {/* Positive note */}
      <div className="flex gap-3 border-l-2 border-[#3DDC84]/50 pl-3.5 py-0.5">
        <p className="text-[13px] text-white/60 leading-relaxed">
          <span className="text-white/85 font-medium">Good news — </span>
          {result.positiveNote}
        </p>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-3">
        <span className="text-[15px] font-semibold text-white">
          Recommended fix
        </span>
        <div className="flex flex-col">
          {result.steps.map((step, i) => (
            <div
              key={step.title}
              className="flex items-start gap-3.5 py-3 border-t border-white/10 first:border-t-0"
            >
              <span className="font-mono text-[12px] tabular-nums text-white/30 shrink-0 mt-0.5 w-4">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] font-medium text-white/90">
                  {step.title}
                </span>
                <p className="text-[13px] text-white/50 leading-relaxed">
                  {step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explanation accordion */}
      <div className="rounded-md border border-white/10 overflow-hidden">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/[0.03] transition-colors min-h-11"
        >
          <span className="text-[14px] font-medium text-white/85">
            Why does this happen?
          </span>
          <span
            className={`text-white/40 text-[12px] transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </button>
        {expanded && (
          <div className="px-4 pb-4">
            <p className="text-[13px] text-white/55 leading-relaxed">
              {result.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={copySummary}
            className="min-h-11 sm:h-9 px-3.5 border border-white/10 hover:border-white/25 text-white/70 hover:text-white text-[13px] rounded-md transition-colors"
          >
            {copied ? "Copied" : "Copy summary"}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-11 sm:h-9 px-3.5 border border-white/10 hover:border-white/25 text-white/70 hover:text-white text-[13px] rounded-md transition-colors"
          >
            Print
          </button>
        </div>
        <span className="text-[12px] text-white/30 text-center sm:text-left">
          SolarExpert diagnostics
        </span>
      </div>
    </div>
  );
}
