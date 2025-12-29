const mv = document.getElementById("mv");
const partSelect = document.getElementById("partSelect");
const paletteEl = document.getElementById("palette");
const customColor = document.getElementById("customColor");
const shareBtn = document.getElementById("share");

const params = new URLSearchParams(window.location.search);
const glbUrl = params.get("glb");

// ---- Load model from URL ----
if (glbUrl) {
  mv.src = glbUrl;
} else {
  console.warn("No ?glb= URL provided");
}

// ---- Palette (example, can be dynamic later) ----
const PALETTE = [
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#000000",
  "#ffffff"
];

// ---- State ----
const selections = {};

// ---- When model is fully loaded ----
mv.addEventListener("load", async () => {
  console.log("Model loaded");
  await mv.updateComplete;

  const sg = mv.sceneGraph;

  if (!sg) {
    console.error("SceneGraph not available");
    return;
  }

  console.log("SceneGraph:", sg);

  // ---- Read materials FIRST (most reliable) ----
  const materials = sg.materials || [];

  if (!materials.length) {
    console.warn("No materials found in SceneGraph");
    return;
  }

  // ---- Populate part picker ----
  partSelect.innerHTML = "";
  materials.forEach(mat => {
    if (!mat.name) return;
    const opt = document.createElement("option");
    opt.value = mat.name;
    opt.textContent = mat.name;
    partSelect.appendChild(opt);
  });

  console.log("Materials loaded:", materials.map(m => m.name));

  // ---- Build palette UI ----
  renderPalette();
});

// ---- Palette UI ----
function renderPalette() {
  paletteEl.innerHTML = "";
  PALETTE.forEach(hex => {
    const btn = document.createElement("button");
    btn.style.background = hex;
    btn.style.width = "28px";
    btn.style.height = "28px";
    btn.style.margin = "4px";
    btn.style.border = "1px solid #ccc";
    btn.onclick = () => applyColor(hex);
    paletteEl.appendChild(btn);
  });
}

// ---- Apply color ----
function applyColor(hex) {
  const part = partSelect.value;
  if (!part) return;

  const mat = mv.sceneGraph.materials.find(m => m.name === part);
  if (!mat) return;

  const rgba = hexToRgba(hex);
  mat.pbrMetallicRoughness.setBaseColorFactor(rgba);

  selections[part] = hex;
}

// ---- Share link ----
shareBtn.onclick = () => {
  const url = new URL(window.location.href);
  url.searchParams.set(
    "parts",
    Object.entries(selections)
      .map(([k, v]) => `${encodeURIComponent(k)}:${v.replace("#", "")}`)
      .join(",")
  );
  navigator.clipboard.writeText(url.toString());
  alert("Share link copied!");
};

// ---- Helpers ----
function hexToRgba(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
    1
  ];
}

