import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface InteriorGlowProps {
  openProgress: number;
}

export const InteriorGlow: React.FC<InteriorGlowProps> = ({ openProgress }) => {
  const haloRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (haloRef.current) {
      // Gentle pulsing of interior divine light
      const scale = 1 + Math.sin(elapsed * 2) * 0.04;
      haloRef.current.scale.set(scale, scale, 1);
    }
    if (lightRef.current) {
      // Light grows in intensity as the doors swing open
      lightRef.current.intensity = 15 + openProgress * 45 + Math.sin(elapsed * 4) * 3;
    }
  });

  return (
    <group position={[0, 2.4, -1.2]}>
      {/* Warm Golden Point Light flooding through the open doorway */}
      <pointLight
        ref={lightRef}
        color="#ffcc66"
        intensity={20}
        distance={10}
        decay={1.8}
      />

      {/* Radiant Golden Glow Disc / Portal plane */}
      <mesh ref={haloRef} position={[0, 0, -0.2]}>
        <planeGeometry args={[4.2, 5.4]} />
        <meshBasicMaterial
          color="#ffc857"
          transparent
          opacity={0.35 + openProgress * 0.55}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Interior Floor Extension with warm golden light spill */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2.4, -2.5]}
        receiveShadow
      >
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial
          color="#52230a"
          roughness={0.2}
          metalness={0.3}
          emissive="#ff9922"
          emissiveIntensity={0.2 + openProgress * 0.4}
        />
      </mesh>
    </group>
  );
};

