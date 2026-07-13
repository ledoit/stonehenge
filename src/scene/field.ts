import * as THREE from "three";
import { projects } from "../data/projects";
import { createStone, type MenhirStone } from "./stone";
import { groundFragment, groundVertex } from "./shaders";

export type FieldApi = {
  stones: MenhirStone[];
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  setFocus: (index: number | null) => void;
  getFocus: () => number | null;
  pick: (x: number, y: number) => number | null;
  setDragging: (dragging: boolean) => void;
  orbit: (dx: number, dy: number) => void;
  enter: (index: number) => Promise<void>;
  dispose: () => void;
};

export function createField(canvas: HTMLCanvasElement): FieldApi {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x12140f, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x12140f, 0.048);

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 80);
  camera.position.set(0, 3.4, 12.2);

  const hemi = new THREE.HemisphereLight(0xc4d0b8, 0x1a1812, 1.0);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff2d6, 0.7);
  key.position.set(4, 10, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x7a9aaa, 0.35);
  rim.position.set(-6, 3, -4);
  scene.add(rim);

  const groundMat = new THREE.ShaderMaterial({
    vertexShader: groundVertex,
    fragmentShader: groundFragment,
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: { value: 0 } },
  });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(24, 64), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.01;
  scene.add(ground);

  const brandGeo = new THREE.PlaneGeometry(18, 4.5);
  const brandCanvas = document.createElement("canvas");
  brandCanvas.width = 2048;
  brandCanvas.height = 512;
  const ctx = brandCanvas.getContext("2d")!;
  ctx.clearRect(0, 0, 2048, 512);
  ctx.fillStyle = "rgba(231, 225, 212, 0.11)";
  ctx.font = "800 280px Syne, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("MENHIR", 1024, 260);
  const brandTex = new THREE.CanvasTexture(brandCanvas);
  brandTex.colorSpace = THREE.SRGBColorSpace;
  const brand = new THREE.Mesh(
    brandGeo,
    new THREE.MeshBasicMaterial({
      map: brandTex,
      transparent: true,
      depthWrite: false,
    }),
  );
  brand.position.set(0, 5.5, -10);
  scene.add(brand);

  const stones = projects.map((p, i) => createStone(p, i, projects.length));
  for (const s of stones) scene.add(s.group);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let focus: number | null = null;
  let dragging = false;
  let yaw = 0;
  let pitch = 0;
  let targetYaw = 0;
  let targetPitch = 0;
  let entering = false;
  let enterT = 0;
  let enterResolve: (() => void) | null = null;
  let enterFrom = new THREE.Vector3();
  let enterTo = new THREE.Vector3();
  let enterLook = new THREE.Vector3();
  let raf = 0;
  const clock = new THREE.Clock();
  const reduced =
    typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setFocus(index: number | null) {
    focus = index;
  }

  function getFocus() {
    return focus;
  }

  function pick(clientX: number, clientY: number): number | null {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(
      stones.map((s) => s.mesh),
      false,
    );
    if (!hits.length) return null;
    return hits[0]!.object.userData.index as number;
  }

  function orbit(dx: number, dy: number) {
    targetYaw -= dx * 0.0045;
    targetPitch = THREE.MathUtils.clamp(targetPitch + dy * 0.0032, -0.28, 0.38);
  }

  function setDragging(value: boolean) {
    dragging = value;
  }

  function enter(index: number): Promise<void> {
    entering = true;
    enterT = 0;
    setFocus(index);

    const stone = stones[index]!;
    stone.mesh.getWorldPosition(enterLook);
    enterLook.y += stone.project.height * 0.28;

    // Approach from camera side of the stone (outward from circle center)
    const outward = new THREE.Vector3(stone.group.position.x, 0, stone.group.position.z)
      .normalize()
      .multiplyScalar(2.4);
    enterTo.copy(enterLook).add(outward);
    enterTo.y = Math.max(enterTo.y, 2.2);
    enterFrom.copy(camera.position);

    return new Promise((resolve) => {
      enterResolve = resolve;
    });
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener("resize", onResize);

  function tick() {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    groundMat.uniforms.uTime!.value = t;

    const damp = dragging ? 0.18 : 0.1;
    yaw += (targetYaw - yaw) * damp;
    pitch += (targetPitch - pitch) * damp;

    if (!entering) {
      const breathe = reduced ? 0 : Math.sin(t * 0.35) * 0.12;
      const radius = 12.2 - pitch * 1.4;
      const camX = Math.sin(yaw) * radius * 0.22;
      const camZ = Math.cos(yaw * 0.15) * radius;
      const camY = 3.2 + pitch * 1.6 + breathe;
      camera.position.x += (camX - camera.position.x) * 0.06;
      camera.position.y += (camY - camera.position.y) * 0.06;
      camera.position.z += (camZ - camera.position.z) * 0.06;
      camera.lookAt(Math.sin(yaw) * 0.8, 1.7 + pitch * 0.4, 0);
    } else {
      enterT += dt;
      const k = Math.min(1, enterT / (reduced ? 0.35 : 0.95));
      const e = k * k * (3 - 2 * k);
      camera.position.lerpVectors(enterFrom, enterTo, e);
      camera.lookAt(enterLook);
      if (k >= 1) {
        enterResolve?.();
        enterResolve = null;
        entering = false;
      }
    }

    for (const s of stones) {
      const hot = focus === s.index ? 1 : 0;
      const cur = s.material.uniforms.uHot!.value as number;
      s.material.uniforms.uHot!.value = cur + (hot - cur) * 0.12;
      s.material.uniforms.uTime!.value = t;
      const lift = hot * 0.14;
      s.group.position.y += (lift - s.group.position.y) * 0.1;
      s.group.scale.setScalar(1 + hot * 0.04);
    }

    brand.rotation.y = Math.sin(t * 0.08) * 0.04;
    renderer.render(scene, camera);
  }

  tick();

  return {
    stones,
    camera,
    renderer,
    scene,
    setFocus,
    getFocus,
    pick,
    setDragging,
    orbit,
    enter,
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    },
  };
}
