using UnityEngine;
using UnityEngine.EventSystems;

namespace UticaDrive.InputSystem
{
    public sealed class VirtualJoystick : MonoBehaviour, IPointerDownHandler, IPointerUpHandler, IDragHandler
    {
        [SerializeField] RectTransform handle;
        [SerializeField] float radius = 80f;
        public Vector2 Value { get; private set; }

        public void OnPointerDown(PointerEventData eventData) => OnDrag(eventData);
        public void OnDrag(PointerEventData eventData)
        {
            var center = (Vector2)transform.position;
            var delta = eventData.position - center;
            Value = Vector2.ClampMagnitude(delta / radius, 1f);
            if (handle) handle.position = center + Value * radius;
        }
        public void OnPointerUp(PointerEventData eventData)
        {
            Value = Vector2.zero;
            if (handle) handle.position = transform.position;
        }
    }
}
