import {
  Mesh,
  MeshBasicMaterial,
  Group,
  BoxBufferGeometry,
  BoxGeometry,
  CanvasTexture
} from 'three';

const carSize = 20;

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
    new BoxBufferGeometry(12, 4, 4),
    new MeshBasicMaterial({color: 0x000000})
  );
  wheel.position.z = 2.5;
  return wheel;
}

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

function create3dModel(color) {
  const carGroup = new Group();

  // Car Chassis
  const main = new Mesh(
    new BoxBufferGeometry(10, carSize, 7),
    new MeshBasicMaterial({color, flatShading: true})
  );
  main.position.z = 6;
  carGroup.add(main);

  // Car Cabin
  const cabin = new Mesh(
    new BoxBufferGeometry(10, 12, 6),
    [
      new MeshBasicMaterial({color: 0xcccccc, map: carRightSideTexture}),
      new MeshBasicMaterial({color: 0xcccccc, map: carLeftSideTexture}),
      new MeshBasicMaterial({color: 0xcccccc, map: carFrontTexture}),
      new MeshBasicMaterial({color: 0xcccccc, map: carBackTexture}),
      new MeshBasicMaterial({color: 0xcccccc}),
      new MeshBasicMaterial({color: 0xcccccc})
    ]
  );
  cabin.position.y = -2.5;
  cabin.position.z = 12.5;
  carGroup.add(cabin);

  // Car Wheels
  const frontWheel = createWheel();
  frontWheel.position.y = -7;
  carGroup.add(frontWheel);

  const backWheel = createWheel();
  backWheel.position.y = 7;
  carGroup.add(backWheel);

  // Car HitBox
  const hitbox = new Mesh(
    new BoxGeometry(10, carSize, 20),
    new MeshBasicMaterial({
      color,
      opacity: 0.5,
      transparent: true
    })
  );
  hitbox.material.visible = false;
  hitbox.position.z = 6;
  hitbox.name = 'hitbox';
  carGroup.add(hitbox);

  return carGroup;
}

export default {
  create3dModel,
  carSize
};
