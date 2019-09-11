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
  //   scene.fog = new Fog(0x000000, 250, 1400);

  //   const dirLight = DirectionalLight(0xffffff, 0.125);
  //   dirLight.position.set(0, 0, 1).normalize();
  //   scene.add(dirLight);

  //   const group = Group();
  //   group.position.y = 100;

  //   scene.add(group);

  const plane = new Mesh(
    new PlaneBufferGeometry(10000, 10000),
    new MeshBasicMaterial({color: 0xff6600, opacity: 0.5, transparent: true})
  );
  plane.position.set(0, 0, 0);
  plane.rotation.x = -Math.PI / 2;
  scene.add(plane);

  geometry = new BoxGeometry(0.2, 0.2, 0.2);
  material = new MeshNormalMaterial();

  mesh = new Mesh(geometry, material);
  mesh.position.set(0, 0.1, 0);
  scene.add(mesh);

  renderer = new WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function animate() {
  requestAnimationFrame(animate);

  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.02;

  renderer.render(scene, camera);
}
