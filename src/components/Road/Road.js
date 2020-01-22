import contants from '../../helpers/constants';
import utils from '../../helpers/utils';
import RoadPath from './RoadPath';
import RoadPathNode from './RoadPathNode';
import Junction from './Junction';
import constants from '../../helpers/constants';

class Road {
  constructor(props) {
    this.name = props.name;
    this.nodes = props.nodes;
    this.roadLanes = props.roadLanes || 1;
    this.ways = {even: [], odd: []};

    Object.keys(this.ways).forEach(this.createWayRoadPaths.bind(this));
  }

  getRoadPaths() {
    const roadPaths = [];
    Object.keys(this.ways).forEach((way) => {
      this.ways[way].forEach((roadPath) => {
        roadPaths.push(roadPath);
      });
    });
    return roadPaths;
  }

  createWayRoadPaths(way) {
    if(way === 'odd') {
      this.nodes.reverse();
    }

    const halfTileSize = constants.tileSize / 2;
    const diffX = this.nodes[1].x - this.nodes[0].x;
    const diffY = this.nodes[1].y - this.nodes[0].y;
    const angle = utils.calcAngleDegrees(diffX, diffY * -1);
    const distance = Math.sqrt(diffX * diffX + diffY * diffY);
    const nodesCount = Math.floor(distance / constants.tileSize);
    const sin = Math.sin(utils.angleToRadians(angle));
    const cos = Math.cos(utils.angleToRadians(angle));

    for(let i = 0; i < this.roadLanes; i++) {
      const roadPath = new RoadPath({
        name: `${this.name}-${way}-${i}`,
        way,
        road: this
      });

      /**
       * Creating RoadPath Nodes
       * Based on first and last road node, populate intersection nodes
       */
      const firstNode = new RoadPathNode({
        x: this.nodes[0].x + (sin * (contants.tileSize / 4)) + (sin * i * halfTileSize),
        y: this.nodes[0].y + (cos * (contants.tileSize / 4)) + (cos * i * halfTileSize)
      });

      roadPath.addPoint(firstNode);

      let point;
      let fragmentPerc;
      for(let j = 1; j <= nodesCount; j++) {
        fragmentPerc = 1 / nodesCount * j;
        point = new RoadPathNode({
          x: this.nodes[0].x + (diffX * fragmentPerc) + (sin * (contants.tileSize / 4)) + (sin * i * halfTileSize),
          y: this.nodes[0].y + (diffY * fragmentPerc) + (cos * (contants.tileSize / 4)) + (cos * i * halfTileSize)
        });

        roadPath.addPoint(point);
      }

      const lastNode = new RoadPathNode({
        x: this.nodes[1].x + (sin * (contants.tileSize / 4)) + (sin * i * halfTileSize),
        y: this.nodes[1].y + (cos * (contants.tileSize / 4)) + (cos * i * halfTileSize)
      });

      roadPath.addPoint(lastNode);

      this.ways[way].push(roadPath);
    }

    if(way === 'odd') {
      this.nodes.reverse();
    }
  }

  getTotalLanes() {
    let lanesCount = 0;

    this.getRoadPaths().forEach(() => {
      lanesCount++;
    });

    return lanesCount;
  }

  getInitPoints() {
    const initPoints = [];
    this.getRoadPaths().forEach((roadPath) => {
      initPoints.push(roadPath.initPoint);
    });

    return initPoints;
  }

  drawOnCanvas(ctx) {
    const halfTileSize = constants.tileSize / 2;
    const firstNode = this.nodes[0];
    const lastNode = this.nodes[this.nodes.length - 1];

    ctx.translate(contants.worldWidth / 2, contants.worldHeight / 2);

    // Road
    const diffX = lastNode.x - firstNode.x;
    const diffY = lastNode.y - firstNode.y;
    const angle = utils.calcAngleDegrees(diffX, diffY);

    ctx.beginPath();
    ctx.lineWidth = halfTileSize * this.getTotalLanes();
    ctx.strokeStyle = constants.colors.road;
    this.nodes.forEach((node, i) => {
      const {x} = node;
      const {y} = node;

      if(i === 0) {
        ctx.moveTo(
          x - Math.cos(utils.angleToRadians(angle)) * (contants.tileSize / 2),
          y - Math.sin(utils.angleToRadians(angle)) * (contants.tileSize / 2)
        );
        return;
      }

      if(i === this.nodes.length - 1) {
        ctx.lineTo(
          x + Math.cos(utils.angleToRadians(angle)) * (contants.tileSize / 2),
          y + Math.sin(utils.angleToRadians(angle)) * (contants.tileSize / 2)
        );
        return;
      }

      ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Road Name
    ctx.textAlign = 'center';
    ctx.font = '11px Verdana';
    ctx.fillStyle = '#fff';
    ctx.fillText(this.name, firstNode.x, firstNode.y);

    // Road lane dashed line
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.setLineDash([10, 15]);
    ctx.moveTo(constants.tileSize * firstNode.x, constants.tileSize * firstNode.y);
    ctx.lineTo(constants.tileSize * lastNode.x, constants.tileSize * lastNode.y);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.resetTransform();

    // RoadPath
    this.getRoadPaths().forEach((roadPath) => {
      RoadPath.drawOnCanvas(ctx, roadPath);
    });
  }

  findClosestPoint(x, y) {
    let closestPoint = null;
    let minDist = null;
    let dist;
    this.getRoadPaths().forEach((roadPath) => {
      const roadPathClosest = roadPath.getClosestPoint(x, y);
      dist = Math.sqrt(((x - roadPathClosest.x) ** 2) + ((y - roadPathClosest.y) ** 2));

      if(!closestPoint || dist < minDist) {
        minDist = dist;
        closestPoint = roadPathClosest;
      }
      return false;
    });

    return closestPoint;
  }

  /**
   * @param {Road} Road1
   * @param {Road} Road2
   */
  static createRoadsJunctions(Road1, Road2) {
    const intersection = utils.getLinesIntersection(
      Road1.nodes[0].x,
      Road1.nodes[0].y,
      Road1.nodes[1].x,
      Road1.nodes[1].y,
      Road2.nodes[0].x,
      Road2.nodes[0].y,
      Road2.nodes[1].x,
      Road2.nodes[1].y
    );

    if(!intersection) {
      return;
    }

    return new Junction([Road1, Road2], intersection.x, intersection.y);
  }
}

export default Road;
