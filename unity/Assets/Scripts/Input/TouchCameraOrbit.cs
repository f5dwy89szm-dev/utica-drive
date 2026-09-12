using UnityEngine;
using UnityEngine.EventSystems;

namespace UticaDrive.InputSystem
{
    public sealed class TouchCameraOrbit : MonoBehaviour, IDragHandler, IPointerDownHandler
    {
        [SerializeField] Transform target;
        [SerializeField] float distance = 5.8f;
        [SerializeField] float sensitivity = .12f;
        [SerializeField] float minPitch = -12f;
        [SerializeField] float maxPitch = 48f;
        float yaw;
        float pitch = 15f;

        public void OnPointerDown(PointerEventData eventData) { }
        public void OnDrag(PointerEventData eventData)
        {
            yaw += eventData.delta.x * sensitivity;
            pitch = Mathf.Clamp(pitch - eventData.delta.y * sensitivity, minPitch, maxPitch);
        }
        void LateUpdate()
        {
            if (!target) return;
            var rotation = Quaternion.Euler(pitch, yaw, 0f);
            transform.position = target.position + rotation * new Vector3(0f, 0f, -distance);
            transform.rotation = rotation;
            transform.LookAt(target.position + Vector3.up * 1.2f);
        }
    }
}
