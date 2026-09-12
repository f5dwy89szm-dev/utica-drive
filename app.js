/* =========================================================
   UTICA DRIVE
   Fresh mobile open-world prototype
   No Google Maps required
========================================================= */

const container = document.getElementById("game");

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x8fc4e8);

scene.fog = new THREE.Fog(0x9ec6dc, 150, 850);

/* =========================================================
   CAMERA
========================================================= */

const camera = new THREE.PerspectiveCamera(
  62,
  window.innerWidth / window.innerHeight,
  0.1,
  2500
);

camera.position.set(0, 5, 10);

/* =========================================================
   RENDERER
========================================================= */

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;

renderer.outputColorSpace =
  THREE.SRGBColorSpace;

container.appendChild(
  renderer.domElement
);

/* =========================================================
   LIGHTING
========================================================= */

const hemiLight =
  new THREE.HemisphereLight(
    0xccecff,
    0x68704f,
    2.4
  );

scene.add(hemiLight);

const sun =
  new THREE.DirectionalLight(
    0xfff1d2,
    3
  );

sun.position.set(
  120,
  180,
  70
);

sun.castShadow = true;

sun.shadow.mapSize.set(
  2048,
  2048
);

sun.shadow.camera.left = -220;
sun.shadow.camera.right = 220;
sun.shadow.camera.top = 220;
sun.shadow.camera.bottom = -220;

scene.add(sun);

/* =========================================================
   WORLD MATERIALS
========================================================= */

const grassMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x708b49,
    roughness: 1
  });

const roadMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x33373a,
    roughness: 0.92
  });

const sidewalkMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xb6b4ad,
    roughness: 1
  });

const yellowLineMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xe6c738
  });

const whiteLineMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xeaeaea
  });

/* =========================================================
   TERRAIN
========================================================= */

const ground =
  new THREE.Mesh(
    new THREE.PlaneGeometry(
      1800,
      1800
    ),
    grassMaterial
  );

ground.rotation.x =
  -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);

/* =========================================================
   ROADS
========================================================= */

function createRoad(
  x,
  z,
  width,
  length,
  rotation = 0
) {

  const road =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        0.12,
        length
      ),
      roadMaterial
    );

  road.position.set(
    x,
    0.05,
    z
  );

  road.rotation.y =
    rotation;

  road.receiveShadow = true;

  scene.add(road);

  return road;
}

/* Major north/south streets */

for (
  let x = -360;
  x <= 360;
  x += 90
) {

  createRoad(
    x,
    0,
    20,
    850
  );
}

/* Major east/west streets */

for (
  let z = -360;
  z <= 360;
  z += 90
) {

  createRoad(
    0,
    z,
    850,
    20
  );
}

/* =========================================================
   CENTER ROAD LINES
========================================================= */

function roadLineVertical(x) {

  for (
    let z = -400;
    z < 400;
    z += 12
  ) {

    const line =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.22,
          0.02,
          5
        ),
        yellowLineMaterial
      );

    line.position.set(
      x,
      0.13,
      z
    );

    scene.add(line);
  }
}

function roadLineHorizontal(z) {

  for (
    let x = -400;
    x < 400;
    x += 12
  ) {

    const line =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          5,
          0.02,
          0.22
        ),
        yellowLineMaterial
      );

    line.position.set(
      x,
      0.13,
      z
    );

    scene.add(line);
  }
}

for (
  let x = -360;
  x <= 360;
  x += 90
) {

  roadLineVertical(x);
}

for (
  let z = -360;
  z <= 360;
  z += 90
) {

  roadLineHorizontal(z);
}

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
    0.08,
    z
  );

  sidewalk.receiveShadow = true;

  scene.add(sidewalk);
}

/* block sidewalks */

for (
  let x = -315;
  x <= 315;
  x += 90
) {

  for (
    let z = -315;
    z <= 315;
    z += 90
  ) {

    createSidewalk(
      x,
      z,
      66,
      66
    );
  }
}

/* =========================================================
   BUILDINGS
========================================================= */

const buildingColors = [

  0xb6aa98,
  0xc7b79e,
  0x9c8b7c,
  0xcfc7b8,
  0xa68e78,
  0xd2c2a5,
  0x978b7f,
  0xb9afa2,
  0x875f4d

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

  const material =
    new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.88
    });

  const building =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        depth
      ),
      material
    );

  building.position.y =
    height / 2 + 0.2;

  building.castShadow = true;
  building.receiveShadow = true;

  group.add(building);

  /* roof */

  const roof =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width + 0.4,
        0.5,
        depth + 0.4
      ),
      new THREE.MeshStandardMaterial({
        color: 0x464646,
        roughness: 1
      })
    );

  roof.position.y =
    height + 0.45;

  roof.castShadow = true;

  group.add(roof);

  /* windows */

  const windowMat =
    new THREE.MeshStandardMaterial({
      color: 0x57798e,
      roughness: 0.25,
      metalness: 0.05
    });

  const floors =
    Math.max(
      1,
      Math.floor(height / 3.5)
    );

  for (
    let floor = 0;
    floor < floors;
    floor++
  ) {

    const windowY =
      2.2 +
      floor * 3.4;

    for (
      let wx =
        -width / 2 + 2;

      wx <=
      width / 2 - 2;

      wx += 3.8
    ) {

      const window =
        new THREE.Mesh(
          new THREE.PlaneGeometry(
            1.4,
            1.4
          ),
          windowMat
        );

      window.position.set(
        wx,
        windowY,
        depth / 2 + 0.011
      );

      group.add(window);
    }
  }

  group.position.set(
    x,
    0,
    z
  );

  scene.add(group);

  return group;
}

/* =========================================================
   DOWNTOWN AREA
========================================================= */

for (
  let x = -135;
  x <= 135;
  x += 45
) {

  for (
    let z = -135;
    z <= 135;
    z += 45
  ) {

    if (
      Math.abs(x % 90) < 10 ||
      Math.abs(z % 90) < 10
    ) {
      continue;
    }

    const height =
      15 +
      Math.random() * 30;

    createBuilding(
      x,
      z,
      26 + Math.random() * 6,
      26 + Math.random() * 6,
      height,
      buildingColors[
        Math.floor(
          Math.random() *
          buildingColors.length
        )
      ]
    );
  }
}

/* =========================================================
   RESIDENTIAL HOUSES
========================================================= */

function createHouse(
  x,
  z,
  rotation = 0
) {

  const group =
    new THREE.Group();

  const bodyColor =
    buildingColors[
      Math.floor(
        Math.random() *
        buildingColors.length
      )
    ];

  const body =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        10,
        6.5,
        14
      ),
      new THREE.MeshStandardMaterial({
        color: bodyColor,
        roughness: 0.9
      })
    );

  body.position.y =
    3.25;

  body.castShadow = true;

  group.add(body);

  const roof =
    new THREE.Mesh(
      new THREE.ConeGeometry(
        9,
        4,
        4
      ),
      new THREE.MeshStandardMaterial({
        color: 0x4d3d34,
        roughness: 1
      })
    );

  roof.position.y =
    8.2;

  roof.rotation.y =
    Math.PI / 4;

  roof.scale.z = 1.25;

  roof.castShadow = true;

  group.add(roof);

  const door =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.8,
        3.1,
        0.25
      ),
      new THREE.MeshStandardMaterial({
        color: 0x47352c
      })
    );

  door.position.set(
    0,
    1.55,
    7.05
  );

  group.add(door);

  group.position.set(
    x,
    0.2,
    z
  );

  group.rotation.y =
    rotation;

  scene.add(group);
}

/* residential neighborhoods */

for (
  let x = -310;
  x <= 310;
  x += 45
) {

  for (
    let z = -310;
    z <= 310;
    z += 45
  ) {

    if (
      Math.abs(x) < 165 &&
      Math.abs(z) < 165
    ) {
      continue;
    }

    if (
      Math.random() >
      0.72
    ) {
      continue;
    }

    createHouse(
      x,
      z,
      Math.random() >
      0.5
        ? 0
        : Math.PI
    );
  }
}

/* =========================================================
   TREES
========================================================= */

function createTree(x, z) {

  const group =
    new THREE.Group();

  const trunk =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.3,
        0.45,
        4.5,
        8
      ),
      new THREE.MeshStandardMaterial({
        color: 0x70503c
      })
    );

  trunk.position.y =
    2.25;

  trunk.castShadow = true;

  group.add(trunk);

  const leaves =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        2.3,
        10,
        10
      ),
      new THREE.MeshStandardMaterial({
        color: 0x3f763c,
        roughness: 1
      })
    );

  leaves.position.y =
    5.6;

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
  i < 140;
  i++
) {

  let x =
    Math.random() * 760 - 380;

  let z =
    Math.random() * 760 - 380;

  const nearRoadX =
    Math.abs(
      ((x + 405) % 90) - 45
    ) < 15;

  const nearRoadZ =
    Math.abs(
      ((z + 405) % 90) - 45
    ) < 15;

  if (
    !nearRoadX &&
    !nearRoadZ
  ) {

    createTree(
      x,
      z
    );
  }
}

/* =========================================================
   PLAYER
========================================================= */

const player =
  new THREE.Group();

scene.add(player);

/* human proportions ~1.8 meters */

const pantsMat =
  new THREE.MeshStandardMaterial({
    color: 0x1c2636
  });

const shirtMat =
  new THREE.MeshStandardMaterial({
    color: 0x353d48
  });

const skinMat =
  new THREE.MeshStandardMaterial({
    color: 0xb98160
  });

const torso =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      0.62,
      0.85,
      0.34
    ),
    shirtMat
  );

torso.position.y =
  1.22;

torso.castShadow = true;

player.add(torso);

const head =
  new THREE.Mesh(
    new THREE.SphereGeometry(
      0.24,
      16,
      16
    ),
    skinMat
  );

head.position.y =
  1.82;

head.castShadow = true;

player.add(head);

function limb(
  width,
  height,
  depth,
  material
) {

  return new THREE.Mesh(
    new THREE.BoxGeometry(
      width,
      height,
      depth
    ),
    material
  );
}

const leftLeg =
  limb(
    0.22,
    0.75,
    0.25,
    pantsMat
  );

leftLeg.position.set(
  -0.18,
  0.48,
  0
);

player.add(leftLeg);

const rightLeg =
  leftLeg.clone();

rightLeg.position.x =
  0.18;

player.add(rightLeg);

const leftArm =
  limb(
    0.18,
    0.82,
    0.2,
    skinMat
  );

leftArm.position.set(
  -0.42,
  1.18,
  0
);

player.add(leftArm);

const rightArm =
  leftArm.clone();

rightArm.position.x =
  0.42;

player.add(rightArm);

player.position.set(
  4,
  0.1,
  10
);

/* =========================================================
   CAR
========================================================= */

const car =
  new THREE.Group();

scene.add(car);

const carBodyMat =
  new THREE.MeshStandardMaterial({
    color: 0x1e3557,
    metalness: 0.45,
    roughness: 0.3
  });

const lowerBody =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      1.9,
      0.55,
      4.5
    ),
    carBodyMat
  );

lowerBody.position.y =
  0.7;

lowerBody.castShadow = true;

car.add(lowerBody);

const hood =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      1.85,
      0.38,
      1.35
    ),
    carBodyMat
  );

hood.position.set(
  0,
  1.02,
  -1.35
);

hood.castShadow = true;

car.add(hood);

const cabin =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      1.7,
      0.72,
      1.9
    ),
    new THREE.MeshStandardMaterial({
      color: 0x31475c,
      metalness: 0.25,
      roughness: 0.28
    })
  );

cabin.position.set(
  0,
  1.25,
  0.25
);

cabin.castShadow = true;

car.add(cabin);

const windshield =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      1.55,
      0.52,
      0.08
    ),
    new THREE.MeshStandardMaterial({
      color: 0x7395a8,
      transparent: true,
      opacity: 0.75,
      roughness: 0.1
    })
  );

windshield.position.set(
  0,
  1.32,
  -0.72
);

car.add(windshield);

/* wheels */

const wheelMat =
  new THREE.MeshStandardMaterial({
    color: 0x151515,
    roughness: 1
  });

const wheels = [];

function addWheel(
  x,
  z
) {

  const wheel =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.42,
        0.42,
        0.3,
        16
      ),
      wheelMat
    );

  wheel.rotation.z =
    Math.PI / 2;

  wheel.position.set(
    x,
    0.48,
    z
  );

  wheel.castShadow = true;

  car.add(wheel);

  wheels.push(wheel);
}

addWheel(
  -1,
  -1.45
);

addWheel(
  1,
  -1.45
);

addWheel(
  -1,
  1.45
);

addWheel(
  1,
  1.45
);

car.position.set(
  0,
  0.1,
  0
);

/* =========================================================
   CONTROL STATE
========================================================= */

const controls = {

  walkForward: false,
  walkBack: false,
  walkLeft: false,
  walkRight: false,

  gas: false,
  brake: false,
  reverse: false,

  steerLeft: false,
  steerRight: false
};

let driving = false;

let playerHeading = 0;

let carSpeed = 0;

let carSteering = 0;

/* =========================================================
   BUTTON HELPERS
========================================================= */

function holdButton(
  id,
  property
) {

  const button =
    document.getElementById(id);

  const start = event => {

    event.preventDefault();

    controls[property] = true;
  };

  const stop = event => {

    event.preventDefault();

    controls[property] = false;
  };

  button.addEventListener(
    "pointerdown",
    start
  );

  button.addEventListener(
    "pointerup",
    stop
  );

  button.addEventListener(
    "pointercancel",
    stop
  );

  button.addEventListener(
    "pointerleave",
    stop
  );
}

holdButton(
  "walkForward",
  "walkForward"
);

holdButton(
  "walkBack",
  "walkBack"
);

holdButton(
  "walkLeft",
  "walkLeft"
);

holdButton(
  "walkRight",
  "walkRight"
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

/* =========================================================
   ENTER VEHICLE
========================================================= */

document
  .getElementById(
    "driveButton"
  )
  .addEventListener(
    "click",
    () => {

      const distance =
        player.position.distanceTo(
          car.position
        );

      if (
        distance < 7
      ) {

        driving = true;

        player.visible =
          false;

        document
          .getElementById(
            "walkControls"
          )
          .classList.add(
            "hidden"
          );

        document
          .getElementById(
            "carControls"
          )
          .classList.remove(
            "hidden"
          );

        document
          .getElementById(
            "modeText"
          )
          .textContent =
          "DRIVING";

        document
          .getElementById(
            "message"
          )
          .textContent =
          "";
      }

    }
  );

/* =========================================================
   EXIT VEHICLE
========================================================= */

document
  .getElementById(
    "exitButton"
  )
  .addEventListener(
    "click",
    () => {

      driving = false;

      carSpeed = 0;

      player.visible =
        true;

      const side =
        new THREE.Vector3(
          2.5,
          0,
          0
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
        0.1;

      document
        .getElementById(
          "walkControls"
        )
        .classList.remove(
          "hidden"
        );

      document
        .getElementById(
          "carControls"
        )
        .classList.add(
          "hidden"
        );

      document
        .getElementById(
          "modeText"
        )
        .textContent =
        "WALKING";

    }
  );

/* =========================================================
   WALKING
========================================================= */

function updatePlayer(
  delta
) {

  const rotateSpeed =
    2.5;

  const walkSpeed =
    5.2;

  if (
    controls.walkLeft
  ) {

    playerHeading +=
      rotateSpeed *
      delta;
  }

  if (
    controls.walkRight
  ) {

    playerHeading -=
      rotateSpeed *
      delta;
  }

  player.rotation.y =
    playerHeading;

  let direction = 0;

  if (
    controls.walkForward
  ) {
    direction += 1;
  }

  if (
    controls.walkBack
  ) {
    direction -= 1;
  }

  if (
    direction !== 0
  ) {

    player.position.x +=
      Math.sin(
        playerHeading
      ) *
      walkSpeed *
      direction *
      delta;

    player.position.z +=
      Math.cos(
        playerHeading
      ) *
      walkSpeed *
      direction *
      delta;
  }

  /* car proximity message */

  const distance =
    player.position.distanceTo(
      car.position
    );

  if (
    distance < 7
  ) {

    document
      .getElementById(
        "message"
      )
      .textContent =
      "TAP DRIVE TO ENTER VEHICLE";

  } else {

    document
      .getElementById(
        "message"
      )
      .textContent =
      "WALK TO THE CAR";

  }
}

/* =========================================================
   CAR PHYSICS
========================================================= */

function updateCar(
  delta
) {

  const acceleration =
    12;

  const reverseAcceleration =
    8;

  const brakePower =
    22;

  const drag =
    2.4;

  const maxForwardSpeed =
    29;

  const maxReverseSpeed =
    -10;

  /* acceleration */

  if (
    controls.gas
  ) {

    carSpeed +=
      acceleration *
      delta;
  }

  if (
    controls.reverse
  ) {

    carSpeed -=
      reverseAcceleration *
      delta;
  }

  /* brakes */

  if (
    controls.brake
  ) {

    if (
      carSpeed > 0
    ) {

      carSpeed -=
        brakePower *
        delta;

      if (
        carSpeed < 0
      ) {
        carSpeed = 0;
      }

    } else if (
      carSpeed < 0
    ) {

      carSpeed +=
        brakePower *
        delta;

      if (
        carSpeed > 0
      ) {
        carSpeed = 0;
      }
    }
  }

  /* natural drag */

  if (
    !controls.gas &&
    !controls.reverse
  ) {

    if (
      carSpeed > 0
    ) {

      carSpeed -=
        drag *
        delta;

      if (
        carSpeed < 0
      ) {
        carSpeed = 0;
      }

    } else if (
      carSpeed < 0
    ) {

      carSpeed +=
        drag *
        delta;

      if (
        carSpeed > 0
      ) {
        carSpeed = 0;
      }
    }
  }

  carSpeed =
    THREE.MathUtils.clamp(
      carSpeed,
      maxReverseSpeed,
      maxForwardSpeed
    );

  /* steering */

  const targetSteering =
    controls.steerLeft
      ? 1
      : controls.steerRight
        ? -1
        : 0;

  carSteering =
    THREE.MathUtils.lerp(
      carSteering,
      targetSteering,
      Math.min(
        1,
        delta * 7
      )
    );

  const speedRatio =
    Math.min(
      Math.abs(carSpeed) /
      maxForwardSpeed,
      1
    );

  const steeringStrength =
    1.35 -
    speedRatio * 0.75;

  if (
    Math.abs(carSpeed) >
    0.2
  ) {

    const reverseDirection =
      carSpeed >= 0
        ? 1
        : -1;

    car.rotation.y +=
      carSteering *
      steeringStrength *
      reverseDirection *
      delta;
  }

  /* move car */

  car.position.x +=
    Math.sin(
      car.rotation.y
    ) *
    carSpeed *
    delta;

  car.position.z +=
    Math.cos(
      car.rotation.y
    ) *
    carSpeed *
    delta;

  /* wheel animation */

  wheels.forEach(
    wheel => {

      wheel.rotation.x +=
        carSpeed *
        delta *
        1.2;

    }
  );

  /* MPH */

  const mph =
    Math.round(
      Math.abs(carSpeed) *
      2.237
    );

  document
    .getElementById(
      "speedText"
    )
    .textContent =
    mph +
    " MPH";
}

/* =========================================================
   CAMERA
========================================================= */

const cameraTarget =
  new THREE.Vector3();

const desiredCamera =
  new THREE.Vector3();

function updateCamera(
  delta
) {

  if (
    driving
  ) {

    const offset =
      new THREE.Vector3(
        0,
        4.1,
        -8.8
      );

    offset.applyQuaternion(
      car.quaternion
    );

    desiredCamera.copy(
      car.position
    );

    desiredCamera.add(
      offset
    );

    camera.position.lerp(
      desiredCamera,
      Math.min(
        1,
        delta * 5.5
      )
    );

    cameraTarget.copy(
      car.position
    );

    cameraTarget.y +=
      1.2;

    camera.lookAt(
      cameraTarget
    );

  } else {

    const offset =
      new THREE.Vector3(
        0,
        3.2,
        -5.7
      );

    offset.applyQuaternion(
      player.quaternion
    );

    desiredCamera.copy(
      player.position
    );

    desiredCamera.add(
      offset
    );

    camera.position.lerp(
      desiredCamera,
      Math.min(
        1,
        delta * 6
      )
    );

    cameraTarget.copy(
      player.position
    );

    cameraTarget.y +=
      1.15;

    camera.lookAt(
      cameraTarget
    );
  }
}

/* =========================================================
   KEYBOARD CONTROLS
   also useful when testing on computer
========================================================= */

window.addEventListener(
  "keydown",
  event => {

    if (
      event.code ===
      "KeyW"
    ) {

      if (driving) {
        controls.gas = true;
      } else {
        controls.walkForward =
          true;
      }
    }

    if (
      event.code ===
      "KeyS"
    ) {

      if (driving) {
        controls.brake =
          true;
      } else {
        controls.walkBack =
          true;
      }
    }

    if (
      event.code ===
      "KeyA"
    ) {

      if (driving) {
        controls.steerLeft =
          true;
      } else {
        controls.walkLeft =
          true;
      }
    }

    if (
      event.code ===
      "KeyD"
    ) {

      if (driving) {
        controls.steerRight =
          true;
      } else {
        controls.walkRight =
          true;
      }
    }
  }
);

window.addEventListener(
  "keyup",
  event => {

    if (
      event.code ===
      "KeyW"
    ) {

      controls.gas =
        false;

      controls.walkForward =
        false;
    }

    if (
      event.code ===
      "KeyS"
    ) {

      controls.brake =
        false;

      controls.walkBack =
        false;
    }

    if (
      event.code ===
      "KeyA"
    ) {

      controls.steerLeft =
        false;

      controls.walkLeft =
        false;
    }

    if (
      event.code ===
      "KeyD"
    ) {

      controls.steerRight =
        false;

      controls.walkRight =
        false;
    }
  }
);

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
  }
);

/* =========================================================
   GAME LOOP
========================================================= */

const clock =
  new THREE.Clock();

function animate() {

  requestAnimationFrame(
    animate
  );

  const delta =
    Math.min(
      clock.getDelta(),
      0.05
    );

  if (
    driving
  ) {

    updateCar(
      delta
    );

  } else {

    updatePlayer(
      delta
    );

    document
      .getElementById(
        "speedText"
      )
      .textContent =
      "0 MPH";
  }

  updateCamera(
    delta
  );

  renderer.render(
    scene,
    camera
  );
}

animate();
