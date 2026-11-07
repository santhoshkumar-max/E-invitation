import React from 'react';
import { ChevronDown, Volume2, VolumeX } from 'lucide-react';

interface OverlayUIProps {
  scrollProgress: number;
  isAudioPlaying: boolean;
  toggleAudio: () => void;
}

export const OverlayUI: React.FC<OverlayUIProps> = ({
  scrollProgress,
  isAudioPlaying,
  toggleAudio,
}) => {
  // Fade out entrance guides as user scrolls
  const introOpacity = Math.max(0, 1 - scrollProgress * 5);
  // Show transition threshold indicator when doors are open
  const transitionOpacity = Math.min(Math.max((scrollProgress - 0.82) * 5, 0), 1);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-6 sm:p-10 select-none">
      {/* TOP BAR */}
      <header className="flex items-center justify-between w-full pointer-events-auto">
        <div className="flex flex-col">
          <span className="font-cinzel text-[10px] sm:text-xs tracking-[0.35em] text-gold/80 uppercase">
            ॥ श्री मङ्गलम् ॥
          </span>
          <span className="font-cormorant text-base sm:text-lg text-white/90 tracking-wider">
            Royal Engagement Invitation
          </span>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={toggleAudio}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gold/30 bg-black/40 backdrop-blur-md text-gold hover:border-gold hover:bg-black/60 transition-all duration-300 text-xs font-cinzel tracking-wider"
          title={isAudioPlaying ? 'Mute Music' : 'Play Festive Ambiance'}
          aria-label="Toggle Ambiance Music"
        >
          {isAudioPlaying ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-gold animate-pulse" />
              <span className="hidden sm:inline">MUSIC ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-gold/60" />
              <span className="hidden sm:inline text-gold/60">MUSIC OFF</span>
            </>
          )}
        </button>
      </header>

      {/* INTRO HERO TITLE & SCROLL PROMPT (Visible on first load) */}
      <div
        className="flex flex-col items-center justify-center text-center my-auto transition-opacity duration-500"
        style={{ opacity: introOpacity }}
      >
        <div className="inline-block px-4 py-1 mb-3 rounded-full border border-gold/20 bg-black/30 backdrop-blur-sm text-[11px] font-cinzel tracking-[0.25em] text-gold">
          CHETTINAD HERITAGE PALACE
        </div>
        <h1 className="font-cinzel text-3xl sm:text-5xl md:text-6xl text-gold-shimmer font-bold tracking-wider mb-3 drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
          GRAND ENTRANCE
        </h1>
        <p className="font-cormorant text-lg sm:text-2xl text-white/85 max-w-lg italic font-light drop-shadow-md">
          A timeless celebration of love, heritage, and auspicious beginnings
        </p>
      </div>

      {/* BOTTOM SCROLL INDICATOR */}
      <div
        className="flex flex-col items-center justify-center pb-2 transition-opacity duration-500"
        style={{ opacity: introOpacity }}
      >
        <span className="font-cinzel text-[11px] tracking-[0.3em] text-gold/90 mb-2 animate-pulse">
          SCROLL TO ENTER
        </span>
        <div className="flex flex-col items-center justify-center w-7 h-11 rounded-full border border-gold/40 bg-black/20 backdrop-blur-sm">
          <ChevronDown className="w-4 h-4 text-gold animate-bounce" />
        </div>
      </div>

      {/* TRANSITION THRESHOLD ANNOUNCEMENT (Revealed when doors swing open at scroll > 85%) */}
      <div
        className="fixed inset-0 flex flex-col items-center justify-center text-center pointer-events-none transition-opacity duration-700"
        style={{ opacity: transitionOpacity }}
      >
        <div className="px-6 py-4 rounded-2xl bg-black/60 border border-gold/40 backdrop-blur-md shadow-[0_0_50px_rgba(212,175,55,0.4)]">
          <span className="font-cinzel text-xs tracking-[0.3em] text-gold block mb-1">
            WELCOME GUEST
          </span>
          <h2 className="font-cormorant text-2xl sm:text-4xl text-white font-semibold tracking-wide">
            Entering The Royal Mandapam
          </h2>
          <span className="font-cormorant text-sm text-gold/80 italic mt-1 block">
            Phase 1 Transition Point Reached
          </span>
        </div>
      </div>
    </div>
  );
};

