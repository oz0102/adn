"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";

export function AuthSync() {
  const { data: session, status } = useSession();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setAuth(true, session.user);
    } else if (status === "unauthenticated") {
      setAuth(false, null);
    }
  }, [session, status, setAuth]);

  return null;
}

export default AuthSync;
