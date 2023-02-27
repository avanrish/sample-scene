import { useEffect, useRef, useState } from 'react';
import { CubeTexture, Engine, FreeCamera, Ray, Scene, SceneLoader, Vector3 } from '@babylonjs/core';
import '@babylonjs/loaders';
import { CustomLoadingScreen } from '../CustomLoadingScreen';
import LoadingScreen from './LoadingScreen';
import { AdvancedDynamicTexture, Ellipse } from '@babylonjs/gui';

export default function Scene3D2() {
  const [scene, setScene] = useState<Scene>();
  const [camera, setCamera] = useState<FreeCamera>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const engine = new Engine(canvasRef.current, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });
    const loadingScreen = new CustomLoadingScreen();
    engine.loadingScreen = loadingScreen;
    engine.displayLoadingUI();
    engine.setHardwareScalingLevel(1);

    SceneLoader.Load('./blenderscene/', 'untitled.babylon', engine, (scene) => {
      const envTex = CubeTexture.CreateFromPrefilteredData('./skybox.env', scene);
      scene.environmentTexture = envTex;
      scene.environmentIntensity = 0.5;
      scene.createDefaultSkybox(envTex, true);

      scene.meshes.forEach((mesh) => {
        mesh.checkCollisions = true;
      });

      const framesPerSecond = 60;
      const gravity = -9.81;
      scene.gravity = new Vector3(0, gravity / framesPerSecond, 0);
      scene.collisionsEnabled = true;

      const camera = new FreeCamera('camera', new Vector3(0, 1.84, 0), scene);
      scene.activeCamera = camera;
      camera.attachControl();
      camera.applyGravity = true;
      camera.checkCollisions = true;
      camera.ellipsoid = new Vector3(0.5, 1, 0.5);
      camera.minZ = 0.1;
      camera.angularSensibility = 3500;

      camera.keysUp.push(87);
      camera.keysLeft.push(65);
      camera.keysDown.push(83);
      camera.keysRight.push(68);

      setCamera(camera);
      setScene(scene);

      const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');
      const internalPointer = new Ellipse('pointer');
      internalPointer.widthInPixels = 16;
      internalPointer.heightInPixels = 16;
      internalPointer.background = 'purple';
      internalPointer.isVisible = false;
      internalPointer.zIndex = 99;
      advancedTexture.addControl(internalPointer);

      scene.onPointerDown = (e) => {
        if (e.button === 0 && !engine.isPointerLock) {
          engine.enterPointerlock();
          internalPointer.isVisible = true;
        } else if (e.button === 2 && engine.isPointerLock) {
          engine.exitPointerlock();
          internalPointer.isVisible = false;
        } else if (e.button === 0) {
          const camera = scene.activeCamera!;
          const position = camera.position.clone();
          const direction = camera.getDirection(new Vector3(0, 0, 1));
          const ray = new Ray(position, direction);
          const pick = scene.pickWithRay(ray);
          if (pick?.pickedMesh?.metadata?.link) {
            window.open(pick.pickedMesh.metadata.link, '_blank');
            internalPointer.isVisible = false;
          }
        }
      };

      const pointerMove = () => {
        const pick = scene.pick(engine.getRenderWidth() / 2, engine.getRenderHeight() / 2);
        if (pick?.pickedMesh?.metadata?.link) internalPointer.background = 'green';
        else internalPointer.background = 'purple';
      };

      scene.onPointerMove = pointerMove;

      scene.onKeyboardObservable.add(({ event }) => {
        if (event.shiftKey) camera.speed = 0.38;
        else camera.speed = 0.19;
        if (event.key === 'Escape') engine.exitPointerlock();
      });

      engine.runRenderLoop(() => {
        scene.render();
      });

      scene.getEngine().hideLoadingUI();
    });
    const resizeCanvas = () => {
      engine.resize();
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      engine.dispose();
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    let isOn = false;
    const cb = async (e: KeyboardEvent) => {
      if (scene !== undefined) {
        await import('@babylonjs/inspector');
        await import('@babylonjs/core/Debug/debugLayer');
        if (e.metaKey && e.key === 'i') {
          if (isOn) {
            scene.debugLayer.hide();
          } else {
            scene.debugLayer.show({ embedMode: true });
          }
          isOn = !isOn;
        }
      }
    };
    window.addEventListener('keydown', cb);

    return () => {
      isOn = false;
      window.removeEventListener('keydown', cb);
    };
  }, [scene]);

  return (
    <>
      <canvas ref={canvasRef} className="w-full h-full" />
      <LoadingScreen />
    </>
  );
}
