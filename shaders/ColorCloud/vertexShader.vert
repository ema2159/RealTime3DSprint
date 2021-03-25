uniform sampler2D tex;
varying vec3 color;

void main() {
  color = texture2D ( tex, position.xy ).rgb;
  gl_PointSize = 1.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(color-vec3(.5,.5,.5), 1.0);
}
