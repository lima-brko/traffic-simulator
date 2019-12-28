import {
  Raycaster,
  Vector3,
  CylinderBufferGeometry,
  MeshBasicMaterial,
  Mesh

} from 'three';
import utils from '../../helpers/utils';

const dist = 30;

class CarSensor {
  constructor(position, rotation) {
    const {x, y, z} = position;

    this.position = position;
    this.rotation = rotation;

    const directionPos = {
      x: x + Math.cos(utils.angleToRadians(z)) * dist,
      y: y + Math.sin(utils.angleToRadians(z)) * dist
    };

    this.direction = new Vector3(directionPos.x, directionPos.y, -5);
    this.raycaster = new Raycaster(position, this.direction, 0, 30);
    console.log(this.ray);
  }

  updateDirection() {
    const {x, y, z} = this.position;
    const directionPos = {
      x: x + Math.cos(utils.angleToRadians(z)) * dist,
      y: y + Math.sin(utils.angleToRadians(z)) * dist
    };
    this.direction.set(directionPos.x, directionPos.y, -5);
  }

  createMesh() {
    const {x, y} = this.position;
    const geometry = new CylinderBufferGeometry(1, 1, 100, 10);
    const material = new MeshBasicMaterial({color: 0xff0000, opacity: 0.5, transparent: true});
    const mesh = new Mesh(geometry, material);
    mesh.position.set(x, y, 5);
    mesh.rotation.z = 0 * Math.PI / 180;
    return mesh;
  }

  update() {
    console.log(this.raycaster.ray.origin);
    // this.raycaster.ray.origin.set();
  }
}

export default CarSensor;
