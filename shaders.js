const vertexShader = `
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
`
const fragmentShader = `
varying vec2 vUv;
uniform sampler2D tex;

void main() {
  vec3 color = texture2D ( tex, vUv ).rgb;
  gl_FragColor.rgb = color;
  gl_FragColor.a = 1.0;
}
`
export {vertexShader, fragmentShader}
