import { Script, Quat, Vec3 } from 'playcanvas';

export class LerpAndSlerpCamera extends Script {
    static scriptName = "lerpAndSlerpCamera"; // ✅ défini ici correctement

    pointA;
    pointB;
    duration = 2;
    onFinish = null;

    initialize() {
        this.time = 0;
        this.active = false;
    }

    startLerp(from, to) {
        this.pointA = from;
        this.pointB = to;
        this.time = 0;
        this.active = true;
    }

    update(dt) {
        if (!this.active) return;

        this.time += dt;
        let t = Math.min(1, this.time / this.duration);

        // Rotation
        const startRot = this.pointA.getRotation();
        const endRot = this.pointB.getRotation();
        const slerpedRot = new pc.Quat().slerp(startRot, endRot, t);

        // Position
        const startPos = this.pointA.getPosition();
        const endPos = this.pointB.getPosition();
        const lerpedPos = new pc.Vec3().lerp(startPos, endPos, t);

        this.entity.setRotation(slerpedRot);
        this.entity.setPosition(lerpedPos);

        if (t >= 1) {
            this.active = false;
            if (this.onFinish) this.onFinish();
        }
    }
}
