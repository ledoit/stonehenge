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
  setPointer: (nx: number, ny: number) => void;
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
  scene.fog = new THREE.FogExp2(0x12140f, 0.055);

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 80);
  camera.position.set(0, 3.2, 11.5);

  const hemi = new THREE.HemisphereLight(0xb8c4a8, 0x1a1812, 0.85);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff2d6, 0.55);
  key.position.set(4, 10, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x6a8a9a, 0.25);
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

  // Distant brand monolith — typography as landscape, not UI chrome
  const brandGeo = new THREE.PlaneGeometry(18, 4.5);
  const brandCanvas = document.createElement("canvas");
  brandCanvas.width = 2048;
  brandCanvas.height = 512;
  const ctx = brandCanvas.getContext("2d")!;
  ctx.clearRect(0, 0, 2048, 512);
  ctx.fillStyle = "rgba(231, 225, 212, 0.07)";
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
      opacity: 1,
    }),
  );
  brand.position.set(0, 5.5, -10);
  scene.add(brand);

  const stones = projects.map((p, i) => createStone(p, i, projects.length));
  for (const s of stones) scene.add(s.group);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let focus: number | null = null;
  let pointerN = { x: 0, y: 0 };
  let dragging = false;
  let yaw = 0;
  let pitch = 0;
  let targetYaw = 0;
  let targetPitch = 0;
  let entering = false;
  let enterT = 0;
  let enterIndex = 0;
  let enterResolve: (() => void) | null = null;
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
    pointer.x = (clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(
      stones.map((s) => s.mesh),
      false,
    );
    if (!hits.length) return null;
    const idx = hits[0]!.object.userData.index as number;
    return idx;
  }

  function setPointer(nx: number, ny: number) {
    pointerN = { x: nx, y: ny };
    if (dragging) {
      targetYaw += nx * 0.015;
      targetPitch = THREE.MathUtils.clamp(targetPitch + ny * 0.01, -0.25, 0.35);
    }
  }

  function orbit(dx: number, dy: number) {
    targetYaw += dx * 0.0025;
    targetPitch = THREE.MathUtils.clamp(targetPitch + dy * 0.0018, -0.25, 0.35);
  }

  function setDragging(value: boolean) {
    dragging = value;
  }

  function enter(index: number): Promise<void> {
    entering = true;
    enterT = 0;
    enterIndex = index;
    setFocus(index);
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

    yaw += (targetYaw - yaw) * 0.08;
    pitch += (targetPitch - pitch) * 0.08;

    if (!entering) {
      const breathe = reduced ? 0 : Math.sin(t * 0.35) * 0.15;
      const lookX = Math.sin(yaw) * 2.2 + pointerN.x * (dragging ? 0 : 0.6);
      const lookY = 2.4 + pitch * 1.5 + breathe;
      const camZ = 11.5 - pitch * 1.2;
      camera.position.x += (lookX - camera.position.x) * 0.05;
      camera.position.y += (lookY + 0.8 - camera.position.y) * 0.05;
      camera.position.z += (camZ - camera.position.z) * 0.05;
      camera.lookAt(0, 1.6 + pitch * 0.5, 0);
    } else {
      enterT += dt;
      const stone = stones[enterIndex]!;
      const p = new THREE.Vector3();
      stone.mesh.getWorldPosition(p);
      p.y += stone.project.height * 0.25;
      const k = Math.min(1, enterT / 1.05);
      const e = k * k * (3 - 2 * k);
      camera.position.lerp(p.clone().add(new THREE.Vector3(0, 0.2, 1.1)), 0.04 + e * 0.08);
      camera.lookAt(p);
      if (enterT > 1.05) {
        enterResolve?.();
        enterResolve = null;
        entering = false;
      }
    }

    for (const s of stones) {
      const hot = focus === s.index ? 1 : 0;
      const cur = s.material.uniforms.uHot!.value as number;
      s.material.uniforms.uHot!.value = cur + (hot - cur) * 0.1;
      s.material.uniforms.uTime!.value = t;
      const lift = hot * 0.12;
      s.group.position.y += (lift - s.group.position.y) * 0.08;
      s.group.scale.setScalar(1 + hot * 0.03);
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
    setPointer,
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
