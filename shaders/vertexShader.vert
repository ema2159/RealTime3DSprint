varying vec2 vUv;
uniform float scaleElevation; 
uniform vec2 stepPixel;
uniform sampler2D image;

void main() {
  vUv = uv;
  vec3 color = texture2D ( image, vUv ).rgb;
  float l = length ( color );
  vec3 tmp = position;
  tmp.z = tmp.z + l*scaleElevation;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(tmp, 1.0);
}
