import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

interface GrandDoorsProps {
  openProgress: number; // 0 (closed) to 1 (fully open)
}

export const GrandDoors: React.FC<GrandDoorsProps> = ({ openProgress }) => {
  const leftHingeRef = useRef<THREE.Group>(null);
  const rightHingeRef = useRef<THREE.Group>(null);

  // Load textures for doors and normal maps
  const [leftDoorMap, leftDoorNormal, rightDoorMap, rightDoorNormal] = useTexture([
    '/assets/door_left.jpg',
    '/assets/door_left_normal.jpg',
    '/assets/door_right.jpg',
    '/assets/door_right_normal.jpg',
  ]);

  // Texture settings
  useMemo(() => {
    [leftDoorMap, rightDoorMap].forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
    });
    [leftDoorNormal, rightDoorNormal].forEach((tex) => {
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
    });
  }, [leftDoorMap, rightDoorMap, leftDoorNormal, rightDoorNormal]);

  // Door dimensions
  const doorWidth = 1.7;    // Width of each leaf
  const doorHeight = 4.8;   // Height of the grand door
  const doorDepth = 0.12;   // Physical 3D thickness of the teak wood
  const maxOpenAngle = Math.PI * 0.58; // ~105 degrees swing inward

  // Materials for the 6 faces of the door box:
  // [right, left, top, bottom, front, back]
  const woodMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#32190c'),
      roughness: 0.6,
      metalness: 0.1,
    });
  }, []);

  const brassMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#e0b034'),
      roughness: 0.25,
      metalness: 0.9,
    });
  }, []);

  const leftDoorMaterials = useMemo(() => {
    const frontMat = new THREE.MeshStandardMaterial({
      map: leftDoorMap,
      normalMap: leftDoorNormal,
      normalScale: new THREE.Vector2(1.2, 1.2),
      roughness: 0.4,
      metalness: 0.15,
    });
    return [
      woodMaterial, // right face (inner seam)
      woodMaterial, // left face (hinge side)
      woodMaterial, // top
      woodMaterial, // bottom
      frontMat,     // front face (carved elevation)
      woodMaterial, // back face
    ];
  }, [leftDoorMap, leftDoorNormal, woodMaterial]);

  const rightDoorMaterials = useMemo(() => {
    const frontMat = new THREE.MeshStandardMaterial({
      map: rightDoorMap,
      normalMap: rightDoorNormal,
      normalScale: new THREE.Vector2(1.2, 1.2),
      roughness: 0.4,
      metalness: 0.15,
    });
    return [
      woodMaterial, // right face (hinge side)
      woodMaterial, // left face (inner seam)
      woodMaterial, // top
      woodMaterial, // bottom
      frontMat,     // front face (carved elevation)
      woodMaterial, // back face
    ];
  }, [rightDoorMap, rightDoorNormal, woodMaterial]);

  // Smooth frame interpolation (prevents mechanical jitter)
  const currentAngleRef = useRef(0);

  useFrame((_, delta) => {
    const targetAngle = openProgress * maxOpenAngle;
    // Smooth damp towards target angle
    currentAngleRef.current = THREE.MathUtils.damp(
      currentAngleRef.current,
      targetAngle,
      8,
      delta
    );

    if (leftHingeRef.current) {
      // Swings inward towards the interior (negative rotation around Y)
      leftHingeRef.current.rotation.y = -currentAngleRef.current;
    }
    if (rightHingeRef.current) {
      // Swings inward towards the interior (positive rotation around Y)
      rightHingeRef.current.rotation.y = currentAngleRef.current;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* LEFT DOOR HINGE ASSEMBLY */}
      {/* Hinge anchor positioned at X = -doorWidth, Y = doorHeight/2, Z = 0 */}
      <group ref={leftHingeRef} position={[-doorWidth, doorHeight / 2, 0]}>
        {/* Door leaf mesh: centered at X = +doorWidth/2 relative to hinge */}
        <mesh
          position={[doorWidth / 2, 0, 0]}
          material={leftDoorMaterials}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[doorWidth, doorHeight, doorDepth]} />
        </mesh>

        {/* 3D Brass Ring Knocker & Plate (Left) */}
        <group position={[doorWidth * 0.8, -0.2, doorDepth / 2 + 0.02]}>
          <mesh material={brassMaterial} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.015, 24]} />
          </mesh>
          <mesh position={[0, -0.06, 0.02]} material={brassMaterial} castShadow>
            <torusGeometry args={[0.06, 0.015, 16, 32]} />
          </mesh>
        </group>

        {/* Decorative Brass Studs on Left Door */}
        {[-1.6, -0.8, 0.4, 1.2, 1.8].map((y, i) => (
          <group key={`stud-l-${i}`}>
            <mesh position={[doorWidth * 0.15, y, doorDepth / 2 + 0.01]} material={brassMaterial}>
              <sphereGeometry args={[0.02, 12, 12]} />
            </mesh>
            <mesh position={[doorWidth * 0.85, y, doorDepth / 2 + 0.01]} material={brassMaterial}>
              <sphereGeometry args={[0.02, 12, 12]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* RIGHT DOOR HINGE ASSEMBLY */}
      {/* Hinge anchor positioned at X = +doorWidth, Y = doorHeight/2, Z = 0 */}
      <group ref={rightHingeRef} position={[doorWidth, doorHeight / 2, 0]}>
        {/* Door leaf mesh: centered at X = -doorWidth/2 relative to hinge */}
        <mesh
          position={[-doorWidth / 2, 0, 0]}
          material={rightDoorMaterials}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[doorWidth, doorHeight, doorDepth]} />
        </mesh>

        {/* 3D Brass Ring Knocker & Plate (Right) */}
        <group position={[-doorWidth * 0.8, -0.2, doorDepth / 2 + 0.02]}>
          <mesh material={brassMaterial} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.015, 24]} />
          </mesh>
          <mesh position={[0, -0.06, 0.02]} material={brassMaterial} castShadow>
            <torusGeometry args={[0.06, 0.015, 16, 32]} />
          </mesh>
        </group>

        {/* Decorative Brass Studs on Right Door */}
        {[-1.6, -0.8, 0.4, 1.2, 1.8].map((y, i) => (
          <group key={`stud-r-${i}`}>
            <mesh position={[-doorWidth * 0.15, y, doorDepth / 2 + 0.01]} material={brassMaterial}>
              <sphereGeometry args={[0.02, 12, 12]} />
            </mesh>
            <mesh position={[-doorWidth * 0.85, y, doorDepth / 2 + 0.01]} material={brassMaterial}>
              <sphereGeometry args={[0.02, 12, 12]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Solid Granite Threshold Base (Madi / Padi) under the doors */}
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <boxGeometry args={[doorWidth * 2 + 0.4, 0.16, doorDepth * 2.5]} />
        <meshStandardMaterial color="#1a1512" roughness={0.8} metalness={0.1} />
      </mesh>
    </group>
  );
};

