import * as THREE from "three";
import type { Project } from "../data/projects";
import { stoneFragment, stoneVertex } from "./shaders";

export type MenhirStone = {
  project: Project;
  group: THREE.Group;
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  index: number;
  baseY: number;
};

function jaggedMenhir(height: number, seed: number): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(0.55, 0.72, height, 6, 6, false);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = Math.sin(v.y * 2.1 + seed) * 0.08 + Math.cos(v.x * 5.0 + seed * 1.7) * 0.05;
    const taper = 1.0 - Math.max(0, v.y / height) * 0.18;
    v.x *= taper + n;
    v.z *= taper - n * 0.6;
    if (v.y > height * 0.42) {
      v.y += Math.sin(v.x * 4.0 + seed) * 0.07;
    }
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geo.computeVertexNormals();
  return geo;
}

export function createStone(project: Project, index: number, count: number): MenhirStone {
  const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
  const radius = 5.4;
  const group = new THREE.Group();
  group.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  group.lookAt(0, 0, 0);
  group.rotateY(Math.PI);

  const material = new THREE.ShaderMaterial({
    vertexShader: stoneVertex,
    fragmentShader: stoneFragment,
    uniforms: {
      uColor: { value: new THREE.Color("#4a463c") },
      uGlow: { value: new THREE.Color(project.glow) },
      uHot: { value: 0 },
      uTime: { value: 0 },
    },
  });

  const mesh = new THREE.Mesh(jaggedMenhir(project.height, index * 12.9), material);
  mesh.position.y = project.height / 2;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.userData.projectId = project.id;
  mesh.userData.index = index;
  group.add(mesh);

  // Cap lichen speck
  const speck = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    new THREE.MeshBasicMaterial({ color: project.glow, transparent: true, opacity: 0.55 }),
  );
  speck.position.set(0.15, project.height * 0.72, 0.35);
  group.add(speck);

  return {
    project,
    group,
    mesh,
    material,
    index,
    baseY: 0,
  };
}
