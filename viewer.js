const mv = document.getElementById("mv");
const partSelect = document.getElementById("partSelect");
const palette = document.getElementById("palette");
const customColor = document.getElementById("customColor");
const shareBtn = document.getElementById("share");

// ---- READ URL PARAMS ----
const params = new URLSearchParams(window.location.search);
const glbUrl = params.get("glb");
const colorsParam = params.get("colors");

// ---- LOAD MODEL ----
if (!glbUrl) {
  console.error("No GLB URL provided");
} else {
  console.log("Loading GLB:", glbUrl);
  mv.src = glbUrl;
}

// ---- COLOR PALETTE ----
let PALETTE = [
  { label: "Black", hex: "#000000" },
  { label: "White", hex: "#ffffff" },
  { label: "Red", hex: "#ff0000" },
];

if (colorsParam) {
  PALETTE = colorsParam.split(",").map(item => {
    const [label, hex] = item.split(":");
    return { label, hex: "#" + hex.replace("#", "") };
  });
}

// ---- BUILD PALETTE UI ----
palette.innerHTML = "";
PALETTE.forEach(c => {
  const btn = document.createElement("button");
  btn.style.background = c.hex;
  btn.className = "swatch";
  btn.title = c.label;
  btn.onclick = () => applyColor(c.hex);
  palette.appendChild(btn);
});

// ---- WAIT FOR MODEL ----
mv.addEventListener("load", async () => {
  await mv.updateComplete;

  const sg = mv.sceneGraph;
  console.log("SceneGraph:", sg);

  if (!sg || !sg.materials || sg.materials.length === 0) {
    console.error("No materials found in model");
    return;
  }

  // Populate part dropdown
  partSelect.innerHTML = "";
  sg.materials.forEach(mat => {
    const opt = document.createElement("option");
    opt.value = mat.name;
    opt.textContent = mat.name;
    partSelect.appendChild(opt);
  });
});

// ---- APPLY COLOR ----
function applyColor(hex) {
  const matName = partSelect.value;
  if (!matName) return;

  const mat = mv.sceneGraph.materials.find(m => m.name === matName);
  if (!mat) return;

  const rgb = hexToRGBA(hex);
  mat.pbrMetallicRoughness.setBaseColorFactor(rgb);
}

// ---- SHARE LINK ----
shareBtn.onclick = () => {
  navigator.clipboard.writeText(window.location.href);
  shareBtn.textContent = "Copied!";
  setTimeout(() => (shareBtn.textContent = "Copy Share Link"), 1500);
};

// ---- HELPERS ----
function hexToRGBA(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
    1,
  ];
}
