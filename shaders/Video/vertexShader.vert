varying vec2 vUv;
uniform float scaleElevation; 
uniform int chanel;
uniform sampler2D image;

void main() {
  vUv = uv;
  vec3 color = texture2D ( image, vUv ).rgb;
  vec3 pos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
