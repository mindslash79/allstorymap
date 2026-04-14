"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import GoogleMap from "@/components/GoogleMap";
import LogoutButton from "@/components/LogoutButton";

export default function MapPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        router.replace("/login");
        return;
      }

      setChecking(false);
    };

    run();

    // 로그인 상태 변경(예: 다른 탭에서 로그아웃)에도 즉시 막기
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [router]);

  if (checking) {
    return <div style={{ padding: 12 }}>Checking session...</div>;
  }

  return (
    <div style={{ height: "100vh", width: "100%", display: "flex", flexDirection: "column" }}>
      {/* 상단바 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 12,
          borderBottom: "1px solid #eee",
          background: "white",
        }}
      >
        <div style={{ fontWeight: 800 }}>AllStory Map</div>
        <LogoutButton />
      </div>

      {/* 지도 영역 */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <GoogleMap />
      </div>
    </div>
  );
}
