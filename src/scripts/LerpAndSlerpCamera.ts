import { Script, Entity, Vec3, Quat } from "playcanvas";

/**
 * LerpAndSlerpCamera : interpolation fluide entre deux points (A ↔ B)
 * - Lerp position
 * - Slerp rotation (ou lookAt vers un point)
 * - Lerp du FOV
 * - Synchronisation continue avec OrbitControls pendant l’anim
 */
export class LerpAndSlerpCamera extends Script {
  static scriptName = "LerpAndSlerpCamera";

  // Props reçues depuis React
  pointAName = "pointA";
  pointBName = "pointB";
  duration = 1.0;
  trigger = 0;
  lookAtX = NaN;
  lookAtY = NaN;
  lookAtZ = NaN;
  fovA = NaN;
  fovB = NaN;
  fovMid = NaN;

  // internes
  private _a: Entity | null = null;
  private _b: Entity | null = null;
  private _time = 0;
  private _active = false;
  private _forward = true;
  private _lastTrigger = 0;
  private _orbit: any = null;

  initialize() {
    console.log("%c[LerpAndSlerpCamera] ✅ initialize()", "color:cyan");
    this._grabPoints();
    this._lastTrigger = this.trigger ?? 0;

    // Essaie de trouver OrbitControls
    // @ts-expect-error
    this._orbit = this.entity.script?.orbitCamera ?? this.entity.script?.orbitControls ?? null;
    if (this._orbit) console.log("[LerpAndSlerpCamera] OrbitControls trouvé ✅");
    else console.warn("[LerpAndSlerpCamera] ⚠️ OrbitControls non trouvé pour l’instant.");

    // Log les changements d’attributs (debug)
    this.on("attr", (name, value) => {
      if (name === "trigger") {
        console.log("[LerpAndSlerpCamera] trigger modifié depuis React →", value);
      }
    });
  }

  private _grabPoints() {
    const root = this.app?.root;
    if (!root) return;
    this._a = root.findByName(this.pointAName) as Entity;
    this._b = root.findByName(this.pointBName) as Entity;
    if (this._a && this._b) console.log("[LerpAndSlerpCamera] Points A/B trouvés ✅");
  }

  private _ease(t: number) {
    return t * t * (3 - 2 * t); // smoothstep
  }

  private _hasFov(v: number) {
    return Number.isFinite(v);
  }

  update(dt: number) {
    if (!this._a || !this._b) this._grabPoints();
    if (!this._a || !this._b) return;

    // Détection du trigger
    if ((this.trigger ?? 0) !== this._lastTrigger) {
      console.log(
        `[LerpAndSlerpCamera] ▶️ Nouveau trigger détecté (${this._lastTrigger} → ${this.trigger})`
      );
      this._lastTrigger = this.trigger ?? 0;
      this._time = 0;
      this._active = true;
      this._forward = !this._forward; // alterne la direction
      console.log(
        `[LerpAndSlerpCamera] 🚀 Démarrage du lerp ${this._forward ? "A→B" : "B→A"} (durée ${this.duration}s)`
      );
    }

    if (!this._active) return;

    const dur = Math.max(0.0001, this.duration);
    this._time += dt;
    const t = Math.min(1, this._time / dur);
    const k = this._ease(t);

    // --- Position ---
    const startPos = this._forward ? this._a.getPosition() : this._b.getPosition();
    const endPos = this._forward ? this._b.getPosition() : this._a.getPosition();
    const curPos = new Vec3().lerp(startPos, endPos, k);
    this.entity.setPosition(curPos);

    // --- Rotation ---
    const useLookAt =
      Number.isFinite(this.lookAtX) &&
      Number.isFinite(this.lookAtY) &&
      Number.isFinite(this.lookAtZ);

    if (useLookAt) {
      this.entity.lookAt(this.lookAtX, this.lookAtY, this.lookAtZ);
    } else {
      const startRot = this._forward ? this._a.getRotation() : this._b.getRotation();
      const endRot = this._forward ? this._b.getRotation() : this._a.getRotation();
      const q = new Quat().slerp(startRot, endRot, k);
      this.entity.setRotation(q);
    }

    // --- FOV ---
    const cam = (this.entity as any).camera as { fov: number } | undefined;
    if (cam && this._hasFov(this.fovA) && this._hasFov(this.fovB)) {
      const startF = this._forward ? this.fovA : this.fovB;
      const endF = this._forward ? this.fovB : this.fovA;
      cam.fov = startF + (endF - startF) * k;
    }

    // --- Synchronisation live OrbitControls ---
    if (this._orbit) {
      const pivot = new Vec3(
        Number.isFinite(this.lookAtX) ? this.lookAtX : 0,
        Number.isFinite(this.lookAtY) ? this.lookAtY : 0,
        Number.isFinite(this.lookAtZ) ? this.lookAtZ : 0
      );
      const RAD2DEG = 180 / Math.PI;
      const dir = new Vec3().sub2(pivot, curPos);
      const distance = dir.length();
      if (distance > 1e-6) {
        dir.normalize();
        const yaw = Math.atan2(-dir.x, -dir.z) * RAD2DEG;
        const pitch = Math.asin(dir.y) * RAD2DEG;

        this._orbit.yaw = yaw;
        this._orbit.pitch = pitch;
        if ("distance" in this._orbit) this._orbit.distance = distance;
        if ("pivotPoint" in this._orbit) this._orbit.pivotPoint = pivot;

        if (typeof this._orbit.update === "function") this._orbit.update(0);
      }
    }

    if (this.app?.frame % 30 === 0) {
      console.log(
        `[LerpAndSlerpCamera] Frame ${this.app.frame} t=${t.toFixed(2)} pos=(${curPos
          .x.toFixed(2)},${curPos.y.toFixed(2)},${curPos.z.toFixed(2)})`
      );
    }

    // --- Fin du lerp ---
    if (t >= 1) {
      this._active = false;
      this._time = 0;
      this.entity.setPosition(endPos);
      if (useLookAt) this.entity.lookAt(this.lookAtX, this.lookAtY, this.lookAtZ);
      this.entity.syncHierarchy?.();
      console.log(
        `%c[LerpAndSlerpCamera] ✅ Fin du LERP ${this._forward ? "A→B" : "B→A"}`,
        "color:lime"
      );
    }
  }
}

export default LerpAndSlerpCamera;
