import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

/* ======================================================
   ELEMENTS
====================================================== */

const loading =
document.getElementById("loading");

const loadingText =
document.getElementById("loadingText");

const canvas =
document.getElementById("game");

const speedText =
document.getElementById("speed");

const missionText =
document.getElementById("mission");

const streetText =
document.getElementById("street");

const enterBtn =
document.getElementById("enterBtn");

const gasBtn =
document.getElementById("gasBtn");

const reverseBtn =
document.getElementById("reverseBtn");

const runBtn =
document.getElementById("runBtn");

const joystick =
document.getElementById("joystick");

const stick =
document.getElementById("stick");

/* ======================================================
   RENDERER
====================================================== */

loadingText.textContent =
"Starting 3D engine...";

const renderer =
new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.setPixelRatio(
  Math.min(
    window.devicePixelRatio,
    1.5
  )
);

renderer.shadowMap.enabled =
true;

renderer.outputColorSpace =
THREE.SRGBColorSpace;

/* ======================================================
   SCENE
====================================================== */

const scene =
new THREE.Scene();

scene.background =
new THREE.Color(
  0x79afe0
);

scene.fog =
new THREE.Fog(
  0x79afe0,
  150,
  700
);

/* ======================================================
   CAMERA
====================================================== */

const camera =
new THREE.PerspectiveCamera(
  65,
  window.innerWidth /
  window.innerHeight,
  0.1,
  1500
);

camera.position.set(
  0,
  5,
  10
);

/* ======================================================
   LIGHTS
====================================================== */

scene.add(
  new THREE.HemisphereLight(
    0xddeeff,
    0x445544,
    2.4
  )
);

const sun =
new THREE.DirectionalLight(
  0xffffff,
  2.5
);

sun.position.set(
  100,
  180,
  80
);

sun.castShadow =
true;

scene.add(
  sun
);

/* ======================================================
   GROUND
====================================================== */

loadingText.textContent =
"Building Utica...";

const grassMaterial =
new THREE.MeshStandardMaterial({
  color: 0x547c48
});

const ground =
new THREE.Mesh(
  new THREE.PlaneGeometry(
    1200,
    1200
  ),
  grassMaterial
);

ground.rotation.x =
-Math.PI / 2;

ground.receiveShadow =
true;

scene.add(
  ground
);

/* ======================================================
   ROAD SYSTEM
====================================================== */

const roads =
new THREE.Group();

scene.add(
  roads
);

const roadMaterial =
new THREE.MeshStandardMaterial({
  color: 0x292b2e,
  roughness: 1
});

const sidewalkMaterial =
new THREE.MeshStandardMaterial({
  color: 0xa7a7a2
});

const yellowMaterial =
new THREE.MeshStandardMaterial({
  color: 0xe3c434
});

const ROAD_GAP = 92;

const roadNamesX = [
  "WHITESBORO STREET",
  "COURT STREET",
  "COLUMBIA STREET",
  "LAFAYETTE STREET",
  "ORISKANY STREET",
  "BROAD STREET",
  "BLEECKER STREET",
  "ALBANY STREET",
  "RUTGER STREET"
];

const roadNamesZ = [
  "STATE STREET",
  "CORNELIA STREET",
  "GENESEE STREET",
  "ONEIDA STREET",
  "MOHAWK STREET",
  "KOSSUTH AVENUE",
  "PARK AVENUE",
  "SUNSET AVENUE",
  "SOUTH STREET"
];

function createRoad(
  x,
  z,
  width,
  depth
) {

  const road =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      width,
      0.08,
      depth
    ),
    roadMaterial
  );

  road.position.set(
    x,
    0.05,
    z
  );

  road.receiveShadow =
  true;

  roads.add(
    road
  );
}

function roadLine(
  x,
  z,
  width,
  depth
) {

  const line =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      width,
      0.02,
      depth
    ),
    yellowMaterial
  );

  line.position.set(
    x,
    0.11,
    z
  );

  roads.add(
    line
  );
}

for (
  let i = -4;
  i <= 4;
  i++
) {

  const position =
  i * ROAD_GAP;

  createRoad(
    position,
    0,
    18,
    850
  );

  roadLine(
    position,
    0,
    0.35,
    850
  );

  createRoad(
    0,
    position,
    850,
    18
  );

  roadLine(
    0,
    position,
    850,
    0.35
  );
}

/* ======================================================
   BUILDINGS
====================================================== */

loadingText.textContent =
"Creating buildings...";

const buildingGroup =
new THREE.Group();

scene.add(
  buildingGroup
);

const buildingColors = [
  0xa88e78,
  0x8d8179,
  0xb2a490,
  0x8b735f,
  0x70767b,
  0xb69c83,
  0x9c8d80
];

function building(
  x,
  z,
  w,
  d,
  h
) {

  const material =
  new THREE.MeshStandardMaterial({
    color:
      buildingColors[
        Math.floor(
          Math.random() *
          buildingColors.length
        )
      ],
    roughness: 0.85
  });

  const mesh =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      w,
      h,
      d
    ),
    material
  );

  mesh.position.set(
    x,
    h / 2,
    z
  );

  mesh.castShadow =
  true;

  mesh.receiveShadow =
  true;

  buildingGroup.add(
    mesh
  );

  addWindows(
    mesh,
    w,
    d,
    h
  );
}

function addWindows(
  parent,
  w,
  d,
  h
) {

  const windowMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x223744,
    emissive: 0x07131a
  });

  const floors =
  Math.floor(
    h / 4
  );

  for (
    let floor = 1;
    floor < floors;
    floor++
  ) {

    const count =
    Math.max(
      2,
      Math.floor(
        w / 6
      )
    );

    for (
      let i = 0;
      i < count;
      i++
    ) {

      const windowMesh =
      new THREE.Mesh(
        new THREE.PlaneGeometry(
          2,
          1.5
        ),
        windowMaterial
      );

      const px =
      -w / 2 +
      3 +
      i *
      (
        (w - 6) /
        Math.max(
          count - 1,
          1
        )
      );

      windowMesh.position.set(
        px,
        -h / 2 +
        3.3 +
        floor * 3.6,
        d / 2 +
        0.01
      );

      parent.add(
        windowMesh
      );
    }
  }
}

for (
  let x = -4;
  x < 4;
  x++
) {

  for (
    let z = -4;
    z < 4;
    z++
  ) {

    const centerX =
    x * ROAD_GAP +
    ROAD_GAP / 2;

    const centerZ =
    z * ROAD_GAP +
    ROAD_GAP / 2;

    const sidewalk =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        70,
        0.2,
        70
      ),
      sidewalkMaterial
    );

    sidewalk.position.set(
      centerX,
      0.1,
      centerZ
    );

    sidewalk.receiveShadow =
    true;

    buildingGroup.add(
      sidewalk
    );

    const positions = [
      [-18,-18],
      [18,-18],
      [-18,18],
      [18,18]
    ];

    for (
      const pos of positions
    ) {

      const distance =
      Math.hypot(
        centerX,
        centerZ
      );

      let height =
      10 +
      Math.random() *
      18;

      if (
        distance < 160
      ) {

        height +=
        Math.random() *
        35;
      }

      building(
        centerX + pos[0],
        centerZ + pos[1],
        27,
        27,
        height
      );
    }
  }
}

/* ======================================================
   PLAYER
====================================================== */

loadingText.textContent =
"Creating player...";

const player =
new THREE.Group();

scene.add(
  player
);

const skin =
new THREE.MeshStandardMaterial({
  color: 0xb87b5a
});

const shirt =
new THREE.MeshStandardMaterial({
  color: 0x16181d
});

const pants =
new THREE.MeshStandardMaterial({
  color: 0x20324c
});

const torso =
new THREE.Mesh(
  new THREE.BoxGeometry(
    0.65,
    0.9,
    0.38
  ),
  shirt
);

torso.position.y =
1.35;

player.add(
  torso
);

const head =
new THREE.Mesh(
  new THREE.SphereGeometry(
    0.27,
    16,
    12
  ),
  skin
);

head.position.y =
2.05;

player.add(
  head
);

function leg(x) {

  const legMesh =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      0.24,
      0.85,
      0.28
    ),
    pants
  );

  legMesh.position.set(
    x,
    0.55,
    0
  );

  player.add(
    legMesh
  );
}

leg(-0.18);
leg(0.18);

function arm(x) {

  const armMesh =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      0.18,
      0.78,
      0.2
    ),
    skin
  );

  armMesh.position.set(
    x,
    1.35,
    0
  );

  player.add(
    armMesh
  );
}

arm(-0.43);
arm(0.43);

player.position.set(
  -7,
  0,
  12
);

/* ======================================================
   M4 STYLE CAR
====================================================== */

loadingText.textContent =
"Creating M4...";

const car =
new THREE.Group();

scene.add(
  car
);

const carPaint =
new THREE.MeshStandardMaterial({
  color: 0x202831,
  metalness: 0.65,
  roughness: 0.23
});

const glass =
new THREE.MeshStandardMaterial({
  color: 0x152530,
  metalness: 0.2,
  roughness: 0.12
});

const carBody =
new THREE.Mesh(
  new THREE.BoxGeometry(
    2.0,
    0.62,
    4.7
  ),
  carPaint
);

carBody.position.y =
0.75;

carBody.castShadow =
true;

car.add(
  carBody
);

const hood =
new THREE.Mesh(
  new THREE.BoxGeometry(
    1.9,
    0.32,
    1.4
  ),
  carPaint
);

hood.position.set(
  0,
  1.05,
  -1.48
);

car.add(
  hood
);

const roof =
new THREE.Mesh(
  new THREE.BoxGeometry(
    1.58,
    0.68,
    1.95
  ),
  glass
);

roof.position.set(
  0,
  1.35,
  0.12
);

car.add(
  roof
);

const tireMaterial =
new THREE.MeshStandardMaterial({
  color: 0x080808
});

const rimMaterial =
new THREE.MeshStandardMaterial({
  color: 0xb5b5b5,
  metalness: 0.8
});

const wheels = [];

function wheel(
  x,
  z
) {

  const wheelGroup =
  new THREE.Group();

  const tire =
  new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.43,
      0.43,
      0.28,
      18
    ),
    tireMaterial
  );

  tire.rotation.z =
  Math.PI / 2;

  const rim =
  new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.22,
      0.22,
      0.3,
      12
    ),
    rimMaterial
  );

  rim.rotation.z =
  Math.PI / 2;

  wheelGroup.add(
    tire,
    rim
  );

  wheelGroup.position.set(
    x,
    0.62,
    z
  );

  wheels.push(
    wheelGroup
  );

  car.add(
    wheelGroup
  );
}

wheel(-1.02,-1.48);
wheel(1.02,-1.48);
wheel(-1.02,1.48);
wheel(1.02,1.48);

car.position.set(
  5,
  0,
  -18
);

/* ======================================================
   INPUT
====================================================== */

let joyX = 0;
let joyY = 0;

let gas = false;
let reverse = false;
let running = false;

let driving = false;

let joystickId = null;

function resetStick() {

  joyX = 0;
  joyY = 0;

  stick.style.transform =
  "translate(-50%, -50%)";
}

function moveStick(e) {

  const rect =
  joystick.getBoundingClientRect();

  const cx =
  rect.left +
  rect.width / 2;

  const cy =
  rect.top +
  rect.height / 2;

  let x =
  e.clientX - cx;

  let y =
  e.clientY - cy;

  const max =
  rect.width * 0.32;

  const distance =
  Math.hypot(x,y);

  if (
    distance > max
  ) {

    x =
    x / distance * max;

    y =
    y / distance * max;
  }

  joyX =
  x / max;

  joyY =
  y / max;

  stick.style.transform =
  `translate(
    calc(-50% + ${x}px),
    calc(-50% + ${y}px)
  )`;
}

joystick.addEventListener(
  "pointerdown",
  e => {

    joystickId =
    e.pointerId;

    joystick.setPointerCapture(
      e.pointerId
    );

    moveStick(e);
  }
);

joystick.addEventListener(
  "pointermove",
  e => {

    if (
      e.pointerId ===
      joystickId
    ) {

      moveStick(e);
    }
  }
);

joystick.addEventListener(
  "pointerup",
  () => {

    joystickId = null;

    resetStick();
  }
);

joystick.addEventListener(
  "pointercancel",
  () => {

    joystickId = null;

    resetStick();
  }
);

function hold(
  element,
  start,
  end
) {

  element.addEventListener(
    "pointerdown",
    e => {

      e.preventDefault();

      start();
    }
  );

  element.addEventListener(
    "pointerup",
    e => {

      e.preventDefault();

      end();
    }
  );

  element.addEventListener(
    "pointercancel",
    end
  );
}

hold(
  gasBtn,
  () => gas = true,
  () => gas = false
);

hold(
  reverseBtn,
  () => reverse = true,
  () => reverse = false
);

hold(
  runBtn,
  () => running = true,
  () => running = false
);

/* ======================================================
   ENTER EXIT
====================================================== */

enterBtn.addEventListener(
  "click",
  () => {

    if (!driving) {

      const distance =
      player.position.distanceTo(
        car.position
      );

      if (distance > 5) {

        missionText.textContent =
        "Move closer to your M4";

        return;
      }

      driving = true;

      player.visible =
      false;

      enterBtn.textContent =
      "🚶 EXIT";

      missionText.textContent =
      "Drive through Utica";

    } else {

      driving = false;

      player.visible =
      true;

      player.position.set(
        car.position.x + 2,
        0,
        car.position.z
      );

      carSpeed = 0;

      enterBtn.textContent =
      "🚘 ENTER";

      missionText.textContent =
      "Explore Utica";
    }
  }
);

/* ======================================================
   MOVEMENT
====================================================== */

let carSpeed = 0;
let carSteer = 0;

function updateWalking(dt) {

  const magnitude =
  Math.hypot(
    joyX,
    joyY
  );

  if (
    magnitude > 0.08
  ) {

    const angle =
    Math.atan2(
      joyX,
      joyY
    );

    player.rotation.y =
    angle;

    const speed =
    running ?
    7 :
    4;

    player.position.x +=
    Math.sin(angle) *
    speed *
    dt;

    player.position.z +=
    Math.cos(angle) *
    speed *
    dt;
  }

  const offset =
  new THREE.Vector3(
    0,
    3.5,
    7
  );

  offset.applyAxisAngle(
    new THREE.Vector3(
      0,
      1,
      0
    ),
    player.rotation.y
  );

  const cameraPosition =
  player.position
  .clone()
  .add(offset);

  camera.position.lerp(
    cameraPosition,
    0.12
  );

  camera.lookAt(
    player.position.x,
    1.3,
    player.position.z
  );

  speedText.textContent =
  "0";
}

function updateCar(dt) {

  if (gas) {

    carSpeed +=
    18 * dt;

  } else if (reverse) {

    carSpeed -=
    16 * dt;

  } else {

    carSpeed *=
    0.975;
  }

  carSpeed =
  THREE.MathUtils.clamp(
    carSpeed,
    -11,
    32
  );

  carSteer =
  THREE.MathUtils.lerp(
    carSteer,
    joyX,
    0.15
  );

  if (
    Math.abs(carSpeed) >
    0.15
  ) {

    car.rotation.y -=
    carSteer *
    1.5 *
    dt *
    Math.sign(carSpeed);
  }

  car.position.x +=
  Math.sin(
    car.rotation.y
  ) *
  carSpeed *
  dt;

  car.position.z +=
  Math.cos(
    car.rotation.y
  ) *
  carSpeed *
  dt;

  player.position.copy(
    car.position
  );

  const offset =
  new THREE.Vector3(
    0,
    4,
    9
  );

  offset.applyAxisAngle(
    new THREE.Vector3(
      0,
      1,
      0
    ),
    car.rotation.y
  );

  camera.position.lerp(
    car.position
    .clone()
    .add(offset),
    0.1
  );

  camera.lookAt(
    car.position.x,
    1,
    car.position.z
  );

  speedText.textContent =
  Math.round(
    Math.abs(carSpeed) *
    2.237
  );
}

/* ======================================================
   STREET NAME
====================================================== */

function updateStreet() {

  const object =
  driving ?
  car :
  player;

  const roadX =
  Math.round(
    object.position.x /
    ROAD_GAP
  );

  const roadZ =
  Math.round(
    object.position.z /
    ROAD_GAP
  );

  const dx =
  Math.abs(
    object.position.x -
    roadX *
    ROAD_GAP
  );

  const dz =
  Math.abs(
    object.position.z -
    roadZ *
    ROAD_GAP
  );

  if (dx < dz) {

    const index =
    THREE.MathUtils.clamp(
      roadX + 4,
      0,
      roadNamesX.length - 1
    );

    streetText.textContent =
    roadNamesX[index];

  } else {

    const index =
    THREE.MathUtils.clamp(
      roadZ + 4,
      0,
      roadNamesZ.length - 1
    );

    streetText.textContent =
    roadNamesZ[index];
  }
}

/* ======================================================
   RESIZE
====================================================== */

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

/* ======================================================
   FINISH LOADING
====================================================== */

camera.position.set(
  0,
  4,
  8
);

camera.lookAt(
  player.position
);

loadingText.textContent =
"Utica ready";

setTimeout(
  () => {

    loading.style.display =
    "none";

  },
  500
);

/* ======================================================
   GAME LOOP
====================================================== */

const clock =
new THREE.Clock();

function animate() {

  requestAnimationFrame(
    animate
  );

  const dt =
  Math.min(
    clock.getDelta(),
    0.04
  );

  if (driving) {

    updateCar(dt);

  } else {

    updateWalking(dt);
  }

  updateStreet();

  renderer.render(
    scene,
    camera
  );
}

animate();
