import { Application, Entity } from "@playcanvas/react";
import { Camera, GSplat, Environment } from "@playcanvas/react/components";
import { OrbitControls } from "@playcanvas/react/scripts";
import { useSplat, useAsset } from "@playcanvas/react/hooks";
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
            box-shadow: 0 0 2px black;
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
            box-shadow: 0 0 2px black;
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
    const sky = useAsset("/V1/sunset-v1.jpg", "texture");
    const splat = useSplat("/V2/skull.sog");

    const assets = [sky, splat];
    const loadedCount = assets.filter((a) => !a.loading && a.asset).length;
    const progress = loadedCount / assets.length;

    const [activeCam, setActiveCam] = useState<"cam1" | "cam2">("cam1");

    return (
        <>
            <Loader progress={progress} />

            {/* Caméra 1 */}
            <Entity name="camera1" position={[90, 60, 0]}>
                <Camera fov={65} enabled={activeCam === "cam1"} />
                <OrbitControls
                    distance={3.5}
                    distanceMin={2}
                    distanceMax={20}
                    pitchAngleMin={15}
                    mouse={{ orbitSensitivity: 0.3, distanceSensitivity: 0.6, pan: false }}
                    touch={{ orbitSensitivity: 0.3, distanceSensitivity: 0.6, pan: false }}
                />
            </Entity>

            {/* Caméra 2 */}
            <Entity name="camera2" position={[0, 150, 200]}>
                <Camera fov={75} enabled={activeCam === "cam2"} />
                <OrbitControls
                    distance={5}
                    distanceMin={2}
                    distanceMax={50}
                    pitchAngleMin={5}
                    mouse={{ orbitSensitivity: 0.3, distanceSensitivity: 0.6, pan: false }}
                    touch={{ orbitSensitivity: 0.3, distanceSensitivity: 0.6, pan: false }}
                />
            </Entity>

            <div
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10000,
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
                    {activeCam === "cam1" ? "Caméra 2" : "Caméra 1"}
                </button>
            </div>

            {/* Skybox */}
            {sky.asset && (
                <Entity name="skybox">
                    <Environment skybox={sky.asset} skyboxIntensity={1} exposure={1} />
                </Entity>
            )}

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
        <Application>
            <Scene />
        </Application>
    );
}

export default V2;
