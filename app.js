import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.167.1/build/three.module.js";

/* =====================================================

   UTICA DRIVE

   Original mobile open-world prototype

   Uses OpenStreetMap public geographic data

   ===================================================== */

const container = document.getElementById("game");

const loading = document.getElementById("loading");

const loadingText = document.getElementById("loadingText");

const modeLabel = document.getElementById("modeLabel");

const speedLabel = document.getElementById("speedLabel");

const message = document.getElementById("message");

const steeringArea = document.getElementById("steeringArea");

const pedals = document.getElementById("pedals");

const joystickArea = document.getElementById("joystickArea");

const leftBtn = document.getElementById("leftBtn");

const rightBtn = document.getElementById("rightBtn");

const gasBtn = document.getElementById("gasBtn");

const brakeBtn = document.getElementById("brakeBtn");

const reverseBtn = document.getElementById("reverseBtn");

const enterExitBtn = document.getElementById("enterExitBtn");

const runBtn = document.getElementById("runBtn");

/* =========================

   RENDERER

   ========================= */

const renderer = new THREE.WebGLRenderer({

  antialias: true,

  powerPreference: "high-performance"

});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;

container.appendChild(renderer.domElement);

/* =========================

   SCENE

   ========================= */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x9fc5e8);

scene.fog = new THREE.Fog(0x9fc5e8, 300, 1150);

/* =========================

   CAMERA

   ========================= */

const camera = new THREE.PerspectiveCamera(

  65,

  window.innerWidth / window.innerHeight,

  0.1,

  2000

);

/* =========================

   LIGHTING

   ========================= */

const hemi = new THREE.HemisphereLight(

  0xcce6ff,

  0x57513c,

  2.2

);

scene.add(hemi);

const sun = new THREE.DirectionalLight(

  0xffffff,

  2.2

);

sun.position.set(120, 180, 80);

sun.castShadow = true;

sun.shadow.mapSize.set(1024, 1024);

sun.shadow.camera.left = -250;

sun.shadow.camera.right = 250;

sun.shadow.camera.top = 250;

sun.shadow.camera.bottom = -250;

scene.add(sun);

/* =========================

   WORLD GROUPS

   ========================= */

const roadGroup = new THREE.Group();

const buildingGroup = new THREE.Group();

const detailGroup = new THREE.Group();

scene.add(roadGroup);

scene.add(buildingGroup);

scene.add(detailGroup);

/* =========================

   GROUND

   ========================= */

const ground = new THREE.Mesh(

  new THREE.PlaneGeometry(2200, 2200),

  new THREE.MeshStandardMaterial({

    color: 0x648a50,

    roughness: 1

  })

);

ground.rotation.x = -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);

/* =====================================================

   REAL-WORLD MAP SETTINGS

   ===================================================== */

/*

 Downtown / central Utica approximate center.

 We convert latitude/longitude to local meters.

*/

const CENTER_LAT = 43.1009;

const CENTER_LON = -75.2327;

/*

 Small initial area for mobile performance.

 Roughly ~1.6km x ~1.6km.

*/

const MAP_RADIUS_LAT = 0.0072;

const MAP_RADIUS_LON = 0.0095;

const SOUTH = CENTER_LAT - MAP_RADIUS_LAT;

const NORTH = CENTER_LAT + MAP_RADIUS_LAT;

const WEST = CENTER_LON - MAP_RADIUS_LON;

const EAST = CENTER_LON + MAP_RADIUS_LON;

/* =========================

   COORDINATE CONVERSION

   ========================= */

function geoToWorld(lat, lon) {

  const metersPerLat = 111320;

  const metersPerLon =

    111320 *

    Math.cos(CENTER_LAT * Math.PI / 180);

  const x =

    (lon - CENTER_LON) *

    metersPerLon;

  const z =

    -(lat - CENTER_LAT) *

    metersPerLat;

  return new THREE.Vector3(x, 0, z);

}

/* =====================================================

   OPENSTREETMAP DATA

   ===================================================== */

async function loadUticaMap() {

  loadingText.textContent =

    "Downloading real Utica streets and buildings...";

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

  const url =

    "https://overpass-api.de/api/interpreter?data=" +

    encodeURIComponent(query);

  try {

    const response = await fetch(url);

    if (!response.ok)

      throw new Error("Map server unavailable");

    const data = await response.json();

    buildOSMWorld(data);

    loadingText.textContent =

      "Utica loaded.";

  } catch (error) {

    console.warn(error);

    loadingText.textContent =

      "Map server unavailable — loading fallback city.";

    createFallbackCity();

  }

}

/* =========================

   OSM PARSER

   ========================= */

function buildOSMWorld(data) {

  const nodes = new Map();

  for (const element of data.elements) {

    if (element.type === "node") {

      nodes.set(

        element.id,

        geoToWorld(element.lat, element.lon)

      );

    }

  }

  let roadCount = 0;

  let buildingCount = 0;

  for (const element of data.elements) {

    if (element.type !== "way")

      continue;

    if (!element.nodes)

      continue;

    if (element.tags?.highway) {

      createRoad(

        element,

        nodes

      );

      roadCount++;

    }

    if (element.tags?.building) {

      if (buildingCount < 850) {

        createBuilding(

          element,

          nodes

        );

        buildingCount++;

      }

    }

  }

  console.log(

    `Loaded ${roadCount} roads and ${buildingCount} buildings`

  );

}

/* =====================================================

   ROADS

   ===================================================== */

function roadWidth(tags) {

  const lanes =

    Number(tags?.lanes || 0);

  if (lanes > 0)

    return Math.min(18, Math.max(5.5, lanes * 3.3));

  switch (tags?.highway) {

    case "motorway":

      return 18;

    case "trunk":

      return 15;

    case "primary":

      return 12;

    case "secondary":

      return 10;

    case "tertiary":

      return 8;

    case "residential":

      return 7;

    case "service":

      return 5;

    default:

      return 5.5;

  }

}

function createRoad(way, nodes) {

  const points = way.nodes

    .map(id => nodes.get(id))

    .filter(Boolean);

  if (points.length < 2)

    return;

  const width = roadWidth(way.tags);

  for (let i = 0; i < points.length - 1; i++) {

    createRoadSegment(

      points[i],

      points[i + 1],

      width

    );

  }

}

function createRoadSegment(a, b, width) {

  const dx = b.x - a.x;

  const dz = b.z - a.z;

  const length =

    Math.sqrt(dx * dx + dz * dz);

  if (length < 1)

    return;

  const road = new THREE.Mesh(

    new THREE.BoxGeometry(

      width,

      0.12,

      length

    ),

    new THREE.MeshStandardMaterial({

      color: 0x36383a,

      roughness: .95

    })

  );

  road.position.set(

    (a.x + b.x) / 2,

    0.065,

    (a.z + b.z) / 2

  );

  road.rotation.y =

    Math.atan2(dx, dz);

  road.receiveShadow = true;

  roadGroup.add(road);

  /* Center line */

  if (width >= 7) {

    const line = new THREE.Mesh(

      new THREE.BoxGeometry(

        0.11,

        0.025,

        length * .92

      ),

      new THREE.MeshStandardMaterial({

        color: 0xd9c85c

      })

    );

    line.position.set(

      road.position.x,

      0.14,

      road.position.z

    );

    line.rotation.y =

      road.rotation.y;

    roadGroup.add(line);

  }

}

/* =====================================================

   BUILDINGS

   ===================================================== */

function getBuildingHeight(tags) {

  if (tags?.height) {

    const parsed =

      parseFloat(tags.height);

    if (Number.isFinite(parsed))

      return THREE.MathUtils.clamp(

        parsed,

        2.5,

        90

      );

  }

  if (tags?.["building:levels"]) {

    const levels =

      parseFloat(

        tags["building:levels"]

      );

    if (Number.isFinite(levels))

      return THREE.MathUtils.clamp(

        levels * 3.05,

        3,

        90

      );

  }

  const type =

    tags?.building;

  if (

    type === "house" ||

    type === "detached" ||

    type === "residential"

  ) {

    return THREE.MathUtils.randFloat(

      5.5,

      8.5

    );

  }

  if (

    type === "commercial" ||

    type === "retail"

  ) {

    return THREE.MathUtils.randFloat(

      6,

      13

    );

  }

  return THREE.MathUtils.randFloat(

    6,

    16

  );

}

function createBuilding(way, nodes) {

  const points =

    way.nodes

      .map(id => nodes.get(id))

      .filter(Boolean);

  if (points.length < 4)

    return;

  const shape =

    new THREE.Shape();

  shape.moveTo(

    points[0].x,

    -points[0].z

  );

  for (let i = 1; i < points.length; i++) {

    shape.lineTo(

      points[i].x,

      -points[i].z

    );

  }

  const height =

    getBuildingHeight(

      way.tags

    );

  const geometry =

    new THREE.ExtrudeGeometry(

      shape,

      {

        depth: height,

        bevelEnabled: false

      }

    );

  geometry.rotateX(

    Math.PI / 2

  );

  const colorChoices = [

    0xa99985,

    0xbeb19c,

    0x967c6b,

    0xb8afa5,

    0xc4b79f,

    0x82756b,

    0xaaa39a

  ];

  const material =

    new THREE.MeshStandardMaterial({

      color:

        colorChoices[

          Math.floor(

            Math.random() *

            colorChoices.length

          )

        ],

      roughness: .93

    });

  const building =

    new THREE.Mesh(

      geometry,

      material

    );

  building.castShadow = true;

  building.receiveShadow = true;

  buildingGroup.add(building);

}

/* =====================================================

   FALLBACK CITY

   ===================================================== */

function createFallbackCity() {

  for (

    let x = -350;

    x <= 350;

    x += 70

  ) {

    createFallbackRoad(

      x,

      0,

      10,

      780,

      0

    );

  }

  for (

    let z = -350;

    z <= 350;

    z += 70

  ) {

    createFallbackRoad(

      0,

      z,

      780,

      10,

      0

    );

  }

  for (

    let x = -315;

    x <= 315;

    x += 70

  ) {

    for (

      let z = -315;

      z <= 315;

      z += 70

    ) {

      if (Math.random() < .15)

        continue;

      createFallbackBuilding(

        x,

        z

      );

    }

  }

}

function createFallbackRoad(

  x,

  z,

  width,

  depth

) {

  const mesh =

    new THREE.Mesh(

      new THREE.BoxGeometry(

        width,

        .1,

        depth

      ),

      new THREE.MeshStandardMaterial({

        color: 0x36383a

      })

    );

  mesh.position.set(

    x,

    .05,

    z

  );

  roadGroup.add(mesh);

}

function createFallbackBuilding(

  x,

  z

) {

  const width =

    THREE.MathUtils.randFloat(

      16,

      38

    );

  const depth =

    THREE.MathUtils.randFloat(

      16,

      38

    );

  const height =

    THREE.MathUtils.randFloat(

      6,

      22

    );

  const mesh =

    new THREE.Mesh(

      new THREE.BoxGeometry(

        width,

        height,

        depth

      ),

      new THREE.MeshStandardMaterial({

        color:

          new THREE.Color().setHSL(

            .08,

            .12,

            THREE.MathUtils.randFloat(

              .45,

              .7

            )

          )

      })

    );

  mesh.position.set(

    x,

    height / 2,

    z

  );

  mesh.castShadow = true;

  mesh.receiveShadow = true;

  buildingGroup.add(mesh);

}

/* =====================================================

   PLAYER CHARACTER

   REAL SCALE: ~1.78 METERS

   ===================================================== */

const player =

  new THREE.Group();

player.visible = false;

scene.add(player);

/* legs */

const legMaterial =

  new THREE.MeshStandardMaterial({

    color: 0x222c38

  });

function makeLeg(x) {

  const leg =

    new THREE.Mesh(

      new THREE.CapsuleGeometry(

        .105,

        .63,

        5,

        8

      ),

      legMaterial

    );

  leg.position.set(

    x,

    .52,

    0

  );

  leg.castShadow = true;

  return leg;

}

const leftLeg =

  makeLeg(-.13);

const rightLeg =

  makeLeg(.13);

player.add(leftLeg);

player.add(rightLeg);

/* torso */

const torso =

  new THREE.Mesh(

    new THREE.CapsuleGeometry(

      .24,

      .53,

      6,

      10

    ),

    new THREE.MeshStandardMaterial({

      color: 0x30373f

    })

  );

torso.position.y = 1.12;

torso.castShadow = true;

player.add(torso);

/* head */

const head =

  new THREE.Mesh(

    new THREE.SphereGeometry(

      .145,

      18,

      14

    ),

    new THREE.MeshStandardMaterial({

      color: 0x9f765d

    })

  );

head.position.y = 1.69;

head.castShadow = true;

player.add(head);

/* arms */

const armMaterial =

  new THREE.MeshStandardMaterial({

    color: 0x30373f

  });

function makeArm(x) {

  const arm =

    new THREE.Mesh(

      new THREE.CapsuleGeometry(

        .075,

        .55,

        5,

        8

      ),

      armMaterial

    );

  arm.position.set(

    x,

    1.1,

    0

  );

  arm.castShadow = true;

  return arm;

}

const leftArm =

  makeArm(-.34);

const rightArm =

  makeArm(.34);

player.add(leftArm);

player.add(rightArm);

/* =====================================================

   VEHICLE

   REALISTIC MIDSIZE CAR:

   4.72m long

   1.88m wide

   ~1.45m high

   ===================================================== */

const car =

  new THREE.Group();

scene.add(car);

/* lower body */

const carBody =

  new THREE.Mesh(

    new THREE.BoxGeometry(

      1.88,

      .52,

      4.72

    ),

    new THREE.MeshStandardMaterial({

      color: 0x202936,

      metalness: .35,

      roughness: .42

    })

  );

carBody.position.y = .67;

carBody.castShadow = true;

car.add(carBody);

/* cabin */

const cabin =

  new THREE.Mesh(

    new THREE.BoxGeometry(

      1.58,

      .62,

      2.28

    ),

    new THREE.MeshStandardMaterial({

      color: 0x33414c,

      metalness: .15,

      roughness: .35

    })

  );

cabin.position.set(

  0,

  1.13,

  .18

);

cabin.castShadow = true;

car.add(cabin);

/* windows */

const windowMaterial =

  new THREE.MeshStandardMaterial({

    color: 0x16232c,

    metalness: .15,

    roughness: .18

  });

const windshield =

  new THREE.Mesh(

    new THREE.BoxGeometry(

      1.42,

      .43,

      .05

    ),

    windowMaterial

  );

windshield.position.set(

  0,

  1.25,

  -1

);

windshield.rotation.x =

  -.14;

car.add(windshield);

/* wheels */

const wheelMaterial =

  new THREE.MeshStandardMaterial({

    color: 0x101010,

    roughness: .95

  });

const wheelGeometry =

  new THREE.CylinderGeometry(

    .34,

    .34,

    .24,

    16

  );

function createWheel(

  x,

  z

) {

  const wheel =

    new THREE.Mesh(

      wheelGeometry,

      wheelMaterial

    );

  wheel.rotation.z =

    Math.PI / 2;

  wheel.position.set(

    x,

    .39,

    z

  );

  wheel.castShadow = true;

  car.add(wheel);

}

createWheel(-.94, 1.5);

createWheel(.94, 1.5);

createWheel(-.94, -1.5);

createWheel(.94, -1.5);

/* lights */

function createLight(

  x,

  z,

  color

) {

  const light =

    new THREE.Mesh(

      new THREE.BoxGeometry(

        .35,

        .17,

        .06

      ),

      new THREE.MeshStandardMaterial({

        color,

        emissive: color,

        emissiveIntensity: 1.2

      })

    );

  light.position.set(

    x,

    .72,

    z

  );

  car.add(light);

}

createLight(-.55, -2.38, 0xffffdd);

createLight(.55, -2.38, 0xffffdd);

createLight(-.55, 2.38, 0xaa1010);

createLight(.55, 2.38, 0xaa1010);

/* initial location */

car.position.set(

  0,

  .02,

  0

);

/* =====================================================

   GAME STATE

   ===================================================== */

let mode = "car";

let speed = 0;

let steering = 0;

const MAX_FORWARD_SPEED = 28;

const MAX_REVERSE_SPEED = -10;

const ACCELERATION = 11;

const REVERSE_ACCELERATION = 8;

const BRAKE_FORCE = 22;

const ROLLING_DRAG = 2.6;

const controls = {

  gas: false,

  brake: false,

  reverse: false,

  left: false,

  right: false,

  run: false

};

/* walking */

let joystickX = 0;

let joystickY = 0;

/* =====================================================

   TOUCH BUTTON HANDLING

   ===================================================== */

function holdButton(

  button,

  key

) {

  const down = e => {

    e.preventDefault();

    controls[key] = true;

    button.classList.add(

      "active"

    );

  };

  const up = e => {

    e.preventDefault();

    controls[key] = false;

    button.classList.remove(

      "active"

    );

  };

  button.addEventListener(

    "pointerdown",

    down

  );

  button.addEventListener(

    "pointerup",

    up

  );

  button.addEventListener(

    "pointercancel",

    up

  );

  button.addEventListener(

    "pointerleave",

    up

  );

}

holdButton(

  gasBtn,

  "gas"

);

holdButton(

  brakeBtn,

  "brake"

);

holdButton(

  reverseBtn,

  "reverse"

);

holdButton(

  leftBtn,

  "left"

);

holdButton(

  rightBtn,

  "right"

);

holdButton(

  runBtn,

  "run"

);

/* =====================================================

   KEYBOARD SUPPORT

   ===================================================== */

window.addEventListener(

  "keydown",

  e => {

    if (

      e.key === "w" ||

      e.key === "ArrowUp"

    )

      controls.gas = true;

    if (

      e.key === "s" ||

      e.key === "ArrowDown"

    )

      controls.brake = true;

    if (

      e.key === "a" ||

      e.key === "ArrowLeft"

    )

      controls.left = true;

    if (

      e.key === "d" ||

      e.key === "ArrowRight"

    )

      controls.right = true;

    if (e.key === "Shift")

      controls.run = true;

    if (

      e.key.toLowerCase() === "e"

    )

      toggleVehicle();

  }

);

window.addEventListener(

  "keyup",

  e => {

    if (

      e.key === "w" ||

      e.key === "ArrowUp"

    )

      controls.gas = false;

    if (

      e.key === "s" ||

      e.key === "ArrowDown"

    )

      controls.brake = false;

    if (

      e.key === "a" ||

      e.key === "ArrowLeft"

    )

      controls.left = false;

    if (

      e.key === "d" ||

      e.key === "ArrowRight"

    )

      controls.right = false;

    if (e.key === "Shift")

      controls.run = false;

  }

);

/* =====================================================

   ENTER / EXIT VEHICLE

   ===================================================== */

enterExitBtn.addEventListener(

  "click",

  toggleVehicle

);

function toggleVehicle() {

  if (mode === "car") {

    exitVehicle();

  } else {

    enterVehicle();

  }

}

function exitVehicle() {

  /*

   Don't jump out at high speed.

  */

  if (

    Math.abs(speed) > 2.2

  ) {

    showMessage(

      "Slow down before exiting"

    );

    return;

  }

  speed = 0;

  mode = "walk";

  player.visible = true;

  /*

   Spawn at driver's side:

   roughly 1.25 meters from car center.

  */

  const side =

    new THREE.Vector3(

      -1.35,

      0,

      .25

    );

  side.applyQuaternion(

    car.quaternion

  );

  player.position.copy(

    car.position

  );

  player.position.add(

    side

  );

  player.position.y =

    0;

  player.rotation.y =

    car.rotation.y;

  updateModeUI();

}

function enterVehicle() {

  const distance =

    player.position.distanceTo(

      car.position

    );

  if (distance > 3.2) {

    showMessage(

      "Move closer to the car"

    );

    return;

  }

  mode = "car";

  player.visible = false;

  joystickX = 0;

  joystickY = 0;

  resetJoystick();

  updateModeUI();

}

function updateModeUI() {

  const driving =

    mode === "car";

  modeLabel.textContent =

    driving

      ? "DRIVING"

      : "ON FOOT";

  enterExitBtn.textContent =

    driving

      ? "EXIT"

      : "ENTER";

  steeringArea.style.display =

    driving

      ? "flex"

      : "none";

  pedals.style.display =

    driving

      ? "grid"

      : "none";

  joystickArea.style.display =

    driving

      ? "none"

      : "block";

  runBtn.style.display =

    driving

      ? "none"

      : "block";

  speedLabel.style.display =

    driving

      ? "block"

      : "none";

}

/* =====================================================

   JOYSTICK

   ===================================================== */

const joystickBase =

  document.getElementById(

    "joystickBase"

  );

const joystickKnob =

  document.getElementById(

    "joystickKnob"

  );

let joystickPointer =

  null;

joystickArea.addEventListener(

  "pointerdown",

  e => {

    joystickPointer =

      e.pointerId;

    joystickArea.setPointerCapture(

      e.pointerId

    );

    updateJoystick(e);

  }

);

joystickArea.addEventListener(

  "pointermove",

  e => {

    if (

      e.pointerId !==

      joystickPointer

    )

      return;

    updateJoystick(e);

  }

);

joystickArea.addEventListener(

  "pointerup",

  releaseJoystick

);

joystickArea.addEventListener(

  "pointercancel",

  releaseJoystick

);

function updateJoystick(e) {

  const rect =

    joystickBase.getBoundingClientRect();

  const centerX =

    rect.left +

    rect.width / 2;

  const centerY =

    rect.top +

    rect.height / 2;

  let dx =

    e.clientX - centerX;

  let dy =

    e.clientY - centerY;

  const radius =

    rect.width * .35;

  const distance =

    Math.sqrt(

      dx * dx +

      dy * dy

    );

  if (distance > radius) {

    dx =

      dx /

      distance *

      radius;

    dy =

      dy /

      distance *

      radius;

  }

  joystickX =

    dx / radius;

  joystickY =

    dy / radius;

  joystickKnob.style.transform =

    `translate(${dx}px, ${dy}px)`;

}

function releaseJoystick(e) {

  joystickPointer = null;

  joystickX = 0;

  joystickY = 0;

  resetJoystick();

}

function resetJoystick() {

  joystickKnob.style.transform =

    "translate(0px, 0px)";

}

/* =====================================================

   CAR PHYSICS

   ===================================================== */

function updateCar(dt) {

  /* acceleration */

  if (controls.gas) {

    speed +=

      ACCELERATION * dt;

  }

  if (controls.reverse) {

    speed -=

      REVERSE_ACCELERATION * dt;

  }

  /* braking */

  if (controls.brake) {

    if (speed > 0) {

      speed -=

        BRAKE_FORCE * dt;

      speed =

        Math.max(

          speed,

          0

        );

    } else if (speed < 0) {

      speed +=

        BRAKE_FORCE * dt;

      speed =

        Math.min(

          speed,

          0

        );

    }

  }

  /* rolling resistance */

  if (

    !controls.gas &&

    !controls.reverse &&

    !controls.brake

  ) {

    if (speed > 0) {

      speed =

        Math.max(

          0,

          speed -

          ROLLING_DRAG * dt

        );

    } else if (speed < 0) {

      speed =

        Math.min(

          0,

          speed +

          ROLLING_DRAG * dt

        );

    }

  }

  speed =

    THREE.MathUtils.clamp(

      speed,

      MAX_REVERSE_SPEED,

      MAX_FORWARD_SPEED

    );

  /* steering input */

  let steerTarget = 0;

  if (controls.left)

    steerTarget = 1;

  if (controls.right)

    steerTarget = -1;

  steering =

    THREE.MathUtils.lerp(

      steering,

      steerTarget,

      Math.min(

        1,

        8 * dt

      )

    );

  const speedFactor =

    THREE.MathUtils.clamp(

      Math.abs(speed) / 7,

      0,

      1

    );

  /*

   Slower turning at high speed.

  */

  const steeringStrength =

    THREE.MathUtils.lerp(

      1.65,

      .65,

      Math.min(

        Math.abs(speed) /

        MAX_FORWARD_SPEED,

        1

      )

    );

  if (

    Math.abs(speed) > .12

  ) {

    const reverseDirection =

      speed >= 0

        ? 1

        : -1;

    car.rotation.y +=

      steering *

      steeringStrength *

      speedFactor *

      reverseDirection *

      dt;

  }

  const forward =

    new THREE.Vector3(

      0,

      0,

      -1

    );

  forward.applyQuaternion(

    car.quaternion

  );

  car.position.addScaledVector(

    forward,

    speed * dt

  );

  car.position.y =

    .02;

  const mph =

    Math.abs(speed) *

    2.23694;

  speedLabel.textContent =

    `${Math.round(mph)} MPH`;

}

/* =====================================================

   WALKING

   ===================================================== */

let walkTime = 0;

function updatePlayer(dt) {

  const magnitude =

    Math.min(

      1,

      Math.sqrt(

        joystickX * joystickX +

        joystickY * joystickY

      )

    );

  if (magnitude < .08)

    return;

  const run =

    controls.run;

  const walkSpeed =

    run

      ? 5.4

      : 2.8;

  /*

   Movement relative to camera direction.

  */

  const cameraForward =

    new THREE.Vector3();

  camera.getWorldDirection(

    cameraForward

  );

  cameraForward.y = 0;

  cameraForward.normalize();

  const cameraRight =

    new THREE.Vector3(

      cameraForward.z,

      0,

      -cameraForward.x

    );

  const direction =

    new THREE.Vector3();

  direction.addScaledVector(

    cameraForward,

    -joystickY

  );

  direction.addScaledVector(

    cameraRight,

    joystickX

  );

  direction.normalize();

  player.position.addScaledVector(

    direction,

    walkSpeed *

    magnitude *

    dt

  );

  const targetAngle =

    Math.atan2(

      direction.x,

      direction.z

    );

  player.rotation.y =

    lerpAngle(

      player.rotation.y,

      targetAngle,

      Math.min(

        1,

        10 * dt

      )

    );

  /* basic walking animation */

  walkTime +=

    dt *

    (run ? 11 : 7);

  const swing =

    Math.sin(

      walkTime

    ) * .6;

  leftLeg.rotation.x =

    swing;

  rightLeg.rotation.x =

    -swing;

  leftArm.rotation.x =

    -swing * .7;

  rightArm.rotation.x =

    swing * .7;

}

function lerpAngle(

  a,

  b,

  t

) {

  let difference =

    b - a;

  while (

    difference > Math.PI

  )

    difference -=

      Math.PI * 2;

  while (

    difference < -Math.PI

  )

    difference +=

      Math.PI * 2;

  return (

    a +

    difference * t

  );

}

/* =====================================================

   CAMERA

   ===================================================== */

const desiredCamera =

  new THREE.Vector3();

const lookTarget =

  new THREE.Vector3();

function updateCamera(dt) {

  if (mode === "car") {

    const behind =

      new THREE.Vector3(

        0,

        3.2,

        7.2

      );

    behind.applyQuaternion(

      car.quaternion

    );

    desiredCamera.copy(

      car.position

    );

    desiredCamera.add(

      behind

    );

    camera.position.lerp(

      desiredCamera,

      1 -

      Math.pow(

        .002,

        dt

      )

    );

    lookTarget.copy(

      car.position

    );

    lookTarget.y +=

      1.05;

    const forward =

      new THREE.Vector3(

        0,

        0,

        -1

      );

    forward.applyQuaternion(

      car.quaternion

    );

    lookTarget.addScaledVector(

      forward,

      4

    );

    camera.lookAt(

      lookTarget

    );

  } else {

    const behind =

      new THREE.Vector3(

        0,

        2.6,

        4.7

      );

    behind.applyAxisAngle(

      new THREE.Vector3(

        0,

        1,

        0

      ),

      player.rotation.y

    );

    desiredCamera.copy(

      player.position

    );

    desiredCamera.add(

      behind

    );

    camera.position.lerp(

      desiredCamera,

      1 -

      Math.pow(

        .004,

        dt

      )

    );

    lookTarget.copy(

      player.position

    );

    lookTarget.y =

      1.35;

    camera.lookAt(

      lookTarget

    );

  }

}

/* =====================================================

   UI MESSAGE

   ===================================================== */

let messageTimer = null;

function showMessage(text) {

  message.textContent =

    text;

  message.style.opacity =

    1;

  clearTimeout(

    messageTimer

  );

  messageTimer =

    setTimeout(

      () => {

        message.style.opacity =

          0;

      },

      1700

    );

}

/* =====================================================

   DECORATIONS

   ===================================================== */

function createTrees() {

  for (

    let i = 0;

    i < 110;

    i++

  ) {

    const x =

      THREE.MathUtils.randFloat(

        -700,

        700

      );

    const z =

      THREE.MathUtils.randFloat(

        -700,

        700

      );

    const tree =

      new THREE.Group();

    const trunk =

      new THREE.Mesh(

        new THREE.CylinderGeometry(

          .12,

          .18,

          2.2,

          7

        ),

        new THREE.MeshStandardMaterial({

          color: 0x60452c

        })

      );

    trunk.position.y =

      1.1;

    const crown =

      new THREE.Mesh(

        new THREE.SphereGeometry(

          THREE.MathUtils.randFloat(

            1.1,

            1.8

          ),

          8,

          6

        ),

        new THREE.MeshStandardMaterial({

          color: 0x356434

        })

      );

    crown.position.y =

      3.2;

    tree.add(

      trunk,

      crown

    );

    tree.position.set(

      x,

      0,

      z

    );

    detailGroup.add(

      tree

    );

  }

}

/* =====================================================

   GAME LOOP

   ===================================================== */

const clock =

  new THREE.Clock();

function animate() {

  requestAnimationFrame(

    animate

  );

  const dt =

    Math.min(

      clock.getDelta(),

      .04

    );

  if (mode === "car") {

    updateCar(dt);

  } else {

    updatePlayer(dt);

  }

  updateCamera(dt);

  renderer.render(

    scene,

    camera

  );

}

/* =====================================================

   RESIZE

   ===================================================== */

window.addEventListener(

  "resize",

  () => {

    camera.aspect =

      window.innerWidth /

      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(

      window.innerWidth,

      window.innerHeight

    );

  }

);

/* =====================================================

   START

   ===================================================== */

async function startGame() {

  updateModeUI();

  createTrees();

  camera.position.set(

    0,

    4,

    8

  );

  await loadUticaMap();

  setTimeout(

    () => {

      loading.style.display =

        "none";

    },

    700

  );

  animate();

}

startGame();
