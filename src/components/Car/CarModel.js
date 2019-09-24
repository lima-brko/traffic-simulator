import {
  Mesh,
  MeshBasicMaterial,
  Group,
  BoxBufferGeometry,
  CanvasTexture
} from 'three';

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
    new BoxBufferGeometry(16, 5, 5),
    new MeshBasicMaterial({color: 0x000000})
  );
  wheel.position.z = 2.5;
  return wheel;
}

const vechicleColors = [0xa52523, 0xbdb638, 0x78b14b];
const carFrontTexture = createCabinTexture(80, 40, [{
  x: 10, y: 0, w: 60, h: 30
}]);
const carBackTexture = createCabinTexture(80, 40, [{
  x: 10, y: 10, w: 60, h: 30
}]);
const carRightSideTexture = createCabinTexture(40, 110, [
  {
    x: 10, y: 10, w: 30, h: 50
  },
  {
    x: 10, y: 70, w: 30, h: 30
  }
]);
const carLeftSideTexture = createCabinTexture(40, 110, [
  {
    x: 0, y: 10, w: 30, h: 50
  },
  {
    x: 0, y: 70, w: 30, h: 30
  }
]);

function create3dModel() {
  const carGroup = new Group();

  // Car Chassis
  const color = vechicleColors[Math.floor(Math.random() * vechicleColors.length)];
  const main = new Mesh(
    new BoxBufferGeometry(14, 30, 7),
    new MeshBasicMaterial({color, flatShading: true})
  );
  main.position.z = 6;
  carGroup.add(main);

  // Car Cabin
  const cabin = new Mesh(
    new BoxBufferGeometry(14, 15, 6),
    [
      new MeshBasicMaterial({color: 0xcccccc, map: carRightSideTexture}),
      new MeshBasicMaterial({color: 0xcccccc, map: carLeftSideTexture}),
      new MeshBasicMaterial({color: 0xcccccc, map: carFrontTexture}),
      new MeshBasicMaterial({color: 0xcccccc, map: carBackTexture}),
      new MeshBasicMaterial({color: 0xcccccc}),
      new MeshBasicMaterial({color: 0xcccccc})
    ]
  );
  cabin.position.y = -3.5;
  cabin.position.z = 12.5;
  carGroup.add(cabin);

  // Car Wheels
  const frontWheel = createWheel();
  frontWheel.position.y = -9;
  carGroup.add(frontWheel);

  const backWheel = createWheel();
  backWheel.position.y = 9;
  carGroup.add(backWheel);

  return carGroup;
}

export default {
  create3dModel
};
