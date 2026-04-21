"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type LoginClientProps = {
  next: string;
};

const LOGIN_BACKGROUNDS = [
  "/Login_City_Night.png",
  "/Login_Country_Night.png",
  "/Login_Sea_Night.png",
  "/Login_Korea_Night.png",
];

export default function LoginClient({ next }: LoginClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  useEffect(() => {
    const randomImage =
      LOGIN_BACKGROUNDS[Math.floor(Math.random() * LOGIN_BACKGROUNDS.length)];
    setBackgroundImage(randomImage);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace(next);
      }
    };

    checkSession();
  }, [router, next]);

  const signInWithGoogle = async () => {
    setLoading(true);

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      next
    )}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      console.error(error);
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
      <div
        className="login-background-cinematic"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.10), rgba(0,0,0,0.22) 45%, rgba(0,0,0,0.30) 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          minHeight: "100vh",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingLeft: "24px",
          paddingRight: "24px",
          paddingBottom: "120px",
        }}
      >
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          style={{
            minWidth: "300px",
            padding: "16px 26px",
            borderRadius: "18px",
            border: "1px solid rgba(255,255,255,0.28)",
            background: "rgba(250, 244, 235, 0.72)",
            color: "#2f241d",
            fontSize: "16px",
            fontWeight: 600,
            letterSpacing: "0.01em",
            boxShadow:
              "0 16px 40px rgba(0,0,0,0.26), 0 0 24px rgba(255,214,153,0.10), inset 0 1px 0 rgba(255,255,255,0.35)",
            backdropFilter: "blur(14px) saturate(120%)",
            WebkitBackdropFilter: "blur(14px) saturate(120%)",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition:
              "transform 180ms ease, box-shadow 220ms ease, background 220ms ease, filter 220ms ease",
          }}
          onMouseEnter={(e) => {
            if (loading) return;
            e.currentTarget.style.transform = "translateY(-2px) scale(1.025)";
            e.currentTarget.style.background = "rgba(252, 246, 238, 0.82)";
            e.currentTarget.style.boxShadow =
              "0 20px 50px rgba(0,0,0,0.30), 0 0 34px rgba(255,214,153,0.22), inset 0 1px 0 rgba(255,255,255,0.42)";
            e.currentTarget.style.filter = "brightness(1.03)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.background = "rgba(250, 244, 235, 0.72)";
            e.currentTarget.style.boxShadow =
              "0 16px 40px rgba(0,0,0,0.26), 0 0 24px rgba(255,214,153,0.10), inset 0 1px 0 rgba(255,255,255,0.35)";
            e.currentTarget.style.filter = "brightness(1)";
          }}
        >
          {loading ? "Opening Google..." : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}