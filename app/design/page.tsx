"use client";

import { useState, useTransition } from "react";
import { Appliance, OrientationResult } from "@/lib/types";
import { getPanelOrientation } from "@/lib/solarMath";
import Header from "../_components/headers";
import { designSystem } from "@/lib/actions";

let idCounter = 1;

export default function DesignPage() {
  const [appliances, setAppliances] = useState<Appliance[]>([
    { id: "a1", name: "AC unit", watts: 1500, hoursPerDay: 6 },
    { id: "a2", name: "Fridge", watts: 150, hoursPerDay: 24 },
  ]);
  const [backupHours, setBackupHours] = useState(6);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [locError, setLocError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState(null);
  const [orientation, setOrientation] = useState<OrientationResult | null>(
    null
  );
  const [aiNarration, setAiNarration] = useState<{
    recommendation: string;
    risks: string[];
  } | null>(null);

  const addAppliance = () => {
    idCounter += 1;
    setAppliances((prev) => [
      ...prev,
      { id: `a${idCounter}`, name: "", watts: 0, hoursPerDay: 0 },
    ]);
  };

  const updateAppliance = (id: string, patch: Partial<Appliance>) => {
    setAppliances((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
    );
  };

  const removeAppliance = (id: string) => {
    setAppliances((prev) => prev.filter((a) => a.id !== id));
  };

  const useMyLocation = () => {
    setLocError(null);
    if (!navigator.geolocation) {
      setLocError("Geolocation not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords({ lat, lon });
        setOrientation(getPanelOrientation(lat, lon));
      },
      () =>
        setLocError(
          "Could not get your location. You can enter coordinates manually."
        )
    );
  };

  const calculate = () => {
    if (appliances.length === 0) {
      setError("Add at least one appliance before calculating.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const data = await designSystem(
          appliances,
          backupHours,
          coords?.lat,
          coords?.lon
        );
        setResult(data.sizing);
        setOrientation(data.orientation);
        setAiNarration(data.ai);
      } catch (err) {
        console.error(err);
        setError("Something went wrong calculating this. Please try again.");
      }
    });
  };

  const totalWatts = appliances.reduce((sum, a) => sum + (a.watts || 0), 0);

  return (
    <>
      <Header />
      <main className="w-full min-h-screen bg-[#12161C] pt-24 sm:pt-20">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          {/* Header block */}
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-8 sm:mb-10 border-b border-white/10 pb-6">
            <div>
              <h1 className="text-[26px] sm:text-[32px] font-semibold text-white tracking-tight">
                Design a system
              </h1>
              <p className="text-[14px] sm:text-[15px] text-white/50 mt-1 max-w-md">
                List your loads and location — we'll size the panels, battery, and inverter.
              </p>
            </div>
            {appliances.length > 0 && (
              <div className="flex items-center gap-2 text-[13px] font-mono tabular-nums text-white/40">
                {totalWatts.toLocaleString()} W connected load
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,440px)_1fr] gap-8 lg:gap-12 items-start">

            {/* Form column */}
            <div className="flex flex-col gap-6">

              {/* Appliances */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-white/40">Appliances / loads</span>
                  <button
                    type="button"
                    onClick={addAppliance}
                    className="text-[13px] text-[#F5A623] hover:text-[#FFB84D] transition-colors"
                  >
                    + Add
                  </button>
                </div>

                {appliances.length === 0 && (
                  <p className="text-[13px] text-white/30 py-3">
                    No appliances added yet.
                  </p>
                )}

                <div className="flex flex-col gap-2">
                  {appliances.map((a) => (
                    <div
                      key={a.id}
                      className="grid grid-cols-[1fr_72px_64px_28px] gap-2 items-center"
                    >
                      <input
                        value={a.name}
                        onChange={(e) =>
                          updateAppliance(a.id, { name: e.target.value })
                        }
                        placeholder="Name"
                        className="bg-white/[0.03] border border-white/10 focus:border-[#F5A623]/40 text-white text-[13px] px-2.5 py-2 rounded-md focus:outline-none placeholder:text-white/25 transition-colors"
                      />
                      <input
                        type="number"
                        min={0}
                        value={a.watts}
                        onChange={(e) =>
                          updateAppliance(a.id, {
                            watts: Number(e.target.value),
                          })
                        }
                        placeholder="Watts"
                        className="bg-white/[0.03] border border-white/10 focus:border-[#F5A623]/40 text-white text-[13px] px-2.5 py-2 rounded-md focus:outline-none placeholder:text-white/25 transition-colors font-mono tabular-nums"
                      />
                      <input
                        type="number"
                        min={0}
                        max={24}
                        value={a.hoursPerDay}
                        onChange={(e) =>
                          updateAppliance(a.id, {
                            hoursPerDay: Number(e.target.value),
                          })
                        }
                        placeholder="Hrs"
                        className="bg-white/[0.03] border border-white/10 focus:border-[#F5A623]/40 text-white text-[13px] px-2.5 py-2 rounded-md focus:outline-none placeholder:text-white/25 transition-colors font-mono tabular-nums"
                      />
                      <button
                        type="button"
                        onClick={() => removeAppliance(a.id)}
                        className="text-white/30 hover:text-[#FF6B6B] text-[18px] leading-none transition-colors"
                        aria-label={`Remove ${a.name || "appliance"}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Backup duration */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] text-white/40">
                  Backup duration needed (hours)
                </label>
                <input
                  type="number"
                  min={0}
                  max={24}
                  value={backupHours}
                  onChange={(e) => setBackupHours(Number(e.target.value))}
                  className="bg-white/[0.03] border border-white/10 focus:border-[#F5A623]/40 text-white text-[14px] px-3 py-2.5 rounded-md focus:outline-none transition-colors font-mono tabular-nums w-28"
                />
              </div>

              {/* Location */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] text-white/40">
                  Location (for orientation + sun hours)
                </label>
                <button
                  type="button"
                  onClick={useMyLocation}
                  className="min-h-11 border border-white/10 hover:border-white/25 text-white/70 hover:text-white text-[13px] rounded-md transition-colors"
                >
                  Use my location
                </button>
                {coords && (
                  <span className="text-[12px] font-mono tabular-nums text-white/40">
                    {coords.lat.toFixed(3)}, {coords.lon.toFixed(3)}
                  </span>
                )}
                {locError && (
                  <span className="text-[12px] text-[#FF6B6B]">{locError}</span>
                )}
              </div>

              <button
                type="button"
                onClick={calculate}
                disabled={isPending}
                className="w-full min-h-12 bg-[#F5A623] hover:bg-[#FFB84D] disabled:opacity-30 disabled:cursor-not-allowed text-[#12161C] text-[15px] font-semibold rounded-md transition-colors active:scale-[0.99]"
              >
                {isPending ? "Calculating…" : "Calculate"}
              </button>
              {error && (
                <p className="text-[13px] text-[#FF6B6B] -mt-3">{error}</p>
              )}
            </div>

            {/* Results column */}
            <div className="lg:min-h-[420px]">
              {result ? (
                <div className="bg-white/[0.03] border border-white/10 rounded-lg p-5 sm:p-7 flex flex-col gap-6">
                  <h3 className="text-[20px] font-semibold text-white tracking-tight">
                    Recommended sizing
                  </h3>

                  <div className="grid grid-cols-2 gap-px bg-white/10 rounded-md overflow-hidden">
                    <ResultCard label="Panel wattage" value={`${result.panelWattage} W`} />
                    <ResultCard label="Battery bank" value={`${result.batteryAh} Ah`} />
                    <ResultCard label="Inverter size" value={`${result.inverterKva} kVA`} />
                    <ResultCard label="Daily energy use" value={`${result.totalDailyWh} Wh`} />
                  </div>

                  {aiNarration && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[13px] font-medium text-white/85">
                        Advisor notes
                      </span>
                      <p className="text-[13px] text-white/55 leading-relaxed">
                        {aiNarration.recommendation}
                      </p>
                      {aiNarration.risks.length > 0 && (
                        <ul className="flex flex-col gap-1.5 mt-1">
                          {aiNarration.risks.map((risk, i) => (
                            <li
                              key={i}
                              className="text-[12px] text-white/45 leading-relaxed pl-3 border-l border-white/15"
                            >
                              {risk}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {orientation && (
                    <div className="flex flex-col gap-1.5 pt-5 border-t border-white/10">
                      <span className="text-[13px] font-medium text-white/85">
                        Panel orientation
                      </span>
                      <p className="text-[13px] text-white/55 leading-relaxed">
                        Face panels{" "}
                        <span className="text-white/85 font-mono tabular-nums">
                          {orientation.azimuthLabel}
                        </span>{" "}
                        at a tilt of{" "}
                        <span className="text-white/85 font-mono tabular-nums">
                          {orientation.tiltDeg}°
                        </span>{" "}
                        from horizontal, based on your latitude of{" "}
                        {orientation.latitude.toFixed(2)}°.
                      </p>
                    </div>
                  )}

                  <p className="text-[12px] text-white/30 leading-relaxed pt-5 border-t border-white/10">
                    Panel wattage assumes ~4.5 peak sun hours/day and 20% system
                    losses. Battery sizing assumes a 24V bank, 50% depth of
                    discharge. Inverter includes a 1.5× surge margin. Adjust
                    for your specific equipment specifications before purchase.
                  </p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center border border-dashed border-white/10 rounded-lg p-12 sm:p-16">
                  <p className="text-[14px] text-white/35 max-w-xs">
                    Fill in your appliances and calculate to see sizing and orientation recommendations.
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

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#12161C] p-4 flex flex-col gap-1">
      <span className="text-[11px] text-white/40">{label}</span>
      <span className="text-[20px] font-semibold text-white font-mono tabular-nums">
        {value}
      </span>
    </div>
  );
}
