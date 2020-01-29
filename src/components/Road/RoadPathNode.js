import {Vector3} from 'three';
import utils from '../../helpers/utils';

class RoadPathNode {
  constructor(props) {
    this.x = parseInt(props.x, 10);
    this.y = parseInt(props.y, 10);
    this.vector3 = new Vector3(this.x, 0, this.y);
    this.nextPoints = [];
    this.roadPath = props.roadPath || null;
  }

  generatePathToAnyEndPoint() {
    const roadWayNode = this.roadPath.roadWay.getClosestNode(this.x, this.y);

    function move(point, path) {
      path.push(point);

      if(!point.nextPoints.length) {
        return path;
      }

      const randomNextPoint = point.nextPoints[utils.getRandomInt(0, point.nextPoints.length)];
      return move(randomNextPoint, path);
    }

    return move(this, []);
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
    prevPoint.removeNextPoint(this);
    prevPoint.addNextPoint(anotherPoint);
  }

  removeNextPoint(point) {
    const index = this.nextPoints.indexOf(point);

    if(index !== -1) {
      this.nextPoints.splice(index, 0);
    }
  }

  addNextPoint(point) {
    if(this.nextPoints.indexOf(point) === -1) {
      this.nextPoints.push(point);
    }
  }
}

export default RoadPathNode;
