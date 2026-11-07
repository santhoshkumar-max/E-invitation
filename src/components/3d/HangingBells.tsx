import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

export const HangingBells: React.FC = () => {
  const leftBellPivotRef = useRef<THREE.Group>(null);
  const rightBellPivotRef = useRef<THREE.Group>(null);

  const bellTexture = useTexture('/assets/brass_temple_bell.png');

  useMemo(() => {
    bellTexture.colorSpace = THREE.SRGBColorSpace;
    bellTexture.minFilter = THREE.LinearMipmapLinearFilter;
    bellTexture.magFilter = THREE.LinearFilter;
    bellTexture.generateMipmaps = true;
  }, [bellTexture]);

  const bellMat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: bellTexture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }, [bellTexture]);

  // Scaled dimensions of bell plane matching cropped composition
  const bellWidth = 0.74;
  const bellHeight = 1.12;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Left bell gentle harmonic pendulum swing
    if (leftBellPivotRef.current) {
      leftBellPivotRef.current.rotation.z = Math.sin(t * 1.6) * 0.046;
      leftBellPivotRef.current.rotation.x = Math.cos(t * 1.2) * 0.015;
    }

    // Right bell gentle harmonic pendulum swing (offset phase and frequency)
    if (rightBellPivotRef.current) {
      rightBellPivotRef.current.rotation.z = Math.sin(t * 1.38 + 1.4) * 0.042;
      rightBellPivotRef.current.rotation.x = Math.cos(t * 1.05 + 0.9) * 0.013;
    }
  });

  return (
    <group position={[0, 0, 0.08]}>
      {/* LEFT BELL ASSEMBLY */}
      {/* Hanging hook anchor on floral archway chain (X = -2.55, Y = +2.57) */}
      <group
        ref={leftBellPivotRef}
        position={[-2.55, 2.57, 0]}
      >
        <mesh
          position={[0, -bellHeight / 2, 0]}
          material={bellMat}
        >
          <planeGeometry args={[bellWidth, bellHeight]} />
        </mesh>
      </group>

      {/* RIGHT BELL ASSEMBLY */}
      {/* Hanging hook anchor on floral archway chain (X = +2.55, Y = +2.57) */}
      <group
        ref={rightBellPivotRef}
        position={[2.55, 2.57, 0]}
      >
        <mesh
          position={[0, -bellHeight / 2, 0]}
          material={bellMat}
        >
          <planeGeometry args={[bellWidth, bellHeight]} />
        </mesh>
      </group>
    </group>
  );
};
