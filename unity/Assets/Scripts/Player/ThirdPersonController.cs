using UnityEngine;
using UticaDrive.InputSystem;

namespace UticaDrive.Player
{
    [RequireComponent(typeof(CharacterController))]
    public sealed class ThirdPersonController : MonoBehaviour
    {
        [SerializeField] VirtualJoystick moveStick;
        [SerializeField] Transform cameraTransform;
        [SerializeField] float walkSpeed = 4.6f;
        [SerializeField] float runSpeed = 7.2f;
        [SerializeField] float gravity = -22f;
        CharacterController controller;
        float verticalSpeed;

        void Awake() => controller = GetComponent<CharacterController>();
        void Update()
        {
            var stick = moveStick ? moveStick.Value : new Vector2(Input.GetAxisRaw("Horizontal"), Input.GetAxisRaw("Vertical"));
            var forward = Vector3.Scale(cameraTransform.forward, new Vector3(1, 0, 1)).normalized;
            var right = cameraTransform.right; right.y = 0; right.Normalize();
            var move = (forward * stick.y + right * stick.x);
            if (move.sqrMagnitude > 1f) move.Normalize();
            var speed = Input.GetKey(KeyCode.LeftShift) ? runSpeed : walkSpeed;
            controller.Move(move * speed * Time.deltaTime);
            if (controller.isGrounded && verticalSpeed < 0) verticalSpeed = -2f;
            verticalSpeed += gravity * Time.deltaTime;
            controller.Move(Vector3.up * verticalSpeed * Time.deltaTime);
            if (move.sqrMagnitude > .01f) transform.forward = Vector3.Slerp(transform.forward, move, 14f * Time.deltaTime);
        }
    }
}
