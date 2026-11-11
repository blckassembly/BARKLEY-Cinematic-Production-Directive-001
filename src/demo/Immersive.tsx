import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createBarkleyKiosk } from "../scene/kiosk";
import { createDispensaryEnvironment } from "../scene/environment";

export default function Immersive({
  title,
  detail,
  action,
  onAction,
  exitOnAction = true,
}: {
  title: string;
  detail: string;
  action: string;
  onAction: () => void;
  exitOnAction?: boolean;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const state = useRef({ title, detail, action, onAction, exitOnAction });
  state.current = { title, detail, action, onAction, exitOnAction };
  const enter = useRef<(() => Promise<void>) | null>(null);
  const [status, setStatus] = useState("Checking headset support…");
  const [supported, setSupported] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let dead = false;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      setFailed(true);
      setStatus(
        "3D graphics are unavailable. Use the checkout controls below.",
      );
      return;
    }
    const host = mount.current!;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.xr.enabled = true;
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#161d19");
    scene.add(new THREE.HemisphereLight(0xfff4df, 0x26342b, 3));
    const light = new THREE.DirectionalLight(0xffe8be, 3);
    light.position.set(2, 4, 3);
    scene.add(light);
    const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 50);
    camera.position.set(0, 1.4, 1.6);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.25, 0);
    controls.maxDistance = 4;
    controls.minDistance = 0.7;
    controls.update();
    const environment = createDispensaryEnvironment(true);
    scene.add(environment.group);
    const surface = document.createElement("canvas");
    surface.width = 720;
    surface.height = 1280;
    const ctx = surface.getContext("2d")!;
    const texture = new THREE.CanvasTexture(surface);
    texture.colorSpace = THREE.SRGBColorSpace;
    const kiosk = createBarkleyKiosk(true, texture);
    kiosk.group.position.z = 0.045;
    const bezel = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.77, 0.025),
      new THREE.MeshStandardMaterial({
        color: 0x18231d,
        metalness: 0.65,
        roughness: 0.3,
      }),
    );
    bezel.position.set(0, 1.25, -0.015);
    kiosk.group.add(bezel);
    scene.add(kiosk.group);
    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3();
    const origin = new THREE.Vector3();
    const rotation = new THREE.Matrix4();
    const select = async () => {
      const session = renderer.xr.getSession();
      if (session && state.current.exitOnAction) await session.end();
      state.current.onAction();
    };
    const controllers = [0, 1].map((index) => {
      const controller = renderer.xr.getController(index);
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(),
          new THREE.Vector3(0, 0, -3),
        ]),
        new THREE.LineBasicMaterial({ color: 0xd8b975 }),
      );
      controller.add(line);
      scene.add(controller);
      const handler = () => {
        rotation.identity().extractRotation(controller.matrixWorld);
        origin.setFromMatrixPosition(controller.matrixWorld);
        direction.set(0, 0, -1).applyMatrix4(rotation);
        raycaster.set(origin, direction);
        if (
          raycaster
            .intersectObject(kiosk.screenMesh)
            .some((hit) => hit.uv && hit.uv.y < 0.22)
        )
          void select();
      };
      controller.addEventListener("select", handler);
      return { controller, line, handler };
    });
    let previous = "";
    renderer.setAnimationLoop(() => {
      const current = state.current;
      const key = `${current.title}|${current.detail}|${current.action}`;
      if (previous !== key) {
        previous = key;
        ctx.fillStyle = "#f6f3e9";
        ctx.fillRect(0, 0, 720, 1280);
        ctx.fillStyle = "#20352b";
        ctx.font = "34px serif";
        ctx.fillText("B A R K L E Y", 65, 120);
        ctx.font = "23px sans-serif";
        ctx.fillText("IMMERSIVE · SANDBOX DEMO", 65, 185);
        ctx.font = "bold 42px sans-serif";
        const wrap = (text: string, y: number, lineHeight: number) => {
          let line = "";
          for (const word of text.split(" ")) {
            if (ctx.measureText(`${line} ${word}`).width > 580) {
              ctx.fillText(line, 65, y);
              y += lineHeight;
              line = word;
            } else line += `${line ? " " : ""}${word}`;
          }
          ctx.fillText(line, 65, y);
        };
        wrap(current.title, 330, 55);
        ctx.font = "30px sans-serif";
        wrap(current.detail, 490, 45);
        ctx.fillStyle = "#20352b";
        ctx.fillRect(45, 1040, 630, 160);
        ctx.fillStyle = "#fff";
        ctx.font = "28px sans-serif";
        wrap(current.action, 1100, 38);
        texture.needsUpdate = true;
      }
      renderer.render(scene, camera);
    });
    const resize = () => {
      renderer.setSize(host.clientWidth, host.clientHeight);
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    const xr = (navigator as any).xr;
    if (xr)
      xr.isSessionSupported("immersive-vr")
        .then((available: boolean) => {
          if (!dead) {
            setSupported(available);
            setStatus(
              available
                ? "Headset ready. Point a controller at the bottom screen button and select."
                : "No VR headset detected. Drag to explore the store.",
            );
          }
        })
        .catch(() => {
          if (!dead)
            setStatus("VR permission unavailable. Drag to explore the store.");
        });
    else
      setStatus(
        "Browser 3D preview. Headset VR requires a WebXR browser over HTTPS.",
      );
    enter.current = async () => {
      try {
        const session = await xr.requestSession("immersive-vr", {
          optionalFeatures: ["local-floor"],
        });
        camera.position.set(0, 0, 1.2);
        camera.rotation.set(0, 0, 0);
        session.addEventListener(
          "end",
          () => {
            camera.position.set(0, 1.4, 1.6);
            controls.update();
          },
          { once: true },
        );
        await renderer.xr.setSession(session);
      } catch {
        setStatus(
          "Could not start VR. Check headset connection and permissions.",
        );
      }
    };
    return () => {
      dead = true;
      enter.current = null;
      observer.disconnect();
      renderer.setAnimationLoop(null);
      void renderer.xr.getSession()?.end();
      controls.dispose();
      controllers.forEach(({ controller, line, handler }) => {
        controller.removeEventListener("select", handler);
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      });
      bezel.geometry.dispose();
      (bezel.material as THREE.Material).dispose();
      kiosk.dispose();
      environment.dispose();
      texture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return (
    <section className="immersive">
      <div className="vr-viewport" ref={mount} />
      {failed && <p>Continue with the accessible checkout below.</p>}
      <div className="vr-caption">
        <p role="status">{status}</p>
        {supported && (
          <button onClick={() => enter.current?.()}>Enter headset VR</button>
        )}
        <small>
          PayPal opens in the browser after leaving VR. Return here afterward.
        </small>
      </div>
    </section>
  );
}
