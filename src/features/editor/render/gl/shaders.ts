export const VERTEX = `#version 300 es
in vec2 aPosition;
out vec2 vUv;
uniform bool uFlipY;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  if (uFlipY) vUv.y = 1.0 - vUv.y;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const HEADER = `#version 300 es
precision highp float;
precision highp sampler3D;
in vec2 vUv;
out vec4 outColor;
float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
`;

export const COLOR = `${HEADER}
uniform sampler2D uSource;
uniform sampler2D uCurves;
uniform sampler2D uHue;
uniform sampler3D uLut;
uniform bool uBasic, uCurvesOn, uWheelsOn, uHueOn, uLutOn, uChroma, uInvert;
uniform float uExposure, uContrast, uHighlights, uShadows, uBlacks, uWhites;
uniform float uTemperature, uTint, uVibrance, uSaturation, uDehaze;
uniform vec3 uLift, uGamma, uGain;
uniform float uLutIntensity;
uniform vec3 uKeyColor;
uniform float uKeyTolerance, uKeySpill;

vec3 ycbcr(vec3 c) {
  return vec3(luma(c), 0.5 + (c.b - luma(c)) * 0.5389, 0.5 + (c.r - luma(c)) * 0.6350);
}

void main() {
  vec4 src = texture(uSource, vUv);
  vec3 c = src.a > 0.0 ? src.rgb / src.a : src.rgb;
  float a = src.a;

  if (uChroma) {
    float dist = distance(ycbcr(c).yz, ycbcr(uKeyColor).yz);
    float alpha = smoothstep(uKeyTolerance * 0.5, uKeyTolerance * 0.5 + 0.08, dist);
    vec3 key = normalize(uKeyColor + 1e-5);
    float spill = max(0.0, dot(c, key) - luma(c)) * uKeySpill;
    c -= key * spill;
    a *= alpha;
  }

  if (uBasic) {
    c *= exp2(uExposure);
    c.r += uTemperature * 0.1;
    c.b -= uTemperature * 0.1;
    c.g -= uTint * 0.1;
    float bp = -uBlacks * 0.15;
    float wp = 1.0 - uWhites * 0.15;
    c = (c - bp) / max(wp - bp, 1e-3);
    float l = luma(c);
    c += uShadows * 0.35 * (1.0 - smoothstep(0.0, 0.5, l));
    c += uHighlights * 0.35 * smoothstep(0.5, 1.0, l);
    c = (c - 0.5) * (1.0 + uContrast) + 0.5;
    if (uDehaze != 0.0) {
      c = (c - uDehaze * 0.08) / (1.0 - uDehaze * 0.08);
    }
    float gray = luma(c);
    float sat = max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b));
    c = mix(vec3(gray), c, 1.0 + uVibrance * (1.0 - sat));
    c = mix(vec3(gray), c, 1.0 + uSaturation);
  }

  if (uWheelsOn) {
    c = clamp(c, 0.0, 1.0);
    c = c + uLift * (1.0 - c);
    c = c * (1.0 + uGain);
    c = pow(max(c, 0.0), 1.0 / max(1.0 + uGamma, vec3(0.05)));
  }

  c = clamp(c, 0.0, 1.0);

  if (uCurvesOn) {
    c = vec3(texture(uCurves, vec2(c.r, 0.5)).r, texture(uCurves, vec2(c.g, 0.5)).g, texture(uCurves, vec2(c.b, 0.5)).b);
  }

  if (uHueOn) {
    vec3 hsv = rgb2hsv(c);
    vec3 h = texture(uHue, vec2(hsv.x, 0.5)).rgb;
    hsv.x = fract(hsv.x + (h.r - 0.5));
    hsv.y = clamp(hsv.y * h.g * 2.0, 0.0, 1.0);
    hsv.z = clamp(hsv.z + (h.b - 0.5), 0.0, 1.0);
    c = hsv2rgb(hsv);
  }

  if (uLutOn) {
    vec3 graded = texture(uLut, clamp(c, 0.0, 1.0)).rgb;
    c = mix(c, graded, uLutIntensity);
  }

  if (uInvert) c = 1.0 - c;
  outColor = vec4(clamp(c, 0.0, 1.0) * a, a);
}`;

export const BLUR = `${HEADER}
uniform sampler2D uSource;
uniform vec2 uDirection;
uniform float uRadius;
void main() {
  if (uRadius < 0.5) { outColor = texture(uSource, vUv); return; }
  vec4 sum = vec4(0.0);
  float total = 0.0;
  float sigma = uRadius / 2.0;
  for (int i = -24; i <= 24; i++) {
    float x = float(i) * uRadius / 24.0;
    float w = exp(-(x * x) / (2.0 * sigma * sigma));
    sum += texture(uSource, vUv + uDirection * x) * w;
    total += w;
  }
  outColor = sum / total;
}`;

export const DENOISE = `${HEADER}
uniform sampler2D uSource;
uniform vec2 uTexel;
uniform float uStrength;
void main() {
  vec4 center = texture(uSource, vUv);
  vec4 sum = vec4(0.0);
  float total = 0.0;
  for (int x = -2; x <= 2; x++) {
    for (int y = -2; y <= 2; y++) {
      vec4 s = texture(uSource, vUv + vec2(x, y) * uTexel * 1.5);
      float d = distance(s.rgb, center.rgb);
      float w = exp(-d * d / (2.0 * 0.01 * uStrength + 1e-4)) * exp(-float(x * x + y * y) / 8.0);
      sum += s * w;
      total += w;
    }
  }
  outColor = mix(center, sum / total, clamp(uStrength, 0.0, 1.0));
}`;

export const DETAIL = `${HEADER}
uniform sampler2D uSource;
uniform sampler2D uBlurred;
uniform sampler2D uWide;
uniform float uSharpen, uClarity, uGlow, uGlowThreshold, uGlowWarmth;
void main() {
  vec4 base = texture(uSource, vUv);
  vec4 near = texture(uBlurred, vUv);
  vec4 wide = texture(uWide, vUv);
  vec3 c = base.rgb;
  c += (base.rgb - near.rgb) * uSharpen * 2.0;
  float l = luma(base.rgb / max(base.a, 1e-4));
  float mid = 1.0 - abs(l - 0.5) * 2.0;
  c += (base.rgb - wide.rgb) * uClarity * mid * 1.5;
  vec3 bright = max(wide.rgb - vec3(uGlowThreshold) * wide.a, 0.0);
  vec3 warm = mix(vec3(1.0), vec3(1.25, 1.0, 0.75), uGlowWarmth);
  c += bright * warm * uGlow * 2.0;
  outColor = vec4(clamp(c, 0.0, base.a), base.a);
}`;

export const FINAL = `${HEADER}
uniform sampler2D uSource;
uniform float uVignette, uVignetteMid, uVignetteRound, uVignetteFeather;
uniform float uGrain, uGrainSize, uTime;
uniform float uSoftness;
uniform vec2 uResolution;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec4 c = texture(uSource, vUv);
  if (uVignette != 0.0) {
    vec2 d = vUv - 0.5;
    float aspect = uResolution.x / uResolution.y;
    d.x *= mix(1.0, aspect, clamp(uVignetteRound * 0.5 + 0.5, 0.0, 1.0));
    float r = length(d) * 1.4142;
    float v = smoothstep(uVignetteMid, uVignetteMid + max(uVignetteFeather, 0.01), r);
    c.rgb = uVignette > 0.0 ? mix(c.rgb, vec3(0.0), v * uVignette) : mix(c.rgb, vec3(c.a), v * -uVignette);
  }
  if (uGrain > 0.0) {
    vec2 cell = floor(vUv * uResolution / max(uGrainSize, 1.0));
    float n = hash(cell + uTime) - 0.5;
    c.rgb = clamp(c.rgb + n * uGrain * 0.35 * c.a, 0.0, c.a);
  }
  if (uSoftness > 0.0) {
    vec2 edge = min(vUv, 1.0 - vUv);
    float m = smoothstep(0.0, uSoftness * 0.5, min(edge.x, edge.y));
    c *= m;
  }
  outColor = c;
}`;
