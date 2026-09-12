#if UNITY_EDITOR
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace UticaDrive.Editor
{
    [InitializeOnLoad]
    public static class UticaProjectSetup
    {
        const string ScenePath = "Assets/Scenes/Bootstrap.unity";

        static UticaProjectSetup()
        {
            EditorApplication.delayCall += EnsureProjectReady;
        }

        [MenuItem("Utica Drive/Setup Starter Project")]
        public static void EnsureProjectReady()
        {
            EnsureFolder("Assets/Scenes");
            EnsureFolder("Assets/Art");
            EnsureFolder("Assets/Audio");
            EnsureFolder("Assets/Data");
            EnsureFolder("Assets/Prefabs");
            EnsureFolder("Assets/Settings");

            if (!File.Exists(ScenePath))
            {
                var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
                scene.name = "Bootstrap";

                var root = new GameObject("Utica Drive");
                root.AddComponent<UticaDrive.Core.MobileQualityBootstrap>();

                EditorSceneManager.SaveScene(scene, ScenePath);
                Debug.Log("Utica Drive: created the Bootstrap scene.");
            }

            EditorBuildSettings.scenes = new[]
            {
                new EditorBuildSettingsScene(ScenePath, true)
            };

            PlayerSettings.productName = "Utica Drive";
            PlayerSettings.companyName = "Utica Drive Studio";
            PlayerSettings.SetApplicationIdentifier(BuildTargetGroup.iOS, "com.uticadrive.game");
            PlayerSettings.SetApplicationIdentifier(BuildTargetGroup.Android, "com.uticadrive.game");
            PlayerSettings.defaultInterfaceOrientation = UIOrientation.LandscapeLeft;
            PlayerSettings.runInBackground = false;
            PlayerSettings.colorSpace = ColorSpace.Linear;

            AssetDatabase.SaveAssets();
        }

        static void EnsureFolder(string path)
        {
            if (AssetDatabase.IsValidFolder(path)) return;
            var parent = Path.GetDirectoryName(path)?.Replace('\\', '/');
            var name = Path.GetFileName(path);
            if (!string.IsNullOrEmpty(parent) && !AssetDatabase.IsValidFolder(parent))
                EnsureFolder(parent);
            AssetDatabase.CreateFolder(parent ?? "Assets", name);
        }
    }
}
#endif
