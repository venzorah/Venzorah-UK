import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "lucide-react";
import { Logo } from "../Logo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{outcome: "accepted" | "dismissed";}>;
}

/** Shows only when the browser fires beforeinstallprompt (Chromium-based browsers). */
export function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  return (
    <AnimatePresence>
      {event &&
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:w-96 z-50 bg-white rounded-2xl shadow-pop border border-line p-4 flex items-center gap-3">
        
          <Logo variant="icon" className="h-12 w-12 rounded-xl bg-white" />
          <div className="flex-1">
            <p className="text-sm font-bold text-navy">Install VenZorah</p>
            <p className="text-xs text-muted">Add the app to your home screen for faster shopping.</p>
          </div>
          <button
          onClick={async () => {
            await event.prompt();
            setEvent(null);
          }}
          className="h-9 px-3 rounded-lg bg-gold text-navy text-sm font-bold">
          
            Install
          </button>
          <button onClick={() => setEvent(null)} aria-label="Dismiss" className="h-8 w-8 flex items-center justify-center text-muted">
            <XIcon className="h-4 w-4" />
          </button>
        </motion.div>
      }
    </AnimatePresence>);

}