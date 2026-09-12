using UnityEngine;
using UnityEngine.Events;

namespace UticaDrive.Player
{
    /// Touch-friendly target/fire controller. Wire Target() and Fire() to
    /// MobileActionButton events in the Inspector.
    public sealed class MobileAutoLockCombat : MonoBehaviour
    {
        [SerializeField] Transform aimOrigin;
        [SerializeField] Transform cameraTransform;
        [SerializeField] float lockRange = 20f;
        [SerializeField, Range(0f, 1f)] float coneDot = .45f;
        [SerializeField] LayerMask enemyLayers;
        [SerializeField] LayerMask hitLayers = ~0;
        [SerializeField] float cameraTurnSpeed = 12f;
        [SerializeField] float fireRange = 60f;
        [SerializeField] float fireCooldown = .18f;
        [SerializeField] UnityEvent onFire;
        [SerializeField] UnityEvent onNoTarget;
        public Transform LockedTarget { get; private set; }
        float nextFireTime;

        void Awake()
        {
            if (!aimOrigin) aimOrigin = transform;
            if (!cameraTransform && Camera.main) cameraTransform = Camera.main.transform;
        }

        void LateUpdate()
        {
            if (!LockedTarget) return;
            Vector3 toTarget = LockedTarget.position - transform.position;
            toTarget.y = 0f;
            if (toTarget.sqrMagnitude > lockRange * lockRange) { LockedTarget = null; return; }
            if (toTarget.sqrMagnitude > .01f)
                transform.rotation = Quaternion.Slerp(transform.rotation, Quaternion.LookRotation(toTarget), cameraTurnSpeed * Time.deltaTime);
        }

        public void Target()
        {
            Collider[] candidates = Physics.OverlapSphere(transform.position, lockRange, enemyLayers, QueryTriggerInteraction.Collide);
            Transform best = null;
            float bestDistance = float.MaxValue;
            Vector3 forward = cameraTransform ? cameraTransform.forward : transform.forward;
            foreach (Collider candidate in candidates)
            {
                Transform enemy = candidate.transform.root;
                Vector3 delta = enemy.position - aimOrigin.position;
                float distance = delta.magnitude;
                if (distance < .01f || Vector3.Dot(forward, delta / distance) < coneDot) continue;
                if (distance < bestDistance && HasLineOfSight(enemy))
                {
                    best = enemy;
                    bestDistance = distance;
                }
            }
            LockedTarget = best;
            if (!LockedTarget) onNoTarget?.Invoke();
        }

        public void ClearTarget() => LockedTarget = null;

        bool HasLineOfSight(Transform enemy)
        {
            if (!Physics.Linecast(aimOrigin.position, enemy.position, out RaycastHit hit, hitLayers, QueryTriggerInteraction.Ignore)) return true;
            return hit.transform.root == enemy;
        }

        public void Fire()
        {
            if (Time.time < nextFireTime || !LockedTarget) return;
            nextFireTime = Time.time + fireCooldown;
            Vector3 direction = (LockedTarget.position - aimOrigin.position).normalized;
            if (Physics.Raycast(aimOrigin.position, direction, out RaycastHit hit, fireRange, hitLayers, QueryTriggerInteraction.Ignore))
            {
                if (hit.collider.transform.root == LockedTarget || hit.collider.CompareTag("Enemy"))
                    hit.collider.SendMessageUpwards("ReactToHit", hit.point, SendMessageOptions.DontRequireReceiver);
            }
            onFire?.Invoke();
        }

        void OnDrawGizmosSelected()
        {
            Gizmos.color = Color.red;
            Gizmos.DrawWireSphere(transform.position, lockRange);
        }
    }
}

