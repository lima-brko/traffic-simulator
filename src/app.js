import {
  PerspectiveCamera,
  Scene,
  BoxGeometry,
  MeshNormalMaterial,
  Mesh,
  WebGLRenderer,
  Color,
  Fog,
  DirectionalLight,
  Group,
  PlaneBufferGeometry,
  MeshBasicMaterial
} from 'three';

import City from './components/City';

let camera;
let scene;
let renderer;
let geometry;
let material;
let mesh;

init();
animate();

function init() {
  camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1500);
  camera.position.set(0, 0.1, 2);

  scene = new Scene();
  scene.background = new Color(0xf1f1f1);

  const DarwinCity = new City();
  scene.add(DarwinCity.model);

  // scene.add(mesh);

  renderer = new WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}
