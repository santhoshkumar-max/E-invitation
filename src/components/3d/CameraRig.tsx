import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

interface CameraRigProps {
  scrollProgress: number; // 0 to 1
  setDoorProgress: (val: number) => void;
}

export const CameraRig: React.FC<CameraRigProps> = ({
  scrollProgress,
  setDoorProgress,
}) => {
  const { camera } = useThree();

  const smoothProgressRef = useRef(0);
  const lookAtTarget = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  // Plane metrics for 1024 x 1536 images centered at (0, 0, 0)
  const planeHeight = 10.0;
  const planeWidth = (1024 / 1536) * planeHeight; // 6.666667
  const doorCenterX = ((511 - 512) / 1024) * planeWidth; // -0.00651
  const doorCenterY = ((748 - 768) / 1536) * planeHeight; // -0.13021

  // Unzoomed distance: fits Screen 1 height with zero black bars top/bottom
  const vFovRad = (45 * Math.PI) / 180;
  const fitZ = (planeHeight / 2) / Math.tan(vFovRad / 2) * 0.995; // ~12.01m

  useFrame((_, delta) => {
    // Silky fluid physical damping for scroll input
    smoothProgressRef.current = THREE.MathUtils.damp(
      smoothProgressRef.current,
      scrollProgress,
      6.0,
      delta
    );
    const p = smoothProgressRef.current;

    // Screen 1 Zoom-In Trajectory (Strictly Forward - Zero Reversal):
    // - p = 0.00 -> 0.45: Camera approaches down the red carpet toward the doors (Z: 12.01m -> 2.6m)
    // - p = 0.35 -> 0.60: Doors swing open inward on their hinges
    // - p = 0.45 -> 0.75: Camera continues moving forward right up to and through the doorway (Z: 2.6m -> 0.15m)
    // - p = 0.75 -> 1.00: Screen 1 has completely exited the view; stationary Screen 2 underneath is fully visible
    let targetZ = fitZ;
    let targetY = 0.0;
    let targetX = 0.0;

    if (p <= 0.45) {
      const t = THREE.MathUtils.smoothstep(p / 0.45, 0, 1);
      targetZ = THREE.MathUtils.lerp(fitZ, 2.6, t);
      targetY = THREE.MathUtils.lerp(0.0, doorCenterY, t);
      targetX = THREE.MathUtils.lerp(0.0, doorCenterX, t);
    } else if (p <= 0.75) {
      const t = THREE.MathUtils.smoothstep((p - 0.45) / 0.30, 0, 1);
      targetZ = THREE.MathUtils.lerp(2.6, 0.15, t);
      targetY = doorCenterY;
      targetX = doorCenterX;
    } else {
      targetZ = 0.15;
      targetY = doorCenterY;
      targetX = doorCenterX;
    }

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 8, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 8, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 8, delta);

    lookAtTarget.set(targetX, targetY, 0);
    camera.lookAt(lookAtTarget);

    // Door Swing Interaction:
    const doorTriggerStart = 0.35;
    const doorTriggerEnd = 0.60;

    let doorFactor = 0;
    if (p > doorTriggerStart) {
      const rawFactor = (p - doorTriggerStart) / (doorTriggerEnd - doorTriggerStart);
      const clamped = Math.min(Math.max(rawFactor, 0), 1);
      doorFactor = clamped * clamped * (3 - 2 * clamped);
    }

    setDoorProgress(doorFactor);
  });

  return null;
};
