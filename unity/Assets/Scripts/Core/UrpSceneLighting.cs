using UnityEngine;

namespace UticaDrive.Core
{
    /// Scene-level URP lighting defaults. Assign a Directional Light and an
    /// optional Global Volume in the Inspector; all expensive effects remain
    /// disabled on the battery-saver profile.
    public sealed class UrpSceneLighting : MonoBehaviour
    {
        [SerializeField] Light sun;
        [SerializeField] float dayIntensity = 1.15f;
        [SerializeField] Color dayColor = new Color(1f, .95f, .86f);
        [SerializeField] bool batterySaver;

        void Awake()
        {
            if (!sun) sun = RenderSettings.sun;
            if (!sun) return;
            sun.type = LightType.Directional;
            sun.intensity = batterySaver ? .9f : dayIntensity;
            sun.color = dayColor;
            sun.shadows = batterySaver ? LightShadows.Hard : LightShadows.Soft;
            sun.shadowStrength = .82f;
            sun.shadowBias = .045f;
            sun.shadowNormalBias = .35f;
        }
    }
}

