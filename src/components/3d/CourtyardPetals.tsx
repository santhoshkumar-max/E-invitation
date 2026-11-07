import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export const CourtyardPetals: React.FC = () => {
  const count = 20; // Sparse, non-distracting, elegant
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const petals = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 5.0,
      y: Math.random() * 5.0 - 1.5,
      z: 0.1,
      rotX: Math.random() * Math.PI * 2,
      rotY: Math.random() * Math.PI * 2,
      rotZ: Math.random() * Math.PI * 2,
      speedY: 0.003 + Math.random() * 0.005,
      driftFreq: 1.0 + Math.random() * 1.5,
      driftPhase: Math.random() * Math.PI * 2,
      scale: 0.025 + Math.random() * 0.02,
      rotSpeed: (Math.random() - 0.5) * 0.015,
      color: Math.random() > 0.3 ? '#f472b6' : '#fda4af',
    }));
  }, [count]);

  const petalMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
  }, []);

  useMemo(() => {
    if (!meshRef.current) return;
    petals.forEach((p, i) => {
      meshRef.current?.setColorAt(i, new THREE.Color(p.color));
    });
    if (meshRef.current) meshRef.current.instanceColor!.needsUpdate = true;
  }, [petals]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    petals.forEach((p, i) => {
      // Gentle downward descent
      p.y -= p.speedY;

      // Soft breeze wind drift
      const windX = Math.sin(t * p.driftFreq + p.driftPhase) * 0.004 + 0.001;
      p.x += windX;

      // Tumbling rotation
      p.rotX += p.rotSpeed;
      p.rotZ += p.rotSpeed * 1.3;

      // Reset when reaching marble floor level (Y ~ -2.4)
      if (p.y < -2.4) {
        p.y = 3.6;
        p.x = (Math.random() - 0.5) * 4.5;
      }

      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.rotX, p.rotY, p.rotZ);
      dummy.scale.set(p.scale, p.scale * 1.4, p.scale * 0.2);
      dummy.updateMatrix();

      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, petalMaterial, count]}
    >
      <sphereGeometry args={[1, 6, 6]} />
    </instancedMesh>
  );
};
