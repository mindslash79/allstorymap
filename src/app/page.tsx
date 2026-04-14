"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type UserSummary = {
  id: string;
  email?: string;
};

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: { unsubscribe: () => void } | null = null;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        router.replace(`/login?next=${encodeURIComponent("/")}`);
        return;
      }

      setUser({
        id: session.user.id,
        email: session.user.email ?? undefined,
      });
      setLoading(false);

      const { data: listener } = supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          if (!newSession) {
            router.replace(`/login?next=${encodeURIComponent("/")}`);
          }
        }
      );
      unsub = listener.subscription;
    })();

    return () => {
      unsub?.unsubscribe();
    };
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-xl rounded-2xl border p-6 shadow-sm">
        <h1 className="text-lg font-semibold">You’re signed in</h1>

        <div className="mt-4 text-sm text-gray-700 space-y-1">
          <div><span className="font-medium">User ID:</span> {user?.id}</div>
          {user?.email && (
            <div><span className="font-medium">Email:</span> {user.email}</div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push("/map")}
            className="rounded-xl bg-black px-4 py-2 text-white"
          >
            Go to Map
          </button>

          <button
            onClick={logout}
            className="rounded-xl border px-4 py-2"
          >
            Log out
          </button>
        </div>
      </div>
    </main>
  );
}
