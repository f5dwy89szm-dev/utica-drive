import * as THREE from "three";

const game =

  document.getElementById("game");

const speedDisplay =

  document.getElementById("speed");

const exitButton =

  document.getElementById("exit");

const reverseButton =

  document.getElementById("reverse");

const scene =

  new THREE.Scene();

scene.background =

  new THREE.Color(0x87b7d8);

scene.fog =

  new THREE.Fog(

    0x87b7d8,

    170,

    700

  );

const camera =

  new THREE.PerspectiveCamera(

    65,

    innerWidth / innerHeight,

    0.1,

    1500

  );

const renderer =

  new THREE.WebGLRenderer({

    antialias:true,

    powerPreference:"high-performance"

  });

renderer.setPixelRatio(

  Math.min(

    devicePixelRatio,

    2

  )

);

renderer.setSize(

  innerWidth,

  innerHeight

);

renderer.shadowMap.enabled = true;

game.appendChild(

  renderer.domElement

);

/* LIGHTING */

const sun =

  new THREE.DirectionalLight(

    0xffffff,

    2.4

  );

sun.position.set(

  100,

  150,

  60

);

sun.castShadow = true;

scene.add(sun);

const ambient =

  new THREE.HemisphereLight(

    0xbadfff,

    0x56634d,

    1.7

  );

scene.add(ambient);

/* GROUND */

const ground =

  new THREE.Mesh(

    new THREE.PlaneGeometry(

      1200,

      1200

    ),

    new THREE.MeshStandardMaterial({

      color:0x5d754c,

      roughness:1

    })

  );

ground.rotation.x =

  -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);

/* UTICA STYLE STREET GRID */

const city =

  new THREE.Group();

scene.add(city);

function road(

  x,

  z,

  width,

  length,

  rotation=0

){

  const road =

    new THREE.Mesh(

      new THREE.PlaneGeometry(

        width,

        length

      ),

      new THREE.MeshStandardMaterial({

        color:0x292929,

        roughness:.95

      })

    );

  road.rotation.x =

    -Math.PI / 2;

  road.rotation.z =

    rotation;

  road.position.set(

    x,

    .03,

    z

  );

  city.add(road);

  return road;

}

for(

  let x=-400;

  x<=400;

  x+=80

){

  road(

    x,

    0,

    24,

    900

  );

}

for(

  let z=-400;

  z<=400;

  z+=80

){

  road(

    0,

    z,

    900,

    24,

    Math.PI/2

  );

}

/* LANE MARKINGS */

function line(

  x,

  z,

  width,

  length

){

  const mesh =

    new THREE.Mesh(

      new THREE.PlaneGeometry(

        width,

        length

      ),

      new THREE.MeshBasicMaterial({

        color:0xe7cf62

      })

    );

  mesh.rotation.x =

    -Math.PI / 2;

  mesh.position.set(

    x,

    .05,

    z

  );

  city.add(mesh);

}

for(

  let x=-400;

  x<=400;

  x+=80

){

  for(

    let z=-430;

    z<430;

    z+=18

  ){

    line(

      x,

      z,

      .35,

      8

    );

  }

}

/* BUILDINGS */

const buildingColors = [

  0xb7aea2,

  0xa89b8b,

  0xd0c6ba,

  0x90877d,

  0xb7b7b7,

  0x7c807e

];

function building(

  x,

  z,

  w,

  d,

  h

){

  const color =

    buildingColors[

      Math.floor(

        Math.random() *

        buildingColors.length

      )

    ];

  const mesh =

    new THREE.Mesh(

      new THREE.BoxGeometry(

        w,

        h,

        d

      ),

      new THREE.MeshStandardMaterial({

        color,

        roughness:.8

      })

    );

  mesh.position.set(

    x,

    h/2,

    z

  );

  mesh.castShadow = true;

  mesh.receiveShadow = true;

  city.add(mesh);

  /* rooftop */

  if(

    Math.random() > .6

  ){

    const roof =

      new THREE.Mesh(

        new THREE.BoxGeometry(

          w*.35,

          2,

          d*.35

        ),

        new THREE.MeshStandardMaterial({

          color:0x555555

        })

      );

    roof.position.set(

      x,

      h+1,

      z

    );

    city.add(roof);

  }

}

for(

  let gx=-360;

  gx<=360;

  gx+=80

){

  for(

    let gz=-360;

    gz<=360;

    gz+=80

  ){

    const offsets = [

      [-25,-25],

      [25,-25],

      [-25,25],

      [25,25]

    ];

    offsets.forEach(

      ([ox,oz])=>{

        if(

          Math.random()>.15

        ){

          building(

            gx+ox,

            gz+oz,

            20+

            Math.random()*17,

            20+

            Math.random()*17,

            12+

            Math.random()*55

          );

        }

      }

    );

  }

}

/* LANDMARK STYLE BUILDINGS */

function landmark(

  x,

  z,

  w,

  h,

  d,

  color

){

  const mesh =

    new THREE.Mesh(

      new THREE.BoxGeometry(

        w,

        h,

        d

      ),

      new THREE.MeshStandardMaterial({

        color

      })

    );

  mesh.position.set(

    x,

    h/2,

    z

  );

  mesh.castShadow = true;

  scene.add(mesh);

}

landmark(

  40,

  -110,

  70,

  50,

  45,

  0x9d927e

);

landmark(

  -115,

  85,

  55,

  65,

  50,

  0x82776e

);

landmark(

  125,

  120,

  90,

  25,

  55,

  0xa3a09a

);

/* PLAYER CAR */

const car =

  new THREE.Group();

scene.add(car);

const carBody =

  new THREE.Mesh(

    new THREE.BoxGeometry(

      2.2,

      .7,

      4.7

    ),

    new THREE.MeshStandardMaterial({

      color:0x174fbd,

      metalness:.55,

      roughness:.28

    })

  );

carBody.position.y =

  .85;

carBody.castShadow = true;

car.add(carBody);

const carRoof =

  new THREE.Mesh(

    new THREE.BoxGeometry(

      1.8,

      .65,

      2.1

    ),

    new THREE.MeshStandardMaterial({

      color:0x111820,

      metalness:.3,

      roughness:.2

    })

  );

carRoof.position.set(

  0,

  1.45,

  -.2

);

car.add(carRoof);

function wheel(

  x,

  z

){

  const wheel =

    new THREE.Mesh(

      new THREE.CylinderGeometry(

        .42,

        .42,

        .38,

        16

      ),

      new THREE.MeshStandardMaterial({

        color:0x111111

      })

    );

  wheel.rotation.z =

    Math.PI/2;

  wheel.position.set(

    x,

    .45,

    z

  );

  car.add(wheel);

}

wheel(

  -1.12,

  1.45

);

wheel(

  1.12,

  1.45

);

wheel(

  -1.12,

  -1.45

);

wheel(

  1.12,

  -1.45

);

car.position.set(

  0,

  0,

  25

);

/* HUMAN PLAYER */

const person =

  new THREE.Group();

scene.add(person);

const torso =

  new THREE.Mesh(

    new THREE.CapsuleGeometry(

      .36,

      1,

      4,

      8

    ),

    new THREE.MeshStandardMaterial({

      color:0x242424

    })

  );

torso.position.y =

  1.25;

person.add(torso);

const head =

  new THREE.Mesh(

    new THREE.SphereGeometry(

      .34,

      16,

      16

    ),

    new THREE.MeshStandardMaterial({

      color:0xb57d5d

    })

  );

head.position.y =

  2.25;

person.add(head);

person.visible = false;

/* CONTROLS */

const input = {

  gas:false,

  brake:false,

  left:false,

  right:false

};

function touchButton(

  id,

  property

){

  const button =

    document.getElementById(id);

  const down =

    e=>{

      e.preventDefault();

      input[property] = true;

    };

  const up =

    e=>{

      e.preventDefault();

      input[property] = false;

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

touchButton(

  "gas",

  "gas"

);

touchButton(

  "brake",

  "brake"

);

touchButton(

  "left",

  "left"

);

touchButton(

  "right",

  "right"

);

let driving = true;

let reverse = false;

let speed = 0;

let steering = 0;

reverseButton.addEventListener(

  "click",

  ()=>{

    reverse =

      !reverse;

    reverseButton.textContent =

      reverse

      ? "DRIVE"

      : "REVERSE";

  }

);

exitButton.addEventListener(

  "click",

  ()=>{

    driving =

      !driving;

    if(

      driving

    ){

      person.visible =

        false;

      car.visible =

        true;

      exitButton.textContent =

        "EXIT";

    }

    else{

      speed = 0;

      person.position.copy(

        car.position

      );

      person.position.x +=

        2;

      person.rotation.y =

        car.rotation.y;

      person.visible =

        true;

      car.visible =

        true;

      exitButton.textContent =

        "ENTER";

    }

  }

);

/* GAME LOOP */

const clock =

  new THREE.Clock();

const cameraTarget =

  new THREE.Vector3();

const desiredCamera =

  new THREE.Vector3();

function updateDriving(

  dt

){

  const direction =

    reverse ? -1 : 1;

  if(

    input.gas

  ){

    speed +=

      22 *

      dt *

      direction;

  }

  if(

    input.brake

  ){

    if(

      Math.abs(speed)>.4

    ){

      speed *=

        Math.pow(

          .03,

          dt

        );

    }

    else{

      speed = 0;

    }

  }

  if(

    !input.gas

  ){

    speed *=

      Math.pow(

        .45,

        dt

      );

  }

  speed =

    THREE.MathUtils.clamp(

      speed,

      -12,

      34

    );

  let targetSteering =

    0;

  if(

    input.left

  )

    targetSteering = .55;

  if(

    input.right

  )

    targetSteering = -.55;

  steering =

    THREE.MathUtils.lerp(

      steering,

      targetSteering,

      7*dt

    );

  if(

    Math.abs(speed)>.2

  ){

    car.rotation.y +=

      steering *

      speed *

      .035 *

      dt;

  }

  const forward =

    new THREE.Vector3(

      Math.sin(

        car.rotation.y

      ),

      0,

      Math.cos(

        car.rotation.y

      )

    );

  car.position.addScaledVector(

    forward,

    speed*dt

  );

  const cameraDistance =

    10 +

    Math.abs(speed)*.11;

  desiredCamera.set(

    car.position.x

      -

    forward.x *

    cameraDistance,

    5.2,

    car.position.z

      -

    forward.z *

    cameraDistance

  );

  camera.position.lerp(

    desiredCamera,

    1-

    Math.pow(

      .001,

      dt

    )

  );

  cameraTarget.copy(

    car.position

  );

  cameraTarget.y =

    1.2;

  camera.lookAt(

    cameraTarget

  );

  speedDisplay.textContent =

    Math.round(

      Math.abs(speed)*2.237

    )

    +" MPH";

}

function updateWalking(

  dt

){

  let walkSpeed =

    0;

  if(

    input.gas

  )

    walkSpeed = 5;

  if(

    input.brake

  )

    walkSpeed = -2.5;

  if(

    input.left

  )

    person.rotation.y +=

      2.4*dt;

  if(

    input.right

  )

    person.rotation.y -=

      2.4*dt;

  const forward =

    new THREE.Vector3(

      Math.sin(

        person.rotation.y

      ),

      0,

      Math.cos(

        person.rotation.y

      )

    );

  person.position.addScaledVector(

    forward,

    walkSpeed*dt

  );

  desiredCamera.set(

    person.position.x

      -

    forward.x*6,

    person.position.y+3.5,

    person.position.z

      -

    forward.z*6

  );

  camera.position.lerp(

    desiredCamera,

    1-

    Math.pow(

      .001,

      dt

    )

  );

  cameraTarget.copy(

    person.position

  );

  cameraTarget.y +=

    1.4;

  camera.lookAt(

    cameraTarget

  );

  speedDisplay.textContent =

    "ON FOOT";

}

function animate(){

  requestAnimationFrame(

    animate

  );

  const dt =

    Math.min(

      clock.getDelta(),

      .05

    );

  if(

    driving

  ){

    updateDriving(

      dt

    );

  }

  else{

    updateWalking(

      dt

    );

  }

  renderer.render(

    scene,

    camera

  );

}

animate();

/* WINDOW RESIZE */

addEventListener(

  "resize",

  ()=>{

    camera.aspect =

      innerWidth /

      innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(

      innerWidth,

      innerHeight

    );

  }

);
