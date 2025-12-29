const mv = document.getElementById("mv");
const partSelect = document.getElementById("partSelect");
const palette = document.getElementById("palette");
const customColor = document.getElementById("customColor");
const shareBtn = document.getElementById("share");

// --- Load GLB from URL ---
const params = new URLSearchParams(window.location.search);
const glbUrl = params.get("glb");

if (!glbUrl) {
  alert("No GLB URL provided");
} else {
  mv.src = glbUrl;
}

// --- Hardcoded palette (for now) ---
const COLORS = ["#ff0000", "#00ff00", "#0000ff", "#ffffff", "#000000"];

// --- Track selections ---
const selections = {};

// --- Wait for model-viewer to fully load ---
mv.addEventListener("load", async () => {
  await mv.updateComplete;

  const sg = mv.sceneGraph;

  if (!sg || !sg.materials || sg.materials.length === 0) {
    console.error("SceneGraph has no materials", sg);
    alert("No materials detected in model");
    return;
  }

  console.log("Materials found:", sg.materials);

  // Populate part dropdown
  partSelect.innerHTML = "";
  sg.materials.forEach(mat => {
    if (!mat.name) return;
    const opt = document.createElement("option");
    opt.value = mat.name;
    opt.textContent = mat.name;
    partSelect.appendChild(opt);
  });

  // Build palette
  palette.innerHTML = "";
  COLORS.forEach(hex => {
    const sw = document.createElement("button");
    sw.style.background = hex;
    sw.style.width = "30px";
    sw.style.height = "30px";
    sw.style.margin = "4px";
    sw.onclick = () => applyColor(hex);
    palette.appendChild(sw);
  });
});

// --- Apply color ---
function applyColor(hex) {
  const part = partSelect.value;
  if (!part) return;

  const mat = mv.sceneGraph.materials.find(m => m.name === part);
  if (!mat) {
    console.error("Material not found:", part);
    return;
  }

  const rgba = hexToRGBA(hex);
  mat.pbrMetallicRoughness.setBaseColorFactor(rgba);
  selections[part] = hex;
}

// --- Custom color ---
customColor.addEventListener("input", e => {
  applyColor(e.target.value);
});

// --- Share link ---
shareBtn.onclick = () => {
  const url = new URL(window.location.href);
  const parts = Object.entries(selections)
    .map(([k, v]) => `${encodeURIComponent(k)}:${v.replace("#", "")}`)
    .join(",");
  if (parts) url.searchParams.set("parts", parts);
  navigator.clipboard.writeText(url.toString());
  alert("Share link copied");
};

// --- Utils ---
function hexToRGBA(hex) {
  hex = hex.replace("#", "");
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
    1
  ];
}

