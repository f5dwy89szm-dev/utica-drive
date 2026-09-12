import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const $ = id => document.getElementById(id);
const ui = {
  loading: $("loading"), loadingText: $("loadingText"), street: $("street"),
  clock: $("clockHud"),
  minimap: $("minimap"),
  mission: $("mission"), progress: $("missionProgress"), speed: $("speed"),
  speedometer: $("speedometer"), hint: $("hint"), controls: $("controls"),
  joystick: $("joystick"), stick: $("stick"), lookPad: $("lookPad"), enter: $("enterBtn"),
  run: $("runBtn"), action: $("actionBtn"), jump: $("jumpBtn"), fire: $("fireBtn"), horn: $("hornBtn"), gas: $("gasBtn"), brake: $("brakeBtn")
};

ui.loadingText.textContent = "Starting the 3D engine…";
const renderer = new THREE.WebGLRenderer({ canvas: $("game"), antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.45));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.38;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8bb6d3);
scene.fog = new THREE.FogExp2(0x9dbacf, 0.00165);
const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 1800);
const clock = new THREE.Clock();

const hemi = new THREE.HemisphereLight(0xdff2ff, 0x52604a, 2.1);
scene.add(hemi);
const ambientFill = new THREE.AmbientLight(0x9db6cc, .72);
scene.add(ambientFill);
const sun = new THREE.DirectionalLight(0xfff4df, 3.1);
sun.position.set(-130, 190, -80);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = sun.shadow.camera.bottom = -190;
sun.shadow.camera.right = sun.shadow.camera.top = 190;
sun.shadow.camera.far = 500;
scene.add(sun);
const moon = new THREE.DirectionalLight(0x88aaff, .28);
moon.position.set(120, 150, 90);
scene.add(moon);

const daySky = new THREE.Color(0x8bb6d3);
const sunsetSky = new THREE.Color(0xc96850);
const nightSky = new THREE.Color(0x17283a);
const dayFog = new THREE.Color(0x9dbacf);
const nightFog = new THREE.Color(0x1b2b3b);
const DAY_LENGTH = 360;
// Start in daylight so first-time players can actually see the city and learn
// the controls; the live cycle still moves through sunset and night.
let worldHours = 14.25;

const mat = (color, roughness = .75, metalness = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });
const box = (w, h, d, material) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
};
const cylinder = (rt, rb, h, sides, material) => {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, sides), material);
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
};

ui.loadingText.textContent = "Laying out Utica streets…";
const WORLD = 1400;
const ROAD_STEP = 150;
const ROAD_WIDTH = 22;
const roadCoords = [-660, -550, -440, -330, -220, -110, 0, 110, 220, 330, 440, 550, 660];
const northSouthNames = [
  "MAIN STREET", "CORNELIA STREET", "STATE STREET", "GENESEE STREET", "ONEIDA STREET",
  "DOHERTY AVENUE", "KENT STREET", "LENOX AVENUE", "PARK AVENUE", "HILTON AVENUE",
  "MOHAWK STREET", "EAST STREET", "M.L.K. JR. AVENUE"
];
const eastWestNames = [
  "COURT STREET", "COLUMBIA STREET", "LAFAYETTE STREET", "ORISKANY STREET",
  "ALBANY STREET", "RUTGER STREET", "BLEECKER STREET", "BURRSTONE ROAD", "HOPPER STREET",
  "KELLOGG ROAD", "HOBART STREET", "HINDSALE STREET", "FOX STREET"
];
function makeRoadTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#3a3d40"; ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1600; i++) {
    const shade = 43 + Math.floor(Math.random() * 34);
    ctx.fillStyle = `rgba(${shade},${shade + 2},${shade + 4},${.08 + Math.random() * .14})`;
    const size = .5 + Math.random() * 2.1;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, size, size);
  }
  ctx.strokeStyle = "rgba(15,17,20,.42)"; ctx.lineWidth = 1.2;
  for (let i = 0; i < 9; i++) {
    ctx.beginPath(); ctx.moveTo(Math.random() * 256, Math.random() * 256);
    for (let j = 0; j < 4; j++) ctx.lineTo(Math.random() * 256, Math.random() * 256);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 18);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
function makeBrickTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#a18c7a"; ctx.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 16; row++) {
    const y = row * 16;
    const offset = row % 2 ? -16 : 0;
    for (let x = offset; x < 256; x += 32) {
      const shade = 118 + Math.floor(Math.random() * 38);
      ctx.fillStyle = `rgb(${shade + 24},${shade},${shade - 16})`;
      ctx.fillRect(x + 1, y + 1, 30, 14);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 5);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
function makeConcreteTexture() {
  const canvas = document.createElement("canvas"); canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d"); ctx.fillStyle = "#9b9d9d"; ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1800; i++) {
    const v = 115 + Math.floor(Math.random() * 48);
    ctx.fillStyle = `rgba(${v},${v + 1},${v + 2},${.08 + Math.random() * .18})`;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, .6 + Math.random() * 2.4, .6 + Math.random() * 2.4);
  }
  ctx.strokeStyle = "rgba(45,48,49,.23)"; ctx.lineWidth = 1;
  for (let i = 0; i < 18; i++) { ctx.beginPath(); ctx.moveTo(Math.random() * 256, Math.random() * 256); ctx.lineTo(Math.random() * 256, Math.random() * 256); ctx.stroke(); }
  const texture = new THREE.CanvasTexture(canvas); texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(5, 24); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}
function makeGrassTexture() {
  const canvas = document.createElement("canvas"); canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d"); ctx.fillStyle = "#526c42"; ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3200; i++) { const g = 70 + Math.floor(Math.random() * 45); ctx.fillStyle = `rgba(${36 + Math.floor(Math.random() * 24)},${g},${32 + Math.floor(Math.random() * 20)},${.18 + Math.random() * .28})`; ctx.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2, 1 + Math.random() * 2); }
  const texture = new THREE.CanvasTexture(canvas); texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(18, 18); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}
const roadTexture = makeRoadTexture();
const brickTexture = makeBrickTexture();
const concreteTexture = makeConcreteTexture();
const grassTexture = makeGrassTexture();
for (const texture of [roadTexture, brickTexture, concreteTexture, grassTexture]) {
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
}
const roadMat = new THREE.MeshStandardMaterial({ color: 0x73787c, map: roadTexture, roughness: .38, metalness: .17 });
const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0xb1b1ad, map: concreteTexture, roughness: .92, metalness: 0 });
const grassMat = new THREE.MeshStandardMaterial({ color: 0x4f6c40, map: grassTexture, roughness: 1, metalness: 0 });
const stripeMat = mat(0xe3b72c, .8);
const whiteMat = mat(0xdddcd1, .8);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1800), grassMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
const river = new THREE.Mesh(new THREE.PlaneGeometry(1500, 70), new THREE.MeshStandardMaterial({ color: 0x244b62, roughness: .18, metalness: .22, emissive: 0x071c2b, emissiveIntensity: .3 }));
river.rotation.x = -Math.PI / 2; river.position.set(0, .045, -695); scene.add(river);
const riverBank = box(1500, .35, 9, mat(0x6d6652, .95)); riverBank.position.set(0, .18, -656); scene.add(riverBank);
const bridge = box(155, .42, 28, mat(0x49494a, .78, .15)); bridge.position.set(-150, .42, -695); scene.add(bridge);

for (const c of roadCoords) {
  const verticalWalk = box(ROAD_WIDTH + 8, .16, WORLD, sidewalkMat);
  verticalWalk.position.set(c, .08, 0);
  scene.add(verticalWalk);
  const vertical = box(ROAD_WIDTH, .2, WORLD, roadMat);
  vertical.position.set(c, .19, 0);
  scene.add(vertical);
  const horizontalWalk = box(WORLD, .16, ROAD_WIDTH + 8, sidewalkMat);
  horizontalWalk.position.set(0, .08, c);
  scene.add(horizontalWalk);
  const horizontal = box(WORLD, .2, ROAD_WIDTH, roadMat);
  horizontal.position.set(0, .2, c);
  scene.add(horizontal);
  for (let p = -686; p <= 686; p += 16) {
    if (roadCoords.some(v => Math.abs(p - v) < 15)) continue;
    const vStripe = box(.2, .025, 7, stripeMat);
    vStripe.position.set(c, .32, p);
    scene.add(vStripe);
    const hStripe = box(7, .025, .2, stripeMat);
    hStripe.position.set(p, .32, c);
    scene.add(hStripe);
  }
}

const seedRandom = (() => {
  let seed = 91827;
  return () => ((seed = seed * 16807 % 2147483647) - 1) / 2147483646;
})();
const buildingBounds = [];
const facadeColors = [0x9a7259, 0xb1aaa0, 0x745e52, 0xa78d6c, 0x6e777c, 0xb6a582, 0x826b5d];
const windowMaterial = new THREE.MeshStandardMaterial({
  color: 0x9fc7d7, roughness: .2, metalness: .15, emissive: 0x15242c, emissiveIntensity: .3
});
const storefrontGlass = new THREE.MeshStandardMaterial({
  color: 0x263d48, roughness: .16, metalness: .25, emissive: 0x6b4518, emissiveIntensity: .12
});

function addBuilding(x, z, w, d, h, color) {
  const group = new THREE.Group();
  const base = box(w, h, d, new THREE.MeshStandardMaterial({ color, map: brickTexture, roughness: .84, metalness: .02 }));
  base.position.y = h / 2 + .2;
  group.add(base);
  const trim = box(w + .3, .45, d + .3, mat(0x393b3b, .8));
  trim.position.y = h + .42;
  group.add(trim);
  const rows = Math.min(7, Math.floor(h / 3));
  const colsX = Math.max(1, Math.floor(w / 4));
  const colsZ = Math.max(1, Math.floor(d / 4));
  for (let row = 0; row < rows; row++) {
    const y = 2.4 + row * 3;
    for (let col = 0; col < colsX; col++) {
      const px = -w / 2 + (col + .5) * w / colsX;
      for (const side of [-1, 1]) {
        const win = box(Math.min(1.7, w / colsX * .5), 1.35, .08, windowMaterial);
        win.position.set(px, y, side * (d / 2 + .045));
        win.castShadow = false;
        group.add(win);
      }
    }
    for (let col = 0; col < colsZ; col++) {
      const pz = -d / 2 + (col + .5) * d / colsZ;
      for (const side of [-1, 1]) {
        const win = box(.08, 1.35, Math.min(1.7, d / colsZ * .5), windowMaterial);
        win.position.set(side * (w / 2 + .045), y, pz);
        win.castShadow = false;
        group.add(win);
      }
    }
  }
  if (seedRandom() > .55) {
    const rooftop = box(w * .3, 1.2, d * .28, mat(0x5a5c5c));
    rooftop.position.set(0, h + 1.15, 0);
    group.add(rooftop);
  }
  if (w > 14 && seedRandom() > .28) {
    const shop = box(Math.min(w * .56, 13), 2.35, .12, storefrontGlass);
    shop.position.set(0, 1.55, d / 2 + .08);
    shop.castShadow = false;
    group.add(shop);
    const awning = box(Math.min(w * .62, 14), .18, 1.1, mat(seedRandom() > .5 ? 0x792d2d : 0x284b61, .72));
    awning.position.set(0, 3.05, d / 2 + .52);
    awning.rotation.x = -.12;
    group.add(awning);
  }
  group.position.set(x, 0, z);
  scene.add(group);
  buildingBounds.push({ minX: x - w / 2 - 1, maxX: x + w / 2 + 1, minZ: z - d / 2 - 1, maxZ: z + d / 2 + 1 });
}

for (let ix = 0; ix < roadCoords.length - 1; ix++) {
  for (let iz = 0; iz < roadCoords.length - 1; iz++) {
    const x0 = roadCoords[ix] + ROAD_WIDTH / 2 + 6;
    const x1 = roadCoords[ix + 1] - ROAD_WIDTH / 2 - 6;
    const z0 = roadCoords[iz] + ROAD_WIDTH / 2 + 6;
    const z1 = roadCoords[iz + 1] - ROAD_WIDTH / 2 - 6;
    const downtown = 1 - Math.min(1, Math.hypot((x0 + x1) / 2, (z0 + z1) / 2) / 270);
    const split = seedRandom() > .45;
    if (split) {
      const gap = 4;
      const w = (x1 - x0 - gap) / 2;
      for (let side = 0; side < 2; side++) {
        const h = 8 + seedRandom() * 14 + downtown * 24;
        addBuilding(x0 + w / 2 + side * (w + gap), (z0 + z1) / 2, w - 2, z1 - z0 - 3, h, facadeColors[Math.floor(seedRandom() * facadeColors.length)]);
      }
    } else {
      const h = 9 + seedRandom() * 18 + downtown * 26;
      addBuilding((x0 + x1) / 2, (z0 + z1) / 2, x1 - x0 - 3, z1 - z0 - 3, h, facadeColors[Math.floor(seedRandom() * facadeColors.length)]);
    }
  }
}

function makeLabel(text, color = "#ffffff") {
  const canvas = document.createElement("canvas");
  canvas.width = 512; canvas.height = 96;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#174b36";
  ctx.roundRect(4, 4, 504, 88, 12);
  ctx.fill();
  ctx.strokeStyle = "#ddd"; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = color; ctx.font = "bold 38px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 49);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: true }));
  sprite.scale.set(13, 2.45, 1);
  return sprite;
}

function addStreetSign(x, z, text, rotate = false) {
  const pole = cylinder(.08, .1, 3.5, 8, mat(0x4d5557, .5, .5));
  pole.position.set(x, 1.75, z);
  scene.add(pole);
  const label = makeLabel(text);
  label.position.set(x, 3.65, z);
  if (rotate) label.material.rotation = Math.PI / 2;
  scene.add(label);
}
for (let i = 0; i < roadCoords.length; i++) {
  addStreetSign(roadCoords[i] + 13, 13, northSouthNames[i]);
  addStreetSign(13, roadCoords[i] + 13, eastWestNames[i], true);
}
function addLandmark(x, z, name, width, depth, height, color) {
  const building = box(width, height, depth, mat(color, .78));
  building.position.set(x, height / 2 + .2, z); scene.add(building);
  const roof = box(width + 2, .35, depth + 2, mat(0x25282b, .7, .15));
  roof.position.set(x, height + .4, z); scene.add(roof);
  const sign = makeLabel(name, "#ffe59a");
  sign.scale.set(Math.min(18, width * .72), 2.6, 1);
  sign.position.set(x, height + 3.2, z + depth / 2 + .2); scene.add(sign);
}
addLandmark(-330, -110, "UNION STATION", 34, 20, 12, 0x8a8178);
addLandmark(220, 110, "STANLEY THEATRE", 42, 26, 16, 0x6f625e);
addLandmark(0, 330, "ADIRONDACK BANK CENTER", 52, 34, 11, 0x56636c);
addLandmark(-110, 0, "M&T BANK BUILDING", 20, 18, 24, 0x8d7866);
addLandmark(110, 0, "JOHN C. HIEBER BUILDING", 22, 28, 18, 0x8f5d46);
addLandmark(-110, 110, "DOYLE HARDWARE BUILDING", 28, 38, 16, 0x7d5947);
addLandmark(110, 110, "HURD & FITZGERALD", 20, 26, 18, 0x725347);
addLandmark(-220, 0, "UTICA DAILY PRESS", 18, 24, 14, 0x806249);

function addTree(x, z) {
  const trunk = cylinder(.28, .38, 2.7, 8, mat(0x60452c));
  trunk.position.set(x, 1.35, z);
  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.65, 1), mat(0x315d35));
  crown.position.set(x, 3.7, z);
  crown.castShadow = true;
  scene.add(trunk, crown);
}
for (let i = 0; i < 70; i++) {
  const axis = seedRandom() > .5;
  const road = roadCoords[Math.floor(seedRandom() * roadCoords.length)];
  const along = -660 + seedRandom() * 1320;
  if (roadCoords.some(v => Math.abs(along - v) < 18)) continue;
  addTree(axis ? road + (seedRandom() > .5 ? 15 : -15) : along, axis ? along : road + (seedRandom() > .5 ? 15 : -15));
}

const lampBulbMaterial = new THREE.MeshStandardMaterial({
  color: 0xffe2a3, roughness: .25, emissive: 0xffb84a, emissiveIntensity: .12
});
const streetLampBulbs = [];
function addStreetLamp(x, z) {
  const poleMaterial = mat(0x24282b, .62, .7);
  const pole = cylinder(.09, .14, 5.7, 8, poleMaterial);
  pole.position.set(x, 2.85, z);
  const arm = box(1.25, .1, .1, poleMaterial);
  arm.position.set(x + .55, 5.62, z);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.22, 10, 7), lampBulbMaterial);
  bulb.position.set(x + 1.15, 5.52, z);
  streetLampBulbs.push(bulb);
  scene.add(pole, arm, bulb);
}
for (let i = 0; i < roadCoords.length; i++) {
  for (let j = 0; j < roadCoords.length; j++) {
    if ((i + j) % 2 === 0) addStreetLamp(roadCoords[i] + 13.5, roadCoords[j] + 13.5);
  }
}

ui.loadingText.textContent = "Preparing your M4…";
function createCar(color = 0x36a7d8, functionalLights = false, bodyStyle = "coupe") {
  const car = new THREE.Group();
  const paint = new THREE.MeshPhysicalMaterial({ color, roughness: .2, metalness: .68, clearcoat: .72, clearcoatRoughness: .14 });
  const dark = mat(0x090b0d, .25, .7);
  const glass = new THREE.MeshStandardMaterial({ color: 0x15242e, roughness: .08, metalness: .4, transparent: true, opacity: .92 });
  const headlightMaterial = new THREE.MeshStandardMaterial({ color: 0xe7f3ff, emissive: 0xbadfff, emissiveIntensity: 1.15 });
  const tailMaterial = new THREE.MeshStandardMaterial({ color: 0xdd1414, emissive: 0x8b0505, emissiveIntensity: 1.05 });
  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(-2.08, .7); bodyShape.lineTo(2.08, .7);
  bodyShape.quadraticCurveTo(2.27, .72, 2.27, 1.02);
  bodyShape.lineTo(2.12, 1.48); bodyShape.quadraticCurveTo(1.95, 1.62, 1.62, 1.63);
  bodyShape.lineTo(-1.62, 1.63); bodyShape.quadraticCurveTo(-1.95, 1.62, -2.12, 1.48);
  bodyShape.lineTo(-2.27, 1.02); bodyShape.quadraticCurveTo(-2.27, .72, -2.08, .7);
  const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, { depth: 8.2, bevelEnabled: true, bevelSegments: 3, bevelSize: .12, bevelThickness: .1, curveSegments: 4 });
  bodyGeometry.translate(0, 0, -4.1);
  const body = new THREE.Mesh(bodyGeometry, paint); body.castShadow = body.receiveShadow = true; car.add(body);
  const lowerBody = box(4.5, .34, 7.55, dark); lowerBody.position.set(0, .68, -.08); car.add(lowerBody);
  const hood = box(4.15, .28, 2.6, paint); hood.position.set(0, 1.54, 2.25); hood.rotation.x = -.04; car.add(hood);
  const roof = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), paint); roof.scale.set(1.78, .94, 1.68); roof.position.set(0, 2.05, -.55); car.add(roof);
  const windshield = box(3.35, .92, .08, glass); windshield.position.set(0, 2.08, 1.27); windshield.rotation.x = -.35; car.add(windshield);
  const rearGlass = box(3.35, .84, .08, glass); rearGlass.position.set(0, 2.06, -2.38); rearGlass.rotation.x = .35; car.add(rearGlass);
  for (const side of [-1, 1]) {
    const sideGlass = box(.06, .76, 2.65, glass); sideGlass.position.set(side * 1.8, 2.1, -.55); car.add(sideGlass);
    const mirror = box(.35, .25, .52, paint); mirror.position.set(side * 2.15, 1.95, .78); car.add(mirror);
  }
  const grille = box(2.2, .62, .1, dark); grille.position.set(0, 1.05, 4.23); car.add(grille);
  const splitter = box(4.28, .12, .48, dark); splitter.position.set(0, .57, 4.05); car.add(splitter);
  const sideSkirtL = box(.16, .2, 6.35, dark); sideSkirtL.position.set(-2.2, .6, -.08); car.add(sideSkirtL);
  const sideSkirtR = sideSkirtL.clone(); sideSkirtR.position.x = 2.2; car.add(sideSkirtR);
  for (const side of [-1, 1]) {
    const vent = box(.62, .05, .95, dark); vent.position.set(side * .75, 1.72, 2.32); vent.rotation.x = -.05; car.add(vent);
    const exhaust = cylinder(.15, .15, .42, 12, mat(0x55595b, .18, .9));
    exhaust.rotation.x = Math.PI / 2; exhaust.position.set(side * 1.45, .72, -4.32); car.add(exhaust);
  }
  for (const side of [-1, 1]) {
    const kidney = box(.78, .52, .12, mat(0x050505, .2, .85)); kidney.position.set(side * .48, 1.12, 4.3); car.add(kidney);
    const headlight = box(1.05, .28, .12, headlightMaterial);
    headlight.position.set(side * 1.48, 1.35, 4.29); car.add(headlight);
    const tail = box(1.18, .25, .12, tailMaterial);
    tail.position.set(side * 1.45, 1.28, -4.23); car.add(tail);
  }
  const wheelGroups = [];
  for (const x of [-2.1, 2.1]) for (const z of [-2.75, 2.75]) {
    const wheel = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(.82, .82, .44, 20), dark);
    tire.rotation.z = Math.PI / 2;
    const rim = cylinder(.42, .42, .47, 12, mat(0xb9bec2, .22, .9)); rim.rotation.z = Math.PI / 2;
    wheel.add(tire, rim); wheel.position.set(x, .83, z); car.add(wheel); wheelGroups.push(wheel);
  }
  car.userData.wheels = wheelGroups;
  car.userData.frontWheels = wheelGroups.filter(w => w.position.z > 0);
  car.userData.headlightMaterial = headlightMaterial;
  car.userData.tailMaterial = tailMaterial;
  if (bodyStyle === "sedan") car.scale.set(1.02, .98, 1.03);
  if (bodyStyle === "suv") car.scale.set(1.06, 1.22, 1.02);
  if (bodyStyle === "van") car.scale.set(1.12, 1.32, .92);
  car.userData.bodyStyle = bodyStyle;
  if (functionalLights) {
    const headBeam = new THREE.SpotLight(0xddeeff, 0, 52, .42, .72, 1.25);
    const beamTarget = new THREE.Object3D();
    headBeam.position.set(0, 1.4, 3.6); beamTarget.position.set(0, .2, 20);
    headBeam.target = beamTarget; car.add(headBeam, beamTarget);
    car.userData.headBeam = headBeam;
  }
  car.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return car;
}

function createPerson() {
  const person = new THREE.Group();
  const skin = mat(0x9b6247, .82);
  const hoodie = mat(0x151b22, .92);
  const denim = mat(0x26384c, .9);
  const shoe = mat(0xe5e2da, .72);
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(.48, .61, 1.48, 12), hoodie);
  torso.position.y = 2.38; torso.scale.z = .72; torso.castShadow = true; person.add(torso);
  const shoulders = box(1.18, .34, .55, hoodie); shoulders.position.y = 2.94; person.add(shoulders);
  const neck = cylinder(.18, .2, .24, 10, skin); neck.position.y = 3.25; person.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.39, 20, 16), skin);
  head.scale.set(.92, 1.12, .9); head.position.y = 3.62; head.castShadow = true; person.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(.395, 18, 9, 0, Math.PI * 2, 0, Math.PI * .52), mat(0x17120f));
  hair.scale.set(.93, 1.08, .92); hair.position.y = 3.74; person.add(hair);
  const hood = new THREE.Mesh(new THREE.TorusGeometry(.43, .12, 8, 16, Math.PI * 1.25), hoodie);
  hood.position.set(0, 3.23, -.19); hood.rotation.set(Math.PI / 2, 0, -.4); person.add(hood);
  const limbs = { arms: [], legs: [] };
  for (const side of [-1, 1]) {
    const armPivot = new THREE.Group(); armPivot.position.set(side * .65, 2.92, 0); person.add(armPivot);
    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(.17, .78, 4, 8), hoodie);
    sleeve.position.y = -.55; sleeve.castShadow = true; armPivot.add(sleeve);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(.19, 10, 8), skin);
    hand.position.y = -1.14; hand.castShadow = true; armPivot.add(hand); limbs.arms.push(armPivot);
    const legPivot = new THREE.Group(); legPivot.position.set(side * .28, 1.72, 0); person.add(legPivot);
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(.22, .96, 4, 9), denim);
    leg.position.y = -.75; leg.castShadow = true; legPivot.add(leg);
    const foot = box(.46, .27, .83, shoe); foot.position.set(0, -1.49, .19); legPivot.add(foot); limbs.legs.push(legPivot);
  }
  const nose = new THREE.Mesh(new THREE.ConeGeometry(.07, .18, 8), skin);
  nose.rotation.x = Math.PI / 2; nose.position.set(0, 3.62, .36); person.add(nose);
  person.userData.limbs = limbs;
  person.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return person;
}

const car = createCar(0x36a7d8, true);
car.position.set(4.5, .05, 9);
scene.add(car);
const player = createPerson();
player.position.set(.5, 0, 5.5);
player.scale.setScalar(.72);
scene.add(player);

const pedestrians = [];
for (let i = 0; i < 10; i++) {
  const pedestrian = createPerson();
  pedestrian.scale.setScalar(.64 + (i % 3) * .025);
  const axis = i % 2 === 0;
  const road = roadCoords[(i + 1) % roadCoords.length];
  const direction = i % 3 ? 1 : -1;
  pedestrian.position.set(axis ? road + (i % 3 ? 15 : -15) : -610 + i * 120, 0, axis ? -620 + i * 126 : road + (i % 3 ? 15 : -15));
  pedestrian.userData.walk = { axis, direction, speed: 1.05 + (i % 3) * .22, phase: i * .7 };
  scene.add(pedestrian); pedestrians.push(pedestrian);
}

// Light traffic gives the streets motion while keeping draw calls phone-friendly.
const traffic = [];
const trafficStyles = ["sedan", "suv", "coupe", "van", "sedan", "suv", "sedan", "van", "coupe", "sedan", "suv", "van"];
for (let i = 0; i < 12; i++) {
  const vehicle = createCar([0x962b32, 0xe8e8e5, 0x222831, 0x6f7478, 0x2364a8, 0xc58b24][i % 6], false, trafficStyles[i]);
  vehicle.scale.setScalar(.72 + (i % 3) * .025);
  const road = roadCoords[(i + 2) % roadCoords.length];
  const direction = i % 2 ? 1 : -1;
  if (i < 7) {
    const vertical = i % 3 !== 0;
    vehicle.position.set(vertical ? road + direction * 5.6 : -620 + i * 125, .03, vertical ? -620 + i * 126 : road + direction * 5.6);
    vehicle.rotation.y = vertical ? (direction > 0 ? 0 : Math.PI) : (direction > 0 ? Math.PI / 2 : -Math.PI / 2);
    vehicle.userData.traffic = { vertical, direction, speed: 7.5 + (i % 3) * 1.4 };
    traffic.push(vehicle);
  } else {
    vehicle.position.set(road + direction * 6.2, .03, -580 + (i - 7) * 165);
    vehicle.rotation.y = direction > 0 ? 0 : Math.PI;
  }
  scene.add(vehicle);
}

const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xf3b51b, transparent: true, opacity: .55, depthWrite: false, side: THREE.DoubleSide });
const marker = new THREE.Group();
const markerRing = new THREE.Mesh(new THREE.TorusGeometry(4, .25, 10, 40), markerMaterial);
markerRing.rotation.x = Math.PI / 2; markerRing.position.y = .45;
const markerBeam = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 4.5, 12, 28, 1, true), markerMaterial); markerBeam.position.y = 6;
marker.add(markerRing, markerBeam);
marker.position.copy(car.position); scene.add(marker);

const input = { x: 0, y: 0, gas: false, brake: false, run: false };
let joystickPointer = null;
let lookPointer = null;
let lastLookX = 0;
let lastLookY = 0;
let cameraOrbit = 0;
let cameraPitch = .22;
function updateJoystick(clientX, clientY) {
  const rect = ui.joystick.getBoundingClientRect();
  let x = (clientX - (rect.left + rect.width / 2)) / (rect.width * .34);
  let y = (clientY - (rect.top + rect.height / 2)) / (rect.height * .34);
  const length = Math.hypot(x, y);
  if (length > 1) { x /= length; y /= length; }
  const deadZone = .1;
  const adjusted = Math.max(0, length - deadZone) / (1 - deadZone);
  if (length > deadZone) { x = x / length * adjusted; y = y / length * adjusted; }
  else { x = 0; y = 0; }
  input.x = x; input.y = -y;
  ui.stick.style.transform = `translate(calc(-50% + ${x * 35}px), calc(-50% + ${-input.y * 35}px))`;
}
ui.joystick.addEventListener("pointerdown", e => { joystickPointer = e.pointerId; ui.joystick.setPointerCapture(e.pointerId); updateJoystick(e.clientX, e.clientY); });
ui.joystick.addEventListener("pointermove", e => { if (e.pointerId === joystickPointer) updateJoystick(e.clientX, e.clientY); });
function resetJoystick(e) {
  if (joystickPointer !== null && (!e || e.pointerId === joystickPointer)) {
    joystickPointer = null; input.x = input.y = 0; ui.stick.style.transform = "translate(-50%,-50%)";
  }
}
ui.joystick.addEventListener("pointerup", resetJoystick);
ui.joystick.addEventListener("pointercancel", resetJoystick);

ui.lookPad.addEventListener("pointerdown", e => {
  lookPointer = e.pointerId; lastLookX = e.clientX; lastLookY = e.clientY;
  ui.lookPad.setPointerCapture(e.pointerId);
});
ui.lookPad.addEventListener("pointermove", e => {
  if (e.pointerId !== lookPointer) return;
  cameraOrbit -= (e.clientX - lastLookX) * .008;
  cameraPitch = THREE.MathUtils.clamp(cameraPitch + (e.clientY - lastLookY) * .004, -.08, .62);
  lastLookX = e.clientX; lastLookY = e.clientY;
});
function resetLook(e) {
  if (lookPointer !== null && (!e || e.pointerId === lookPointer)) lookPointer = null;
}
ui.lookPad.addEventListener("pointerup", resetLook);
ui.lookPad.addEventListener("pointercancel", resetLook);

function bindHold(element, key) {
  const set = value => { input[key] = value; element.classList.toggle("pressed", value); };
  element.addEventListener("pointerdown", e => { e.preventDefault(); element.setPointerCapture(e.pointerId); set(true); });
  element.addEventListener("pointerup", () => set(false));
  element.addEventListener("pointercancel", () => set(false));
  element.addEventListener("lostpointercapture", () => set(false));
}
bindHold(ui.gas, "gas"); bindHold(ui.brake, "brake"); bindHold(ui.run, "run");

const keys = {};
addEventListener("keydown", e => {
  keys[e.code] = true;
  if (e.code === "KeyE") toggleVehicle();
});
addEventListener("keyup", e => { keys[e.code] = false; });

let driving = false;
let speed = 0;
let steeringAngle = 0;
let playerYaw = 0;
let missionStage = 0;
let walkCycle = 0;
let hintTimer = 4;
const targetPosition = new THREE.Vector3(-300, 0, -150);
const minimapCtx = ui.minimap.getContext("2d");
let minimapTimer = 0;
function drawMinimap(dt) {
  minimapTimer -= dt;
  if (minimapTimer > 0) return;
  minimapTimer = .12;
  const ctx = minimapCtx;
  const size = ui.minimap.width;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "#11171d"; ctx.fillRect(0, 0, size, size);
  const center = size / 2, scale = 108 / 720;
  ctx.strokeStyle = "#b9bec2"; ctx.lineWidth = 5;
  for (const road of roadCoords) {
    const p = center + road * scale;
    ctx.beginPath(); ctx.moveTo(p, 8); ctx.lineTo(p, size - 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8, p); ctx.lineTo(size - 8, p); ctx.stroke();
  }
  ctx.strokeStyle = "#2c6176"; ctx.lineWidth = 7;
  const riverY = center - 695 * scale; ctx.beginPath(); ctx.moveTo(8, riverY); ctx.lineTo(size - 8, riverY); ctx.stroke();
  const subject = driving ? car.position : player.position;
  const dot = (position, color, radius) => {
    const x = center + position.x * scale, y = center + position.z * scale;
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  };
  if (marker.visible) dot(targetPosition, "#f3b51b", 5);
  dot(car.position, "#6fc9ff", driving ? 5 : 4);
  dot(subject, driving ? "#ffffff" : "#74ee8d", 4);
  ctx.fillStyle = "#fff"; ctx.font = "bold 13px sans-serif"; ctx.fillText("N", center - 5, 15);
}

function setMode(isDriving) {
  driving = isDriving;
  player.visible = !driving;
  ui.controls.className = driving ? "driving" : "walking";
  ui.speedometer.style.display = driving ? "block" : "none";
  ui.enter.textContent = driving ? "EXIT" : "ENTER";
  input.gas = input.brake = input.run = false;
  if (driving && missionStage < 2) {
    missionStage = 2;
    ui.mission.textContent = "Drive to Union Station";
    marker.position.copy(targetPosition);
    marker.visible = true;
    showHint("Follow the gold mission marker");
  }
}
function toggleVehicle() {
  if (driving) {
    speed = 0;
    player.position.copy(car.position);
    const side = new THREE.Vector3(Math.cos(car.rotation.y) * 4.3, 0, -Math.sin(car.rotation.y) * 4.3);
    player.position.add(side);
    player.rotation.y = car.rotation.y;
    setMode(false);
    showHint("You exited the M4");
  } else if (player.position.distanceTo(car.position) < 7) {
    setMode(true);
    showHint("GAS accelerates • joystick steers");
  } else {
    showHint("Move closer to your M4");
  }
}
ui.enter.addEventListener("pointerdown", e => { e.preventDefault(); toggleVehicle(); });
ui.action.addEventListener("pointerdown", () => showHint(driving ? "Action unavailable while driving" : "Action selected"));
ui.jump.addEventListener("pointerdown", e => { e.preventDefault(); if (!driving) showHint("Jump action"); });
ui.fire.addEventListener("pointerdown", e => { e.preventDefault(); showHint(driving ? "Vehicle action" : "Action selected"); });
ui.horn.addEventListener("pointerdown", e => { e.preventDefault(); if (driving) showHint("Honk"); });

function showHint(text, seconds = 3) {
  ui.hint.textContent = text; ui.hint.style.opacity = 1; hintTimer = seconds;
}

function collides(position, radius = 1) {
  if (Math.abs(position.x) > 688 || Math.abs(position.z) > 688) return true;
  return buildingBounds.some(b => position.x + radius > b.minX && position.x - radius < b.maxX && position.z + radius > b.minZ && position.z - radius < b.maxZ);
}

function trafficCollision(position) {
  return traffic.some(vehicle => vehicle.position.distanceToSquared(position) < 15);
}

let nightAmount = 0;
let clockTimer = 0;
const atmosphereColor = new THREE.Color();
function updateAtmosphere(dt) {
  worldHours = (worldHours + dt * 24 / DAY_LENGTH) % 24;
  const sunAngle = (worldHours - 6) / 24 * Math.PI * 2;
  const sunHeight = Math.sin(sunAngle);
  const daylight = THREE.MathUtils.smoothstep(sunHeight, -.12, .24);
  nightAmount = 1 - daylight;
  const twilight = Math.max(0, 1 - Math.abs(sunHeight) / .3) * .58;

  atmosphereColor.copy(nightSky).lerp(daySky, daylight).lerp(sunsetSky, twilight);
  scene.background.copy(atmosphereColor);
  scene.fog.color.copy(nightFog).lerp(dayFog, daylight).lerp(sunsetSky, twilight * .25);
  scene.fog.density = THREE.MathUtils.lerp(.00215, .00155, daylight);
  hemi.intensity = .88 + daylight * 1.78;
  hemi.color.set(daylight > .45 ? 0xdff2ff : 0x7892bd);
  sun.intensity = .08 + daylight * 3.05;
  sun.position.set(Math.cos(sunAngle) * 170, Math.max(12, sunHeight * 210), Math.sin(sunAngle) * 145);
  moon.intensity = .42 + nightAmount * .92;
  ambientFill.intensity = .68 + nightAmount * .42;
  windowMaterial.emissiveIntensity = .22 + nightAmount * 2.25;
  storefrontGlass.emissiveIntensity = .12 + nightAmount * 1.7;
  lampBulbMaterial.emissiveIntensity = .08 + nightAmount * 4.2;
  car.userData.headlightMaterial.emissiveIntensity = .65 + nightAmount * 3.4;
  car.userData.headBeam.intensity = nightAmount * 42;

  clockTimer -= dt;
  if (clockTimer <= 0) {
    const totalMinutes = Math.floor(worldHours * 60);
    const hours24 = Math.floor(totalMinutes / 60);
    const minutes = String(totalMinutes % 60).padStart(2, "0");
    const suffix = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 || 12;
    ui.clock.textContent = `${hours12}:${minutes} ${suffix} · ${nightAmount > .62 ? "NIGHT" : twilight > .2 ? "SUNSET" : "CLEAR"}`;
    clockTimer = .5;
  }
}

function updateTraffic(dt) {
  for (const vehicle of traffic) {
    const data = vehicle.userData.traffic;
    if (data.vertical) vehicle.position.z += data.direction * data.speed * dt;
    else vehicle.position.x += data.direction * data.speed * dt;
    if (vehicle.position.x > 690) vehicle.position.x = -690;
    if (vehicle.position.x < -690) vehicle.position.x = 690;
    if (vehicle.position.z > 690) vehicle.position.z = -690;
    if (vehicle.position.z < -690) vehicle.position.z = 690;
    for (const wheel of vehicle.userData.wheels) wheel.rotation.x += data.speed * data.direction * dt / .82;
    vehicle.userData.headlightMaterial.emissiveIntensity = .35 + nightAmount * 1.9;
    vehicle.userData.tailMaterial.emissiveIntensity = .65 + nightAmount * 1.4;
  }
}

function updatePedestrians(dt) {
  for (const pedestrian of pedestrians) {
    const data = pedestrian.userData.walk;
    if (data.axis) pedestrian.position.z += data.direction * data.speed * dt;
    else pedestrian.position.x += data.direction * data.speed * dt;
    if (pedestrian.position.x > 660) pedestrian.position.x = -660;
    if (pedestrian.position.x < -660) pedestrian.position.x = 660;
    if (pedestrian.position.z > 660) pedestrian.position.z = -660;
    if (pedestrian.position.z < -660) pedestrian.position.z = 660;
    data.phase += dt * data.speed * 4;
    const swing = Math.sin(data.phase) * .28;
    pedestrian.userData.limbs.arms[0].rotation.x = swing;
    pedestrian.userData.limbs.arms[1].rotation.x = -swing;
    pedestrian.userData.limbs.legs[0].rotation.x = -swing;
    pedestrian.userData.limbs.legs[1].rotation.x = swing;
  }
}

const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const desiredCamera = new THREE.Vector3();
const cameraTarget = new THREE.Vector3();
function updatePlayer(dt) {
  const ix = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + input.x;
  const iy = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) + input.y;
  const length = Math.min(1, Math.hypot(ix, iy));
  if (length > .08) {
    const camDirection = new THREE.Vector3(Math.sin(cameraOrbit + playerYaw), 0, Math.cos(cameraOrbit + playerYaw));
    right.set(camDirection.z, 0, -camDirection.x);
    const move = camDirection.multiplyScalar(iy).add(right.multiplyScalar(ix)).normalize();
    const pace = (input.run || keys.ShiftLeft ? 9 : 5.2) * length;
    const candidate = player.position.clone().addScaledVector(move, pace * dt);
    if (!collides(candidate, .65)) player.position.copy(candidate);
    playerYaw = Math.atan2(move.x, move.z);
    player.rotation.y = playerYaw;
    walkCycle += dt * pace * 2.3;
    const swing = Math.sin(walkCycle) * .65 * length;
    player.userData.limbs.arms[0].rotation.x = swing;
    player.userData.limbs.arms[1].rotation.x = -swing;
    player.userData.limbs.legs[0].rotation.x = -swing;
    player.userData.limbs.legs[1].rotation.x = swing;
    cameraOrbit *= Math.pow(.996, dt * 60);
  } else {
    for (const limb of [...player.userData.limbs.arms, ...player.userData.limbs.legs]) limb.rotation.x *= .82;
  }
  if (missionStage === 0) {
    const distance = player.position.distanceTo(car.position);
    ui.progress.style.width = `${Math.max(0, 100 - distance * 3)}%`;
    if (distance < 6.5) {
      missionStage = 1; ui.mission.textContent = "Enter your M4";
      ui.progress.style.width = "50%"; showHint("Tap ENTER to get in");
    }
  }
}

function updateCar(dt) {
  const throttle = (input.gas || keys.KeyW || keys.ArrowUp ? 1 : 0);
  const braking = (input.brake || keys.KeyS || keys.ArrowDown ? 1 : 0);
  const steer = THREE.MathUtils.clamp(input.x + (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0), -1, 1);
  if (throttle) speed += (speed < 0 ? 31 : 20 * (1 - Math.min(speed, 38) / 70)) * dt;
  if (braking) speed -= (speed > 1 ? 39 : 12) * dt;
  if (!throttle && !braking && speed !== 0) {
    const rollingDrag = (.55 + Math.abs(speed) * .035) * dt;
    speed -= Math.sign(speed) * Math.min(Math.abs(speed), rollingDrag);
  }
  speed = THREE.MathUtils.clamp(speed, -11, 38);
  if (Math.abs(speed) < .04) speed = 0;
  const targetSteering = steer * THREE.MathUtils.lerp(.53, .3, Math.min(Math.abs(speed) / 38, 1));
  steeringAngle = THREE.MathUtils.damp(steeringAngle, targetSteering, 8.5, dt);
  if (Math.abs(speed) > .12) car.rotation.y += Math.tan(steeringAngle) * (speed / 5.5) * dt * .42;
  forward.set(Math.sin(car.rotation.y), 0, Math.cos(car.rotation.y));
  const candidate = car.position.clone().addScaledVector(forward, speed * dt);
  if (!collides(candidate, 2.25) && !trafficCollision(candidate)) car.position.copy(candidate);
  else { speed *= -.12; showHint("Watch the traffic", 1.2); }
  for (const wheel of car.userData.wheels) wheel.rotation.x += speed * dt / .82;
  for (const wheel of car.userData.frontWheels) wheel.rotation.y = steeringAngle;
  car.userData.tailMaterial.emissiveIntensity = .9 + nightAmount * 1.5 + (braking ? 3.2 : 0);
  ui.speed.textContent = String(Math.round(Math.abs(speed) * 2.237));
  if (missionStage === 2) {
    const distance = car.position.distanceTo(targetPosition);
    ui.progress.style.width = `${THREE.MathUtils.clamp(100 - distance / 2.6, 12, 100)}%`;
    if (distance < 11) {
      missionStage = 3; marker.visible = false; ui.mission.textContent = "Mission complete — explore Utica";
      ui.progress.style.width = "100%"; $("money").textContent = "750"; showHint("MISSION PASSED  +$250", 5);
    }
  }
}

function nearestStreet(position) {
  let vx = 0, vz = 0, dx = Infinity, dz = Infinity;
  roadCoords.forEach((value, i) => {
    if (Math.abs(position.x - value) < dx) { dx = Math.abs(position.x - value); vx = i; }
    if (Math.abs(position.z - value) < dz) { dz = Math.abs(position.z - value); vz = i; }
  });
  return dx < dz ? northSouthNames[vx] : eastWestNames[vz];
}

function updateCamera(dt) {
  const subject = driving ? car.position : player.position;
  const yaw = (driving ? car.rotation.y : playerYaw) + cameraOrbit;
  forward.set(Math.sin(yaw), 0, Math.cos(yaw));
  const distance = driving ? 14 + Math.abs(speed) * .08 : 8.8;
  const height = driving ? 4.8 : 4.7;
  desiredCamera.copy(subject).addScaledVector(forward, -distance * Math.cos(cameraPitch));
  desiredCamera.y += height + distance * Math.sin(cameraPitch);
  const smoothing = 1 - Math.exp(-(driving ? 4.2 : 6.5) * dt);
  camera.position.lerp(desiredCamera, smoothing);
  cameraTarget.copy(subject); cameraTarget.y += driving ? 1.3 : 2.15;
  camera.lookAt(cameraTarget);
}

camera.position.set(8, 5.8, -10);
camera.lookAt(player.position.x, 2, player.position.z);
let streetTimer = 0;
function animate() {
  const dt = Math.min(clock.getDelta(), .05);
  updateAtmosphere(dt);
  updateTraffic(dt);
  updatePedestrians(dt);
  if (driving) updateCar(dt); else updatePlayer(dt);
  updateCamera(dt);
  drawMinimap(dt);
  marker.rotation.y += dt * .7;
  markerRing.position.y = .5 + Math.sin(clock.elapsedTime * 2) * .15;
  streetTimer -= dt;
  if (streetTimer <= 0) {
    ui.street.textContent = nearestStreet(driving ? car.position : player.position);
    streetTimer = .3;
  }
  if (hintTimer > 0) {
    hintTimer -= dt;
    if (hintTimer <= 0) ui.hint.style.opacity = 0;
  }
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.45));
});
document.addEventListener("contextmenu", e => e.preventDefault());
setTimeout(() => ui.loading.classList.add("done"), 850);
setTimeout(() => showHint("Use the joystick to walk to your M4", 4), 950);
