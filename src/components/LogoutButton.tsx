"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LogoutButton() {
  const router = useRouter();

  const onLogout = async () => {
    await supabase.auth.signOut();
    // 로그아웃 직후 세션이 사라졌으니 로그인 화면으로
    router.replace("/login");
  };

  return (
    <button
      onClick={onLogout}
      style={{
        padding: "8px 12px",
        borderRadius: 8,
        border: "1px solid #ddd",
        background: "white",
        cursor: "pointer",
        fontWeight: 600,
      }}
    >
      Log out
    </button>
  );
}
