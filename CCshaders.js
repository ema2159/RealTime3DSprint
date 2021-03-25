const CCvertexShader = `
uniform sampler2D image;
varying vec3 color;

void main() {
  color = texture2D ( image, position.xy ).rgb;
  gl_PointSize = 1.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(color-vec3(.5,.5,.5), 1.0);
}
`
const CCfragmentShader = `
varying vec3 color;

void main() {
  gl_FragColor.rgb = color;
  gl_FragColor.a = 1.0;
}
`
export {CCvertexShader, CCfragmentShader}
