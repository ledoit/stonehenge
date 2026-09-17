import * as THREE from "three";
import type { Project } from "../data/projects";

export type StudioPiece = {
  project: Project;
  group: THREE.Group;
  mesh: THREE.Mesh;
  pickables: THREE.Object3D[];
  materials: THREE.MeshStandardMaterial[];
  index: number;
  home: THREE.Vector3;
  homeRotY: number;
};

const LAYOUT: Record<string, { x: number; z: number; rot: number }> = {
  quell: { x: -1.85, z: 0.12, rot: 0.42 },
  freeze: { x: -1.68, z: -1.05, rot: 0.12 },
  gamma: { x: 0.04, z: -1.22, rot: -0.2 },
  strob: { x: 1.78, z: -1.0, rot: 0.08 },
  vecchio: { x: 1.88, z: 0.18, rot: -0.28 },
  paid: { x: 1.22, z: 1.0, rot: 0.18 },
  "matrix-maze": { x: -1.05, z: 1.05, rot: -0.1 },
  inferno: { x: 0.16, z: 0.42, rot: 0.35 },
  jobjeeves: { x: 0.42, z: 1.18, rot: -0.22 },
};

function mat(
  color: string,
  glow: string,
  opts: ConstructorParameters<typeof THREE.MeshPhysicalMaterial>[0] = {},
): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.48,
    metalness: 0.06,
    emissive: new THREE.Color(glow),
    emissiveIntensity: 0.05,
    envMapIntensity: 0.55,
    ...opts,
  });
}

function tag(mesh: THREE.Mesh, index: number): THREE.Mesh {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.index = index;
  return mesh;
}

function collect(root: THREE.Object3D, index: number, pickables: THREE.Object3D[]): THREE.Mesh | null {
  let first: THREE.Mesh | null = null;
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.userData.index = index;
      pickables.push(obj);
      first ??= obj;
    }
  });
  return first;
}

/** GAN / MoYu stickerless ABS — bright plastic faces, cream inners. Never a black core. */
const STICKERLESS = {
  white: "#F6F4EE",
  yellow: "#FFD400",
  red: "#E8332A",
  orange: "#FF7A12",
  green: "#1FBF4A",
  blue: "#1A74E6",
  inner: "#F3EFE6",
} as const;

function absPlastic(hex: string, glow: string): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: hex,
    roughness: 0.36,
    metalness: 0.02,
    envMapIntensity: 0.42,
    emissive: new THREE.Color(glow),
    emissiveIntensity: 0.02,
  });
}

function quellCube(glow: string, index: number, materials: THREE.MeshStandardMaterial[]): THREE.Group {
  const g = new THREE.Group();
  const cubie = 0.22;
  const gap = 0.016;
  const pitch = cubie + gap;
  const lift = cubie * 0.5 + pitch;
  const geo = new THREE.BoxGeometry(cubie, cubie, cubie);

  const plastic = (hex: string) => {
    const m = absPlastic(hex, glow);
    materials.push(m);
    return m;
  };

  // BoxGeometry groups: +x −x +y −y +z −z — exterior faces only; inners are cream ABS.
  const faceHex = [
    STICKERLESS.red,
    STICKERLESS.orange,
    STICKERLESS.white,
    STICKERLESS.yellow,
    STICKERLESS.green,
    STICKERLESS.blue,
  ];
  const outside: Array<[number, 1 | -1]> = [
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [2, 1],
    [2, -1],
  ];
  const colors = faceHex.map((hex) => plastic(hex));
  const cream = plastic(STICKERLESS.inner);

  for (const ix of [-1, 0, 1] as const) {
    for (const iy of [-1, 0, 1] as const) {
      for (const iz of [-1, 0, 1] as const) {
        const coord = [ix, iy, iz];
        const faces = outside.map(([axis, sign], fi) => (coord[axis] === sign ? colors[fi]! : cream));
        const mesh = tag(new THREE.Mesh(geo, faces), index);
        mesh.position.set(ix * pitch, lift + iy * pitch, iz * pitch);
        g.add(mesh);
      }
    }
  }

  return g;
}

function freezeIce(glow: string, index: number, materials: THREE.MeshStandardMaterial[]): THREE.Group {
  const g = new THREE.Group();
  const ice = mat("#8ec9dc", glow, {
    roughness: 0.08,
    metalness: 0.02,
    transmission: 0.72,
    thickness: 0.55,
    ior: 1.38,
    transparent: true,
    opacity: 0.95,
    emissiveIntensity: 0.1,
    attenuationColor: new THREE.Color("#6ec8e0"),
    attenuationDistance: 1.2,
  });
  materials.push(ice);

  const slabs: Array<[number, number, number, number, number]> = [
    [0.82, 0.07, 0.62, 0, 0.05],
    [0.7, 0.06, 0.54, 0.08, 0.13],
    [0.58, 0.055, 0.46, -0.06, 0.205],
  ];
  for (const [w, h, d, x, y] of slabs) {
    const m = tag(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), ice), index);
    m.position.set(x, y, 0);
    m.rotation.y = x * 0.15;
    g.add(m);
  }

  const pause = mat("#d7eef4", glow, { roughness: 0.22, emissiveIntensity: 0.16 });
  materials.push(pause);
  for (const x of [-0.07, 0.07]) {
    const bar = tag(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.2, 0.05), pause), index);
    bar.position.set(x, 0.36, 0);
    g.add(bar);
  }
  return g;
}

function gammaPrism(glow: string, index: number, materials: THREE.MeshStandardMaterial[]): THREE.Group {
  const g = new THREE.Group();
  const glass = mat("#c4544a", glow, {
    roughness: 0.12,
    metalness: 0.15,
    transmission: 0.35,
    thickness: 0.5,
    ior: 1.52,
    iridescence: 1,
    iridescenceIOR: 1.3,
    transparent: true,
    emissiveIntensity: 0.12,
  });
  materials.push(glass);

  const shape = new THREE.Shape();
  shape.moveTo(0, 0.4);
  shape.lineTo(0.34, -0.22);
  shape.lineTo(-0.34, -0.22);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.78,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
  });
  const prism = tag(new THREE.Mesh(geo, glass), index);
  prism.rotation.x = -Math.PI / 2;
  g.add(prism);

  const ring = mat("#d74242", glow, {
    roughness: 0.25,
    metalness: 0.35,
    iridescence: 0.8,
    emissiveIntensity: 0.14,
  });
  materials.push(ring);
  const halo = tag(new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.018, 12, 48), ring), index);
  halo.rotation.x = Math.PI / 2;
  halo.position.y = 0.04;
  g.add(halo);
  return g;
}

function strobLamp(glow: string, index: number, materials: THREE.MeshStandardMaterial[]): THREE.Group {
  const g = new THREE.Group();
  const metal = mat("#3a3836", glow, { roughness: 0.28, metalness: 0.72, emissiveIntensity: 0.03 });
  const bulb = mat("#ff4a96", glow, { roughness: 0.18, metalness: 0.05, emissiveIntensity: 0.55 });
  materials.push(metal, bulb);

  const base = tag(new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.06, 24), metal), index);
  base.position.y = 0.03;
  g.add(base);

  const stem = tag(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.12, 12), metal), index);
  stem.position.y = 0.62;
  g.add(stem);

  const shade = tag(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.16, 20, 1, true), metal), index);
  shade.position.y = 1.18;
  g.add(shade);

  const light = tag(new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 16), bulb), index);
  light.position.y = 1.16;
  g.add(light);
  return g;
}

function vecchioPapers(glow: string, index: number, materials: THREE.MeshStandardMaterial[]): THREE.Group {
  const g = new THREE.Group();
  const sheet = mat("#cbb79a", glow, { roughness: 0.72, metalness: 0.0, emissiveIntensity: 0.04 });
  const fold = mat("#b79d7a", glow, { roughness: 0.68, metalness: 0.0, emissiveIntensity: 0.05 });
  materials.push(sheet, fold);

  for (let i = 0; i < 4; i++) {
    const p = tag(new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.012, 0.78), sheet), index);
    p.position.set(i * 0.035 - 0.05, 0.02 + i * 0.016, i * 0.02);
    p.rotation.y = (i - 1.5) * 0.09;
    p.rotation.z = (i - 1.5) * 0.025;
    g.add(p);
  }

  const letter = tag(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.58, 0.016), fold), index);
  letter.position.set(0.18, 0.31, 0.22);
  letter.rotation.y = -0.35;
  letter.rotation.x = -0.08;
  g.add(letter);
  return g;
}

function paidPlanner(glow: string, index: number, materials: THREE.MeshStandardMaterial[]): THREE.Group {
  const g = new THREE.Group();
  const cover = mat("#3a342c", glow, { roughness: 0.55, metalness: 0.08, emissiveIntensity: 0.04 });
  const gold = mat("#d2b56a", glow, { roughness: 0.32, metalness: 0.45, emissiveIntensity: 0.1 });
  const face = mat("#e4dcc8", glow, { roughness: 0.5, metalness: 0.02, emissiveIntensity: 0.03 });
  const hand = mat("#2a2620", glow, { roughness: 0.4, metalness: 0.2, emissiveIntensity: 0.02 });
  materials.push(cover, gold, face, hand);

  const book = tag(new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.1, 0.62), cover), index);
  book.position.y = 0.05;
  g.add(book);

  const block = tag(new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.2, 0.28), gold), index);
  block.position.set(-0.22, 0.2, 0.08);
  g.add(block);

  const clock = tag(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 32), face), index);
  clock.rotation.x = Math.PI / 2;
  clock.position.set(0.22, 0.18, 0.02);
  g.add(clock);

  const bezel = tag(new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.018, 8, 28), gold), index);
  bezel.position.copy(clock.position);
  g.add(bezel);

  const hour = tag(new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.09, 0.012), hand), index);
  hour.position.set(0.22, 0.21, 0.03);
  hour.rotation.z = -0.7;
  g.add(hour);
  const minute = tag(new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.12, 0.01), hand), index);
  minute.position.set(0.26, 0.24, 0.03);
  minute.rotation.z = 0.45;
  g.add(minute);
  return g;
}

function mazeTile(glow: string, index: number, materials: THREE.MeshStandardMaterial[]): THREE.Group {
  const g = new THREE.Group();
  const floor = mat("#243028", glow, { roughness: 0.7, metalness: 0.05, emissiveIntensity: 0.04 });
  const wall = mat("#2f4a36", glow, { roughness: 0.55, metalness: 0.08, emissiveIntensity: 0.08 });
  materials.push(floor, wall);

  const base = tag(new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.08, 0.98), floor), index);
  base.position.y = 0.04;
  g.add(base);

  const segs: Array<[number, number, number, number]> = [
    [0, -0.45, 0.98, 0.08],
    [0, 0.45, 0.98, 0.08],
    [-0.45, 0, 0.08, 0.98],
    [0.45, -0.08, 0.08, 0.7],
    [-0.12, 0.08, 0.08, 0.52],
    [0.14, -0.12, 0.44, 0.08],
    [0.18, 0.22, 0.08, 0.36],
  ];
  for (const [x, z, w, d] of segs) {
    const m = tag(new THREE.Mesh(new THREE.BoxGeometry(w, 0.42, d), wall), index);
    m.position.set(x, 0.29, z);
    g.add(m);
  }
  return g;
}

function infernoCoals(glow: string, index: number, materials: THREE.MeshStandardMaterial[]): THREE.Group {
  const g = new THREE.Group();
  const iron = mat("#2a1c16", glow, { roughness: 0.72, metalness: 0.28, emissiveIntensity: 0.04 });
  const coal = mat("#3a2218", glow, { roughness: 0.8, metalness: 0.06, emissiveIntensity: 0.1 });
  const ember = mat("#ff5a1f", glow, { roughness: 0.42, metalness: 0.04, emissiveIntensity: 0.72 });
  const flame = mat("#ff7a18", glow, { roughness: 0.38, metalness: 0.0, emissiveIntensity: 0.88 });
  const range = mat("#e8b86d", glow, { roughness: 0.32, metalness: 0.18, emissiveIntensity: 0.42 });
  materials.push(iron, coal, ember, flame, range);

  const dish = tag(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.48, 0.07, 24), iron), index);
  dish.position.y = 0.035;
  g.add(dish);

  const lumps: Array<[number, number, number, number, number, number]> = [
    [0.0, 0.1, 0.0, 0.16, 0.1, 0.14],
    [0.13, 0.09, 0.07, 0.12, 0.08, 0.1],
    [-0.12, 0.09, 0.06, 0.11, 0.09, 0.1],
    [0.04, 0.09, -0.13, 0.13, 0.07, 0.11],
    [-0.07, 0.11, -0.09, 0.1, 0.08, 0.09],
    [0.09, 0.12, -0.02, 0.09, 0.07, 0.08],
  ];
  for (const [x, y, z, w, h, d] of lumps) {
    const m = tag(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), coal), index);
    m.position.set(x, y, z);
    m.rotation.y = x * 2.4;
    g.add(m);
  }

  for (const [x, z] of [
    [0.02, 0.01],
    [-0.08, 0.05],
    [0.09, -0.06],
  ] as const) {
    const e = tag(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, 0.05), ember), index);
    e.position.set(x, 0.155, z);
    g.add(e);
  }

  const fireRing = tag(new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.048, 10, 40), flame), index);
  fireRing.rotation.x = Math.PI / 2;
  fireRing.position.y = 0.07;
  g.add(fireRing);

  const rangeRing = tag(new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.016, 8, 48), range), index);
  rangeRing.rotation.x = Math.PI / 2;
  rangeRing.position.y = 0.028;
  g.add(rangeRing);

  const tongue = new THREE.ConeGeometry(0.038, 0.14, 5);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const f = tag(new THREE.Mesh(tongue, flame), index);
    f.position.set(Math.cos(a) * 0.36, 0.15, Math.sin(a) * 0.36);
    g.add(f);
  }

  return g;
}

function jobjeevesDesk(glow: string, index: number, materials: THREE.MeshStandardMaterial[]): THREE.Group {
  const g = new THREE.Group();
  const blotter = mat("#2c3832", glow, { roughness: 0.62, metalness: 0.08, emissiveIntensity: 0.04 });
  const file = mat("#d8ddd6", glow, { roughness: 0.48, metalness: 0.04, emissiveIntensity: 0.02 });
  const tab = mat("#3d5c4a", glow, { roughness: 0.4, metalness: 0.06, emissiveIntensity: 0.12 });
  materials.push(blotter, file, tab);

  const base = tag(new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.06, 0.62), blotter), index);
  base.position.y = 0.03;
  g.add(base);

  const sheets: Array<[number, number, number]> = [
    [-0.06, 0.09, 0.08],
    [0.04, 0.12, -0.04],
    [-0.02, 0.16, 0.02],
  ];
  for (const [x, y, z] of sheets) {
    const s = tag(new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.02, 0.44), file), index);
    s.position.set(x, y, z);
    s.rotation.y = x * 0.4;
    g.add(s);
  }

  const clip = tag(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.08), tab), index);
  clip.position.set(-0.12, 0.2, -0.16);
  g.add(clip);
  return g;
}

function fallbackBlock(project: Project, index: number, materials: THREE.MeshStandardMaterial[]): THREE.Group {
  const g = new THREE.Group();
  const m = mat("#4a463c", project.glow, { roughness: 0.5 });
  materials.push(m);
  const mesh = tag(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), m), index);
  mesh.position.y = 0.3;
  g.add(mesh);
  return g;
}

export function createPiece(project: Project, index: number): StudioPiece {
  const materials: THREE.MeshStandardMaterial[] = [];
  const pickables: THREE.Object3D[] = [];
  const builders: Record<string, () => THREE.Group> = {
    quell: () => quellCube(project.glow, index, materials),
    freeze: () => freezeIce(project.glow, index, materials),
    gamma: () => gammaPrism(project.glow, index, materials),
    strob: () => strobLamp(project.glow, index, materials),
    vecchio: () => vecchioPapers(project.glow, index, materials),
    paid: () => paidPlanner(project.glow, index, materials),
    "matrix-maze": () => mazeTile(project.glow, index, materials),
    inferno: () => infernoCoals(project.glow, index, materials),
    jobjeeves: () => jobjeevesDesk(project.glow, index, materials),
  };

  const inner = (builders[project.id] ?? (() => fallbackBlock(project, index, materials)))();
  const scale = 0.78 + (project.height - 3) * 0.22;
  inner.scale.setScalar(scale);

  const layout = LAYOUT[project.id] ?? {
    x: Math.cos((index / 8) * Math.PI * 2) * 2.2,
    z: Math.sin((index / 8) * Math.PI * 2) * 1.4,
    rot: 0,
  };

  const group = new THREE.Group();
  group.position.set(layout.x, 0.02, layout.z);
  group.rotation.y = layout.rot;
  group.add(inner);

  const mesh = collect(group, index, pickables) ?? (inner.children[0] as THREE.Mesh);

  return {
    project,
    group,
    mesh,
    pickables,
    materials,
    index,
    home: group.position.clone(),
    homeRotY: layout.rot,
  };
}
