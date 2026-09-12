using UnityEngine;

namespace UticaDrive.Vehicle
{
    /// Applies URP/Lit-compatible metallic paint values to a vehicle renderer.
    /// Use a URP Lit material and enable Clear Coat in the material inspector.
    public sealed class GlossyVehicleMaterial : MonoBehaviour
    {
        [SerializeField] Renderer targetRenderer;
        [SerializeField, Range(0f, 1f)] float metallic = .82f;
        [SerializeField, Range(0f, 1f)] float smoothness = .88f;
        [SerializeField] Color paintColor = new Color(.05f, .08f, .12f, 1f);

        static readonly int BaseColor = Shader.PropertyToID("_BaseColor");
        static readonly int Metallic = Shader.PropertyToID("_Metallic");
        static readonly int Smoothness = Shader.PropertyToID("_Smoothness");

        void Awake()
        {
            if (!targetRenderer) targetRenderer = GetComponent<Renderer>();
            if (!targetRenderer) return;
            // material creates an instance, preventing one car's paint from
            // changing every vehicle that shares the source asset.
            Material material = targetRenderer.material;
            if (material.HasProperty(BaseColor)) material.SetColor(BaseColor, paintColor);
            if (material.HasProperty(Metallic)) material.SetFloat(Metallic, metallic);
            if (material.HasProperty(Smoothness)) material.SetFloat(Smoothness, smoothness);
        }
    }
}

