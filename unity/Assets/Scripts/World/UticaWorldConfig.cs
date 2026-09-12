using UnityEngine;

namespace UticaDrive.World
{
    [CreateAssetMenu(menuName = "Utica Drive/World/Utica World Config")]
    public sealed class UticaWorldConfig : ScriptableObject
    {
        // U.S. Census QuickFacts: Utica city land area, 2020 = 16.72 sq mi.
        public const float LandAreaSquareMiles = 16.72f;
        public const float MetersPerUnityUnit = 1f;

        [Tooltip("Approximate streamed-world target; replace with GIS boundary when imported.")]
        public Vector2 worldMeters = new(5200f, 5200f);
        public string[] majorStreets =
        {
            "Genesee Street", "State Street", "Oneida Street", "North Street",
            "Mohawk Street", "Court Street", "Columbia Street", "Lafayette Street",
            "Oriskany Street", "Albany Street", "Bleecker Street", "Burrstone Road",
            "Hopper Street", "Park Avenue", "Broad Street", "Eagle Street",
            "Kellogg Road", "Hobart Street", "Hinsdale Street", "Fox Street",
            "Doherty Avenue", "Lynhurst Avenue", "Martin Luther King Jr. Avenue"
        };
        public string[] landmarks =
        {
            "Utica Union Station", "Stanley Theatre", "M&T Bank Building",
            "John C. Hieber Building", "Doyle Hardware Building",
            "Hurd & Fitzgerald Building", "Utica Daily Press Building",
            "Adirondack Bank Center"
        };
    }
}
