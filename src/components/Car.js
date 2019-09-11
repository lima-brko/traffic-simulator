import {
  BoxGeometry,
  MeshNormalMaterial,
  Mesh
} from 'three';

class Car {
  constructor() {
    const geometry = new BoxGeometry(0.2, 0.2, 0.2);
    const material = new MeshNormalMaterial();

    this.mesh = new Mesh(geometry, material);
    this.mesh.position.set(0, 0.1, 0);
  }

  update() {
    this.mesh.rotation.x += 0.01;
    this.mesh.rotation.y += 0.02;
  }
}

export default Car;
