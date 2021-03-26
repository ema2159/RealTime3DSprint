const CCvertexShader = `
uniform sampler2D image;
uniform int chanel;
uniform int coordSystem;
varying vec3 color;

void main() {
  color = texture2D ( image, position.xy ).rgb;
  float size;
  if(chanel==0) {
    size = color.r+color.g+color.b;
  } else if(chanel==1) {
    size = color.r;
  } else if(chanel==2) {
    size = color.g;
  } else if(chanel==3) {
    size = color.b;
  }
  size *= 3.0;
  gl_PointSize = 1.0*size;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(color-vec3(.5,.5,.5), 1.0);
}
`
const CCfragmentShader = `
uniform int chanel;

varying vec3 color;

void main() {
  vec3 col;
  if(chanel==0) {
    col = color;
  } else if(chanel==1) {
    col = vec3(color.r, 0.0, 0.0);
  } else if(chanel==2) {
    col = vec3(0.0, color.g, 0.0);
  } else if(chanel==3) {
    col = vec3(0.0, 0.0, color.b);
  }
  gl_FragColor.rgb = col;
  gl_FragColor.a = 1.0;
}
`
export {CCvertexShader, CCfragmentShader}
