import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export const FloatingPetals: React.FC = () => {
  const count = 120; // Number of floating petals
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Generate random initial positions, velocities, and rotations
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 8,
      y: Math.random() * 5 + 0.5,
      z: Math.random() * 16,
      rotX: Math.random() * Math.PI,
      rotY: Math.random() * Math.PI,
      rotZ: Math.random() * Math.PI,
      speedY: 0.004 + Math.random() * 0.008,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      scale: 0.04 + Math.random() * 0.045,
      color: Math.random() > 0.4 ? '#f59e0b' : '#dc2626', // Marigold orange or crimson rose
    }));
  }, [count]);

  const petalMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      roughness: 0.6,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
  }, []);

  // Set colors on instance
  useMemo(() => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      meshRef.current?.setColorAt(i, new THREE.Color(p.color));
    });
    if (meshRef.current) meshRef.current.instanceColor!.needsUpdate = true;
  }, [particles]);

  useFrame(() => {
    if (!meshRef.current) return;

    particles.forEach((p, i) => {
      // Gently fall downwards
      p.y -= p.speedY;
      // Slight sinusoidal drift
      p.x += Math.sin(p.y * 3 + i) * 0.003;
      // Tumble rotation
      p.rotX += p.rotSpeed;
      p.rotY += p.rotSpeed * 1.2;

      // Wrap around when reaching floor
      if (p.y < 0.05) {
        p.y = 5.0;
        p.x = (Math.random() - 0.5) * 8;
      }

      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.rotX, p.rotY, p.rotZ);
      dummy.scale.set(p.scale, p.scale * 1.5, p.scale * 0.2); // flat petal shape
      dummy.updateMatrix();

      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, petalMaterial, count]}
      castShadow={false}
      receiveShadow={false}
    >
      <sphereGeometry args={[1, 7, 7]} />
    </instancedMesh>
  );
};

