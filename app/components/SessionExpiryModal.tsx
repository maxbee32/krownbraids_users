// components/SessionExpiryModal.tsx
"use client";

import { useSessionExpiry } from "@/lib/useSessionExpiry";
import { useRouter } from "next/navigation";
import { Clock, Loader2 } from "lucide-react";
import { useState } from "react";

export default function SessionExpiryModal() {
  const { showWarning, msRemaining } = useSessionExpiry();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!showWarning) return null;

  const secondsLeft = Math.max(0, Math.floor(msRemaining / 1000));
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const handleStayLoggedIn = async () => {
    setIsRefreshing(true);
    try {
      // Hit your refresh endpoint
      const token = localStorage.getItem("adminToken");
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("adminToken", data.token);
        // The hook will automatically detect the new expiry and hide the modal
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    router.push("/login");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-plum-900/70 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        
        <h3 className="text-xl font-bold text-ink-900 mb-2">
          Are you still there?
        </h3>
        <p className="text-sm text-ink-500 mb-6">
          Your session is about to expire. For your security, you will be logged out in:
        </p>
        
        <div className="text-4xl font-mono font-bold text-plum-700 mb-8">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={handleStayLoggedIn}
            disabled={isRefreshing}
            className="w-full py-3.5 bg-plum-700 text-white font-semibold rounded-2xl transition-all hover:bg-plum-800 flex items-center justify-center gap-2"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Refreshing session...
              </>
            ) : (
              'Stay logged in'
            )}
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-3.5 bg-cream-100 text-ink-700 font-semibold rounded-2xl transition-all hover:bg-cream-200"
          >
            Log out now
          </button>
        </div>
      </div>
    </div>
  );
}