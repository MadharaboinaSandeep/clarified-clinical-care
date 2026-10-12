export type SavedRegistration = {
  token: number;
  name: string;
  birthDate: string;
  age: number;
  gender: string;
  mobile: string;
  bloodGroup: string;
  address: string;
  department: string;
  physician: string;
  visitType: string;
  createdAt: string;
  isEmergency?: boolean;
  emergencyReason?: string;
};

const STORAGE_KEY = "apollo-demo-registrations";
const COMPLETED_VISITS_KEY = "apollo-demo-completed-visits";
const REGISTRATIONS_EVENT = "apollo-demo-registrations-updated";
const EMPTY_REGISTRATIONS: SavedRegistration[] = [];
const EMPTY_COMPLETED_VISITS: Record<string, string> = {};
let cachedRegistrations: SavedRegistration[] | null = null;
let cachedCompletedVisits: Record<string, string> | null = null;

function readRegistrations(): SavedRegistration[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as SavedRegistration[]) : [];
  } catch {
    return [];
  }
}

export function getRegistrations(): SavedRegistration[] {
  if (typeof window === "undefined") return EMPTY_REGISTRATIONS;
  if (cachedRegistrations === null) cachedRegistrations = readRegistrations();
  return cachedRegistrations;
}

export function getServerRegistrations(): SavedRegistration[] {
  return EMPTY_REGISTRATIONS;
}

export function getCompletedVisits(): Record<string, string> {
  if (typeof window === "undefined") return EMPTY_COMPLETED_VISITS;
  if (cachedCompletedVisits === null) {
    try {
      const saved = window.localStorage.getItem(COMPLETED_VISITS_KEY);
      const parsed: unknown = saved ? JSON.parse(saved) : {};
      cachedCompletedVisits =
        parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? (parsed as Record<string, string>)
          : {};
    } catch {
      cachedCompletedVisits = {};
    }
  }
  return cachedCompletedVisits;
}

export function getServerCompletedVisits(): Record<string, string> {
  return EMPTY_COMPLETED_VISITS;
}

export function completeVisit(token: string): string {
  const completedAt = new Date().toISOString();
  const completedVisits = { ...getCompletedVisits(), [token]: completedAt };
  window.localStorage.setItem(COMPLETED_VISITS_KEY, JSON.stringify(completedVisits));
  cachedCompletedVisits = completedVisits;
  window.dispatchEvent(new Event(REGISTRATIONS_EVENT));
  return completedAt;
}

export function saveRegistration(registration: SavedRegistration): SavedRegistration[] {
  const registrations = [registration, ...getRegistrations()];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
  cachedRegistrations = registrations;
  window.dispatchEvent(new Event(REGISTRATIONS_EVENT));
  return registrations;
}

export function subscribeToRegistrations(callback: () => void) {
  window.addEventListener(REGISTRATIONS_EVENT, callback);
  const handleStorage = () => {
    cachedRegistrations = readRegistrations();
    cachedCompletedVisits = null;
    callback();
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(REGISTRATIONS_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
}

export const registrationsEventName = REGISTRATIONS_EVENT;
