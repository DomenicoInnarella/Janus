import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Car, Sparkles, Navigation } from 'lucide-react';
import { JanusSplashGraphic } from './JanusSplashGraphic';

interface SplashScreenProps {
  onComplete: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  durationMs = 4500,
}) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        setIsExiting(true);
        setTimeout(() => {
          onCompleteRef.current?.();
        }, 350); // allow exit animation to conclude
      }
    }, 30);

    return () => clearInterval(interval);
  }, [durationMs]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      onCompleteRef.current?.();
    }, 150);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="splash-screen-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          onClick={handleSkip}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-6 bg-neutral-950 text-white cursor-pointer select-none overflow-hidden"
          style={{
            background: 'radial-gradient(circle at 50% 40%, #1f1704 0%, #0c0c0c 60%, #050505 100%)',
          }}
        >
          {/* Top Skip Button */}
          <div className="w-full flex justify-end pt-safe">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSkip();
              }}
              className="text-xs font-bold text-neutral-400 hover:text-amber-300 bg-neutral-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-neutral-800 active:scale-95 transition-all shadow-lg"
            >
              Salta intro →
            </button>
          </div>

          {/* Central Logo & Brand Graphic Animation */}
          <div className="flex flex-col items-center text-center my-auto space-y-4 max-w-sm px-2 w-full">
            
            {/* The Janus Poster Artwork (Identical to user's uploaded image) */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 220,
                damping: 20,
                delay: 0.08,
              }}
              className="relative w-full max-w-[290px] sm:max-w-[320px] aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-amber-500/20 ring-4 ring-neutral-900 border-2 border-neutral-800"
            >
              {/* Subtle ambient backlight glow */}
              <div className="absolute -inset-2 bg-amber-400/20 blur-xl pointer-events-none -z-10" />
              
              <JanusSplashGraphic className="w-full h-full" />
            </motion.div>

            {/* Subtitle & Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.4 }}
              className="space-y-1.5 pt-1"
            >
              <h2 className="text-sm sm:text-base font-black text-amber-300 tracking-wide uppercase">
                Parcheggi Privati & City Tour Roma
              </h2>
              <p className="text-xs text-neutral-400 font-medium leading-relaxed max-w-xs">
                Posti auto garantiti, vista tetti con Eagle Map e info varchi ZTL in tempo reale.
              </p>
            </motion.div>

            {/* Quick Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-1.5 pt-1"
            >
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                <Car className="w-3 h-3 text-amber-400" /> Posti Auto P2P
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                <Shield className="w-3 h-3 text-amber-400" /> Varchi ZTL Salvi
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                <Sparkles className="w-3 h-3 text-amber-400" /> Eagle Rooftop
              </span>
            </motion.div>
          </div>

          {/* Bottom Progress Bar & Safe Area */}
          <div className="w-full max-w-xs pb-safe space-y-2">
            <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 rounded-full shadow-sm shadow-amber-400/50"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-medium">
              <span>Roma Capitale • 2026</span>
              <span className="text-amber-300/90 font-bold">Tocca per entrare</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
