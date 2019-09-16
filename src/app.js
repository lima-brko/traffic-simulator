import {
  PerspectiveCamera,
  WebGLRenderer
} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import City from './components/City';

// Styles
import 'normalize.css';
import './styles/app.scss';

const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 100, 5000);
camera.position.set(0, 120, 400);

const DarwinCity = new City();
camera.lookAt(DarwinCity.cars[0]);

const renderer = new WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 1000;

document.querySelector('#scene').appendChild(renderer.domElement);

(function animate() {
  DarwinCity.update();

  renderer.render(DarwinCity.scene, camera);
  requestAnimationFrame(animate);
}());
