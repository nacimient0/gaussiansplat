// @ts-nocheck

import { Application, Entity } from "@playcanvas/react";
import { Camera, GSplat, Environment, Script  } from "@playcanvas/react/components";
import { OrbitControls } from "@playcanvas/react/scripts";
import { useSplat, useAsset } from "@playcanvas/react/hooks";
import { CameraControls } from 'playcanvas/scripts/esm/camera-controls.mjs'

import { useEffect, useState } from "react";

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
                top: 0,
                left: 0,
                height: "100%",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                zIndex: 9999,
            }}
        >
            <div className="loader-circle" />
            <style>
                {`
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
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
            </style>

            <p
                style={{
                    color: "white",
                    marginTop: "20px",
                    fontSize: "30px",
                    textShadow: "0 0 20px black",
                    textAlign: "center",
                }}
            >
                Chargement en cours...
            </p>
        </div>
    );
}

function Scene() {
    const splat = useSplat("/V2/scene-v2.ply");

    const assets = [splat];
    const loadedCount = assets.filter((a) => !a.loading && a.asset).length;
    const progress = loadedCount / assets.length;

    const [activeCam, setActiveCam] = useState<"cam1" | "cam2">("cam1");

    return (
        <>
            <Loader progress={progress} />

            {/* Caméra 1 */}
            <Entity name="camera1" position={[-180, 60, 280]} >
                <Camera fov={65} enabled={activeCam === "cam1"} clearColor="3C3C3C" />
                <Script script={CameraControls} />
                <OrbitControls
                    distance={2.15}
                    distanceMin={1}
                    distanceMax={3}
                    pitchAngleMin={5}
                    inertiaFactor={0.2}
                    mouse={{ orbitSensitivity: 0.3, distanceSensitivity: 0.6 }}
                    touch={{ orbitSensitivity: 0.3, distanceSensitivity: 0.6 }}
                />
            </Entity>

            {/* Caméra 2 */}
            <Entity name="camera2" position={[-180, 80, 0]}>
                <Camera fov={65} enabled={activeCam === "cam2"} clearColor="3C3C3C" />
                <OrbitControls
                    distance={2}
                    distanceMin={1}
                    distanceMax={3}
                    pitchAngleMin={10}
                    inertiaFactor={0.2}
                    mouse={{ orbitSensitivity: 0.3, distanceSensitivity: 0.6 }}
                    touch={{ orbitSensitivity: 0.3, distanceSensitivity: 0.6 }}
                />
            </Entity>

            <div
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9998,
                    position: "absolute",
                    bottom: 25,
                }}
            >
                <button
                    onClick={() => setActiveCam(activeCam === "cam1" ? "cam2" : "cam1")}
                    style={{
                        padding: "10px 20px",
                        fontSize: "16px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        background: "#4caf50",
                        color: "white",
                        boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                    }}
                >
                    {activeCam === "cam1" ? "Aller à la Caméra 2" : "Aller à la Caméra 1"}
                </button>
            </div>

            {/* Splat */}
            {splat.asset && (
                <Entity name="splat" position={[0, 0, 0]} rotation={[180, -90, 0]}>
                    <GSplat asset={splat.asset} />
                </Entity>
            )}
        </>
    );
}

function V2() {
    return (
        <Application graphicsDeviceOptions={{ antialias: false }}>
            <Scene />
        </Application>
    );
}

export default V2;
