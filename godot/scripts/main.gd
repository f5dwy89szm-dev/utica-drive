extends Node3D

## Utica Drive Godot foundation. City geometry and original PBR assets are
## loaded into this scene as the researched Utica vertical slice is built.
const UTICA_LAND_AREA_SQ_MI := 16.72
const WORLD_SIZE_METERS := 6800.0

func _ready() -> void:
    get_node("MobileUI/EnterButton").pressed.connect(_on_enter_pressed)

func _on_enter_pressed() -> void:
    var player := get_node_or_null("Player")
    if player and player.has_method("toggle_vehicle"):
        player.toggle_vehicle()
