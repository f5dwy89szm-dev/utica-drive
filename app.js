"use strict";

/* =========================================================
   UTICA DRIVE
   Fresh Three.js mobile build
   No Google Maps
========================================================= */

const game = document.getElementById("game");

const loading = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");

const modeText = document.getElementById("modeText");
const speedText = document.getElementById("speedText");
const message = document.getElementById("message");

const actionBtn = document.getElementById("actionBtn");

const upBtn = document.getElementById("upBtn");
const downBtn = document.getElementById("downBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

if (typeof THREE === "undefined") {
  showError("Three.js did not load. Refresh the page and check your internet connection.");
  throw new Error("Three.js missing");
}

/* =========================================================
   SCENE
========================================================= */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87bde8);

scene.fog = new THREE.Fog(
  0x87bde8,
  160,
  800
);

/* =========================================================
   CAMERA
========================================================= */

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);

camera.position.set(
  7,
  5,
  12
);

/* =========================================================
   RENDERER
========================================================= */

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;

renderer.outputColorSpace =
  THREE.SRGBColorSpace;

renderer.toneMapping =
  THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.15;

game.appendChild(renderer.domElement);

/* =========================================================
   LIGHTING
========================================================= */

const hemisphere = new THREE.HemisphereLight(
  0xbfe3ff,
  0x4b5138,
  2.1
);

scene.add(hemisphere);

const sun = new THREE.DirectionalLight(
  0xfff0d5,
  3.5
);

sun.position.set(
  -100,
  160,
  90
);

sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

sun.shadow.camera.left = -160;
sun.shadow.camera.right = 160;
sun.shadow.camera.top = 160;
sun.shadow.camera.bottom = -160;

sun.shadow.camera.near = 1;
sun.shadow.camera.far = 450;

scene.add(sun);

/* =========================================================
   MATERIALS
========================================================= */

const grassMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x4f7f42,
    roughness: 1
  });

const asphaltMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x303338,
    roughness: 0.95
  });

const sidewalkMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xa6a6a0,
    roughness: 1
  });

const roadLineMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xe6d45c,
    emissive: 0x3c3410,
    roughness: 0.8
  });

/* =========================================================
   GROUND
========================================================= */

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(
    1000,
    1000
  ),
  grassMaterial
);

ground.rotation.x = -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);

/* =========================================================
   ROADS
========================================================= */

const ROAD_WIDTH = 13;

function createRoad(x, z, width, depth) {

  const road =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        0.08,
        depth
      ),
      asphaltMaterial
    );

  road.position.set(
    x,
    0.04,
    z
  );

  road.receiveShadow = true;

  scene.add(road);

  return road;
}

function createCenterLineX(z, length) {

  for (
    let x = -length / 2;
    x < length / 2;
    x += 8
  ) {

    const line =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          4,
          0.025,
          0.16
        ),
        roadLineMaterial
      );

    line.position.set(
      x,
      0.095,
      z
    );

    scene.add(line);
  }
}

function createCenterLineZ(x, length) {

  for (
    let z = -length / 2;
    z < length / 2;
    z += 8
  ) {

    const line =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.16,
          0.025,
          4
        ),
        roadLineMaterial
      );

    line.position.set(
      x,
      0.095,
      z
    );

    scene.add(line);
  }
}

/*
   A procedural street network inspired by
   a Northeast US city layout.
*/

const roadPositions = [
  -150,
  -100,
  -50,
  0,
  50,
  100,
  150
];

roadPositions.forEach((z) => {

  createRoad(
    0,
    z,
    360,
    ROAD_WIDTH
  );

  createCenterLineX(
    z,
    360
  );
});

roadPositions.forEach((x) => {

  createRoad(
    x,
    0,
    ROAD_WIDTH,
    360
  );

  createCenterLineZ(
    x,
    360
  );
});

/* =========================================================
   SIDEWALKS
========================================================= */

function createSidewalk(
  x,
  z,
  width,
  depth
) {

  const sidewalk =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        0.18,
        depth
      ),
      sidewalkMaterial
    );

  sidewalk.position.set(
    x,
    0.09,
    z
  );

  sidewalk.receiveShadow = true;

  scene.add(sidewalk);
}

/* =========================================================
   BUILDINGS
========================================================= */

const buildingColors = [
  0xa86945,
  0xb89472,
  0xc4b29d,
  0x8d6c55,
  0xb26d55,
  0xd0c5ae,
  0x7e8587,
  0x9c7658
];

function createBuilding(
  x,
  z,
  width,
  depth,
  height,
  color
) {

  const group =
    new THREE.Group();

  /*
     Main shell
  */

  const building =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        depth
      ),
      new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.9
      })
    );

  building.position.y =
    height / 2;

  building.castShadow = true;
  building.receiveShadow = true;

  group.add(building);

  /*
     Roof
  */

  const roof =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width + 0.4,
        0.35,
        depth + 0.4
      ),
      new THREE.MeshStandardMaterial({
        color: 0x383b3c,
        roughness: 1
      })
    );

  roof.position.y =
    height + 0.18;

  roof.castShadow = true;

  group.add(roof);

  /*
     Windows
  */

  const windowMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x9ec8d9,
      emissive: 0x071216,
      roughness: 0.3,
      metalness: 0.15
    });

  const floors =
    Math.max(
      1,
      Math.floor(height / 3.1)
    );

  const windowsAcross =
    Math.max(
      2,
      Math.floor(width / 2.5)
    );

  for (
    let floor = 0;
    floor < floors;
    floor++
  ) {

    const y =
      1.7 + floor * 3;

    for (
      let w = 0;
      w < windowsAcross;
      w++
    ) {

      const wx =
        -width / 2 +
        1.3 +
        w * ((width - 2.6) /
        Math.max(1, windowsAcross - 1));

      const windowMesh =
        new THREE.Mesh(
          new THREE.PlaneGeometry(
            1.0,
            1.35
          ),
          windowMaterial
        );

      windowMesh.position.set(
        wx,
        y,
        depth / 2 + 0.012
      );

      group.add(windowMesh);
    }
  }

  group.position.set(
    x,
    0.18,
    z
  );

  scene.add(group);

  return group;
}

/* =========================================================
   CITY BLOCKS
========================================================= */

function seededRandom(seed) {

  let value =
    Math.sin(seed * 12.9898) *
    43758.5453;

  return value -
    Math.floor(value);
}

let buildingSeed = 1;

for (
  let gx = -125;
  gx <= 125;
  gx += 50
) {

  for (
    let gz = -125;
    gz <= 125;
    gz += 50
  ) {

    /*
       Central downtown area gets
       larger/taller buildings.
    */

    const downtown =
      Math.abs(gx) < 65 &&
      Math.abs(gz) < 65;

    const lotOffsets = [
      [-10, -10],
      [10, -10],
      [-10, 10],
      [10, 10]
    ];

    lotOffsets.forEach((offset) => {

      buildingSeed++;

      const r1 =
        seededRandom(
          buildingSeed
        );

      buildingSeed++;

      const r2 =
        seededRandom(
          buildingSeed
        );

      buildingSeed++;

      const r3 =
        seededRandom(
          buildingSeed
        );

      const width =
        downtown
          ? 14 + r1 * 5
          : 10 + r1 * 6;

      const depth =
        downtown
          ? 14 + r2 * 5
          : 10 + r2 * 6;

      const height =
        downtown
          ? 18 + r3 * 35
          : 6 + r3 * 11;

      const color =
        buildingColors[
          Math.floor(
            r1 *
            buildingColors.length
          )
        ];

      createBuilding(
        gx + offset[0],
        gz + offset[1],
        width,
        depth,
        height,
        color
      );
    });
  }
}

/* =========================================================
   TREES
========================================================= */

function createTree(x, z, scale = 1) {

  const group =
    new THREE.Group();

  const trunk =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.23 * scale,
        0.32 * scale,
        2.6 * scale,
        8
      ),
      new THREE.MeshStandardMaterial({
        color: 0x5d3e25
      })
    );

  trunk.position.y =
    1.3 * scale;

  trunk.castShadow = true;

  group.add(trunk);

  const leaves =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        1.35 * scale,
        10,
        8
      ),
      new THREE.MeshStandardMaterial({
        color: 0x315f2e,
        roughness: 1
      })
    );

  leaves.position.y =
    3.2 * scale;

  leaves.castShadow = true;

  group.add(leaves);

  group.position.set(
    x,
    0,
    z
  );

  scene.add(group);
}

for (
  let i = 0;
  i < 55;
  i++
) {

  const x =
    -170 +
    Math.random() * 340;

  const z =
    -170 +
    Math.random() * 340;

  const nearRoadX =
    roadPositions.some(
      roadX =>
        Math.abs(x - roadX) <
        10
    );

  const nearRoadZ =
    roadPositions.some(
      roadZ =>
        Math.abs(z - roadZ) <
        10
    );

  if (
    !nearRoadX &&
    !nearRoadZ
  ) {

    createTree(
      x,
      z,
      0.8 +
      Math.random() * 0.45
    );
  }
}

/* =========================================================
   CHARACTER
========================================================= */

const player =
  new THREE.Group();

scene.add(player);

/*
   Realistic human height:
   approximately 1.75 meters.
*/

const skinMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xb87958,
    roughness: 0.85
  });

const shirtMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x20252d,
    roughness: 0.9
  });

const pantsMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x243652,
    roughness: 0.9
  });

const shoeMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x111111
  });

/*
   Torso
*/

const torso =
  new THREE.Mesh(
    new THREE.CapsuleGeometry(
      0.28,
      0.65,
      5,
      10
    ),
    shirtMaterial
  );

torso.position.y = 1.15;

torso.scale.set(
  1.0,
  1,
  0.58
);

torso.castShadow = true;

player.add(torso);

/*
   Head
*/

const head =
  new THREE.Mesh(
    new THREE.SphereGeometry(
      0.23,
      16,
      12
    ),
    skinMaterial
  );

head.position.y = 1.72;

head.castShadow = true;

player.add(head);

/*
   Hair
*/

const hair =
  new THREE.Mesh(
    new THREE.SphereGeometry(
      0.235,
      14,
      10,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.52
    ),
    new THREE.MeshStandardMaterial({
      color: 0x17120e
    })
  );

hair.position.y = 1.78;

player.add(hair);

/*
   Legs
*/

function makeLeg(x) {

  const leg =
    new THREE.Group();

  const upper =
    new THREE.Mesh(
      new THREE.CapsuleGeometry(
        0.105,
        0.5,
        4,
        8
      ),
      pantsMaterial
    );

  upper.position.y = 0.55;
  upper.castShadow = true;

  leg.add(upper);

  const shoe =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.21,
        0.13,
        0.35
      ),
      shoeMaterial
    );

  shoe.position.set(
    0,
    0.12,
    0.07
  );

  shoe.castShadow = true;

  leg.add(shoe);

  leg.position.x = x;

  player.add(leg);

  return leg;
}

const leftLeg =
  makeLeg(-0.15);

const rightLeg =
  makeLeg(0.15);

/*
   Arms
*/

function makeArm(x) {

  const arm =
    new THREE.Mesh(
      new THREE.CapsuleGeometry(
        0.075,
        0.53,
        4,
        8
      ),
      skinMaterial
    );

  arm.position.set(
    x,
    1.13,
    0
  );

  arm.castShadow = true;

  player.add(arm);

  return arm;
}

const leftArm =
  makeArm(-0.39);

const rightArm =
  makeArm(0.39);

player.position.set(
  3,
  0.18,
  6
);

/* =========================================================
   CAR
========================================================= */

const car =
  new THREE.Group();

scene.add(car);

const carBodyMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x184e9e,
    metalness: 0.45,
    roughness: 0.3
  });

const darkMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x101215,
    metalness: 0.2,
    roughness: 0.4
  });

const glassMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x162b38,
    metalness: 0.45,
    roughness: 0.15
  });

/*
   Vehicle:
   about 4.6m long
   1.85m wide
*/

const carLower =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      1.85,
      0.55,
      4.6
    ),
    carBodyMaterial
  );

carLower.position.y = 0.63;

carLower.castShadow = true;

car.add(carLower);

const hood =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      1.72,
      0.32,
      1.35
    ),
    carBodyMaterial
  );

hood.position.set(
  0,
  0.94,
  -1.35
);

hood.castShadow = true;

car.add(hood);

const cabin =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      1.58,
      0.72,
      2.05
    ),
    glassMaterial
  );

cabin.position.set(
  0,
  1.16,
  0.25
);

cabin.castShadow = true;

car.add(cabin);

const roof =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      1.52,
      0.12,
      1.45
    ),
    carBodyMaterial
  );

roof.position.set(
  0,
  1.58,
  0.2
);

roof.castShadow = true;

car.add(roof);

/*
   Bumpers
*/

const frontBumper =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      1.78,
      0.18,
      0.18
    ),
    darkMaterial
  );

frontBumper.position.set(
  0,
  0.53,
  -2.34
);

car.add(frontBumper);

const rearBumper =
  frontBumper.clone();

rearBumper.position.z = 2.34;

car.add(rearBumper);

/*
   Wheels
*/

const wheelMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.9
  });

const rimMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x777a7e,
    metalness: 0.8,
    roughness: 0.25
  });

const wheels = [];

function createWheel(
  x,
  z
) {

  const wheelGroup =
    new THREE.Group();

  const tire =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.39,
        0.39,
        0.25,
        16
      ),
      wheelMaterial
    );

  tire.rotation.z =
    Math.PI / 2;

  tire.castShadow = true;

  wheelGroup.add(tire);

  const rim =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.22,
        0.22,
        0.265,
        16
      ),
      rimMaterial
    );

  rim.rotation.z =
    Math.PI / 2;

  wheelGroup.add(rim);

  wheelGroup.position.set(
    x,
    0.4,
    z
  );

  car.add(wheelGroup);

  wheels.push(wheelGroup);

  return wheelGroup;
}

createWheel(-0.94, -1.45);
createWheel(0.94, -1.45);
createWheel(-0.94, 1.45);
createWheel(0.94, 1.45);

/*
   Headlights
*/

const headlightMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xfff2c9,
    emissive: 0xffdf8a,
    emissiveIntensity: 1.2
  });

[-0.55, 0.55].forEach((x) => {

  const light =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.35,
        0.2,
        0.04
      ),
      headlightMaterial
    );

  light.position.set(
    x,
    0.75,
    -2.31
  );

  car.add(light);
});

car.position.set(
  0,
  0.18,
  0
);

/* =========================================================
   INPUT
========================================================= */

const input = {
  up: false,
  down: false,
  left: false,
  right: false
};

function bindButton(
  button,
  key
) {

  const press = (event) => {

    event.preventDefault();

    input[key] = true;

    button.classList.add(
      "active"
    );
  };

  const release = (event) => {

    event.preventDefault();

    input[key] = false;

    button.classList.remove(
      "active"
    );
  };

  button.addEventListener(
    "pointerdown",
    press
  );

  button.addEventListener(
    "pointerup",
    release
  );

  button.addEventListener(
    "pointercancel",
    release
  );

  button.addEventListener(
    "pointerleave",
    release
  );
}

bindButton(
  upBtn,
  "up"
);

bindButton(
  downBtn,
  "down"
);

bindButton(
  leftBtn,
  "left"
);

bindButton(
  rightBtn,
  "right"
);

/* Keyboard support */

window.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "ArrowUp" ||
      event.key.toLowerCase() === "w"
    ) {
      input.up = true;
    }

    if (
      event.key === "ArrowDown" ||
      event.key.toLowerCase() === "s"
    ) {
      input.down = true;
    }

    if (
      event.key === "ArrowLeft" ||
      event.key.toLowerCase() === "a"
    ) {
      input.left = true;
    }

    if (
      event.key === "ArrowRight" ||
      event.key.toLowerCase() === "d"
    ) {
      input.right = true;
    }

    if (
      event.key.toLowerCase() === "e"
    ) {
      handleAction();
    }
  }
);

window.addEventListener(
  "keyup",
  (event) => {

    if (
      event.key === "ArrowUp" ||
      event.key.toLowerCase() === "w"
    ) {
      input.up = false;
    }

    if (
      event.key === "ArrowDown" ||
      event.key.toLowerCase() === "s"
    ) {
      input.down = false;
    }

    if (
      event.key === "ArrowLeft" ||
      event.key.toLowerCase() === "a"
    ) {
      input.left = false;
    }

    if (
      event.key === "ArrowRight" ||
      event.key.toLowerCase() === "d"
    ) {
      input.right = false;
    }
  }
);

/* =========================================================
   GAME STATE
========================================================= */

let driving = false;

let carSpeed = 0;

let steering = 0;

let playerWalkCycle = 0;

const PLAYER_SPEED = 4.2;

const PLAYER_TURN_SPEED = 2.8;

const CAR_ACCELERATION = 7.5;

const CAR_BRAKE = 10;

const CAR_REVERSE_ACCELERATION = 5.3;

const CAR_MAX_SPEED = 20;

const CAR_MAX_REVERSE = -7;

const CAR_DRAG = 2.2;

const MAX_STEERING =
  THREE.MathUtils.degToRad(30);

const tempVector =
  new THREE.Vector3();

const desiredCamera =
  new THREE.Vector3();

const desiredLook =
  new THREE.Vector3();

/* =========================================================
   ACTION / ENTER / EXIT CAR
========================================================= */

actionBtn.addEventListener(
  "click",
  handleAction
);

function getPlayerCarDistance() {

  return player.position.distanceTo(
    car.position
  );
}

function handleAction() {

  if (!driving) {

    const distance =
      getPlayerCarDistance();

    if (distance <= 4.0) {

      driving = true;

      player.visible = false;

      actionBtn.textContent =
        "EXIT";

      modeText.textContent =
        "DRIVING";

      message.textContent =
        "DRIVE";

    } else {

      message.textContent =
        "GET CLOSER TO THE CAR";
    }

    return;
  }

  /*
     Exit vehicle
  */

  driving = false;

  carSpeed = 0;

  player.visible = true;

  const exitOffset =
    new THREE.Vector3(
      -2.2,
      0,
      0
    );

  exitOffset.applyQuaternion(
    car.quaternion
  );

  player.position.copy(
    car.position
  );

  player.position.add(
    exitOffset
  );

  player.position.y = 0.18;

  player.rotation.y =
    car.rotation.y;

  actionBtn.textContent =
    "DRIVE";

  modeText.textContent =
    "WALKING";

  message.textContent =
    "WALK TO THE CAR";
}

/* =========================================================
   WALKING
========================================================= */

function updateWalking(dt) {

  let moving = false;

  if (input.left) {

    player.rotation.y +=
      PLAYER_TURN_SPEED * dt;
  }

  if (input.right) {

    player.rotation.y -=
      PLAYER_TURN_SPEED * dt;
  }

  let moveAmount = 0;

  if (input.up) {

    moveAmount +=
      PLAYER_SPEED * dt;

    moving = true;
  }

  if (input.down) {

    moveAmount -=
      PLAYER_SPEED *
      0.65 *
      dt;

    moving = true;
  }

  if (moveAmount !== 0) {

    tempVector.set(
      Math.sin(player.rotation.y),
      0,
      Math.cos(player.rotation.y)
    );

    player.position.addScaledVector(
      tempVector,
      -moveAmount
    );
  }

  player.position.x =
    THREE.MathUtils.clamp(
      player.position.x,
      -180,
      180
    );

  player.position.z =
    THREE.MathUtils.clamp(
      player.position.z,
      -180,
      180
    );

  if (moving) {

    playerWalkCycle +=
      dt * 10;

    leftLeg.rotation.x =
      Math.sin(
        playerWalkCycle
      ) * 0.45;

    rightLeg.rotation.x =
      Math.sin(
        playerWalkCycle +
        Math.PI
      ) * 0.45;

    leftArm.rotation.x =
      Math.sin(
        playerWalkCycle +
        Math.PI
      ) * 0.32;

    rightArm.rotation.x =
      Math.sin(
        playerWalkCycle
      ) * 0.32;

  } else {

    leftLeg.rotation.x *= 0.82;
    rightLeg.rotation.x *= 0.82;

    leftArm.rotation.x *= 0.82;
    rightArm.rotation.x *= 0.82;
  }

  const distance =
    getPlayerCarDistance();

  if (distance <= 4) {

    message.textContent =
      "PRESS DRIVE";

  } else {

    message.textContent =
      "WALK TO THE CAR";
  }

  speedText.textContent =
    "0 MPH";
}

/* =========================================================
   DRIVING
========================================================= */

function updateDriving(dt) {

  /*
     Acceleration
  */

  if (input.up) {

    carSpeed +=
      CAR_ACCELERATION *
      dt;
  }

  /*
     Reverse / braking
  */

  if (input.down) {

    if (carSpeed > 1) {

      carSpeed -=
        CAR_BRAKE *
        dt;

    } else {

      carSpeed -=
        CAR_REVERSE_ACCELERATION *
        dt;
    }
  }

  /*
     Natural drag
  */

  if (
    !input.up &&
    !input.down
  ) {

    if (carSpeed > 0) {

      carSpeed =
        Math.max(
          0,
          carSpeed -
          CAR_DRAG * dt
        );

    } else if (
      carSpeed < 0
    ) {

      carSpeed =
        Math.min(
          0,
          carSpeed +
          CAR_DRAG * dt
        );
    }
  }

  carSpeed =
    THREE.MathUtils.clamp(
      carSpeed,
      CAR_MAX_REVERSE,
      CAR_MAX_SPEED
    );

  /*
     Steering
  */

  let steeringTarget = 0;

  if (input.left) {

    steeringTarget =
      MAX_STEERING;
  }

  if (input.right) {

    steeringTarget =
      -MAX_STEERING;
  }

  steering =
    THREE.MathUtils.lerp(
      steering,
      steeringTarget,
      1 -
      Math.exp(
        -7 * dt
      )
    );

  /*
     Turn amount changes with speed
  */

  if (
    Math.abs(carSpeed) >
    0.15
  ) {

    const speedRatio =
      Math.min(
        Math.abs(carSpeed) /
        CAR_MAX_SPEED,
        1
      );

    const turnRate =
      steering *
      carSpeed *
      0.095 *
      (
        1 -
        speedRatio * 0.35
      );

    car.rotation.y +=
      turnRate *
      dt *
      3;
  }

  /*
     Move vehicle
  */

  const forward =
    new THREE.Vector3(
      Math.sin(car.rotation.y),
      0,
      Math.cos(car.rotation.y)
    );

  car.position.addScaledVector(
    forward,
    -carSpeed * dt
  );

  car.position.x =
    THREE.MathUtils.clamp(
      car.position.x,
      -180,
      180
    );

  car.position.z =
    THREE.MathUtils.clamp(
      car.position.z,
      -180,
      180
    );

  /*
     Wheel animation
  */

  const wheelSpin =
    carSpeed *
    dt /
    0.39;

  wheels.forEach(
    (wheel) => {

      wheel.children.forEach(
        (part) => {

          part.rotation.x +=
            wheelSpin;
        }
      );
    }
  );

  const mph =
    Math.round(
      Math.abs(carSpeed) *
      2.237
    );

  speedText.textContent =
    mph + " MPH";

  modeText.textContent =
    carSpeed < -0.2
      ? "REVERSING"
      : "DRIVING";

  message.textContent =
    carSpeed < -0.3
      ? "REVERSE"
      : "UTICA DRIVE";
}

/* =========================================================
   CAMERA
========================================================= */

function updateCamera(dt) {

  const target =
    driving
      ? car
      : player;

  /*
     Camera follows behind the
     player or vehicle.
  */

  const distance =
    driving
      ? 9.5
      : 5.2;

  const height =
    driving
      ? 4.1
      : 3.3;

  const targetHeight =
    driving
      ? 1.1
      : 1.1;

  const backward =
    new THREE.Vector3(
      0,
      height,
      distance
    );

  backward.applyAxisAngle(
    new THREE.Vector3(
      0,
      1,
      0
    ),
    target.rotation.y
  );

  desiredCamera.copy(
    target.position
  );

  desiredCamera.add(
    backward
  );

  desiredLook.copy(
    target.position
  );

  desiredLook.y +=
    targetHeight;

  const smoothing =
    1 -
    Math.exp(
      -6 * dt
    );

  camera.position.lerp(
    desiredCamera,
    smoothing
  );

  camera.lookAt(
    desiredLook
  );
}

/* =========================================================
   SIMPLE COLLISION WITH CITY LIMITS
========================================================= */

function keepAboveGround() {

  player.position.y = 0.18;

  car.position.y = 0.18;
}

/* =========================================================
   RESIZE
========================================================= */

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

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
      )
    );
  }
);

/* =========================================================
   ERROR HANDLING
========================================================= */

function showError(text) {

  errorBox.style.display =
    "block";

  errorBox.textContent =
    text;
}

window.addEventListener(
  "error",
  (event) => {

    showError(
      "GAME ERROR: " +
      event.message
    );
  }
);

/* =========================================================
   GAME LOOP
========================================================= */

const clock =
  new THREE.Clock();

let firstFrame =
  true;

function animate() {

  requestAnimationFrame(
    animate
  );

  let dt =
    clock.getDelta();

  /*
     Prevent huge physics jumps
     if Safari pauses the page.
  */

  dt =
    Math.min(
      dt,
      0.05
    );

  if (driving) {

    updateDriving(dt);

  } else {

    updateWalking(dt);
  }

  keepAboveGround();

  updateCamera(dt);

  renderer.render(
    scene,
    camera
  );

  if (firstFrame) {

    firstFrame = false;

    loading.style.display =
      "none";
  }
}

animate();
