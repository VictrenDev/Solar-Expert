export type FaultEntry = {
  id: string;
  keywords: string[];
  causeTag: string;
  confidence: "High match" | "Medium match" | "Low match";
  title: string;
  summary: string;
  positiveNote: string;
  steps: { title: string; detail: string }[];
  explanation: string;
};

export const FAULT_KB: FaultEntry[] = [
  {
    id: "startup-surge",
    keywords: ["overload", "beep", "ac", "air condition", "pump", "trip", "surge"],
    causeTag: "Startup Surge",
    confidence: "High match",
    title: "Power surges when large appliances start up",
    summary:
      "Your air conditioner or water pump requires a burst of extra power when starting, momentarily exceeding what your inverter can supply all at once.",
    positiveNote:
      "Your battery and solar panels are likely healthy — this is usually a protective cutoff, not a fault in the storage or generation side.",
    steps: [
      {
        title: "Stagger appliance start times",
        detail:
          "Use a 3–5 minute startup delay between the AC and pump so they never draw surge current at the same moment.",
      },
      {
        title: "Install a motor soft-starter kit",
        detail:
          "A soft-starter eases the motor to speed gradually instead of an instant jolt, cutting startup surge by up to 70%.",
      },
      {
        title: "Check battery charge levels",
        detail:
          "Keep the battery above 30% before running heavy appliances in the evening to maintain strong voltage support.",
      },
    ],
    explanation:
      "Think of electricity like water pressure in pipes. Heavy appliances briefly demand a much bigger 'gush' at startup than during normal running. Staggering starts or adding a soft-starter smooths that demand.",
  },
  {
    id: "battery-drain",
    keywords: ["battery", "drain", "empty", "morning", "dead", "discharge"],
    causeTag: "Battery Degradation / Sizing",
    confidence: "Medium match",
    title: "Battery bank undersized or degrading",
    summary:
      "Your battery may not have enough usable capacity for your overnight load, or its real capacity has dropped below its rated value.",
    positiveNote:
      "This is common and fixable — usually a sizing or maintenance issue, not a wiring fault.",
    steps: [
      {
        title: "Check depth of discharge",
        detail:
          "Lead-acid batteries should not be discharged below 50%; lithium below 10-20%. Going deeper repeatedly shortens lifespan and usable capacity.",
      },
      {
        title: "Audit your night-time load",
        detail:
          "List everything running overnight (fridge, router, security lights) and compare total Wh against your battery's usable Ah × voltage.",
      },
      {
        title: "Test battery health",
        detail:
          "A battery over 2-3 years old may have degraded capacity — a load test or voltage-under-load check will confirm this.",
      },
    ],
    explanation:
      "A battery's rated capacity assumes ideal conditions. Age, temperature, and repeated deep discharges all shrink real usable capacity over time.",
  },
  {
    id: "flicker",
    keywords: ["flicker", "dim", "light", "compressor"],
    causeTag: "Voltage Drop",
    confidence: "Medium match",
    title: "Voltage drop from motor startup or wiring",
    summary:
      "Lights dimming when a compressor starts usually points to a voltage dip caused by high startup current, possibly worsened by thin or long wiring runs.",
    positiveNote:
      "This is typically a wiring/sizing issue, not a sign your panels or battery are failing.",
    steps: [
      {
        title: "Check cable gauge",
        detail:
          "Undersized cable between battery/inverter and load increases voltage drop under load — verify gauge matches run length and current.",
      },
      {
        title: "Separate lighting circuit from heavy loads",
        detail:
          "Wiring lights on a separate circuit from motor loads reduces the visible dimming effect.",
      },
      {
        title: "Consider a soft-starter for the compressor",
        detail: "Reduces the instantaneous current spike causing the dip.",
      },
    ],
    explanation:
      "Voltage drop (V=IR) means a sudden current spike through resistance in your wiring causes a brief voltage sag — visible as flicker.",
  },
  {
    id: "low-output",
    keywords: ["less power", "low output", "less electricity", "reduced", "shading"],
    causeTag: "Generation Loss",
    confidence: "Medium match",
    title: "Reduced panel output despite good sunlight",
    summary:
      "Lower-than-expected output on clear days usually points to shading, dirt/dust buildup, panel temperature derating, or an MPPT controller issue.",
    positiveNote: "Most causes here are simple maintenance fixes.",
    steps: [
      {
        title: "Inspect for shading and dust",
        detail:
          "Even partial shading on one panel in a series string can disproportionately cut output. Clean panels regularly, especially in dry/dusty seasons.",
      },
      {
        title: "Check panel temperature",
        detail:
          "Panels lose efficiency as they heat up — ensure airflow beneath/around the array.",
      },
      {
        title: "Verify MPPT controller settings",
        detail:
          "Confirm the controller matches your panel voltage/current specs and isn't stuck in a fault or bypass mode.",
      },
    ],
    explanation:
      "Solar panels are rated under standard test conditions (25°C, no shading). Real-world dust, heat, and partial shading all reduce actual output below the rated figure.",
  },
];

export function matchFaults(description: string): FaultEntry[] {
  const text = description.toLowerCase();
  const scored = FAULT_KB.map((entry) => {
    const score = entry.keywords.reduce(
      (acc, kw) => (text.includes(kw) ? acc + 1 : acc),
      0
    );
    return { entry, score };
  }).filter((s) => s.score > 0);

  scored.sort((a, b) => b.score - a.score);
  return scored.length > 0 ? scored.map((s) => s.entry) : [FAULT_KB[0]];
}
