const mv = document.getElementById("mv");
const partSelect = document.getElementById("partSelect");
const paletteEl = document.getElementById("palette");
const customColor = document.getElementById("customColor");
const shareBtn = document.getElementById("share");

const params = new URLSearchParams(window.location.search);
const glbUrl = params.get("glb");

if (glbUrl) {
  mv.src = glbUrl;
}

const selections = {};
const COLORS = ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff"];

function hexToRGBA(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0,2),16)/255,
    parseInt(h.substring(2,4),16)/255,
    parseInt(h.substring(4,6),16)/255,
    1
  ];
}

mv.addEventListener("load", () => {
  if (!mv.model || !mv.model.materials) {
    console.error("Model materials not available");
    return;
  }

  partSelect.innerHTML = "";

  mv.model.materials.forEach(mat => {
    const name = mat.name || "Unnamed";
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    partSelect.appendChild(opt);
  });

  buildPalette();
});

function buildPalette() {
  paletteEl.innerHTML = "";
  COLORS.forEach(hex => {
    const btn = document.createElement("button");
    btn.style.background = hex;
    btn.style.width = "30px";
    btn.style.height = "30px";
    btn.style.margin = "4px";
    btn.onclick = () => applyColor(hex);
    paletteEl.appendChild(btn);
  });
}

function applyColor(hex) {
  const part = partSelect.value;
  if (!part) return;

  const mat = mv.model.materials.find(m => m.name === part);
  if (!mat) return;

  mat.pbrMetallicRoughness.setBaseColorFactor(hexToRGBA(hex));
  selections[part] = hex;
}

customColor.addEventListener("input", e => {
  applyColor(e.target.value);
});

shareBtn.addEventListener("click", () => {
  const url = new URL(window.location.href);
  const parts = Object.entries(selections)
    .map(([k,v]) => `${encodeURIComponent(k)}:${v.replace("#","")}`)
    .join(",");
  if (parts) url.searchParams.set("parts", parts);
  navigator.clipboard.writeText(url.toString());
  shareBtn.textContent = "Copied!";
});



mv.addEventListener('model-visibility', () => {
  console.log('=== MODEL READY ===');

  const model = mv.model;
  if (!model) {
    console.error('No mv.model');
    return;
  }

  console.log('Materials:', model.materials);
  console.log('Material names:');
  model.materials.forEach((m, i) => {
    console.log(i, m.name, typeof m.name);
  });

  console.log('Meshes:');
  model.meshes?.forEach((mesh, i) => {
    console.log(i, mesh.name);
  });
});

