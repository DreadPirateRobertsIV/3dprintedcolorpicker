const mv = document.getElementById("mv");
const partSelect = document.getElementById("partSelect");
const paletteEl = document.getElementById("palette");
const customColor = document.getElementById("customColor");
const shareBtn = document.getElementById("share");

/* ---------- Load GLB from URL ---------- */
const params = new URLSearchParams(window.location.search);
const glbUrl = params.get("glb");

if (glbUrl) {
  mv.src = glbUrl;
} else {
  console.warn("No ?glb= parameter found");
}

/* ---------- Palette ---------- */
const DEFAULT_COLORS = ["#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff"];

buildPalette(DEFAULT_COLORS);

/* ---------- SceneGraph READY ---------- */
mv.addEventListener("scene-graph-ready", () => {
  console.log("SceneGraph ready ✅");

  const sg = mv.sceneGraph;

  if (!sg || !sg.materials || sg.materials.length === 0) {
    console.error("No materials detected in SceneGraph", sg);
    return;
  }

  console.log(
    "Detected materials:",
    sg.materials.map(m => m.name)
  );

  // Populate dropdown
  partSelect.innerHTML = "";
  sg.materials.forEach(mat => {
    if (!mat.name) return;
    const opt = document.createElement("option");
    opt.value = mat.name;
    opt.textContent = mat.name;
    partSelect.appendChild(opt);
  });
});

/* ---------- Apply Color ---------- */
paletteEl.addEventListener("click", e => {
  const swatch = e.target.closest(".swatch");
  if (!swatch) return;

  const color = swatch.dataset.color;
  const part = partSelect.value;
  if (!part) return;

  applyColor(part, color);
});

customColor.addEventListener("input", e => {
  const part = partSelect.value;
  if (!part) return;
  applyColor(part, e.target.value);
});

function applyColor(materialName, hex) {
  const mat = mv.sceneGraph.materials.find(m => m.name === materialName);
  if (!mat) return;

  const rgba = hexToRgba(hex);
  mat.pbrMetallicRoughness.setBaseColorFactor(rgba);
}

/* ---------- Helpers ---------- */
function buildPalette(colors) {
  paletteEl.innerHTML = "";
  colors.forEach(c => {
    const b = document.createElement("button");
    b.className = "swatch";
    b.style.background = c;
    b.dataset.color = c;
    paletteEl.appendChild(b);
  });
}

function hexToRgba(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
    1
  ];
}

/* ---------- Share Link ---------- */
shareBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(window.location.href);
  shareBtn.textContent = "Copied!";
  setTimeout(() => (shareBtn.textContent = "Copy Share Link"), 1200);
});

