uniform sampler2D image;
uniform int chanel;
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
