varying vec2 vUv;
uniform sampler2D tex;
uniform int coordSystem;
uniform int chanel;

void main() {
  vec3 color = texture2D ( tex, vUv ).rgb;
  if(coordSystem==0) {
    if(chanel==0) {
    } else if(chanel==1) {
      color = vec3(color.r, 0.0, 0.0);
    } else if(chanel==2) {
      color = vec3(0.0, color.g, 0.0);
    } else if(chanel==3) {
      color = vec3(0.0, 0.0, color.b);
    }
  }
  gl_FragColor.rgb = color;
  gl_FragColor.a = 1.0;
}
