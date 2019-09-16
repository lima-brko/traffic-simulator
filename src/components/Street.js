import {
  DoubleSide,
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh
} from 'three';

class Street {
  constructor(props) {
    const plane = new Mesh(
      new PlaneGeometry(20, 1000),
      new MeshBasicMaterial({color: 0x989899, side: DoubleSide})
    );
    plane.position.set(props.x, props.y, 0);
    plane.rotation.x = -Math.PI / 2;

    this.mesh = plane;
  }
}

export default Street;
