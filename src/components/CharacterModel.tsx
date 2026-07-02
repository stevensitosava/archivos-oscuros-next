"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, Html, useProgress } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "/chracter.glb"; // (filename as uploaded)

// Fit (scale + centering offset) is measured ONCE from the bind pose and cached
// module-wide, so it is identical on every mount — navigating between /acceso
// and /registro can never re-center the model to a different (animated) pose.
let CACHED_FIT: { scale: number; offset: [number, number, number] } | null = null;

function Model({ animation, stopAt }: { animation: string; stopAt: number }) {
  const tilt = useRef<THREE.Group>(null); // cursor-follow rotation (in place)
  const animRoot = useRef<THREE.Group>(null); // skeleton/animation target
  const mouse = useRef({ x: 0, y: 0 });
  const actionRef = useRef<THREE.AnimationAction | null>(null);
  const stopTime = useRef<number>(Infinity);

  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions, names } = useAnimations(animations, animRoot);

  const fit = useMemo(() => {
    if (!CACHED_FIT) {
      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const scale = 2.4 / maxDim;
      const o = center.multiplyScalar(-scale);
      CACHED_FIT = { scale, offset: [o.x, o.y, o.z] };
    }
    return CACHED_FIT;
  }, [scene]);

  // Play the entry movement once; it ends (pauses) at the raised-sword pose.
  const play = useCallback(() => {
    const name = names.includes(animation) ? animation : names[0];
    const action = name ? actions[name] : null;
    if (!action) return;
    action.reset();
    action.paused = false;
    action.timeScale = 1;
    action.clampWhenFinished = true;
    action.setLoop(THREE.LoopOnce, 1);
    action.play();
    actionRef.current = action;
    stopTime.current = Math.max(0, Math.min(1, stopAt)) * action.getClip().duration;
  }, [actions, names, animation, stopAt]);

  useEffect(() => {
    play();
  }, [play]);

  // Track the cursor across the whole page so the character turns to "look" at it.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame(() => {
    // 1) Freeze the skeleton at the end pose once the movement reaches it.
    const action = actionRef.current;
    if (action && !action.paused && action.time >= stopTime.current) {
      action.time = stopTime.current;
      action.paused = true;
    }
    // 2) Rotate the whole character (in place) toward the cursor — never translates.
    const t = tilt.current;
    if (t) {
      const targetY = mouse.current.x * 0.55; // yaw
      const targetX = mouse.current.y * 0.12; // subtle pitch
      t.rotation.y += (targetY - t.rotation.y) * 0.06;
      t.rotation.x += (targetX - t.rotation.x) * 0.06;
    }
  });

  return (
    <group ref={tilt}>
      <group ref={animRoot} scale={fit.scale} position={fit.offset}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-ash-400">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-ember-500" />
        <span className="text-xs tabular-nums">{Math.round(progress)}%</span>
      </div>
    </Html>
  );
}

export default function CharacterModel({
  animation = "Axe_Stance",
  stopAt = 0.8,
  className = "",
}: {
  animation?: string;
  /** Normalized time (0–1) at which the movement stops and holds its pose. */
  stopAt?: number;
  className?: string;
}) {
  // Client-only: don't render the WebGL canvas during SSR.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className={className} aria-hidden="true" />;

  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.25, 6.6], fov: 30 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 6, 5]} intensity={1.5} />
        <directionalLight position={[-5, 2, -3]} intensity={0.5} color="#b2342a" />
        <Suspense fallback={<Loader />}>
          <Model animation={animation} stopAt={stopAt} />
        </Suspense>
        {/* No OrbitControls: fixed camera + the character rotates to follow the
            cursor, so it stays framed and can never leave its position. */}
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
