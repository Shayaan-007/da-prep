"use client";

import { useCallback, useSyncExternalStore } from "react";
import { SECTOR_IDS, type SectorId } from "@/lib/sectors";

const KEY = "da-prep:sector";
const EVENT = "da-prep:prefs";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

/** The user's chosen sector, persisted locally. Empty string means none chosen. */
export function useSector() {
  const raw = useSyncExternalStore(subscribe, read, () => "");
  const sector = (SECTOR_IDS as readonly string[]).includes(raw) ? (raw as SectorId) : null;
  const setSector = useCallback((id: SectorId | null) => {
    try {
      if (id) localStorage.setItem(KEY, id);
      else localStorage.removeItem(KEY);
    } catch {}
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return { sector, setSector };
}
