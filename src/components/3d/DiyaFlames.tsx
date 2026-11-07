import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export const DiyaFlames: React.FC = () => {
  const lightLeftRef = useRef<THREE.PointLight>(null);
  const lightRightRef = useRef<THREE.PointLight>(null);
  const uruliLeftRef = useRef<THREE.PointLight>(null);
  const uruliRightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Natural multi-octave organic flicker for standing deepams
    const flicker1 = 1.0 + Math.sin(t * 12.3) * 0.12 + Math.cos(t * 22.7) * 0.08 + Math.sin(t * 37.1) * 0.05;
    const flicker2 = 1.0 + Math.sin(t * 11.1 + 1.2) * 0.12 + Math.cos(t * 25.3) * 0.08 + Math.sin(t * 31.7) * 0.05;

    // Soft flicker for floating uruli candles
    const flickerUruli1 = 1.0 + Math.sin(t * 8.5 + 0.5) * 0.1 + Math.cos(t * 17.2) * 0.06;
    const flickerUruli2 = 1.0 + Math.sin(t * 9.1 + 2.1) * 0.1 + Math.cos(t * 16.4) * 0.06;

    if (lightLeftRef.current) {
      lightLeftRef.current.intensity = 7.0 * flicker1;
    }
    if (lightRightRef.current) {
      lightRightRef.current.intensity = 7.0 * flicker2;
    }
    if (uruliLeftRef.current) {
      uruliLeftRef.current.intensity = 4.5 * flickerUruli1;
    }
    if (uruliRightRef.current) {
      uruliRightRef.current.intensity = 4.5 * flickerUruli2;
    }
  });

  return (
    <group position={[0, 0, 0.06]}>
      {/* 1. Left Standing Lamp (Kuthu Vilakku) Flame Light */}
      <pointLight
        ref={lightLeftRef}
        position={[-2.69, -1.39, 0.1]}
        color="#ffa333"
        distance={4.0}
        decay={2}
      />

      {/* 2. Right Standing Lamp (Kuthu Vilakku) Flame Light */}
      <pointLight
        ref={lightRightRef}
        position={[2.69, -1.39, 0.1]}
        color="#ffa333"
        distance={4.0}
        decay={2}
      />

      {/* 3. Left Uruli Floating Candle Light (Corner uruli bowl) */}
      <pointLight
        ref={uruliLeftRef}
        position={[-3.27, -3.82, 0.15]}
        color="#ffaa3b"
        distance={3.0}
        decay={2}
      />

      {/* 4. Right Uruli Floating Candle Light (Corner uruli bowl) */}
      <pointLight
        ref={uruliRightRef}
        position={[3.27, -3.82, 0.15]}
        color="#ffaa3b"
        distance={3.0}
        decay={2}
      />
    </group>
  );
};
