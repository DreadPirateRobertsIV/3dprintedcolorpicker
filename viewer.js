const mv = document.getElementById("mv");
const partSelect = document.getElementById("partSelect");
const paletteEl = document.getElementById("palette");
const customColor = document.getElementById("customColor");
const shareBtn = document.getElementById("share");

const DEFAULT_COLORS = ["#ff0000", "#00ff00", "#0000ff", "#ffffff", "#000000"];
const selections = {};

// --------------------------------------------------
// Load model from URL
// --------------------------------------------------
const params = new URLSearchParams(window.location.search);
const glbUrl = params.get("glb");

if (glbUrl) {
  mv.src = glbUrl;
}

// --------------------------------------------------
// WAIT FOR SCENEGRAPH (THIS IS CRITICAL)
// --------------------------------------------------
mv.addEventListener("load", async () => {
  await mv.updateComplete;
  console.log("Model loaded, scanning materials...");
  populateParts();
});

// --------------------------------------------------
// Extract materials properly
// --------------------------------------------------
function populateParts() {
  const sg = mv.sceneGraph;
  if (!sg) {
    console.error("SceneGraph missing");
    return;
  }

  const materials = new Map();

  sg.model.traverse((node) => {
    if (!node.material) return;

    const mats = Array.isArray(node.material)
      ? node.material
      : [node.material];

    mats.forEach((mat) => {
      if (mat.name) {
        materials.set(mat.name, mat);
      }
    });
  });

  if (!materials.size) {
    partSelect.innerHTML = `<option>No materials detected</option>`;
    console.error("No materials found in sceneGraph traversal");
    return;
  }

  partSelect.innerHTML = "";
  materials.forEach((_, name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    partSelect.appendChild(opt);
  });

  renderPalette(materials);
}

// --------------------------------------------------
// Palette UI
// --------------------------------------------------
function renderPalette(materials) {
  paletteEl.innerHTML = "";

  DEFAULT_COLORS.forEach((hex) => {
    const btn = document.createElement("button");
    btn.style.background = hex;
    btn.style.width = "28px";
    btn.style.height = "28px";
    btn.style.borderRadius = "6px";
    btn.style.border = "1px solid #999";
    btn.style.cursor = "pointer";

    btn.onclick = () => {
      applyColor(partSelect.value, hex, materials);
    };

    paletteEl.appendChild(btn);
  });

  customColor.onchange = () => {
    applyColor(partSelect.value, customColor.value, materials);
  };
}

// --------------------------------------------------
// Apply color (THIS is the magic)
// --------------------------------------------------
function applyColor(partName, hex, materials) {
  const sg = mv.sceneGraph;
  if (!sg) return;

  const rgb = hexToRGB(hex);

  sg.model.traverse((node) => {
    if (!node.material) return;

    const mats = Array.isArray(node.material)
      ? node.material
      : [node.material];

    mats.forEach((mat) => {
      if (mat.name === partName && mat.pbrMetallicRoughness) {
        mat.pbrMetallicRoughness.setBaseColorFactor([...rgb, 1]);
      }
    });
  });

  selections[partName] = hex;
}

// --------------------------------------------------
// Share link
// --------------------------------------------------
shareBtn.onclick = () => {
  const url = new URL(window.location.href);
  url.searchParams.set("glb", mv.src);

  const parts = Object.entries(selections)
    .map(([k, v]) => `${encodeURIComponent(k)}:${v.replace("#", "")}`)
    .join(",");

  if (parts) url.searchParams.set("parts", parts);

  navigator.clipboard.writeText(url.toString());
  alert("Share link copied!");
};

// --------------------------------------------------
function hexToRGB(hex) {
  hex = hex.replace("#", "");
  return [
    parseInt(hex.slice(0, 2), 16) / 255,
    parseInt(hex.slice(2, 4), 16) / 255,
    parseInt(hex.slice(4, 6), 16) / 255,
  ];
}

