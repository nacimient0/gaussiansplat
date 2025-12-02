// @ts-nocheck

import { Script, Vec3, Color, StandardMaterial } from "playcanvas";

export class HotspotScript extends Script {
    static scriptName = "HotspotScript";

    url = "";
    hoverRadius = 50;
    normalColor = new Color(0, 0, 0);
    normalEmissive = new Color(0.3, 0.3, 0.3);
    hoverEmissive = new Color(1, 0, 0);

    private material: StandardMaterial | null = null;
    private isHovered = false;
    private mouseX = 0;
    private mouseY = 0;
    private globalMouseX = 0;
    private globalMouseY = 0;
    private onMouseMove: ((e: MouseEvent) => void) | null = null;
    private onClick: ((e: MouseEvent) => void) | null = null;

    initialize() {
        console.log("[HotspotScript] ✅ initialize");

        this.material = new StandardMaterial();
        this.material.diffuse.copy(this.normalColor);
        this.material.emissive.copy(this.normalEmissive);
        this.material.update();

        if (this.entity.render?.meshInstances?.[0]) {
            this.entity.render.meshInstances[0].material = this.material;
        }

        const canvas = this.app.graphicsDevice.canvas;

        this.onMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
            this.globalMouseX = e.clientX;
            this.globalMouseY = e.clientY;
        };

        this.onClick = (e: MouseEvent) => {
            if (this.isHovered) {
                console.log("[HotspotScript] 🎯 Clic détecté!");
                window.open(this.url, "_blank");
            }
        };

        canvas.addEventListener("mousemove", this.onMouseMove);
        canvas.addEventListener("click", this.onClick);
    }

    update(dt: number) {
        if (!this.material) return;

        const camera = this.app.root.findByName("camera")?.camera;
        if (!camera) return;

        const worldPos = this.entity.getPosition();
        const screenPos = camera.worldToScreen(worldPos);

        const dx = screenPos.x - this.mouseX;
        const dy = screenPos.y - this.mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const wasHovered = this.isHovered;
        this.isHovered = distance < this.hoverRadius;

        // 🎯 Émet les events pour React
        if (this.isHovered && !wasHovered) {
            console.log("[HotspotScript] 🎯 Hover ON - Distance:", distance.toFixed(2));
            this.material.emissive.copy(this.hoverEmissive);
            this.material.update();
            document.body.style.cursor = "pointer";

            // Émet l'event hover avec les coordonnées GLOBALES
            window.dispatchEvent(new CustomEvent('hotspot-hover', {
                detail: { url: this.url, x: this.globalMouseX, y: this.globalMouseY }
            }));
        } else if (!this.isHovered && wasHovered) {
            console.log("[HotspotScript] 🎯 Hover OFF");
            this.material.emissive.copy(this.normalEmissive);
            this.material.update();
            document.body.style.cursor = "default";

            // Émet l'event unhover
            window.dispatchEvent(new CustomEvent('hotspot-unhover'));
        }

        // 🎯 Met à jour la position du tooltip en continu si hover
        if (this.isHovered) {
            window.dispatchEvent(new CustomEvent('hotspot-hover', {
                detail: { url: this.url, x: this.globalMouseX, y: this.globalMouseY }
            }));
        }
    }

    destroy() {
        const canvas = this.app.graphicsDevice.canvas;
        if (this.onMouseMove) canvas.removeEventListener("mousemove", this.onMouseMove);
        if (this.onClick) canvas.removeEventListener("click", this.onClick);
        document.body.style.cursor = "default";
        console.log("[HotspotScript] 🧹 cleanup");
    }
}

export default HotspotScript;