const mv = document.getElementById('mv');
const partSelect = document.getElementById('partSelect');
const paletteEl = document.getElementById('palette');
const customColor = document.getElementById('customColor');
const shareBtn = document.getElementById('share');


let selections = {};
let MATERIAL_MODE = 'materials';


// --- Read Shopify blog data from URL ---
// Example:
// ?glb=https://cdn.shopify.com/...model.glb&colors=Red:#ff0000,Blue:#0044ff


const params = new URLSearchParams(location.search);
const GLB_URL = params.get('glb');
const COLORS_RAW = params.get('colors') || 'Primary:#ff0000,Secondary:#00ff00';


if (!GLB_URL) {
document.body.innerHTML = '<h2>Missing GLB URL</h2>';
throw new Error('No GLB URL');
}


mv.src = GLB_URL;


// --- Palette ---
const palette = COLORS_RAW.split(',').map(p => {
const [label, hex] = p.split(':');
return { label, hex: hex.startsWith('#') ? hex : `#${hex}` };
});


palette.forEach(c => {
const sw = document.createElement('div');
sw.className = 'swatch';
sw.style.background = c.hex;
sw.onclick = () => applyColor(c.hex);
paletteEl.appendChild(sw);
});


// --- SceneGraph ---
mv.addEventListener('load', async () => {
await mv.updateComplete;
const sg = mv.sceneGraph;


const mats = sg.materials || [];
MATERIAL_MODE = mats.length ? 'materials' : 'nodes';


const names = MATERIAL_MODE === 'materials'
? mats.map(m => m.name)
: sg.model.children.map(n => n.name);


partSelect.innerHTML = '';
names.forEach(n => {
const o = document.createElement('option');
o.textContent = o.value = n;
partSelect.appendChild(o);
});
});


function applyColor(hex) {
const part = partSelect.value;
const sg = mv.sceneGraph;
const rgba = hexToRGBA(hex);


if (MATERIAL_MODE === 'materials') {
const mat = sg.materials.find(m => m.name === part);
mat?.pbrMetallicRoughness?.setBaseColorFactor(rgba);
}


};