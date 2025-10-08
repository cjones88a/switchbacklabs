"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "sticky-callout-dismissed";
const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const hideOnPaths = ["/race-trackingV2", "/admin"];

export default function StickyCallout() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if we should hide on current path
    const shouldHide = hideOnPaths.some(path => pathname.startsWith(path));
    if (shouldHide) {
      setIsVisible(false);
      return;
    }

    // Check localStorage for dismissal
    const dismissedData = localStorage.getItem(STORAGE_KEY);
    if (dismissedData) {
      const { timestamp } = JSON.parse(dismissedData);
      const now = Date.now();
      const timeSinceDismissal = now - timestamp;
      
      if (timeSinceDismissal < DISMISS_DURATION) {
        setIsDismissed(true);
        setIsVisible(false);
        return;
      } else {
        // Expired, remove from localStorage
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    // Show after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [pathname]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    
    // Store dismissal with timestamp
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      timestamp: Date.now(),
    }));
  };

  const handleBookSession = () => {
    // Track the action (optional)
    window.location.href = "mailto:switchbacklabsco@gmail.com?subject=Book%20a%20working%20session";
  };

  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
        >
          <div className="card bg-gradient-to-r from-brand/10 to-brand2/10 backdrop-blur-md border-brand/20 p-4 shadow-glow">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm">Ready to move forward?</h3>
                <p className="text-xs text-muted">
                  Let&apos;s align on outcomes and carve a path from ambiguity to shipped.
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleBookSession}
                  className="btn btn-primary flex-1 text-xs"
                >
                  Book a session
                </button>
                <button
                  onClick={handleDismiss}
                  className="btn btn-ghost text-xs px-3"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
