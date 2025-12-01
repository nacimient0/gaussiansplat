// @ts-nocheck
"use client";

import * as pc from "playcanvas";
import { Application, Entity } from "@playcanvas/react";
import { Camera, GSplat, Script, Environment, Render } from "@playcanvas/react/components";
import { OrbitControls } from "@playcanvas/react/scripts";
import { useSplat, useAsset } from "@playcanvas/react/hooks";
import React, { useEffect, useMemo, useRef, useState } from "react";
import LerpAndSlerpCamera from "../scripts/LerpAndSlerpCamera";
import { SimpleAutoRotator } from "../scripts/SimpleAutoRotator";
import HotspotScript from "../scripts/HotspotScript";
import FPSCounterScript from "../scripts/FPSCounterScript";
import Credits from "../components/Credits";
import Fullscreen from "../components/Fullscreen";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
                backgroundImage: "url('ifactory/bg-ifactory.jpg')",
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
    const { asset, loading } = useSplat("/ifactory/scene-ifactory.sog");
    const sky = useAsset("/ifactory/bg-ifactory.webp", "texture");
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

            <Entity name="hotspot1" position={[0, 1, 0]} scale={[0.05, 0.05, 0.05]}>
                <Render type='sphere' />
                <Script
                    script={HotspotScript}
                    url="https://google.com"
                    hoverRadius={15}
                />
            </Entity>

            <Entity name="hotspot2" position={[0, 1, 0.5]} scale={[0.05, 0.05, 0.05]}>
                <Render type='sphere' />
                <Script
                    script={HotspotScript}
                    url="https://youtube.com"
                    hoverRadius={15}
                />
            </Entity>

            {/* 🎯 FPS Counter */}
            <Entity name="fps-counter">
                <Script
                    script={FPSCounterScript}
                />
            </Entity>
        </>
    );
});
SplatScene.displayName = "SplatScene";

/* ------------------------ Main ------------------------ */
export default function Ifactory() {
    const cameraRef = useRef(null);
    const orbitRef = useRef(null);
    const pdfRef = useRef(null);

    const POS_A = [-1.35, 0.15, 1.8];
    const POS_B = [-3.5, 1.75, 0];
    const DURATION = 5.0;

    const [at, setAt] = useState("B");
    const [trigger, setTrigger] = useState(0);
    const [autoRotate, setAutoRotate] = useState(false);
    const [hoveredUrl, setHoveredUrl] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

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

    useEffect(() => {
        const handleHover = (e) => {
            setHoveredUrl(e.detail.url);
            setTooltipPos({ x: e.detail.x, y: e.detail.y });
        };

        const handleUnhover = () => {
            setHoveredUrl(null);
        };

        window.addEventListener('hotspot-hover', handleHover);
        window.addEventListener('hotspot-unhover', handleUnhover);

        return () => {
            window.removeEventListener('hotspot-hover', handleHover);
            window.removeEventListener('hotspot-unhover', handleUnhover);
        };
    }, []);

    const downloadPDF = () => {
        const input = pdfRef.current;
        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("l", "mm", "a4", true);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = (pdfHeight - imgHeight * ratio) / 2;
            pdf.addImage(
                imgData,
                "PNG",
                imgX,
                imgY,
                imgWidth * ratio,
                imgHeight * ratio
            );
            pdf.save(`ifactory.pdf`);
        });
    };

    const goToA = () => {
        if (at === "A") return;
        console.log("➡️ Go vers A");
        setTrigger(Date.now());
        setAt("transition");
        setTimeout(() => setAt("A"), DURATION * 1000);
    };

    const goToB = () => {
        if (at === "B") return;
        console.log("⬅️ Go vers B");
        setTrigger(Date.now());
        setAt("transition");
        setTimeout(() => setAt("B"), DURATION * 1000);
    };

    const toggleAutoRotate = () => {
        setAutoRotate((prev) => {
            const next = !prev;
            console.log(
                `[UI] toggleAutoRotate -> ${next ? "PLAY (on)" : "STOP (off)"}`
            );
            return next;
        });
    };

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
                        alpha: false,
                    }}
                >
                    <Entity name="pointA" position={POS_A} />
                    <Entity name="pointB" position={POS_B} />

                    <Entity name="camera" ref={cameraRef} position={POS_B}>
                        <Camera fov={62} clearColor="black" />

                        <OrbitControls
                            ref={orbitRef}
                            distance={2.25}
                            distanceMin={0.25}
                            distanceMax={2.25}
                            pitchAngleMin={7}
                            pitchAngleMax={50}
                            inertiaFactor={0.15}
                            enabled={!autoRotate}
                            mouse={{ pan: false }}
                            touch={{ pan: false }}
                        />

                        <Script
                            script={SimpleAutoRotator}
                            speed={15}
                            pitchSpeed={0}
                            pitchAmount={0}
                            startDelay={0}
                            startFadeInTime={0}
                            enabledState={autoRotate}
                        />

                        <Script
                            script={LerpAndSlerpCamera}
                            pointAName="pointA"
                            pointBName="pointB"
                            duration={5.0}
                            trigger={trigger}
                            lookAtX={0}
                            lookAtY={0}
                            lookAtZ={0}
                            fovA={62}
                            fovB={62}
                        />
                    </Entity>

                    {splatOnce}
                </Application>

                {hoveredUrl && (
                    <div
                        style={{
                            position: "absolute",
                            left: tooltipPos.x + 15,
                            top: tooltipPos.y - 30,
                            background: "rgba(0, 0, 0, 0.8)",
                            color: "white",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            fontSize: "14px",
                            pointerEvents: "none",
                            zIndex: 10000,
                            whiteSpace: "nowrap",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                        }}
                    >
                        {hoveredUrl}
                    </div>
                )}
            </div>

            <button
                className="absolute top-18 left-4 z-[1000] p-3 rounded-full md:top-20"
                onClick={downloadPDF}
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

            <div className="fixed bottom-0 left-0 w-full bg-gradient-to-b from-transparent to-black h-[10vh] p-8 z-[1000]">
                <Credits />
                <div className="flex items-center justify-center h-full gap-3 text-white text-3xl">
                    {at !== "B" && (
                        <button
                            onClick={goToB}
                            className="hover:scale-110 transition-transform"
                            disabled={at === "transition"}
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
                    )}

                    <button
                        onClick={toggleAutoRotate}
                        className="hover:scale-110 transition-transform"
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

                    {at !== "A" && (
                        <button
                            onClick={goToA}
                            className="hover:scale-110 transition-transform"
                            disabled={at === "transition"}
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
                    )}
                </div>
            </div>
        </>
    );
}