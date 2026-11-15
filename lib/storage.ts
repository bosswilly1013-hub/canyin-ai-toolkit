"use client";

import { useSyncExternalStore } from "react";

const listeners = new Map<string, Set<() => void>>();

function readKey(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function notify(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

export function usePersisted<T>(key: string, initial: T) {
  const stored = useSyncExternalStore(
    (onChange) => {
      let bucket = listeners.get(key);
      if (!bucket) {
        bucket = new Set();
        listeners.set(key, bucket);
      }
      bucket.add(onChange);
      const onStorage = (event: StorageEvent) => {
        if (event.key === key || event.key === null) onChange();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        bucket?.delete(onChange);
        window.removeEventListener("storage", onStorage);
      };
    },
    () => readKey(key),
    () => null,
  );

  let value = initial;
  if (stored) {
    try {
      value = mergeSaved(initial, JSON.parse(stored) as unknown);
    } catch {
      value = initial;
    }
  }

  function setValue(next: T) {
    localStorage.setItem(key, JSON.stringify(next));
    notify(key);
  }

  function reset() {
    localStorage.removeItem(key);
    notify(key);
  }

  return { value, setValue, reset, fromStorage: stored !== null, ready: true };
}

function mergeSaved<T>(initial: T, saved: unknown): T {
  if (Array.isArray(initial)) return (Array.isArray(saved) ? saved : initial) as T;
  if (saved && typeof saved === "object" && initial && typeof initial === "object") {
    return { ...(initial as object), ...(saved as object) } as T;
  }
  return initial;
}
