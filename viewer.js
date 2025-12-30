document.addEventListener("DOMContentLoaded", () => {

  const mv = document.getElementById("mv");
  const partSelect = document.getElementById("partSelect");
  const palette = document.getElementById("palette");
  const customColor = document.getElementById("customColor");
  const shareBtn = document.getElementById("share");

  if (!mv || !partSelect || !palette) {
    console.error("DOM elements missing");
    return;
  }

  /* ---------------------------------------
     LOAD GLB FROM URL
  ----------------------------------------*/
  const params = new URLSearchParams(window.location.search);
  const glbUrl = params.get("glb");

  if (glbUrl) {
    mv.src = glbUrl;
  } else {
    console.warn("No GLB URL provided");
  }

  const selections = {};

  /* ---------------------------------------
     WHEN MODEL LOADS
  ----------------------------------------*/
  mv.addEventListener("load", async () => {
    await mv.updateComplete;

    const sg = mv.sceneGraph;

    console.log("SceneGraph:", sg);

    if (!sg || !sg.materials || sg.materials.length === 0) {
      console.error("No materials detected in SceneGraph");
      return;
    }

    console.log("Materials detected:", sg.materials.map(m => m.name));

    // Populate part selector
    partSelect.innerHTML = "";
    sg.materials.forEach(mat => {
      const opt = document.createElement("option");
      opt.value = mat.name;
      opt.textContent = mat.name;
      partSelect.appendChild(opt);
    });
  });

  /* ---------------------------------------
     APPLY COLOR
  ----------------------------------------*/
  customColor.addEventListener("input", () => {
    const part = partSelect.value;
    const color = customColor.value;

    if (!part) return;

    const mat = mv.sceneGraph.materials.find(m => m.name === part);
    if (!mat) return;

    const rgba = hexToRgba(color);
    mat.pbrMetallicRoughness.setBaseColorFactor(rgba);

    selections[part] = color;
  });

  /* ---------------------------------------
     SHARE LINK
  ----------------------------------------*/
  shareBtn.addEventListener("click", () => {
    const url = new URL(window.location.href);
    url.searchParams.set("glb", mv.src);

    const parts = Object.entries(selections)
      .map(([k, v]) => `${k}:${v.replace("#", "")}`)
      .join(",");

    if (parts) url.searchParams.set("parts", parts);

    navigator.clipboard.writeText(url.toString());
    alert("Share link copied!");
  });

});

/* ---------------------------------------
   HELPERS
----------------------------------------*/
function hexToRgba(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
    1
  ];
}

