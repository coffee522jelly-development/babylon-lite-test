import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { GizmoManager } from "@babylonjs/core/Gizmos/gizmoManager";

import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Helpers/sceneHelpers";
import "@babylonjs/core/XR/webXRDefaultExperience";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

if (!canvas) {
    throw new Error("Could not find canvas");
}

const engine = new Engine(canvas, true);

const createScene = async function () {
    const scene = new Scene(engine);

    const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 5, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.wheelPrecision = 50;

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const result = await SceneLoader.ImportMeshAsync("", "https://models.babylonjs.com/", "boombox.glb", scene);
    const rootMesh = result.meshes[0];
    rootMesh.scaling = new Vector3(20, 20, 20); // Boombox model is tiny

    // Initialize GizmoManager
    const gizmoManager = new GizmoManager(scene);
    gizmoManager.positionGizmoEnabled = true;
    gizmoManager.rotationGizmoEnabled = true;
    gizmoManager.scaleGizmoEnabled = true;
    gizmoManager.attachableMeshes = [result.meshes[0]];

    // Default XR Experience
    try {
        const xrHelper = await scene.createDefaultXRExperienceAsync({
            // You can customize options here
        });

        // Add ground for teleportation
        const envHelper = scene.createDefaultEnvironment();
        if (envHelper && envHelper.ground) {
            xrHelper.teleportation.addFloorMesh(envHelper.ground);
        }
    } catch (e) {
        console.warn("WebXR is not supported on this device.", e);
    }

    return scene;
};

createScene().then(scene => {
    engine.runRenderLoop(function () {
        scene.render();
    });
});

window.addEventListener("resize", function () {
    engine.resize();
});
