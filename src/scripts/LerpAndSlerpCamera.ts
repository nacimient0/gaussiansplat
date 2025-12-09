import { Script, Entity, Vec3 } from "playcanvas";

export class LerpAndSlerpCamera extends Script {
    static scriptName = "LerpAndSlerpCamera"; pointNames: string[] = [];
    duration = 2.0;
    lookAtX = 0;
    lookAtY = 0;
    lookAtZ = 0;
    fovStart = 55;
    fovEnd = 55;

    private _points: Entity[] = [];
    private _currentIndex = 0;
    private _targetIndex = 0;
    private _time = 0;
    private _active = false;
    private _orbit: unknown = null;
    private _startPos = new Vec3();
    private _endPos = new Vec3();
    private _startFov = 55;
    private _endFov = 55;
    initialize() {
        console.log("[LerpAndSlerpCamera] Initialize avec", this.pointNames.length, "points");

        setTimeout(() => {
            this._grabPoints();

            if (this._points.length > 0) {
                console.log("[LerpAndSlerpCamera] Position initiale:", this._points[0].getPosition());
                this.entity.setPosition(this._points[0].getPosition());
                this.entity.lookAt(this.lookAtX, this.lookAtY, this.lookAtZ);
            } else {
                console.error("[LerpAndSlerpCamera] AUCUN POINT TROUVE!");
            }

            const script = this.entity.script as unknown as Record<string, unknown>;
            this._orbit = script?.orbitCamera ?? script?.orbitControls ?? null;
            console.log("[LerpAndSlerpCamera] OrbitControls:", this._orbit ? "trouve" : "non trouve");
        }, 100);
    }
    private _grabPoints() {
        const root = this.app?.root;
        if (!root) return;

        this._points = this.pointNames
            .map(name => {
                const point = root.findByName(name) as Entity;
                if (!point) console.warn("[LerpAndSlerpCamera] Point non trouve:", name);
                return point;
            })
            .filter(p => p !== null);

        console.log("[LerpAndSlerpCamera]", this._points.length, "/", this.pointNames.length, "points trouves");
    } private _ease(t: number) {
        // Easing smoothstep plus fluide
        return t * t * t * (t * (t * 6 - 15) + 10); // smootherstep
    } goToPoint(index: number) {
        if (this._points.length === 0) {
            console.error("[LerpAndSlerpCamera] Impossible: aucun point!");
            return;
        }

        if (index < 0 || index >= this._points.length) {
            console.warn("[LerpAndSlerpCamera] Index invalide:", index);
            return;
        }

        if (index === this._currentIndex) {
            console.log("[LerpAndSlerpCamera] Deja au point", index);
            return;
        } console.log("[LerpAndSlerpCamera] Transition", this._currentIndex, "->", index);

        // ✅ NE PLUS désactiver OrbitControls (ancien code fonctionnait sans)
        // On laisse OrbitControls actif et on le synchronise en continu

        // Sauvegarder la position ET le FOV actuels de la caméra
        this._startPos.copy(this.entity.getPosition());
        this._endPos.copy(this._points[index].getPosition());

        const cam = this.entity.camera;
        if (cam) {
            this._startFov = cam.fov;
            // Le FOV cible sera défini via les attributs du script ou par défaut
            this._endFov = this.fovEnd;
        }

        console.log("[LerpAndSlerpCamera] Start:", this._startPos, "FOV:", this._startFov);
        console.log("[LerpAndSlerpCamera] End:", this._endPos, "FOV:", this._endFov);

        this._targetIndex = index;
        this._time = 0;
        this._active = true;
    }

    goToNext() {
        this.goToPoint((this._currentIndex + 1) % this._points.length);
    }

    goToPrevious() {
        this.goToPoint((this._currentIndex - 1 + this._points.length) % this._points.length);
    }

    getCurrentIndex(): number {
        return this._currentIndex;
    }

    getTotalPoints(): number {
        return this._points.length;
    }

    isTransitioning(): boolean {
        return this._active;
    }
    update(dt: number) {
        if (this._points.length === 0) this._grabPoints();
        if (this._points.length === 0) return;
        if (!this._active) return;

        this._time += dt;
        const t = Math.min(1, this._time / Math.max(0.001, this.duration));
        const k = this._ease(t);

        // Log progression
        if (Math.floor(this._time * 2) !== Math.floor((this._time - dt) * 2)) {
            console.log(`[LerpAndSlerpCamera] ${(t * 100).toFixed(0)}%`);
        } const curPos = new Vec3().lerp(this._startPos, this._endPos, k);
        this.entity.setPosition(curPos);
        this.entity.lookAt(this.lookAtX, this.lookAtY, this.lookAtZ);

        // Animer le FOV de manière fluide
        const cam = this.entity.camera;
        if (cam) {
            cam.fov = this._startFov + (this._endFov - this._startFov) * k;
        }
        // ✅ SYNCHRONISER OrbitControls EN CONTINU pendant l'animation
        if (this._orbit && typeof this._orbit === 'object') {
            const orbit = this._orbit as Record<string, unknown>;
            const pivot = new Vec3(this.lookAtX, this.lookAtY, this.lookAtZ);
            const dir = new Vec3().sub2(pivot, curPos);
            const distance = dir.length();

            if (distance > 1e-6) {
                dir.normalize();
                const RAD2DEG = 180 / Math.PI;
                const yaw = Math.atan2(-dir.x, -dir.z) * RAD2DEG;
                const pitch = Math.asin(dir.y) * RAD2DEG;

                // Synchroniser les paramètres à chaque frame SANS écraser les inputs utilisateur
                orbit.yaw = yaw;
                orbit.pitch = pitch;
                if ("distance" in orbit) orbit.distance = distance;
                if ("pivotPoint" in orbit) orbit.pivotPoint = pivot;

                // ✅ APPELER update(0) pour forcer la synchronisation
                if (typeof orbit.update === 'function') {
                    orbit.update(0);
                }
            }
        } if (t >= 1) {
            this._active = false;
            this._time = 0;
            this._currentIndex = this._targetIndex;

            // ✅ PLUS de réactivation : OrbitControls était resté actif tout du long
            console.log("[LerpAndSlerpCamera] Arrive au point", this._currentIndex);
        }
    }
}

export default LerpAndSlerpCamera;
