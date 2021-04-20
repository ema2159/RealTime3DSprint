import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import { VRButton } from 'https://unpkg.com/three@0.126.1/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";
import { Interaction } from "./vendor/three\.interaction/build/three\.interaction\.module.js";
import "./vendor/uil/build/uil.js";
import {EMvertexShader, EMfragmentShader} from "./shaders/EMshaders.js";
import {CCvertexShader, CCfragmentShader} from "./shaders/CCshaders.js";

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

scene.position.set(0, 0.5, -0.8);

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

// Add VR button
document.body.appendChild( VRButton.createButton( renderer ) );
renderer.xr.enabled = true;

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
    coordSystem: {type: "i", value: 0},
    chanel: {type: "i", value: 0},
  }

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
  plane.position.set(0, 0.08, -0.5);
  scene.add(plane);

  createElevationMap();
  createColorCloud();
  create3DGUI();
  createVideoInterface();

  video.play();
};

let EMMaterial;
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

  EMMaterial = new THREE.ShaderMaterial({
    uniforms: {
      scaleElevation: {type: "f", value: 0.1},
      ...commonUniforms,
    },
    vertexShader: EMvertexShader,
    fragmentShader: EMfragmentShader,
  });
  let plane = new THREE.Mesh(geometry, EMMaterial);
  plane.receiveShadow = false;
  plane.castShadow = false;
  plane.position.set(0, -0.5, 0);
  plane.rotation.x = -Math.PI/2;
  plane.material.side = THREE.DoubleSide;
  scene.add(plane);
};

let colorSpaceMaterial;
function createColorCloud() {
  let discret = 10;
  let points;

  colorSpaceMaterial = new THREE.ShaderMaterial({
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

  const ccpos = [1.7, 0, -0.3];
  points = new THREE.Points(CCgeometry, colorSpaceMaterial);
  points.position.set(...ccpos);
  points.rotation.y = Math.PI/2;
  scene.add(points);

  // Add grid helper
  const gridHelper1 = new THREE.GridHelper( 1, 10, 0x808080, 0x808080 );
  gridHelper1.position.set(ccpos[0], ccpos[1]-0.5, ccpos[2])
  scene.add( gridHelper1 );
  const gridHelper2 = new THREE.GridHelper( 1, 10, 0x808080, 0x808080 );
  gridHelper2.rotation.z = Math.PI/2;
  gridHelper2.position.set(ccpos[0]+0.5, ccpos[1], ccpos[2])
  scene.add( gridHelper2 );
  const gridHelper3 = new THREE.GridHelper( 1, 10, 0x808080, 0x808080 );
  gridHelper3.rotation.x = Math.PI/2;
  gridHelper3.position.set(ccpos[0], ccpos[1], ccpos[2]-0.5)
  scene.add( gridHelper3 );

  // Add axes
  const axesHelper = new THREE.AxesHelper(1);
  axesHelper.position.set(ccpos[0]-0.5, ccpos[1]-0.499, ccpos[2]+0.5);
  axesHelper.rotation.y = Math.PI/2;
  scene.add( axesHelper );
}

// GUI instantiation and elements
function create3DGUI() {
  // GUI variables, function and creation
  let ui2;
  let screen2 = null;
  let interactive = new THREE.Group();
  scene.add(interactive);
  let uiPlane = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1, 1 , 5, 1 ),
				new THREE.MeshBasicMaterial( { transparent:true } ) );
  uiPlane.position.z = 0;
  uiPlane.position.y = 0;
  uiPlane.position.x = -1;
  uiPlane.rotation.y = Math.PI/2;
  uiPlane.name = 'p2';
  uiPlane.visible = false;

  interactive.add( uiPlane );

  let cw = 600, ch = 148;

  let raycaster = new THREE.Raycaster();
  let mouse = new THREE.Vector2();
  let mouse2d = new THREE.Vector2();

  function raytest ( e ) {
    mouse.set( (e.clientX / window.innerWidth) * 2 - 1, - ( e.clientY / window.innerHeight) * 2 + 1 );
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( interactive.children );
    if ( intersects.length > 0 ){
      var uv = intersects[ 0 ].uv;
      mouse2d.x = Math.round( uv.x*cw );
      mouse2d.y = ch - Math.round( uv.y*ch );
      if( intersects[ 0 ].object.name === 'p2' ) {
	ui2.setMouse( mouse2d )
      }
      return true;
    } else {
      ui2.reset( true );
      return false;
    }
  }

  // Mouse events
  function onMouseUp( e ){
    e.preventDefault();
    if(!controls.enabled) controls.enabled = true;
  }

  function onMouseDown( e ){
    e.preventDefault();
    // If clicking GUI element, stop orbit controls
    controls.enabled = raytest( e ) ? false : true;
  }

  function onMouseMove( e ) {
    e.preventDefault();
    raytest( e );
  }

  document.addEventListener( 'pointerup', onMouseUp, false );
  document.addEventListener( 'pointerdown', onMouseDown, false );
  document.addEventListener( 'pointermove', onMouseMove, false );


  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }

  window.addEventListener( 'resize', resize, false );

  ui2 = new UIL.Gui( { w:cw, maxHeight:ch, parent:null, isCanvas:true } );
  ui2.add('title', { name:'Controls'});
  // Change color cloud coordinate system
  const coordsObject = {
    RBG: 0,
    XYZ: 1,
    Lab: 2,
    HSV: 3
  };
  ui2.add('list', {
    name:'Color coords',
    callback:(coord)=> {
      colorSpaceMaterial.uniforms.coordSystem = {type: "i", value: coordsObject[coord]};
      EMMaterial.uniforms.coordSystem = {type: "i", value: coordsObject[coord]};
    },
    list: Object.keys(coordsObject),
    value:"RGB"});
  // Change chanel
  const chanelObject = {
    All: 0,
    Ch1: 1,
    Ch2: 2,
    Ch3: 3
  };
  ui2.add('list', {
    name:'EM chanel',
    callback:(ch)=> {
      EMMaterial.uniforms.chanel = {type: "i", value: chanelObject[ch]};
    },
    list: Object.keys(chanelObject),
    value:"All"});

  ui2.onDraw = function () {

    if( screen2 === null ){

      screen2 = new THREE.Texture( this.canvas );
      screen2.minFilter = THREE.LinearFilter;
      screen2.needsUpdate = true;
      uiPlane.material.map = screen2;
      uiPlane.material.needsUpdate = true;
      uiPlane.visible = true;
      
    } else {

      screen2.needsUpdate = true;

    }

  }
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
      video.currentTime = video.currentTime - 10;
      console.log(video.currentTime);
    },
  };

  let buttonGeometry = createBoxWithRoundedEdges(0.1, 0.1, 0.02, 0.01, 3);

  let playButtonMaterial = new THREE.MeshBasicMaterial({
    // map: videoTexture,
    side: THREE.DoubleSide,
    color: 0xDA3C2F,
  });

  // Play/pause button
  let playPauseButton = new THREE.Mesh(buttonGeometry, playButtonMaterial);
  playPauseButton.position.set(0, -0.3,-0.5);
  scene.add(playPauseButton);
  playPauseButton.cursor = 'pointer';
  playPauseButton.on('click', pausePlayObj.pausePlay);
  playPauseButton.on('mouseover', function() {
    this.material.color.setHex(0xD03020);
  });
  playPauseButton.on('mouseout', function() {
    this.material.color.setHex(0xDA3C2F);
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

renderer.setAnimationLoop( function () {
  renderer.render(scene, camera);
} );
