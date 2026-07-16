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
  setLook: (nx: number, ny: number) => void;
  setDragging: (dragging: boolean) => void;
  orbit: (dx: number, dy: number) => void;
  /** Mobile: rotate ring by radians while finger is down. */
  dragYaw: (deltaRad: number) => void;
  /** Mobile: release with angular velocity (rad/s); coasts then snaps. */
  flingYaw: (velocityRadPerSec: number) => void;
  faceStone: (index: number) => void;
  facingIndex: () => number;
  /** Pull camera back / widen FOV so the full circle reads on a phone. */
  setCompactFraming: (on: boolean) => void;
  enter: (index: number) => Promise<void>;
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

  let camR = 11.5;
  let camYBase = 3.2;
  let lookY = 1.55;
  let compact = false;
  const fog = scene.fog as THREE.FogExp2;

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let focus: number | null = null;
  let dragging = false;
  let yaw = stoneYaw(stones[0]!);
  let pitch = 0;
  let targetYaw = yaw;
  let targetPitch = 0;
  let lookMode = true;
  let yawVel = 0;
  let coasting = false;
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

  const SNAP_VEL = 0.35; // rad/s — below this, settle onto nearest stone
  const FRICTION = 3.2; // exponential decay rate

  function setFocus(index: number | null) {
    focus = index;
  }

  function getFocus() {
    return focus;
  }

  function facingFrom(angle: number): number {
    let best = 0;
    let bestAbs = Infinity;
    for (const s of stones) {
      const d = Math.abs(angleDelta(stoneYaw(s), angle));
      if (d < bestAbs) {
        bestAbs = d;
        best = s.index;
      }
    }
    return best;
  }

  function facingIndex(): number {
    return facingFrom(yaw);
  }

  function faceStone(index: number) {
    lookMode = false;
    coasting = false;
    yawVel = 0;
    targetYaw = stoneYaw(stones[index]!);
    setFocus(index);
  }

  function snapToNearest() {
    const idx = facingFrom(targetYaw);
    faceStone(idx);
    return idx;
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

  function setLook(nx: number, ny: number) {
    if (dragging || entering || coasting) return;
    lookMode = true;
    yawVel = 0;
    targetYaw = nx * Math.PI;
    // Inverted vertical: cursor up → camera rises, scene dips beneath (bird POV)
    targetPitch = THREE.MathUtils.clamp(ny * 0.32, -0.28, 0.36);
  }

  function orbit(dx: number, dy: number) {
    lookMode = false;
    coasting = false;
    yawVel = 0;
    targetYaw -= dx * 0.0055;
    targetPitch = THREE.MathUtils.clamp(targetPitch + dy * 0.0035, -0.28, 0.38);
  }

  function dragYaw(deltaRad: number) {
    lookMode = false;
    coasting = false;
    yawVel = 0;
    targetYaw += deltaRad;
    // Keep visual yaw tight to the finger while dragging
    yaw += deltaRad;
  }

  function flingYaw(velocityRadPerSec: number) {
    lookMode = false;
    const v = THREE.MathUtils.clamp(velocityRadPerSec, -14, 14);
    if (Math.abs(v) < SNAP_VEL) {
      snapToNearest();
      return;
    }
    yawVel = v;
    coasting = true;
  }

  function setDragging(value: boolean) {
    dragging = value;
    if (value) {
      lookMode = false;
      coasting = false;
      yawVel = 0;
    }
  }

  function setCompactFraming(on: boolean) {
    compact = on;
    if (on) {
      camR = 15.4;
      camYBase = 4.35;
      lookY = 1.35;
      camera.fov = 56;
      fog.density = 0.038;
      targetPitch = 0.12;
      pitch = 0.12;
      brand.position.set(0, 6.2, -12);
    } else {
      camR = 11.5;
      camYBase = 3.2;
      lookY = 1.55;
      camera.fov = 42;
      fog.density = 0.055;
      brand.position.set(0, 5.5, -10);
    }
    camera.updateProjectionMatrix();
  }

  function enter(index: number): Promise<void> {
    entering = true;
    enterT = 0;
    coasting = false;
    yawVel = 0;
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
    coasting = false;
    yawVel = 0;
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

    // Inertial coast after a fling, then magnetic snap to nearest menhir
    if (coasting && !dragging && !entering) {
      targetYaw += yawVel * dt;
      yaw += yawVel * dt;
      yawVel *= Math.exp(-FRICTION * dt);
      if (Math.abs(yawVel) < SNAP_VEL) {
        coasting = false;
        yawVel = 0;
        snapToNearest();
      }
    } else if (!dragging && !entering) {
      const damp = lookMode ? 0.07 : 0.14;
      yaw += angleDelta(targetYaw, yaw) * damp;
    }
    // while dragging, dragYaw already keeps yaw in lockstep with the finger

    pitch += (targetPitch - pitch) * (dragging ? 0.25 : 0.1);

    if (!entering) {
      const breathe = reduced ? 0 : Math.sin(t * 0.35) * 0.15;
      const radius = camR - pitch * (compact ? 0.9 : 1.35);
      const camX = Math.cos(yaw) * radius;
      const camZ = Math.sin(yaw) * radius;
      const camY = camYBase + pitch * (compact ? 1.1 : 1.55) + breathe;
      camera.position.x += (camX - camera.position.x) * 0.08;
      camera.position.y += (camY - camera.position.y) * 0.08;
      camera.position.z += (camZ - camera.position.z) * 0.08;
      camera.lookAt(0, lookY + pitch * 0.45, 0);
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
    dragYaw,
    flingYaw,
    faceStone,
    facingIndex,
    setCompactFraming,
    enter,
    abortEnter,
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    },
  };
}
