/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

/**
 * Anamorphic Lens Flare Shader
 * Creates horizontal chromatic flare streaks across bright luminous light sources
 * (kiosk 27-inch screen high-intensity animation states and metallic edge highlights).
 */
export const AnamorphicFlareShader = {
  name: 'AnamorphicFlareShader',
  uniforms: {
    tDiffuse: { value: null },
    intensity: { value: 0.12 },
    threshold: { value: 0.70 },
    stretch: { value: 0.05 },
    flareColor: { value: new THREE.Color(0x5cb2ff) }, // Cinematic cool cyan-blue anamorphic streak
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float intensity;
    uniform float threshold;
    uniform float stretch;
    uniform vec3 flareColor;
    varying vec2 vUv;

    void main() {
      vec4 baseColor = texture2D(tDiffuse, vUv);

      if (intensity <= 0.005) {
        gl_FragColor = baseColor;
        return;
      }

      // Horizontal Gaussian-weighted chromatic anamorphic streak
      vec3 streak = vec3(0.0);
      float totalWeight = 0.0;

      // 17-tap horizontal anamorphic flare sampling
      for (int i = -8; i <= 8; i++) {
        float fi = float(i);
        float offset = fi * (stretch / 8.0);
        vec2 sampleUv = vec2(clamp(vUv.x + offset, 0.0, 1.0), vUv.y);

        // Chromatic split across horizontal streak
        float r = texture2D(tDiffuse, vec2(clamp(sampleUv.x - offset * 0.12, 0.0, 1.0), sampleUv.y)).r;
        float g = texture2D(tDiffuse, sampleUv).g;
        float b = texture2D(tDiffuse, vec2(clamp(sampleUv.x + offset * 0.12, 0.0, 1.0), sampleUv.y)).b;
        vec3 c = vec3(r, g, b);

        float luma = dot(c, vec3(0.299, 0.587, 0.114));
        if (luma > threshold) {
          float weight = exp(-0.5 * (fi * fi) / 10.0);
          streak += max(vec3(0.0), c - vec3(threshold)) * weight;
          totalWeight += weight;
        }
      }

      if (totalWeight > 0.0) {
        streak /= totalWeight;
      }

      // Composite anamorphic streak flare with cinematic intensity
      vec3 flare = streak * flareColor * (intensity * 2.8);

      gl_FragColor = vec4(baseColor.rgb + flare, baseColor.a);
    }
  `,
};
