import * as THREE from "https://unpkg.com/three/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three/examples/jsm/controls/OrbitControls.js";
import { Interaction } from "./vendor/three\.interaction/build/three\.interaction\.module.js";

// Setup scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0A0A0A);

// Camera configuration
// Parameters: FOV, aspect ratio, minimum rendering distance, maximum rendering distance
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.x = 0;
camera.position.z = 0;

// Renderer setup
const renderer = new THREE.WebGLRenderer();
// Set renderer size (window size)
renderer.setSize(window.innerWidth, window.innerHeight);

// Setup Interactive module
const interaction = new Interaction(renderer, scene, camera);

// Setup orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, -2);
controls.listenToKeyEvents(window); // optional

// Append renderer to index.html body
document.body.appendChild(renderer.domElement);

// Create video
let video = document.createElement("video");
video.src = "./assets/video.mp4";
video.load();
video.muted = true;
video.loop = true;

video.onloadeddata = function () {
  let videoTexture = new THREE.VideoTexture(video);
  videoTexture.wrapS = videoTexture.wrapT = THREE.RepeatWrapping;
  videoTexture.minFilter = THREE.NearestFilter;
  videoTexture.magFilter = THREE.NearestFilter;
  videoTexture.generateMipmaps = false;
  videoTexture.format = THREE.RGBFormat;

  let geometry = new THREE.PlaneGeometry(
    1,
    video.videoHeight / video.videoWidth
  );
  let videoMaterial = new THREE.MeshBasicMaterial({
    map: videoTexture,
    side: THREE.DoubleSide,
  });
  let plane = new THREE.Mesh(geometry, videoMaterial);
  plane.receiveShadow = false;
  plane.castShadow = false;
  plane.position.z = -0.5;
  plane.position.y = 0.08;
  scene.add(plane);

  video.play();
};

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
