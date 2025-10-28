import { Script } from "playcanvas";

/**
 * SimpleAutoRotator : agit directement sur le script orbitCamera de la caméra,
 * comme l'AutoRotator officiel, pour éviter les resets de position à l'arrêt.
 */
export class SimpleAutoRotator extends Script {
  static scriptName = "simpleAutoRotator";

  speed = 10;           // vitesse de rotation horizontale
  pitchSpeed = 0;       // vitesse d'oscillation du pitch
  pitchAmount = 0;      // amplitude de pitch (0 = pas de mouvement vertical)
  startDelay = 0;       // délai avant le début de rotation
  startFadeInTime = 0;  // durée de fade-in de la rotation
  timer = 0;

  yaw = 0;
  pitch = 0;

  initialize() {
    // essaie de récupérer le script orbitCamera
    // @ts-expect-error - types dynamiques
    this.orbit = this.entity.script?.orbitCamera;

    if (!this.orbit) {
      console.warn("[SimpleAutoRotator] Aucun script orbitCamera trouvé sur l'entité caméra.");
    } else {
      this.pitch = this.orbit.pitch;
      this.yaw = this.orbit.yaw;
    }

    this.timer = 0;
  }

  update(dt: number) {
    if (!this.orbit) return;

    const camera = this.orbit;

    // Si la caméra a bougé manuellement : reset timer pour ne pas auto-rotater tout de suite
    if (this.pitch !== camera.pitch || this.yaw !== camera.yaw) {
      this.pitch = camera.pitch;
      this.yaw = camera.yaw;
      this.timer = 0;
    } else {
      this.timer += dt;
    }

    if (this.timer > this.startDelay) {
      // Démarrage progressif (fade-in)
      const time = this.timer - this.startDelay;
      const fadeIn = this._smoothStep(time / this.startFadeInTime);

      // Applique une rotation fluide
      this.yaw += dt * fadeIn * this.speed;
      this.pitch += Math.sin(time * this.pitchSpeed) * dt * fadeIn * this.pitchAmount;

      // Met à jour les valeurs OrbitCamera (ce qui déplace réellement la caméra)
      camera.yaw = this.yaw;
      camera.pitch = this.pitch;
    }
  }

  _smoothStep(x: number) {
    return x <= 0 ? 0 : x >= 1 ? 1 : Math.sin((x - 0.5) * Math.PI) * 0.5 + 0.5;
  }

  onDisable() {
    // Quand le script est désactivé (arrêt de l'autorotation),
    // on laisse les yaw/pitch en place → OrbitControls reprendra sans snap.
    if (this.orbit) {
      this.orbit.yaw = this.yaw;
      this.orbit.pitch = this.pitch;
    }
  }

  onEnable() {
    // Relance la rotation en reprenant les angles actuels
    if (this.orbit) {
      this.yaw = this.orbit.yaw;
      this.pitch = this.orbit.pitch;
    }
    this.timer = 0;
  }
}

export default SimpleAutoRotator;
