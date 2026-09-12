extends Control
class_name VirtualJoystick

signal changed(value: Vector2)
var pointer_id := -1
var value := Vector2.ZERO
@export var radius := 82.0

func _ready() -> void:
    mouse_filter = Control.MOUSE_FILTER_STOP
    queue_redraw()

func _gui_input(event: InputEvent) -> void:
    if event is InputEventScreenTouch:
        if event.pressed and pointer_id == -1:
            pointer_id = event.index
            _set_value(event.position)
        elif not event.pressed and event.index == pointer_id:
            pointer_id = -1
            value = Vector2.ZERO
            changed.emit(value)
            queue_redraw()
    elif event is InputEventScreenDrag and event.index == pointer_id:
        _set_value(event.position)

func _set_value(position: Vector2) -> void:
    var center := size * 0.5
    value = (position - center).limit_length(radius) / radius
    changed.emit(value)
    queue_redraw()

func _draw() -> void:
    var center := size * 0.5
    draw_circle(center, radius, Color(0.02, 0.04, 0.06, 0.62))
    draw_arc(center, radius, 0.0, TAU, 48, Color(0.75, 0.83, 0.9, 0.65), 2.0)
    draw_circle(center + value * radius, 28.0, Color(0.82, 0.88, 0.92, 0.8))
