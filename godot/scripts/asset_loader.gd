extends Node

## Lightweight runtime asset hooks for the Utica vertical slice.
## Missing files intentionally fall back to the prototype geometry.
func load_model(path: String, parent: Node3D) -> Node3D:
    if not ResourceLoader.exists(path):
        return null
    var scene := load(path) as PackedScene
    if scene == null:
        return null
    var instance := scene.instantiate() as Node3D
    parent.add_child(instance)
    return instance
