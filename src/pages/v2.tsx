// @ts-nocheck
"use client";

import * as pc from "playcanvas";
import { Application, Entity } from "@playcanvas/react";
import { Camera, GSplat, Script, Render } from "@playcanvas/react/components";
import { OrbitControls, AutoRotator } from "@playcanvas/react/scripts";
import { useSplat } from "@playcanvas/react/hooks";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Grid } from "@playcanvas/react/scripts";

/* ------------------------------ Loader ------------------------------ */
function Loader({ progress }: { progress: number }) {
    const [visible, setVisible] = useState(true);
    useEffect(() => {
        if (progress >= 1) {
            const timeout = setTimeout(() => setVisible(false), 500);
            return () => clearTimeout(timeout);
        }
    }, [progress]);
    if (!visible) return null;
    return (
        <div
            style={{
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
                zIndex: 9999,
            }}
        >
            <div className="loader-circle" />
            <style>{`
        .loader-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: inline-block;
          border-top: 8px solid white;
          border-right: 8px solid transparent;
          animation: spin 1s linear infinite;
          position: relative;
        }
        .loader-circle::after {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border-bottom: 8px solid red;
          border-left: 8px solid transparent;
        }
        @keyframes spin { 0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) } }
      `}</style>
            <p style={{ color: "white", marginTop: 20, fontSize: 30, textShadow: "0 0 20px black", textAlign: "center" }}>
                Chargement en cours...
            </p>
        </div>
    );
}

/* ------------------------ GSplat Wrapper ------------------------ */
const GSplatWrapper: React.FC<{ asset: any }> = ({ asset }) => {
    const entityRef = useRef<any>(null);
    useLayoutEffect(() => {
        if (entityRef.current) entityRef.current.enabled = false;
    }, []);
    useEffect(() => {
        if (asset?.resource && entityRef.current) {
            const id = requestAnimationFrame(() => { entityRef.current.enabled = true; });
            return () => cancelAnimationFrame(id);
        }
    }, [asset]);
    return (
        <>
            <Entity ref={entityRef} position={[0, 0, 0]} rotation={[0, 0, 180]} enabled={false}>
                <GSplat asset={asset} />
            </Entity>
            <Entity name="marker" position={[-1, 0.25, -1]} rotation={[0, 0, 0]} scale={[0.05, 0.05, 0.05]}
                onPointerDown={() => window.open("https://asylum.fr", "_blank")}>
                <Render type="sphere" width={0.1} height={0.1} depth={0.1} />
            </Entity>
        </>
    );
};

/* ------------------------ Scene Loader ------------------------ */
const SplatScene: React.FC = React.memo(() => {
    const { asset } = useSplat("/V2/scene-v2.sog");
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        if (!asset) return;
        if (asset.resource) setProgress(1);
        else {
            const onLoad = () => setProgress(1);
            asset.once("load", onLoad);
            return () => asset.off("load", onLoad);
        }
    }, [asset]);
    if (!asset) return <Loader progress={0} />;
    return (
        <>
            <Loader progress={progress} />
            <GSplatWrapper asset={asset} />
        </>
    );
});
SplatScene.displayName = "SplatScene";

/* ------------------------ Hook: Lerp position (state) ------------------------ */
function useLerpPositionState(
    target: number[],
    setPosition: (p: number[]) => void,
    setIsLerping: (b: boolean) => void,
    speed = 5
) {
    useEffect(() => {
        if (!target || target.length !== 3) return;
        let frame = 0;
        let rafId: number | null = null;
        setIsLerping(true);

        const animate = () => {
            setPosition((current) => {
                const safe = Array.isArray(current) && current.length === 3 ? current : [0, 0, 0];
                const curr = new pc.Vec3(safe[0], safe[1], safe[2]);
                const tgt = new pc.Vec3(target[0], target[1], target[2]);
                const alpha = Math.min(0.12 * (speed / 5), 0.35);
                const next = curr.lerp(tgt, alpha);
                const arr: number[] = [next.x, next.y, next.z];
                const dist = next.distance(tgt);

                if (dist > 0.01 && frame < 240) {
                    frame++;
                    rafId = requestAnimationFrame(animate);
                    return arr;
                } else {
                    setIsLerping(false);
                    return [tgt.x, tgt.y, tgt.z];
                }
            });
        };

        rafId = requestAnimationFrame(animate);
        return () => { if (rafId) cancelAnimationFrame(rafId); };
    }, [target[0], target[1], target[2], speed]);
}

/* -------- Hook: Sync position + orientation (lookAt) vers PlayCanvas -------- */
function useSyncCameraTransform(
    cameraRef: any,
    cameraPosition: number[],
    lookAtTarget: number[] // point à regarder
) {
    useEffect(() => {
        const cam = cameraRef.current;
        if (!cam) return;
        if (!cameraPosition || cameraPosition.length !== 3) return;

        const pos = new pc.Vec3(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
        cam.setLocalPosition(pos);

        if (lookAtTarget && lookAtTarget.length === 3) {
            // oriente la caméra vers le point choisi
            const tgt = new pc.Vec3(lookAtTarget[0], lookAtTarget[1], lookAtTarget[2]);
            cam.lookAt(tgt);
        }

        cam.syncHierarchy?.();
    }, [cameraRef, cameraPosition[0], cameraPosition[1], cameraPosition[2],
        lookAtTarget?.[0], lookAtTarget?.[1], lookAtTarget?.[2]]);
}

/* ------------------------ Main Component ------------------------ */
export default function V2() {
    const orbitRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);

    // Positions très différentes pour vérifier visuellement
    const position1 = [50, 10, 10];
    const position2 = [-50, 10, 10];

    // Point d’intérêt que la caméra regarde
    const focus: number[] = [0, 5, 0]; // ajuste si besoin

    const [cameraPosition, setCameraPosition] = useState<number[]>(() => [...position1]);
    const [targetView, setTargetView] = useState<number[]>(() => [...position1]);
    const [viewIndex, setViewIndex] = useState(0);
    const [autoRotate, setAutoRotate] = useState(false);
    const [isLerping, setIsLerping] = useState(false);

    // Lerp du state
    useLerpPositionState(targetView, setCameraPosition, setIsLerping, 5);

    // Sync position + orientation vers PlayCanvas
    useSyncCameraTransform(cameraRef, cameraPosition, focus);

    // Focus initial pour OrbitControls (facultatif)
    useEffect(() => {
        const id = requestAnimationFrame(() => {
            if (orbitRef.current?.focus) {
                orbitRef.current.focus(new pc.Vec3(...focus));
            }
        });
        return () => cancelAnimationFrame(id);
    }, []);

    const toggleView = () => {
        const nextIndex = viewIndex === 0 ? 1 : 0;
        const nextTarget = nextIndex === 0 ? position1 : position2;
        setViewIndex(nextIndex);
        setTargetView([...nextTarget]);
    };

    const splatOnce = useMemo(() => <SplatScene />, []);

    return (
        <>
            <Application graphicsDeviceOptions={{ antialias: false }}>
                <Entity name="camera" ref={cameraRef} position={cameraPosition}>
                    <Camera fov={65} />
                    {/* Désactive OrbitControls pendant le lerp pour ne pas écraser la position */}
                    {!isLerping && viewIndex === 0 && (
                        <>
                            <OrbitControls
                                ref={orbitRef}
                                inertiaFactor={0.07}
                                distanceMin={1}
                                distanceMax={50}
                                pitchAngleMin={5}
                                pitchAngleMax={90}
                            />
                            {autoRotate && (
                                <Script
                                    script={AutoRotator}
                                    speed={10}
                                    pitchAmount={25}
                                    startDelay={0}
                                    startFadeInTime={0.5}
                                />
                            )}
                        </>
                    )}
                </Entity>

                <Entity>
                    <Script script={Grid} />
                </Entity>

                {splatOnce}
            </Application>

            {/* UI */}
            <div style={{ position: "absolute", bottom: 20, left: 20, zIndex: 9999 }}>
                <div style={buttonStyle} onClick={toggleView}>
                    {viewIndex === 0 ? "ALLER VERS [-50,10,10]" : "RETOUR VERS [50,10,10]"}
                </div>
                {viewIndex === 0 && (
                    <div style={{ ...buttonStyle, marginTop: 10 }} onClick={() => setAutoRotate((p) => !p)}>
                        {autoRotate ? "STOP ROTATION" : "LANCER ROTATION"}
                    </div>
                )}
                <div style={{ marginTop: 10, color: "white" }}>
                    pos = [{cameraPosition.map((n) => n.toFixed(2)).join(", ")}] {isLerping ? "⏳" : "✅"}
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
