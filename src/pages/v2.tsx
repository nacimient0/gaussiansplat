// @ts-nocheck
"use client";

import * as pc from "playcanvas";
import { Application, Entity } from "@playcanvas/react";
import { Camera, GSplat, Script, Render } from "@playcanvas/react/components";
import { OrbitControls, AutoRotator } from "@playcanvas/react/scripts";
import { useSplat } from "@playcanvas/react/hooks";
import React, { useEffect, useMemo, useRef, useState } from "react";
import LerpAndSlerpCamera from "../scripts/LerpAndSlerpCamera";

/* ------------------------------ Loader ------------------------------ */
function Loader({ progress }: { progress: number }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (progress >= 1) {
      const t = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(t);
    }
  }, [progress]);
  if (!visible) return null;

  return (
    <div style={{
      backgroundImage: "url('V2/bg-v2.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      opacity: progress >= 1 ? 0 : 1,
      transition: "opacity 1s ease",
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      zIndex: 9999
    }}>
      <div className="loader-circle" />
      <style>{`
        .loader-circle{width:80px;height:80px;border-radius:50%;display:inline-block;border-top:8px solid #fff;border-right:8px solid transparent;animation:spin 1s linear infinite;position:relative}
        .loader-circle::after{content:"";position:absolute;left:0;top:0;width:80px;height:80px;border-radius:50%;border-bottom:8px solid red;border-left:8px solid transparent}
        @keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
      `}</style>
      <p style={{ color: "white", marginTop: 20, fontSize: 30, textShadow: "0 0 20px black", textAlign: "center" }}>
        Chargement en cours...
      </p>
    </div>
  );
}

/* ------------------------ Splat Scene ------------------------ */
const SplatScene: React.FC = React.memo(() => {
  const { asset, loading } = useSplat("/V2/scene-v2.sog");
  const progress = loading ? 0 : 1;

  if (!asset) return <Loader progress={progress} />;

  return (
    <>
      <Loader progress={progress} />
      {/* repère au centre */}
      <Entity name="originMarker" position={[0, 0, 0]} scale={[0.1, 0.1, 0.1]}>
        <Render type="box" width={0.1} height={0.1} depth={0.1} />
      </Entity>

      <Entity name="splat" position={[0, 0, 0]} rotation={[180, -90, 0]}>
        <GSplat asset={asset} />
      </Entity>
    </>
  );
});
SplatScene.displayName = "SplatScene";

/* ------------------------ Main ------------------------ */
export default function V2() {
  const cameraRef = useRef<any>(null);
  const orbitRef = useRef<any>(null);

  // Références A / B
  const POS_A: [number, number, number] = [-1.25, 1.0, 0.25];
  const POS_B: [number, number, number] = [-1.25, 0.1, 1.5];

  // Durée de l’interp
  const DURATION = 5.0;

  // Etat : on démarre SUR B
  const [at, setAt] = useState<"A" | "B">("B");
  const [trigger, setTrigger] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);

  // Init orientation (regarder le centre) et position initiale
  useEffect(() => {
    const e = cameraRef.current as pc.Entity | null;
    if (!e) return;
    // start @ B
    e.setPosition(new pc.Vec3(...POS_B));
    e.lookAt(...LOOK_AT);
    e.syncHierarchy?.();
  }, []);

  // Lancer le lerp vers l’autre point
  const toggleLerp = () => {
    setAutoRotate(false);
    setTrigger(t => t + 1);     // déclenche le script
    setIsAnimating(true);

    // à la fin : on dit qu’on est “à l’autre point”, on réaligne OrbitControls
    setTimeout(() => {
      setIsAnimating(false);
      setAt(prev => (prev === "B" ? "A" : "B"));
      // réaligner OrbitControls pour qu’ils ne “cassent” pas la pose
      if (orbitRef.current?.focus) {
        orbitRef.current.focus(new pc.Vec3(...LOOK_AT));
      }
    }, Math.round(DURATION * 1000) + 50);
  };

  // DEBUG : log la position pendant l’anim (optionnel)
  useEffect(() => {
    if (!isAnimating) return;
    let raf: number | null = null;
    let frame = 0;
    const tick = () => {
      const ent = cameraRef.current as pc.Entity | null;
      if (ent) {
        const p = ent.getPosition();
        const nextId = requestAnimationFrame(tick);
        console.log(`[frame ${frame}] raf=${nextId} cam=(${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)})`);
        raf = nextId; frame++;
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [isAnimating]);

  const splatOnce = useMemo(() => <SplatScene />, []);

  return (
    <>
      <Application graphicsDeviceOptions={{ antialias: false }}>
        {/* Points A / B */}
        <Entity name="pointA" position={POS_A} />
        <Entity name="pointB" position={POS_B} />

        {/* Caméra (démarre sur B) */}
        <Entity name="camera" ref={cameraRef} position={POS_B}>
          <Camera fov={62} />

          {/* Auto-rotate libre (désactivé pendant anim) */}
          {autoRotate && !isAnimating && (
            <Script
              script={AutoRotator}
              speed={20}
              pitchAmount={0}
              startDelay={0}
              startFadeInTime={0}
            />
          )}

          {/* OrbitControls quand pas d’auto-rotate et pas de lerp */}
          {!autoRotate && !isAnimating && (
            <OrbitControls
              ref={orbitRef}
              distance={2}
              distanceMin={0.25}
              distanceMax={10}
              pitchAngleMin={10}
              pitchAngleMax={50}
              inertiaFactor={0.15}
            />
          )}

          {/* Lerp A↔B : on regarde (0,0,0) pendant l’anim */}
          <Script
            script={LerpAndSlerpCamera}
            pointAName="pointA"
            pointBName="pointB"
            duration={DURATION}
            trigger={trigger}
            lookAtX={0} lookAtY={0} lookAtZ={0}
            fovA={80}
            fovB={80}
            fovMid={80}   // zoom max à mi-parcours
          />

        </Entity>

        {splatOnce}
      </Application>

      {/* UI */}
      <div style={{ position: "absolute", bottom: 20, left: 20, zIndex: 9999 }}>
        <div style={buttonStyle} onClick={toggleLerp}>
          {`Cam actuelle: ${at} — Aller vers ${at === "B" ? "A" : "B"} ${isAnimating ? "⏳" : ""}`}
        </div>

        <div
          style={{ ...buttonStyle, marginTop: 10 }}
          onClick={() => setAutoRotate(p => !p)}
          title="Rotation libre (yaw/pitch) sur place"
        >
          {autoRotate ? "STOP ROTATION" : "LANCER ROTATION"}
        </div>
      </div>
    </>
  );
}

/* ------------------------ UI Button style ------------------------ */
const buttonStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.6)",
  color: "white",
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  userSelect: "none",
  fontSize: "14px",
};
