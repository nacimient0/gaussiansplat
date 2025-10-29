"use client";
import { useEffect, useState } from "react";

/**
 * Bouton plein écran pour ton composant V2
 * - Clic pour entrer / quitter le mode plein écran
 * - Affiche automatiquement l’icône correspondante
 * - Compatible avec les navigateurs modernes
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
            className="absolute top-4 left-4 z-[9999] p-3 rounded-full"
            title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
        >
            {isFullscreen ? (
                <svg xmlns="http://www.w3.org/2000/svg" height={30} width={30} fill="black" viewBox="0 -960 960 960"><path d="M240-120v-120H120v-80h200v200h-80Zm400 0v-200h200v80H720v120h-80ZM120-640v-80h120v-120h80v200H120Zm520 0v-200h80v120h120v80H640Z" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" height={30} width={30} fill="black" viewBox="0 -960 960 960"><path d="M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z" /></svg>
            )}
        </button>
    );
}
