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
  /** -1..1 pointer position → free-look around the circle (no click). */
  setLook: (nx: number, ny: number) => void;
  setDragging: (dragging: boolean) => void;
  orbit: (dx: number, dy: number) => void;
  /** Rotate so stone `index` sits in front of the camera. */
  faceStone: (index: number) => void;
  facingIndex: () => number;
  enter: (index: number) => Promise<void>;
  /** Undo in-progress enter (bfcache / back button). */
  abortEnter: () => void;
  dispose: () => void;
};

function stoneYaw(stone: MenhirStone): number {
  return Math.atan2(stone.group.position.z, stone.group.position.x);
}

function angleDelta(a: number, b: number): number {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

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

  const CAM_R = 11.5;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let focus: number | null = null;
  let dragging = false;
  let yaw = stoneYaw(stones[0]!);
  let pitch = 0;
  let targetYaw = yaw;
  let targetPitch = 0;
  let lookMode = true; // free-look from pointer position
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

  function facingIndex(): number {
    let best = 0;
    let bestAbs = Infinity;
    for (const s of stones) {
      const d = Math.abs(angleDelta(stoneYaw(s), yaw));
      if (d < bestAbs) {
        bestAbs = d;
        best = s.index;
      }
    }
    return best;
  }

  function faceStone(index: number) {
    lookMode = false;
    targetYaw = stoneYaw(stones[index]!);
    setFocus(index);
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

  /** Map screen pointer (-1..1) to a full orbit around the ring. */
  function setLook(nx: number, ny: number) {
    if (dragging || entering) return;
    lookMode = true;
    // Full turn: left edge → opposite side of circle from right edge
    targetYaw = nx * Math.PI;
    targetPitch = THREE.MathUtils.clamp(-ny * 0.32, -0.28, 0.36);
  }

  function orbit(dx: number, dy: number) {
    lookMode = false;
    targetYaw -= dx * 0.0055;
    targetPitch = THREE.MathUtils.clamp(targetPitch + dy * 0.0035, -0.28, 0.38);
  }

  function setDragging(value: boolean) {
    dragging = value;
    if (value) lookMode = false;
  }

  function enter(index: number): Promise<void> {
    entering = true;
    enterT = 0;
    faceStone(index);

    const stone = stones[index]!;
    stone.mesh.getWorldPosition(enterLook);
    enterLook.y += stone.project.height * 0.28;

    const outward = new THREE.Vector3(stone.group.position.x, 0, stone.group.position.z)
      .normalize()
      .multiplyScalar(2.6);
    enterTo.copy(enterLook).add(outward);
    enterTo.y = Math.max(enterTo.y, 2.2);
    enterFrom.copy(camera.position);

    return new Promise((resolve) => {
      enterResolve = resolve;
    });
  }

  function abortEnter() {
    if (enterResolve) {
      enterResolve();
      enterResolve = null;
    }
    entering = false;
    enterT = 0;
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

    const damp = dragging ? 0.2 : lookMode ? 0.07 : 0.12;
    yaw += angleDelta(targetYaw, yaw) * damp;
    // keep yaw unbounded numerically but stable
    pitch += (targetPitch - pitch) * damp;

    if (!entering) {
      const breathe = reduced ? 0 : Math.sin(t * 0.35) * 0.15;
      const radius = CAM_R - pitch * 1.35;
      // Same angular frame as stones: cos/sin → stone sits between camera and origin
      const camX = Math.cos(yaw) * radius;
      const camZ = Math.sin(yaw) * radius;
      const camY = 3.2 + pitch * 1.55 + breathe;
      camera.position.x += (camX - camera.position.x) * 0.08;
      camera.position.y += (camY - camera.position.y) * 0.08;
      camera.position.z += (camZ - camera.position.z) * 0.08;
      camera.lookAt(0, 1.55 + pitch * 0.45, 0);
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
    setLook,
    setDragging,
    orbit,
    faceStone,
    facingIndex,
    enter,
    abortEnter,
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    },
  };
}
