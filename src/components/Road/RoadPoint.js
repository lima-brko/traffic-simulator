class RoadPoint {
  constructor(props) {
    this.x = props.x;
    this.y = props.y;
    this.nextPoints = [];
    this.roadPath = props.roadPath || null;
    this.transfer = false;
  }

  addBefore(anotherPoint) {
    if(!this.roadPath) {
      return;
    }

    const prevPoint = this.roadPath.find((point) => point.nextPoints.indexOf(this) !== -1);
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

export default RoadPoint;
