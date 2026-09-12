using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace UticaDrive.Prototype
{
    public sealed class UticaPrototypeBootstrap : MonoBehaviour
    {
        static readonly Color Asphalt = new Color(0.055f, 0.065f, 0.075f);
        static readonly Color Sidewalk = new Color(0.35f, 0.36f, 0.37f);
        static readonly Color PaintBlue = new Color(0.025f, 0.17f, 0.42f);

        PrototypePlayer player;
        PrototypeVehicle vehicle;
        PrototypeCamera followCamera;
        PrototypeJoystick joystick;
        PrototypeHoldButton gas;
        PrototypeHoldButton brake;
        Text speedText;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void Install()
        {
            if (FindFirstObjectByType<UticaPrototypeBootstrap>() != null) return;
            new GameObject("Utica Prototype Bootstrap").AddComponent<UticaPrototypeBootstrap>();
        }

        void Start()
        {
            BuildLighting();
            BuildWorld();
            BuildActors();
            BuildInterface();
        }

        void Update()
        {
            if (speedText && vehicle)
                speedText.text = vehicle.IsOccupied ? Mathf.RoundToInt(vehicle.SpeedMph) + " MPH" : "UTICA DRIVE";
        }

        void BuildLighting()
        {
            RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Trilight;
            RenderSettings.ambientSkyColor = new Color(0.42f, 0.52f, 0.68f);
            RenderSettings.ambientEquatorColor = new Color(0.18f, 0.22f, 0.28f);
            RenderSettings.ambientGroundColor = new Color(0.06f, 0.07f, 0.08f);
            RenderSettings.fog = true;
            RenderSettings.fogColor = new Color(0.34f, 0.42f, 0.52f);
            RenderSettings.fogMode = FogMode.Linear;
            RenderSettings.fogStartDistance = 85f;
            RenderSettings.fogEndDistance = 260f;

            var sun = FindFirstObjectByType<Light>();
            if (!sun)
            {
                var sunObject = new GameObject("Sun");
                sun = sunObject.AddComponent<Light>();
                sun.type = LightType.Directional;
            }
            sun.color = new Color(1f, 0.88f, 0.72f);
            sun.intensity = 1.25f;
            sun.shadows = LightShadows.Soft;
            sun.transform.rotation = Quaternion.Euler(42f, -32f, 0f);
        }

        void BuildWorld()
        {
            CreateBox("Ground", new Vector3(0f, -0.65f, 0f), new Vector3(230f, 1f, 230f), new Color(0.12f, 0.18f, 0.12f));

            for (var i = -2; i <= 2; i++)
            {
                CreateRoad(new Vector3(i * 42f, 0f, 0f), new Vector3(13f, 0.18f, 220f), false);
                CreateRoad(new Vector3(0f, 0.01f, i * 42f), new Vector3(220f, 0.18f, 13f), true);
            }

            var random = new System.Random(315);
            for (var x = -2; x < 2; x++)
            for (var z = -2; z < 2; z++)
            {
                var center = new Vector3(x * 42f + 21f, 0f, z * 42f + 21f);
                for (var bx = -1; bx <= 1; bx++)
                for (var bz = -1; bz <= 1; bz++)
                {
                    var width = 7f + (float)random.NextDouble() * 3f;
                    var depth = 7f + (float)random.NextDouble() * 3f;
                    var height = 7f + (float)random.NextDouble() * 18f;
                    var p = center + new Vector3(bx * 11f, height * .5f, bz * 11f);
                    var color = Color.Lerp(new Color(.22f, .24f, .27f), new Color(.58f, .48f, .37f), (float)random.NextDouble());
                    CreateBuilding(p, new Vector3(width, height, depth), color);
                }
            }
        }

        void CreateRoad(Vector3 position, Vector3 scale, bool eastWest)
        {
            CreateBox("Road", position, scale, Asphalt);
            var length = eastWest ? scale.x : scale.z;
            for (var d = -length * .5f + 4f; d < length * .5f; d += 9f)
            {
                var stripePosition = position + (eastWest ? new Vector3(d, .12f, 0f) : new Vector3(0f, .12f, d));
                var stripeScale = eastWest ? new Vector3(4.5f, .025f, .18f) : new Vector3(.18f, .025f, 4.5f);
                CreateBox("Lane Stripe", stripePosition, stripeScale, new Color(1f, .78f, .16f), false);
            }

            var sideOffset = eastWest ? Vector3.forward : Vector3.right;
            var walkScale = eastWest ? new Vector3(scale.x, .22f, 2.2f) : new Vector3(2.2f, .22f, scale.z);
            CreateBox("Sidewalk", position + sideOffset * 7.6f + Vector3.up * .05f, walkScale, Sidewalk);
            CreateBox("Sidewalk", position - sideOffset * 7.6f + Vector3.up * .05f, walkScale, Sidewalk);
        }

        void CreateBuilding(Vector3 position, Vector3 scale, Color color)
        {
            var building = CreateBox("Utica Building", position, scale, color);
            var roof = CreateBox("Roof", position + Vector3.up * (scale.y * .5f + .28f), new Vector3(scale.x + .35f, .55f, scale.z + .35f), Color.Lerp(color, Color.black, .35f));
            roof.transform.SetParent(building.transform, true);
        }

        void BuildActors()
        {
            var playerObject = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            playerObject.name = "Player";
            playerObject.transform.position = new Vector3(-3f, 1.05f, -8f);
            Destroy(playerObject.GetComponent<CapsuleCollider>());
            var character = playerObject.AddComponent<CharacterController>();
            character.height = 1.85f;
            character.radius = .34f;
            character.center = new Vector3(0f, .92f, 0f);
            Paint(playerObject, new Color(.12f, .16f, .22f), .05f, .3f);
            player = playerObject.AddComponent<PrototypePlayer>();

            var carRoot = new GameObject("M4 Inspired Coupe");
            carRoot.transform.position = new Vector3(3f, .7f, -8f);
            var body = carRoot.AddComponent<Rigidbody>();
            body.mass = 1550f;
            body.linearDamping = .08f;
            body.angularDamping = 2.2f;
            body.centerOfMass = new Vector3(0f, -.35f, 0f);
            var collider = carRoot.AddComponent<BoxCollider>();
            collider.size = new Vector3(1.9f, 1.05f, 4.55f);
            collider.center = new Vector3(0f, .2f, 0f);

            AddCarPart(carRoot.transform, "Lower Body", new Vector3(0f, .15f, 0f), new Vector3(1.9f, .58f, 4.5f), PaintBlue, .86f, .92f);
            AddCarPart(carRoot.transform, "Cabin", new Vector3(0f, .72f, -.15f), new Vector3(1.65f, .72f, 2.25f), new Color(.035f, .055f, .075f), .15f, .82f);
            AddCarPart(carRoot.transform, "Hood", new Vector3(0f, .48f, 1.48f), new Vector3(1.82f, .14f, 1.35f), PaintBlue, .86f, .92f);
            AddCarPart(carRoot.transform, "Trunk", new Vector3(0f, .48f, -1.62f), new Vector3(1.82f, .15f, .85f), PaintBlue, .86f, .92f);
            AddCarPart(carRoot.transform, "Front Grille", new Vector3(0f, .16f, 2.27f), new Vector3(1.15f, .34f, .08f), new Color(.015f, .015f, .018f), .75f, .5f);
            AddWheel(carRoot.transform, new Vector3(-1f, -.05f, 1.42f));
            AddWheel(carRoot.transform, new Vector3(1f, -.05f, 1.42f));
            AddWheel(carRoot.transform, new Vector3(-1f, -.05f, -1.42f));
            AddWheel(carRoot.transform, new Vector3(1f, -.05f, -1.42f));
            vehicle = carRoot.AddComponent<PrototypeVehicle>();

            var cameraObject = Camera.main ? Camera.main.gameObject : new GameObject("Main Camera");
            var camera = cameraObject.GetComponent<Camera>() ?? cameraObject.AddComponent<Camera>();
            cameraObject.tag = "MainCamera";
            camera.fieldOfView = 62f;
            camera.nearClipPlane = .12f;
            camera.farClipPlane = 340f;
            followCamera = cameraObject.GetComponent<PrototypeCamera>() ?? cameraObject.AddComponent<PrototypeCamera>();
            followCamera.SetTarget(player.transform, false);

            player.Configure(() => joystick ? joystick.Value : Vector2.zero, followCamera.transform);
            vehicle.Configure(() => joystick ? joystick.Value.x : 0f, () => gas && gas.Held, () => brake && brake.Held);
        }

        void BuildInterface()
        {
            if (!FindFirstObjectByType<EventSystem>())
            {
                var eventSystem = new GameObject("EventSystem", typeof(EventSystem), typeof(StandaloneInputModule));
                DontDestroyOnLoad(eventSystem);
            }

            var canvasObject = new GameObject("Mobile HUD", typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            var canvas = canvasObject.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            var scaler = canvasObject.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1920f, 1080f);
            scaler.matchWidthOrHeight = .5f;

            joystick = CreateJoystick(canvas.transform);
            gas = CreateHoldButton(canvas.transform, "GAS", new Vector2(-150f, 155f), new Color(.12f, .72f, .4f, .82f));
            brake = CreateHoldButton(canvas.transform, "BRAKE / REV", new Vector2(-360f, 120f), new Color(.85f, .22f, .18f, .82f));
            var action = CreateButton(canvas.transform, "ENTER / EXIT", new Vector2(-170f, 390f), new Vector2(260f, 92f), new Color(.12f, .45f, .9f, .86f));
            action.onClick.AddListener(ToggleVehicle);

            speedText = CreateText(canvas.transform, "UTICA DRIVE", 34, TextAnchor.MiddleCenter);
            var speedRect = speedText.rectTransform;
            speedRect.anchorMin = new Vector2(.5f, 1f);
            speedRect.anchorMax = new Vector2(.5f, 1f);
            speedRect.pivot = new Vector2(.5f, 1f);
            speedRect.anchoredPosition = new Vector2(0f, -45f);
            speedRect.sizeDelta = new Vector2(500f, 60f);
        }

        void ToggleVehicle()
        {
            if (!player || !vehicle) return;
            if (vehicle.IsOccupied)
            {
                vehicle.Exit();
                player.gameObject.SetActive(true);
                player.transform.position = vehicle.transform.position + vehicle.transform.right * 2.4f + Vector3.up * .3f;
                followCamera.SetTarget(player.transform, false);
            }
            else if (Vector3.Distance(player.transform.position, vehicle.transform.position) < 4.2f)
            {
                vehicle.Enter();
                player.gameObject.SetActive(false);
                followCamera.SetTarget(vehicle.transform, true);
            }
        }

        PrototypeJoystick CreateJoystick(Transform parent)
        {
            var background = CreateUiCircle(parent, "Movement", new Vector2(185f, 175f), new Vector2(230f, 230f), new Color(.05f, .07f, .1f, .58f));
            var handle = CreateUiCircle(background.transform, "Handle", Vector2.zero, new Vector2(92f, 92f), new Color(.3f, .68f, 1f, .85f));
            var stick = background.AddComponent<PrototypeJoystick>();
            stick.Configure(handle.rectTransform, 78f);
            return stick;
        }

        PrototypeHoldButton CreateHoldButton(Transform parent, string label, Vector2 position, Color color)
        {
            var button = CreateButton(parent, label, position, new Vector2(190f, 190f), color);
            return button.gameObject.AddComponent<PrototypeHoldButton>();
        }

        Button CreateButton(Transform parent, string label, Vector2 position, Vector2 size, Color color)
        {
            var image = CreateUiCircle(parent, label, position, size, color);
            var button = image.gameObject.AddComponent<Button>();
            button.targetGraphic = image;
            var text = CreateText(image.transform, label, 25, TextAnchor.MiddleCenter);
            text.rectTransform.anchorMin = Vector2.zero;
            text.rectTransform.anchorMax = Vector2.one;
            text.rectTransform.offsetMin = new Vector2(8f, 8f);
            text.rectTransform.offsetMax = new Vector2(-8f, -8f);
            return button;
        }

        Image CreateUiCircle(Transform parent, string name, Vector2 position, Vector2 size, Color color)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
            go.transform.SetParent(parent, false);
            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(position.x < 0 ? 1f : 0f, 0f);
            rect.anchorMax = rect.anchorMin;
            rect.pivot = new Vector2(.5f, .5f);
            rect.anchoredPosition = position;
            rect.sizeDelta = size;
            var image = go.GetComponent<Image>();
            image.color = color;
            return image;
        }

        Text CreateText(Transform parent, string value, int size, TextAnchor alignment)
        {
            var go = new GameObject("Label", typeof(RectTransform), typeof(CanvasRenderer), typeof(Text));
            go.transform.SetParent(parent, false);
            var text = go.GetComponent<Text>();
            text.text = value;
            text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            text.fontSize = size;
            text.fontStyle = FontStyle.Bold;
            text.alignment = alignment;
            text.color = Color.white;
            text.raycastTarget = false;
            return text;
        }

        GameObject CreateBox(string name, Vector3 position, Vector3 scale, Color color, bool collider = true)
        {
            var go = GameObject.CreatePrimitive(PrimitiveType.Cube);
            go.name = name;
            go.transform.SetPositionAndRotation(position, Quaternion.identity);
            go.transform.localScale = scale;
            if (!collider) Destroy(go.GetComponent<Collider>());
            Paint(go, color, .05f, .45f);
            return go;
        }

        void AddCarPart(Transform parent, string name, Vector3 localPosition, Vector3 scale, Color color, float metallic, float smoothness)
        {
            var part = GameObject.CreatePrimitive(PrimitiveType.Cube);
            part.name = name;
            part.transform.SetParent(parent, false);
            part.transform.localPosition = localPosition;
            part.transform.localScale = scale;
            Destroy(part.GetComponent<Collider>());
            Paint(part, color, metallic, smoothness);
        }

        void AddWheel(Transform parent, Vector3 localPosition)
        {
            var wheel = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            wheel.name = "Wheel";
            wheel.transform.SetParent(parent, false);
            wheel.transform.localPosition = localPosition;
            wheel.transform.localRotation = Quaternion.Euler(0f, 0f, 90f);
            wheel.transform.localScale = new Vector3(.43f, .16f, .43f);
            Destroy(wheel.GetComponent<Collider>());
            Paint(wheel, new Color(.018f, .018f, .02f), .1f, .25f);
        }

        void Paint(GameObject go, Color color, float metallic, float smoothness)
        {
            var renderer = go.GetComponent<Renderer>();
            if (!renderer) return;
            var shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");
            var material = new Material(shader) { color = color };
            if (material.HasProperty("_BaseColor")) material.SetColor("_BaseColor", color);
            if (material.HasProperty("_Metallic")) material.SetFloat("_Metallic", metallic);
            if (material.HasProperty("_Smoothness")) material.SetFloat("_Smoothness", smoothness);
            renderer.material = material;
        }
    }

    public sealed class PrototypeJoystick : MonoBehaviour, IPointerDownHandler, IDragHandler, IPointerUpHandler
    {
        RectTransform handle;
        float radius;
        public Vector2 Value { get; private set; }
        public void Configure(RectTransform handleTransform, float movementRadius) { handle = handleTransform; radius = movementRadius; }
        public void OnPointerDown(PointerEventData eventData) => OnDrag(eventData);
        public void OnDrag(PointerEventData eventData)
        {
            var delta = eventData.position - (Vector2)transform.position;
            Value = Vector2.ClampMagnitude(delta / radius, 1f);
            if (handle) handle.anchoredPosition = Value * radius;
        }
        public void OnPointerUp(PointerEventData eventData) { Value = Vector2.zero; if (handle) handle.anchoredPosition = Vector2.zero; }
    }

    public sealed class PrototypeHoldButton : MonoBehaviour, IPointerDownHandler, IPointerUpHandler
    {
        public bool Held { get; private set; }
        public void OnPointerDown(PointerEventData eventData) => Held = true;
        public void OnPointerUp(PointerEventData eventData) => Held = false;
        void OnDisable() => Held = false;
    }

    [RequireComponent(typeof(CharacterController))]
    public sealed class PrototypePlayer : MonoBehaviour
    {
        System.Func<Vector2> input;
        Transform cameraTransform;
        CharacterController controller;
        float verticalVelocity;
        public void Configure(System.Func<Vector2> movement, Transform view) { input = movement; cameraTransform = view; }
        void Awake() => controller = GetComponent<CharacterController>();
        void Update()
        {
            var stick = input != null ? input() : Vector2.zero;
            stick += new Vector2(Input.GetAxisRaw("Horizontal"), Input.GetAxisRaw("Vertical"));
            var forward = cameraTransform ? Vector3.ProjectOnPlane(cameraTransform.forward, Vector3.up).normalized : Vector3.forward;
            var right = cameraTransform ? Vector3.ProjectOnPlane(cameraTransform.right, Vector3.up).normalized : Vector3.right;
            var move = Vector3.ClampMagnitude(forward * stick.y + right * stick.x, 1f);
            if (move.sqrMagnitude > .01f) transform.forward = Vector3.Slerp(transform.forward, move, 12f * Time.deltaTime);
            if (controller.isGrounded && verticalVelocity < 0f) verticalVelocity = -2f;
            verticalVelocity += -24f * Time.deltaTime;
            controller.Move((move * 5.4f + Vector3.up * verticalVelocity) * Time.deltaTime);
        }
    }

    [RequireComponent(typeof(Rigidbody))]
    public sealed class PrototypeVehicle : MonoBehaviour
    {
        System.Func<float> steering;
        System.Func<bool> gas;
        System.Func<bool> brake;
        Rigidbody body;
        public bool IsOccupied { get; private set; }
        public float SpeedMph => body ? body.linearVelocity.magnitude * 2.23694f : 0f;
        public void Configure(System.Func<float> steerInput, System.Func<bool> gasInput, System.Func<bool> brakeInput) { steering = steerInput; gas = gasInput; brake = brakeInput; }
        void Awake() => body = GetComponent<Rigidbody>();
        public void Enter() => IsOccupied = true;
        public void Exit() => IsOccupied = false;
        void FixedUpdate()
        {
            if (!IsOccupied) return;
            var steer = Mathf.Clamp((steering != null ? steering() : 0f) + Input.GetAxis("Horizontal"), -1f, 1f);
            var throttle = (gas != null && gas() ? 1f : 0f) + Mathf.Clamp01(Input.GetAxis("Vertical"));
            var reverse = (brake != null && brake() ? 1f : 0f) + Mathf.Clamp01(-Input.GetAxis("Vertical"));
            var localSpeed = transform.InverseTransformDirection(body.linearVelocity).z;
            var drive = throttle - reverse;
            body.AddForce(transform.forward * drive * (localSpeed < 0f && drive > 0f ? 5600f : 4200f), ForceMode.Force);
            body.AddForce(-transform.up * body.linearVelocity.magnitude * 32f, ForceMode.Force);
            var grip = Mathf.Clamp01(body.linearVelocity.magnitude / 2.5f);
            body.MoveRotation(body.rotation * Quaternion.Euler(0f, steer * 52f * grip * Time.fixedDeltaTime, 0f));
            var lateral = Vector3.Dot(body.linearVelocity, transform.right);
            body.AddForce(-transform.right * lateral * 1300f, ForceMode.Force);
            if (body.linearVelocity.magnitude > 48f) body.linearVelocity = body.linearVelocity.normalized * 48f;
        }
    }

    public sealed class PrototypeCamera : MonoBehaviour
    {
        Transform target;
        bool vehicle;
        Vector3 velocity;
        public void SetTarget(Transform newTarget, bool isVehicle) { target = newTarget; vehicle = isVehicle; velocity = Vector3.zero; }
        void LateUpdate()
        {
            if (!target) return;
            var forward = vehicle ? target.forward : Vector3.forward;
            var desired = target.position - forward * (vehicle ? 7.8f : 5.2f) + Vector3.up * (vehicle ? 3.8f : 3.1f);
            transform.position = Vector3.SmoothDamp(transform.position, desired, ref velocity, vehicle ? .16f : .1f);
            transform.rotation = Quaternion.Slerp(transform.rotation, Quaternion.LookRotation(target.position + Vector3.up * 1.05f - transform.position), 12f * Time.deltaTime);
        }
    }
}
