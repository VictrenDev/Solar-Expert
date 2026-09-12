import { Appliance, OrientationResult, SizingResult } from "./types";

export function getPanelOrientation(
  lat: number,
  lon: number
): OrientationResult {
  const azimuthDeg = lat >= 0 ? 180 : 0;
  const azimuthLabel = lat >= 0 ? "True South" : "True North";

  let tiltDeg = Math.abs(lat);
  if (tiltDeg < 10) tiltDeg = 10; // minimum tilt near equator for dust/rain runoff

  return {
    latitude: lat,
    longitude: lon,
    tiltDeg: Math.round(tiltDeg * 10) / 10,
    azimuthDeg,
    azimuthLabel,
  };
}

const PEAK_SUN_HOURS_DEFAULT = 4.5; // Port Harcourt approx.
const SYSTEM_VOLTAGE = 24; // assume 24V bank for mid-size home systems
const DEPTH_OF_DISCHARGE = 0.5; // lead-acid default
const SURGE_FACTOR = 1.5; // inverter surge headroom
const AUTONOMY_DAYS = 1;

export function calculateSizing(
  appliances: Appliance[],
  backupHours: number,
  peakSunHours: number = PEAK_SUN_HOURS_DEFAULT
): SizingResult {
  const totalDailyWh = appliances.reduce(
    (sum, a) => sum + a.watts * a.hoursPerDay,
    0
  );
  const totalPeakWatts = appliances.reduce((sum, a) => sum + a.watts, 0);

  // Battery sizing: Wh needed for backup window, scaled by autonomy + DoD
  const backupWh = (totalDailyWh / 24) * backupHours * AUTONOMY_DAYS;
  const batteryAh =
    backupWh / SYSTEM_VOLTAGE / DEPTH_OF_DISCHARGE;

  // Panel sizing: daily Wh needed / peak sun hours, with ~20% system losses
  const panelWattage = (totalDailyWh / peakSunHours) * 1.2;

  // Inverter sizing: peak load with surge headroom, in kVA
  const inverterKva = (totalPeakWatts * SURGE_FACTOR) / 1000;

  return {
    totalDailyWh: Math.round(totalDailyWh),
    totalPeakWatts: Math.round(totalPeakWatts),
    batteryAh: Math.round(batteryAh),
    panelWattage: Math.round(panelWattage),
    inverterKva: Math.round(inverterKva * 10) / 10,
  };
}
