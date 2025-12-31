import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

const container = document.getElementById("viewer");
const select = document.getElementById("partSelect");
const colorInput = document.getElementById("colorPicker");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5f5f5);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / 400, 0.1, 100);
camera.position.set(0, 1.5, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, 400);
container.appendChild(renderer.domElement);

const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
scene.add(light);

const loader = new GLTFLoader();

// 🔴 REPLACE THIS WITH ANY GLB URL (Shopify CDN later)
const GLB_URL = "https://threejs.org/examples/models/gltf/DamagedHelmet/glTF-Binary/DamagedHelmet.glb";

const parts = {};

loader.load(GLB_URL, (gltf) => {
  scene.add(gltf.scene);

  gltf.scene.traverse(obj => {
    if (obj.isMesh && obj.material) {
      const name = obj.material.name || obj.name;
      if (!parts[name]) {
        parts[name] = obj.material;
      }
    }
  });

  console.log("Detected parts:", Object.keys(parts));

  Object.keys(parts).forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
});

colorInput.addEventListener("input", () => {
  const mat = parts[select.value];
  if (!mat) return;
  mat.color.set(colorInput.value);
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

