'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

const POINT_COUNT = 90;
const LINK_DISTANCE = 0.62;
const MAX_LINKS = 260;

/** Read the live accent colours, so the scene follows theme changes made in the admin. */
function useAccentColors() {
  const read = () => {
    const css = getComputedStyle(document.documentElement);
    return {
      primary: css.getPropertyValue('--primary').trim() || '#6366F1',
      secondary: css.getPropertyValue('--secondary').trim() || '#22D3EE',
    };
  };
  const [colors, setColors] = useState(read);
  useEffect(() => {
    // The dark/light toggle swaps the class on <html>, which swaps the palette.
    const mo = new MutationObserver(() => setColors(read()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);
  return colors;
}

/** Evenly spread points on a sphere (Fibonacci lattice), with slight jitter. */
function spherePoints(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const jitter = radius * (0.92 + ((i * 7919) % 100) / 1250);
    positions.set([Math.cos(theta) * r * jitter, y * jitter, Math.sin(theta) * r * jitter], i * 3);
  }
  return positions;
}

function linkSegments(points: Float32Array): Float32Array {
  const segments: number[] = [];
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  for (let i = 0; i < POINT_COUNT && segments.length / 6 < MAX_LINKS; i++) {
    a.fromArray(points, i * 3);
    for (let j = i + 1; j < POINT_COUNT; j++) {
      b.fromArray(points, j * 3);
      if (a.distanceTo(b) < LINK_DISTANCE) segments.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  return new Float32Array(segments);
}

function Network({ primary, secondary }: { primary: string; secondary: string }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useThree((s) => s.pointer);
  const points = useMemo(() => spherePoints(POINT_COUNT, 1.55), []);
  const links = useMemo(() => linkSegments(points), [points]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(delta, 0.05);
    // Slow idle spin, plus a gentle tilt toward the cursor.
    g.rotation.y += dt * 0.12;
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, pointer.y * 0.25, 2.5, dt);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, -pointer.x * 0.15, 2.5, dt);
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.05, 1]} />
        <meshBasicMaterial color={primary} wireframe transparent opacity={0.28} />
      </mesh>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[links, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={secondary} transparent opacity={0.22} />
      </lineSegments>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[points, 3]} />
        </bufferGeometry>
        <pointsMaterial color={secondary} size={0.045} sizeAttenuation transparent opacity={0.9} />
      </points>
    </group>
  );
}

export default function HeroScene({ active }: { active: boolean }) {
  const { primary, secondary } = useAccentColors();

  return (
    <Canvas
      className="!absolute inset-0"
      // Cap pixel ratio: sharp on retina, without rendering 9× the pixels on 3× phones.
      dpr={[1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      eventSource={typeof document !== 'undefined' ? document.body : undefined}
      eventPrefix="client"
    >
      <Network primary={primary} secondary={secondary} />
    </Canvas>
  );
}
