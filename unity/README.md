# Utica Drive — Unity mobile foundation

This is a clean Unity/C# project foundation for a low-poly/realistic mobile
open-world action game. It is separate from the legacy browser prototype.

## Roadmap

1. Core slice: third-person movement, camera orbit, touch controls, one drivable
   vehicle, save/load, and a streamed test block.
2. Driving: WheelCollider tuning, traction/braking, enter/exit transitions,
   traffic lanes, and mobile camera presets.
3. Utica world: licensed GIS road/building data, original landmark meshes,
   PBR materials, LOD groups, occlusion culling, and additive scene streaming.
4. Action systems: missions, interaction prompts, pedestrians, police heat,
   inventory, and original weapons/animations.
5. Mobile polish: 30/60 FPS profiles, baked lighting, texture compression,
   object pooling, device QA, accessibility, and iPhone export.

## Folder structure

```
Assets/
  Art/{Characters,Vehicles,World,Materials,UI}
  Audio/{Music,SFX,Voice}
  Data/{Vehicles,Items,Missions,Districts}
  Scenes/{Bootstrap,Utica,Interiors,Test}
  Scripts/{Core,Player,Vehicle,AI,Input,UI,World,Save}
  Prefabs/{Characters,Vehicles,World,UI}
  Settings/{Input,Quality,Addressables}
```

The starter scripts in `Assets/Scripts` are deliberately dependency-light so
they can be dropped into a new Unity 6 project and wired in the Inspector.
Unity's WheelCollider system is used for ground vehicles, with a 1,500 kg
vehicle baseline and tunable suspension/friction curves.

## URP mobile visual setup

Create a URP Mobile Renderer and assign it to the URP Pipeline Asset. Use one
Directional Light as the sun, enable Soft Shadows on the non-battery profile,
and bake static buildings/roads where possible. Add `MobileQualityBootstrap` to
the bootstrap scene and `UrpSceneLighting` beside the sun. The scripts select
30 FPS/shorter shadows for battery saver and 60 FPS/soft two-cascade shadows for
capable phones. Keep HDR, opaque texture, depth texture, and post-processing
off until profiling proves they are affordable.

For cars, use a URP/Lit material with Metallic about 0.8, Smoothness about 0.9,
and Clear Coat enabled at low intensity. Add `GlossyVehicleMaterial` to the
body renderer; use separate low-metallic materials for glass, rubber, and
unpainted trim. Prefer baked reflection probes in each streamed district over
realtime probes.

