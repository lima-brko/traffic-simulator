import utils from '../../helpers/utils';

class RoadWayNode {
  constructor(props) {
    this.x = props.x;
    this.y = props.y;
    this.way = props.way;
    this.name = `${props.way.road.name}_${props.way.type}_${this.x}_${this.y}`;
    this.roadPathNode = props.roadPathNode || null;
    this.isTransfer = props.isTransfer || false;
    this.nextNodes = [];
  }
}

class RoadWay {
  constructor(props) {
    this.type = props.type;
    this.road = props.road;
    this.lanes = [];
    this.nodes = [];
    this.transferNodes = [];
  }

  getAllNodes() {
    return [...this.nodes, ...this.transferNodes];
  }

  getNextNodeFrom(x, y, startDistOffset) {
    const startNode = this.nodes[0];
    const startDist = utils.getDistance(x, y, startNode.x, startNode.y) + startDistOffset;
    let dist;
    let minDist;
    let nextNode = null;

    this.getAllNodes().forEach((node) => {
      dist = utils.getDistance(node.x, node.y, startNode.x, startNode.y);

      if(dist <= startDist) {
        return;
      }

      if(!minDist || dist < minDist) {
        minDist = dist;
        nextNode = node;
      }
    });

    return nextNode;
  }

  getAngle() {
    const x = this.nodes[1].x - this.nodes[0].x;
    const y = this.nodes[1].y - this.nodes[0].y;
    return utils.calcAngleDegrees(x, y);
  }

  addNode(x, y) {
    const newNode = new RoadWayNode({
      way: this,
      x,
      y
    });
    this.nodes.push(newNode);

    return newNode;
  }

  addTransferNode(x, y, roadPathNode) {
    const newNode = new RoadWayNode({
      way: this,
      x,
      y,
      roadPathNode,
      isTransfer: true
    });
    this.transferNodes.push(newNode);

    return newNode;
  }

  updateNextNodes() {
    if(!this.transferNodes.length) {
      this.nodes[0].nextNodes.push(this.nodes[1]);
      return;
    }

    const tempTransferNodes = [...this.transferNodes];

    let currentNode = this.nodes[0];
    let closestTransferNode;

    while(tempTransferNodes.length > 0) {
      closestTransferNode = RoadWay.getClosestNodeOnList(tempTransferNodes, currentNode.x, currentNode.y);
      currentNode.nextNodes.push(closestTransferNode);

      [currentNode] = tempTransferNodes.splice(tempTransferNodes.indexOf(closestTransferNode), 1);
    }

    currentNode.nextNodes.push(this.nodes[1]);
  }

  getClosestTransferNode(x, y) {
    return RoadWay.getClosestNodeOnList(this.transferNodes, x, y);
  }

  getTransferNodes() {
    return this.transferNodes;
  }

  getExitNode() {
    return this.nodes[this.nodes.length - 1];
  }

  static getClosestNodeOnList(nodeList, x, y) {
    let dist;
    let minDist;
    let closestNode = null;

    nodeList.forEach((node) => {
      dist = utils.getPointsDistance(x, y, node.x, node.y);

      if(!minDist || dist < minDist) {
        minDist = dist;
        closestNode = node;
      }
    });

    return closestNode;
  }

  getClosestNode(x, y) {
    return RoadWay.getClosestNodeOnList(this.nodes, x, y);
  }
}

export default RoadWay;
