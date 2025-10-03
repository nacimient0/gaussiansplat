// @ts-nocheck
"use client";

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

/* ------------------------ GSplat Wrapper (safe enable) ------------------------ */
const GSplatWrapper: React.FC<{ asset: any }> = ({ asset }) => {
    const entityRef = useRef<any>(null);

    useLayoutEffect(() => {
        if (entityRef.current) {
            entityRef.current.enabled = false;
        }
    }, []);

    useEffect(() => {
        if (asset?.resource && entityRef.current) {
            const entity = entityRef.current;
            const id = requestAnimationFrame(() => {
                entity.enabled = true;
            });
            return () => cancelAnimationFrame(id);
        }
    }, [asset]);

    return (
        <>
            <Entity
                ref={entityRef}
                position={[0, 0, 0]}
                rotation={[0, 0, 180]}
                enabled={false}
            >
                <GSplat asset={asset} />

            </Entity>
            <Entity
                name="marker"
                position={[-1, 0.25, -1]}
                rotation={[0, 0, 0]}
                scale={[0.05, 0.05, 0.05]}
                onPointerDown={() => window.open("https://asylum.fr", "_blank")}
            >
                <Render type='sphere' width={0.1} height={0.1} depth={0.1} />
            </Entity>
        </>
    );
};

/* ------------------------ Scene Loading ------------------------ */
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

/* ------------------------ Main Component ------------------------ */
export default function V2() {
    const orbitRef = useRef(null);
    console.log(orbitRef)
    const cameraRef = useRef(null);

    const [showBackView, setShowBackView] = useState(false);
    const [autoRotate, setAutoRotate] = useState(false);

    const lastUserViewRef = useRef({
        position: [4, 1, 4],
        rotation: [0, 0, 0],
    });

    const backView = {
        position: [0, 1.5, -4],
        rotation: [0, 0, 0],
    };

    const transform = showBackView ? backView : lastUserViewRef.current;

    const toggleView = () => {
        if (!showBackView && cameraRef.current) {
            lastUserViewRef.current = {
                position: cameraRef.current.getLocalPosition().toArray(),
                rotation: cameraRef.current.getLocalEulerAngles().toArray(),
            };
        }
        setShowBackView(!showBackView);
    };

    // ✅ Splat scène fixée, pas de re-render
    const splatOnce = useMemo(() => <SplatScene />, []);

    useEffect(() => {
        const id = requestAnimationFrame(() => {
            if (orbitRef.current?.focus) {
                orbitRef.current.focus(new pc.Vec3(0, 0, 0));
            }
        });
        return () => cancelAnimationFrame(id);
    }, []);



    return (
        <>
            <Application graphicsDeviceOptions={{ antialias: false }}>
                {/* Camera */}
                <Entity name="camera" {...transform} ref={cameraRef}>
                    <Camera fov={65} />
                    {!showBackView && (
                        <>
                            <OrbitControls
                                ref={orbitRef}
                                inertiaFactor={0.07}
                                distanceMin={1}
                                distanceMax={10}
                                pitchAngleMin={0}
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


                {/* Grid */}
                <Entity>
                    <Script script={Grid} />
                </Entity>

                {/* GSplat */}
                {splatOnce}

            </Application>

            {/* UI */}
            <div style={{ position: "absolute", bottom: 20, left: 20, zIndex: 9999 }}>
                <div style={buttonStyle} onClick={toggleView}>
                    {showBackView ? "ORBIT VIEW" : "REAR VIEW"}
                </div>
                {!showBackView && (
                    <div
                        style={{ ...buttonStyle, marginTop: 10 }}
                        onClick={() => setAutoRotate((p) => !p)}
                    >
                        {autoRotate ? "STOP ROTATION" : "LANCER ROTATION"}
                    </div>
                )}
            </div>
        </>
    );
}

const buttonStyle: React.CSSProperties = {
    background: "rgba(0,0,0,0.6)",
    color: "white",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    userSelect: "none",
    fontSize: "14px",
};
