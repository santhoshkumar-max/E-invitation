import React, { useState, useEffect, useRef } from 'react';
import { Scene } from './components/3d/Scene';
import { Preloader } from './components/ui/Preloader';

export const App: React.FC = () => {
  // Screen state:
  // 1: Screen 1 (Palace Entrance - Doors Closed, user scrolls physically to open)
  // 2: Screen 2 (Royal Courtyard Invitation - Doors Open)
  // 3: Screen 3 (Event Details 1)
  // 4: Screen 4 (Event Details 2)
  // 5: Screen 5 (Event Details 3)
  const [screen, setScreen] = useState(1);

  // Screen 1 Entrance Progress: 0.0 (closed) to 1.0 (fully open)
  const [entranceProgress, setEntranceProgress] = useState(0);

  // Audio background music state:
  // Default: NOT muted (sound enabled by default).
  // Plays on load, user can click to mute at any time.
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);
  const hasStartedMusicRef = useRef(false);

  isMutedRef.current = isMuted;

  // Synchronous state refs for instant zero-latency event handling
  const screenRef = useRef(1);
  const entranceProgressRef = useRef(0);
  screenRef.current = screen;
  entranceProgressRef.current = entranceProgress;

  // Gesture transition lock: ensures EXACTLY ONE screen move per scroll gesture
  // Prevents fast scrolls from skipping past screens
  const isTransitioningRef = useRef(false);
  const touchStartYRef = useRef(0);

  // Synchronous play helper
  const startMusicPlayback = () => {
    if (isMutedRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = false;
    audio.volume = 0.85;
    const promise = audio.play();
    if (promise !== undefined) {
      promise
        .then(() => {
          setIsPlaying(true);
          hasStartedMusicRef.current = true;
        })
        .catch((err) => {
          // If unmuted autoplay is deferred by browser, keep playing muted so it's buffered
          console.warn('Autoplay deferred by browser until interaction:', err);
          audio.muted = true;
          audio.play().catch(() => {});
        });
    }
  };

  // 1. PLAY MUSIC ON LOAD (By default NOT muted)
  // Listens on capture phase for ANY user interaction anywhere on the screen
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = false;
    audio.volume = 0.85;

    const tryPlayUnmuted = () => {
      if (isMutedRef.current || hasStartedMusicRef.current) return;
      const el = audioRef.current;
      if (!el) return;

      el.muted = false;
      el.volume = 0.85;
      const playPromise = el.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            hasStartedMusicRef.current = true;
            removeGestureListeners();
          })
          .catch(() => {
            // If browser blocks unmuted playback before interaction,
            // play muted in background so audio is primed
            el.muted = true;
            el.play().catch(() => {});
          });
      }
    };

    // Attempt immediate unmuted autoplay on load
    tryPlayUnmuted();

    // Universal gesture events (desktop click, mobile touch, scroll, keys)
    const gestureEvents = [
      'click',
      'pointerdown',
      'pointerup',
      'mousedown',
      'mouseup',
      'touchstart',
      'touchend',
      'wheel',
      'keydown',
    ];

    const handleUserGesture = () => {
      tryPlayUnmuted();
    };

    const removeGestureListeners = () => {
      gestureEvents.forEach((ev) => {
        window.removeEventListener(ev, handleUserGesture, true);
      });
    };

    gestureEvents.forEach((ev) => {
      window.addEventListener(ev, handleUserGesture, { capture: true, passive: true });
    });

    return () => {
      removeGestureListeners();
    };
  }, []);

  // User mute toggle: by default NOT muted; user can mute/unmute at any time
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted || !isPlaying) {
      // User is turning ON / Unmuting music:
      setIsMuted(false);
      isMutedRef.current = false;
      audio.muted = false;
      audio.volume = 0.85;
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          hasStartedMusicRef.current = true;
        })
        .catch(() => {});
    } else {
      // User is MUTING:
      setIsMuted(true);
      isMutedRef.current = true;
      audio.pause();
      setIsPlaying(false);
    }
  };

  // Controlled screen transition: locks for 800ms so 1 scroll = 1 screen move
  const goToScreen = (newScreen: number) => {
    if (isTransitioningRef.current) return;
    const clamped = Math.max(1, Math.min(newScreen, 5));
    if (clamped === screenRef.current) return;

    // Immediately lock transition so fast scroll momentum CANNOT skip screens
    isTransitioningRef.current = true;
    screenRef.current = clamped;

    if (clamped >= 2) {
      entranceProgressRef.current = 1.0;
      setEntranceProgress(1.0);
    } else {
      entranceProgressRef.current = 0.0;
      setEntranceProgress(0.0);
    }

    setScreen(clamped);

    // 800ms cooldown absorbs the full tail of fast scroll/trackpad momentum
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 800);
  };

  useEffect(() => {
    // Wheel / Trackpad Scroll Handler
    const handleWheel = (e: WheelEvent) => {
      // Ignore tiny noise
      if (Math.abs(e.deltaY) < 2) return;

      // Start music if not started
      if (!hasStartedMusicRef.current && !isMutedRef.current) {
        startMusicPlayback();
      }

      // If mid-transition, discard all residual momentum events
      if (isTransitioningRef.current) return;

      const currentScreen = screenRef.current;
      const p = entranceProgressRef.current;

      // -------------------------------------------------------------
      // SCREEN 1: Approach palace and open doors smoothly
      // -------------------------------------------------------------
      if (currentScreen === 1) {
        if (e.deltaY > 0) {
          // Clamp step size to max 0.15 so fast wheel flicks open smoothly rather than jumping
          const step = Math.min(0.15, e.deltaY * 0.002);
          const nextP = p + step;

          if (nextP >= 0.60) {
            // Arrive firmly on Screen 2!
            screenRef.current = 2;
            entranceProgressRef.current = 1.0;
            setEntranceProgress(1.0);
            setScreen(2);

            // Crucial: 800ms cooldown absorbs ALL remaining momentum from the opening swipe!
            // This GUARANTEES the user stops on Screen 2 and CANNOT overshoot to Screen 4 or 5!
            isTransitioningRef.current = true;
            setTimeout(() => {
              isTransitioningRef.current = false;
            }, 800);
          } else {
            entranceProgressRef.current = nextP;
            setEntranceProgress(nextP);
          }
        } else if (e.deltaY < 0 && p > 0.0) {
          const step = Math.min(0.15, Math.abs(e.deltaY) * 0.002);
          const nextP = Math.max(0.0, p - step);
          entranceProgressRef.current = nextP;
          setEntranceProgress(nextP);
        }
        return;
      }

      // -------------------------------------------------------------
      // SCREEN 2: EXACTLY ONE SCROLL DOWN -> SCREEN 3 (LOCKED)
      // -------------------------------------------------------------
      if (currentScreen === 2) {
        if (e.deltaY > 0) {
          goToScreen(3);
        } else if (e.deltaY < 0) {
          isTransitioningRef.current = true;
          screenRef.current = 1;
          entranceProgressRef.current = 0.55;
          setScreen(1);
          setEntranceProgress(0.55);
          setTimeout(() => {
            isTransitioningRef.current = false;
          }, 600);
        }
        return;
      }

      // -------------------------------------------------------------
      // SCREENS 3, 4, 5: EXACTLY ONE SCROLL PER SCREEN
      // -------------------------------------------------------------
      if (currentScreen >= 3) {
        if (e.deltaY > 0) {
          goToScreen(currentScreen + 1);
        } else if (e.deltaY < 0) {
          goToScreen(currentScreen - 1);
        }
        return;
      }
    };

    // Mobile Touch Gestures
    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
      if (!hasStartedMusicRef.current && !isMutedRef.current) {
        startMusicPlayback();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const diffY = touchStartYRef.current - currentY;
      const currentScreen = screenRef.current;
      const p = entranceProgressRef.current;

      if (!hasStartedMusicRef.current && !isMutedRef.current && Math.abs(diffY) > 4) {
        startMusicPlayback();
      }

      if (isTransitioningRef.current) return;

      // On Screen 1, dragging controls door opening with smooth damping
      if (currentScreen === 1) {
        if (Math.abs(diffY) > 4) {
          const delta = Math.min(0.12, Math.max(-0.12, diffY * 0.003));
          touchStartYRef.current = currentY;
          const nextP = p + delta;
          if (nextP >= 0.60) {
            screenRef.current = 2;
            entranceProgressRef.current = 1.0;
            setEntranceProgress(1.0);
            setScreen(2);
            isTransitioningRef.current = true;
            setTimeout(() => {
              isTransitioningRef.current = false;
            }, 800);
          } else {
            const clampedP = Math.max(0.0, nextP);
            entranceProgressRef.current = clampedP;
            setEntranceProgress(clampedP);
          }
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!hasStartedMusicRef.current && !isMutedRef.current) {
        startMusicPlayback();
      }
      if (isTransitioningRef.current) return;
      const currentScreen = screenRef.current;
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartYRef.current - touchEndY;
      if (Math.abs(diffY) < 25) return;

      if (currentScreen === 2) {
        if (diffY > 0) {
          goToScreen(3);
        } else {
          isTransitioningRef.current = true;
          screenRef.current = 1;
          entranceProgressRef.current = 0.55;
          setScreen(1);
          setEntranceProgress(0.55);
          setTimeout(() => {
            isTransitioningRef.current = false;
          }, 600);
        }
      } else if (currentScreen >= 3) {
        if (diffY > 0) {
          goToScreen(currentScreen + 1);
        } else {
          goToScreen(currentScreen - 1);
        }
      }
    };

    // Keyboard Arrow Keys
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentScreen = screenRef.current;
      const p = entranceProgressRef.current;

      if (!hasStartedMusicRef.current && !isMutedRef.current) {
        startMusicPlayback();
      }

      if (isTransitioningRef.current) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        if (currentScreen === 1) {
          const nextP = p + 0.30;
          if (nextP >= 0.60) {
            screenRef.current = 2;
            entranceProgressRef.current = 1.0;
            setEntranceProgress(1.0);
            setScreen(2);
            isTransitioningRef.current = true;
            setTimeout(() => {
              isTransitioningRef.current = false;
            }, 800);
          } else {
            entranceProgressRef.current = nextP;
            setEntranceProgress(nextP);
          }
        } else {
          goToScreen(currentScreen + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        if (currentScreen === 1) {
          const nextP = Math.max(0.0, p - 0.30);
          entranceProgressRef.current = nextP;
          setEntranceProgress(nextP);
        } else if (currentScreen === 2) {
          screenRef.current = 1;
          entranceProgressRef.current = 0.55;
          setScreen(1);
          setEntranceProgress(0.55);
        } else {
          goToScreen(currentScreen - 1);
        }
      }
    };

    const handleGlobalClick = () => {
      if (!hasStartedMusicRef.current && !isMutedRef.current) {
        startMusicPlayback();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handleGlobalClick, { capture: true });
    window.addEventListener('click', handleGlobalClick, { capture: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handleGlobalClick, true);
      window.removeEventListener('click', handleGlobalClick, true);
    };
  }, []);

  // Deck translation:
  // Screen 1 & Screen 2: 0%
  // Screen 3: -100%
  // Screen 4: -200%
  // Screen 5: -300%
  const deckTranslatePercent = Math.max(0, screen - 2) * 100;

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#0a080c] select-none text-white font-serif">
      {/* Clean asset preloader */}
      <Preloader />

      {/* Background Music Audio Element with MP3/MPEG source fallback */}
      <audio
        ref={audioRef}
        autoPlay
        playsInline
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src="/assets/music.mp3" type="audio/mpeg" />
        <source src="/assets/engement.mpeg" type="audio/mpeg" />
      </audio>

      {/* Floating Royal Music Control Pill (By default NOT muted; user can click to mute) */}
      <button
        onClick={toggleMute}
        aria-label={isMuted ? 'Unmute Music' : 'Mute Music'}
        className="fixed top-4 right-4 sm:top-5 sm:right-6 z-40 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-[#d4af37]/40 hover:border-[#fbbf24] shadow-[0_4px_16px_rgba(0,0,0,0.5)] flex items-center gap-2.5 transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer"
      >
        {isMuted ? (
          <>
            {/* User clicked to Mute: Muted Speaker Icon */}
            <svg
              className="w-3.5 h-3.5 text-white/50 group-hover:text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
            <span className="text-[11px] uppercase tracking-widest font-sans font-medium text-white/50 group-hover:text-white">
              Muted
            </span>
          </>
        ) : isPlaying ? (
          <>
            {/* Unmuted & Actively Playing: Animated Equalizer Wave Bars */}
            <div className="flex items-end gap-[3px] h-3.5">
              <span className="w-[3px] bg-[#fbbf24] rounded-full animate-[musicBar1_1s_ease-in-out_infinite]" />
              <span className="w-[3px] bg-[#fbbf24] rounded-full animate-[musicBar2_0.8s_ease-in-out_infinite]" />
              <span className="w-[3px] bg-[#fbbf24] rounded-full animate-[musicBar3_1.2s_ease-in-out_infinite]" />
            </div>
            <span className="text-[11px] uppercase tracking-widest font-sans font-medium text-[#fbbf24]">
              Music
            </span>
          </>
        ) : (
          <>
            {/* Default Unmuted State: Gold Sound Speaker Icon */}
            <svg
              className="w-3.5 h-3.5 text-[#fbbf24] group-hover:scale-110 transition-transform duration-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
            <span className="text-[11px] uppercase tracking-widest font-sans font-medium text-[#fbbf24]">
              Music
            </span>
          </>
        )}
      </button>

      {/* Discrete Sliding Page Deck */}
      <div
        className="w-full h-full flex flex-col transition-transform duration-600 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          transform: `translateY(-${deckTranslatePercent}%)`,
        }}
      >
        {/* SLIDE 0: Screen 1 (Entrance) & Screen 2 (Courtyard) */}
        <div className="w-full h-full relative overflow-hidden flex-shrink-0">
          <Scene scrollProgress={entranceProgress} />
        </div>

        {/* SLIDE 1: Screen 3 (Full edge-to-edge - ZERO top/bottom extra spaces) */}
        <div className="w-full h-full relative overflow-hidden flex-shrink-0 flex items-center justify-center bg-[#0e0202]">
          <img
            src="/assets/screen3.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-105 pointer-events-none"
          />
          <img
            src="/assets/screen3.png"
            alt="Event 1"
            className="relative z-10 event-card-img pointer-events-none"
          />
        </div>

        {/* SLIDE 2: Screen 4 (Full edge-to-edge - ZERO top/bottom extra spaces) */}
        <div className="w-full h-full relative overflow-hidden flex-shrink-0 flex items-center justify-center bg-[#0e0202]">
          <img
            src="/assets/screen4.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-105 pointer-events-none"
          />
          <img
            src="/assets/screen4.png"
            alt="Event 2"
            className="relative z-10 event-card-img pointer-events-none"
          />
        </div>

        {/* SLIDE 3: Screen 5 (Full edge-to-edge - ZERO top/bottom extra spaces) */}
        <div className="w-full h-full relative overflow-hidden flex-shrink-0 flex items-center justify-center bg-[#0e0202]">
          <img
            src="/assets/screen5.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-105 pointer-events-none"
          />
          <img
            src="/assets/screen5.png"
            alt="Event 3"
            className="relative z-10 event-card-img pointer-events-none"
          />
        </div>
      </div>

      {/* Discreet Luxury Floating Right Dots (No black buttons, clean 6px gold dots) */}
      <div className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-3 pointer-events-auto">
        {[1, 2, 3, 4, 5].map((idx) => {
          const isActive = idx === screen;
          return (
            <button
              key={idx}
              onClick={() => goToScreen(idx)}
              aria-label={`Go to screen ${idx}`}
              className={`p-1 transition-all duration-300 ${
                isActive ? 'scale-125' : 'scale-100 hover:scale-110'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-[#fbbf24] shadow-[0_0_10px_#fbbf24]'
                    : 'bg-white/30 hover:bg-white/60'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default App;
