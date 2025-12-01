"use client";
import { useEffect, useState } from "react";

/**
 * Bouton plein écran responsive
 * - Icône 20px sur mobile, 30px sur desktop
 * - Toggle fullscreen avec mise à jour automatique de l’état
 */
export default function Fullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const toggleFullscreen = () => {
    const element = document.documentElement;
    if (!document.fullscreenElement) {
      element.requestFullscreen?.().catch(console.error);
    } else {
      document.exitFullscreen?.().catch(console.error);
    }
  };

  return (
    <button
      onClick={toggleFullscreen}
      className="button-controls 
        absolute top-4 left-4 z-[9999]
        p-3 rounded-full
        transition-all duration-200
        hover:bg-gray-200
      "
      title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
    >
      {isFullscreen ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          fill="black"
          className="w-[20px] h-[20px] md:w-[30px] md:h-[30px]"
        >
          <path d="M240-120v-120H120v-80h200v200h-80Zm400 0v-200h200v80H720v120h-80ZM120-640v-80h120v-120h80v200H120Zm520 0v-200h80v120h120v80H640Z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          fill="black"
          className="w-[20px] h-[20px] md:w-[30px] md:h-[30px]"
        >
          <path d="M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z" />
        </svg>
      )}
    </button>
  );
}
