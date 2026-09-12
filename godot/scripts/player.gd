extends CharacterBody3D

@export var walk_speed := 4.8
@export var camera_sensitivity := 0.008
var driving := false
var camera_yaw := 0.0
var camera_pitch := -0.18
var mobile_move := Vector2.ZERO

func _ready() -> void:
    var stick := get_node_or_null("../MobileUI/LeftStick")
    if stick:
        stick.changed.connect(_on_mobile_move)
    var look := get_node_or_null("../MobileUI/RightLook")
    if look:
        look.look_delta.connect(_on_camera_look)

func _on_mobile_move(value: Vector2) -> void:
    mobile_move = value

func _on_camera_look(delta: Vector2) -> void:
    camera_yaw -= delta.x * camera_sensitivity
    camera_pitch = clamp(camera_pitch - delta.y * camera_sensitivity, -0.65, 0.35)
    var rig := get_node_or_null("CameraRig")
    if rig:
        rig.rotation.y = camera_yaw
        rig.rotation.x = camera_pitch

func _physics_process(delta: float) -> void:
    var input_vec := mobile_move
    if input_vec.length() < 0.05:
        input_vec = Input.get_vector("move_left", "move_right", "move_forward", "move_back")
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
