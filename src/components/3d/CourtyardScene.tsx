import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CourtyardPetals } from './CourtyardPetals';
import { FlyingBirds } from './FlyingBirds';

interface CourtyardSceneProps {
  scrollProgress: number;
}

export const CourtyardScene: React.FC<CourtyardSceneProps> = ({ scrollProgress }) => {
  // Load exact screen 2 image (assets/exact-screen.png)
  const bgTexture = useTexture('/assets/exact_screen2.png');

  useMemo(() => {
    bgTexture.colorSpace = THREE.SRGBColorSpace;
    bgTexture.minFilter = THREE.LinearMipmapLinearFilter;
    bgTexture.magFilter = THREE.LinearFilter;
    bgTexture.generateMipmaps = true;
  }, [bgTexture]);

  // Persistent time uniform object shared with WebGL shader program
  const timeUniformRef = useRef<{ value: number }>({ value: 0 });

  useFrame(({ clock }) => {
    timeUniformRef.current.value = clock.getElapsedTime();
  });

  const animatedMaterial = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      map: bgTexture,
      side: THREE.DoubleSide,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = timeUniformRef.current;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `#include <common>
         varying vec2 vCustomUv;`
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <uv_vertex>',
        `#include <uv_vertex>
         vCustomUv = uv;`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `#include <common>
         uniform float uTime;
         varying vec2 vCustomUv;`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `
        vec2 animatedUv = vCustomUv;
        float x_px = animatedUv.x * 1024.0;
        float y_px = (1.0 - animatedUv.y) * 1418.0;

        // 1. LEFT BRASS BELL HARMONIC PENDULUM SWING
        // Pivot at top chain ring (x=195, y=475)
        float px_l = 195.0;
        float py_l = 475.0;
        float dx_l = x_px - px_l;
        float dy_l = y_px - py_l;
        float dist_l = sqrt(dx_l * dx_l + dy_l * dy_l);
        if (dist_l < 145.0 && dy_l > -10.0) {
          float angle_l = sin(uTime * 1.6) * 0.052;
          float weight_l = clamp((145.0 - dist_l) / 130.0, 0.0, 1.0) * smoothstep(-10.0, 20.0, dy_l);
          float a = angle_l * weight_l;
          float cos_a = cos(a);
          float sin_a = sin(a);
          x_px = px_l + (dx_l * cos_a - dy_l * sin_a);
          y_px = py_l + (dx_l * sin_a + dy_l * cos_a);
        }

        // 2. RIGHT BRASS BELL HARMONIC PENDULUM SWING
        // Pivot at top chain ring (x=828, y=475)
        float px_r = 828.0;
        float py_r = 475.0;
        float dx_r = x_px - px_r;
        float dy_r = y_px - py_r;
        float dist_r = sqrt(dx_r * dx_r + dy_r * dy_r);
        if (dist_r < 145.0 && dy_r > -10.0) {
          float angle_r = sin(uTime * 1.42 + 1.3) * 0.048;
          float weight_r = clamp((145.0 - dist_r) / 130.0, 0.0, 1.0) * smoothstep(-10.0, 20.0, dy_r);
          float a = angle_r * weight_r;
          float cos_a = cos(a);
          float sin_a = sin(a);
          x_px = px_r + (dx_r * cos_a - dy_r * sin_a);
          y_px = py_r + (dx_r * sin_a + dy_r * cos_a);
        }

        // 3. HANGING FLOWERS BREEZE SWAY (STRICTLY BELOW STONE ARCH - BEAM & ARCH ARE 100% STATIC)
        // Parabolic inner rim of the ornate scalloped stone arch
        float dx_arch = (x_px - 512.0) / 220.0;
        float y_arch = 285.0 + dx_arch * dx_arch * 125.0;

        // Only pixels strictly BELOW the arch inner rim down to above the gold divider
        // This guarantees that the top carved wooden beam, pediment, stone arch, and upper garlands NEVER move!
        if (x_px >= 280.0 && x_px <= 744.0 && y_px > (y_arch + 8.0) && y_px < 425.0) {
          // Weight is 0 at the arch attachment and smoothly increases down the hanging tendrils
          float flower_weight = clamp((y_px - (y_arch + 8.0)) / 65.0, 0.0, 1.0);
          float arch_mask = smoothstep(280.0, 320.0, x_px) * (1.0 - smoothstep(704.0, 744.0, x_px));
          float sway = (sin(uTime * 1.8 + x_px * 0.02) * 4.2 + cos(uTime * 2.5 + x_px * 0.035) * 1.8) * flower_weight * arch_mask;
          x_px += sway;
        }

        vec2 finalUv = vec2(x_px / 1024.0, 1.0 - (y_px / 1418.0));
        vec4 sampledColor = texture2D(map, finalUv);
        diffuseColor *= sampledColor;
        `
      );
    };

    return mat;
  }, [bgTexture]);

  // Exact image dimensions: 1024 x 1418 pixels
  const planeHeight = 10.0;
  const planeWidth = (1024 / 1418) * planeHeight; // 7.22143878

  return (
    <group position={[0, 0, 0]}>
      {/* 1. EXACT SCREEN 2 ROYAL INVITATION IMAGE WITH ANIMATED BELLS & FLOWERS */}
      <mesh position={[0, 0, 0]} material={animatedMaterial}>
        <planeGeometry args={[planeWidth, planeHeight]} />
      </mesh>

      {/* 2. LIVE ANIMATED ROYAL WHITE DOVES */}
      <FlyingBirds scrollProgress={scrollProgress} />

      {/* 3. Soft drifting rose petals for gentle living atmosphere */}
      <CourtyardPetals />
    </group>
  );
};
