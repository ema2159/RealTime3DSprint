const CCvertexShader = `
uniform sampler2D image;
uniform int chanel;
uniform int coordSystem;
varying vec3 color;

#define PI 3.14159265358979323846

vec3 rgb2xyz(vec3 c) {
  vec3 tmp;
  tmp.x = (c.r > 0.04045) ? pow((c.r + 0.055) / 1.055, 2.4) : c.r / 12.92;
  tmp.y = (c.g > 0.04045) ? pow((c.g + 0.055) / 1.055, 2.4) : c.g / 12.92;
  tmp.z = (c.b > 0.04045) ? pow((c.b + 0.055) / 1.055, 2.4) : c.b / 12.92;
  mat3 xyz_mat = mat3(0.4124, 0.3576, 0.1805, 0.2126, 0.7152, 0.0722, 0.0193,
                      0.1192, 0.9505);
  return xyz_mat * tmp;
}

vec3 rgb2lab(vec3 c) {
  vec3 xyz_norm = 100.0 * rgb2xyz(c) / vec3(95.047, 100.0, 108.883);

  vec3 lab;
  float delta = 6.0 / 29.0;

  lab.x = (xyz_norm.x > pow(delta, 3.0))
               ? pow(xyz_norm.x, 1.0 / 3.0)
               : (((1.0 / 3.0 * pow(delta, 2.0)) * xyz_norm.x) + (4.0 / 29.0));
  lab.y = (xyz_norm.y > pow(delta, 3.0))
               ? pow(xyz_norm.y, 1.0 / 3.0)
               : (((1.0 / 3.0 * pow(delta, 2.0)) * xyz_norm.y) + (4.0 / 29.0));
  lab.z = (xyz_norm.z > pow(delta, 3.0))
               ? pow(xyz_norm.z, 1.0 / 3.0)
               : (((1.0 / 3.0 * pow(delta, 2.0)) * xyz_norm.z) + (4.0 / 29.0));

  vec3 tmp;
  tmp.x = (116.0 * lab.y) - 16.0;
  tmp.y = 500.0 * (lab.x - lab.y);
  tmp.z = 200.0 * (lab.y - lab.z);

  return tmp;
}

vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

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
  vec3 pos = color;
  // Coord system transformation
  // XYZ
  if (coordSystem == 1) {
    pos = rgb2xyz(color);
  }
  // Lab
  if (coordSystem == 2) {
    vec3 lab_col = rgb2lab(color);
    pos.x = (lab_col[2]+86.185) / 184.439;
    pos.y = lab_col[0]/100.0;
    pos.z = (lab_col[1]+107.863) / 202.345;
  }
  // HSV
  if (coordSystem == 3) {
    vec3 hsv_col = rgb2hsv(color);
    float radius = hsv_col.y;
    float theta = hsv_col.x*2.0*PI;
    float height = hsv_col.z;
    pos.x = radius*cos(theta);
    pos.z = radius*sin(theta);
    pos.y = height;
    pos.x /= 2.0;
    pos.z /= 2.0;
    pos += vec3(.5, .0, .5);
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
