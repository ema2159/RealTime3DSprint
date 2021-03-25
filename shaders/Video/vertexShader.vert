varying vec2 vUv;
uniform float scaleElevation; 
uniform int chanel;
uniform sampler2D image;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
