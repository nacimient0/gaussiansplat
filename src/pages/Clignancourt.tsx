// @ts-nocheck
"use client";

import * as pc from "playcanvas";
import { Application, Entity } from "@playcanvas/react";
import { Camera, GSplat, Script } from "@playcanvas/react/components";
import { OrbitControls } from "@playcanvas/react/scripts";
import { useSplat } from "@playcanvas/react/hooks";
import React, { useMemo, useRef, useState } from "react";
import Credits from "../components/Credits";
import FPSCounterScript from "../scripts/FPSCounterScript";
import SimpleAutoRotator from "../scripts/SimpleAutoRotator";

/* ------------------------ Splat Scene ------------------------ */
const SplatScene = React.memo(() => {
    const { asset, loading } = useSplat("/clignancourt/clignancourt.sog");

    if (!asset) return null;

    return (
        <>
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

    return (
        <>
            <div
                style={{
                    width: "100vw",
                    height: "100vh",
                    position: "relative",
                    overflow: "hidden",
                    touchAction: "none",
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
                    <Entity name="camera" position={[10, 10, 0]}>
                        <Camera fov={62} clearColor="black" />

                        <OrbitControls
                            ref={orbitRef}
                            distance={8}
                            distanceMin={0.25}
                            distanceMax={15}
                            pitchAngleMin={7}
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

            {/* 🎨 UI Controls */}
            <div className="fixed bottom-0 left-0 w-full bg-gradient-to-b from-transparent to-black h-[10vh] p-8 z-[1000]">
                <Credits />

                <div className="flex items-center justify-center h-full gap-3 text-white text-3xl">
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
                </div>
            </div>
        </>
    );
}