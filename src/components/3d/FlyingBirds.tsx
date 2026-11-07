import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

interface FlyingBirdsProps {
  // Entrance progress (0-1). Birds belong to Screen 2 only, so they stay hidden
  // until the entrance has fully dissolved and Screen 2 is revealed.
  scrollProgress: number;
}

export const FlyingBirds: React.FC<FlyingBirdsProps> = ({ scrollProgress }) => {
  const groupRef = useRef<THREE.Group>(null);
  const bird1Ref = useRef<THREE.Group>(null);
  const bird2Ref = useRef<THREE.Group>(null);
  const bird3Ref = useRef<THREE.Group>(null);

  const bird1WingRef = useRef<THREE.Group>(null);
  const bird2WingRef = useRef<THREE.Group>(null);
  const bird3WingRef = useRef<THREE.Group>(null);

  const doveTexture = useTexture('/assets/white_dove_flying.png');

  useMemo(() => {
    doveTexture.colorSpace = THREE.SRGBColorSpace;
    doveTexture.minFilter = THREE.LinearMipmapLinearFilter;
    doveTexture.magFilter = THREE.LinearFilter;
  }, [doveTexture]);

  const doveMat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: doveTexture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }, [doveTexture]);

  // Dove 1 & 2: A loving pair of royal white doves flying together across the midnight sky
  const pairState = useRef({
    x: 4.2,
    baseY: 1.15,
    speed: 0.50,
  });

  // Dove 3: A distant dove soaring in the upper archway sky in the opposite direction
  const bird3State = useRef({
    x: -4.4,
    baseY: 1.72,
    speed: 0.38,
  });

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();

    // Visible only on Screen 2: fade in after the entrance is gone (0.80 -> 0.95)
    const visibility = THREE.MathUtils.clamp((scrollProgress - 0.8) / 0.15, 0, 1);
    doveMat.opacity = visibility;
    if (groupRef.current) groupRef.current.visible = visibility > 0.001;
    if (visibility <= 0.001) return;

    // 1 & 2. ROYAL PAIR OF DOVES (Right to Left across the sky)
    const pair = pairState.current;
    pair.x -= pair.speed * delta;

    // Reset when pair flies fully past left edge (screen half-width is 3.61)
    if (pair.x < -4.8) {
      pair.x = 4.4;
      pair.baseY = 1.05 + Math.random() * 0.30;
    }

    // Lead Dove (Bird 1)
    const b1Cycle = (t + 0.0) % 3.6;
    const b1IsFlapping = b1Cycle < 2.4;
    const b1Strength = b1IsFlapping ? Math.sin((b1Cycle / 2.4) * Math.PI) : 0.0;
    const b1Flap = Math.sin(t * 7.5) * b1Strength;
    const b1WaveY = Math.sin(t * 2.2) * 0.045;

    if (bird1Ref.current) {
      bird1Ref.current.position.set(pair.x, pair.baseY + b1WaveY, 0.06);
      bird1Ref.current.rotation.z = Math.cos(t * 2.2) * 0.07 - 0.04;
      bird1Ref.current.rotation.y = 0; // Faces forward to Left
    }

    if (bird1WingRef.current) {
      const wingScaleY = 0.88 + b1Flap * 0.30;
      bird1WingRef.current.scale.set(1.0, wingScaleY, 1.0);
    }

    // Partner Dove (Bird 2 - flies closely behind and slightly above)
    const b2Cycle = (t + 0.8) % 3.4;
    const b2IsFlapping = b2Cycle < 2.2;
    const b2Strength = b2IsFlapping ? Math.sin((b2Cycle / 2.2) * Math.PI) : 0.0;
    const b2Flap = Math.sin(t * 7.0 + 1.2) * b2Strength;
    const b2WaveY = Math.sin(t * 2.0 + 0.6) * 0.04;

    if (bird2Ref.current) {
      bird2Ref.current.position.set(pair.x + 0.68, pair.baseY + 0.32 + b2WaveY, 0.05);
      bird2Ref.current.rotation.z = Math.cos(t * 2.0 + 0.6) * 0.06 - 0.03;
      bird2Ref.current.rotation.y = 0; // Faces forward to Left
    }

    if (bird2WingRef.current) {
      const wingScaleY = 0.88 + b2Flap * 0.28;
      bird2WingRef.current.scale.set(0.82, 0.82 * wingScaleY, 0.82);
    }

    // 3. DISTANT DOVE (Left to Right across upper sky)
    const b3 = bird3State.current;
    b3.x += b3.speed * delta;

    if (b3.x > 4.6) {
      b3.x = -4.6;
      b3.baseY = 1.60 + Math.random() * 0.25;
    }

    const b3Cycle = (t + 1.5) % 3.8;
    const b3IsFlapping = b3Cycle < 2.0;
    const b3Strength = b3IsFlapping ? Math.sin((b3Cycle / 2.0) * Math.PI) : 0.0;
    const b3Flap = Math.sin(t * 6.5) * b3Strength;
    const b3WaveY = Math.sin(t * 1.8) * 0.035;

    if (bird3Ref.current) {
      bird3Ref.current.position.set(b3.x, b3.baseY + b3WaveY, 0.04);
      bird3Ref.current.rotation.z = -Math.cos(t * 1.8) * 0.05 + 0.03;
      bird3Ref.current.rotation.y = Math.PI; // Faces forward to Right
    }

    if (bird3WingRef.current) {
      const wingScaleY = 0.90 + b3Flap * 0.25;
      bird3WingRef.current.scale.set(0.65, 0.65 * wingScaleY, 0.65);
    }
  });

  return (
    <group ref={groupRef} renderOrder={5} visible={false}>
      {/* Bird 1: Lead White Dove */}
      <group ref={bird1Ref}>
        <group ref={bird1WingRef}>
          <mesh material={doveMat}>
            <planeGeometry args={[0.55, 0.42]} />
          </mesh>
        </group>
      </group>

      {/* Bird 2: Companion White Dove */}
      <group ref={bird2Ref}>
        <group ref={bird2WingRef}>
          <mesh material={doveMat}>
            <planeGeometry args={[0.55, 0.42]} />
          </mesh>
        </group>
      </group>

      {/* Bird 3: Distant Soaring Dove */}
      <group ref={bird3Ref}>
        <group ref={bird3WingRef}>
          <mesh material={doveMat}>
            <planeGeometry args={[0.55, 0.42]} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
