"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LuxuryAuthPortal } from "@/components/LuxuryAuthPortal";
import { AuthUser } from "@/components/AuthModal";

export default function LoginPage() {
  const router = useRouter();

  const handleAuthSuccess = (user: AuthUser) => {
    localStorage.setItem("marketpulse_auth", JSON.stringify(user));
    localStorage.setItem("marketpulse_auth_user", JSON.stringify(user));
    router.push("/");
  };

  return <LuxuryAuthPortal onAuthSuccess={handleAuthSuccess} defaultTab="login" />;
}