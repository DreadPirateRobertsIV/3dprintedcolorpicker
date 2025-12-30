window.addEventListener("DOMContentLoaded", () => {
  const mv = document.getElementById("mv");
  const partSelect = document.getElementById("partSelect");
  const paletteEl = document.getElementById("palette");
  const customColor = document.getElementById("customColor");
  const shareBtn = document.getElementById("share");

  if (!mv || !partSelect || !paletteEl) {
    console.error("Viewer elements missing from DOM");
    return;
  }

  // --- Load GLB from URL ---
  const params = new URLSearchParams(window.location.search);
  const glbUrl = params.get("glb");

  if (glbUrl) {
    mv.src = glbUrl;
  } else {
    console.warn("No ?glb= param provided");
  }

  const selections = {};

  // --- Default palette ---
  const palette = [
    "#000000",
    "#ffffff",
    "#ff0000",
    "#00ff00",
    "#0000ff"
  ];

  buildPalette();

  function buildPalette() {
    paletteEl.innerHTML = "";
    palette.forEach(hex => {
      const swatch = document.createElement("button");
      swatch.style.background = hex;
      swatch.className = "swatch";
      swatch.onclick = () => {
        const part = partSelect.value;
        if (part) applyColor(part, hex);
      };
      paletteEl.appendChild(swatch);
    });
  }

  // --- When model loads ---
  mv.addEventListener("load", async () => {
    await mv.updateComplete;

    const sg = mv.sceneGraph;
    if (!sg || !sg.materials || sg.materials.length === 0) {
      console.error("No materials detected in SceneGraph", sg);
      return;
    }

    console.log("Materials detected:", sg.materials);

    partSelect.innerHTML = "";
    sg.materials.forEach(mat => {
      const opt = document.createElement("option");
      opt.value = mat.name;
      opt.textContent = mat.name;
      partSelect.appendChild(opt);
    });
  });

  function applyColor(materialName, hex) {
    const mat = mv.sceneGraph.materials.find(m => m.name === materialName);
    if (!mat) return;

    const rgba = hexToRgba(hex);
    mat.pbrMetallicRoughness.setBaseColorFactor(rgba);
    selections[materialName] = hex;
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

  // --- Share link ---
  shareBtn?.addEventListener("click", () => {
    const url = new URL(window.location.href);
    const parts = Object.entries(selections)
      .map(([k, v]) => `${encodeURIComponent(k)}:${v.replace("#", "")}`)
      .join(",");

    url.searchParams.set("glb", mv.src);
    if (parts) url.searchParams.set("parts", parts);

    navigator.clipboard.writeText(url.toString());
    alert("Share link copied!");
  });
});
