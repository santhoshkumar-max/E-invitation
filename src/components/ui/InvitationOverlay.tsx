import React from 'react';

interface InvitationOverlayProps {
  scrollProgress: number;
}

export const InvitationOverlay: React.FC<InvitationOverlayProps> = ({ scrollProgress }) => {
  // Only show navigation indicators once inside the palace courtyard (scrollProgress >= 0.18)
  if (scrollProgress < 0.18) {
    return null;
  }

  // Determine active screen index (0: Screen 2, 1: Screen 3, 2: Screen 4, 3: Screen 5)
  let activeIndex = 0;
  if (scrollProgress >= 0.78) {
    activeIndex = 3;
  } else if (scrollProgress >= 0.58) {
    activeIndex = 2;
  } else if (scrollProgress >= 0.38) {
    activeIndex = 1;
  }

  const screenScrollTargets = [0.26, 0.48, 0.68, 0.90];

  const handleDotClick = (index: number) => {
    const targetProgress = screenScrollTargets[index];
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: targetProgress * maxScroll,
      behavior: 'smooth',
    });
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-6">
      {/* Top spacer */}
      <div />

      {/* Floating Right Page Indicator Dots */}
      <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 pointer-events-auto">
        {[0, 1, 2, 3].map((idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              aria-label={`Scroll to screen ${idx + 2}`}
              className={`group relative flex items-center justify-center transition-all duration-300 ${
                isActive ? 'scale-125' : 'scale-100 hover:scale-110'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-[#fbbf24] shadow-[0_0_10px_#fbbf24] border border-[#fef08a]'
                    : 'bg-white/30 border border-white/20 hover:bg-white/60'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Subtle Scroll Hint on Screen 2 */}
      {activeIndex === 0 && (
        <div className="w-full flex justify-center pb-2 animate-bounce pointer-events-none">
          <div className="px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-amber-400/30 text-amber-200/80 text-xs font-serif tracking-widest uppercase">
            Scroll to view events ↓
          </div>
        </div>
      )}
    </div>
  );
};
