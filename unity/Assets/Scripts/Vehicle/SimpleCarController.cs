using UnityEngine;
using UticaDrive.InputSystem;

namespace UticaDrive.Vehicle
{
    [RequireComponent(typeof(Rigidbody))]
    public sealed class SimpleCarController : MonoBehaviour
    {
        [SerializeField] WheelCollider[] driveWheels;
        [SerializeField] WheelCollider[] steerWheels;
        [SerializeField] VirtualJoystick steeringStick;
        [SerializeField] float maxMotorTorque = 1800f;
        [SerializeField] float maxSteerAngle = 30f;
        [SerializeField] float maxBrakeTorque = 2600f;
        [SerializeField] float topSpeedKph = 190f;
        Rigidbody body;

        void Awake()
        {
            body = GetComponent<Rigidbody>();
            body.mass = 1500f;
            body.centerOfMass = new Vector3(0, -.35f, 0);
        }
        void FixedUpdate()
        {
            var steer = steeringStick ? steeringStick.Value.x : Input.GetAxis("Horizontal");
            var throttle = Mathf.Clamp01(Input.GetAxis("Vertical"));
            var brake = Mathf.Clamp01(-Input.GetAxis("Vertical"));
            var speed = body.linearVelocity.magnitude * 3.6f;
            var torque = speed < topSpeedKph ? throttle * maxMotorTorque : 0f;
            foreach (var wheel in driveWheels) wheel.motorTorque = torque;
            foreach (var wheel in steerWheels) wheel.steerAngle = steer * maxSteerAngle;
            foreach (var wheel in driveWheels) wheel.brakeTorque = brake * maxBrakeTorque;
        }
    }
}
