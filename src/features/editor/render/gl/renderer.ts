import type { Grade } from '@/features/editor/model/types';
import { BLUR, COLOR, DENOISE, DETAIL, FINAL, VERTEX } from '@/features/editor/render/gl/shaders';
import { curveTexture, hueTexture, sectionActive, type CubeLut } from '@/features/editor/render/gl/luts';

type Uniforms = Record<string, number | boolean | number[]>;

interface Program {
  program: WebGLProgram;
  locations: Map<string, WebGLUniformLocation | null>;
}

interface Target {
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
}

const hexToRgb = (hex: string) => {
  const value = Number.parseInt(hex.replace('#', '').slice(0, 6), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
};

const wheel = (w: Grade['wheels']['lift'], strength: number) => {
  const angle = Math.atan2(w.y, w.x);
  const amount = Math.min(1, Math.hypot(w.x, w.y));
  const tint = [0, 2, 4].map(offset => Math.cos(angle - (offset * Math.PI) / 3) * amount * strength * 0.5);
  return tint.map(t => t + w.master * strength);
};

export class GradeRenderer {
  private gl: WebGL2RenderingContext;
  private programs = new Map<string, Program>();
  private source: WebGLTexture;
  private curves: WebGLTexture;
  private hue: WebGLTexture;
  private lut: WebGLTexture;
  private targets: Target[] = [];
  private size = { width: 0, height: 0 };
  private curvesKey = '';
  private hueKey = '';
  private lutKey = '';

  constructor(readonly canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, preserveDrawingBuffer: true });
    if (!gl) throw new Error('WebGL2 is not available');
    this.gl = gl;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    for (const [name, source] of Object.entries({ COLOR, BLUR, DENOISE, DETAIL, FINAL })) {
      this.programs.set(name, this.compile(source));
    }
    this.source = this.texture();
    this.curves = this.texture();
    this.hue = this.texture();
    this.lut = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_3D, this.lut);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    for (const wrap of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T, gl.TEXTURE_WRAP_R])
      gl.texParameteri(gl.TEXTURE_3D, wrap, gl.CLAMP_TO_EDGE);
    gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA, 1, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  }

  private compile(fragment: string): Program {
    const gl = this.gl;
    const shader = (type: number, code: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, code);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'Shader error');
      return s;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, shader(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragment));
    gl.bindAttribLocation(program, 0, 'aPosition');
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error(gl.getProgramInfoLog(program) ?? 'Link error');
    return { program, locations: new Map() };
  }

  private texture() {
    const gl = this.gl;
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    return texture;
  }

  private resize(width: number, height: number) {
    if (this.size.width === width && this.size.height === height) return;
    const gl = this.gl;
    this.size = { width, height };
    this.canvas.width = width;
    this.canvas.height = height;
    for (const target of this.targets) {
      gl.deleteTexture(target.texture);
      gl.deleteFramebuffer(target.framebuffer);
    }
    this.targets = Array.from({ length: 4 }, () => {
      const texture = this.texture();
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      const framebuffer = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      return { texture, framebuffer };
    });
  }

  private pass(name: string, inputs: WebGLTexture[], output: Target | null, uniforms: Uniforms, flipY = false) {
    const gl = this.gl;
    const program = this.programs.get(name)!;
    gl.useProgram(program.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, output?.framebuffer ?? null);
    gl.viewport(0, 0, this.size.width, this.size.height);
    const location = (key: string) => {
      if (!program.locations.has(key)) program.locations.set(key, gl.getUniformLocation(program.program, key));
      return program.locations.get(key)!;
    };
    const samplers = name === 'COLOR' ? ['uSource', 'uCurves', 'uHue'] : ['uSource', 'uBlurred', 'uWide'];
    inputs.forEach((texture, i) => {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(location(samplers[i]), i);
    });
    if (name === 'COLOR') {
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_3D, this.lut);
      gl.uniform1i(location('uLut'), 3);
    }
    gl.uniform1i(location('uFlipY'), flipY ? 1 : 0);
    for (const [key, value] of Object.entries(uniforms)) {
      const loc = location(key);
      if (typeof value === 'boolean') gl.uniform1i(loc, value ? 1 : 0);
      else if (typeof value === 'number') gl.uniform1f(loc, value);
      else if (value.length === 2) gl.uniform2fv(loc, value);
      else gl.uniform3fv(loc, value);
    }
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private blur(input: WebGLTexture, scratch: Target, output: Target, radius: number, angle?: number) {
    const texel = [1 / this.size.width, 1 / this.size.height];
    if (angle !== undefined) {
      const rad = (angle * Math.PI) / 180;
      this.pass('BLUR', [input], output, {
        uDirection: [Math.cos(rad) * texel[0], Math.sin(rad) * texel[1]],
        uRadius: radius,
      });
      return output;
    }
    this.pass('BLUR', [input], scratch, { uDirection: [texel[0], 0], uRadius: radius });
    this.pass('BLUR', [scratch.texture], output, { uDirection: [0, texel[1]], uRadius: radius });
    return output;
  }

  setLut(lut: CubeLut | null, key: string) {
    if (this.lutKey === key) return;
    this.lutKey = key;
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_3D, this.lut);
    const size = lut?.size ?? 1;
    gl.texImage3D(
      gl.TEXTURE_3D,
      0,
      gl.RGBA,
      size,
      size,
      size,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      lut?.data ?? new Uint8Array(4),
    );
  }

  render(source: TexImageSource, width: number, height: number, grade: Grade, softness: number, frame: number) {
    const gl = this.gl;
    this.resize(Math.max(1, Math.round(width)), Math.max(1, Math.round(height)));
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, this.source);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

    const curvesKey = JSON.stringify(grade.curves);
    if (curvesKey !== this.curvesKey) {
      this.curvesKey = curvesKey;
      gl.bindTexture(gl.TEXTURE_2D, this.curves);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, curveTexture(grade.curves));
    }
    const hueKey = JSON.stringify(grade.hueCurves);
    if (hueKey !== this.hueKey) {
      this.hueKey = hueKey;
      gl.bindTexture(gl.TEXTURE_2D, this.hue);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, hueTexture(grade.hueCurves));
    }

    const { basic, wheels, lut, effects: fx } = grade;
    const fxOn = sectionActive.effects(grade);
    const [a, b, c, d] = this.targets;

    this.pass(
      'COLOR',
      [this.source, this.curves, this.hue],
      a,
      {
        uBasic: sectionActive.basic(grade) || (fxOn && fx.dehaze !== 0),
        uCurvesOn: sectionActive.curves(grade),
        uWheelsOn: sectionActive.wheels(grade),
        uHueOn: sectionActive.hueCurves(grade),
        uLutOn: sectionActive.lut(grade) && this.lutKey !== '',
        uChroma: fxOn && fx.chromaKey,
        uInvert: fxOn && fx.invert,
        uExposure: basic.enabled ? basic.exposure : 0,
        uContrast: basic.enabled ? basic.contrast : 0,
        uHighlights: basic.enabled ? basic.highlights : 0,
        uShadows: basic.enabled ? basic.shadows : 0,
        uBlacks: basic.enabled ? basic.blacks : 0,
        uWhites: basic.enabled ? basic.whites : 0,
        uTemperature: basic.enabled ? basic.temperature : 0,
        uTint: basic.enabled ? basic.tint : 0,
        uVibrance: basic.enabled ? basic.vibrance : 0,
        uSaturation: basic.enabled ? basic.saturation : 0,
        uDehaze: fxOn ? fx.dehaze : 0,
        uLift: wheel(wheels.lift, 0.25),
        uGamma: wheel(wheels.gamma, 0.5),
        uGain: wheel(wheels.gain, 0.5),
        uLutIntensity: lut.intensity,
        uKeyColor: hexToRgb(fx.chromaColor),
        uKeyTolerance: fx.chromaTolerance,
        uKeySpill: fx.chromaSpill,
      },
      true,
    );
    let current = a;
    const swap = (next: Target) => {
      current = next;
    };

    if (fxOn && fx.noiseReduction > 0) {
      const out = current === a ? b : a;
      this.pass('DENOISE', [current.texture], out, {
        uTexel: [1 / this.size.width, 1 / this.size.height],
        uStrength: fx.noiseReduction,
      });
      swap(out);
    }
    if (fxOn && fx.blur > 0) {
      const out = current === a ? b : a;
      swap(this.blur(current.texture, c, out, fx.blur));
    }
    if (fxOn && fx.motionBlur > 0) {
      const out = current === a ? b : a;
      swap(this.blur(current.texture, c, out, fx.motionBlur, fx.motionAngle));
    }
    if (fxOn && (fx.sharpen > 0 || fx.clarity !== 0 || fx.glow > 0)) {
      this.blur(current.texture, d, c, 2);
      const wide = current === a ? b : a;
      this.blur(current.texture, d, wide, Math.max(fx.glowRadius, 12));
      this.pass('DETAIL', [current.texture, c.texture, wide.texture], d, {
        uSharpen: fx.sharpen,
        uClarity: fx.clarity,
        uGlow: fx.glow,
        uGlowThreshold: fx.glowThreshold,
        uGlowWarmth: fx.glowWarmth,
      });
      swap(d);
    }

    this.pass('FINAL', [current.texture], null, {
      uVignette: fxOn ? fx.vignette : 0,
      uVignetteMid: fx.vignetteMidpoint,
      uVignetteRound: fx.vignetteRoundness,
      uVignetteFeather: fx.vignetteFeather,
      uGrain: fxOn ? fx.grain : 0,
      uGrainSize: fx.grainSize,
      uTime: frame % 997,
      uSoftness: softness,
      uResolution: [this.size.width, this.size.height],
    });
  }

  dispose() {
    this.gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
}
