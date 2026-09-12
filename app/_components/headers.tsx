"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { path: "/troubleshoot", label: "Troubleshoot" },
  { path: "/design", label: "Design a System" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 w-full z-50 bg-[#12161C]/95 backdrop-blur border-b border-white/10">
      <div className="min-h-16 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-y-1 py-2 sm:py-0">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-[#F5A623] flex items-center justify-center text-[#12161C] font-semibold text-[13px] shrink-0">
            SE
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-semibold text-white tracking-tight">
              SolarExpert
            </span>
            <span className="hidden sm:block text-[11px] text-white/40">
              AI-assisted solar diagnostics
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 ml-2 pl-3 border-l border-white/10 font-mono text-[11px] tabular-nums text-white/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3DDC84]" />
            v1.0 online
          </div>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1 order-3 sm:order-2 w-full sm:w-auto justify-center sm:justify-start">
          {NAV.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`px-3 py-1.5 text-[13px] sm:text-[14px] rounded-md transition-colors ${
                  active
                    ? "bg-[#F5A623]/15 text-[#F5A623] font-medium"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
