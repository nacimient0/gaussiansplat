// scripts/SimpleAutoRotator.ts
// @ts-nocheck
import { Script } from "playcanvas";

/**
 * SimpleAutoRotator : rotation orbit Yaw/Pitch pilotable depuis React
 */
export class SimpleAutoRotator extends Script {
  static scriptName = "simpleAutoRotator";

  // props PlayCanvas (on les remplit depuis React <Script ... />)
  speed = 10;           // vitesse de rotation horizontale (deg/sec-ish)
  pitchSpeed = 0;       // vitesse oscillation verticale
  pitchAmount = 0;      // amplitude verticale
  startDelay = 0;       // délai avant de bouger
  startFadeInTime = 0;  // fade-in
  enabledState = false; // 🚀 NOUVEAU : état voulu par React

  // internes
  timer = 0;
  yaw = 0;
  pitch = 0;

  private _orbit = null;
  private _wasActive = false; // pour détecter les transitions on/off

  initialize() {
    // chope orbitControls / orbitCamera
    // @ts-expect-error dynamic
    this._orbit = this.entity.script?.orbitCamera ?? this.entity.script?.orbitControls ?? null;

    if (!this._orbit) {
      console.warn("[SimpleAutoRotator] ⚠️ Aucun orbitCamera/orbitControls trouvé sur la caméra.");
    } else {
      this.pitch = this._orbit.pitch;
      this.yaw = this._orbit.yaw;
      console.log("[SimpleAutoRotator] 🎬 init OK | yaw=", this.yaw, " pitch=", this.pitch);
    }

    this.timer = 0;
    this._wasActive = this.enabledState === true;
    console.log("[SimpleAutoRotator] initialize enabledState=", this.enabledState);
  }

  update(dt) {
    if (!this._orbit) return;

    // détecter changement d'état demandé par React
    if (this.enabledState !== this._wasActive) {
      console.log(
        "[SimpleAutoRotator] 🔄 changement enabledState ->",
        this.enabledState
      );

      if (this.enabledState) {
        // on repart -> reset timer mais garde yaw/pitch actuels
        this.yaw = this._orbit.yaw;
        this.pitch = this._orbit.pitch;
        this.timer = 0;
      } else {
        // on stop -> fige la rot actuelle dans l'orbit
        this._orbit.yaw = this.yaw;
        this._orbit.pitch = this.pitch;
      }

      this._wasActive = this.enabledState;
    }

    // si pas actif => on ne bouge pas la cam
    if (!this.enabledState) return;

    // détection mouvement manuel utilisateur :
    if (this.pitch !== this._orbit.pitch || this.yaw !== this._orbit.yaw) {
      // l'utilisateur a tourné à la main → on recale le point de départ, reset timer
      this.pitch = this._orbit.pitch;
      this.yaw = this._orbit.yaw;
      this.timer = 0;
      // log pour debug
      // console.log("[SimpleAutoRotator] 🕹 mouvement manuel détecté, reset timer");
    } else {
      this.timer += dt;
    }

    // attendre le startDelay
    if (this.timer <= this.startDelay) {
      return;
    }

    // calcule le facteur de fade-in
    const timeSinceStart = this.timer - this.startDelay;
    const fadeIn =
      this.startFadeInTime > 0
        ? this._smoothStep(timeSinceStart / this.startFadeInTime)
        : 1;

    // avance la rotation
    this.yaw += dt * fadeIn * this.speed;
    this.pitch += Math.sin(timeSinceStart * this.pitchSpeed) * dt * fadeIn * this.pitchAmount;

    // applique sur l'orbit
    this._orbit.yaw = this.yaw;
    this._orbit.pitch = this.pitch;
  }

  _smoothStep(x) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return Math.sin((x - 0.5) * Math.PI) * 0.5 + 0.5;
  }
}

export default SimpleAutoRotator;
