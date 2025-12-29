const mv = document.getElementById('mv');
const partSelect = document.getElementById('partSelect');
const colorPicker = document.getElementById('colorPicker');
const shareBtn = document.getElementById('share');

/* -------------------------------------------------- */
/* Load GLB from URL query (?glb=...)                 */
/* -------------------------------------------------- */

const params = new URLSearchParams(window.location.search);
const glbUrl = params.get('glb');

if (!glbUrl) {
  alert('No ?glb= URL provided');
} else {
  mv.src = glbUrl;
}

/* -------------------------------------------------- */
/* WAIT FOR SCENEGRAPH (THIS FIXES EVERYTHING)        */
/* -------------------------------------------------- */

mv.addEventListener('model-visibility', async () => {
  await mv.updateComplete;

  const sg = mv.sceneGraph;

  if (!sg || !sg.materials || sg.materials.length === 0) {
    console.error('❌ No materials detected in SceneGraph');
    console.log('SceneGraph:', sg);
    return;
  }

  console.log('✅ Materials detected:', sg.materials);

  // Populate dropdown
  partSelect.innerHTML = '';
  sg.materials.forEach(mat => {
    const opt = document.createElement('option');
    opt.value = mat.name;
    opt.textContent = mat.name;
    partSelect.appendChild(opt);
  });
});

/* -------------------------------------------------- */
/* APPLY COLOR TO MATERIAL                            */
/* -------------------------------------------------- */

colorPicker.addEventListener('input', () => {
  const partName = partSelect.value;
  if (!partName) return;

  const mat = mv.sceneGraph.materials.find(m => m.name === partName);
  if (!mat) return;

  const hex = colorPicker.value;
  const rgb = hexToRgb(hex);

  mat.pbrMetallicRoughness.setBaseColorFactor([
    rgb.r / 255,
    rgb.g / 255,
    rgb.b / 255,
    1
  ]);
});

/* -------------------------------------------------- */
/* SHARE LINK                                        */
/* -------------------------------------------------- */

shareBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(window.location.href);
  shareBtn.textContent = 'Copied!';
  setTimeout(() => shareBtn.textContent = 'Copy Share Link', 1500);
});

/* -------------------------------------------------- */
/* UTIL                                              */
/* -------------------------------------------------- */

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16)
  };
}

