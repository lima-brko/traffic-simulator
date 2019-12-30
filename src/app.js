import {
  PerspectiveCamera,
  WebGLRenderer
} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import City from './components/City';

// Styles
import 'normalize.css';
import './styles/app.scss';

// Display elements
const carAccidentCount = document.getElementById('car_accident_count');
const carArrivalCount = document.getElementById('car_arrival_count');

// City initialization
const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 100, 5000);
camera.position.set(0, 950, 1400);

const DarwinCity = new City();
DarwinCity
  .on('carAccident', () => {
    carAccidentCount.textContent = parseInt(carAccidentCount.textContent, 10) + 1;
  })
  .on('carArrival', () => {
    carArrivalCount.textContent = parseInt(carArrivalCount.textContent, 10) + 1;
  });

const renderer = new WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 1800;

document.querySelector('#scene').appendChild(renderer.domElement);

(function animate() {
  DarwinCity.update();

  renderer.render(DarwinCity.scene, camera);
  requestAnimationFrame(animate);
}());
