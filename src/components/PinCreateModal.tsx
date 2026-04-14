"use client";

import { useEffect, useMemo, useState } from "react";
import type { PinRow, PinVisibility, TimePrecision } from "@/types/pin";

type UpsertPayload = {
  lat: number;
  lng: number;
  note: string | null;
  visibility: PinVisibility;

  time_from_key: number | null;
  time_to_key: number | null;
  time_from_text: string | null;
  time_to_text: string | null;
  time_precision: TimePrecision;
  is_current: boolean;
};

type Props =
  | {
      open: boolean;
      mode: "create";
      lat: number;
      lng: number;
      initialPin?: never;
      onClose: () => void;
      onSave: (payload: UpsertPayload) => Promise<void> | void;
    }
  | {
      open: boolean;
      mode: "edit";
      lat?: never;
      lng?: never;
      initialPin: PinRow;
      onClose: () => void;
      onSave: (payload: UpsertPayload) => Promise<void> | void;
    };

const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 700, marginTop: 10 };
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #ddd",
  outline: "none",
  fontSize: 14,
};
const rowStyle: React.CSSProperties = { display: "flex", gap: 8, alignItems: "center" };

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function keyFromParts(p: {
  precision: TimePrecision;
  year: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
}): number {
  const Y = p.year;
  const M = p.precision === "year" ? 1 : p.month ?? 1;
  const D = p.precision === "year" || p.precision === "month" ? 1 : p.day ?? 1;

  const h = p.precision === "hour" || p.precision === "minute" || p.precision === "second" ? p.hour ?? 0 : 0;
  const m = p.precision === "minute" || p.precision === "second" ? p.minute ?? 0 : 0;
  const s = p.precision === "second" ? p.second ?? 0 : 0;

  // YYYYMMDDHHmmss (14 digits) -> safe in JS number (< 1e14)
  const keyStr = `${Y}${pad2(M)}${pad2(D)}${pad2(h)}${pad2(m)}${pad2(s)}`;
  return Number(keyStr);
}

function textFromParts(p: {
  precision: TimePrecision;
  year: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
}): string {
  const Y = p.year;
  const M = p.month;
  const D = p.day;
  const h = p.hour;
  const m = p.minute;
  const s = p.second;

  if (p.precision === "year") return `${Y}`;
  if (p.precision === "month") return `${Y}-${pad2(M ?? 1)}`;
  if (p.precision === "day") return `${Y}-${pad2(M ?? 1)}-${pad2(D ?? 1)}`;
  if (p.precision === "hour") return `${Y}-${pad2(M ?? 1)}-${pad2(D ?? 1)} ${pad2(h ?? 0)}:00`;
  if (p.precision === "minute") return `${Y}-${pad2(M ?? 1)}-${pad2(D ?? 1)} ${pad2(h ?? 0)}:${pad2(m ?? 0)}`;
  return `${Y}-${pad2(M ?? 1)}-${pad2(D ?? 1)} ${pad2(h ?? 0)}:${pad2(m ?? 0)}:${pad2(s ?? 0)}`;
}

function partsFromKey(key: number | null): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  const k = key ? String(key).padStart(14, "0") : "20000101000000";
  return {
    year: Number(k.slice(0, 4)),
    month: Number(k.slice(4, 6)),
    day: Number(k.slice(6, 8)),
    hour: Number(k.slice(8, 10)),
    minute: Number(k.slice(10, 12)),
    second: Number(k.slice(12, 14)),
  };
}

export default function PinCreateModal(props: Props) {
  const open = props.open;

  const initial = useMemo(() => {
    if (props.mode === "edit") {
      const p = props.initialPin;
      return {
        lat: Number(p.lat),
        lng: Number(p.lng),
        note: p.note ?? "",
        visibility: (p.visibility ?? "private") as PinVisibility,
        precision: (p.time_precision ?? "second") as TimePrecision,
        is_current: Boolean(p.is_current),
        fromKey: p.time_from_key ?? null,
        toKey: p.time_to_key ?? null,
      };
    }
    return {
      lat: props.lat,
      lng: props.lng,
      note: "",
      visibility: "private" as PinVisibility,
      precision: "second" as TimePrecision,
      is_current: false,
      fromKey: null as number | null,
      toKey: null as number | null,
    };
  }, [props]);

  const [note, setNote] = useState(initial.note);
  const [visibility, setVisibility] = useState<PinVisibility>(initial.visibility);
  const [precision, setPrecision] = useState<TimePrecision>(initial.precision);
  const [isCurrent, setIsCurrent] = useState<boolean>(initial.is_current);

  const [fromParts, setFromParts] = useState(() => partsFromKey(initial.fromKey));
  const [toParts, setToParts] = useState(() => partsFromKey(initial.toKey ?? initial.fromKey));

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // when opening, reset to initial (important for reuse)
  useEffect(() => {
    if (!open) return;
    setNote(initial.note);
    setVisibility(initial.visibility);
    setPrecision(initial.precision);
    setIsCurrent(initial.is_current);

    setFromParts(partsFromKey(initial.fromKey));
    setToParts(partsFromKey(initial.toKey ?? initial.fromKey));
    setErr(null);
  }, [open, initial]);

  // when precision changes, apply minimal defaults and copy start->end
  useEffect(() => {
    // copy start to end automatically (user can still edit end after)
    setToParts((prev) => ({ ...prev, ...fromParts }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [precision]);

  // helper: should show fields?
  const showMonth = precision !== "year";
  const showDay = precision === "day" || precision === "hour" || precision === "minute" || precision === "second";
  const showHour = precision === "hour" || precision === "minute" || precision === "second";
  const showMinute = precision === "minute" || precision === "second";
  const showSecond = precision === "second";

  const handleSave = async () => {
    setSaving(true);
    setErr(null);
    try {
      // basic validation
      if (!fromParts.year || fromParts.year < 1) throw new Error("Start year is invalid.");

      const fromKey = keyFromParts({
        precision,
        year: fromParts.year,
        month: fromParts.month,
        day: fromParts.day,
        hour: fromParts.hour,
        minute: fromParts.minute,
        second: fromParts.second,
      });

      const fromText = textFromParts({
        precision,
        year: fromParts.year,
        month: fromParts.month,
        day: fromParts.day,
        hour: fromParts.hour,
        minute: fromParts.minute,
        second: fromParts.second,
      });

      let toKey: number | null = null;
      let toText: string | null = null;

      if (!isCurrent) {
        toKey = keyFromParts({
          precision,
          year: toParts.year,
          month: toParts.month,
          day: toParts.day,
          hour: toParts.hour,
          minute: toParts.minute,
          second: toParts.second,
        });

        toText = textFromParts({
          precision,
          year: toParts.year,
          month: toParts.month,
          day: toParts.day,
          hour: toParts.hour,
          minute: toParts.minute,
          second: toParts.second,
        });
      } else {
        toKey = null;
        toText = "Current";
      }

      const payload: UpsertPayload = {
        lat: initial.lat,
        lng: initial.lng,
        note: note.trim() ? note.trim() : null,
        visibility,
        time_precision: precision,
        is_current: isCurrent,
        time_from_key: fromKey,
        time_to_key: toKey,
        time_from_text: fromText,
        time_to_text: toText,
      };

      await props.onSave(payload);
    } catch (e: any) {
      setErr(e?.message || "Save failed.");
      throw e;
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const title = props.mode === "edit" ? `Edit Pin` : `Create Pin`;
  const subtitle = props.mode === "edit" ? `ID: ${props.initialPin.id}` : `lat/lng: ${initial.lat.toFixed(5)}, ${initial.lng.toFixed(5)}`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={props.onClose}
    >
      <div
        style={{ width: 520, background: "white", borderRadius: 16, padding: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{title}</div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{subtitle}</div>
          </div>
          <button onClick={props.onClose} style={{ border: "1px solid #ddd", background: "white", borderRadius: 10, padding: "6px 10px" }}>
            Close
          </button>
        </div>

        {/* NOTE */}
        <label style={labelStyle}>
          Note
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="여기에 기록"
            style={{ ...inputStyle, height: 110, resize: "vertical" }}
          />
        </label>

        {/* VISIBILITY */}
        <label style={labelStyle}>
          Visibility
          <select value={visibility} onChange={(e) => setVisibility(e.target.value as PinVisibility)} style={inputStyle}>
            <option value="private">private (only me)</option>
            <option value="public_anonymous">public (anonymous)</option>
            <option value="public_with_author">public (with author)</option>
          </select>
        </label>

        {/* TIME */}
        <label style={labelStyle}>
          Time precision
          <select value={precision} onChange={(e) => setPrecision(e.target.value as TimePrecision)} style={inputStyle}>
            <option value="year">Year</option>
            <option value="month">Month</option>
            <option value="day">Day</option>
            <option value="hour">Hour</option>
            <option value="minute">Minute</option>
            <option value="second">Second</option>
          </select>
        </label>

        <div style={{ marginTop: 10, padding: 12, border: "1px solid #eee", borderRadius: 14, background: "#fafafa" }}>
          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>Range</div>

          {/* START */}
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Start</div>
          <div style={rowStyle}>
            <input
              style={{ ...inputStyle, width: 110 }}
              type="number"
              value={fromParts.year}
              onChange={(e) => {
                const year = Number(e.target.value || 0);
                setFromParts((p) => ({ ...p, year }));
                // auto-copy to end (default behavior)
                setToParts((p) => ({ ...p, year }));
              }}
              placeholder="YYYY"
            />

            {showMonth && (
              <input
                style={{ ...inputStyle, width: 80 }}
                type="number"
                value={fromParts.month}
                onChange={(e) => {
                  const month = Number(e.target.value || 0);
                  setFromParts((p) => ({ ...p, month }));
                  setToParts((p) => ({ ...p, month }));
                }}
                placeholder="MM"
                min={1}
                max={12}
              />
            )}

            {showDay && (
              <input
                style={{ ...inputStyle, width: 80 }}
                type="number"
                value={fromParts.day}
                onChange={(e) => {
                  const day = Number(e.target.value || 0);
                  setFromParts((p) => ({ ...p, day }));
                  setToParts((p) => ({ ...p, day }));
                }}
                placeholder="DD"
                min={1}
                max={31}
              />
            )}

            {showHour && (
              <input
                style={{ ...inputStyle, width: 80 }}
                type="number"
                value={fromParts.hour}
                onChange={(e) => {
                  const hour = Number(e.target.value || 0);
                  setFromParts((p) => ({ ...p, hour }));
                  setToParts((p) => ({ ...p, hour }));
                }}
                placeholder="hh"
                min={0}
                max={23}
              />
            )}

            {showMinute && (
              <input
                style={{ ...inputStyle, width: 80 }}
                type="number"
                value={fromParts.minute}
                onChange={(e) => {
                  const minute = Number(e.target.value || 0);
                  setFromParts((p) => ({ ...p, minute }));
                  setToParts((p) => ({ ...p, minute }));
                }}
                placeholder="mm"
                min={0}
                max={59}
              />
            )}

            {showSecond && (
              <input
                style={{ ...inputStyle, width: 80 }}
                type="number"
                value={fromParts.second}
                onChange={(e) => {
                  const second = Number(e.target.value || 0);
                  setFromParts((p) => ({ ...p, second }));
                  setToParts((p) => ({ ...p, second }));
                }}
                placeholder="ss"
                min={0}
                max={59}
              />
            )}
          </div>

          {/* END */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700 }}>End</div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#333" }}>
              <input type="checkbox" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} />
              Current
            </label>
          </div>

          {!isCurrent && (
            <div style={rowStyle}>
              <input
                style={{ ...inputStyle, width: 110 }}
                type="number"
                value={toParts.year}
                onChange={(e) => setToParts((p) => ({ ...p, year: Number(e.target.value || 0) }))}
                placeholder="YYYY"
              />

              {showMonth && (
                <input
                  style={{ ...inputStyle, width: 80 }}
                  type="number"
                  value={toParts.month}
                  onChange={(e) => setToParts((p) => ({ ...p, month: Number(e.target.value || 0) }))}
                  placeholder="MM"
                  min={1}
                  max={12}
                />
              )}

              {showDay && (
                <input
                  style={{ ...inputStyle, width: 80 }}
                  type="number"
                  value={toParts.day}
                  onChange={(e) => setToParts((p) => ({ ...p, day: Number(e.target.value || 0) }))}
                  placeholder="DD"
                  min={1}
                  max={31}
                />
              )}

              {showHour && (
                <input
                  style={{ ...inputStyle, width: 80 }}
                  type="number"
                  value={toParts.hour}
                  onChange={(e) => setToParts((p) => ({ ...p, hour: Number(e.target.value || 0) }))}
                  placeholder="hh"
                  min={0}
                  max={23}
                />
              )}

              {showMinute && (
                <input
                  style={{ ...inputStyle, width: 80 }}
                  type="number"
                  value={toParts.minute}
                  onChange={(e) => setToParts((p) => ({ ...p, minute: Number(e.target.value || 0) }))}
                  placeholder="mm"
                  min={0}
                  max={59}
                />
              )}

              {showSecond && (
                <input
                  style={{ ...inputStyle, width: 80 }}
                  type="number"
                  value={toParts.second}
                  onChange={(e) => setToParts((p) => ({ ...p, second: Number(e.target.value || 0) }))}
                  placeholder="ss"
                  min={0}
                  max={59}
                />
              )}
            </div>
          )}

          <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
            Display:{" "}
            <span style={{ fontWeight: 700 }}>
              {textFromParts({ precision, ...fromParts })} ~ {isCurrent ? "Current" : textFromParts({ precision, ...toParts })}
            </span>
          </div>
        </div>

        {err && <div style={{ marginTop: 10, color: "crimson", fontSize: 12 }}>{err}</div>}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
          <button
            onClick={props.onClose}
            style={{ border: "1px solid #ddd", background: "white", borderRadius: 12, padding: "10px 12px", cursor: "pointer" }}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{ border: "1px solid #111", background: "#111", color: "white", borderRadius: 12, padding: "10px 12px", cursor: "pointer" }}
            disabled={saving}
          >
            {saving ? "Saving..." : props.mode === "edit" ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
