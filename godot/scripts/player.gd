extends CharacterBody3D

@export var walk_speed := 4.8
@export var camera_sensitivity := 0.008
var driving := false
var camera_yaw := 0.0
var camera_pitch := -0.18

func _physics_process(delta: float) -> void:
    var input_vec := Input.get_vector("move_left", "move_right", "move_forward", "move_back")
    var direction := Vector3(input_vec.x, 0.0, input_vec.y)
    if direction.length() > 1.0:
        direction = direction.normalized()
    velocity.x = direction.x * walk_speed
    velocity.z = direction.z * walk_speed
    if not is_on_floor():
        velocity.y -= 18.0 * delta
    move_and_slide()

func toggle_vehicle() -> void:
    driving = not driving
