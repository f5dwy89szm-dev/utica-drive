using UnityEngine;
using UnityEngine.Events;
using UnityEngine.EventSystems;

namespace UticaDrive.InputSystem
{
    public sealed class MobileActionButton : MonoBehaviour, IPointerDownHandler, IPointerUpHandler
    {
        [SerializeField] UnityEvent onPressed;
        [SerializeField] UnityEvent onReleased;
        public bool Held { get; private set; }
        public void OnPointerDown(PointerEventData eventData) { Held = true; onPressed?.Invoke(); }
        public void OnPointerUp(PointerEventData eventData) { Held = false; onReleased?.Invoke(); }
        void OnDisable() { Held = false; }
    }
}
