const VvertexShader = `
varying vec2 vUv;
uniform float scaleElevation; 
uniform int chanel;
uniform sampler2D image;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`
const VfragmentShader = `
varying vec2 vUv;
uniform sampler2D tex;
uniform int chanel;

void main() {
  vec3 color = texture2D ( tex, vUv ).rgb;
  if(chanel==0) {
  } else if(chanel==1) {
    color = vec3(color.r, color.r, color.r);
  } else if(chanel==2) {
    color = vec3(color.g, color.g, color.g);
  } else if(chanel==3) {
    color = vec3(color.b, color.b, color.b);
  }
  gl_FragColor.rgb = color;
  gl_FragColor.a = 1.0;
}
`
export {VvertexShader, VfragmentShader}
