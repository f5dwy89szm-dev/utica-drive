"use strict";

// ============================================================
// UTICA DRIVE
// Fresh standalone Three.js build
// ============================================================

if (typeof THREE === "undefined") {
  alert("Three.js did not load. Check your internet connection.");
  throw new Error("Three.js missing");
}

// ============================================================
// BASIC THREE SETUP
// ============================================================

const container = document.getElementById("game");

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87b8e6);

scene.fog = new THREE.Fog(0x9fc3df, 180, 650);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1500
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio || 1, 2)
);

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;

renderer.outputEncoding =
  THREE.sRGBEncoding;

container.appendChild(renderer.domElement);

// ============================================================
// LIGHTING
// ============================================================

const hemisphere = new THREE.HemisphereLight(
  0xcce9ff,
  0x586348,
  1.2
);

scene.add(hemisphere);

const sun = new THREE.DirectionalLight(
  0xfff3d6,
  1.25
);

sun.position.set(
  -100,
  180,
  80
);

sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

sun.shadow.camera.left = -220;
sun.shadow.camera.right = 220;
sun.shadow.camera.top = 220;
sun.shadow.camera.bottom = -220;

scene.add(sun);

// ============================================================
// HELPERS
// ============================================================

function material(color, roughness = 0.8) {

  return new THREE.MeshStandardMaterial({
    color: color,
    roughness: roughness,
    metalness: 0.05
  });

}

function box(
  width,
  height,
  depth,
  color
) {

  const geometry =
    new THREE.BoxGeometry(
      width,
      height,
      depth
    );

  const mesh =
    new THREE.Mesh(
      geometry,
      material(color)
    );

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

// ============================================================
// WORLD
// ============================================================

const world = new THREE.Group();

scene.add(world);

// Ground

const ground =
  new THREE.Mesh(
    new THREE.PlaneGeometry(
      1200,
      1200
    ),
    material(0x52733e)
  );

ground.rotation.x =
  -Math.PI / 2;

ground.receiveShadow = true;

world.add(ground);

// ============================================================
// ROADS
// ============================================================

function makeRoad(
  x,
  z,
  width,
  length,
  rotation = 0
) {

  const road =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        width,
        length
      ),
      material(0x303236)
    );

  road.rotation.x =
    -Math.PI / 2;

  road.rotation.z =
    rotation;

  road.position.set(
    x,
    0.025,
    z
  );

  road.receiveShadow = true;

  world.add(road);

  return road;
}

function makeRoadLine(
  x,
  z,
  width,
  length,
  rotation = 0
) {

  const line =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        width,
        length
      ),
      new THREE.MeshBasicMaterial({
        color: 0xf0d348
      })
    );

  line.rotation.x =
    -Math.PI / 2;

  line.rotation.z =
    rotation;

  line.position.set(
    x,
    0.04,
    z
  );

  world.add(line);
}

// Main north/south road

makeRoad(
  0,
  0,
  22,
  1000
);

// Center marking

for (
  let z = -490;
  z <= 490;
  z += 18
) {

  makeRoadLine(
    0,
    z,
    0.35,
    8
  );

}

// Cross streets

const crossStreets = [
  -360,
  -270,
  -180,
  -90,
  0,
  90,
  180,
  270,
  360
];

crossStreets.forEach((z) => {

  makeRoad(
    0,
    z,
    18,
    900,
    Math.PI / 2
  );

});

// ============================================================
// SIDEWALKS
// ============================================================

function sidewalk(
  x,
  z,
  width,
  depth
) {

  const walk =
    box(
      width,
      0.18,
      depth,
      0xaaaaaa
    );

  walk.position.set(
    x,
    0.09,
    z
  );

  walk.receiveShadow = true;

  world.add(walk);
}

// Main road sidewalks

sidewalk(
  -14,
  0,
  5,
  1000
);

sidewalk(
  14,
  0,
  5,
  1000
);

// ============================================================
// BUILDINGS
// ============================================================

const buildingColors = [
  0xa94e3c,
  0xb6a88d,
  0x8d7560,
  0xc3b9a4,
  0x84766c,
  0x8f999e,
  0xb07851,
  0x786f65
];

function createBuilding(
  x,
  z,
  width,
  height,
  depth,
  color
) {

  const building =
    box(
      width,
      height,
      depth,
      color
    );

  building.position.set(
    x,
    height / 2,
    z
  );

  world.add(building);

  // roof
  const roof =
    box(
      width + 0.8,
      0.6,
      depth + 0.8,
      0x3f4142
    );

  roof.position.set(
    x,
    height + 0.3,
    z
  );

  world.add(roof);

  // door
  const door =
    box(
      2,
      3,
      0.18,
      0x3a2b22
    );

  door.position.set(
    x,
    1.5,
    z + depth / 2 + 0.1
  );

  world.add(door);

  // front windows
  const windowMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x93bad0,
      roughness: 0.25,
      metalness: 0.1
    });

  const floors =
    Math.max(
      1,
      Math.floor(height / 4)
    );

  for (
    let floor = 0;
    floor < floors;
    floor++
  ) {

    const y =
      2.5 + floor * 4;

    [-width * 0.23,
      width * 0.23]
      .forEach(offset => {

        const windowMesh =
          new THREE.Mesh(
            new THREE.BoxGeometry(
              1.8,
              1.6,
              0.12
            ),
            windowMaterial
          );

        windowMesh.position.set(
          x + offset,
          y,
          z + depth / 2 + 0.11
        );

        world.add(windowMesh);

      });

  }

}

// ============================================================
// UTICA-STYLE CITY BLOCKS
// ============================================================

function generateCity() {

  const blockZ =
    [
      -405,
      -315,
      -225,
      -135,
      -45,
      45,
      135,
      225,
      315,
      405
    ];

  const xPositions =
    [
      -180,
      -125,
      -70,
      -38,
      38,
      70,
      125,
      180
    ];

  blockZ.forEach((z, zi) => {

    xPositions.forEach((x, xi) => {

      // keep intersections clearer
      if (
        Math.abs(x) < 25
      ) {
        return;
      }

      const seed =
        Math.abs(
          Math.sin(
            x * 12.45 +
            z * 2.31
          )
        );

      const width =
        18 +
        seed * 20;

      const depth =
        20 +
        (
          Math.abs(
            Math.cos(
              x + z
            )
          )
        ) * 18;

      let height =
        8 +
        seed * 20;

      // slightly larger downtown
      if (
        Math.abs(z) < 170 &&
        Math.abs(x) < 130
      ) {

        height *= 1.65;

      }

      const color =
        buildingColors[
          (zi + xi) %
          buildingColors.length
        ];

      createBuilding(
        x,
        z,
        width,
        height,
        depth,
        color
      );

    });

  });

}

generateCity();

// ============================================================
// TREES
// ============================================================

function createTree(
  x,
  z
) {

  const trunk =
    box(
      0.7,
      3.5,
      0.7,
      0x654321
    );

  trunk.position.set(
    x,
    1.75,
    z
  );

  world.add(trunk);

  const leaves =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        2.7,
        10,
        8
      ),
      material(0x376b32)
    );

  leaves.position.set(
    x,
    5,
    z
  );

  leaves.castShadow = true;

  world.add(leaves);

}

for (
  let z = -450;
  z <= 450;
  z += 35
) {

  createTree(
    -19,
    z
  );

  createTree(
    19,
    z + 14
  );

}

// ============================================================
// PLAYER
// About 1.8 meters tall
// ============================================================

const player =
  new THREE.Group();

scene.add(player);

// legs

const leftLeg =
  box(
    0.28,
    0.8,
    0.35,
    0x222831
  );

leftLeg.position.set(
  -0.18,
  0.4,
  0
);

player.add(leftLeg);

const rightLeg =
  box(
    0.28,
    0.8,
    0.35,
    0x222831
  );

rightLeg.position.set(
  0.18,
  0.4,
  0
);

player.add(rightLeg);

// torso

const torso =
  box(
    0.85,
    0.85,
    0.42,
    0x284f8f
  );

torso.position.y =
  1.18;

player.add(torso);

// head

const head =
  new THREE.Mesh(
    new THREE.SphereGeometry(
      0.32,
      16,
      12
    ),
    material(0xc98f68)
  );

head.position.y =
  1.9;

head.castShadow = true;

player.add(head);

player.position.set(
  -6,
  0,
  14
);

// ============================================================
// CAR
// Realistic scale:
// ~4.7m long
// ~1.85m wide
// ~1.4m high
// ============================================================

const car =
  new THREE.Group();

scene.add(car);

// lower body

const carBody =
  box(
    1.85,
    0.58,
    4.7,
    0x2047a0
  );

carBody.position.y =
  0.68;

car.add(carBody);

// cabin

const cabin =
  box(
    1.65,
    0.65,
    2.25,
    0x18366f
  );

cabin.position.set(
  0,
  1.18,
  -0.15
);

car.add(cabin);

// windshield

const windshield =
  box(
    1.45,
    0.42,
    0.08,
    0x8fc7dc
  );

windshield.position.set(
  0,
  1.25,
  1.02
);

windshield.rotation.x =
  -0.2;

car.add(windshield);

// wheels

function wheel(
  x,
  z
) {

  const geometry =
    new THREE.CylinderGeometry(
      0.37,
      0.37,
      0.28,
      16
    );

  const mesh =
    new THREE.Mesh(
      geometry,
      material(0x151515)
    );

  mesh.rotation.z =
    Math.PI / 2;

  mesh.position.set(
    x,
    0.42,
    z
  );

  mesh.castShadow = true;

  car.add(mesh);

}

wheel(
  -0.95,
  1.45
);

wheel(
  0.95,
  1.45
);

wheel(
  -0.95,
  -1.45
);

wheel(
  0.95,
  -1.45
);

car.position.set(
  1.5,
  0,
  0
);

// ============================================================
// GAME STATE
// ============================================================

let driving = false;

let vehicleSpeed = 0;

let steerAmount = 0;

const maxForwardSpeed =
  0.45;

const maxReverseSpeed =
  -0.20;

const acceleration =
  0.007;

const braking =
  0.014;

const friction =
  0.0045;

const playerSpeed =
  0.10;

const keys = {};

const input = {

  forward: false,
  backward: false,
  left: false,
  right: false,

  gas: false,
  brake: false,
  reverse: false,

  steerLeft: false,
  steerRight: false

};

// ============================================================
// HUD
// ============================================================

const cityName =
  document.getElementById(
    "cityName"
  );

const modeText =
  document.getElementById(
    "modeText"
  );

const speedText =
  document.getElementById(
    "speedText"
  );

const message =
  document.getElementById(
    "message"
  );

const walkControls =
  document.getElementById(
    "walkControls"
  );

const driveControls =
  document.getElementById(
    "driveControls"
  );

const vehicleButton =
  document.getElementById(
    "vehicleButton"
  );

// ============================================================
// MOBILE BUTTON INPUT
// ============================================================

function holdButton(
  id,
  property
) {

  const element =
    document.getElementById(id);

  function start(event) {

    event.preventDefault();

    input[property] = true;

  }

  function stop(event) {

    if (event) {
      event.preventDefault();
    }

    input[property] = false;

  }

  element.addEventListener(
    "touchstart",
    start,
    {
      passive: false
    }
  );

  element.addEventListener(
    "touchend",
    stop,
    {
      passive: false
    }
  );

  element.addEventListener(
    "touchcancel",
    stop,
    {
      passive: false
    }
  );

  element.addEventListener(
    "mousedown",
    start
  );

  element.addEventListener(
    "mouseup",
    stop
  );

  element.addEventListener(
    "mouseleave",
    stop
  );

}

holdButton(
  "walkUp",
  "forward"
);

holdButton(
  "walkDown",
  "backward"
);

holdButton(
  "walkLeft",
  "left"
);

holdButton(
  "walkRight",
  "right"
);

holdButton(
  "gasButton",
  "gas"
);

holdButton(
  "brakeButton",
  "brake"
);

holdButton(
  "reverseButton",
  "reverse"
);

holdButton(
  "steerLeft",
  "steerLeft"
);

holdButton(
  "steerRight",
  "steerRight"
);

// ============================================================
// KEYBOARD
// ============================================================

window.addEventListener(
  "keydown",
  function(event) {

    keys[
      event.code
    ] = true;

    if (
      event.code === "KeyE"
    ) {

      toggleVehicle();

    }

  }
);

window.addEventListener(
  "keyup",
  function(event) {

    keys[
      event.code
    ] = false;

  }
);

// ============================================================
// ENTER / EXIT VEHICLE
// ============================================================

vehicleButton.addEventListener(
  "click",
  toggleVehicle
);

function distanceToCar() {

  const dx =
    player.position.x -
    car.position.x;

  const dz =
    player.position.z -
    car.position.z;

  return Math.sqrt(
    dx * dx +
    dz * dz
  );

}

function toggleVehicle() {

  if (!driving) {

    if (
      distanceToCar() >
      4
    ) {

      return;

    }

    driving = true;

    player.visible =
      false;

    walkControls.style.display =
      "none";

    driveControls.style.display =
      "block";

    vehicleButton.style.display =
      "block";

    vehicleButton.textContent =
      "EXIT CAR";

    modeText.textContent =
      "DRIVING";

    message.textContent =
      "";

  }

  else {

    driving = false;

    vehicleSpeed = 0;

    player.visible =
      true;

    const exitOffset =
      new THREE.Vector3(
        -2.2,
        0,
        0
      );

    exitOffset.applyAxisAngle(
      new THREE.Vector3(
        0,
        1,
        0
      ),
      car.rotation.y
    );

    player.position.copy(
      car.position
    );

    player.position.add(
      exitOffset
    );

    walkControls.style.display =
      "flex";

    driveControls.style.display =
      "none";

    vehicleButton.textContent =
      "ENTER CAR";

    modeText.textContent =
      "WALKING";

  }

}

// ============================================================
// WALKING
// ============================================================

function updateWalking() {

  let moveForward =
    input.forward ||
    keys["KeyW"] ||
    keys["ArrowUp"];

  let moveBack =
    input.backward ||
    keys["KeyS"] ||
    keys["ArrowDown"];

  let turnLeft =
    input.left ||
    keys["KeyA"] ||
    keys["ArrowLeft"];

  let turnRight =
    input.right ||
    keys["KeyD"] ||
    keys["ArrowRight"];

  if (turnLeft) {

    player.rotation.y +=
      0.045;

  }

  if (turnRight) {

    player.rotation.y -=
      0.045;

  }

  let movement = 0;

  if (moveForward) {

    movement =
      playerSpeed;

  }

  if (moveBack) {

    movement =
      -playerSpeed * 0.7;

  }

  if (
    movement !== 0
  ) {

    player.position.x +=
      Math.sin(
        player.rotation.y
      ) *
      movement;

    player.position.z +=
      Math.cos(
        player.rotation.y
      ) *
      movement;

  }

}

// ============================================================
// VEHICLE PHYSICS
// ============================================================

function updateCar() {

  const gas =
    input.gas ||
    keys["KeyW"] ||
    keys["ArrowUp"];

  const reverse =
    input.reverse ||
    keys["KeyS"] ||
    keys["ArrowDown"];

  const brake =
    input.brake ||
    keys["Space"];

  const left =
    input.steerLeft ||
    keys["KeyA"] ||
    keys["ArrowLeft"];

  const right =
    input.steerRight ||
    keys["KeyD"] ||
    keys["ArrowRight"];

  // acceleration

  if (gas) {

    vehicleSpeed +=
      acceleration;

  }

  if (reverse) {

    vehicleSpeed -=
      acceleration * 0.7;

  }

  // brake

  if (brake) {

    if (
      vehicleSpeed > 0
    ) {

      vehicleSpeed -=
        braking;

    }

    else if (
      vehicleSpeed < 0
    ) {

      vehicleSpeed +=
        braking;

    }

  }

  // natural friction

  if (
    !gas &&
    !reverse
  ) {

    if (
      vehicleSpeed > 0
    ) {

      vehicleSpeed -=
        friction;

      if (
        vehicleSpeed < 0
      ) {
        vehicleSpeed = 0;
      }

    }

    if (
      vehicleSpeed < 0
    ) {

      vehicleSpeed +=
        friction;

      if (
        vehicleSpeed > 0
      ) {
        vehicleSpeed = 0;
      }

    }

  }

  vehicleSpeed =
    THREE.MathUtils.clamp(
      vehicleSpeed,
      maxReverseSpeed,
      maxForwardSpeed
    );

  // progressive steering

  let targetSteer = 0;

  if (left) {
    targetSteer = 1;
  }

  if (right) {
    targetSteer = -1;
  }

  steerAmount +=
    (
      targetSteer -
      steerAmount
    ) *
    0.12;

  const speedPercent =
    Math.min(
      Math.abs(
        vehicleSpeed
      ) /
      maxForwardSpeed,
      1
    );

  if (
    Math.abs(
      vehicleSpeed
    ) >
    0.003
  ) {

    const steeringStrength =
      0.027 *
      (
        1 -
        speedPercent * 0.45
      );

    const direction =
      vehicleSpeed >= 0
        ? 1
        : -1;

    car.rotation.y +=
      steerAmount *
      steeringStrength *
      direction;

  }

  // movement

  car.position.x +=
    Math.sin(
      car.rotation.y
    ) *
    vehicleSpeed;

  car.position.z +=
    Math.cos(
      car.rotation.y
    ) *
    vehicleSpeed;

}

// ============================================================
// CAMERA
// ============================================================

const cameraTarget =
  new THREE.Vector3();

const cameraPosition =
  new THREE.Vector3();

function updateCamera() {

  const target =
    driving
      ? car
      : player;

  const distance =
    driving
      ? 9.5
      : 5.5;

  const height =
    driving
      ? 4.2
      : 3.2;

  cameraPosition.set(
    -Math.sin(
      target.rotation.y
    ) * distance,
    height,
    -Math.cos(
      target.rotation.y
    ) * distance
  );

  cameraPosition.add(
    target.position
  );

  camera.position.lerp(
    cameraPosition,
    0.09
  );

  cameraTarget.set(
    target.position.x,
    driving
      ? 1.0
      : 1.3,
    target.position.z
  );

  camera.lookAt(
    cameraTarget
  );

}

// ============================================================
// USER INTERFACE
// ============================================================

function updateUI() {

  if (driving) {

    const mph =
      Math.round(
        Math.abs(
          vehicleSpeed
        ) *
        105
      );

    speedText.textContent =
      mph +
      " MPH";

    vehicleButton.style.display =
      "block";

    return;

  }

  speedText.textContent =
    "0 MPH";

  const distance =
    distanceToCar();

  if (
    distance < 4
  ) {

    vehicleButton.style.display =
      "block";

    vehicleButton.textContent =
      "ENTER CAR";

    message.textContent =
      "TAP ENTER CAR";

  }

  else {

    vehicleButton.style.display =
      "none";

    message.textContent =
      "WALK TO THE CAR";

  }

}

// ============================================================
// ANIMATION
// ============================================================

function animate() {

  requestAnimationFrame(
    animate
  );

  if (driving) {

    updateCar();

  }

  else {

    updateWalking();

  }

  updateCamera();

  updateUI();

  renderer.render(
    scene,
    camera
  );

}

updateCamera();

animate();

// ============================================================
// WINDOW RESIZE
// ============================================================

window.addEventListener(
  "resize",
  function() {

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

// ============================================================
// STOP STUCK BUTTONS
// ============================================================

window.addEventListener(
  "blur",
  function() {

    Object.keys(
      input
    ).forEach(
      key => {
        input[key] = false;
      }
    );

  }
);
