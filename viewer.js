const mv = document.getElementById("mv");
const partSelect = document.getElementById("partSelect");
const paletteEl = document.getElementById("palette");
const customColor = document.getElementById("customColor");
const shareBtn = document.getElementById("share");

const PALETTE = [
  "#000000",
  "#ffffff",
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ff69b4"
];

const selections = {};

/* -----------------------------
   Load GLB from URL
--------------------------------*/
const params = new URLSearchParams(window.location.search);
const glbUrl = params.get("glb");

if (glbUrl) {
  mv.src = glbUrl;
}

/* -----------------------------
   Wait for REAL model readiness
--------------------------------*/
mv.addEventListener("model-visibility", () => {
  if (!mv.model) {
    console.warn("Model not ready yet");
    return;
  }

  console.log("Model ready");
  console.log("Materials:", mv.model.materials);

  populateParts(mv.model.materials);
});

/* -----------------------------
   Populate material list
--------------------------------*/
function populateParts(materials) {
  partSelect.innerHTML = "";

  if (!materials || materials.length === 0) {
    partSelect.innerHTML = `<option>No materials found</option>`;
    return;
  }

  materials.forEach((mat, index) => {
    const opt = document.createElement("option");
    opt.value = index;
    opt.textContent = mat.name || `Material ${index + 1}`;
    partSelect.appendChild(opt);
  });
}

/* -----------------------------
   Build color palette
--------------------------------*/
PALETTE.forEach(hex => {
  const sw = document.createElement("button");
  sw.style.background = hex;
  sw.style.width = "28px";
  sw.style.height = "28px";
  sw.style.border = "1px solid #000";
  sw.style.margin = "4px";
  sw.onclick = () => applyColor(hex);
  paletteEl.appendChild(sw);
});

customColor.addEventListener("input", e => {
  applyColor(e.target.value);
});

/* -----------------------------
   Apply color to material
--------------------------------*/
function applyColor(hex) {
  if (!mv.model) return;

  const index = partSelect.value;
  const mat = mv.model.materials[index];
  if (!mat) return;

  const rgba = hexToRGBA(hex);
  mat.pbrMetallicRoughness.setBaseColorFactor(rgba);

  selections[mat.name || index] = hex;
}

/* -----------------------------
   Share link
--------------------------------*/
shareBtn.addEventListener("click", () => {
  const url = new URL(window.location.href);
  navigator.clipboard.writeText(url.toString());
  alert("Share link copied");
});

/* -----------------------------
   Utils
--------------------------------*/
function hexToRGBA(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
    1
  ];
}


