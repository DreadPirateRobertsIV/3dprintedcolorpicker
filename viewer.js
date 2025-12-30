const canvas = document.getElementById('viewer');
const partSelect = document.getElementById('partSelect');
const palette = document.getElementById('palette');
const customColor = document.getElementById('customColor');
const shareBtn = document.getElementById('share');

const params = new URLSearchParams(window.location.search);
const glbUrl = params.get('glb');
const partsParam = params.get('parts');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf2f2f2);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / 420, 0.1, 100);
camera.position.set(0, 1.2, 2.5);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, 420);

const controls = new THREE.OrbitControls(camera, canvas);
controls.enableDamping = true;

scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(3, 5, 3);
scene.add(dir);

const loader = new THREE.GLTFLoader();

const materials = {}; // name → material

loader.load(glbUrl, (gltf) => {
  scene.add(gltf.scene);

  gltf.scene.traverse(obj => {
    if (obj.isMesh && obj.material) {
      const mat = obj.material;
      const name = mat.name || obj.name;
      if (!materials[name]) {
        materials[name] = mat;
      }
    }
  });

  buildPartList();
});

function buildPartList() {
  partSelect.innerHTML = '';
  Object.keys(materials).forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    partSelect.appendChild(opt);
  });
}

function applyColor(hex) {
  const mat = materials[partSelect.value];
  if (!mat) return;
  mat.color.set(hex);
}

palette.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  applyColor(btn.dataset.color);
});

customColor.addEventListener('input', e => applyColor(e.target.value));

shareBtn.addEventListener('click', () => {
  const url = new URL(location.href);
  navigator.clipboard.writeText(url.toString());
  alert('Link copied!');
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

