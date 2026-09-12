using UnityEngine;

namespace UticaDrive.Core
{
    public sealed class MobileQualityBootstrap : MonoBehaviour
    {
        [SerializeField] int targetFps = 60;
        [SerializeField] bool batterySaver;
        [SerializeField] bool enableSoftShadows = true;
        void Awake()
        {
            Application.targetFrameRate = batterySaver ? 30 : targetFps;
            QualitySettings.vSyncCount = 0;
            QualitySettings.anisotropicFiltering = AnisotropicFiltering.Enable;
            QualitySettings.shadowDistance = batterySaver ? 35f : 80f;
            QualitySettings.lodBias = batterySaver ? .65f : 1f;
            QualitySettings.softParticles = true;
            QualitySettings.realtimeReflectionProbes = false;
            QualitySettings.shadowProjection = ShadowProjection.CloseFit;
            QualitySettings.shadowCascades = batterySaver ? 0 : 2;
            QualitySettings.shadowResolution = batterySaver ? ShadowResolution.Low : ShadowResolution.Medium;
            QualitySettings.shadowDistance = batterySaver ? 28f : 65f;
            if (enableSoftShadows && !batterySaver)
                QualitySettings.globalTextureMipmapLimit = 0;
        }
    }
}

