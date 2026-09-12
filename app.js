"use strict";

// ============================================================
// UTICA DRIVE - REAL OPENSTREETMAP VERSION
// ============================================================

if (typeof THREE === "undefined") {
  alert("Three.js did not load.");
  throw new Error("Three.js missing");
}

// ============================================================
// GAME SETUP
// ============================================================

const container = document.getElementById("game");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fc4eb);
scene.fog = new THREE.Fog(0xa9cbe0, 300, 1400);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  2500
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio || 1, 1.5)
);

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

container.appendChild(renderer.domElement);

// ============================================================
// LIGHTING
// ============================================================

scene.add(
  new THREE.HemisphereLight(
    0xd7efff,
    0x526747,
    1.3
  )
);

const sun = new THREE.DirectionalLight(
  0xfff4d6,
  1.2
);

sun.position.set(-150, 260, 100);
sun.castShadow = true;

sun.shadow.mapSize.width = 1024;
sun.shadow.mapSize.height = 1024;

scene.add(sun);

// ============================================================
// UTICA MAP CENTER
// ============================================================

// Downtown / central Utica reference
const ORIGIN_LAT = 43.1009;
const ORIGIN_LON = -75.2327;

const METERS_PER_LAT = 111320;

const METERS_PER_LON =
  111320 *
  Math.cos(
    ORIGIN_LAT *
    Math.PI / 180
  );

// OpenStreetMap tiles loaded around the player
const TILE_SIZE_DEGREES = 0.010;

// Approximate city limits used to stop useless requests
const CITY_BOUNDS = {
  south: 43.045,
  north: 43.165,
  west: -75.315,
  east: -75.145
};

// ============================================================
// WORLD
// ============================================================

const mapWorld = new THREE.Group();
scene.add(mapWorld);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(
    5000,
    5000
  ),
  new THREE.MeshStandardMaterial({
    color: 0x63844e,
    roughness: 1
  })
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.08;
ground.receiveShadow = true;

scene.add(ground);

// ============================================================
// COORDINATE CONVERSION
// ============================================================

function geoToWorld(lat, lon) {

  const x =
    (lon - ORIGIN_LON) *
    METERS_PER_LON;

  const z =
    -(lat - ORIGIN_LAT) *
    METERS_PER_LAT;

  return new THREE.Vector3(
    x,
    0,
    z
  );
}

function worldToGeo(x, z) {

  return {
    lat:
      ORIGIN_LAT -
      z / METERS_PER_LAT,

    lon:
      ORIGIN_LON +
      x / METERS_PER_LON
  };
}

// ============================================================
// MATERIALS
// ============================================================

const roadMaterials = {};

function roadMaterial(type) {

  if (roadMaterials[type]) {
    return roadMaterials[type];
  }

  let color = 0x55585b;

  if (
    type === "motorway" ||
    type === "trunk"
  ) {
    color = 0x4b4d50;
  }

  if (
    type === "primary" ||
    type === "secondary"
  ) {
    color = 0x484b4e;
  }

  if (
    type === "residential"
  ) {
    color = 0x5e6062;
  }

  roadMaterials[type] =
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.95
    });

  return roadMaterials[type];
}

const buildingMaterials = [
  new THREE.MeshStandardMaterial({
    color: 0xa87d62,
    roughness: 0.9
  }),

  new THREE.MeshStandardMaterial({
    color: 0xb29b83,
    roughness: 0.9
  }),

  new THREE.MeshStandardMaterial({
    color: 0x978c80,
    roughness: 0.9
  }),

  new THREE.MeshStandardMaterial({
    color: 0xb76e50,
    roughness: 0.9
  }),

  new THREE.MeshStandardMaterial({
    color: 0x8b9294,
    roughness: 0.9
  })
];

// ============================================================
// ROAD WIDTH
// ============================================================

function getRoadWidth(type) {

  switch (type) {

    case "motorway":
      return 12;

    case "trunk":
      return 11;

    case "primary":
      return 10;

    case "secondary":
      return 9;

    case "tertiary":
      return 8;

    case "residential":
      return 6.5;

    case "service":
      return 4;

    case "living_street":
      return 5;

    default:
      return 5.5;
  }
}

// ============================================================
// ROAD GEOMETRY
// ============================================================

function createRoadSegment(
  a,
  b,
  width,
  type
) {

  const dx = b.x - a.x;
  const dz = b.z - a.z;

  const length =
    Math.sqrt(
      dx * dx +
      dz * dz
    );

  if (length < 0.4) {
    return;
  }

  const road =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        width,
        length
      ),
      roadMaterial(type)
    );

  const centerX =
    (a.x + b.x) / 2;

  const centerZ =
    (a.z + b.z) / 2;

  road.position.set(
    centerX,
    0.015,
    centerZ
  );

  road.rotation.x =
    -Math.PI / 2;

  road.rotation.z =
    Math.atan2(
      dz,
      dx
    ) -
    Math.PI / 2;

  road.receiveShadow = true;

  mapWorld.add(road);

  return road;
}

// ============================================================
// BUILDINGS
// ============================================================

function getBuildingHeight(tags) {

  if (tags.height) {

    const value =
      parseFloat(tags.height);

    if (!isNaN(value)) {
      return Math.min(
        Math.max(value, 2.5),
        100
      );
    }
  }

  if (tags["building:levels"]) {

    const levels =
      parseFloat(
        tags["building:levels"]
      );

    if (!isNaN(levels)) {

      return Math.min(
        Math.max(
          levels * 3.1,
          3
        ),
        90
      );
    }
  }

  switch (tags.building) {

    case "house":
    case "detached":
    case "residential":
      return 7.5;

    case "garage":
    case "garages":
      return 3.2;

    case "commercial":
    case "retail":
      return 8;

    case "industrial":
      return 9;

    case "church":
      return 15;

    default:
      return 7;
  }
}

function createBuilding(
  geometry,
  tags
) {

  if (
    !geometry ||
    geometry.length < 3
  ) {
    return;
  }

  const points =
    geometry.map(
      point =>
        geoToWorld(
          point.lat,
          point.lon
        )
    );

  const shape =
    new THREE.Shape();

  shape.moveTo(
    points[0].x,
    -points[0].z
  );

  for (
    let i = 1;
    i < points.length;
    i++
  ) {

    shape.lineTo(
      points[i].x,
      -points[i].z
    );
  }

  const height =
    getBuildingHeight(tags);

  let hash = 0;

  if (tags.name) {

    for (
      let i = 0;
      i < tags.name.length;
      i++
    ) {

      hash +=
        tags.name.charCodeAt(i);
    }
  }

  const mat =
    buildingMaterials[
      Math.abs(hash) %
      buildingMaterials.length
    ];

  const geometry3d =
    new THREE.ExtrudeGeometry(
      shape,
      {
        depth: height,
        bevelEnabled: false
      }
    );

  geometry3d.rotateX(
    -Math.PI / 2
  );

  const mesh =
    new THREE.Mesh(
      geometry3d,
      mat
    );

  mesh.castShadow = false;
  mesh.receiveShadow = true;

  mapWorld.add(mesh);

  if (
    tags.name &&
    height > 5
  ) {

    const center =
      getCenter(points);

    createLabel(
      tags.name,
      center.x,
      height + 2,
      center.z,
      6
    );
  }
}

// ============================================================
// LABELS
// ============================================================

const labels = [];

function createLabel(
  text,
  x,
  y,
  z,
  scale = 5
) {

  if (!text) {
    return;
  }

  if (text.length > 38) {
    return;
  }

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width = 512;
  canvas.height = 96;

  const ctx =
    canvas.getContext("2d");

  ctx.fillStyle =
    "rgba(0,0,0,0.65)";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.font =
    "bold 38px Arial";

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "middle";

  ctx.fillStyle =
    "#ffffff";

  ctx.fillText(
    text,
    256,
    48
  );

  const texture =
    new THREE.CanvasTexture(
      canvas
    );

  const sprite =
    new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false
      })
    );

  sprite.position.set(
    x,
    y,
    z
  );

  sprite.scale.set(
    scale * 3.8,
    scale * 0.7,
    1
  );

  sprite.userData.labelText =
    text;

  scene.add(sprite);

  labels.push(sprite);

  return sprite;
}

function getCenter(points) {

  let x = 0;
  let z = 0;

  points.forEach(p => {
    x += p.x;
    z += p.z;
  });

  return {
    x: x / points.length,
    z: z / points.length
  };
}

// ============================================================
// MAP DATA
// ============================================================

const loadedTiles =
  new Set();

const loadingTiles =
  new Set();

let mapStatus =
  "Loading Utica...";

const namedRoads = [];

function tileKey(latIndex, lonIndex) {

  return (
    latIndex +
    "_" +
    lonIndex
  );
}

function buildOverpassQuery(
  south,
  west,
  north,
  east
) {

  const bbox =
    `${south},${west},${north},${east}`;

  return `
[out:json][timeout:25];
(
  way["highway"](${bbox});
  way["building"](${bbox});
  node["amenity"]["name"](${bbox});
  node["shop"]["name"](${bbox});
  node["tourism"]["name"](${bbox});
  node["historic"]["name"](${bbox});
  node["leisure"]["name"](${bbox});
);
out tags geom;
`;
}

async function loadMapTile(
  latIndex,
  lonIndex
) {

  const key =
    tileKey(
      latIndex,
      lonIndex
    );

  if (
    loadedTiles.has(key) ||
    loadingTiles.has(key)
  ) {
    return;
  }

  const south =
    latIndex *
    TILE_SIZE_DEGREES;

  const north =
    south +
    TILE_SIZE_DEGREES;

  const west =
    lonIndex *
    TILE_SIZE_DEGREES;

  const east =
    west +
    TILE_SIZE_DEGREES;

  if (
    north < CITY_BOUNDS.south ||
    south > CITY_BOUNDS.north ||
    east < CITY_BOUNDS.west ||
    west > CITY_BOUNDS.east
  ) {

    loadedTiles.add(key);
    return;
  }

  loadingTiles.add(key);

  try {

    const query =
      buildOverpassQuery(
        south,
        west,
        north,
        east
      );

    const url =
      "https://overpass-api.de/api/interpreter";

    const response =
      await fetch(
        url,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded"
          },

          body:
            "data=" +
            encodeURIComponent(query)
        }
      );

    if (!response.ok) {
      throw new Error(
        "Map server error"
      );
    }

    const data =
      await response.json();

    processMapData(data);

    loadedTiles.add(key);

    mapStatus =
      "UTICA, NEW YORK";
  }

  catch (error) {

    console.error(
      "Utica map load error:",
      error
    );

    mapStatus =
      "MAP RETRYING...";
  }

  finally {

    loadingTiles.delete(key);
  }
}

// ============================================================
// PROCESS OSM
// ============================================================

function processMapData(data) {

  if (
    !data ||
    !data.elements
  ) {
    return;
  }

  data.elements.forEach(
    element => {

      const tags =
        element.tags || {};

      // ROADS

      if (
        element.type === "way" &&
        tags.highway &&
        element.geometry &&
        element.geometry.length >= 2
      ) {

        const roadPoints =
          element.geometry.map(
            p =>
              geoToWorld(
                p.lat,
                p.lon
              )
          );

        const width =
          getRoadWidth(
            tags.highway
          );

        for (
          let i = 0;
          i <
          roadPoints.length - 1;
          i++
        ) {

          createRoadSegment(
            roadPoints[i],
            roadPoints[i + 1],
            width,
            tags.highway
          );
        }

        if (tags.name) {

          const center =
            roadPoints[
              Math.floor(
                roadPoints.length / 2
              )
            ];

          namedRoads.push({
            name: tags.name,
            points: roadPoints
          });

          // Only put floating labels
          // on more important roads.

          if (
            [
              "primary",
              "secondary",
              "tertiary"
            ].includes(
              tags.highway
            )
          ) {

            createLabel(
              tags.name,
              center.x,
              1.7,
              center.z,
              4
            );
          }
        }

        return;
      }

      // BUILDINGS

      if (
        element.type === "way" &&
        tags.building &&
        element.geometry
      ) {

        createBuilding(
          element.geometry,
          tags
        );

        return;
      }

      // NAMED PLACES

      if (
        element.type === "node" &&
        tags.name &&
        element.lat &&
        element.lon
      ) {

        const pos =
          geoToWorld(
            element.lat,
            element.lon
          );

        createLabel(
          tags.name,
          pos.x,
          3,
          pos.z,
          4
        );
      }

    }
  );
}

// ============================================================
// LOAD MAP AROUND PLAYER
// ============================================================

function requestNearbyTiles() {

  const target =
    driving
      ? car.position
      : player.position;

  const geo =
    worldToGeo(
      target.x,
      target.z
    );

  const centerLat =
    Math.floor(
      geo.lat /
      TILE_SIZE_DEGREES
    );

  const centerLon =
    Math.floor(
      geo.lon /
      TILE_SIZE_DEGREES
    );

  // 3 x 3 section around player
  for (
    let y = -1;
    y <= 1;
    y++
  ) {

    for (
      let x = -1;
      x <= 1;
      x++
    ) {

      loadMapTile(
        centerLat + y,
        centerLon + x
      );
    }
  }
}

// ============================================================
// PLAYER
// ============================================================

const player =
  new THREE.Group();

scene.add(player);

const skin =
  new THREE.MeshStandardMaterial({
    color: 0xc58a65
  });

const shirt =
  new THREE.MeshStandardMaterial({
    color: 0x263f70
  });

const pants =
  new THREE.MeshStandardMaterial({
    color: 0x20242b
  });

const torso =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      0.55,
      0.72,
      0.28
    ),
    shirt
  );

torso.position.y = 1.15;
player.add(torso);

const head =
  new THREE.Mesh(
    new THREE.SphereGeometry(
      0.22,
      12,
      10
    ),
    skin
  );

head.position.y = 1.72;
player.add(head);

const leg1 =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      0.19,
      0.78,
      0.22
    ),
    pants
  );

leg1.position.set(
  -0.14,
  0.39,
  0
);

player.add(leg1);

const leg2 =
  leg1.clone();

leg2.position.x = 0.14;
player.add(leg2);

player.position.set(
  0,
  0,
  20
);

// ============================================================
// CAR
// ============================================================

const car =
  new THREE.Group();

scene.add(car);

const bodyMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x214fa5,
    metalness: 0.25,
    roughness: 0.4
  });

const carBody =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      1.85,
      0.55,
      4.65
    ),
    bodyMaterial
  );

carBody.position.y = 0.65;
carBody.castShadow = true;

car.add(carBody);

const cabin =
  new THREE.Mesh(
    new THREE.BoxGeometry(
      1.55,
      0.62,
      2.15
    ),
    new THREE.MeshStandardMaterial({
      color: 0x152b4a,
      metalness: 0.2,
      roughness: 0.35
    })
  );

cabin.position.set(
  0,
  1.15,
  -0.15
);

car.add(cabin);

function addWheel(x, z) {

  const wheel =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.36,
        0.36,
        0.28,
        14
      ),
      new THREE.MeshStandardMaterial({
        color: 0x151515
      })
    );

  wheel.rotation.z =
    Math.PI / 2;

  wheel.position.set(
    x,
    0.38,
    z
  );

  car.add(wheel);
}

addWheel(-0.96, 1.4);
addWheel(0.96, 1.4);
addWheel(-0.96, -1.4);
addWheel(0.96, -1.4);

car.position.set(
  3,
  0,
  8
);

// ============================================================
// CONTROLS
// ============================================================

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

const keys = {};

let driving = false;

let speed = 0;
let steering = 0;

const MAX_SPEED = 0.60;
const MAX_REVERSE = -0.25;

const ACCELERATION = 0.008;
const FRICTION = 0.0045;
const BRAKE_FORCE = 0.016;

function holdButton(
  id,
  property
) {

  const element =
    document.getElementById(id);

  if (!element) {
    return;
  }

  function down(event) {

    event.preventDefault();
    input[property] = true;
  }

  function up(event) {

    if (event) {
      event.preventDefault();
    }

    input[property] = false;
  }

  element.addEventListener(
    "touchstart",
    down,
    { passive: false }
  );

  element.addEventListener(
    "touchend",
    up,
    { passive: false }
  );

  element.addEventListener(
    "touchcancel",
    up,
    { passive: false }
  );

  element.addEventListener(
    "mousedown",
    down
  );

  element.addEventListener(
    "mouseup",
    up
  );

  element.addEventListener(
    "mouseleave",
    up
  );
}

holdButton("walkUp", "forward");
holdButton("walkDown", "backward");
holdButton("walkLeft", "left");
holdButton("walkRight", "right");

holdButton("gasButton", "gas");
holdButton("brakeButton", "brake");
holdButton("reverseButton", "reverse");

holdButton(
  "steerLeft",
  "steerLeft"
);

holdButton(
  "steerRight",
  "steerRight"
);

window.addEventListener(
  "keydown",
  e => {

    keys[e.code] = true;

    if (e.code === "KeyE") {
      toggleVehicle();
    }
  }
);

window.addEventListener(
  "keyup",
  e => {
    keys[e.code] = false;
  }
);

// ============================================================
// UI
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
 
