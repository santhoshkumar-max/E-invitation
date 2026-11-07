import React, { Suspense, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Lighting } from './Lighting';
import { ReferenceEntrance } from './ReferenceEntrance';
import { CourtyardScene } from './CourtyardScene';
import { CameraRig } from './CameraRig';

interface SceneProps {
  scrollProgress: number;
}

// Controller to lock Screen 2's camera strictly at (0, 0, fitZ) looking at (0, 0, 0)
const StationaryCourtyardCamera: React.FC<{ fitZ: number }> = ({ fitZ }) => {
  const { camera } = useThree();

  useFrame(() => {
    camera.position.set(0, 0, fitZ);
    camera.lookAt(0, 0, 0);
  });

  return null;
};

export const Scene: React.FC<SceneProps> = ({ scrollProgress }) => {
  const [doorProgress, setDoorProgress] = useState(0);

  // Exact unzoomed camera distance fitting 10.0m height plane with 45 deg FOV
  const vFovRad = (45 * Math.PI) / 180;
  const fitZ = (10.0 / 2) / Math.tan(vFovRad / 2) * 0.995; // ~12.01m

  return (
    <>
      {/* LAYER 0 (BACK): Screen 2 - The Royal Courtyard 3D Scene */}
      <div className="fixed inset-0 w-full h-full z-0">
        <Canvas
          gl={{
            antialias: true,
            toneMapping: THREE.NoToneMapping,
            powerPreference: 'high-performance',
          }}
          camera={{
            fov: 45,
            near: 0.1,
            far: 50,
            position: [0, 0, fitZ],
          }}
          dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        >
          <color attach="background" args={['#0a080c']} />

          <Suspense fallback={null}>
            <Lighting />
            {/* Screen 2 with animated bells, swaying flowers, flying doves, and petals */}
            <CourtyardScene scrollProgress={scrollProgress} />
            <StationaryCourtyardCamera fitZ={fitZ} />
          </Suspense>
        </Canvas>
      </div>

      {/* LAYER 1 (FRONT): Screen 1 - Entrance with Independent Zoom & Opening Doors */}
      <div className="fixed inset-0 w-full h-full z-10 pointer-events-none">
        <Canvas
          gl={{
            alpha: true,
            antialias: true,
            toneMapping: THREE.NoToneMapping,
            powerPreference: 'high-performance',
          }}
          camera={{
            fov: 45,
            near: 0.1,
            far: 50,
            position: [0, 0, fitZ],
          }}
          dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        >
          <Suspense fallback={null}>
            <Lighting />

            {/* Entrance frame and inward-opening 3D doors */}
            <ReferenceEntrance
              openProgress={doorProgress}
              scrollProgress={scrollProgress}
            />

            {/* Scroll-driven camera moving forward through entrance */}
            <CameraRig
              scrollProgress={scrollProgress}
              setDoorProgress={setDoorProgress}
            />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
};
