"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap as GMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { supabase } from "@/lib/supabaseClient";
import type { PinRow } from "@/types/pin";
import PinCreateModal from "@/components/PinCreateModal";

const DEFAULT_CENTER = { lat: 43.6532, lng: -79.3832 }; // Toronto
const DRAWER_WIDTH = 340;
const GOOGLE_LIBRARIES: "places"[] = ["places"];

type LatLng = { lat: number; lng: number };

export default function GoogleMap() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? "",
    libraries: GOOGLE_LIBRARIES,
  });

  const [searchText, setSearchText] = useState("");
  const [isPinsPanelOpen, setIsPinsPanelOpen] = useState(true);

  const mapRef = useRef<google.maps.Map | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const autocompleteListenerRef = useRef<google.maps.MapsEventListener | null>(null);

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

  useEffect(() => {
    let alive = true;

    const loadUser = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!alive) return;
        setUserId(userData?.user?.id ?? null);
      } catch {
        if (!alive) return;
        setUserId(null);
      }
    };

    loadUser();

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
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        if (!userData.user) throw new Error("Not logged in");

        const { data, error } = await supabase
          .from("pins")
          .select("*")
          .order("created_at", { ascending: false });

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

  useEffect(() => {
    if (!isLoaded) return;
    if (!inputRef.current) return;
    if (autocompleteRef.current) return;
    if (!window.google?.maps?.places) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ["geometry", "name", "formatted_address"],
    });

    autocompleteRef.current = autocomplete;

    autocompleteListenerRef.current = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const geometry = place.geometry;

      if (!mapRef.current || !geometry) return;

      if (geometry.viewport) {
        mapRef.current.fitBounds(geometry.viewport);
      } else if (geometry.location) {
        const pos = {
          lat: geometry.location.lat(),
          lng: geometry.location.lng(),
        };
        mapRef.current.panTo(pos);
        mapRef.current.setZoom(16);
      }

      if (geometry.location) {
        setTempPin({
          lat: geometry.location.lat(),
          lng: geometry.location.lng(),
        });
        setCreateOpen(true);
      }
    });

    return () => {
      autocompleteListenerRef.current?.remove();
      autocompleteListenerRef.current = null;
      autocompleteRef.current = null;
    };
  }, [isLoaded]);

  if (!apiKey) {
    return <div>Missing Google Maps API key</div>;
  }

  if (loadError) {
    return <div>Failed to load Google Maps</div>;
  }

  return (
   <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      paddingTop: 72, // 핵심
      overflow: "hidden",
      background: "white",
  }}
>

     {/* MAP BASE LAYER */}
      <div
  style={{
    position: "relative",
    zIndex: 0,
    height: "100%",
    width: "100%",
    overflow: "hidden",
  }}
>
        {isLoaded ? (
          <GMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={DEFAULT_CENTER}
            zoom={12}
            onLoad={(map) => {
              mapRef.current = map;
            }}
            onUnmount={() => {
              mapRef.current = null;
            }}
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
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-500">
            Loading map...
          </div>
        )}
      </div>

      {/* SEARCH OVERLAY */}
      <div className="fixed left-3 top-[84px] z-[900] w-80 rounded-xl border border-zinc-200 bg-white p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
        <div className="mb-1.5 text-xs font-bold">Search</div>

        <input
          ref={inputRef}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search a place..."
          className="w-full rounded-[10px] border border-zinc-300 px-3 py-2.5 text-sm outline-none"
        />
      </div>

      {/* MY PINS DRAWER */}
      <aside
        style={{
          position: "fixed",
          top: 72,
          right: isPinsPanelOpen ? 0 : -DRAWER_WIDTH,
          bottom: 0,
          width: DRAWER_WIDTH,
          maxWidth: "calc(100vw - 2rem)",
          zIndex: 1000,
          background: "white",
          borderLeft: "1px solid #e5e7eb",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          padding: 12,
          transition: "right 300ms ease-out",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ flexShrink: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>My Pins</h3>

              <div style={{ fontSize: 12, color: "#71717a" }}>
                {loadingPins ? "loading..." : `${pins.length} items`}
              </div>
            </div>

            <div style={{ marginTop: 8, fontSize: 12, color: "#71717a" }}>
              signed-in: {userId ? "yes" : "no (should redirect / block by page guard)"}
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
              paddingRight: 4,
              paddingBottom: 24,
            }}
          >
            {loadingPins ? (
              <div style={{ color: "#71717a" }}>Loading...</div>
            ) : pins.length === 0 ? (
              <div style={{ color: "#71717a" }}>No pins yet. Click the map to create one.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pins.map((p) => {
                  const isSelected = String(p.id) === String(selectedPinId);

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
                        width: "100%",
                        border: isSelected ? "1px solid #d4d4d8" : "1px solid #e5e7eb",
                        background: isSelected ? "#f4f4f5" : "white",
                        borderRadius: 12,
                        padding: 12,
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                        }}
                      >
                        <div style={{ fontSize: 12, color: "#71717a" }}>{timeLine}</div>
                        <div style={{ fontSize: 11, color: "#a1a1aa" }}>ID: {p.id}</div>
                      </div>

                      <div
                        style={{
                          marginTop: 6,
                          whiteSpace: "pre-wrap",
                          fontSize: 14,
                          lineHeight: 1.35,
                        }}
                      >
                        {preview || "(empty)"}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedPin && (
              <div
                style={{
                  marginTop: 14,
                  borderTop: "1px solid #e5e7eb",
                  paddingTop: 12,
                }}
              >
                <div style={{ fontSize: 12, color: "#71717a" }}>
                  Selected ID: {selectedPin.id}
                </div>

                <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setEditingPin(selectedPin)}
                    style={{
                      cursor: "pointer",
                      borderRadius: 12,
                      border: "1px solid #18181b",
                      background: "#18181b",
                      color: "white",
                      padding: "8px 12px",
                    }}
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
                    style={{
                      cursor: "pointer",
                      borderRadius: 12,
                      border: "1px solid #d4d4d8",
                      background: "white",
                      padding: "8px 12px",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* CREATE MODAL */}
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

            const time_text = `${payload.time_from_text ?? ""} ~ ${
              payload.is_current ? "Current" : payload.time_to_text ?? ""
            }`.trim();

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

              time_text,
              time_key,
            };

            const { data, error } = await supabase
              .from("pins")
              .insert(insertRow)
              .select("*")
              .single();

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

      {/* EDIT MODAL */}
      {editingPin && (
        <PinCreateModal
          open={true}
          mode="edit"
          initialPin={editingPin}
          onClose={() => setEditingPin(null)}
          onSave={async (payload) => {
            if (!userId) throw new Error("Not logged in");

            const patch = {
              note: payload.note,
              visibility: payload.visibility,

              time_from_key: payload.time_from_key,
              time_to_key: payload.time_to_key,
              time_from_text: payload.time_from_text,
              time_to_text: payload.time_to_text,
              time_precision: payload.time_precision,
              is_current: payload.is_current,

              time_text: `${payload.time_from_text ?? ""} ~ ${
                payload.is_current ? "Current" : payload.time_to_text ?? ""
              }`.trim(),
              time_key: payload.time_from_key ? String(payload.time_from_key) : null,
            };

            const { data, error } = await supabase
              .from("pins")
              .update(patch)
              .eq("id", editingPin.id)
              .select("*")
              .single();

            if (error) throw error;

            const updated = data as PinRow;

            setPins((prev) =>
              prev.map((p) => (String(p.id) === String(updated.id) ? updated : p))
            );

            setEditingPin(null);
          }}
        />
      )}
    </div>
  );
}