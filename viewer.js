const mv = document.getElementById("mv");
const partSelect = document.getElementById("partSelect");
const paletteEl = document.getElementById("palette");
const customColor = document.getElementById("customColor");
const shareBtn = document.getElementById("share");

const PALETTE = ["#ff0000", "#00ff00", "#0000ff", "#ffffff", "#000000"];
const selections = {};

// ---------- UTIL ----------
function hexToRGBA(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
    1
  ];
}

// ---------- LOAD FROM URL ----------
const params = new URLSearchParams(window.location.search);
const glbURL = params.get("glb");

if (glbURL) {
  mv.src = glbURL;
}

// ---------- WAIT FOR MODEL ----------
mv.addEventListener("load", async () => {
  await mv.updateComplete;

  const sg = mv.sceneGraph;

  console.log("SceneGraph:", sg);

  let items = [];

  // ---- MATERIAL MODE ----
  if (sg.materials && sg.materials.length) {
    items = sg.materials.map(m => ({
      type: "material",
      name: m.name,
      ref: m
    }));
  }

  // ---- NODE FALLBACK ----
  if (!items.length && sg.model) {
    sg.model.traverse(node => {
      if (node.material && node.name) {
        items.push({
          type: "node",
          name: node.name,
          ref: node
        });
      }
    });
  }

  if (!items.length) {
    console.error("No editable parts found.");
    return;
  }

  // Populate dropdown
  partSelect.innerHTML = "";
  items.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.name;
    opt.textContent = p.name;
    partSelect.appendChild(opt);
  });

  // Save globally
  window.__PARTS__ = items;

  console.log("Editable parts:", items);
});

// ---------- PALETTE ----------
PALETTE.forEach(hex => {
  const btn = document.createElement("button");
  btn.style.background = hex;
  btn.style.width = "30px";
  btn.style.height = "30px";
  btn.style.margin = "4px";
  btn.onclick = () => applyColor(hex);
  paletteEl.appendChild(btn);
});

function applyColor(hex) {
  const partName = partSelect.value;
  const part = window.__PARTS__?.find(p => p.name === partName);
  if (!part) return;

  const rgba = hexToRGBA(hex);

  if (part.type === "material") {
    part.ref.pbrMetallicRoughness.setBaseColorFactor(rgba);
  } else {
    part.ref.traverse(obj => {
      if (obj.material?.pbrMetallicRoughness) {
        obj.material.pbrMetallicRoughness.setBaseColorFactor(rgba);
      }
    });
  }

  selections[partName] = hex;
}

// ---------- CUSTOM COLOR ----------
customColor.addEventListener("input", e => applyColor(e.target.value));

// ---------- SHARE LINK ----------
shareBtn.onclick = () => {
  const url = new URL(window.location.href);
  url.searchParams.set("glb", mv.src);

  const parts = Object.entries(selections)
    .map(([k, v]) => `${encodeURIComponent(k)}:${v.replace("#", "")}`)
    .join(",");

  if (parts) url.searchParams.set("parts", parts);

  navigator.clipboard.writeText(url.toString());
  alert("Share link copied");
};

}

