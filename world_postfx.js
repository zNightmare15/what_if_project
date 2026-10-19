// Cinematic post-processing pipeline (three.js r128, WebGL2).
// Pipeline: MSAA HDR scene -> overlay composite -> multi-level bloom -> grade/CA/vignette/grain -> screen.
// Every look parameter is passed per frame so each story phase can define its own grade.

window.WorldPostFX = (function() {
  const FULLSCREEN_VERT = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `;

  const COMPOSITE_FRAG = `
    uniform sampler2D tScene;
    uniform sampler2D tOverlay;
    varying vec2 vUv;
    void main() {
      vec4 sc = texture2D(tScene, vUv);
      vec4 ov = texture2D(tOverlay, vUv);
      // 2D canvas is uploaded premultiplied -> "over" operator
      gl_FragColor = vec4(sc.rgb * (1.0 - ov.a) + ov.rgb, 1.0);
    }
  `;

  const BRIGHT_FRAG = `
    uniform sampler2D tInput;
    uniform vec2 texel;
    uniform float threshold;
    uniform float knee;
    varying vec2 vUv;
    void main() {
      // 4-tap box prefilter to suppress fireflies from 1px lines
      vec3 c = texture2D(tInput, vUv + texel * vec2(-0.5, -0.5)).rgb;
      c += texture2D(tInput, vUv + texel * vec2( 0.5, -0.5)).rgb;
      c += texture2D(tInput, vUv + texel * vec2(-0.5,  0.5)).rgb;
      c += texture2D(tInput, vUv + texel * vec2( 0.5,  0.5)).rgb;
      c *= 0.25;
      float br = max(c.r, max(c.g, c.b));
      float soft = clamp(br - threshold + knee, 0.0, 2.0 * knee);
      soft = soft * soft / (4.0 * knee + 1e-4);
      float contrib = max(soft, br - threshold) / max(br, 1e-4);
      gl_FragColor = vec4(c * contrib, 1.0);
    }
  `;

  const DOWN_FRAG = `
    uniform sampler2D tInput;
    uniform vec2 texel;
    varying vec2 vUv;
    void main() {
      // 13-tap "Call of Duty" downsample (stable, no aliasing)
      vec3 a = texture2D(tInput, vUv + texel * vec2(-2.0,  2.0)).rgb;
      vec3 b = texture2D(tInput, vUv + texel * vec2( 0.0,  2.0)).rgb;
      vec3 c = texture2D(tInput, vUv + texel * vec2( 2.0,  2.0)).rgb;
      vec3 d = texture2D(tInput, vUv + texel * vec2(-2.0,  0.0)).rgb;
      vec3 e = texture2D(tInput, vUv).rgb;
      vec3 f = texture2D(tInput, vUv + texel * vec2( 2.0,  0.0)).rgb;
      vec3 g = texture2D(tInput, vUv + texel * vec2(-2.0, -2.0)).rgb;
      vec3 h = texture2D(tInput, vUv + texel * vec2( 0.0, -2.0)).rgb;
      vec3 i = texture2D(tInput, vUv + texel * vec2( 2.0, -2.0)).rgb;
      vec3 j = texture2D(tInput, vUv + texel * vec2(-1.0,  1.0)).rgb;
      vec3 k = texture2D(tInput, vUv + texel * vec2( 1.0,  1.0)).rgb;
      vec3 l = texture2D(tInput, vUv + texel * vec2(-1.0, -1.0)).rgb;
      vec3 m = texture2D(tInput, vUv + texel * vec2( 1.0, -1.0)).rgb;
      vec3 col = e * 0.125 + (a + c + g + i) * 0.03125 + (b + d + f + h) * 0.0625 + (j + k + l + m) * 0.125;
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const UP_FRAG = `
    uniform sampler2D tInput;   // smaller (blurred) level
    uniform sampler2D tBase;    // current level
    uniform vec2 texel;         // texel of smaller level
    uniform float radius;
    varying vec2 vUv;
    void main() {
      vec2 o = texel * radius;
      vec3 s = texture2D(tInput, vUv + vec2(-o.x,  o.y)).rgb;
      s += texture2D(tInput, vUv + vec2( 0.0,  o.y)).rgb * 2.0;
      s += texture2D(tInput, vUv + vec2( o.x,  o.y)).rgb;
      s += texture2D(tInput, vUv + vec2(-o.x,  0.0)).rgb * 2.0;
      s += texture2D(tInput, vUv).rgb * 4.0;
      s += texture2D(tInput, vUv + vec2( o.x,  0.0)).rgb * 2.0;
      s += texture2D(tInput, vUv + vec2(-o.x, -o.y)).rgb;
      s += texture2D(tInput, vUv + vec2( 0.0, -o.y)).rgb * 2.0;
      s += texture2D(tInput, vUv + vec2( o.x, -o.y)).rgb;
      s /= 16.0;
      gl_FragColor = vec4(texture2D(tBase, vUv).rgb + s, 1.0);
    }
  `;

  const FINAL_FRAG = `
    uniform sampler2D tBase;
    uniform sampler2D tBloom;
    uniform vec2 resolution;
    uniform float time;
    uniform float bloomStrength;
    uniform vec3 bloomTint;
    uniform float exposure;
    uniform float contrast;
    uniform float saturation;
    uniform vec3 lift;
    uniform vec3 gain;
    uniform float vignette;
    uniform float chroma;
    uniform float grain;
    uniform float haze;
    uniform vec3 hazeColor;
    uniform float fade;
    varying vec2 vUv;

    float hash(vec2 p) {
      p = fract(p * vec2(443.897, 441.423));
      p += dot(p, p.yx + 19.19);
      return fract((p.x + p.y) * p.x);
    }

    vec3 acesFit(vec3 x) {
      const float a = 2.51; const float b = 0.03; const float c = 2.43; const float d = 0.59; const float e = 0.14;
      return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
    }

    void main() {
      vec2 uv = vUv;
      vec2 dc = uv - 0.5;
      float r2 = dot(dc, dc);

      // Radial chromatic aberration (stronger at frame edges, like a real lens)
      vec2 caOff = dc * chroma * (0.35 + r2 * 2.2);
      vec3 col;
      col.r = texture2D(tBase, uv - caOff).r;
      col.g = texture2D(tBase, uv).g;
      col.b = texture2D(tBase, uv + caOff).b;

      vec3 bloom = texture2D(tBloom, uv).rgb;
      col += bloom * bloomStrength * bloomTint;

      // Atmospheric veil (lifts blacks toward haze colour, cinematic softness)
      col = mix(col, hazeColor, haze * (0.6 + 0.4 * (1.0 - uv.y)));

      col *= exposure;
      // Soft-shoulder filmic curve blended with linear to preserve the stylised palette
      vec3 filmic = acesFit(col * 1.15);
      col = mix(clamp(col, 0.0, 1.0), filmic, 0.55);

      // Lift / gain grade
      col = col * gain + lift * (1.0 - col);
      // Contrast around mid-grey
      col = (col - 0.5) * contrast + 0.5;
      // Saturation
      float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = mix(vec3(l), col, saturation);

      // Vignette
      float vig = smoothstep(0.85, 0.18, length(dc * vec2(1.0, 0.82)));
      col *= mix(1.0, vig, vignette);

      // Animated film grain (luma-weighted, stronger in midtones)
      float n = hash(uv * resolution + fract(time * 7.13) * 1000.0) - 0.5;
      float n2 = hash(uv * resolution * 0.5 + fract(time * 3.71) * 733.0) - 0.5;
      float gMask = 1.0 - abs(l - 0.45) * 1.2;
      col += (n * 0.7 + n2 * 0.3) * grain * clamp(gMask, 0.35, 1.0);

      // Fade to black
      col *= (1.0 - fade);

      // Triangular dither kills 8-bit banding in gradients
      col += (hash(uv * resolution + 0.37) + hash(uv * resolution + 0.71) - 1.0) / 255.0;
      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }
  `;

  const DEFAULT_LOOK = {
    bloomStrength: 0.6,
    bloomThreshold: 0.75,
    bloomKnee: 0.25,
    bloomRadius: 1.0,
    bloomTint: [1, 1, 1],
    exposure: 1.0,
    contrast: 1.0,
    saturation: 1.0,
    lift: [0, 0, 0],
    gain: [1, 1, 1],
    vignette: 0.35,
    chroma: 0.0025,
    grain: 0.035,
    haze: 0.0,
    hazeColor: [0.6, 0.65, 0.7],
    fade: 0.0
  };

  class PostFX {
    constructor(renderer, width, height, levels = 6) {
      this.renderer = renderer;
      this.levels = levels;
      this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      this.quadScene = new THREE.Scene();
      this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
      this.quad.frustumCulled = false;
      this.quadScene.add(this.quad);

      const mk = (frag, uniforms) => new THREE.ShaderMaterial({
        vertexShader: FULLSCREEN_VERT,
        fragmentShader: frag,
        uniforms,
        depthTest: false,
        depthWrite: false
      });

      this.matComposite = mk(COMPOSITE_FRAG, { tScene: { value: null }, tOverlay: { value: null } });
      this.matBright = mk(BRIGHT_FRAG, {
        tInput: { value: null }, texel: { value: new THREE.Vector2() },
        threshold: { value: 0.75 }, knee: { value: 0.25 }
      });
      this.matDown = mk(DOWN_FRAG, { tInput: { value: null }, texel: { value: new THREE.Vector2() } });
      this.matUp = mk(UP_FRAG, {
        tInput: { value: null }, tBase: { value: null },
        texel: { value: new THREE.Vector2() }, radius: { value: 1.0 }
      });
      this.matFinal = mk(FINAL_FRAG, {
        tBase: { value: null }, tBloom: { value: null },
        resolution: { value: new THREE.Vector2() }, time: { value: 0 },
        bloomStrength: { value: 0.6 }, bloomTint: { value: new THREE.Vector3(1, 1, 1) },
        exposure: { value: 1 }, contrast: { value: 1 }, saturation: { value: 1 },
        lift: { value: new THREE.Vector3() }, gain: { value: new THREE.Vector3(1, 1, 1) },
        vignette: { value: 0.35 }, chroma: { value: 0.0025 }, grain: { value: 0.035 },
        haze: { value: 0 }, hazeColor: { value: new THREE.Vector3(0.6, 0.65, 0.7) },
        fade: { value: 0 }
      });

      this.overlayTex = null;
      this.setSize(width, height);
    }

    _makeRT(w, h, msaa) {
      const opts = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.HalfFloatType,
        depthBuffer: !!msaa,
        stencilBuffer: false
      };
      if (msaa && THREE.WebGLMultisampleRenderTarget) {
        const rt = new THREE.WebGLMultisampleRenderTarget(w, h, opts);
        rt.samples = 8;
        return rt;
      }
      return new THREE.WebGLRenderTarget(w, h, opts);
    }

    setSize(width, height) {
      this.width = width;
      this.height = height;
      const dispose = (rt) => rt && rt.dispose();
      dispose(this.sceneRT); dispose(this.baseRT);
      (this.downRTs || []).forEach(dispose);
      (this.upRTs || []).forEach(dispose);

      this.sceneRT = this._makeRT(width, height, true);
      this.baseRT = this._makeRT(width, height, false);
      this.downRTs = [];
      this.upRTs = [];
      let w = Math.max(1, width >> 1), h = Math.max(1, height >> 1);
      for (let i = 0; i < this.levels; i++) {
        this.downRTs.push(this._makeRT(w, h, false));
        this.upRTs.push(this._makeRT(w, h, false));
        w = Math.max(1, w >> 1);
        h = Math.max(1, h >> 1);
      }
      this.matFinal.uniforms.resolution.value.set(width, height);
    }

    _pass(material, target) {
      this.quad.material = material;
      this.renderer.setRenderTarget(target);
      this.renderer.render(this.quadScene, this.camera);
    }

    render(scene, camera, overlayCanvas, time, lookIn) {
      const look = Object.assign({}, DEFAULT_LOOK, lookIn || {});
      const r = this.renderer;
      const prevAutoClear = r.autoClear;
      r.autoClear = true;

      // 1. Scene into MSAA HDR target
      r.setRenderTarget(this.sceneRT);
      r.clear();
      r.render(scene, camera);

      // 2. Composite 2D overlay canvas (atom, flares, eruptions) BEFORE bloom so it glows too
      if (overlayCanvas) {
        if (!this.overlayTex) {
          this.overlayTex = new THREE.CanvasTexture(overlayCanvas);
          this.overlayTex.minFilter = THREE.LinearFilter;
          this.overlayTex.generateMipmaps = false;
          this.overlayTex.premultiplyAlpha = true;
        }
        this.overlayTex.needsUpdate = true;
      }
      this.matComposite.uniforms.tScene.value = this.sceneRT.texture;
      this.matComposite.uniforms.tOverlay.value = this.overlayTex;
      this._pass(this.matComposite, this.baseRT);

      // 3. Bright pass -> level 0
      this.matBright.uniforms.tInput.value = this.baseRT.texture;
      this.matBright.uniforms.texel.value.set(1 / this.width, 1 / this.height);
      this.matBright.uniforms.threshold.value = look.bloomThreshold;
      this.matBright.uniforms.knee.value = look.bloomKnee;
      this._pass(this.matBright, this.downRTs[0]);

      // 4. Downsample chain
      for (let i = 1; i < this.levels; i++) {
        const src = this.downRTs[i - 1];
        this.matDown.uniforms.tInput.value = src.texture;
        this.matDown.uniforms.texel.value.set(1 / src.width, 1 / src.height);
        this._pass(this.matDown, this.downRTs[i]);
      }

      // 5. Upsample chain (tent filter, additive accumulation)
      let prev = this.downRTs[this.levels - 1];
      for (let i = this.levels - 2; i >= 0; i--) {
        this.matUp.uniforms.tInput.value = prev.texture;
        this.matUp.uniforms.tBase.value = this.downRTs[i].texture;
        this.matUp.uniforms.texel.value.set(1 / prev.width, 1 / prev.height);
        this.matUp.uniforms.radius.value = look.bloomRadius;
        this._pass(this.matUp, this.upRTs[i]);
        prev = this.upRTs[i];
      }

      // 6. Final grade to screen
      const u = this.matFinal.uniforms;
      u.tBase.value = this.baseRT.texture;
      u.tBloom.value = prev.texture;
      u.time.value = time;
      u.bloomStrength.value = look.bloomStrength / this.levels;
      u.bloomTint.value.fromArray(look.bloomTint);
      u.exposure.value = look.exposure;
      u.contrast.value = look.contrast;
      u.saturation.value = look.saturation;
      u.lift.value.fromArray(look.lift);
      u.gain.value.fromArray(look.gain);
      u.vignette.value = look.vignette;
      u.chroma.value = look.chroma;
      u.grain.value = look.grain;
      u.haze.value = look.haze;
      u.hazeColor.value.fromArray(look.hazeColor);
      u.fade.value = look.fade;
      this._pass(this.matFinal, null);

      r.autoClear = prevAutoClear;
    }
  }

  return { PostFX, DEFAULT_LOOK };
})();
