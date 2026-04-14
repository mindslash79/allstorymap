"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap as GMap, LoadScript, Marker } from "@react-google-maps/api";
import { supabase } from "@/lib/supabaseClient";
import type { PinRow } from "@/types/pin";
import PinCreateModal from "@/components/PinCreateModal";

const containerStyle = { width: "100%", height: "100%" };
const DEFAULT_CENTER = { lat: 43.6532, lng: -79.3832 }; // Toronto



type LatLng = { lat: number; lng: number };

export default function GoogleMap() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [searchText, setSearchText] = useState("");
  const [auto, setAuto] = useState<google.maps.places.Autocomplete | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [pins, setPins] = useState<PinRow[]>([]);
  const [loadingPins, setLoadingPins] = useState(true);

  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  const [tempPin, setTempPin] = useState<LatLng | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [editingPin, setEditingPin] = useState<PinRow | null>(null);

  const selectedPin = useMemo(() => {
    if (!selectedPinId) return null;
    return pins.find((p) => String(p.id) === String(selectedPinId)) ?? null;
  }, [pins, selectedPinId]);

  const flyTo = (pos: LatLng, zoom = 15) => {
    const m = mapRef.current;
    if (!m) return;
    m.panTo(pos);
    m.setZoom(zoom);
  };

  const handlePlaceChanged = () => {
    if (!auto || !mapRef.current) return;

    const place = auto.getPlace();
    const geometry = place.geometry;

    if (!geometry) return;

    // 1) viewport가 있으면 fitBounds (가장 정확)
    if (geometry.viewport) {
      mapRef.current.fitBounds(geometry.viewport);
    } else if (geometry.location) {
      // 2) location만 있으면 panTo + zoom
      const pos = { lat: geometry.location.lat(), lng: geometry.location.lng() };
      mapRef.current.panTo(pos);
      mapRef.current.setZoom(16);
    }

    // tempPin도 같이 세팅해서 바로 핀 만들기 가능하게
    if (geometry.location) {
      setTempPin({ lat: geometry.location.lat(), lng: geometry.location.lng() });
      setCreateOpen(true);
    }
  };


  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData?.user?.id ?? null;
        if (!alive) return;
        setUserId(uid);
      } catch {
        if (!alive) return;
        setUserId(null);
      }
    };

    load();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const fetchPins = async () => {
      setLoadingPins(true);
      try {
        // 로그인 필수 정책이면, 로그인 없으면 fetch 안함
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        if (!userData.user) throw new Error("Not logged in");

        const { data, error } = await supabase.from("pins").select("*").order("created_at", { ascending: false });
        if (error) throw error;

        if (!alive) return;
        setPins((data ?? []) as PinRow[]);
      } catch (e) {
        console.error("Failed to load pins:", e);
      } finally {
        if (alive) setLoadingPins(false);
      }
    };

    fetchPins();
    return () => {
      alive = false;
    };
  }, []);

  if (!apiKey) return <div>Missing Google Maps API key</div>;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 0px)" }}>
      {/* MAP */}
      <div style={{ flex: 1, position: "relative" }}>
        <LoadScript googleMapsApiKey={apiKey} libraries={["places"]}>
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              zIndex: 5,
              width: 320,
              background: "white",
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              padding: 10,
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            }}
          >
            {/* Autocomplete input */}
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Search</div>

            {/* @react-google-maps/api Autocomplete 없이도 되는 순수 방식:
                여기서는 구글의 Autocomplete 객체를 input에 직접 바인딩 */}
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search a place..."
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                outline: "none",
                fontSize: 14,
              }}
              ref={(el) => {
                if (!el) return;
                if (auto) return; // 이미 바인딩 되었으면 중복 방지

                // google maps places autocomplete attach
                const a = new google.maps.places.Autocomplete(el, {
                  fields: ["geometry", "name", "formatted_address"],
                });

                a.addListener("place_changed", () => {
                  setAuto(a);
                  // setAuto는 async 느낌이라, 즉시 처리 위해 직접 a로 처리
                  const place = a.getPlace();
                  const geometry = place.geometry;

                  if (!mapRef.current || !geometry) return;

                  if (geometry.viewport) {
                    mapRef.current.fitBounds(geometry.viewport);
                  } else if (geometry.location) {
                    const pos = { lat: geometry.location.lat(), lng: geometry.location.lng() };
                    mapRef.current.panTo(pos);
                    mapRef.current.setZoom(16);
                  }

                  if (geometry.location) {
                    setTempPin({ lat: geometry.location.lat(), lng: geometry.location.lng() });
                    setCreateOpen(true);
                  }
                });

                setAuto(a);
              }}
            />
          </div>

          <GMap
            mapContainerStyle={containerStyle}
            center={DEFAULT_CENTER}
            zoom={12}
            onLoad={(map) => void (mapRef.current = map)}
            onClick={(e) => {
              if (!e.latLng) return;
              setTempPin({ lat: e.latLng.lat(), lng: e.latLng.lng() });
              setCreateOpen(true);
            }}
            options={{
              clickableIcons: false,
              streetViewControl: false,
              fullscreenControl: false,
              mapTypeControl: false,
            }}
          >
            {pins.map((p) => (
              <Marker
                key={String(p.id)}
                position={{ lat: Number(p.lat), lng: Number(p.lng) }}
                onClick={() => {
                  setSelectedPinId(String(p.id));
                  flyTo({ lat: Number(p.lat), lng: Number(p.lng) }, 15);
                }}
              />
            ))}

            {tempPin && <Marker position={tempPin} />}
          </GMap>
        </LoadScript>

        {/* CREATE */}
        {createOpen && tempPin && (
          <PinCreateModal
            open={createOpen}
            mode="create"
            lat={tempPin.lat}
            lng={tempPin.lng}
            onClose={() => {
              setCreateOpen(false);
              setTempPin(null);
            }}
            onSave={async (payload) => {
              if (!userId) throw new Error("Not logged in");

              // legacy compatibility (optional)
              const time_text = `${payload.time_from_text ?? ""} ~ ${payload.is_current ? "Current" : payload.time_to_text ?? ""}`.trim();
              const time_key = payload.time_from_key ? String(payload.time_from_key) : null;

              const insertRow = {
                user_id: userId,
                lat: payload.lat,
                lng: payload.lng,
                note: payload.note,
                visibility: payload.visibility,

                time_from_key: payload.time_from_key,
                time_to_key: payload.time_to_key,
                time_from_text: payload.time_from_text,
                time_to_text: payload.time_to_text,
                time_precision: payload.time_precision,
                is_current: payload.is_current,

                // legacy if columns exist
                time_text,
                time_key,
              };

              const { data, error } = await supabase.from("pins").insert(insertRow).select("*").single();
              if (error) throw error;

              const newPin = data as PinRow;

              setPins((prev) => [newPin, ...prev]);
              setSelectedPinId(String(newPin.id));
              flyTo({ lat: Number(newPin.lat), lng: Number(newPin.lng) }, 15);

              setCreateOpen(false);
              setTempPin(null);
            }}
          />
        )}

        {/* EDIT */}
        {editingPin && (
          <PinCreateModal
            open={true}
            mode="edit"
            initialPin={editingPin}
            onClose={() => setEditingPin(null)}
            onSave={async (payload) => {
              if (!userId) throw new Error("Not logged in");

              const patch = {
                // lat/lng edit는 일단 허용 안함 (원하면 가능)
                note: payload.note,
                visibility: payload.visibility,

                time_from_key: payload.time_from_key,
                time_to_key: payload.time_to_key,
                time_from_text: payload.time_from_text,
                time_to_text: payload.time_to_text,
                time_precision: payload.time_precision,
                is_current: payload.is_current,

                // legacy
                time_text: `${payload.time_from_text ?? ""} ~ ${payload.is_current ? "Current" : payload.time_to_text ?? ""}`.trim(),
                time_key: payload.time_from_key ? String(payload.time_from_key) : null,
              };

              const { data, error } = await supabase.from("pins").update(patch).eq("id", editingPin.id).select("*").single();
              if (error) throw error;

              const updated = data as PinRow;
              setPins((prev) => prev.map((p) => (String(p.id) === String(updated.id) ? updated : p)));
              setEditingPin(null);
            }}
          />
        )}
      </div>

      {/* RIGHT LIST */}
      <div style={{ width: 380, borderLeft: "1px solid #e5e5e5", background: "white", padding: 12, overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <h3 style={{ margin: 0 }}>My Pins</h3>
          <div style={{ fontSize: 12, color: "#666" }}>{loadingPins ? "loading..." : `${pins.length} items`}</div>
        </div>

        <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
          signed-in: {userId ? "✅ yes" : "❌ no (should redirect / block by page guard)"}
        </div>

        {loadingPins ? (
          <div style={{ marginTop: 12, color: "#666" }}>Loading...</div>
        ) : pins.length === 0 ? (
          <div style={{ marginTop: 12, color: "#666" }}>아직 핀이 없어. 지도에서 클릭해서 만들어봐.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            {pins.map((p) => {
              const isSelected = selectedPinId && String(p.id) === String(selectedPinId);

              const timeLine =
                p.time_from_text && (p.is_current || p.time_to_text)
                  ? `${p.time_from_text} ~ ${p.is_current ? "Current" : p.time_to_text}`
                  : p.time_text ?? "(no time)";

              const preview = (p.note ?? "").toString().slice(0, 140);

              return (
                <button
                  key={String(p.id)}
                  onClick={() => {
                    setSelectedPinId(String(p.id));
                    flyTo({ lat: Number(p.lat), lng: Number(p.lng) }, 15);
                  }}
                  style={{
                    textAlign: "left",
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #ddd",
                    background: isSelected ? "#f5f5f5" : "white",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontSize: 12, color: "#666" }}>{timeLine}</div>
                    <div style={{ fontSize: 11, color: "#999" }}>ID: {p.id}</div>
                  </div>

                  <div style={{ fontSize: 14, whiteSpace: "pre-wrap", lineHeight: 1.35, marginTop: 6 }}>
                    {preview || "(empty)"}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Selected controls */}
        {selectedPin && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #eee" }}>
            <div style={{ fontSize: 12, color: "#666" }}>Selected ID: {selectedPin.id}</div>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button
                onClick={() => setEditingPin(selectedPin)}
                style={{ border: "1px solid #111", background: "#111", color: "white", borderRadius: 12, padding: "10px 12px", cursor: "pointer" }}
              >
                Edit
              </button>

              <button
                onClick={async () => {
                  const ok = confirm(`Delete pin ${selectedPin.id}?`);
                  if (!ok) return;

                  const { error } = await supabase.from("pins").delete().eq("id", selectedPin.id);
                  if (error) {
                    alert(error.message);
                    return;
                  }

                  setPins((prev) => prev.filter((p) => String(p.id) !== String(selectedPin.id)));
                  setSelectedPinId(null);
                }}
                style={{ border: "1px solid #ddd", background: "white", borderRadius: 12, padding: "10px 12px", cursor: "pointer" }}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
