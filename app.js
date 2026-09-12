import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const $ = id => document.getElementById(id);
const ui = {
  loading: $("loading"), loadingText: $("loadingText"), street: $("street"),
  mission: $("mission"), progress: $("missionProgress"), speed: $("speed"),
  speedometer: $("speedometer"), hint: $("hint"), controls: $("controls"),
  joystick: $("joystick"), stick: $("stick"), enter: $("enterBtn"),
  run: $("runBtn"), action: $("actionBtn"), gas: $("gasBtn"), brake: $("brakeBtn")
};

ui.loadingText.textContent = "Starting the 3D engine…";
const renderer = new THREE.WebGLRenderer({ canvas: $("game"), antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8bb6d3);
scene.fog = new THREE.FogExp2(0x9dbacf, 0.00165);
const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 1100);
const clock = new THREE.Clock();

scene.add(new THREE.HemisphereLight(0xdff2ff, 0x52604a, 2.1));
const sun = new THREE.DirectionalLight(0xfff4df, 3.1);
sun.position.set(-130, 190, -80);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = sun.shadow.camera.bottom = -190;
sun.shadow.camera.right = sun.shadow.camera.top = 190;
sun.shadow.camera.far = 500;
scene.add(sun);

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
const WORLD = 600;
const ROAD_STEP = 82;
const ROAD_WIDTH = 22;
const roadCoords = [-246, -164, -82, 0, 82, 164, 246];
const northSouthNames = [
  "CORNELIA STREET", "STATE STREET", "GENESEE STREET", "ONEIDA STREET",
  "MOHAWK STREET", "KOSSUTH AVENUE", "CULVER AVENUE"
];
const eastWestNames = [
  "COURT STREET", "COLUMBIA STREET", "LAFAYETTE STREET", "ORISKANY STREET",
  "BROAD STREET", "BLEECKER STREET", "RUTGER STREET"
];
const roadMat = mat(0x262b2f, .97);
const sidewalkMat = mat(0xa5a7a2, 1);
const grassMat = mat(0x506d42, 1);
const stripeMat = mat(0xe3b72c, .8);
const whiteMat = mat(0xdddcd1, .8);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), grassMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

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
  for (let p = -286; p <= 286; p += 16) {
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

function addBuilding(x, z, w, d, h, color) {
  const group = new THREE.Group();
  const base = box(w, h, d, mat(color, .88));
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
        group.add(win);
      }
    }
    for (let col = 0; col < colsZ; col++) {
      const pz = -d / 2 + (col + .5) * d / colsZ;
      for (const side of [-1, 1]) {
        const win = box(.08, 1.35, Math.min(1.7, d / colsZ * .5), windowMaterial);
        win.position.set(side * (w / 2 + .045), y, pz);
        group.add(win);
      }
    }
  }
  if (seedRandom() > .55) {
    const rooftop = box(w * .3, 1.2, d * .28, mat(0x5a5c5c));
    rooftop.position.set(0, h + 1.15, 0);
    group.add(rooftop);
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
for (let i = 0; i < roadCoords.length; i += 2) {
  addStreetSign(roadCoords[i] + 13, 13, northSouthNames[i]);
  addStreetSign(13, roadCoords[i] + 13, eastWestNames[i], true);
}

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
  const along = -280 + seedRandom() * 560;
  if (roadCoords.some(v => Math.abs(along - v) < 18)) continue;
  addTree(axis ? road + (seedRandom() > .5 ? 15 : -15) : along, axis ? along : road + (seedRandom() > .5 ? 15 : -15));
}

ui.loadingText.textContent = "Preparing your M4…";
function createCar(color = 0x36a7d8) {
  const car = new THREE.Group();
  const paint = mat(color, .22, .72);
  const dark = mat(0x090b0d, .25, .7);
  const glass = new THREE.MeshStandardMaterial({ color: 0x15242e, roughness: .08, metalness: .4, transparent: true, opacity: .92 });
  const body = box(4.35, .72, 8.4, paint); body.position.y = 1.05; car.add(body);
  const hood = box(4.15, .28, 2.6, paint); hood.position.set(0, 1.54, 2.25); hood.rotation.x = -.04; car.add(hood);
  const roof = box(3.55, 1.12, 3.6, paint); roof.position.set(0, 2.05, -.55); car.add(roof);
  const windshield = box(3.35, .92, .08, glass); windshield.position.set(0, 2.08, 1.27); windshield.rotation.x = -.35; car.add(windshield);
  const rearGlass = box(3.35, .84, .08, glass); rearGlass.position.set(0, 2.06, -2.38); rearGlass.rotation.x = .35; car.add(rearGlass);
  for (const side of [-1, 1]) {
    const sideGlass = box(.06, .76, 2.65, glass); sideGlass.position.set(side * 1.8, 2.1, -.55); car.add(sideGlass);
    const mirror = box(.35, .25, .52, paint); mirror.position.set(side * 2.15, 1.95, .78); car.add(mirror);
  }
  const grille = box(2.2, .62, .1, dark); grille.position.set(0, 1.05, 4.23); car.add(grille);
  for (const side of [-1, 1]) {
    const kidney = box(.78, .52, .12, mat(0x050505, .2, .85)); kidney.position.set(side * .48, 1.12, 4.3); car.add(kidney);
    const headlight = box(1.05, .28, .12, new THREE.MeshStandardMaterial({ color: 0xe7f3ff, emissive: 0xbadfff, emissiveIntensity: 1.7 }));
    headlight.position.set(side * 1.48, 1.35, 4.29); car.add(headlight);
    const tail = box(1.18, .25, .12, new THREE.MeshStandardMaterial({ color: 0xdd1414, emissive: 0x8b0505, emissiveIntensity: 1.4 }));
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
  car.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return car;
}

function createPerson() {
  const person = new THREE.Group();
  const skin = mat(0x8a553c, .8);
  const clothes = mat(0x202c3d, .9);
  const denim = mat(0x27364c, .9);
  const shoe = mat(0x111111);
  const torso = box(1.05, 1.65, .55, clothes); torso.position.y = 2.42; person.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.43, 18, 14), skin); head.position.y = 3.72; head.castShadow = true; person.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(.44, 18, 8, 0, Math.PI * 2, 0, Math.PI * .48), mat(0x17120f)); hair.position.y = 3.82; person.add(hair);
  const limbs = { arms: [], legs: [] };
  for (const side of [-1, 1]) {
    const armPivot = new THREE.Group(); armPivot.position.set(side * .66, 3, 0); person.add(armPivot);
    const arm = box(.3, 1.45, .32, skin); arm.position.y = -.67; armPivot.add(arm); limbs.arms.push(armPivot);
    const legPivot = new THREE.Group(); legPivot.position.set(side * .29, 1.65, 0); person.add(legPivot);
    const leg = box(.43, 1.55, .48, denim); leg.position.y = -.72; legPivot.add(leg);
    const foot = box(.48, .28, .8, shoe); foot.position.set(0, -1.5, .14); legPivot.add(foot); limbs.legs.push(legPivot);
  }
  person.userData.limbs = limbs;
  return person;
}

const car = createCar();
car.position.set(0, .05, 31);
scene.add(car);
const player = createPerson();
player.position.set(8, 0, -1);
scene.add(player);

// A few parked vehicles make downtown feel occupied without hurting phone performance.
for (let i = 0; i < 12; i++) {
  const parked = createCar([0x962b32, 0xeeeeee, 0x222831, 0x777777][i % 4]);
  parked.scale.setScalar(.76);
  const road = roadCoords[(i + 2) % roadCoords.length];
  parked.position.set(road + (i % 2 ? 6 : -6), .03, -220 + i * 39);
  parked.rotation.y = i % 2 ? 0 : Math.PI;
  scene.add(parked);
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
function updateJoystick(clientX, clientY) {
  const rect = ui.joystick.getBoundingClientRect();
  let x = (clientX - (rect.left + rect.width / 2)) / (rect.width * .34);
  let y = (clientY - (rect.top + rect.height / 2)) / (rect.height * .34);
  const length = Math.hypot(x, y);
  if (length > 1) { x /= length; y /= length; }
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

function bindHold(element, key) {
  const set = value => { input[key] = value; element.classList.toggle("pressed", value); };
  element.addEventListener("pointerdown", e => { e.preventDefault(); element.setPointerCapture(e.pointerId); set(true); });
  element.addEventListener("pointerup", () => set(false));
  element.addEventListener("pointercancel", () => set(false));
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
let playerYaw = 0;
let missionStage = 0;
let walkCycle = 0;
let hintTimer = 4;
const targetPosition = new THREE.Vector3(-164, 0, -82);

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
ui.action.addEventListener("pointerdown", () => showHint("More activities are coming to Utica"));

function showHint(text, seconds = 3) {
  ui.hint.textContent = text; ui.hint.style.opacity = 1; hintTimer = seconds;
}

function collides(position, radius = 1) {
  if (Math.abs(position.x) > 292 || Math.abs(position.z) > 292) return true;
  return buildingBounds.some(b => position.x + radius > b.minX && position.x - radius < b.maxX && position.z + radius > b.minZ && position.z - radius < b.maxZ);
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
    const camDirection = new THREE.Vector3();
    camera.getWorldDirection(camDirection); camDirection.y = 0; camDirection.normalize();
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
  if (throttle) speed += (speed < 0 ? 26 : 17) * dt;
  if (braking) speed -= (speed > 1 ? 32 : 11) * dt;
  if (!throttle && !braking) speed *= Math.pow(.42, dt);
  speed = THREE.MathUtils.clamp(speed, -9, 31);
  if (Math.abs(speed) < .04) speed = 0;
  const steerStrength = (0.35 + Math.min(Math.abs(speed) / 15, 1) * .72);
  car.rotation.y += steer * steerStrength * Math.sign(speed || 1) * dt;
  forward.set(Math.sin(car.rotation.y), 0, Math.cos(car.rotation.y));
  const candidate = car.position.clone().addScaledVector(forward, speed * dt);
  if (!collides(candidate, 2.25)) car.position.copy(candidate);
  else { speed *= -.18; showHint("Watch the buildings", 1.2); }
  for (const wheel of car.userData.wheels) wheel.rotation.x += speed * dt / .82;
  for (const wheel of car.userData.frontWheels) wheel.rotation.y = steer * .42;
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
  const yaw = driving ? car.rotation.y : playerYaw;
  forward.set(Math.sin(yaw), 0, Math.cos(yaw));
  const distance = driving ? 14 + Math.abs(speed) * .08 : 8.8;
  const height = driving ? 6.4 : 5.8;
  desiredCamera.copy(subject).addScaledVector(forward, -distance);
  desiredCamera.y += height;
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
  if (driving) updateCar(dt); else updatePlayer(dt);
  updateCamera(dt);
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
  renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
});
document.addEventListener("contextmenu", e => e.preventDefault());
setTimeout(() => ui.loading.classList.add("done"), 850);
setTimeout(() => showHint("Use the joystick to walk to your M4", 4), 950);
