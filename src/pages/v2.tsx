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
  const sky = useAsset("/V2/bg-v2.webp", "texture");
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
export default function V2() {
  const cameraRef = useRef(null);
  const orbitRef = useRef(null);
  const pdfRef = useRef(null);

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) {
        e.preventDefault();
      }
    };

    const pdf = pdfRef.current;

    if (pdf) {
      pdf.addEventListener('wheel', handleWheel);
      pdf.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (pdf) {
        pdf.removeEventListener('wheel', handleWheel);
        pdf.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [pdfRef]);

  const downloadPDF = () => {
    const input = pdfRef.current;
    html2canvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'mm', 'a4', true);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = (pdfHeight - imgHeight * ratio) / 2;
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save(`TEST.pdf`);
      })
  }

  // Positions fixes
  const POS_A = [-1.35, 0.15, 1.8];
  const POS_B = [-3.5, 1.75, 0];
  const DURATION = 5.0;

  // État caméra
  const [at, setAt] = useState("B");
  const [trigger, setTrigger] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);

  // 🔄 Aller vers A
  const goToA = () => {
    if (at === "A") return;
    console.log("➡️ Go vers A");
    setTrigger(Date.now());
    setAt("transition");
    setTimeout(() => setAt("A"), DURATION);
  };

  // 🔙 Aller vers B
  const goToB = () => {
    if (at === "B") return;
    console.log("⬅️ Go vers B");
    setTrigger(Date.now());
    setAt("transition");
    setTimeout(() => setAt("B"), DURATION);
  };

  const toggleAutoRotate = () => setAutoRotate((p) => !p);
  const splatOnce = useMemo(() => <SplatScene />, []);

  return (
    <>
      <Fullscreen />
      <div ref={pdfRef} tabIndex={0} style={{ width: "100vw", height: "100vh", outline: "none", position: "relative", overflow: "hidden" }}>

        <Application
          graphicsDeviceOptions={{
            antialias: true,
            preserveDrawingBuffer: true,
            preferWebGl2: true
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

            <Script
              script={LerpAndSlerpCamera}
              pointAName="pointA"
              pointBName="pointB"
              duration={DURATION}
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
      </div>

      <button className="absolute top-20 left-4 z-[9999] p-3 rounded-full" onClick={downloadPDF}>
        <svg xmlns="http://www.w3.org/2000/svg" height={30} width={30} viewBox="0 -960 960 960"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" /></svg>
      </button>
      <div className="absolute top-4 right-4 z-9999 text-white font-bold text-sm p-2 bg-black/80 rounded-md backdrop-blur-sm shadow-md">
        <span>IFACTORY - Z ARCHITECTURE</span>
      </div>

      <div className="z-9999 absolute bottom-0 w-full bg-gradient-to-b from-[transparent] to-black h-[8vh] p-8">
        <Credits />
        <div className="flex items-center justify-center h-full gap-3 text-white text-3xl">
          {at !== "B" && (
            <button
              onClick={goToB}
              className="hover:scale-110 transition-transform"
              disabled={at === "transition"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height={40} width={40} viewBox="0 -960 960 960" fill="black"><path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z" /></svg>
            </button>
          )}

          <button
            onClick={toggleAutoRotate}
            className="hover:scale-110 transition-transform"
          >
            {autoRotate ? <svg xmlns="http://www.w3.org/2000/svg" height={40} width={40} viewBox="0 -960 960 960" fill="black"><path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" height={40} width={40} viewBox="0 -960 960 960" fill="black"><path d="M320-200v-560l440 280-440 280Z" /></svg>}
          </button>

          {at !== "A" && (
            <button
              onClick={goToA}
              className="hover:scale-110 transition-transform"
              disabled={at === "transition"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height={40} width={40} viewBox="0 -960 960 960" fill="black"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" /></svg>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
