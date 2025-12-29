const mv = document.getElementById("mv");
const partSelect = document.getElementById("partSelect");
const paletteEl = document.getElementById("palette");
const customColor = document.getElementById("customColor");
const shareBtn = document.getElementById("share");

const selections = {};
const PALETTE = ["#ff0000", "#00ff00", "#0000ff", "#ffffff", "#000000"];

// ---- Load GLB from URL ----
const params = new URLSearchParams(window.location.search);
const glbUrl = params.get("glb");

if (glbUrl) {
  mv.src = glbUrl;
}

// ---- When model loads ----
mv.addEventListener("load", async () => {
  await mv.updateComplete;

  const scene = mv.sceneGraph?.model;
  if (!scene) {
    console.error("SceneGraph missing");
    return;
  }

  // Collect named nodes
  const nodes = [];
  scene.traverse((obj) => {
    if (obj.isMesh && obj.name) {
      nodes.push(obj);
    }
  });

  if (!nodes.length) {
    partSelect.innerHTML = `<option>No parts found</option>`;
    return;
  }

  partSelect.innerHTML = "";
  nodes.forEach((n) => {
    const opt = document.createElement("option");
    opt.value = n.name;
    opt.textContent = n.name;
    partSelect.appendChild(opt);
  });

  buildPalette(nodes);
  applyFromURL(nodes);
});

// ---- Palette UI ----
function buildPalette(nodes) {
  paletteEl.innerHTML = "";

  PALETTE.forEach((hex) => {
    const btn = document.createElement("button");
    btn.style.background = hex;
    btn.style.width = "28px";
    btn.style.height = "28px";
    btn.style.margin = "4px";
    btn.onclick = () => applyColor(nodes, hex);
    paletteEl.appendChild(btn);
  });

  customColor.addEventListener("input", () =>
    applyColor(nodes, customColor.value)
  );
}

// ---- Apply color to selected node ----
function applyColor(nodes, hex) {
  const name = partSelect.value;
  const node = nodes.find((n) => n.name === name);
  if (!node) return;

  const [r, g, b] = hexToRgb(hex);

  node.material.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1]);
  selections[name] = hex;
}

// ---- Share link ----
shareBtn.onclick = () => {
  const url = new URL(window.location.href);
  url.searchParams.set(
    "parts",
    Object.entries(selections)
      .map(([k, v]) => `${k}:${v.replace("#", "")}`)
      .join(",")
  );
  navigator.clipboard.writeText(url.toString());
  alert("Link copied");
};

// ---- Restore state ----
function applyFromURL(nodes) {
  const parts = params.get("parts");
  if (!parts) return;

  parts.split(",").forEach((p) => {
    const [name, hex] = p.split(":");
    const node = nodes.find((n) => n.name === name);
    if (!node) return;

    const color = "#" + hex;
    const [r, g, b] = hexToRgb(color);
    node.material.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1]);
    selections[name] = color;
  });
}

// ---- Utils ----
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}


