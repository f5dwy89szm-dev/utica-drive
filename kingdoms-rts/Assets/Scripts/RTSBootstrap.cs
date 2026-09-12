using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;
using System.Collections.Generic;

public class RTSBootstrap : MonoBehaviour
{
    static RTSBootstrap game;
    Camera cam;
    readonly List<UnitAgent> units = new();
    UnitAgent selected;
    Text status;
    int wood = 200, food = 150, gold = 50;

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
    static void StartGame()
    {
        if (FindFirstObjectByType<RTSBootstrap>() == null)
            new GameObject("KingdomsGame").AddComponent<RTSBootstrap>();
    }

    void Awake()
    {
        game = this;
        BuildWorld();
        BuildUI();
    }

    void BuildWorld()
    {
        cam = Camera.main;
        if (!cam) { cam = new GameObject("Main Camera").AddComponent<Camera>(); cam.tag = "MainCamera"; }
        cam.transform.position = new Vector3(0, 18, -14);
        cam.transform.rotation = Quaternion.Euler(52, 0, 0);
        cam.backgroundColor = new Color(.38f, .58f, .72f);

        Make("Ground", PrimitiveType.Plane, Vector3.zero, new Vector3(4,1,4), new Color(.30f,.48f,.24f));
        Make("Town Hall", PrimitiveType.Cube, new Vector3(0,1,2), new Vector3(3,2,3), new Color(.45f,.28f,.12f));
        for(int i=0;i<12;i++) Make("Tree",PrimitiveType.Cylinder,new Vector3(Random.Range(-16,17),1,Random.Range(-15,16)),new Vector3(.45f,1.5f,.45f),new Color(.12f,.36f,.12f));
        for(int i=0;i<4;i++) SpawnUnit(new Vector3(-3+i*1.4f,.5f,-1), false);
        for(int i=0;i<5;i++) SpawnUnit(new Vector3(8+i*.8f,.5f,8), true);
        var light=new GameObject("Sun").AddComponent<Light>(); light.type=LightType.Directional; light.intensity=1.25f; light.transform.rotation=Quaternion.Euler(50,-35,0);
    }

    GameObject Make(string n, PrimitiveType type, Vector3 p, Vector3 s, Color color)
    {
        var o=GameObject.CreatePrimitive(type); o.name=n; o.transform.position=p; o.transform.localScale=s;
        o.GetComponent<Renderer>().material.color=color; return o;
    }

    void SpawnUnit(Vector3 p, bool enemy)
    {
        var o=Make(enemy?"Raider":"Villager",PrimitiveType.Capsule,p,new Vector3(.65f,.8f,.65f),enemy?new Color(.72f,.17f,.12f):new Color(.16f,.42f,.78f));
        var u=o.AddComponent<UnitAgent>(); u.enemy=enemy; u.home=p; units.Add(u);
    }

    void BuildUI()
    {
        var canvas=new GameObject("HUD").AddComponent<Canvas>(); canvas.renderMode=RenderMode.ScreenSpaceOverlay;
        canvas.gameObject.AddComponent<CanvasScaler>().uiScaleMode=CanvasScaler.ScaleMode.ScaleWithScreenSize;
        canvas.gameObject.AddComponent<GraphicRaycaster>();
        if(!FindFirstObjectByType<EventSystem>()) new GameObject("EventSystem",typeof(EventSystem),typeof(StandaloneInputModule));

        status=Label(canvas.transform,"Kingdoms of Ember",new Vector2(22,-20),new Vector2(520,80),26,TextAnchor.UpperLeft);
        Button(canvas.transform,"TRAIN  50 FOOD",new Vector2(-20,20),()=>{if(food>=50){food-=50;SpawnUnit(new Vector3(Random.Range(-4,4),.5f,-2),false);}});
        Button(canvas.transform,"GATHER",new Vector2(-20,86),()=>{wood+=25;food+=20;gold+=5;});
    }

    Text Label(Transform parent,string value,Vector2 pos,Vector2 size,int font,TextAnchor anchor)
    {
        var r=new GameObject("Label",typeof(RectTransform),typeof(Text)); r.transform.SetParent(parent,false);
        var rt=(RectTransform)r.transform; rt.anchorMin=new Vector2(0,1);rt.anchorMax=new Vector2(0,1);rt.pivot=new Vector2(0,1);rt.anchoredPosition=pos;rt.sizeDelta=size;
        var t=r.GetComponent<Text>();t.font=Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");t.text=value;t.fontSize=font;t.alignment=anchor;t.color=Color.white;return t;
    }

    void Button(Transform parent,string label,Vector2 pos,UnityEngine.Events.UnityAction action)
    {
        var r=new GameObject(label,typeof(RectTransform),typeof(Image),typeof(Button));r.transform.SetParent(parent,false);
        var rt=(RectTransform)r.transform;rt.anchorMin=rt.anchorMax=rt.pivot=new Vector2(1,0);rt.anchoredPosition=pos;rt.sizeDelta=new Vector2(210,54);
        r.GetComponent<Image>().color=new Color(.18f,.12f,.08f,.92f);r.GetComponent<Button>().onClick.AddListener(action);
        var t=Label(r.transform,label,Vector2.zero,rt.sizeDelta,18,TextAnchor.MiddleCenter);var tr=(RectTransform)t.transform;tr.anchorMin=Vector2.zero;tr.anchorMax=Vector2.one;tr.offsetMin=tr.offsetMax=Vector2.zero;
    }

    void Update()
    {
        status.text=$"KINGDOMS OF EMBER\nWood {wood}   Food {food}   Gold {gold}";
        if(Input.GetMouseButtonDown(0) && !EventSystem.current.IsPointerOverGameObject())
        {
            var ray=cam.ScreenPointToRay(Input.mousePosition);
            if(Physics.Raycast(ray,out var hit))
            {
                var u=hit.collider.GetComponent<UnitAgent>();
                if(u && !u.enemy){ selected=u; }
                else if(selected){ selected.target=hit.point; }
            }
        }
    }
}

public class UnitAgent : MonoBehaviour
{
    public bool enemy;
    public Vector3 target,home;
    float health=100;
    void Start(){target=transform.position;}
    void Update()
    {
        if(enemy)
        {
            var prey=FindFirstObjectByType<RTSBootstrap>();
            target=Vector3.Lerp(target,home+new Vector3(Mathf.Sin(Time.time)*5,0,Mathf.Cos(Time.time*.8f)*5),Time.deltaTime);
        }
        var d=target-transform.position;d.y=0;
        if(d.magnitude>.15f){transform.position+=d.normalized*2.4f*Time.deltaTime;transform.rotation=Quaternion.Slerp(transform.rotation,Quaternion.LookRotation(d),Time.deltaTime*8);}
    }
}
