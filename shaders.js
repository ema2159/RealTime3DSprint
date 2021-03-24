const vertexShader = `
varying vec2 vUv;
uniform float scaleElevation; 
uniform int chanel;
uniform sampler2D image;

void main() {
  vUv = uv;
  vec3 color = texture2D ( image, vUv ).rgb;
  float l;
  if(chanel==0) {
    l = length ( color );
  } else if(chanel==1) {
    l = color.r;
  } else if(chanel==2) {
    l = color.g;
  } else if(chanel==3) {
    l = color.b;
  }
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
