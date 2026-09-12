using UnityEngine;

namespace UticaDrive.Vehicle
{
    public sealed class VehicleSeatInteractor : MonoBehaviour
    {
        [SerializeField] Transform seat;
        [SerializeField] GameObject playerRoot;
        [SerializeField] Behaviour playerController;
        [SerializeField] SimpleCarController carController;
        [SerializeField] float enterDistance = 3f;
        public bool IsOccupied { get; private set; }

        public void ToggleSeat()
        {
            if (IsOccupied) ExitVehicle();
            else if (playerRoot && Vector3.Distance(playerRoot.transform.position, transform.position) <= enterDistance) EnterVehicle();
        }
        void EnterVehicle()
        {
            IsOccupied = true;
            if (playerController) playerController.enabled = false;
            playerRoot.transform.SetParent(seat, false);
            playerRoot.transform.localPosition = Vector3.zero;
            playerRoot.transform.localRotation = Quaternion.identity;
            playerRoot.SetActive(false);
            if (carController) carController.enabled = true;
        }
        void ExitVehicle()
        {
            IsOccupied = false;
            if (carController) carController.enabled = false;
            playerRoot.SetActive(true);
            playerRoot.transform.SetParent(null, true);
            playerRoot.transform.position = transform.position + transform.right * 2f;
            if (playerController) playerController.enabled = true;
        }
    }
}
