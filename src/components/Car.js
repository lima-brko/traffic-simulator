import {
  Mesh,
  MeshBasicMaterial,
  Group,
  BoxBufferGeometry,
  CanvasTexture
} from 'three';
import Navigation from '../services/Navigation';

function createCabinTexture(width, height, rects) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);
  context.fillStyle = '#3d3d3d';
  rects.forEach((rect) => {
    context.fillRect(rect.x, rect.y, rect.w, rect.h);
  });
  return new CanvasTexture(canvas);
}

function createWheel() {
  const wheel = new Mesh(
    new BoxBufferGeometry(5, 16, 5),
    new MeshBasicMaterial({color: 0x000000})
  );
  wheel.position.z = 2.5;
  return wheel;
}

const vechicleColors = [0xa52523, 0xbdb638, 0x78b14b];
const carFrontTexture = createCabinTexture(40, 80, [{
  x: 0, y: 10, w: 30, h: 60
}]);
const carBackTexture = createCabinTexture(40, 80, [{
  x: 10, y: 10, w: 30, h: 60
}]);
const carRightSideTexture = createCabinTexture(110, 40, [{
  x: 10, y: 0, w: 50, h: 30
}, {
  x: 70, y: 0, w: 30, h: 30
}]);
const carLeftSideTexture = createCabinTexture(110, 40, [{
  x: 10, y: 10, w: 50, h: 30
}, {
  x: 70, y: 10, w: 30, h: 30
}]);

class Car {
  constructor() {
    const carGroup = new Group();

    // Car Chassis
    const color = vechicleColors[Math.floor(Math.random() * vechicleColors.length)];
    const main = new Mesh(
      new BoxBufferGeometry(30, 14, 7),
      new MeshBasicMaterial({color, flatShading: true})
    );
    main.position.z = 6;
    carGroup.add(main);

    // Car Cabin
    const cabin = new Mesh(
      new BoxBufferGeometry(15, 14, 6),
      [
        new MeshBasicMaterial({color: 0xcccccc, map: carBackTexture}),
        new MeshBasicMaterial({color: 0xcccccc, map: carFrontTexture}),
        new MeshBasicMaterial({color: 0xcccccc, map: carRightSideTexture}),
        new MeshBasicMaterial({color: 0xcccccc, map: carLeftSideTexture}),
        new MeshBasicMaterial({color: 0xcccccc}),
        new MeshBasicMaterial({color: 0xcccccc})
      ]
    );
    cabin.position.x = 3.5;
    cabin.position.z = 12.5;
    carGroup.add(cabin);

    // Car Wheels
    const frontWheel = createWheel();
    frontWheel.position.x = -9;
    carGroup.add(frontWheel);

    const backWheel = createWheel();
    backWheel.position.x = 9;
    carGroup.add(backWheel);

    this.mesh = carGroup;
    this.mesh.position.set(0, 0, 0);
    this.mesh.rotation.x = -Math.PI / 2;
    this.navigation = Navigation;
  }

  setRoute(fromNode, toNode) {
    this.route = this.navigation.findBestRoute(fromNode, toNode);
  }

  update() {
    this.mesh.position.x = this.mesh.position.x - 0.1;
  }
}

export default Car;
