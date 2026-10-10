import { addMinutes, format, isSameDay } from "date-fns";
import type { Service } from "../types/marketplace";

export interface Slot {
  start: Date;
  iso: string;
  label: string;
  available: boolean;
}

function atTime(date: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

/**
 * Generates bookable slots from the provider's weekly hours, buffers, notice and existing bookings.
 * Production: generated server-side in Europe/London and re-validated inside a transaction on confirm.
 */
export function generateSlots(service: Service, date: Date, takenIsos: string[], blockedDates: string[], now = new Date()): Slot[] {
  if (service.paused) return [];
  if (blockedDates.includes(format(date, "yyyy-MM-dd"))) return [];
  const hours = service.hours.find((h) => h.day === date.getDay());
  if (!hours) return [];
  const open = atTime(date, hours.open);
  const close = atTime(date, hours.close);
  const earliest = addMinutes(now, service.minNoticeHours * 60);
  const block = service.durationMin + service.bufferMin;
  const taken = takenIsos.map((i) => new Date(i)).filter((d) => isSameDay(d, date));
  const slots: Slot[] = [];
  for (let s = open; addMinutes(s, service.durationMin) <= close; s = addMinutes(s, 30)) {
    const clash = taken.some((t) => Math.abs(t.getTime() - s.getTime()) < block * 60000);
    slots.push({ start: s, iso: s.toISOString(), label: format(s, "HH:mm"), available: s >= earliest && !clash });
  }
  return slots;
}