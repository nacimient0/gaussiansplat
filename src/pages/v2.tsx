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

/* ------------------------ Script: LookAtTarget (simple) ------------------------ */
const LookAtTarget = (pcLib: typeof pc) => {
  class LookAtTarget extends pcLib.ScriptType {
    static attributes = {
      x: { type: "number", default: 0 },
      y: { type: "number", default: 0 },
      z: { type: "number", default: 0 }
    };
    update() {
      this.entity.lookAt(this.x, this.y, this.z);
    }
  }
  return LookAtTarget;
};

/* ------------------------ Main ------------------------ */
export default function V2() {
  const cameraRef = useRef<any>(null);
  const orbitRef = useRef<any>(null);

  // A ↔ B (positions de démo)
  const POS_A: [number, number, number] = [-1.25, 1.0, 0.25];
  const POS_B: [number, number, number] = [-1.25, 0.1, 1.5];

  // durée du lerp (doit matcher la prop du script)
  const DURATION = 5.0;

  // UI state
  const [trigger, setTrigger] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);

  // Lancer l’interp A↔B (on coupe autorotate pendant le lerp)
  const toggleLerp = () => {
    setAutoRotate(false);
    setTrigger(t => t + 1);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), Math.round(DURATION * 1000) + 50);
  };

  // Focus initial pour OrbitControls
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (orbitRef.current?.focus) {
        orbitRef.current.focus(new pc.Vec3(0, 0, 0));
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // DEBUG : log position cam pendant l’anim
  useEffect(() => {
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
    if (isAnimating) raf = requestAnimationFrame(tick);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [isAnimating]);

  const splatOnce = useMemo(() => <SplatScene />, []);

  return (
    <>
      <Application graphicsDeviceOptions={{ antialias: false }}>
        {/* Points de référence A / B */}
        <Entity name="pointA" position={POS_A} />
        <Entity name="pointB" position={POS_B} />

        {/* Caméra ENFANT du pivot */}
        <Entity name="camera" ref={cameraRef} position={POS_A}>
          <Camera fov={62} />
          {autoRotate && (
            <Script
              script={AutoRotator}
              speed={20}
              pitchAmount={0}
              startDelay={0}
              startFadeInTime={0}
            />
          )}

          {/* OrbitControls : quand pas d’auto-rotation et pas de lerp */}
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

          {/* Lerp A↔B : on vise (0,0,0) pendant l’anim */}
          <Script
            script={LerpAndSlerpCamera}
            pointAName="pointA"
            pointBName="pointB"
            duration={DURATION}
            trigger={trigger}
            lookAtX={0}
            lookAtY={0}
            lookAtZ={0}
          />
        </Entity>

        {splatOnce}
      </Application>

      {/* UI */}
      <div style={{ position: "absolute", bottom: 20, left: 20, zIndex: 9999 }}>
        <div style={buttonStyle} onClick={toggleLerp}>
          {`Aller vers ${trigger % 2 === 0 ? "[B]" : "[A]"} ${isAnimating ? "⏳" : ""}`}
        </div>

        <div
          style={{ ...buttonStyle, marginTop: 10 }}
          onClick={() => setAutoRotate(p => !p)}
          title="Orbiter autour de (0,0,0)"
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
