varying vec2 vUv;
uniform sampler2D tex;

void main() {
  vec3 color = texture2D ( tex, vUv ).rgb;
  gl_FragColor.rgb = color;
  gl_FragColor.a = 1.0;
}
