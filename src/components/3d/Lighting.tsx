import React from 'react';

export const Lighting: React.FC = () => {
  return (
    <>
      {/* 1. Warm twilight ambient light */}
      <ambientLight color="#ffffff" intensity={1.0} />

      {/* 2. Key light highlighting the front facade details */}
      <directionalLight
        position={[2, 8, 8]}
        intensity={1.2}
        color="#ffe8c2"
      />

      {/* 3. Subtle warm point light on the wooden doors for specular brass reflections */}
      <pointLight
        position={[-0.012, 4.87, 1.8]}
        color="#ffc368"
        intensity={4}
        distance={4.5}
        decay={2}
      />
    </>
  );
};
