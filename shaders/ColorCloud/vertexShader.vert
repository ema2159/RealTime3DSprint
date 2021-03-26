uniform sampler2D image;
uniform int chanel;
uniform int coordSystem;
varying vec3 color;

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
  size *= 3.0;
  gl_PointSize = 1.0*size;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(color-vec3(.5,.5,.5), 1.0);
}
