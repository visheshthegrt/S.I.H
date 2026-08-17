import * as THREE from 'three';

export const AtmosphereShader = {
  uniforms: {
    sunDirection: { value: new THREE.Vector3(5, 3, 5).normalize() },
    atmosphereColor: { value: new THREE.Color(0x00d0ff) },
    glowIntensity: { value: 0.8 }
  },
  vertexShader: /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 sunDirection;
    uniform vec3 atmosphereColor;
    uniform float glowIntensity;

    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
      
      // Rayleigh Scattering Fresnel Rim Effect
      float fresnel = pow(1.0 - max(dot(viewDirection, vNormal), 0.0), 3.0);
      
      // Sun Direction lighting factor (Atmosphere glows brighter on day side)
      float sunDot = max(dot(vNormal, sunDirection), 0.0);
      float dayNightGlow = mix(0.15, 1.0, sunDot);

      // Final Atmospheric Color Calculation
      vec3 finalColor = atmosphereColor * fresnel * dayNightGlow * glowIntensity * 1.5;
      float alpha = fresnel * dayNightGlow * 0.85;

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};
