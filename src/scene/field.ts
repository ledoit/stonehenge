import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { projects } from "../data/projects";
import { createPiece, type StudioPiece } from "./piece";
import { groundFragment, groundVertex } from "./shaders";

export type FieldApi = {
  pieces: StudioPiece[];
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  setFocus: (index: number | null) => void;
  getFocus: () => number | null;
  present: (index: number | null) => void;
  getPresented: () => number | null;
  pick: (x: number, y: number) => number | null;
  setLook: (nx: number, ny: number) => void;
  releaseLook: () => void;
  setDragging: (dragging: boolean) => void;
  orbit: (dx: number, dy: number) => void;
  setCompactFraming: (on: boolean) => void;
  enter: (index: number) => Promise<void>;
  abortEnter: () => void;
  dispose: () => void;
};

function roundedPlate(w: number, d: number, r: number, depth: number): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -d / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + d - r);
  s.absarc(x + w - r, y + d - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + d);
  s.absarc(x + r, y + d - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return new THREE.ExtrudeGeometry(s, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.045,
    bevelSegments: 2,
  });
}

/** World-space set dressing. Not a product, not on the orbiting piece rig. */
function createMenhirBackdrop(): THREE.Group {
  const backdrop = new THREE.Group();
  backdrop.name = "menhirBackdrop";

  const shape = new THREE.Shape();
  shape.moveTo(-3.05, 0);
  shape.lineTo(-2.65, 1.05);
  shape.lineTo(-1.85, 2.25);
  shape.lineTo(-0.5, 2.95);
  shape.lineTo(0.25, 3.08);
  shape.lineTo(1.35, 2.75);
  shape.lineTo(2.35, 1.85);
  shape.lineTo(3.0, 0.78);
  shape.lineTo(3.15, 0);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 1.2,
    bevelEnabled: true,
    bevelThickness: 0.09,
    bevelSize: 0.11,
    bevelSegments: 2,
  });
  geo.translate(0, 0, -0.6);

  const granite = new THREE.MeshStandardMaterial({
    color: 0x8c9088,
    roughness: 0.92,
    metalness: 0.04,
    envMapIntensity: 0.22,
  });

  const stone = new THREE.Mesh(geo, granite);
  stone.position.set(0.2, -1.2, -4.05);
  stone.rotation.y = 0.05;
  stone.castShadow = true;
  stone.receiveShadow = true;
  backdrop.add(stone);

  return backdrop;
}

export function createField(canvas: HTMLCanvasElement): FieldApi {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  const firstDpr = Math.min(window.devicePixelRatio, 1.5);
  renderer.setPixelRatio(firstDpr);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x12140f, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x12140f, 0.024);
  scene.background = new THREE.Color(0x12140f);
  scene.environmentIntensity = 0.62;

  const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 80);
  camera.position.set(0, 6.4, 10.6);

  const hemi = new THREE.HemisphereLight(0xb8c4a8, 0x16140f, 0.58);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xfff1dc, 1.85);
  key.position.set(5.2, 8.4, 4.2);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 32;
  key.shadow.camera.left = -9;
  key.shadow.camera.right = 9;
  key.shadow.camera.top = 9;
  key.shadow.camera.bottom = -9;
  key.shadow.bias = -0.00035;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x6a8aaa, 0.32);
  fill.position.set(-5, 3.2, 2.4);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0x445566, 0.4);
  rim.position.set(-2.2, 5.5, -6);
  scene.add(rim);

  const groundMat = new THREE.ShaderMaterial({
    vertexShader: groundVertex,
    fragmentShader: groundFragment,
    transparent: true,
    depthWrite: false,
  });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(22, 64), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.2;
  scene.add(ground);

  const plateMat = new THREE.MeshStandardMaterial({
    color: 0x3e4138,
    roughness: 0.78,
    metalness: 0.06,
    envMapIntensity: 0.45,
  });
  const plate = new THREE.Mesh(roundedPlate(7.05, 4.55, 0.48, 0.16), plateMat);
  plate.rotation.x = -Math.PI / 2;
  plate.position.y = -0.16;
  plate.receiveShadow = true;
  scene.add(plate);

  const lipMat = new THREE.MeshStandardMaterial({
    color: 0x6a604c,
    roughness: 0.42,
    metalness: 0.48,
    envMapIntensity: 0.7,
  });
  const lip = new THREE.Mesh(roundedPlate(7.32, 4.82, 0.52, 0.12), lipMat);
  lip.rotation.x = -Math.PI / 2;
  lip.position.y = -0.22;
  lip.receiveShadow = true;
  lip.castShadow = true;
  scene.add(lip);

  const riserMat = new THREE.MeshStandardMaterial({
    color: 0x1c1e19,
    roughness: 0.88,
    metalness: 0.03,
  });
  const riser = new THREE.Mesh(roundedPlate(6.35, 3.95, 0.34, 0.55), riserMat);
  riser.rotation.x = -Math.PI / 2;
  riser.position.y = -0.78;
  riser.receiveShadow = true;
  riser.castShadow = true;
  scene.add(riser);

  const backdrop = createMenhirBackdrop();
  scene.add(backdrop);

  const pieces = projects.map((p, i) => createPiece(p, i));
  for (const p of pieces) scene.add(p.group);

  let camR = 10.6;
  let camYBase = 6.4;
  const fog = scene.fog as THREE.FogExp2;

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let focus: number | null = null;
  let presented: number | null = null;
  let dragging = false;
  let yaw = Math.PI * 0.5 + 0.28;
  let pitch = 0.06;
  let orbitYaw = yaw;
  let orbitPitch = pitch;
  let lookYaw = 0;
  let lookPitch = 0;
  let entering = false;
  let enterT = 0;
  let enterResolve: (() => void) | null = null;
  let enterFrom = new THREE.Vector3();
  let enterTo = new THREE.Vector3();
  let enterLook = new THREE.Vector3();
  let raf = 0;
  const clock = new THREE.Clock();
  let frames = 0;
  let envArmed = false;
  const reduced =
    typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lookTarget = new THREE.Vector3(0, 0.42, 0);
  const lookDesired = new THREE.Vector3(0, 0.42, 0);
  const toward = new THREE.Vector3();
  const hotTarget = new THREE.Vector3();
  const camPos = new THREE.Vector3();

  function setFocus(index: number | null) {
    focus = index;
  }

  function getFocus() {
    return focus;
  }

  function present(index: number | null) {
    presented = index;
    if (index !== null) focus = index;
  }

  function getPresented() {
    return presented;
  }

  function pick(clientX: number, clientY: number): number | null {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(
      pieces.flatMap((p) => p.pickables),
      false,
    );
    if (!hits.length) return null;
    return hits[0]!.object.userData.index as number;
  }

  function setLook(nx: number, ny: number) {
    if (dragging || entering) return;
    lookYaw = -nx * 0.38;
    lookPitch = THREE.MathUtils.clamp(-ny * 0.16, -0.2, 0.2);
  }

  function releaseLook() {
    lookYaw = 0;
    lookPitch = 0;
  }

  function orbit(dx: number, dy: number) {
    orbitYaw -= dx * 0.0048;
    orbitPitch = THREE.MathUtils.clamp(orbitPitch - dy * 0.0032, -0.12, 0.55);
  }

  function setDragging(value: boolean) {
    dragging = value;
    if (value) {
      lookYaw = 0;
      lookPitch = 0;
    }
  }

  function setCompactFraming(on: boolean) {
    if (on) {
      camR = 13.4;
      camYBase = 8.4;
      camera.fov = 46;
      fog.density = 0.02;
    } else {
      camR = 10.6;
      camYBase = 6.4;
      camera.fov = 34;
      fog.density = 0.024;
    }
    camera.updateProjectionMatrix();
  }

  function enter(index: number): Promise<void> {
    entering = true;
    enterT = 0;
    present(index);

    const piece = pieces[index]!;
    piece.group.getWorldPosition(enterLook);
    enterLook.y += 0.45;
    toward.copy(camera.position).sub(enterLook).normalize();
    enterTo.copy(enterLook).addScaledVector(toward, 1.65);
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
    if (camera.aspect < 0.95) setCompactFraming(true);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener("resize", onResize);
  onResize();

  function tick() {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    if (!dragging && !entering && !reduced) {
      const spin = presented === null ? 0.055 : 0.018;
      orbitYaw += spin * dt;
    }

    const targetYaw = orbitYaw + lookYaw;
    const targetPitch = THREE.MathUtils.clamp(orbitPitch + lookPitch, -0.12, 0.55);
    yaw += (targetYaw - yaw) * (dragging ? 0.28 : 0.07);
    pitch += (targetPitch - pitch) * (dragging ? 0.22 : 0.08);

    lookDesired.set(0, 0.42, 0);
    if (presented !== null) {
      pieces[presented]!.group.getWorldPosition(hotTarget);
      lookDesired.lerp(hotTarget, 0.45);
      lookDesired.y = 0.5;
    }
    lookTarget.lerp(lookDesired, 0.06);

    if (!entering) {
      const breathe = reduced ? 0 : Math.sin(t * 0.28) * 0.08;
      const dist = Math.hypot(camR, camYBase);
      const baseElev = Math.atan2(camYBase, camR);
      const elev = THREE.MathUtils.clamp(baseElev + pitch, 0.22, 1.15);
      const cosE = Math.cos(elev);
      camPos.set(Math.cos(yaw) * cosE * dist, Math.sin(elev) * dist + breathe, Math.sin(yaw) * cosE * dist);
      camera.position.lerp(camPos, 0.07);
      camera.lookAt(lookTarget);
    } else {
      enterT += dt;
      const k = Math.min(1, enterT / (reduced ? 0.32 : 0.9));
      const e = k * k * (3 - 2 * k);
      camera.position.lerpVectors(enterFrom, enterTo, e);
      camera.lookAt(enterLook);
      if (k >= 1) {
        enterResolve?.();
        enterResolve = null;
        entering = false;
      }
    }

    for (const piece of pieces) {
      const selected = presented === piece.index;
      const hovered = focus === piece.index;
      const heat = selected ? 1 : hovered ? 0.45 : 0;

      toward.set(camera.position.x - piece.home.x, 0, camera.position.z - piece.home.z);
      if (toward.lengthSq() > 0.0001) toward.normalize();
      else toward.set(0, 0, 1);

      hotTarget.copy(piece.home);
      if (selected) {
        hotTarget.addScaledVector(toward, 1.2);
        hotTarget.y = 0.58;
      }

      piece.group.position.lerp(hotTarget, 0.09);
      const scaleTo = selected ? 1.16 : hovered ? 1.04 : 1;
      const cur = piece.group.scale.x;
      piece.group.scale.setScalar(cur + (scaleTo - cur) * 0.1);

      const rotTo = piece.homeRotY + (reduced || selected ? 0 : Math.sin(t * 0.22 + piece.index) * 0.05);
      piece.group.rotation.y += (rotTo - piece.group.rotation.y) * 0.06;

      for (const m of piece.materials) {
        if (m.userData.baseEmissive === undefined) m.userData.baseEmissive = m.emissiveIntensity;
        const base = m.userData.baseEmissive as number;
        const goal = base + heat * 0.1;
        m.emissiveIntensity += (goal - m.emissiveIntensity) * 0.12;
      }
    }

    renderer.render(scene, camera);

    frames += 1;
    if (!envArmed && frames >= 2) {
      envArmed = true;
      const pmrem = new THREE.PMREMGenerator(renderer);
      const env = new RoomEnvironment();
      scene.environment = pmrem.fromScene(env, 0.05).texture;
      env.dispose();
      pmrem.dispose();
    }
    if (frames === 48) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  tick();

  return {
    pieces,
    camera,
    renderer,
    scene,
    setFocus,
    getFocus,
    present,
    getPresented,
    pick,
    setLook,
    releaseLook,
    setDragging,
    orbit,
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
