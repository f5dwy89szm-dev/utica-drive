import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.module.js";

const game = document.getElementById("game");

const loading = document.getElementById("loading");

const loadingText = document.getElementById("loadingText");

const modeLabel = document.getElementById("modeLabel");

const speedLabel = document.getElementById("speedLabel");

const message = document.getElementById("message");

const leftBtn = document.getElementById("leftBtn");

const rightBtn = document.getElementById("rightBtn");

const gasBtn = document.getElementById("gasBtn");

const brakeBtn = document.getElementById("brakeBtn");

const reverseBtn = document.getElementById("reverseBtn");

const enterExitBtn = document.getElementById("enterExitBtn");

const runBtn = document.getElementById("runBtn");

const steeringControls = document.getElementById("steeringControls");

const pedalControls = document.getElementById("pedalControls");

const joystickArea = document.getElementById("joystickArea");

const joystickBase = document.getElementById("joystickBase");

const joystickKnob = document.getElementById("joystickKnob");

const renderer = new THREE.WebGLRenderer({

  antialias: true,

  powerPreference: "high-performance"

});

renderer.setSize(innerWidth, innerHeight);

renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));

renderer.shadowMap.enabled = true;

renderer.outputColorSpace = THREE.SRGBColorSpace;

game.appendChild(renderer.domElement);

const scene = new THREE.Scene();

scene.background = new THREE.Color(0xa8c8df);

scene.fog = new THREE.Fog(0xa8c8df, 350, 1300);

const camera = new THREE.PerspectiveCamera(

  65,

  innerWidth / innerHeight,

  0.1,

  2000

);

const hemi = new THREE.HemisphereLight(0xd9edff, 0x665b45, 2.1);

scene.add(hemi);

const sun = new THREE.DirectionalLight(0xffffff, 2.4);

sun.position.set(100, 170, 70);

sun.castShadow = true;

scene.add(sun);

const ground = new THREE.Mesh(

  new THREE.PlaneGeometry(2200, 2200),

  new THREE.MeshStandardMaterial({

    color: 0x648450,

    roughness: 1

  })

);

ground.rotation.x = -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);

const roadGroup = new THREE.Group();

const buildingGroup = new THREE.Group();

scene.add(roadGroup);

scene.add(buildingGroup);

const CENTER_LAT = 43.1006;

const CENTER_LON = -75.2325;

const SOUTH = 43.0925;

const NORTH = 43.1087;

const WEST = -75.2435;

const EAST = -75.2215;

function geoToWorld(lat, lon) {

  const metersLat = 111320;

  const metersLon =

    111320 * Math.cos(CENTER_LAT * Math.PI / 180);

  return new THREE.Vector3(

    (lon - CENTER_LON) * metersLon,

    0,

    -(lat - CENTER_LAT) * metersLat

  );

}

async function loadUtica() {

  loadingText.textContent = "Loading Utica streets and buildings...";

  const query = `

[out:json][timeout:30];

(

way["highway"](${SOUTH},${WEST},${NORTH},${EAST});

way["building"](${SOUTH},${WEST},${NORTH},${EAST});

);

out body;

>;

out skel qt;

`;

  const urls = [

    "https://overpass-api.de/api/interpreter",

    "https://overpass.kumi.systems/api/interpreter"

  ];

  let data = null;

  for (const endpoint of urls) {

    try {

      const response = await fetch(

        endpoint + "?data=" + encodeURIComponent(query)

      );

      if (!response.ok) continue;

      data = await response.json();

      break;

    } catch (err) {

      console.log(err);

    }

  }

  if (!data) {

    createFallbackCity();

    return;

  }

  buildWorld(data);

}

function buildWorld(data) {

  const nodes = new Map();

  for (const item of data.elements) {

    if (item.type === "node") {

      nodes.set(

        item.id,

        geoToWorld(item.lat, item.lon)

      );

    }

  }

  let buildingCount = 0;

  for (const item of data.elements) {

    if (item.type !== "way" || !item.nodes) continue;

    if (item.tags?.highway) {

      createRoad(item, nodes);

    }

    if (item.tags?.building && buildingCount < 900) {

      createBuilding(item, nodes);

      buildingCount++;

    }

  }

}

function getRoadWidth(tags) {

  const lanes = parseFloat(tags?.lanes);

  if (Number.isFinite(lanes)) {

    return THREE.MathUtils.clamp(lanes * 3.2, 5, 14);

  }

  switch (tags?.highway) {

    case "primary":

      return 11;

    case "secondary":

      return 9;

    case "tertiary":

      return 8;

    case "residential":

      return 6.7;

    case "service":

      return 4.5;

    default:

      return 5.5;

  }

}

function createRoad(way, nodes) {

  const points = way.nodes

    .map(id => nodes.get(id))

    .filter(Boolean);

  if (points.length < 2) return;

  const width = getRoadWidth(way.tags);

  for (let i = 0; i < points.length - 1; i++) {

    const a = points[i];

    const b = points[i + 1];

    const dx = b.x - a.x;

    const dz = b.z - a.z;

    const length = Math.hypot(dx, dz);

    if (length < 1) continue;

    const sidewalk = new THREE.Mesh(

      new THREE.BoxGeometry(width + 3, 0.1, length),

      new THREE.MeshStandardMaterial({

        color: 0x99948c,

        roughness: 1

      })

    );

    sidewalk.position.set(

      (a.x + b.x) / 2,

      0.05,

      (a.z + b.z) / 2

    );

    sidewalk.rotation.y = Math.atan2(dx, dz);

    roadGroup.add(sidewalk);

    const road = new THREE.Mesh(

      new THREE.BoxGeometry(width, 0.12, length + 0.2),

      new THREE.MeshStandardMaterial({

        color: 0x343638,

        roughness: 1

      })

    );

    road.position.set(

      (a.x + b.x) / 2,

      0.12,

      (a.z + b.z) / 2

    );

    road.rotation.y = Math.atan2(dx, dz);

    road.receiveShadow = true;

    roadGroup.add(road);

  }

}

function getBuildingHeight(tags) {

  if (tags?.height) {

    const value = parseFloat(tags.height);

    if (Number.isFinite(value)) return value;

  }

  if (tags?.["building:levels"]) {

    const levels = parseFloat(tags["building:levels"]);

    if (Number.isFinite(levels)) return levels * 3.1;

  }

  switch (tags?.building) {

    case "house":

    case "detached":

      return THREE.MathUtils.randFloat(5.5, 8.5);

    case "apartments":

      return THREE.MathUtils.randFloat(9, 20);

    case "commercial":

    case "retail":

      return THREE.MathUtils.randFloat(7, 15);

    default:

      return THREE.MathUtils.randFloat(6, 14);

  }

}

function createBuilding(way, nodes) {

  const points = way.nodes

    .map(id => nodes.get(id))

    .filter(Boolean);

  if (points.length < 4) return;

  const shape = new THREE.Shape();

  shape.moveTo(points[0].x, -points[0].z);

  for (let i = 1; i < points.length; i++) {

    shape.lineTo(points[i].x, -points[i].z);

  }

  const height = getBuildingHeight(way.tags);

  const geometry = new THREE.ExtrudeGeometry(shape, {

    depth: height,

    bevelEnabled: false

  });

  geometry.rotateX(Math.PI / 2);

  const colors = [

    0x805649,

    0x9b7863,

    0xb2a48f,

    0x756b61,

    0xaaa39a

  ];

  const material = new THREE.MeshStandardMaterial({

    color: colors[Math.floor(Math.random() * colors.length)],

    roughness: 0.9

  });

  const building = new THREE.Mesh(geometry, material);

  building.castShadow = true;

  building.receiveShadow = true;

  buildingGroup.add(building);

}

function createFallbackCity() {

  for (let x = -350; x <= 350; x += 70) {

    createFallbackRoad(x, 0, 8, 800);

  }

  for (let z = -350; z <= 350; z += 70) {

    createFallbackRoad(0, z, 800, 8);

  }

  for (let x = -315; x <= 315; x += 70) {

    for (let z = -315; z <= 315; z += 70) {

      const h = THREE.MathUtils.randFloat(6, 18);

      const building = new THREE.Mesh(

        new THREE.BoxGeometry(

          THREE.MathUtils.randFloat(18, 38),

          h,

          THREE.MathUtils.randFloat(18, 38)

        ),

        new THREE.MeshStandardMaterial({

          color: 0x8e7969

        })

      );

      building.position.set(x, h / 2, z);

      buildingGroup.add(building);

    }

  }

}

function createFallbackRoad(x, z, width, depth) {

  const road = new THREE.Mesh(

    new THREE.BoxGeometry(width, 0.12, depth),

    new THREE.MeshStandardMaterial({

      color: 0x343638

    })

  );

  road.position.set(x, 0.12, z);

  roadGroup.add(road);

}

/* CAR */

const car = new THREE.Group();

scene.add(car);

const carBody = new THREE.Mesh(

  new THREE.BoxGeometry(1.9, 0.5, 4.75),

  new THREE.MeshStandardMaterial({

    color: 0x202832,

    metalness: 0.5,

    roughness: 0.35

  })

);

carBody.position.y = 0.7;

carBody.castShadow = true;

car.add(carBody);

const cabin = new THREE.Mesh(

  new THREE.BoxGeometry(1.55, 0.65, 2.2),

  new THREE.MeshStandardMaterial({

    color: 0x263844,

    roughness: 0.3

  })

);

cabin.position.set(0, 1.2, 0.1);

car.add(cabin);

const wheelMaterial = new THREE.MeshStandardMaterial({

  color: 0x111111

});

const wheelGeometry = new THREE.CylinderGeometry(

  0.34,

  0.34,

  0.24,

  16

);

function addWheel(x, z) {

  const wheel = new THREE.Mesh(

    wheelGeometry,

    wheelMaterial

  );

  wheel.rotation.z = Math.PI / 2;

  wheel.position.set(x, 0.4, z);

  car.add(wheel);

}

addWheel(-0.94, -1.5);

addWheel(0.94, -1.5);

addWheel(-0.94, 1.5);

addWheel(0.94, 1.5);

car.position.set(0, 0.04, 0);

/* PLAYER */

const player = new THREE.Group();

player.visible = false;

scene.add(player);

const legs = new THREE.MeshStandardMaterial({

  color: 0x25282d

});

const shirt = new THREE.MeshStandardMaterial({

  color: 0x44515a

});

const skin = new THREE.MeshStandardMaterial({

  color: 0x9d765e

});

const leftLeg = new THREE.Mesh(

  new THREE.CapsuleGeometry(0.09, 0.58, 5, 8),

  legs

);

const rightLeg = leftLeg.clone();

leftLeg.position.set(-0.11, 0.48, 0);

rightLeg.position.set(0.11, 0.48, 0);

player.add(leftLeg, rightLeg);

const torso = new THREE.Mesh(

  new THREE.CapsuleGeometry(0.21, 0.48, 6, 10),

  shirt

);

torso.position.y = 1.08;

player.add(torso);

const head = new THREE.Mesh(

  new THREE.SphereGeometry(0.14, 16, 12),

  skin

);

head.position.y = 1.67;

player.add(head);

const leftArm = new THREE.Mesh(

  new THREE.CapsuleGeometry(0.065, 0.48, 5, 8),

  shirt

);

const rightArm = leftArm.clone();

leftArm.position.set(-0.3, 1.08, 0);

rightArm.position.set(0.3, 1.08, 0);

player.add(leftArm, rightArm);

/* CONTROLS */

let mode = "car";

let speed = 0;

let steering = 0;

let joystickX = 0;

let joystickY = 0;

let walkTime = 0;

const controls = {

  gas: false,

  brake: false,

  reverse: false,

  left: false,

  right: false,

  run: false

};

function hold(button, key) {

  const down = e => {

    e.preventDefault();

    controls[key] = true;

    button.classList.add("active");

  };

  const up = e => {

    e.preventDefault();

    controls[key] = false;

    button.classList.remove("active");

  };

  button.addEventListener("pointerdown", down);

  button.addEventListener("pointerup", up);

  button.addEventListener("pointercancel", up);

}

hold(gasBtn, "gas");

hold(brakeBtn, "brake");

hold(reverseBtn, "reverse");

hold(leftBtn, "left");

hold(rightBtn, "right");

hold(runBtn, "run");

enterExitBtn.addEventListener("pointerdown", e => {

  e.preventDefault();

  toggleVehicle();

});

function toggleVehicle() {

  if (mode === "car") {

    exitVehicle();

  } else {

    enterVehicle();

  }

}

function exitVehicle() {

  if (Math.abs(speed) > 1.8) {

    showMessage("Slow down before exiting");

    return;

  }

  speed = 0;

  mode = "walk";

  player.visible = true;

  const offset = new THREE.Vector3(-1.45, 0, 0.15);

  offset.applyQuaternion(car.quaternion);

  player.position.copy(car.position);

  player.position.add(offset);

  player.position.y = 0;

  player.rotation.y = car.rotation.y;

  updateUI();

}

function enterVehicle() {

  if (player.position.distanceTo(car.position) > 3.1) {

    showMessage("Move closer to the car");

    return;

  }

  mode = "car";

  player.visible = false;

  joystickX = 0;

  joystickY = 0;

  joystickKnob.style.transform = "translate(0,0)";

  updateUI();

}

function updateUI() {

  const driving = mode === "car";

  modeLabel.textContent = driving ? "DRIVING" : "ON FOOT";

  enterExitBtn.textContent = driving ? "EXIT" : "ENTER";

  steeringControls.style.display = driving ? "flex" : "none";

  pedalControls.style.display = driving ? "grid" : "none";

  joystickArea.style.display = driving ? "none" : "block";

  runBtn.style.display = driving ? "none" : "block";

  speedLabel.style.display = driving ? "block" : "none";

}

/* JOYSTICK */

let activePointer = null;

joystickArea.addEventListener("pointerdown", e => {

  activePointer = e.pointerId;

  joystickArea.setPointerCapture(e.pointerId);

  updateJoystick(e);

});

joystickArea.addEventListener("pointermove", e => {

  if (e.pointerId !== activePointer) return;

  updateJoystick(e);

});

joystickArea.addEventListener("pointerup", () => {

  activePointer = null;

  joystickX = 0;

  joystickY = 0;

  joystickKnob.style.transform = "translate(0,0)";

});

function updateJoystick(e) {

  const rect = joystickBase.getBoundingClientRect();

  const cx = rect.left + rect.width / 2;

  const cy = rect.top + rect.height / 2;

  let dx = e.clientX - cx;

  let dy = e.clientY - cy;

  const radius = 44;

  const dist = Math.hypot(dx, dy);

  if (dist > radius) {

    dx = dx / dist * radius;

    dy = dy / dist * radius;

  }

  joystickX = dx / radius;

  joystickY = dy / radius;

  joystickKnob.style.transform =

    `translate(${dx}px, ${dy}px)`;

}

/* PHYSICS */

function updateCar(dt) {

  if (controls.gas) speed += 10 * dt;

  if (controls.reverse) speed -= 7 * dt;

  if (controls.brake) {

    if (speed > 0) speed = Math.max(0, speed - 20 * dt);

    if (speed < 0) speed = Math.min(0, speed + 20 * dt);

  }

  if (!controls.gas && !controls.reverse && !controls.brake) {

    if (speed > 0) speed = Math.max(0, speed - 2.5 * dt);

    if (speed < 0) speed = Math.min(0, speed + 2.5 * dt);

  }

  speed = THREE.MathUtils.clamp(speed, -9, 26);

  let steerTarget = 0;

  if (controls.left) steerTarget = 1;

  if (controls.right) steerTarget = -1;

  steering = THREE.MathUtils.lerp(

    steering,

    steerTarget,

    Math.min(1, 7 * dt)

  );

  if (Math.abs(speed) > 0.1) {

    const dir = speed >= 0 ? 1 : -1;

    car.rotation.y +=

      steering *

      dir *

      Math.min(1, Math.abs(speed) / 4) *

      1.2 *

      dt;

  }

  const forward = new THREE.Vector3(0, 0, -1);

  forward.applyQuaternion(car.quaternion);

  car.position.addScaledVector(forward, speed * dt);

  speedLabel.textContent =

    Math.round(Math.abs(speed) * 2.23694) + " MPH";

}

function updatePlayer(dt) {

  const amount = Math.min(

    1,

    Math.hypot(joystickX, joystickY)

  );

  if (amount < 0.05) return;

  const cameraForward = new THREE.Vector3();

  camera.getWorldDirection(cameraForward);

  cameraForward.y = 0;

  cameraForward.normalize();

  const cameraRight = new THREE.Vector3(

    cameraForward.z,

    0,

    -cameraForward.x

  );

  const direction = new THREE.Vector3();

  direction.addScaledVector(

    cameraForward,

    -joystickY

  );

  direction.addScaledVector(

    cameraRight,

    joystickX

  );

  direction.normalize();

  const moveSpeed = controls.run ? 5.1 : 2.7;

  player.position.addScaledVector(

    direction,

    moveSpeed * amount * dt

  );

  player.rotation.y = Math.atan2(

    direction.x,

    direction.z

  );

  walkTime += dt * (controls.run ? 11 : 7);

  const swing = Math.sin(walkTime) * 0.5;

  leftLeg.rotation.x = swing;

  rightLeg.rotation.x = -swing;

  leftArm.rotation.x = -swing * 0.7;

  rightArm.rotation.x = swing * 0.7;

}

/* CAMERA */

const desiredCamera = new THREE.Vector3();

const lookTarget = new THREE.Vector3();

function updateCamera(dt) {

  if (mode === "car") {

    const offset = new THREE.Vector3(0, 3.2, 7);

    offset.applyQuaternion(car.quaternion);

    desiredCamera.copy(car.position).add(offset);

    camera.position.lerp(

      desiredCamera,

      1 - Math.pow(0.002, dt)

    );

    lookTarget.copy(car.position);

    lookTarget.y += 1;

    camera.lookAt(lookTarget);

  } else {

    const offset = new THREE.Vector3(0, 2.5, 4.4);

    offset.applyAxisAngle(

      new THREE.Vector3(0, 1, 0),

      player.rotation.y

    );

    desiredCamera.copy(player.position).add(offset);

    camera.position.lerp(

      desiredCamera,

      1 - Math.pow(0.003, dt)

    );

    lookTarget.copy(player.position);

    lookTarget.y += 1.3;

    camera.lookAt(lookTarget);

  }

}

/* MESSAGE */

let msgTimer;

function showMessage(text) {

  message.textContent = text;

  message.style.opacity = 1;

  clearTimeout(msgTimer);

  msgTimer = setTimeout(() => {

    message.style.opacity = 0;

  }, 1600);

}

/* RESIZE */

addEventListener("resize", () => {

  camera.aspect = innerWidth / innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(innerWidth, innerHeight);

});

/* LOOP */

const clock = new THREE.Clock();

function animate() {

  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.04);

  if (mode === "car") {

    updateCar(dt);

  } else {

    updatePlayer(dt);

  }

  updateCamera(dt);

  renderer.render(scene, camera);

}

/* START */

async function start() {

  updateUI();

  camera.position.set(0, 4, 8);

  await loadUtica();

  loadingText.textContent = "Entering Utica...";

  setTimeout(() => {

    loading.style.display = "none";

  }, 500);

  animate();

}

start();
