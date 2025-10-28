import { Script, Entity, StandardMaterial, Color } from "playcanvas";

/**
 * FixedBackground : affiche une image 2D fixe derrière la caméra
 * - Ne bouge pas avec la caméra
 * - Utilise un plane local à la caméra
 */
export class FixedBackground extends Script {
  static scriptName = "FixedBackground";

  texture = null;
  scale = 18;
  offsetZ = -12;
  bgEntity = null;

  initialize() {
    if (!this.texture) {
      console.warn("[FixedBackground] ⚠️ Aucune texture fournie");
      return;
    }

    // Matériau auto-éclairé
    const mat = new StandardMaterial();
    mat.diffuseMap = this.texture;
    mat.emissiveMap = this.texture;
    mat.emissive = new Color(1, 1, 1);
    mat.useSkybox = false;
    mat.update();

    // Plane
    const plane = new Entity("FixedBackgroundPlane");
    plane.addComponent("render", {
      type: "plane",
      material: mat,
      castShadows: false,
      receiveShadows: false,
    });

    // Taille et position
    plane.setLocalScale(this.scale, this.scale * 9 / 16, 1);
    plane.setLocalPosition(0, 0, this.offsetZ);

    // Face la caméra (le mesh est inversé sinon)
    plane.setLocalEulerAngles(0, 180, 0);

    this.entity.addChild(plane);
    this.bgEntity = plane;

    console.log("[FixedBackground] ✅ Image appliquée");
  }

  update() {
    // Empêche le fond de suivre la rotation de la caméra
    if (this.bgEntity) {
      this.bgEntity.setLocalEulerAngles(0, 180, 0);
    }
  }
}

export default FixedBackground;
