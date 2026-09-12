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
