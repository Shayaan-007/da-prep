"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

type HasId = { id: string };

const timers = new Map<string, ReturnType<typeof setTimeout>>();

function localKey(key: string) {
  return `da-prep:${key}`;
}

function readLocal<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(localKey(key));
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeLocal<T>(key: string, items: T[]) {
  try {
    localStorage.setItem(localKey(key), JSON.stringify(items));
  } catch {}
}

async function pushCloud(userId: string, key: string, items: unknown[]) {
  await supabase()?.from("user_data").upsert(
    { user_id: userId, key, value: items, updated_at: new Date().toISOString() },
    { onConflict: "user_id,key" },
  );
}

/**
 * A list persisted in localStorage and, when signed in, synced to Supabase.
 * First sign-in on a device merges local and cloud items by id; after that the cloud copy wins.
 */
export function useCollection<T extends HasId>(key: string) {
  const { user } = useAuth();
  const userId = user?.id;
  const [items, setItems] = useState<T[]>([]);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<T[]>([]);

  useEffect(() => {
    const local = readLocal<T>(key);
    ref.current = local;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(local);
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    const sb = supabase();
    if (!sb || !userId || !loaded) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await sb.from("user_data").select("value").eq("key", key).maybeSingle();
      if (cancelled || error) return;
      const cloud = (data?.value as T[] | undefined) ?? null;
      const mergedFlag = `da-prep:merged:${userId}:${key}`;
      let next = ref.current;
      if (cloud) {
        let firstSync = false;
        try {
          firstSync = !localStorage.getItem(mergedFlag);
        } catch {}
        next = firstSync
          ? [...cloud, ...ref.current.filter((l) => !cloud.some((c) => c.id === l.id))]
          : cloud;
      }
      try {
        localStorage.setItem(mergedFlag, "1");
      } catch {}
      ref.current = next;
      setItems(next);
      writeLocal(key, next);
      if (!cloud || next.length !== cloud.length) await pushCloud(userId, key, next);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, loaded, key]);

  const update = useCallback(
    (fn: (prev: T[]) => T[]) => {
      const next = fn(ref.current);
      ref.current = next;
      setItems(next);
      writeLocal(key, next);
      if (userId) {
        const t = `${userId}:${key}`;
        clearTimeout(timers.get(t));
        timers.set(
          t,
          setTimeout(() => void pushCloud(userId, key, next), 800),
        );
      }
    },
    [key, userId],
  );

  return { items, loaded, update };
}

/** Wipe local copies of all app data (used by "delete my data"). */
export function clearLocalData() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("da-prep:"))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
}
