extends Control
class_name CameraLookArea

signal look_delta(delta: Vector2)
var pointer_id := -1
var last_position := Vector2.ZERO

func _ready() -> void:
    mouse_filter = Control.MOUSE_FILTER_STOP

func _gui_input(event: InputEvent) -> void:
    if event is InputEventScreenTouch:
        if event.pressed and pointer_id == -1:
            pointer_id = event.index
            last_position = event.position
        elif not event.pressed and event.index == pointer_id:
            pointer_id = -1
    elif event is InputEventScreenDrag and event.index == pointer_id:
        look_delta.emit(event.position - last_position)
        last_position = event.position
