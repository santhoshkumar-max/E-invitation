import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

export const Peacock: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  // Load high-resolution isolated peacock texture
  const texture = useTexture('/assets/peacock_walk.png');

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
  }, [texture]);

  // Motion state
  const posXRef = useRef(2.7); // Starts on right side (+2.7)
  const walkPhaseRef = useRef(0);
  const opacityRef = useRef(1.0);

  // Dimensions of peacock plane: matching reference image proportions
  const width = 2.10;
  const height = 1.18;

  // Material with dynamic opacity for seamless looping
  const peacockMat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }, [texture]);

  useFrame((_, delta) => {
    const walkSpeed = 0.30; // Meters per second across the marble terrace
    const cadence = 5.5;    // Footstep cycle frequency

    // 1. Horizontal walk progress (Right to Left: +2.7 -> -2.7)
    posXRef.current -= walkSpeed * delta;
    walkPhaseRef.current += cadence * delta;

    // Handle seamless looping at left boundary
    if (posXRef.current < -2.9) {
      opacityRef.current = Math.max(0, opacityRef.current - delta * 3);
      if (opacityRef.current <= 0.02) {
        posXRef.current = 2.9; // Reset to right side
        walkPhaseRef.current = 0;
      }
    } else if (posXRef.current > 2.5) {
      opacityRef.current = Math.min(1.0, opacityRef.current + delta * 2.5);
    } else {
      opacityRef.current = Math.min(1.0, opacityRef.current + delta * 4);
    }

    peacockMat.opacity = opacityRef.current;

    // 2. Natural Avian Walking Cadence Physics
    const p = walkPhaseRef.current;
    // Body vertical bobbing with each step
    const bobY = Math.abs(Math.sin(p)) * 0.028;
    // Body forward/back pitch sway with strides
    const swayZ = Math.sin(p) * 0.018;
    // Avian head bob: natural forward step projection
    const headBobX = Math.sin(p * 2) * 0.015;

    if (groupRef.current) {
      groupRef.current.position.x = posXRef.current + headBobX;
      groupRef.current.position.y = -1.21 + bobY;
      groupRef.current.position.z = 0.05;
    }

    if (bodyRef.current) {
      bodyRef.current.rotation.z = swayZ;
      bodyRef.current.rotation.x = Math.cos(p) * 0.010;
    }
  });

  return (
    <group ref={groupRef} position={[2.7, -1.21, 0.05]}>
      <group ref={bodyRef}>
        <mesh material={peacockMat}>
          <planeGeometry args={[width, height]} />
        </mesh>
      </group>

      {/* Subtle marble reflection shadow on the ground terrace */}
      <mesh
        position={[0.15, -height / 2 + 0.02, -0.01]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[width * 0.75, 0.28]} />
        <meshBasicMaterial
          color="#0d0906"
          transparent
          opacity={0.32}
        />
      </mesh>
    </group>
  );
};
