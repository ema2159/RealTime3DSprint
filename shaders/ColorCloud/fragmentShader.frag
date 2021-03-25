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
