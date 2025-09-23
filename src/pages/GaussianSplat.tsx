import { Application, Entity } from '@playcanvas/react';
import { Camera, GSplat, Environment } from '@playcanvas/react/components';
import { OrbitControls } from '@playcanvas/react/scripts';
import { useSplat, useAsset } from '@playcanvas/react/hooks';


function SkyBoxEntity() {
    const { asset, loading, error } = useAsset('/cubemap-sunset.png', 'texture');
    if (loading) return <p>Loading skybox...</p>;
    if (error) return <p>Error loading skybox: {error}</p>;
    if (!asset) return null;
    console.log('Skybox asset chargé:', asset);

    return (
        <Entity name="skybox">
            <Environment skybox={asset} skyboxIntensity={2} exposure={1} />
        </Entity>
    );
}
function SplatEntity() {
    const { asset, loading, error } = useSplat("/scene2.ply");
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error loading splat: {error}</p>;
    if (!asset) return null;
    console.log('Asset chargé:', asset);

    return (
        <Entity name="splat" position={[0, 0, 0]} rotation={[180, -90, 0]}>
            <GSplat asset={asset} />
        </Entity>
    );
}


function GaussianSplat() {
    return (
        <Application>
            <Entity name='camera' position={[-90, 60, 0]}>
                <Camera fov={65} />
                <OrbitControls
                    distance={3.5}
                    distanceMin={3}
                    distanceMax={20}
                    pitchAngleMin={15}
                    mouse={{ orbitSensitivity: 0.3, distanceSensitivity: 0.6 }}
                />
            </Entity>
            <SkyBoxEntity />
            <SplatEntity />
        </Application>
    );
}

export default GaussianSplat;