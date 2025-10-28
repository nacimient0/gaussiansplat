// @ts-nocheck
"use client";

import * as pc from "playcanvas";
import { Application, Entity } from "@playcanvas/react";
import { Camera, GSplat, Script, Render } from "@playcanvas/react/components";
import { OrbitControls } from "@playcanvas/react/scripts";
import { useSplat } from "@playcanvas/react/hooks";
import React, { useEffect, useMemo, useRef, useState } from "react";
import LerpAndSlerpCamera from "../scripts/LerpAndSlerpCamera";
import { SimpleAutoRotator } from "../scripts/SimpleAutoRotator";

/* ------------------------------ Loader ------------------------------ */
function Loader({ progress }) {
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
const SplatScene = React.memo(() => {
  const { asset, loading } = useSplat("/V2/scene-v2.sog");
  const progress = loading ? 0 : 1;

  if (!asset) return <Loader progress={progress} />;

  return (
    <>
      <Loader progress={progress} />
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
  const cameraRef = useRef(null);
  const orbitRef = useRef(null);

  // Références A / B
  const POS_A = [-1.25, 1.0, 0.25];
  const POS_B = [-1.35, 0.15, 1.8];

  const DURATION = 5.0;

  const [at, setAt] = useState("A");
  const [trigger, setTrigger] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);

  // Lancer une anim
  const toggleLerp = () => {
    console.log(`🟢 toggleLerp déclenché (${at} → ${at === "A" ? "B" : "A"})`);
    setAutoRotate(false);
    setTrigger(Date.now());
    setAt(at === "A" ? "B" : "A");
  };

  const toggleAutoRotate = () => setAutoRotate(p => !p);

  const splatOnce = useMemo(() => <SplatScene />, []);

  return (
    <>
      <Application graphicsDeviceOptions={{ antialias: false }}>
        <Entity name="pointA" position={POS_A} />
        <Entity name="pointB" position={POS_B} />

        <Entity name="camera" ref={cameraRef} position={POS_B}>
          <Camera fov={70} />

          {/* OrbitControls toujours actif */}
          <OrbitControls
            ref={orbitRef}
            distance={2}
            distanceMin={0.25}
            distanceMax={5}
            pitchAngleMin={2}
            pitchAngleMax={50}
            inertiaFactor={0.15}
            enabled={!autoRotate}
            mouse={{ pan: false }}
            touch={{ pan: false }}
          />

          {autoRotate && (
            <Script
              script={SimpleAutoRotator}
              speed={15}
              pitchSpeed={0}
              pitchAmount={0}
              startDelay={0}
              startFadeInTime={0}
            />
          )}

          {/* Lerp A↔B */}
          <Script
            script={LerpAndSlerpCamera}
            pointAName="pointA"
            pointBName="pointB"
            duration={DURATION}
            trigger={trigger}
            lookAtX={0} lookAtY={0} lookAtZ={0}
            fovA={62}
            fovB={62}
          />
        </Entity>

        {splatOnce}
      </Application>

      {/* UI */}
      <div className="z-9999 absolute bottom-0 w-full bg-gradient-to-b from-[transparent] to-black h-[8vh] p-8">
        <div className="flex items-center justify-center h-full gap-3">
          <button onClick={toggleLerp}>⬅️</button>
          <button onClick={toggleAutoRotate}>{autoRotate ? "⏸️" : "▶️"}</button>
          <button onClick={toggleLerp}>➡️</button>
        </div>
      </div>
    </>
  );
}
