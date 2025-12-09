// @ts-nocheck
"use client";

import * as pc from "playcanvas";
import { Application, Entity } from "@playcanvas/react";
import { Camera, GSplat, Script, Environment } from "@playcanvas/react/components";
import { OrbitControls } from "@playcanvas/react/scripts";
import { useSplat, useAsset } from "@playcanvas/react/hooks";
import React, { useEffect, useMemo, useRef, useState } from "react";
import LerpAndSlerpCamera from "../scripts/LerpAndSlerpCamera";
import { SimpleAutoRotator } from "../scripts/SimpleAutoRotator";
import Credits from "../components/Credits";
import Fullscreen from "../components/Fullscreen";
import html2canvas from "html2canvas";

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
        <div
            style={{
                backgroundImage: "url('bg.jpg')",
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
        .loader-circle{width:80px;height:80px;border-radius:50%;display:inline-block;border-top:8px solid #fff;border-right:8px solid transparent;animation:spin 1s linear infinite;position:relative}
        .loader-circle::after{content:"";position:absolute;left:0;top:0;width:80px;height:80px;border-radius:50%;border-bottom:8px solid red;border-left:8px solid transparent}
        @keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
      `}</style>
            <p
                style={{
                    color: "white",
                    marginTop: 20,
                    fontSize: 30,
                    textShadow: "0 0 20px black",
                    textAlign: "center",
                }}
            >
                Chargement en cours...
            </p>
        </div>
    );
}

/* ------------------------ Splat Scene ------------------------ */
const SplatScene = React.memo(() => {
    const { asset, loading } = useSplat("/homair/homair.sog");
    const sky = useAsset("/homair/bg-homair.webp", "texture");
    const progress = loading ? 0 : 1;

    if (!asset) return <Loader progress={progress} />;

    return (
        <>
            <Loader progress={progress} />

            <Entity name="splat" position={[0, 0, 0]} rotation={[180, -90, 0]}>
                <GSplat asset={asset} />
            </Entity>

            <Entity name="skybox">
                <Environment skybox={sky.asset} skyboxIntensity={1.25} exposure={1} />
            </Entity>
        </>
    );
});
SplatScene.displayName = "SplatScene";

/* ------------------------ Main ------------------------ */
export default function Homair() {
    const cameraRef = useRef(null);
    const cameraScriptRef = useRef(null);
    const orbitRef = useRef(null);
    const pdfRef = useRef(null);

    // Definition de tous vos points de camera
    const cameraPoints = [
        { name: "point0", position: [-1.35, 0.15, 1.8], fov: 55 },
        { name: "point1", position: [0, 0.65, 1.8], fov: 55 },
        { name: "point2", position: [2, 0.8, 1], fov: 55 },
        { name: "point3", position: [1, 1.3, -1.5], fov: 55 },
        { name: "point4", position: [-2, 0.15, -0.2], fov: 55 },
    ];

    const DURATION = 2.0;

    // État caméra logique UI
    const [currentPoint, setCurrentPoint] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Autorotate ON/OFF
    const [autoRotate, setAutoRotate] = useState(false);

    // PDF block zoom prevention etc.
    useEffect(() => {
        const handleWheel = (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
            }
        };

        const handleKeyDown = (e) => {
            if (
                (e.ctrlKey || e.metaKey) &&
                (e.key === "+" || e.key === "-" || e.key === "=")
            ) {
                e.preventDefault();
            }
        };

        const pdf = pdfRef.current;
        if (pdf) {
            pdf.addEventListener("wheel", handleWheel);
            pdf.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            if (pdf) {
                pdf.removeEventListener("wheel", handleWheel);
                pdf.removeEventListener("keydown", handleKeyDown);
            }
        };
    }, [pdfRef]);

    // Capture d'écran en image PNG
    const downloadImage = () => {
        const input = pdfRef.current;
        html2canvas(input).then((canvas) => {
            // Convertir le canvas en image
            const imgData = canvas.toDataURL("image/png");

            // Créer un nom de fichier avec date lisible (YYYYMMDD_HHMMSS)
            const now = new Date();
            const dateStr = now.toISOString().slice(0, 19).replace(/[-:T]/g, '').slice(0, 8); // YYYYMMDD
            const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, ''); // HHMMSS
            const filename = `homair_${dateStr}_${timeStr}.png`;

            // Créer un lien de téléchargement
            const link = document.createElement("a");
            link.href = imgData;
            link.download = filename;
            link.click();
        });
    };

    // Aller vers un point specifique
    const goToPoint = (index: number) => {
        if (cameraScriptRef.current) {
            cameraScriptRef.current.goToPoint(index);
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentPoint(index);
                setIsTransitioning(false);
            }, DURATION * 1000);
        }
    };

    // Aller au point suivant (navigation circulaire)
    const goNext = () => {
        if (cameraScriptRef.current && !isTransitioning) {
            console.log("[UI] Go to next point");
            cameraScriptRef.current.goToNext();
            setIsTransitioning(true);
            setTimeout(() => {
                const nextIndex = (currentPoint + 1) % cameraPoints.length;
                setCurrentPoint(nextIndex);
                setIsTransitioning(false);
            }, DURATION * 1000);
        }
    };

    // Aller au point precedent (navigation circulaire)
    const goPrevious = () => {
        if (cameraScriptRef.current && !isTransitioning) {
            console.log("[UI] Go to previous point");
            cameraScriptRef.current.goToPrevious();
            setIsTransitioning(true);
            setTimeout(() => {
                const prevIndex = (currentPoint - 1 + cameraPoints.length) % cameraPoints.length;
                setCurrentPoint(prevIndex);
                setIsTransitioning(false);
            }, DURATION * 1000);
        }
    };

    // Toggle autorotate
    const toggleAutoRotate = () => {
        setAutoRotate((prev) => {
            const next = !prev;
            return next;
        });
    };

    // Garde la scène splat mémoisée
    const splatOnce = useMemo(() => <SplatScene />, []);

    return (
        <>
            <Fullscreen />

            <div
                ref={pdfRef}
                tabIndex={0}
                style={{
                    width: "100vw",
                    height: "100vh",
                    outline: "none",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <Application
                    graphicsDeviceOptions={{
                        powerPreference: "high-performance",
                        antialias: true,
                        preserveDrawingBuffer: true,
                        preferWebGl2: true,
                    }}
                >
                    {/* Creer toutes les entites de points */}
                    {cameraPoints.map((point) => (
                        <Entity
                            key={point.name}
                            name={point.name}
                            position={point.position}
                        />
                    ))}

                    {/* camera - Position initiale au point0 */}
                    <Entity name="camera" ref={cameraRef} position={cameraPoints[0].position}>
                        <Camera fov={cameraPoints[0].fov} clearColor="black" />
                        <Script
                            ref={cameraScriptRef}
                            script={LerpAndSlerpCamera}
                            pointNames={cameraPoints.map(p => p.name)}
                            duration={DURATION}
                        />

                        {/* OrbitControls toujours monte, mais desactive par le script pendant transition */}
                        <OrbitControls
                            ref={orbitRef}
                            distance={2}
                            distanceMin={1.5}
                            distanceMax={5}
                            pitchAngleMin={15}
                            pitchAngleMax={50}
                            inertiaFactor={0.10}
                            enabled={!autoRotate}
                            mouse={{
                                distanceSensitivity: 0.5
                            }}
                            touch={{
                                pan: false,
                                distanceSensitivity: 0.5
                            }}
                        />

                        {/* AutoRotator TOUJOURS monte maintenant */}
                        <Script
                            script={SimpleAutoRotator}
                            speed={15}
                            pitchSpeed={0}
                            pitchAmount={0}
                            startDelay={0}
                            startFadeInTime={0}
                            enabledState={autoRotate}
                        />
                    </Entity>

                    {splatOnce}
                </Application>
            </div>            {/* Bouton Image */}
            <button
                className="button-controls absolute top-18 left-4 z-[1000] p-3 rounded-full md:top-20"
                onClick={downloadImage}
                title="Télécharger une capture d'écran"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 -960 960 960"
                    fill="black"
                    className="w-[20px] h-[20px] md:w-[30px] md:h-[30px]"
                >
                    <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
                </svg>
            </button>

            {/* HUD bas */}
            <div className="fixed bottom-0 left-0 w-full bg-gradient-to-b from-transparent to-black h-[10vh] p-8 z-[1000]">
                <Credits />
                <div className="flex items-center justify-center flex-col h-full gap-2 text-white text-3xl">
                    <div className="flex gap-2">

                        {/* Bouton Precedent - TOUJOURS visible (navigation circulaire) */}
                        <button
                            onClick={goPrevious}
                            className="button-controls hover:scale-110 transition-transform disabled:opacity-50"
                            disabled={isTransitioning}
                            title={`Aller au point ${(currentPoint - 1 + cameraPoints.length) % cameraPoints.length}`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height={40}
                                width={40}
                                viewBox="0 -960 960 960"
                            >
                                <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z" />
                            </svg>
                        </button>

                        {/* bouton play/pause autorotate */}
                        <button
                            onClick={toggleAutoRotate}
                            className="button-controls hover:scale-110 transition-transform"
                            title={autoRotate ? "Arrêter la rotation" : "Démarrer la rotation"}
                        >
                            {autoRotate ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height={40}
                                    width={40}
                                    viewBox="0 -960 960 960"
                                >
                                    <path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z" />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height={40}
                                    width={40}
                                    viewBox="0 -960 960 960"
                                >
                                    <path d="M320-200v-560l440 280-440 280Z" />
                                </svg>
                            )}
                        </button>

                        {/* Bouton Suivant - TOUJOURS visible (navigation circulaire) */}
                        <button
                            onClick={goNext}
                            className="button-controls hover:scale-110 transition-transform disabled:opacity-50"
                            disabled={isTransitioning}
                            title={`Aller au point ${(currentPoint + 1) % cameraPoints.length}`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height={40}
                                width={40}
                                viewBox="0 -960 960 960"
                            >
                                <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
                            </svg>
                        </button>
                    </div>

                    {/* Indicateur de points (optionnel) */}
                    <div className="flex gap-2">
                        {cameraPoints.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToPoint(index)}
                                disabled={isTransitioning || currentPoint === index}
                                className={`w-3 h-3 rounded-full transition-all  ${currentPoint === index
                                    ? "bg-red-500 scale-125"
                                    : "bg-gray-500 hover:bg-gray-300 border-1 border-white cursor-pointer"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}