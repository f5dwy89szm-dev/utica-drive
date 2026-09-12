Shader "UticaDrive/Mobile Glossy Vehicle"
{
    Properties
    {
        [MainTexture] _BaseMap("Paint Texture", 2D) = "white" {}
        [MainColor] _BaseColor("Paint Color", Color) = (0.05, 0.08, 0.12, 1)
        _Metallic("Metallic", Range(0,1)) = 0.82
        _Smoothness("Smoothness", Range(0,1)) = 0.88
        _ReflectionCube("Reflection Cubemap", Cube) = "black" {}
        _ReflectionStrength("Cubemap Strength", Range(0,1)) = 0.28
    }
    SubShader
    {
        Tags { "RenderType"="Opaque" "Queue"="Geometry" "RenderPipeline"="UniversalPipeline" }
        Pass
        {
            Name "ForwardLit"
            Tags { "LightMode"="UniversalForward" }
            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma multi_compile_fog
            #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE
            #pragma multi_compile _ _ADDITIONAL_LIGHTS

            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"

            TEXTURE2D(_BaseMap); SAMPLER(sampler_BaseMap);
            TEXTURECUBE(_ReflectionCube); SAMPLER(sampler_ReflectionCube);
            CBUFFER_START(UnityPerMaterial)
                float4 _BaseMap_ST;
                half4 _BaseColor;
                half _Metallic;
                half _Smoothness;
                half _ReflectionStrength;
            CBUFFER_END

            struct Attributes { float4 positionOS : POSITION; float3 normalOS : NORMAL; float2 uv : TEXCOORD0; };
            struct Varyings { float4 positionHCS : SV_POSITION; float3 positionWS : TEXCOORD0; half3 normalWS : TEXCOORD1; float2 uv : TEXCOORD2; half fogFactor : TEXCOORD3; };

            Varyings vert(Attributes input)
            {
                Varyings output;
                VertexPositionInputs positionInputs = GetVertexPositionInputs(input.positionOS.xyz);
                VertexNormalInputs normalInputs = GetVertexNormalInputs(input.normalOS);
                output.positionHCS = positionInputs.positionCS;
                output.positionWS = positionInputs.positionWS;
                output.normalWS = NormalizeNormalPerVertex(normalInputs.normalWS);
                output.uv = TRANSFORM_TEX(input.uv, _BaseMap);
                output.fogFactor = ComputeFogFactor(positionInputs.positionVS.z);
                return output;
            }

            half4 frag(Varyings input) : SV_Target
            {
                half3 albedo = SAMPLE_TEXTURE2D(_BaseMap, sampler_BaseMap, input.uv).rgb * _BaseColor.rgb;
                half3 normalWS = normalize(input.normalWS);
                half3 viewDir = SafeNormalize(GetCameraPositionWS() - input.positionWS);
                InputData lightingInput = (InputData)0;
                lightingInput.positionWS = input.positionWS;
                lightingInput.normalWS = normalWS;
                lightingInput.viewDirectionWS = viewDir;
                lightingInput.fogCoord = input.fogFactor;
                SurfaceData surface = (SurfaceData)0;
                surface.albedo = albedo;
                surface.metallic = _Metallic;
                surface.smoothness = _Smoothness;
                surface.alpha = 1;
                half3 color = UniversalFragmentPBR(lightingInput, surface);
                half3 reflectionDir = reflect(-viewDir, normalWS);
                half3 reflection = SAMPLE_TEXTURECUBE_LOD(_ReflectionCube, sampler_ReflectionCube, reflectionDir, 0).rgb;
                half fresnel = pow(1.0h - saturate(dot(normalWS, viewDir)), 5.0h);
                color += reflection * (_ReflectionStrength * lerp(.18h, 1.0h, fresnel));
                color = MixFog(color, input.fogFactor);
                return half4(color, 1);
            }
            ENDHLSL
        }
    }
    FallBack "Universal Render Pipeline/Lit"
}

