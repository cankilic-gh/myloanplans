"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface UseIdleTimerOptions {
  timeout: number; // in milliseconds
  onIdle: () => void;
  warningTime?: number; // show warning before logout (in milliseconds)
}

export function useIdleTimer({ timeout, onIdle, warningTime }: UseIdleTimerOptions) {
  const [isWarning, setIsWarning] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    // Clear existing timers
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
    setIsWarning(false);

    // Set warning timer if specified
    if (warningTime && warningTime < timeout) {
      warningTimerRef.current = setTimeout(() => {
        setIsWarning(true);
      }, timeout - warningTime);
    }

    // Set idle timer
    idleTimerRef.current = setTimeout(() => {
      onIdle();
    }, timeout);
  };

  useEffect(() => {
    // Events to track user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Reset timer on any activity
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Start initial timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
    };
  }, [timeout, onIdle, warningTime]);

  return { isWarning };
}

export function useAutoLogout() {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);

  const handleIdle = () => {
    // Clear authentication
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userEmail");
    
    // Redirect to landing page
    router.push("/");
  };

  const { isWarning } = useIdleTimer({
    timeout: 15 * 60 * 1000, // 15 minutes
    onIdle: handleIdle,
    warningTime: 60 * 1000, // 1 minute warning
  });

  useEffect(() => {
    setShowWarning(isWarning);
  }, [isWarning]);

  return { showWarning };
}




