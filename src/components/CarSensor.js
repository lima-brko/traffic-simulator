import {
  Ray,
  Vector3,
  CylinderBufferGeometry,
  MeshBasicMaterial,
  Mesh

} from 'three';

class CarSensor {
  constructor(position, degree) {
    const {x, y, z} = position;
    this.position = position;
    this.degree = degree;
    this.ray = new Ray(position, new Vector3(x - 10, y, z));
    console.log(this.ray);
  }

  createMesh() {
    const {x, y} = this.position;
    const geometry = new CylinderBufferGeometry(1, 1, 100, 10);
    const material = new MeshBasicMaterial({color: 0xffff00, opacity: 0.5, transparent: true});
    const mesh = new Mesh(geometry, material);
    mesh.position.set(x, y + 50, 5);
    mesh.rotation.z = 0 * Math.PI / 180;
    return mesh;
  }
}

export default CarSensor;
