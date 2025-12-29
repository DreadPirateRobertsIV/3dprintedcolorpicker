const mv = document.getElementById('mv');
const partSelect = document.getElementById('partSelect');
const palette = document.getElementById('palette');
const customColor = document.getElementById('customColor');
const shareBtn = document.getElementById('share');

// Load GLB from URL
const params = new URLSearchParams(window.location.search);
const glbUrl = params.get('glb');

if (glbUrl) {
  mv.src = glbUrl;
  console.log('Loading GLB:', glbUrl);
}

// Simple palette
const COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000'];
COLORS.forEach(hex => {
  const btn = document.createElement('button');
  btn.style.background = hex;
  btn.style.width = '28px';
  btn.style.height = '28px';
  btn.onclick = () => applyColor(hex);
  palette.appendChild(btn);
});

let materials = [];

mv.addEventListener('load', async () => {
  await mv.updateComplete;
  const sg = mv.sceneGraph;

  if (!sg || !sg.materials || !sg.materials.length) {
    console.error('No materials found');
    return;
  }

  materials = sg.materials;
  partSelect.innerHTML = '';

  materials.forEach(mat => {
    const opt = document.createElement('option');
    opt.value = mat.name;
    opt.textContent = mat.name;
    partSelect.appendChild(opt);
  });

  console.log('Materials:', materials.map(m => m.name));
});

function applyColor(hex) {
  const mat = materials.find(m => m.name === partSelect.value);
  if (!mat) return;

  const r = parseInt(hex.substr(1,2),16)/255;
  const g = parseInt(hex.substr(3,2),16)/255;
  const b = parseInt(hex.substr(5,2),16)/255;

  mat.pbrMetallicRoughness.setBaseColorFactor([r,g,b,1]);
}

shareBtn.onclick = () => {
  navigator.clipboard.writeText(window.location.href);
  alert('Link copied');
};

