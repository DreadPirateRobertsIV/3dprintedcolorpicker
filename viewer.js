const mv = document.getElementById("mv");
const partSelect = document.getElementById("partSelect");
const palette = document.getElementById("palette");
const customColor = document.getElementById("customColor");
const shareBtn = document.getElementById("share");

// Read URL params
const params = new URLSearchParams(window.location.search);
const glb = params.get("glb");

if (glb) {
  mv.src = glb;
} else {
  console.warn("No ?glb= param found");
}

mv.addEventListener("load", async () => {
  await mv.updateComplete;
  const sg = mv.sceneGraph;

  if (!sg || !sg.materials?.length) {
    console.error("No materials found in sceneGraph");
    return;
  }

  partSelect.innerHTML = "";
  sg.materials.forEach(mat => {
    const opt = document.createElement("option");
    opt.value = mat.name;
    opt.textContent = mat.name;
    partSelect.appendChild(opt);
  });

  buildPalette(["#ff0000", "#00ff00", "#0000ff", "#ffffff", "#000000"]);
});

function buildPalette(colors) {
  palette.innerHTML = "";
  colors.forEach(hex => {
    const btn = document.createElement("button");
    btn.style.background = hex;
    btn.style.width = "28px";
    btn.style.height = "28px";
    btn.onclick = () => applyColor(hex);
    palette.appendChild(btn);
  });
}

function applyColor(hex) {
  const name = partSelect.value;
  if (!name) return;

  const mat = mv.sceneGraph.materials.find(m => m.name === name);
  if (!mat) return;

  const rgb = hexToRGBA(hex);
  mat.pbrMetallicRoughness.setBaseColorFactor(rgb);
}

function hexToRGBA(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0,2),16)/255,
    parseInt(h.substring(2,4),16)/255,
    parseInt(h.substring(4,6),16)/255,
    1
  ];
}

shareBtn.onclick = () => {
  const url = new URL(window.location.href);
  navigator.clipboard.writeText(url.toString());
  alert("Link copied!");
};

