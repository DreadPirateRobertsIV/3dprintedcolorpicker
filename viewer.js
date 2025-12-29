document.addEventListener("DOMContentLoaded", () => {
  const mv = document.getElementById("mv");
  const partSelect = document.getElementById("partSelect");
  const paletteEl = document.getElementById("palette");
  const colorInput = document.getElementById("customColor");
  const shareBtn = document.getElementById("share");

  // --- Load GLB from URL ---
  const params = new URLSearchParams(window.location.search);
  const glbUrl = params.get("glb");

  if (!glbUrl) {
    console.warn("No GLB URL provided");
    return;
  }

  mv.src = decodeURIComponent(glbUrl);

  // --- When model loads, list materials ---
  mv.addEventListener("load", async () => {
    await mv.updateComplete;

    const materials = mv.sceneGraph?.materials || [];

    if (!materials.length) {
      partSelect.innerHTML = "<option>No materials found</option>";
      return;
    }

    partSelect.innerHTML = "";
    materials.forEach(mat => {
      const opt = document.createElement("option");
      opt.value = mat.name;
      opt.textContent = mat.name;
      partSelect.appendChild(opt);
    });
  });

  // --- Apply color ---
  function applyColor(hex) {
    const name = partSelect.value;
    const mat = mv.sceneGraph.materials.find(m => m.name === name);
    if (!mat) return;

    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    mat.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1]);
  }

  colorInput.addEventListener("input", e => applyColor(e.target.value));

  // --- Share link ---
  shareBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(window.location.href);
    shareBtn.textContent = "Copied!";
    setTimeout(() => (shareBtn.textContent = "Copy Share Link"), 1500);
  });
});
