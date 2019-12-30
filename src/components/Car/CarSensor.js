import {
  Raycaster,
  Vector3,
  Line,
  LineBasicMaterial,
  Geometry

} from 'three';

const materials = {
  green: new LineBasicMaterial({
    color: 0x3ffe00
  }),
  yellow: new LineBasicMaterial({
    color: 0xfdcc00
  })
};

class CarSensor {
  constructor(props) {
    this.name = props.name;
    this.car = props.car;
    this.far = props.far;
    this.distance = null;
    this.raycaster = new Raycaster();
    this.raycaster.far = props.far;

    this.line = this.createLine();
  }

  createLine() {
    const geometry = new Geometry();
    geometry.vertices.push(
      new Vector3(0, 0, 6),
      new Vector3(0, this.far, 6)
    );
    const line = new Line(geometry, materials.green);
    line.name = 'sensor';
    return line;
  }

  setLineMaterial(material) {
    if(this.line.material !== material) {
      this.line.material = material;
    }
  }

  reset() {
    this.setLineMaterial(materials.green);
    this.distance = null;
  }

  update(collidableMeshList) {
    const localVertex = this.line.geometry.vertices[1].clone();
    const globalVertex = localVertex.applyMatrix4(this.line.parent.matrix);
    const directionVector = globalVertex.sub(this.line.parent.position);

    this.raycaster.set(this.car.mesh.position.clone(), directionVector.clone().normalize());

    const collisions = this.raycaster.intersectObjects(collidableMeshList);
    if(collisions.length) {
      const closestCollision = collisions.reduce((acc, collision) => {
        if(!acc || collision.distance < acc.distance) {
          return collision;
        }

        return acc;
      });

      this.distance = closestCollision.distance;
      this.setLineMaterial(materials.yellow);
    } else {
      this.reset();
    }
  }
}

export default CarSensor;
