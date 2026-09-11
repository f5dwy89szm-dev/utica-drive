const S={lat:43.1009,lng:-75.2327};

let v,c,sp=0,h=0,k={};

const $=x=>document.getElementById(x);

$('start').onclick=async()=>{

  let key=$('key').value.trim();

  if(!key)

    return alert('Enter API key');

  $('setup').remove();

  $('controls').hidden=false;

  v=new Cesium.Viewer('map',{

    animation:false,

    timeline:false,

    baseLayerPicker:false,

    geocoder:false,

    homeButton:false,

    navigationHelpButton:false,

    sceneModePicker:false,

    fullscreenButton:false

  });

  try{

    let t=await Cesium.Cesium3DTileset.fromUrl(

      'https://tile.googleapis.com/v1/3dtiles/root.json?key='+

      encodeURIComponent(key)

    );

    v.scene.primitives.add(t);

    v.scene.globe.show=false;

  }catch(e){

    alert('Check API key / Map Tiles API');

  }

  let p=Cesium.Cartesian3.fromDegrees(

    S.lng,

    S.lat,

    0

  );

  c=v.entities.add({

    position:p,

    point:{

      pixelSize:16,

      color:Cesium.Color.YELLOW,

      heightReference:

        Cesium.HeightReference.CLAMP_TO_GROUND

    }

  });

  ['left','right','gas','brake'].forEach(id=>{

    let e=$(id);

    e.ontouchstart=x=>{

      x.preventDefault();

      k[id]=1;

    };

    e.ontouchend=x=>{

      x.preventDefault();

      k[id]=0;

    };

  });

  let last=performance.now();

  function loop(n){

    let d=Math.min(

      (n-last)/1000,

      .05

    );

    last=n;

    if(k.gas)

      sp=Math.min(sp+20*d,28);

    if(k.brake)

      sp=Math.max(sp-30*d,-7);

    if(!k.gas&&!k.brake)

      sp*=.98;

    if(k.left)

      h+=1.5*d;

    if(k.right)

      h-=1.5*d;

    let q=

      Cesium.Cartographic.fromCartesian(

        c.position.getValue(n)

      );

    let R=6378137;

    q.latitude+=

      Math.cos(h)*sp*d/R;

    q.longitude+=

      Math.sin(h)*sp*d/

      (R*Math.cos(q.latitude));

    c.position=

      Cesium.Cartesian3.fromRadians(

        q.longitude,

        q.latitude,

        0

      );

    $('speed').textContent=

      Math.round(Math.abs(sp)*2.237)

      +' MPH';

    v.camera.lookAt(

      c.position,

      new Cesium.HeadingPitchRange(

        h,

        -.3,

        45

      )

    );

    requestAnimationFrame(loop);

  }

  requestAnimationFrame(loop);

};
