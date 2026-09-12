export type Diagnosis = {
  causeTag: string;
  confidence: "High match" | "Medium match" | "Low match";
  title: string;
  summary: string;
  positiveNote: string;
  steps: { title: string; detail: string }[];
  explanation: string;
};

export type Appliance = {
  id: string;
  name: string;
  watts: number;
  hoursPerDay: number;
};

export type OrientationResult = {
  latitude: number;
  longitude: number;
  tiltDeg: number;
  azimuthDeg: number;
  azimuthLabel: string;
};

export type SizingResult = {
  totalDailyWh: number;
  totalPeakWatts: number;
  batteryAh: number;
  panelWattage: number;
  inverterKva: number;
};
