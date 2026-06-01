import { useEffect, useRef } from "react";

interface WarpBgProps {
  variant?: 'monochrome' | 'neon';
  opacity?: number;
}

export default function WarpBg({ variant = 'monochrome', opacity = 0.18 }: WarpBgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext("webgl", { preserveDrawingBuffer: false, antialias: true }) || 
           (canvas.getContext("experimental-webgl") as WebGLRenderingContext);
    } catch (e) {
      console.warn("WebGL not supported, falling back to 2D canvas", e);
    }

    let animationFrameId: number;

    if (gl) {
      // --- WEBGL IMPLEMENTATION ---
      const vertexShaderSource = `
        attribute vec2 position;
        varying vec2 vUv;
        void main() {
          vUv = position * 0.5 + 0.5;
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `;

      const fragmentShaderSource = `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime;
        uniform vec2 uResolution;
        uniform float uIsNeon;

        void main() {
          vec2 uv = vUv;
          float aspect = uResolution.x / uResolution.y;
          vec2 p = uv - 0.5;
          p.x *= aspect;

          float t = uTime * 0.7;

          // Liquid warp wave multi-octave swirl effect
          for (float i = 1.0; i <= 6.0; i++) {
            p.x += sin(p.y * 2.5 * i + t) * 0.08 / i;
            p.y += cos(p.x * 2.5 * i + t) * 0.08 / i;
          }

          // Checks pattern calculation
          float size = 5.0; // scale of checked tiles
          float valX = sin(p.x * size * 3.14159);
          float valY = sin(p.y * size * 3.14159);
          
          float check = step(0.0, valX * valY);

          // Dark base color
          vec3 darkColor = vec3(0.05, 0.05, 0.05);
          
          // Light color (Monochrome white or Neon lime yellow #e6ff00)
          vec3 lightColor = mix(vec3(0.95, 0.95, 0.95), vec3(0.902, 1.0, 0.0), uIsNeon);

          // Render high-contrast liquid warp checks
          vec3 color = mix(darkColor, lightColor, check);

          // Add a subtle vignette for incredible premium styling depth
          float dist = length(vUv - 0.5);
          color *= smoothstep(1.2, 0.4, dist);

          gl_FragColor = vec4(color, 1.0);
        }
      `;

      const createShader = (glContext: WebGLRenderingContext, type: number, source: string) => {
        const shader = glContext.createShader(type);
        if (!shader) return null;
        glContext.shaderSource(shader, source);
        glContext.compileShader(shader);
        if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
          console.error("Shader compiled failed:", glContext.getShaderInfoLog(shader));
          glContext.deleteShader(shader);
          return null;
        }
        return shader;
      };

      const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
      if (!vs || !fs) return;

      const program = gl.createProgram();
      if (!program) return;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("WebGL program link failed.");
        return;
      }

      gl.useProgram(program);

      // Buffer vertices
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          -1.0, -1.0,
           1.0, -1.0,
          -1.0,  1.0,
          -1.0,  1.0,
           1.0, -1.0,
           1.0,  1.0,
        ]),
        gl.STATIC_DRAW
      );

      const positionLocation = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      const uTimeLocation = gl.getUniformLocation(program, "uTime");
      const uResolutionLocation = gl.getUniformLocation(program, "uResolution");
      const uIsNeonLocation = gl.getUniformLocation(program, "uIsNeon");

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // Performance cap
        const w = Math.floor(canvas.clientWidth * dpr);
        const h = Math.floor(canvas.clientHeight * dpr);
        
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          gl!.viewport(0, 0, w, h);
        }
      };

      const startTime = Date.now();

      const render = () => {
        resize();
        
        const now = Date.now();
        const elapsed = (now - startTime) / 1000.0;
        
        gl!.uniform1f(uTimeLocation, elapsed);
        gl!.uniform2f(uResolutionLocation, canvas.width, canvas.height);
        gl!.uniform1f(uIsNeonLocation, variant === 'neon' ? 1.0 : 0.0);
        
        gl!.clearColor(0, 0, 0, 1);
        gl!.clear(gl!.COLOR_BUFFER_BIT);
        
        gl!.drawArrays(gl!.TRIANGLES, 0, 6);
        
        animationFrameId = requestAnimationFrame(render);
      };

      render();
    } else {
      // --- COMPATIBLE HIGH-PERFORMANCE 2D CANVAS FALLBACK ---
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let width = 0;
      let height = 0;
      
      const resize2D = () => {
        // Render at a compact resolution and upscale for speed & softness
        const w = Math.floor(canvas.clientWidth / 2) || 320;
        const h = Math.floor(canvas.clientHeight / 2) || 240;
        if (width !== w || height !== h) {
          width = w;
          height = h;
          canvas.width = w;
          canvas.height = h;
        }
      };

      const startTime = Date.now();

      const drawFrame2D = () => {
        resize2D();
        const t = (Date.now() - startTime) / 1000.0 * 0.7;
        
        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;
        const aspect = width / height;

        const isNeon = variant === 'neon';

        // Draw distorted grid scanline
        for (let y = 0; y < height; y++) {
          const uvY = y / height;
          const pY_base = uvY - 0.5;

          for (let x = 0; x < width; x++) {
            const uvX = x / width;
            let pX = (uvX - 0.5) * aspect;
            let pY = pY_base;

            // Apply swirl
            for (let i = 1; i <= 3; i++) {
              pX += Math.sin(pY * 2.5 * i + t) * 0.08 / i;
              pY += Math.cos(pX * 2.5 * i + t) * 0.08 / i;
            }

            // Checks logic
            const valX = Math.sin(pX * 5.0 * Math.PI);
            const valY = Math.sin(pY * 5.0 * Math.PI);
            const check = (valX * valY) >= 0;

            let rVal = check ? 240 : 13;
            let gVal = check ? 240 : 13;
            let bVal = check ? 240 : 13;

            if (isNeon && check) {
              rVal = 230;
              gVal = 255;
              bVal = 0;
            }

            // Vignette math
            const dX = uvX - 0.5;
            const dY = uvY - 0.5;
            const dist = Math.sqrt(dX * dX + dY * dY);
            const vig = Math.max(0, Math.min(1, (1.2 - dist) / 0.8));
            
            const finalR = Math.floor(rVal * vig);
            const finalG = Math.floor(gVal * vig);
            const finalB = Math.floor(bVal * vig);

            const idx = (y * width + x) * 4;
            data[idx] = finalR;     // R
            data[idx + 1] = finalG; // G
            data[idx + 2] = finalB; // B
            data[idx + 3] = 255;    // A
          }
        }

        ctx.putImageData(imgData, 0, 0);
        animationFrameId = requestAnimationFrame(drawFrame2D);
      };

      drawFrame2D();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block pointer-events-none"
      style={{ opacity, mixBlendMode: "normal" }}
    />
  );
}
