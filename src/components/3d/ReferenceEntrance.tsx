import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

interface ReferenceEntranceProps {
  openProgress: number; // 0 (closed) to 1 (fully open)
  scrollProgress: number;
}

export const ReferenceEntrance: React.FC<ReferenceEntranceProps> = ({
  openProgress,
  scrollProgress,
}) => {
  const leftHingeRef = useRef<THREE.Group>(null);
  const rightHingeRef = useRef<THREE.Group>(null);
  const currentAngleRef = useRef(0);

  // Load exact daytime textures matching Screen 2's golden daylight
  const [frameMap, leftDoorMap, rightDoorMap] = useTexture([
    '/assets/entrance_frame.png?v=day',
    '/assets/ref_door_left.png?v=day',
    '/assets/ref_door_right.png?v=day',
  ]);

  useMemo(() => {
    [frameMap, leftDoorMap, rightDoorMap].forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
    });
  }, [frameMap, leftDoorMap, rightDoorMap]);

  // Entrance plane dimensions centered symmetrically at (0, 0, 0)
  const planeHeight = 10.0;
  const planeWidth = (1024 / 1536) * planeHeight; // 6.666667

  // Door metrics in world space relative to plane center (0, 0, 0)
  const doorWidth = (216 / 1536) * planeHeight; // 1.40625
  const doorHeight = (300 / 1536) * planeHeight; // 1.953125
  const leafWidth = doorWidth / 2; // 0.703125
  const doorDepth = 0.045; // 4.5cm realistic door thickness
  const maxSwingAngle = Math.PI * 0.54; // ~97 degrees inward

  // Door center coordinates relative to plane center
  const doorCenterX = ((511 - 512) / 1024) * planeWidth; // -0.00651
  const doorCenterY = ((748 - 768) / 1536) * planeHeight; // -0.13021 (748px from bottom)

  // Hinge positions (outer edges of the door leaves)
  const leftHingeX = doorCenterX - leafWidth; // -0.709635
  const rightHingeX = doorCenterX + leafWidth; // +0.696615

  // Warm teakwood material for door thickness edges
  const woodEdgeMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color('#381b0a'),
    });
  }, []);

  // Screen 1 Opacity:
  // - Fully opaque (1.0) while approaching and as doors open (scrollProgress <= 0.55)
  // - As the user steps through the doorway (0.55 -> 0.75), Screen 1 smoothly dissolves (1.0 -> 0.0)
  // - Completely unmounted when scrollProgress >= 0.75
  // - Smoothly fades back in on reverse scroll
  const entranceOpacity = useMemo(() => {
    if (scrollProgress <= 0.55) return 1.0;
    if (scrollProgress >= 0.75) return 0.0;
    return 1.0 - (scrollProgress - 0.55) / 0.20;
  }, [scrollProgress]);

  const frameMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: frameMap,
      transparent: true,
      side: THREE.DoubleSide,
      opacity: entranceOpacity,
    });
  }, [frameMap, entranceOpacity]);

  // Both FRONT and BACK faces of the doors are textured with the carved teakwood
  const leftDoorMaterials = useMemo(() => {
    const doorFaceMat = new THREE.MeshBasicMaterial({
      map: leftDoorMap,
      transparent: true,
      opacity: entranceOpacity,
      side: THREE.DoubleSide,
    });
    return [
      woodEdgeMaterial, // +X (inner seam edge)
      woodEdgeMaterial, // -X (hinge edge)
      woodEdgeMaterial, // +Y (top edge)
      woodEdgeMaterial, // -Y (bottom edge)
      doorFaceMat,      // +Z (front face)
      doorFaceMat,      // -Z (back face)
    ];
  }, [leftDoorMap, woodEdgeMaterial, entranceOpacity]);

  const rightDoorMaterials = useMemo(() => {
    const doorFaceMat = new THREE.MeshBasicMaterial({
      map: rightDoorMap,
      transparent: true,
      opacity: entranceOpacity,
      side: THREE.DoubleSide,
    });
    return [
      woodEdgeMaterial, // +X (hinge edge)
      woodEdgeMaterial, // -X (inner seam edge)
      woodEdgeMaterial, // +Y (top edge)
      woodEdgeMaterial, // -Y (bottom edge)
      doorFaceMat,      // +Z (front face)
      doorFaceMat,      // -Z (back face)
    ];
  }, [rightDoorMap, woodEdgeMaterial, entranceOpacity]);

  // Door opening hinge rotation physics (bi-directional):
  // Left door swings INWARD into -Z: POSITIVE angle
  // Right door swings INWARD into -Z: NEGATIVE angle
  useFrame((_, delta) => {
    const targetAngle = openProgress * maxSwingAngle;
    currentAngleRef.current = THREE.MathUtils.damp(
      currentAngleRef.current,
      targetAngle,
      7,
      delta
    );

    if (leftHingeRef.current) {
      // Swings inward into negative Z (into palace interior)
      leftHingeRef.current.rotation.y = currentAngleRef.current;
    }
    if (rightHingeRef.current) {
      // Swings inward into negative Z (into palace interior)
      rightHingeRef.current.rotation.y = -currentAngleRef.current;
    }
  });

  if (entranceOpacity <= 0.001) return null;

  return (
    <group position={[0, 0, 0]}>
      {/* Main Entrance Colonnade & Aperture Frame Centered at (0, 0, 0) */}
      <mesh position={[0, 0, 0]} material={frameMaterial}>
        <planeGeometry args={[planeWidth, planeHeight]} />
      </mesh>

      {/* Doorway jamb depth surfaces (wall thickness) */}
      <mesh
        position={[leftHingeX, doorCenterY, -doorDepth / 2]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[doorDepth * 2, doorHeight]} />
        <meshBasicMaterial color="#381b0a" transparent opacity={entranceOpacity} />
      </mesh>
      <mesh
        position={[rightHingeX, doorCenterY, -doorDepth / 2]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[doorDepth * 2, doorHeight]} />
        <meshBasicMaterial color="#381b0a" transparent opacity={entranceOpacity} />
      </mesh>
      <mesh
        position={[doorCenterX, doorCenterY + doorHeight / 2, -doorDepth / 2]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[doorWidth, doorDepth * 2]} />
        <meshBasicMaterial color="#381b0a" transparent opacity={entranceOpacity} />
      </mesh>
      <mesh
        position={[doorCenterX, doorCenterY - doorHeight / 2, -doorDepth / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[doorWidth, doorDepth * 2]} />
        <meshBasicMaterial color="#2a1407" transparent opacity={entranceOpacity} />
      </mesh>

      {/* Left Door Leaf (Carved teakwood swinging INWARD into palace) */}
      <group ref={leftHingeRef} position={[leftHingeX, doorCenterY, 0]}>
        <mesh
          position={[leafWidth / 2, 0, -doorDepth / 2]}
          material={leftDoorMaterials}
        >
          <boxGeometry args={[leafWidth, doorHeight, doorDepth]} />
        </mesh>
      </group>

      {/* Right Door Leaf (Carved teakwood swinging INWARD into palace) */}
      <group ref={rightHingeRef} position={[rightHingeX, doorCenterY, 0]}>
        <mesh
          position={[-leafWidth / 2, 0, -doorDepth / 2]}
          material={rightDoorMaterials}
        >
          <boxGeometry args={[leafWidth, doorHeight, doorDepth]} />
        </mesh>
      </group>
    </group>
  );
};
