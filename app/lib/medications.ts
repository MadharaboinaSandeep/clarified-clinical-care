export type DemoMedication = {
  id: string;
  name: string;
  instructions: string;
};

const EMPTY_MEDICATIONS: DemoMedication[] = [];
const EVENT_NAME = "apollo-medications-updated";
const cache = new Map<string, DemoMedication[]>();

function storageKey(patientToken: string) {
  return `apollo-medications-${patientToken}`;
}

export function getDemoMedications(patientToken: string): DemoMedication[] {
  if (typeof window === "undefined") return EMPTY_MEDICATIONS;
  if (cache.has(patientToken)) return cache.get(patientToken)!;
  try {
    const saved = window.localStorage.getItem(storageKey(patientToken));
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    const medications = Array.isArray(parsed) ? (parsed as DemoMedication[]) : [];
    cache.set(patientToken, medications);
    return medications;
  } catch {
    cache.set(patientToken, EMPTY_MEDICATIONS);
    return EMPTY_MEDICATIONS;
  }
}

export function getServerDemoMedications(): DemoMedication[] {
  return EMPTY_MEDICATIONS;
}

export function subscribeToDemoMedications(
  patientToken: string,
  callback: () => void,
) {
  const handleUpdate = () => callback();
  const handleStorage = (event: StorageEvent) => {
    if (event.key === storageKey(patientToken)) {
      cache.delete(patientToken);
      callback();
    }
  };
  window.addEventListener(EVENT_NAME, handleUpdate);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(EVENT_NAME, handleUpdate);
    window.removeEventListener("storage", handleStorage);
  };
}

export function saveDemoMedication(patientToken: string, medication: DemoMedication) {
  const medications = [medication, ...getDemoMedications(patientToken)];
  window.localStorage.setItem(storageKey(patientToken), JSON.stringify(medications));
  cache.set(patientToken, medications);
  window.dispatchEvent(new Event(EVENT_NAME));
  return medications;
}
