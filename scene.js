import * as THREE from "https://unpkg.com/three/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three/examples/jsm/controls/OrbitControls.js";
import { Interaction } from "./vendor/three\.interaction/build/three\.interaction\.module.js";
import {GUI} from "https://unpkg.com/three/examples/jsm/libs/dat.gui.module.js";
import {EMvertexShader, EMfragmentShader} from "./EMshaders.js";
import {CCvertexShader, CCfragmentShader} from "./CCshaders.js";
import {VvertexShader, VfragmentShader} from "./Vshaders.js";

// Setup scene
let scene = new THREE.Scene();
const loader = new THREE.TextureLoader();
const texture = loader.load(
  "./assets/panMap/milky.jpg",
  () => {
    const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
    rt.fromEquirectangularTexture(renderer, texture);
    scene.background = rt;
  });

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

// Common shader uniforms
let commonUniforms;

// Create video
let video = document.createElement("video");
let videoTexture;
video.src = "./assets/video.mp4";
video.load();
video.muted = true;
video.loop = true;

video.onloadeddata = function () {
  videoTexture = new THREE.VideoTexture(video);
  videoTexture.wrapS = videoTexture.wrapT = THREE.RepeatWrapping;
  videoTexture.generateMipmaps = false;
  videoTexture.format = THREE.RGBFormat;

  commonUniforms = {
    image: {value: videoTexture},
    chanel: {type: "i", value: 0},
  }

  let geometry = new THREE.PlaneGeometry(
    1,
    video.videoHeight / video.videoWidth
  );
  let videoMaterial = new THREE.ShaderMaterial({
    uniforms: {
      scaleElevation: {type: "f", value: 0.2},
      ...commonUniforms,
    },
    vertexShader: VvertexShader,
    fragmentShader: VfragmentShader,
    side: THREE.DoubleSide,
  });
  let plane = new THREE.Mesh(geometry, videoMaterial);
  plane.receiveShadow = false;
  plane.castShadow = false;
  plane.position.set(0, 0.08, -0.5);
  scene.add(plane);

  createElevationMap();
  createColorCloud();
  createGUI();
  createVideoInterface();

  video.play();
};

let videoMaterial;
function createElevationMap() {
  let discrete = 8;
  console.log("Plane horizontal and vertical segments:",
	      [video.videoWidth/discrete, video.videoHeight/discrete]);
  let geometry = new THREE.PlaneGeometry(
    1,
    video.videoHeight / video.videoWidth,
    video.videoWidth/discrete,
    video.videoHeight/discrete,
  );

  videoMaterial = new THREE.ShaderMaterial({
    uniforms: {
      scaleElevation: {type: "f", value: 0.2},
      ...commonUniforms,
    },
    vertexShader: EMvertexShader,
    fragmentShader: EMfragmentShader,
  });
  let plane = new THREE.Mesh(geometry, videoMaterial);
  plane.receiveShadow = false;
  plane.castShadow = false;
  plane.position.set(-1, -0.2, 0);
  plane.rotation.x = -Math.PI/2;
  plane.rotation.z = Math.PI/2;
  plane.material.side = THREE.DoubleSide;
  scene.add(plane);
};

function createColorCloud() {
  let discret = 10;
  let points;

  let colorSpaceMaterial = new THREE.ShaderMaterial({
    vertexShader: CCvertexShader,
    fragmentShader: CCfragmentShader,
    uniforms: {
      ...commonUniforms
    }
  });

  const CCgeometry = new THREE.BufferGeometry();
  const positions = [];
  let counter = 0;
  for (let i = 0; i < video.videoHeight; i += discret)
    for (let j = 0; j < video.videoWidth; j += discret) {
      // positions

      const x = (i+0.5) / video.videoHeight;
      const y = (j+0.5) / video.videoWidth;
      const z = 0;

      positions.push(x, y, z);
      counter++;
    }

  CCgeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  CCgeometry.computeBoundingSphere();

  points = new THREE.Points(CCgeometry, colorSpaceMaterial);
  points.position.set(1.5, 0, -0.3);
  scene.add(points);
}

// Fixed GUI
function createGUI() {
  let cameraControls = {
    goToVideo: function () {
      camera.position.set(0, 0, 0);
      controls.target.set(0, 0, -2);
      controls.update();
    },
    goToEMap: function () {
      camera.position.set(0, 0.5, 0);
      controls.target.set(-2, 0, 0);
      controls.update();
    },
    goToCCloud: function () {
      camera.position.set(-0.7, 0.4, 0.5);
      controls.target.set(1.5, 0, -0.5);
      controls.update();
    },
    showAll: function () {
      camera.position.set(0, 0.6, 1.4);
      controls.target.set(0, 0, 0);
      controls.update();
    },
  };

  let gui = new GUI();
  gui.add(cameraControls, "goToVideo").name("Go to video");
  gui.add(cameraControls, "goToEMap").name("Go to elev. map");
  gui.add(cameraControls, "goToCCloud").name("Go to color cloud");
  gui.add(cameraControls, "showAll").name("Show all");
  gui
    .add(commonUniforms.chanel, "value", {RGB: 0, R: 1, G: 2, B: 3})
    .name("Chanel");
}

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

  let buttonGeometry = createBoxWithRoundedEdges(0.1, 0.1, 0.02, 0.01, 3);

  let playButtonMaterial = new THREE.MeshBasicMaterial({
    // map: videoTexture,
    side: THREE.DoubleSide,
    color: 0xDADADA,
  });

  // Play/pause button
  let playPauseButton = new THREE.Mesh(buttonGeometry, playButtonMaterial);
  playPauseButton.position.set(0, -0.3,-0.5);
  scene.add(playPauseButton);
  playPauseButton.cursor = 'pointer';
  playPauseButton.on('click', pausePlayObj.pausePlay);
  playPauseButton.on('mouseover', function() {
    this.material.color.setHex(0xB0B0B0);
  });
  playPauseButton.on('mouseout', function() {
    this.material.color.setHex(0xDADADA);
  });

  // Forward and backward buttons
  let forwardButtonMaterial = new THREE.MeshBasicMaterial({
    // map: videoTexture,
    side: THREE.DoubleSide,
    color: 0xDADADA,
  });

  let forwardButton = new THREE.Mesh(buttonGeometry, forwardButtonMaterial);
  forwardButton.position.set(0.15, -0.3,-0.5);
  scene.add(forwardButton);
  forwardButton.cursor = 'pointer';
  forwardButton.on('click', pausePlayObj.add10sec);
  forwardButton.on('mouseover', function() {
    this.material.color.setHex(0xB0B0B0);
  });
  forwardButton.on('mouseout', function() {
    this.material.color.setHex(0xDADADA);
  });

  let backwardButtonMaterial = new THREE.MeshBasicMaterial({
    // map: videoTexture,
    side: THREE.DoubleSide,
    color: 0xDADADA,
  });

  let backwardButton = new THREE.Mesh(buttonGeometry, backwardButtonMaterial);
  backwardButton.position.set(-0.15, -0.3,-0.5);
  scene.add(backwardButton);
  backwardButton.cursor = 'pointer';
  backwardButton.on('click', pausePlayObj.remove10sec);
  backwardButton.on('mouseover', function() {
    this.material.color.setHex(0xB0B0B0);
  });
  backwardButton.on('mouseout', function() {
    this.material.color.setHex(0xDADADA);
  });
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
