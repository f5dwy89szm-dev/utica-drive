(() => {

  "use strict";

  const loading =

    document.getElementById("loading");

  const speedDisplay =

    document.getElementById("speed");

  const modeDisplay =

    document.getElementById("mode");

  const notice =

    document.getElementById("notice");

  const exitBtn =

    document.getElementById("exitBtn");

  const reverseBtn =

    document.getElementById("reverseBtn");

  /* =========================

     THREE.JS CHECK

  ========================== */

  if (typeof THREE === "undefined") {

    loading.innerHTML =

      "3D ENGINE FAILED TO LOAD<br>REFRESH THE PAGE";

    return;

  }

  /* =========================

     SCENE

  ========================== */

  const scene =

    new THREE.Scene();

  scene.background =

    new THREE.Color(0x8cc6ed);

  scene.fog =

    new THREE.Fog(

      0x8cc6ed,

      170,

      850

    );

  /* =========================

     CAMERA

  ========================== */

  const camera =

    new THREE.PerspectiveCamera(

      62,

      window.innerWidth /

      window.innerHeight,

      0.1,

      1800

    );

  /* =========================

     RENDERER

  ========================== */

  const renderer =

    new THREE.WebGLRenderer({

      antialias: true,

      powerPreference:

        "high-performance"

    });

  renderer.setPixelRatio(

    Math.min(

      window.devicePixelRatio,

      2

    )

  );

  renderer.setSize(

    window.innerWidth,

    window.innerHeight

  );

  renderer.shadowMap.enabled =

    true;

  renderer.shadowMap.type =

    THREE.PCFSoftShadowMap;

  renderer.outputColorSpace =

    THREE.SRGBColorSpace;

  document.body.prepend(

    renderer.domElement

  );

  /* =========================

     LIGHTING

  ========================== */

  const skyLight =

    new THREE.HemisphereLight(

      0xe4f4ff,

      0x62704d,

      2.2

    );

  scene.add(skyLight);

  const sun =

    new THREE.DirectionalLight(

      0xffffff,

      2.8

    );

  sun.position.set(

    180,

    250,

    120

  );

  sun.castShadow = true;

  sun.shadow.mapSize.set(

    1024,

    1024

  );

  sun.shadow.camera.left = -260;

  sun.shadow.camera.right = 260;

  sun.shadow.camera.top = 260;

  sun.shadow.camera.bottom = -260;

  scene.add(sun);

  /* =========================

     MATERIALS

  ========================== */

  const grassMat =

    new THREE.MeshStandardMaterial({

      color: 0x5e844c,

      roughness: 1

    });

  const roadMat =

    new THREE.MeshStandardMaterial({

      color: 0x34373b,

      roughness: 1

    });

  const sidewalkMat =

    new THREE.MeshStandardMaterial({

      color: 0xa2a3a0,

      roughness: 1

    });

  const yellowLineMat =

    new THREE.MeshBasicMaterial({

      color: 0xf4cc38

    });

  const whiteLineMat =

    new THREE.MeshBasicMaterial({

      color: 0xf5f5f5

    });

  /* =========================

     GROUND

  ========================== */

  const ground =

    new THREE.Mesh(

      new THREE.PlaneGeometry(

        1500,

        1500

      ),

      grassMat

    );

  ground.rotation.x =

    -Math.PI / 2;

  ground.receiveShadow = true;

  scene.add(ground);

  /* =========================

     ROADS

  ========================== */

  function createRoad(

    x,

    z,

    width,

    depth

  ) {

    const road =

      new THREE.Mesh(

        new THREE.PlaneGeometry(

          width,

          depth

        ),

        roadMat

      );

    road.rotation.x =

      -Math.PI / 2;

    road.position.set(

      x,

      0.035,

      z

    );

    road.receiveShadow =

      true;

    scene.add(road);

    return road;

  }

  const roadSpacing = 100;

  for (

    let x = -400;

    x <= 400;

    x += roadSpacing

  ) {

    createRoad(

      x,

      0,

      26,

      900

    );

  }

  for (

    let z = -400;

    z <= 400;

    z += roadSpacing

  ) {

    createRoad(

      0,

      z,

      900,

      26

    );

  }

  /* =========================

     CENTER ROAD LINES

  ========================== */

  function roadMarking(

    x,

    z,

    w,

    h,

    material

  ) {

    const line =

      new THREE.Mesh(

        new THREE.PlaneGeometry(

          w,

          h

        ),

        material

      );

    line.rotation.x =

      -Math.PI / 2;

    line.position.set(

      x,

      0.055,

      z

    );

    scene.add(line);

  }

  for (

    let roadX = -400;

    roadX <= 400;

    roadX += roadSpacing

  ) {

    for (

      let z = -440;

      z <= 440;

      z += 18

    ) {

      roadMarking(

        roadX,

        z,

        0.35,

        9,

        yellowLineMat

      );

    }

  }

  for (

    let roadZ = -400;

    roadZ <= 400;

    roadZ += roadSpacing

  ) {

    for (

      let x = -440;

      x <= 440;

      x += 18

    ) {

      roadMarking(

        x,

        roadZ,

        9,

        0.35,

        yellowLineMat

      );

    }

  }

  /* =========================

     BUILDINGS

  ========================== */

  const buildingColors = [

    0xb89d7b,

    0xd2c2ad,

    0xa88e75,

    0x8a8580,

    0xc8b19a,

    0x968476,

    0xbab9ae

  ];

  function createBuilding(

    x,

    z,

    width,

    depth,

    height

  ) {

    const sidewalk =

      new THREE.Mesh(

        new THREE.BoxGeometry(

          width + 5,

          0.25,

          depth + 5

        ),

        sidewalkMat

      );

    sidewalk.position.set(

      x,

      0.125,

      z

    );

    sidewalk.receiveShadow =

      true;

    scene.add(sidewalk);

    const buildingMat =

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

    const building =

      new THREE.Mesh(

        new THREE.BoxGeometry(

          width,

          height,

          depth

        ),

        buildingMat

      );

    building.position.set(

      x,

      height / 2 + 0.3,

      z

    );

    building.castShadow =

      true;

    building.receiveShadow =

      true;

    scene.add(building);

    const roof =

      new THREE.Mesh(

        new THREE.BoxGeometry(

          width + 0.8,

          0.55,

          depth + 0.8

        ),

        new THREE.MeshStandardMaterial({

          color: 0x484848,

          roughness: 1

        })

      );

    roof.position.set(

      x,

      height + 0.55,

      z

    );

    roof.castShadow = true;

    scene.add(roof);

    addWindows(

      building,

      x,

      z,

      width,

      depth,

      height

    );

  }

  function addWindows(

    building,

    x,

    z,

    width,

    depth,

    height

  ) {

    const windowMaterial =

      new THREE.MeshStandardMaterial({

        color: 0x86aec1,

        emissive: 0x101c23,

        roughness: 0.2

      });

    const floorCount =

      Math.max(

        1,

        Math.floor(

          height / 4

        )

      );

    for (

      let floor = 1;

      floor < floorCount;

      floor++

    ) {

      const y =

        floor * 4;

      for (

        let offset =

          -width / 2 + 3;

        offset <

        width / 2 - 1;

        offset += 4

      ) {

        const windowFront =

          new THREE.Mesh(

            new THREE.PlaneGeometry(

              1.7,

              1.5

            ),

            windowMaterial

          );

        windowFront.position.set(

          x + offset,

          y,

          z + depth / 2 + 0.015

        );

        scene.add(

          windowFront

        );

        const windowBack =

          new THREE.Mesh(

            new THREE.PlaneGeometry(

              1.7,

              1.5

            ),

            windowMaterial

          );

        windowBack.rotation.y =

          Math.PI;

        windowBack.position.set(

          x + offset,

          y,

          z - depth / 2 - 0.015

        );

        scene.add(

          windowBack

        );

      }

    }

  }

  /* Build city blocks */

  for (

    let gx = -350;

    gx <= 350;

    gx += roadSpacing

  ) {

    for (

      let gz = -350;

      gz <= 350;

      gz += roadSpacing

    ) {

      const blockX =

        gx + 50;

      const blockZ =

        gz + 50;

      const downtown =

        Math.abs(blockX) < 190 &&

        Math.abs(blockZ) < 190;

      const height =

        downtown

          ? 25 +

            Math.random() * 70

          : 9 +

            Math.random() * 22;

      const width =

        27 +

        Math.random() * 25;

      const depth =

        27 +

        Math.random() * 25;

      createBuilding(

        blockX,

        blockZ,

        width,

        depth,

        height

      );

    }

  }

  /* =========================

     TREES

  ========================== */

  const trunkMaterial =

    new THREE.MeshStandardMaterial({

      color: 0x68452d

    });

  const leafMaterial =

    new THREE.MeshStandardMaterial({

      color: 0x347746,

      roughness: 1

    });

  function createTree(x, z) {

    const trunk =

      new THREE.Mesh(

        new THREE.CylinderGeometry(

          0.45,

          0.65,

          4,

          8

        ),

        trunkMaterial

      );

    trunk.position.set(

      x,

      2,

      z

    );

    trunk.castShadow = true;

    scene.add(trunk);

    const crown =

      new THREE.Mesh(

        new THREE.SphereGeometry(

          2.4,

          10,

          8

        ),

        leafMaterial

      );

    crown.position.set(

      x,

      5.2,

      z

    );

    crown.castShadow =

      true;

    scene.add(crown);

  }

  for (let i = 0; i < 90; i++) {

    const x =

      THREE.MathUtils.randFloat(

        -430,

        430

      );

    const z =

      THREE.MathUtils.randFloat(

        -430,

        430

      );

    const xRoadDistance =

      Math.abs(

        ((x + 50) % 100) - 50

      );

    const zRoadDistance =

      Math.abs(

        ((z + 50) % 100) - 50

      );

    if (

      xRoadDistance > 20 &&

      zRoadDistance > 20

    ) {

      createTree(x, z);

    }

  }

  /* =========================

     CAR

  ========================== */

  const car =

    new THREE.Group();

  const bluePaint =

    new THREE.MeshStandardMaterial({

      color: 0x315dcb,

      metalness: 0.65,

      roughness: 0.22

    });

  const carBody =

    new THREE.Mesh(

      new THREE.BoxGeometry(

        2.35,

        0.72,

        4.8

      ),

      bluePaint

    );

  carBody.position.y = 1;

  carBody.castShadow = true;

  car.add(carBody);

  const hood =

    new THREE.Mesh(

      new THREE.BoxGeometry(

        2.15,

        0.32,

        1.35

      ),

      bluePaint

    );

  hood.position.set(

    0,

    1.4,

    1.45

  );

  hood.castShadow = true;

  car.add(hood);

  const glassMaterial =

    new THREE.MeshStandardMaterial({

      color: 0x17232d,

      metalness: 0.25,

      roughness: 0.15

    });

  const cabin =

    new THREE.Mesh(

      new THREE.BoxGeometry(

        1.95,

        0.9,

        2.15

      ),

      glassMaterial

    );

  cabin.position.set(

    0,

    1.62,

    -0.25

  );

  cabin.castShadow = true;

  car.add(cabin);

  const wheelMaterial =

    new THREE.MeshStandardMaterial({

      color: 0x111111,

      roughness: 1

    });

  function addWheel(x, z) {

    const wheel =

      new THREE.Mesh(

        new THREE.CylinderGeometry(

          0.46,

          0.46,

          0.38,

          18

        ),

        wheelMaterial

      );

    wheel.rotation.z =

      Math.PI / 2;

    wheel.position.set(

      x,

      0.58,

      z

    );

    wheel.castShadow = true;

    car.add(wheel);

  }

  addWheel(-1.17, 1.45);

  addWheel(1.17, 1.45);

  addWheel(-1.17, -1.45);

  addWheel(1.17, -1.45);

  car.position.set(

    0,

    0.05,

    38

  );

  scene.add(car);

  /* =========================

     CHARACTER

  ========================== */

  const player =

    new THREE.Group();

  const skinMaterial =

    new THREE.MeshStandardMaterial({

      color: 0xa36d4d

    });

  const shirtMaterial =

    new THREE.MeshStandardMaterial({

      color: 0x22272e

    });

  const pantsMaterial =

    new THREE.MeshStandardMaterial({

      color: 0x242731

    });

  const shoesMaterial =

    new THREE.MeshStandardMaterial({

      color: 0x111111

    });

  function bodyPart(

    geometry,

    material,

    x,

    y,

    z

  ) {

    const part =

      new THREE.Mesh(

        geometry,

        material

      );

    part.position.set(

      x,

      y,

      z

    );

    part.castShadow = true;

    player.add(part);

    return part;

  }

  bodyPart(

    new THREE.BoxGeometry(

      1.15,

      1.65,

      0.65

    ),

    shirtMaterial,

    0,

    2.45,

    0

  );

  bodyPart(

    new THREE.SphereGeometry(

      0.46,

      16,

      12

    ),

    skinMaterial,

    0,

    3.68,

    0

  );

  bodyPart(

    new THREE.BoxGeometry(

      0.42,

      1.65,

      0.5

    ),

    pantsMaterial,

    -0.31,

    1.0,

    0

  );

  bodyPart(

    new THREE.BoxGeometry(

      0.42,

      1.65,

      0.5

    ),

    pantsMaterial,

    0.31,

    1.0,

    0

  );

  player.visible = false;

  scene.add(player);

  /* =========================

     CONTROL STATE

  ========================== */

  const controls = {

    left: false,

    right: false,

    gas: false,

    brake: false,

    reverse: false

  };

  let driving = true;

  let speed = 0;

  let heading = 0;

  let playerHeading = 0;

  /* =========================

     TOUCH BINDING

  ========================== */

  function bindHoldButton(

    id,

    property

  ) {

    const button =

      document.getElementById(id);

    const start = event => {

      event.preventDefault();

      controls[property] =

        true;

      button.classList.add(

        "active"

      );

    };

    const stop = event => {

      if (event) {

        event.preventDefault();

      }

      controls[property] =

        false;

      button.classList.remove(

        "active"

      );

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

  bindHoldButton(

    "leftBtn",

    "left"

  );

  bindHoldButton(

    "rightBtn",

    "right"

  );

  bindHoldButton(

    "gasBtn",

    "gas"

  );

  bindHoldButton(

    "brakeBtn",

    "brake"

  );

  bindHoldButton(

    "reverseBtn",

    "reverse"

  );

  /* =========================

     EXIT / ENTER

  ========================== */

  exitBtn.addEventListener(

    "pointerdown",

    event => {

      event.preventDefault();

      if (driving) {

        driving = false;

        speed = 0;

        player.visible = true;

        player.position.copy(

          car.position

        );

        const exitOffset =

          new THREE.Vector3(

            3,

            0,

            0

          );

        exitOffset.applyAxisAngle(

          new THREE.Vector3(

            0,

            1,

            0

          ),

          heading

        );

        player.position.add(

          exitOffset

        );

        playerHeading =

          heading;

        player.rotation.y =

          playerHeading;

        exitBtn.textContent =

          "ENTER";

        modeDisplay.textContent =

          "ON FOOT";

        reverseBtn.style.display =

          "none";

      } else {

        const distance =

          player.position.distanceTo(

            car.position

          );

        if (distance <= 7) {

          driving = true;

          player.visible = false;

          exitBtn.textContent =

            "EXIT";

          modeDisplay.textContent =

            "DRIVE";

          reverseBtn.style.display =

            "block";

        } else {

          showNotice(

            "MOVE CLOSER TO YOUR CAR"

          );

        }

      }

    }

  );

  /* =========================

     CAR PHYSICS

  ========================== */

  function updateCar(dt) {

    const acceleration = 17;

    const reverseAcceleration =

      12;

    const brakingPower = 27;

    const rollingResistance =

      5;

    const maxForwardSpeed =

      37;

    const maxReverseSpeed =

      15;

    /* FORWARD */

    if (

      controls.gas &&

      !controls.reverse

    ) {

      if (speed < 0) {

        speed +=

          brakingPower *

          dt;

      } else {

        speed +=

          acceleration *

          dt;

      }

    }

    /* REVERSE */

    if (controls.reverse) {

      if (speed > 0) {

        speed -=

          brakingPower *

          dt;

      } else {

        speed -=

          reverseAcceleration *

          dt;

      }

    }

    /* BRAKE */

    if (controls.brake) {

      if (speed > 0) {

        speed -=

          brakingPower *

          dt;

        if (speed < 0) {

          speed = 0;

        }

      } else if (speed < 0) {

        speed +=

          brakingPower *

          dt;

        if (speed > 0) {

          speed = 0;

        }

      }

    }

    /* COASTING */

    if (

      !controls.gas &&

      !controls.reverse &&

      !controls.brake

    ) {

      if (speed > 0) {

        speed -=

          rollingResistance *

          dt;

        if (speed < 0) {

          speed = 0;

        }

      } else if (speed < 0) {

        speed +=

          rollingResistance *

          dt;

        if (speed > 0) {

          speed = 0;

        }

      }

    }

    speed =

      THREE.MathUtils.clamp(

        speed,

        -maxReverseSpeed,

        maxForwardSpeed

      );

    /* STEERING */

    const movementAmount =

      Math.min(

        Math.abs(speed) / 8,

        1

      );

    const steeringStrength =

      1.45 *

      movementAmount;

    if (controls.left) {

      heading +=

        steeringStrength *

        dt *

        (speed >= 0 ? 1 : -1);

    }

    if (controls.right) {

      heading -=

        steeringStrength *

        dt *

        (speed >= 0 ? 1 : -1);

    }

    car.rotation.y =

      heading;

    car.position.x +=

      Math.sin(heading) *

      speed *

      dt;

    car.position.z +=

      Math.cos(heading) *

      speed *

      dt;

    /* BODY LEAN */

    let targetLean = 0;

    if (controls.left) {

      targetLean =

        0.045 *

        movementAmount;

    }

    if (controls.right) {

      targetLean =

        -0.045 *

        movementAmount;

    }

    car.rotation.z +=

      (

        targetLean -

        car.rotation.z

      ) *

      Math.min(

        dt * 7,

        1

      );

    const mph =

      Math.round(

        Math.abs(speed) *

        2.237

      );

    speedDisplay.textContent =

      mph + " MPH";

    if (controls.reverse) {

      modeDisplay.textContent =

        "REVERSE";

    } else {

      modeDisplay.textContent =

        "DRIVE";

    }

  }

  /* =========================

     PLAYER MOVEMENT

  ========================== */

  function updatePlayer(dt) {

    const walkSpeed =

      5.2;

    const backwardsSpeed =

      3;

    if (controls.left) {

      playerHeading +=

        2.2 * dt;

    }

    if (controls.right) {

      playerHeading -=

        2.2 * dt;

    }

    player.rotation.y =

      playerHeading;

    let moveAmount = 0;

    if (controls.gas) {

      moveAmount =

        walkSpeed;

    } else if (controls.brake) {

      moveAmount =

        -backwardsSpeed;

    }

    player.position.x +=

      Math.sin(

        playerHeading

      ) *

      moveAmount *

      dt;

    player.position.z +=

      Math.cos(

        playerHeading

      ) *

      moveAmount *

      dt;

    speedDisplay.textContent =

      moveAmount === 0

        ? "ON FOOT"

        : "WALKING";

    modeDisplay.textContent =

      "ON FOOT";

  }

  /* =========================

     CAMERA

  ========================== */

  const desiredCamera =

    new THREE.Vector3();

  const cameraLook =

    new THREE.Vector3();

  function updateCamera(dt) {

    if (driving) {

      const cameraDistance =

        10.5;

      const cameraHeight =

        5.4;

      desiredCamera.set(

        car.position.x -

        Math.sin(heading) *

        cameraDistance,

        car.position.y +

        cameraHeight,

        car.position.z -

        Math.cos(heading) *

        cameraDistance

      );

      camera.position.lerp(

        desiredCamera,

        1 -

        Math.pow(

          0.001,

          dt

        )

      );

      cameraLook.set(

        car.position.x +

        Math.sin(heading) * 6,

        car.position.y + 1.1,

        car.position.z +

        Math.cos(heading) * 6

      );

      camera.lookAt(

        cameraLook

      );

    } else {

      const distance = 6;

      const height = 4.2;

      desiredCamera.set(

        player.position.x -

        Math.sin(

          playerHeading

        ) *

        distance,

        player.position.y +

        height,

        player.position.z -

        Math.cos(

          playerHeading

        ) *

        distance

      );

      camera.position.lerp(

        desiredCamera,

        1 -

        Math.pow(

          0.001,

          dt

        )

      );

      cameraLook.set(

        player.position.x,

        player.position.y + 2,

        player.position.z

      );

      camera.lookAt(

        cameraLook

      );

    }

  }

  /* =========================

     NOTICE

  ========================== */

  function showNotice(message) {

    notice.textContent =

      message;

    notice.style.display =

      "block";

    clearTimeout(

      showNotice.timer

    );

    showNotice.timer =

      setTimeout(() => {

        notice.style.display =

          "none";

      }, 1300);

  }

  /* =========================

     GAME LOOP

  ========================== */

  const clock =

    new THREE.Clock();

  function gameLoop() {

    requestAnimationFrame(

      gameLoop

    );

    const dt =

      Math.min(

        clock.getDelta(),

        0.035

      );

    if (driving) {

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

  /* Starting camera */

  camera.position.set(

    0,

    7,

    27

  );

  loading.style.display =

    "none";

  gameLoop();

  /* =========================

     RESIZE

  ========================== */

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

  /* Stop stuck controls */

  window.addEventListener(

    "blur",

    () => {

      controls.left = false;

      controls.right = false;

      controls.gas = false;

      controls.brake = false;

      controls.reverse = false;

    }

  );

})();
