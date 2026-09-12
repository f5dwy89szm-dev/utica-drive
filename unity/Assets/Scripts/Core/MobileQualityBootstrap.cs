using UnityEngine;

namespace UticaDrive.Core
{
    public sealed class MobileQualityBootstrap : MonoBehaviour
    {
        [SerializeField] int targetFps = 60;
        [SerializeField] bool batterySaver;
        void Awake()
        {
            Application.targetFrameRate = batterySaver ? 30 : targetFps;
            QualitySettings.vSyncCount = 0;
            QualitySettings.anisotropicFiltering = AnisotropicFiltering.Enable;
            QualitySettings.shadowDistance = batterySaver ? 35f : 80f;
            QualitySettings.lodBias = batterySaver ? .65f : 1f;
        }
    }
}
