import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export const SwayingGarlands: React.FC = () => {
  const leftGarlandRef = useRef<THREE.Group>(null);
  const rightGarlandRef = useRef<THREE.Group>(null);

  const jasmineMat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color('#fff9eb'),
      transparent: true,
      opacity: 0.92,
    });
  }, []);

  const marigoldRedMat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color('#be123c'),
      transparent: true,
      opacity: 0.92,
    });
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Gentle breeze passing through from left to right
    const wind = Math.sin(t * 1.35) * 0.024;
    const windRight = Math.sin(t * 1.25 + 0.8) * 0.021;

    if (leftGarlandRef.current) {
      leftGarlandRef.current.rotation.z = wind;
      leftGarlandRef.current.rotation.x = Math.cos(t * 1.0) * 0.01;
    }

    if (rightGarlandRef.current) {
      rightGarlandRef.current.rotation.z = windRight;
      rightGarlandRef.current.rotation.x = Math.cos(t * 0.95 + 1.1) * 0.01;
    }
  });

  return (
    <group position={[0, 0, 0.07]}>
      {/* Left Hanging Garland Strand (anchored at ceiling Y = +3.96) */}
      <group ref={leftGarlandRef} position={[-2.55, 3.96, 0]}>
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh
            key={`left-flw-${i}`}
            position={[0, -i * 0.22 - 0.1, 0]}
            material={i % 3 === 2 ? marigoldRedMat : jasmineMat}
          >
            <sphereGeometry args={[0.065, 8, 8]} />
          </mesh>
        ))}
      </group>

      {/* Right Hanging Garland Strand (anchored at ceiling Y = +3.96) */}
      <group ref={rightGarlandRef} position={[2.55, 3.96, 0]}>
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh
            key={`right-flw-${i}`}
            position={[0, -i * 0.22 - 0.1, 0]}
            material={i % 3 === 2 ? marigoldRedMat : jasmineMat}
          >
            <sphereGeometry args={[0.065, 8, 8]} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
