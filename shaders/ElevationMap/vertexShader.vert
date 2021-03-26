varying vec2 vUv;
uniform float scaleElevation; 
uniform int chanel;
uniform int coordSystem;
uniform sampler2D image;

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
  vUv = uv;
  vec3 color = texture2D ( image, vUv ).rgb;
  float l;
  vec3 height;
  // Coord system transformation
  // RGB
  if (coordSystem == 0) {
    height = color;
  }
  // XYZ
  else if (coordSystem == 1) {
    height = rgb2xyz(color);
  }
  // Lab
  else if (coordSystem == 2) {
    vec3 lab_col = rgb2lab(color);
    height.x = lab_col[0]/100.0;
    height.y = (lab_col[2]+86.185) / 184.439;
    height.z = (lab_col[1]+107.863) / 202.345;
  }
  // HSV
  else if (coordSystem == 3) {
    height = rgb2hsv(color);
  }
  if(chanel==0) {
    l = length ( height );
  } else if(chanel==1) {
    l = height.r;
  } else if(chanel==2) {
    l = height.g;
  } else if(chanel==3) {
    l = height.b;
  }
  vec3 tmp = position;
  tmp.z = tmp.z + l*scaleElevation;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(tmp, 1.0);
}
