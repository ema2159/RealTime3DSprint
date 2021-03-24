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

// Basic controls
// Function for creating boxes with rounded edges
function createBoxWithRoundedEdges( width, height, depth, radius0, smoothness ) {
  let shape = new THREE.Shape();
  let eps = 0.00001;
  let radius = radius0 - eps;
  shape.absarc( eps, eps, eps, -Math.PI / 2, -Math.PI, true );
  shape.absarc( eps, height -  radius * 2, eps, Math.PI, Math.PI / 2, true );
  shape.absarc( width - radius * 2, height -  radius * 2, eps, Math.PI / 2, 0, true );
  shape.absarc( width - radius * 2, eps, eps, 0, -Math.PI / 2, true );
  let geometry = new THREE.ExtrudeBufferGeometry( shape, {
    amount: depth - radius0 * 2,
    bevelEnabled: true,
    bevelSegments: smoothness * 2,
    steps: 1,
    bevelSize: radius,
    bevelThickness: radius0,
    curveSegments: smoothness
  });

  geometry.center();

  return geometry;
};

// Function for creating the play/pause, forward and backward buttons for the video.
function createVideoInterface() {
  let pausePlayObj = {
    pausePlay: function () {
      if (!video.paused) {
	console.log("pause");
	video.pause();
      } else {
	console.log("play");
	video.play();
      }
    },
    add10sec: function () {
      video.currentTime = video.currentTime + 10;
      console.log(video.currentTime);
    },
    remove10sec: function () {
      video.currentTime = video.currentTime - 1;
      console.log(video.currentTime);
    },
  };

  let buttonGeometry = createBoxWithRoundedEdges(0.2, 0.1, 0.02, 0.01, 3);

  let buttonMaterial = new THREE.MeshBasicMaterial({
    // map: videoTexture,
    side: THREE.DoubleSide,
    color: 0xDADADA,
  });

  let playPauseButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
  playPauseButton.position.set(0, -0.3,-0.5);
  scene.add(playPauseButton);
  playPauseButton.cursor = 'pointer';
  playPauseButton.on('click', pausePlayObj.pausePlay);
}

createVideoInterface();

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
