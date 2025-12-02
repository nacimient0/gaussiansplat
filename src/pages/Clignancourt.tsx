// @ts-nocheck
"use client";

import * as pc from "playcanvas";
import { Application, Entity } from "@playcanvas/react";
import { Camera, GSplat, Script } from "@playcanvas/react/components";
import { OrbitControls } from "@playcanvas/react/scripts";
import { useSplat } from "@playcanvas/react/hooks";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Credits from "../components/Credits";
import FPSCounterScript from "../scripts/FPSCounterScript";
import SimpleAutoRotator from "../scripts/SimpleAutoRotator";
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
    const { asset, loading } = useSplat("/clignancourt/clignancourt.sog");
    const progress = loading ? 0 : 1;

    if (!asset) return <Loader progress={progress} />;

    return (
        <>

            <Loader progress={progress} />
            <Entity name="splat" position={[0, 0, 0]} rotation={[180, -3, 0]}>
                <GSplat asset={asset} />
            </Entity>

            {/* 🎯 FPS Counter */}
            {/* <Entity name="fps-counter">
                <Script script={FPSCounterScript} />
            </Entity> */}
        </>
    );
});
SplatScene.displayName = "SplatScene";

/* ------------------------ Main ------------------------ */
export default function Clignancourt() {
    const orbitRef = useRef(null);
    const [autoRotate, setAutoRotate] = useState(false);
    const pdfRef = useRef(null);

    const splatOnce = useMemo(() => <SplatScene />, []);

    const toggleAutoRotate = () => {
        setAutoRotate((prev) => {
            const next = !prev;
            console.log(
                `[UI] toggleAutoRotate -> ${next ? "PLAY (on)" : "STOP (off)"}`
            );
            return next;
        });
    };

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
            pdf.save(`test.pdf`);
        });
    };

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
                    {/* 📷 Camera avec OrbitControls et AutoRotator */}
                    <Entity name="camera" position={[0.75, 1, -1.25]}>
                        <Camera fov={62} clearColor="black" />

                        <OrbitControls
                            ref={orbitRef}
                            distance={4}
                            distanceMin={0.25}
                            distanceMax={8}
                            pitchAngleMin={9}
                            pitchAngleMax={50}
                            inertiaFactor={0.15}
                            enabled={!autoRotate}
                            mouse={{ pan: false }}
                            touch={{ pan: false }}
                        />

                        {/* 🔄 AutoRotator */}
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

                    {/* 🎯 Splat Scene */}
                    {splatOnce}
                </Application>
            </div>

            {/* Bouton PDF */}
            <button
                className="button-controls absolute top-18 left-4 z-[1000] p-3 rounded-full md:top-20"
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

            {/* 🎨 UI Controls */}
            <div className="fixed bottom-0 left-0 w-full bg-gradient-to-b from-transparent to-black h-[10vh] p-8 z-[1000]">
                <Credits />

                <div className="flex items-center justify-center h-full gap-3 text-white text-3xl">
                    <button
                        onClick={toggleAutoRotate}
                        className="button-controls hover:scale-110 transition-transform"
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
                </div>
            </div>
        </>
    );
}