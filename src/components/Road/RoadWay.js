class RoadWayNode {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class RoadWay {
  constructor(props) {
    this.type = props.type;
    this.road = props.road;
    this.lanes = [];
    this.nodes = [];
    this.segments = [];
  }

  addNode(x, y) {
    this.nodes.push(new RoadWayNode(x, y));
  }
}

export default RoadWay;
