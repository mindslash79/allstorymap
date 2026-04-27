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
    <div className="relative isolate h-[calc(100vh-72px)] w-full overflow-hidden bg-white">
     {/* MAP BASE LAYER */}
      <div className="relative z-0 h-full w-full">
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
        className={`fixed top-[72px] right-0 bottom-0 z-[1000] border-l border-zinc-200 bg-white p-3 shadow-2xl transition-transform duration-300 ease-out ${
          isPinsPanelOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          width: DRAWER_WIDTH,
              right: 0,
              left: "auto",
          maxWidth: "calc(100vw - 2rem)",
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="m-0 text-xl font-semibold">My Pins</h3>
            <div className="text-xs text-zinc-500">
              {loadingPins ? "loading..." : `${pins.length} items`}
            </div>
          </div>

          <div className="mt-2 text-xs text-zinc-500">
            signed-in: {userId ? "yes" : "no (should redirect / block by page guard)"}
          </div>

          {loadingPins ? (
            <div className="mt-3 text-zinc-500">Loading...</div>
          ) : pins.length === 0 ? (
            <div className="mt-3 text-zinc-500">No pins yet. Click the map to create one.</div>
          ) : (
            <div className="mt-3 flex-1 overflow-auto pb-6">
              <div className="flex flex-col gap-2.5">
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
                      className={`rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? "border-zinc-300 bg-zinc-100"
                          : "border-zinc-200 bg-white hover:bg-zinc-50"
                      }`}
                    >
                      <div className="flex justify-between gap-2.5">
                        <div className="text-xs text-zinc-500">{timeLine}</div>
                        <div className="text-[11px] text-zinc-400">ID: {p.id}</div>
                      </div>

                      <div className="mt-1.5 whitespace-pre-wrap text-sm leading-[1.35]">
                        {preview || "(empty)"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedPin && (
            <div className="mt-3.5 border-t border-zinc-200 pt-3">
              <div className="text-xs text-zinc-500">Selected ID: {selectedPin.id}</div>

              <div className="mt-2.5 flex gap-2.5">
                <button
                  onClick={() => setEditingPin(selectedPin)}
                  className="cursor-pointer rounded-xl border border-zinc-900 bg-zinc-900 px-3 py-2 text-white"
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
                  className="cursor-pointer rounded-xl border border-zinc-300 bg-white px-3 py-2"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* TOGGLE BUTTON */}
      <button
        type="button"
        aria-label={isPinsPanelOpen ? "Close My Pins panel" : "Open My Pins panel"}
        aria-expanded={isPinsPanelOpen}
        onClick={() => setIsPinsPanelOpen((prev) => !prev)}
        className="fixed top-1/2 z-[1010] flex h-14 w-10 -translate-y-1/2 items-center justify-center rounded-l-2xl rounded-r-md border border-zinc-200 bg-white text-zinc-700 shadow-lg transition-[right] duration-300 ease-out"
        style={{
          right: isPinsPanelOpen ? DRAWER_WIDTH : 12,
        }}
      >
        <span className="text-lg leading-none">{isPinsPanelOpen ? ">" : "<"}</span>
      </button>

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