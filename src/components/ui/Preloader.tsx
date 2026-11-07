import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

interface PreloaderProps {
  onLoaded?: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onLoaded }) => {
  const { progress, active } = useProgress();
  const [fading, setFading] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (progress >= 100 && !active) {
      const timer = setTimeout(() => {
        setFading(true);
        if (onLoaded) onLoaded();
        const hideTimer = setTimeout(() => setHidden(true), 600);
        return () => clearTimeout(hideTimer);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [progress, active, onLoaded]);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a080c] transition-opacity duration-700 ease-out ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Minimalist golden glowing line - Zero text */}
      <div className="relative w-40 sm:w-56 h-[2px] bg-white/10 overflow-hidden rounded-full">
        <div
          className="h-full bg-gradient-to-r from-yellow-700 via-amber-400 to-yellow-200 transition-all duration-300 ease-out"
          style={{ width: `${Math.round(progress)}%` }}
        />
      </div>
    </div>
  );
};
