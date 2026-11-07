import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

export const EntranceFacade: React.FC = () => {
  // Load textures
  const [facadeMap, facadeNormal, tilesMap, tilesNormal] = useTexture([
    '/assets/chettinad_archway_facade.jpg',
    '/assets/facade_normal.jpg',
    '/assets/athangudi_courtyard_tiles.jpg',
    '/assets/athangudi_tiles_normal.jpg',
  ]);

  useMemo(() => {
    facadeMap.colorSpace = THREE.SRGBColorSpace;
    tilesMap.colorSpace = THREE.SRGBColorSpace;

    // Tile repetition for the grand promenade
    tilesMap.wrapS = THREE.RepeatWrapping;
    tilesMap.wrapT = THREE.RepeatWrapping;
    tilesMap.repeat.set(4, 12);

    tilesNormal.wrapS = THREE.RepeatWrapping;
    tilesNormal.wrapT = THREE.RepeatWrapping;
    tilesNormal.repeat.set(4, 12);
  }, [facadeMap, tilesMap, tilesNormal]);

  // Materials
  const pillarWoodMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#422212'),
      roughness: 0.5,
      metalness: 0.15,
    });
  }, []);

  const stoneGraniteMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#241f1c'),
      roughness: 0.85,
      metalness: 0.05,
    });
  }, []);

  const brassMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#e5b63b'),
      roughness: 0.22,
      metalness: 0.92,
    });
  }, []);

  const redCarpetMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#780d19'),
      roughness: 0.9,
      metalness: 0.05,
    });
  }, []);

  const goldTrimMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#dfa929'),
      roughness: 0.3,
      metalness: 0.8,
    });
  }, []);

  const marigoldOrangeMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f06a00'),
      roughness: 0.8,
    });
  }, []);

  const marigoldYellowMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#f5be0b'),
      roughness: 0.8,
    });
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. ATHANGUDI TILED COURTYARD GROUND */}
      {/* Extends from Z = -2 to Z = 20 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 8]}
        receiveShadow
      >
        <planeGeometry args={[14, 24]} />
        <meshStandardMaterial
          map={tilesMap}
          normalMap={tilesNormal}
          normalScale={new THREE.Vector2(0.8, 0.8)}
          roughness={0.35}
          metalness={0.1}
        />
      </mesh>

      {/* 2. ROYAL RED AISLE RUNNER / CARPET */}
      <group position={[0, 0.005, 8]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={redCarpetMat}>
          <planeGeometry args={[2.4, 22]} />
        </mesh>
        {/* Left gold border */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[-1.2, 0.002, 0]}
          receiveShadow
          material={goldTrimMat}
        >
          <planeGeometry args={[0.08, 22]} />
        </mesh>
        {/* Right gold border */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[1.2, 0.002, 0]}
          receiveShadow
          material={goldTrimMat}
        >
          <planeGeometry args={[0.08, 22]} />
        </mesh>
      </group>

      {/* 3. GRAND ENTRANCE PORTAL & ARCHWAY WALL */}
      {/* Main architectural facade backdrop */}
      <mesh position={[0, 4.4, -0.15]} receiveShadow castShadow>
        <planeGeometry args={[12, 9]} />
        <meshStandardMaterial
          map={facadeMap}
          normalMap={facadeNormal}
          normalScale={new THREE.Vector2(0.9, 0.9)}
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>

      {/* Heavy carved Burma Teak lintel beam above the double doors */}
      <mesh position={[0, 4.95, 0.1]} castShadow receiveShadow material={pillarWoodMat}>
        <boxGeometry args={[4.4, 0.45, 0.4]} />
      </mesh>
      {/* Golden decorative plate on lintel */}
      <mesh position={[0, 4.95, 0.31]} castShadow material={brassMat}>
        <boxGeometry args={[2.0, 0.22, 0.04]} />
      </mesh>

      {/* Left and Right Archway jambs / door frame jambs */}
      <mesh position={[-1.85, 2.4, 0.05]} castShadow receiveShadow material={pillarWoodMat}>
        <boxGeometry args={[0.3, 4.9, 0.35]} />
      </mesh>
      <mesh position={[1.85, 2.4, 0.05]} castShadow receiveShadow material={pillarWoodMat}>
        <boxGeometry args={[0.3, 4.9, 0.35]} />
      </mesh>

      {/* 4. CHETTINAD COLUMNS / PILLARS ALONG THE WALKWAY */}
      {/* 3 pairs of majestic Chettinad carved teak pillars flanking the walkway */}
      {[2.2, 5.5, 9.0].map((zPos, idx) => (
        <group key={`pillar-row-${idx}`}>
          {/* Left Pillar */}
          <group position={[-2.4, 0, zPos]}>
            {/* Square Stone Base Plinth */}
            <mesh position={[0, 0.25, 0]} castShadow receiveShadow material={stoneGraniteMat}>
              <boxGeometry args={[0.7, 0.5, 0.7]} />
            </mesh>
            {/* Fluted Wooden Shaft */}
            <mesh position={[0, 2.2, 0]} castShadow material={pillarWoodMat}>
              <cylinderGeometry args={[0.22, 0.26, 3.4, 20]} />
            </mesh>
            {/* Brass decorative rings around pillar */}
            <mesh position={[0, 1.2, 0]} material={brassMat}>
              <torusGeometry args={[0.26, 0.02, 16, 32]} />
            </mesh>
            <mesh position={[0, 3.2, 0]} material={brassMat}>
              <torusGeometry args={[0.24, 0.02, 16, 32]} />
            </mesh>
            {/* Traditional Bodigai (Carved Capital Bracket) */}
            <mesh position={[0, 4.0, 0]} castShadow material={pillarWoodMat}>
              <boxGeometry args={[0.65, 0.25, 0.65]} />
            </mesh>
          </group>

          {/* Right Pillar */}
          <group position={[2.4, 0, zPos]}>
            {/* Square Stone Base Plinth */}
            <mesh position={[0, 0.25, 0]} castShadow receiveShadow material={stoneGraniteMat}>
              <boxGeometry args={[0.7, 0.5, 0.7]} />
            </mesh>
            {/* Fluted Wooden Shaft */}
            <mesh position={[0, 2.2, 0]} castShadow material={pillarWoodMat}>
              <cylinderGeometry args={[0.22, 0.26, 3.4, 20]} />
            </mesh>
            {/* Brass decorative rings around pillar */}
            <mesh position={[0, 1.2, 0]} material={brassMat}>
              <torusGeometry args={[0.26, 0.02, 16, 32]} />
            </mesh>
            <mesh position={[0, 3.2, 0]} material={brassMat}>
              <torusGeometry args={[0.24, 0.02, 16, 32]} />
            </mesh>
            {/* Traditional Bodigai (Carved Capital Bracket) */}
            <mesh position={[0, 4.0, 0]} castShadow material={pillarWoodMat}>
              <boxGeometry args={[0.65, 0.25, 0.65]} />
            </mesh>
          </group>
        </group>
      ))}

      {/* 5. OVERHEAD CEILING BEAMS (Chettinad Wooden Ceiling rafters) */}
      {[2.2, 5.5, 9.0].map((zPos, idx) => (
        <mesh key={`cross-beam-${idx}`} position={[0, 4.2, zPos]} castShadow material={pillarWoodMat}>
          <boxGeometry args={[5.5, 0.28, 0.35]} />
        </mesh>
      ))}
      {/* Longitudinal roof beams */}
      <mesh position={[-2.4, 4.35, 5.6]} castShadow material={pillarWoodMat}>
        <boxGeometry args={[0.3, 0.25, 7.8]} />
      </mesh>
      <mesh position={[2.4, 4.35, 5.6]} castShadow material={pillarWoodMat}>
        <boxGeometry args={[0.3, 0.25, 7.8]} />
      </mesh>

      {/* 6. FESTIVE MARIGOLD GARLANDS (Toran) */}
      {/* Archway drape */}
      <group position={[0, 4.65, 0.2]}>
        {Array.from({ length: 18 }).map((_, i) => {
          const t = (i / 17) * 2 - 1; // -1 to 1
          const x = t * 1.9;
          const y = -Math.pow(t, 2) * 0.45; // catenary arc
          return (
            <mesh
              key={`garland-arch-${i}`}
              position={[x, y, 0]}
              material={i % 2 === 0 ? marigoldOrangeMat : marigoldYellowMat}
            >
              <sphereGeometry args={[0.07, 10, 10]} />
            </mesh>
          );
        })}
      </group>

      {/* Pillar entrance festoon (Front pillars at Z = 2.2) */}
      <group position={[0, 3.9, 2.2]}>
        {Array.from({ length: 22 }).map((_, i) => {
          const t = (i / 21) * 2 - 1;
          const x = t * 2.2;
          const y = -Math.pow(t, 2) * 0.55;
          return (
            <mesh
              key={`garland-front-${i}`}
              position={[x, y, 0]}
              material={i % 2 === 0 ? marigoldYellowMat : marigoldOrangeMat}
            >
              <sphereGeometry args={[0.07, 10, 10]} />
            </mesh>
          );
        })}
      </group>

      {/* 7. TRADITIONAL BRASS KUTHU VILAKKU (Standing Oil Lamps) */}
      {/* Placed prominently at the base of the entrance */}
      {[-1.6, 1.6].map((xPos, idx) => (
        <group key={`vilakku-${idx}`} position={[xPos, 0, 0.7]}>
          {/* Circular stepped base plate (Peedam) */}
          <mesh position={[0, 0.05, 0]} material={brassMat} castShadow>
            <cylinderGeometry args={[0.26, 0.32, 0.1, 24]} />
          </mesh>
          {/* Central Stem */}
          <mesh position={[0, 0.55, 0]} material={brassMat} castShadow>
            <cylinderGeometry args={[0.04, 0.06, 0.9, 20]} />
          </mesh>
          {/* Mid Kalasam node */}
          <mesh position={[0, 0.55, 0]} material={brassMat}>
            <sphereGeometry args={[0.09, 16, 16]} />
          </mesh>
          {/* Main 5-wick oil dish (Thagaval) */}
          <mesh position={[0, 1.05, 0]} material={brassMat} castShadow>
            <cylinderGeometry args={[0.22, 0.14, 0.1, 24]} />
          </mesh>
          {/* Top Annam / Peacock Finial */}
          <mesh position={[0, 1.25, 0]} material={brassMat} castShadow>
            <coneGeometry args={[0.08, 0.3, 16]} />
          </mesh>
          {/* Glowing flame tips */}
          <mesh position={[0, 1.15, 0]}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshBasicMaterial color="#ffc44d" />
          </mesh>
          {/* Local warm point light casting amber illumination on the doors */}
          <pointLight
            position={[0, 1.3, 0.1]}
            color="#ff9922"
            intensity={18}
            distance={4.5}
            decay={2}
          />
        </group>
      ))}

      {/* 8. BRASS URULI WITH FLOATING MARIGOLDS & CANDLES */}
      {/* Placed next to pillars at Z = 5.5 */}
      {[-1.7, 1.7].map((xPos, idx) => (
        <group key={`uruli-${idx}`} position={[xPos, 0, 4.5]}>
          {/* Shallow broad brass basin */}
          <mesh position={[0, 0.12, 0]} material={brassMat} castShadow>
            <cylinderGeometry args={[0.38, 0.28, 0.24, 24, 1, true]} />
          </mesh>
          <mesh position={[0, 0.01, 0]} material={brassMat}>
            <cylinderGeometry args={[0.28, 0.28, 0.02, 24]} />
          </mesh>
          {/* Water surface */}
          <mesh position={[0, 0.21, 0]}>
            <cylinderGeometry args={[0.36, 0.36, 0.02, 24]} />
            <meshStandardMaterial
              color="#1a4d52"
              roughness={0.05}
              metalness={0.8}
            />
          </mesh>
          {/* Floating flower petals */}
          {[0, 1.2, 2.4, 3.6, 4.8].map((angle, flowerIdx) => (
            <mesh
              key={`flower-${flowerIdx}`}
              position={[
                Math.cos(angle) * 0.22,
                0.23,
                Math.sin(angle) * 0.22,
              ]}
              material={flowerIdx % 2 === 0 ? marigoldOrangeMat : marigoldYellowMat}
            >
              <cylinderGeometry args={[0.06, 0.06, 0.02, 8]} />
            </mesh>
          ))}
          {/* Center floating candle */}
          <mesh position={[0, 0.24, 0]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshBasicMaterial color="#ffe071" />
          </mesh>
          <pointLight
            position={[0, 0.35, 0]}
            color="#ffa233"
            intensity={6}
            distance={2.5}
            decay={2}
          />
        </group>
      ))}
    </group>
  );
};
