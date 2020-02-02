import {
  Raycaster,
  Vector3,
  Line,
  LineBasicMaterial,
  Geometry

} from 'three';
import utils from '../../helpers/utils';

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
    this.angle = props.angle;
    this.near = props.near;
    this.far = props.far;
    this.distance = null;
    this.collisionObj = null;
    this.raycaster = new Raycaster();
    this.raycaster.near = props.near;
    this.raycaster.far = props.far;

    this.line = this.createLine();
  }

  createLine() {
    const geometry = new Geometry();
    const nearX = Math.cos(utils.angleToRadians(this.angle + 90)) * this.near;
    const nearY = Math.sin(utils.angleToRadians(this.angle + 90)) * this.near;
    const farX = Math.cos(utils.angleToRadians(this.angle + 90)) * this.far;
    const farY = Math.sin(utils.angleToRadians(this.angle + 90)) * this.far;
    geometry.vertices.push(
      new Vector3(nearX, nearY, 6),
      new Vector3(farX, farY, 6)
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
    this.collisionObj = null;
  }

  update(collidableList) {
    const collidableMeshList = collidableList.map((obj) => obj.hitboxMesh);
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

      this.collisionObj = collidableList[collidableMeshList.indexOf(closestCollision.object)];
      this.distance = closestCollision.distance;
      this.setLineMaterial(materials.yellow);
    } else {
      this.reset();
    }
  }
}

export default CarSensor;
