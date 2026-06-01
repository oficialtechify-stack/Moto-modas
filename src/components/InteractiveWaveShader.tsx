import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface InteractiveWaveShaderProps {
  className?: string;
  opacity?: number;
}

export default function InteractiveWaveShader({ className, opacity = 1.0 }: InteractiveWaveShaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Performance cap
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.error('WebGL not supported', err);
      container.innerHTML = '<p style="color:white;text-align:center;padding-top:20%">WebGL isn’t available.</p>';
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const clock = new THREE.Clock();

    // Shaders for rendering the liquid wave
    const vertexShader = `
      varying vec2 vTextureCoord;
      void main() {
        vTextureCoord = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      precision mediump float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform vec2 iMouse;
      varying vec2 vTextureCoord;

      void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        vec2 uv = (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);

        // Calculate distance from center for dimming the center to support high legibility of content
        vec2 center = iResolution.xy * 0.5;
        float dist = distance(fragCoord, center);
        float radius = min(iResolution.x, iResolution.y) * 0.5;
        
        // Dimming factor for the center area
        float centerDim = smoothstep(radius * 0.2, radius * 0.8, dist);

        // Wave caustics mathematical distortion
        for(float i = 1.0; i < 8.0; i++){
          uv.x += 0.5 / i * cos(i * 2.2 * uv.y + iTime * 0.8);
          uv.y += 0.5 / i * cos(i * 1.3 * uv.x + iTime * 0.8);
        }
        
        // High-contrast neon brand color of the site (#e6ff00 is vec3(0.902, 1.0, 0.0))
        vec3 neonLime = vec3(0.902, 1.0, 0.0);
        
        // Calculate wave intensity with subtle neon styling
        float waveIntensity = 1.0 / (abs(sin(iTime * 0.7 - uv.y - uv.x)) + 0.15);
        
        // Dark background base styling mixed with glowing neon caustics
        vec3 baseBg = vec3(0.035, 0.035, 0.045);
        vec3 waveColor = neonLime * 0.04 * waveIntensity;
        
        fragColor = vec4(baseBg + waveColor, 1.0);
        
        // Apply center dimming to keep central text and cards extremely easy to read
        fragColor.rgb = mix(fragColor.rgb * 0.35, fragColor.rgb, centerDim);
      }

      void main() {
        vec4 color;
        mainImage(color, vTextureCoord * iResolution);
        gl_FragColor = color;
      }
    `;

    // Uniforms structure matching the shader
    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2() },
      iMouse: { value: new THREE.Vector2() }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.iResolution.value.set(w, h);
    };

    const onMouseMove = (event: MouseEvent) => {
      uniforms.iMouse.value.set(event.clientX, event.clientY);
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);
    onResize();

    // Animating the time value for full-screen dynamics
    renderer.setAnimationLoop(() => {
      uniforms.iTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    });

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      renderer.setAnimationLoop(null);
      
      const canvas = renderer.domElement;
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      material.dispose();
      geometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        backgroundColor: '#09090b',
        opacity: opacity
      }}
      aria-label="Fundo interativo com ondas de neon"
    />
  );
}
