import {
  Mesh,
  PlaneBufferGeometry,
  MeshBasicMaterial
} from 'three';

class City {
  constructor() {
    const plane = new Mesh(
      new PlaneBufferGeometry(10000, 10000),
      new MeshBasicMaterial({color: 0xff6600, opacity: 0.5, transparent: true})
    );
    plane.position.set(0, 0, 0);
    plane.rotation.x = -Math.PI / 2;

    this.mesh = plane;
  }

  get model() {
    return this.mesh;
  }
}

export default City;
