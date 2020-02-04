import {Vector3} from 'three';

class RoadPathNode {
  constructor(props) {
    this.x = parseInt(props.x, 10);
    this.y = parseInt(props.y, 10);
    this.vector3 = new Vector3(this.x, 0, this.y);
    this.nextPoints = [];
    this.roadPath = props.roadPath || null;
    this.maxSpeed = null;
  }

  getBefore() {
    return this.roadPath.find((point) => point.nextPoints.indexOf(this) !== -1);
  }

  addBefore(anotherPoint) {
    if(!this.roadPath) {
      return;
    }

    const prevPoint = this.getBefore();
    anotherPoint.addNextPoint(this);
    prevPoint.replaceNextPoint(this, anotherPoint);
  }

  replaceNextPoint(existNode, replaceNode) {
    const index = this.nextPoints.indexOf(existNode);

    if(index !== -1) {
      this.nextPoints.splice(index, 1, replaceNode);
    }
  }

  removeNextPoint(point) {
    const index = this.nextPoints.indexOf(point);

    if(index !== -1) {
      this.nextPoints.splice(index, 1);
    }
  }

  addNextPoint(point) {
    if(this.nextPoints.indexOf(point) === -1) {
      this.nextPoints.push(point);
    }
  }
}

export default RoadPathNode;
