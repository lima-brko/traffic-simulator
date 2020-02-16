import {
  PerspectiveCamera,
  WebGLRenderer
} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import City from './components/City';

// Controller elements
const config = {
  carsTotal: 40,
  roadsTotal: 4,
  roadLanes: 3
};
const scene = document.querySelector('#scene');
const carAccidentCount = document.getElementById('car_accident_count');
const carArrivalCount = document.getElementById('car_arrival_count');
const btnToggleTrafficSignals = document.getElementById('btn_toggle_traffic_signals');
const btnGenerateCity = document.getElementById('btn_generate_city');
let DarwinCity;
let camera;
let renderer;

function resetCounters() {
  carAccidentCount.textContent = 0;
  carArrivalCount.textContent = 0;
  btnToggleTrafficSignals.checked = true;
}

function generateCity() {
  resetCounters();
  camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 100, 5000);
  camera.position.set(0, 950, 1400);

  DarwinCity = new City(config);
  DarwinCity
    .on('carAccident', () => {
      carAccidentCount.textContent = parseInt(carAccidentCount.textContent, 10) + 1;
    })
    .on('carArrival', () => {
      carArrivalCount.textContent = parseInt(carArrivalCount.textContent, 10) + 1;
    });

  renderer = new WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.maxDistance = 1800;

  scene.innerHTML = '';
  scene.appendChild(renderer.domElement);
}

function animate() {
  DarwinCity.update();
  renderer.render(DarwinCity.scene, camera);
  requestAnimationFrame(animate);
}

// Events

/**
 * @param {Event} evt
 * @param {string} id
 */
function onChange(evt, id) {
  config[id] = evt.currentTarget.value;
  document.querySelector(`#control_${id} strong`).textContent = config[id];
}

function onToggleTrafficSignals() {
  btnToggleTrafficSignals.textContent = `${!DarwinCity.trafficLightController ? 'Deactivate' : 'Activate'} Traffic Signals`;
  DarwinCity.toggleTrafficSignals();
}

function bindEvents() {
  Object.keys(config).forEach((id) => {
    const input = document.querySelector(`#control_${id} input`);
    input.addEventListener('change', (evt) => onChange(evt, id));
    input.value = config[id];
  });

  btnToggleTrafficSignals.addEventListener('change', onToggleTrafficSignals);
  btnGenerateCity.addEventListener('click', generateCity);
}

bindEvents();
generateCity();
animate();
