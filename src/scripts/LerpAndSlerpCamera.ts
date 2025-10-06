// scripts/LerpAndSlerpCamera.ts
import { Script, Entity, Vec3, Quat } from "playcanvas";

/**
 * Interpole la caméra entre 2 entités de référence :
 * - position en lerp (world)
 * - rotation en slerp (ou lookAt vers un point si lookAtX/Y/Z sont fournis)
 * - FOV en lerp (fovA <-> fovB) ou "zoom-out" au milieu si fovMid est défini
 *
 * Utilisation côté React :
 * <Script
 *   script={LerpAndSlerpCamera}
 *   pointAName="pointA"
 *   pointBName="pointB"
 *   duration={0.9}
 *   trigger={trigger}   // incrémente pour lancer une anim
 *   lookAtX={0} lookAtY={0} lookAtZ={0} // (optionnel)
 *   fovA={62} fovB={80}                  // (optionnel) A->B élargit le FOV
 *   // OU:
 *   // fovA={62} fovB={62} fovMid={82}  // zoom-out au milieu puis retour
 * />
 */
export class LerpAndSlerpCamera extends Script {
  static scriptName = "LerpAndSlerpCamera";

  // Props mappées par <Script ...props/> (valeurs par défaut)
  pointAName: string = "pointA";
  pointBName: string = "pointB";
  duration: number = 0.9;   // en secondes
  trigger: number = 0;
  lookAtX: number = NaN;
  lookAtY: number = NaN;
  lookAtZ: number = NaN;

  // FOV (optionnel)
  fovA: number = NaN;     // FOV au point A
  fovB: number = NaN;     // FOV au point B
  fovMid: number = NaN;   // si défini, zoom max au milieu (t≈0.5)

  // internes
  private _a: Entity | null = null;
  private _b: Entity | null = null;
  private _time = 0;
  private _active = false;
  private _forward = true;       // alterne A->B puis B->A
  private _lastTrigger = 0;

  initialize() {
    this._lastTrigger = this.trigger ?? 0;
    this._grabPoints();
  }

  // récupère/rafraîchit les entités de référence
  private _grabPoints() {
    const root = this.app?.root;
    if (!root) return;
    this._a = (root.findByName(this.pointAName) as Entity) || null;
    this._b = (root.findByName(this.pointBName) as Entity) || null;
  }

  private _ease(t: number) {
    // smoothstep
    return t * t * (3 - 2 * t);
  }

  private _hasFov(v: number) {
    return Number.isFinite(v);
  }

  update(dt: number) {
    // si les points n'existent pas encore (ordre de création), on retente
    if (!this._a || !this._b) this._grabPoints();
    if (!this._a || !this._b) return;

    // déclenchement quand trigger change (depuis React)
    if ((this.trigger ?? 0) !== this._lastTrigger) {
      this._lastTrigger = this.trigger ?? 0;
      this._time = 0;
      this._active = true;
      this._forward = !this._forward; // toggle sens
    }

    if (!this._active) return;

    const dur = Math.max(0.0001, this.duration || 0.9);
    this._time += dt;
    let t = this._time / dur;
    if (t > 1) t = 1;
    const k = this._ease(t);

    // world space pour éviter les surprises
    const startPos = this._forward ? this._a.getPosition() : this._b.getPosition();
    const endPos   = this._forward ? this._b.getPosition() : this._a.getPosition();

    const curPos = new Vec3().lerp(startPos, endPos, k);
    this.entity.setPosition(curPos);

    const useLookAt =
      Number.isFinite(this.lookAtX) &&
      Number.isFinite(this.lookAtY) &&
      Number.isFinite(this.lookAtZ);

    if (useLookAt) {
      const focus = new Vec3(this.lookAtX, this.lookAtY, this.lookAtZ);
      this.entity.lookAt(focus);
    } else {
      const startRot = this._forward ? this._a.getRotation() : this._b.getRotation();
      const endRot   = this._forward ? this._b.getRotation() : this._a.getRotation();
      const q = new Quat().slerp(startRot, endRot, k);
      this.entity.setRotation(q);
    }

    // === FOV ===
    const cam = (this.entity as any).camera as { fov: number } | undefined;
    if (cam) {
      // Mode "zoom-out au milieu"
      if (this._hasFov(this.fovMid)) {
        // on part du FOV de départ (= fovA/fovB si fournis, sinon FOV courant),
        // on va vers fovMid au milieu, puis on revient vers le FOV d'arrivée.
        const startF = this._forward
          ? (this._hasFov(this.fovA) ? this.fovA : cam.fov)
          : (this._hasFov(this.fovB) ? this.fovB : cam.fov);
        const endF = this._forward
          ? (this._hasFov(this.fovB) ? this.fovB : cam.fov)
          : (this._hasFov(this.fovA) ? this.fovA : cam.fov);

        // "triangle" 0->1->0 pour remonter vers fovMid au milieu
        const tri = t < 0.5 ? (t / 0.5) : ((1 - t) / 0.5); // 0..1..0
        // interp entre startF et fovMid selon tri, puis blend vers endF via k (option simple)
        const towardsMid = startF + (this.fovMid - startF) * tri;
        // petit blend pour coller progressivement à la destination en fin d'anim
        cam.fov = towardsMid * (1 - k) + endF * k;
      }
      // Mode simple A<->B
      else if (this._hasFov(this.fovA) && this._hasFov(this.fovB)) {
        const startF = this._forward ? this.fovA : this.fovB;
        const endF   = this._forward ? this.fovB : this.fovA;
        cam.fov = startF + (endF - startF) * k;
      }
      // sinon, on ne touche pas au FOV
    }

    this.entity.syncHierarchy?.();

    // (debug) log à chaque frame
    // const p = this.entity.getPosition();
    // console.log(`[LerpAndSlerpCamera] t=${t.toFixed(2)} fov=${cam?.fov?.toFixed(1)} pos=${p.x.toFixed(2)},${p.y.toFixed(2)},${p.z.toFixed(2)}`);

    if (t >= 1) {
      // snap final
      this.entity.setPosition(endPos);
      if (useLookAt) {
        this.entity.lookAt(new Vec3(this.lookAtX, this.lookAtY, this.lookAtZ));
      } else {
        this.entity.setRotation(this._forward ? this._b.getRotation() : this._a.getRotation());
      }
      if (cam && this._hasFov(this.fovA) && this._hasFov(this.fovB)) {
        cam.fov = this._forward ? this.fovB : this.fovA;
      }
      this.entity.syncHierarchy?.();
      this._active = false;
      // console.log("✅ Lerp terminé");
    }
  }
}

export default LerpAndSlerpCamera;
