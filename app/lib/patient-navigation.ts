"use client";

import { useSyncExternalStore } from "react";

function subscribeToLocation(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function getSelectedToken() {
  return new URLSearchParams(window.location.search).get("token") ?? "";
}

export function useSelectedPatientToken() {
  return useSyncExternalStore(subscribeToLocation, getSelectedToken, () => "");
}
