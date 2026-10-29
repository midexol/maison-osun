// On-device storage for Maison Osùn: readings, ritual check-offs and the bag.
// Nothing leaves the browser; every access is wrapped so private mode or full storage never breaks the app.
"use client";
import { useEffect, useState } from "react";

const K = { readings: "osun.readings.v1", checks: "osun.checks.v1", bag: "osun.bag.v1", active: "osun.active.v1" };
const MAX_READINGS = 12;

const read = (key, fallback) => {
  try { const v = window.localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const write = (key, value) => {
  try { window.localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
};
const emit = () => { try { window.dispatchEvent(new Event("osun:store")); } catch {} };

// ---------- Readings ----------
export function getReadings() {
  const list = read(K.readings, []);
  return Array.isArray(list) ? list.slice().sort((a, b) => (a.at < b.at ? 1 : -1)) : [];
}
export function getReading(id) {
  return getReadings().find((r) => r.id === id) || null;
}
export function latestReading() {
  const active = read(K.active, null);
  const list = getReadings();
  return (active && list.find((r) => r.id === active)) || list[0] || null;
}
export function setActive(id) { write(K.active, id); emit(); }

export function saveReading(reading) {
  let list = getReadings().filter((r) => r.id !== reading.id);
  list.unshift(reading);
  list = list.slice(0, MAX_READINGS);
  // If storage is full, drop thumbnails from the oldest readings until it fits.
  let ok = write(K.readings, list);
  for (let i = list.length - 1; !ok && i > 0; i--) { list[i] = { ...list[i], thumb: null }; ok = write(K.readings, list); }
  write(K.active, reading.id);
  emit();
  return ok;
}
export function updateReading(id, patch) {
  const list = getReadings().map((r) => (r.id === id ? { ...r, ...patch } : r));
  write(K.readings, list); emit();
}
export function deleteReading(id) {
  write(K.readings, getReadings().filter((r) => r.id !== id));
  if (read(K.active, null) === id) write(K.active, null);
  try { window.sessionStorage.removeItem("osun.photo." + id); } catch {}
  emit();
}

// Full-size selfie for this session only (used by the 28-day preview). Never written to localStorage.
export function setPhoto(id, dataUrl) { try { window.sessionStorage.setItem("osun.photo." + id, dataUrl); } catch {} }
export function getPhoto(id) { try { return window.sessionStorage.getItem("osun.photo." + id); } catch { return null; } }

// ---------- Ritual check-offs: { "2026-10-29": { am: ["sheaMilk"], pm: [] } } ----------
export const dayKey = (d = new Date()) => {
  const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
};
export function getChecks() { return read(K.checks, {}) || {}; }
export function toggleCheck(day, slot, productKey) {
  const all = getChecks();
  const d = all[day] || { am: [], pm: [] };
  const cur = new Set(d[slot] || []);
  cur.has(productKey) ? cur.delete(productKey) : cur.add(productKey);
  all[day] = { ...d, [slot]: [...cur] };
  write(K.checks, all); emit();
}

// ---------- Bag: [{ key, qty }] ----------
export function getBag() { const b = read(K.bag, []); return Array.isArray(b) ? b : []; }
export function setBag(items) { write(K.bag, items.filter((i) => i.qty > 0)); emit(); }
export function addToBag(keys) {
  const bag = getBag();
  for (const key of keys) {
    const hit = bag.find((i) => i.key === key);
    hit ? (hit.qty = Math.max(1, hit.qty)) : bag.push({ key, qty: 1 });
  }
  setBag(bag);
}

// React hook: re-reads on every store change (this tab or another).
export function useStore(getter, deps = []) {
  const [value, setValue] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const up = () => { setValue(getter()); setReady(true); };
    up();
    window.addEventListener("osun:store", up);
    window.addEventListener("storage", up);
    return () => { window.removeEventListener("osun:store", up); window.removeEventListener("storage", up); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return [value, ready];
}
