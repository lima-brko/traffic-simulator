import contants from '../../helpers/constants';
import utils from '../../helpers/utils';
import RoadPathNode from './RoadPathNode';
import TrafficLight from './TrafficLight';
import constants from '../../helpers/constants';

class Junction {
  constructor(roads, intersecX, intersecY) {
    this.roads = roads;
    this.x = intersecX;
    this.y = intersecY;
    this.trafficLights = [];
    this.transferNodes = [];

    this.roads.forEach((road, i) => {
      road.ways.forEach((way) => {
        const oppositeRoad = roads[i === 0 ? 1 : 0];

        this.createLeftCurve(road, oppositeRoad, way.lanes[0]);
        this.createRightCurve(road, oppositeRoad, way.lanes[way.lanes.length - 1]);
        this.createTrafficLight(road, oppositeRoad, way);
      });
    });

    this.transferNodes.forEach((transferNode) => {
      const {way} = transferNode.roadPath;
      const pointOnLine = utils.getPointOnLine(
        transferNode.x,
        transferNode.y,
        way.nodes[0].x,
        way.nodes[0].y,
        way.nodes[1].x,
        way.nodes[1].y
      );

      way.addTransferNode(pointOnLine.point.x, pointOnLine.point.y, transferNode);
    });

    this.roads.forEach((road) => {
      road.ways.forEach((way) => {
        way.transferNodes.forEach((transferNode) => {
          if(transferNode.nextNodes.length) {
            return;
          }
          const nextRoadPathNode = transferNode.roadPathNode.nextPoints[0];
          const nextWayNode = nextRoadPathNode.roadPath.way.getNextNodeFrom(nextRoadPathNode.x, nextRoadPathNode.y, transferNode.way.lanes.length * constants.halfTileSize);
          transferNode.nextNodes.push(nextWayNode);
        });
      });
    });
  }

  static getClosestRightAngleNode(road, x, y, originWay, reverse = false) {
    const mod = reverse ? -1 : 1;
    let dist;
    let minDist = null;
    let closestNode = null;
    road.ways.forEach((way) => {
      way.getAllNodes().forEach((node) => {
        if(node.x === x && node.y === y) {
          return;
        }

        const angle = utils.getLinesAngle(originWay.nodes[0].x, originWay.nodes[0].y, x, y, x, y, node.x, node.y);

        if(angle === 90 * mod) {
          dist = utils.getPointsDistance(node.x, node.y, x, y);

          if(!closestNode || dist < minDist) {
            minDist = dist;
            closestNode = node;
          }
        }
      });
    });

    return closestNode;
  }

  createTrafficLight(road, oppositeRoad, way) {
    const roadThick = road.getWay('even').lanes.length * constants.halfTileSize;
    const oppositeRoadThick = oppositeRoad.getWay('even').lanes.length * constants.halfTileSize;
    const firstRoadPath = way.lanes[0];
    const roadPathAngle = firstRoadPath.getAngle();

    const seg1 = {
      x: this.x - Math.cos(utils.angleToRadians(roadPathAngle)) * oppositeRoadThick,
      y: this.y - Math.sin(utils.angleToRadians(roadPathAngle)) * oppositeRoadThick
    };
    const seg2 = {
      x: seg1.x - Math.cos(utils.angleToRadians(roadPathAngle - 90)) * roadThick,
      y: seg1.y - Math.sin(utils.angleToRadians(roadPathAngle - 90)) * roadThick
    };

    const trafficLight = new TrafficLight({
      junction: this,
      x: seg2.x,
      y: seg2.y,
      roadPaths: way.lanes
    });

    this.trafficLights.push(trafficLight);
  }

  createLeftCurve(road, oppositeRoad, roadPath) {
    const roadThick = road.getWay('even').lanes.length * constants.halfTileSize;
    const oppositeRoadThick = oppositeRoad.getWay('even').lanes.length * constants.halfTileSize;
    const roadPathAngle = roadPath.getAngle();

    const oppositeRoadLine = [
      {
        x: oppositeRoad.nodes[0].x - Math.cos(utils.angleToRadians(roadPathAngle)) * oppositeRoadThick,
        y: oppositeRoad.nodes[0].y - Math.sin(utils.angleToRadians(roadPathAngle * -1)) * oppositeRoadThick
      },
      {
        x: oppositeRoad.nodes[1].x - Math.cos(utils.angleToRadians(roadPathAngle)) * oppositeRoadThick,
        y: oppositeRoad.nodes[1].y - Math.sin(utils.angleToRadians(roadPathAngle * -1)) * oppositeRoadThick
      }
    ];

    const newPoint = roadPath.createNodeOnLineIntersect(oppositeRoadLine);

    const seg1 = {
      x: newPoint.x + Math.cos(utils.angleToRadians(roadPathAngle * -1)) * (oppositeRoadThick + constants.quarterTileSize),
      y: newPoint.y + Math.sin(utils.angleToRadians(roadPathAngle * -1)) * (oppositeRoadThick + constants.quarterTileSize)
    };
    const seg2 = {
      x: seg1.x - Math.cos(utils.angleToRadians(roadPathAngle - 90)) * (roadThick + constants.quarterTileSize),
      y: seg1.y - Math.sin(utils.angleToRadians(roadPathAngle + 90)) * (roadThick + constants.quarterTileSize)
    };

    const beforeTransferPoint = new RoadPathNode({
      x: seg2.x,
      y: seg2.y,
      roadPath
    });
    const oppositeRoadPath = oppositeRoad.findClosestRoadPath(beforeTransferPoint.x, beforeTransferPoint.y);
    const transferPoint = new RoadPathNode({
      x: beforeTransferPoint.x,
      y: beforeTransferPoint.y,
      roadPath: oppositeRoadPath
    });
    oppositeRoadPath
      .getNextNodeFrom(transferPoint.x, transferPoint.y)
      .addBefore(transferPoint);

    newPoint.addNextPoint(beforeTransferPoint);
    beforeTransferPoint.addNextPoint(transferPoint);
    this.transferNodes.push(beforeTransferPoint);
  }

  createRightCurve(road, oppositeRoad, roadPath) {
    const oppositeRoadThick = oppositeRoad.getWay('even').lanes.length * constants.halfTileSize;
    const roadPathAngle = roadPath.getAngle();

    const oppositeRoadLine = [
      {
        x: oppositeRoad.nodes[0].x - Math.cos(utils.angleToRadians(roadPathAngle)) * (oppositeRoadThick - constants.quarterTileSize),
        y: oppositeRoad.nodes[0].y - Math.sin(utils.angleToRadians(roadPathAngle * -1)) * (oppositeRoadThick - constants.quarterTileSize)
      },
      {
        x: oppositeRoad.nodes[1].x - Math.cos(utils.angleToRadians(roadPathAngle)) * (oppositeRoadThick - constants.quarterTileSize),
        y: oppositeRoad.nodes[1].y - Math.sin(utils.angleToRadians(roadPathAngle * -1)) * (oppositeRoadThick - constants.quarterTileSize)
      }
    ];

    const newPoint = roadPath.createNodeOnLineIntersect(oppositeRoadLine);

    const beforeTransferPoint = new RoadPathNode({
      x: newPoint.x - Math.cos(utils.angleToRadians(roadPathAngle + 90)) * (contants.tileSize * 0.25),
      y: newPoint.y - Math.sin(utils.angleToRadians(roadPathAngle - 90)) * (contants.tileSize * 0.25),
      roadPath
    });

    const oppositeRoadPath = oppositeRoad.findClosestRoadPath(beforeTransferPoint.x, beforeTransferPoint.y);
    const transferPoint = new RoadPathNode({
      x: beforeTransferPoint.x,
      y: beforeTransferPoint.y,
      roadPath: oppositeRoadPath
    });
    oppositeRoadPath
      .getNextNodeFrom(transferPoint.x, transferPoint.y)
      .addBefore(transferPoint);

    newPoint.addNextPoint(beforeTransferPoint);
    beforeTransferPoint.addNextPoint(transferPoint);
    this.transferNodes.push(beforeTransferPoint);
  }

  drawOnCanvas(ctx) {
    const halfTileSize = constants.tileSize / 2;

    ctx.translate(contants.worldWidth / 2, contants.worldHeight / 2);

    const x = this.x - (this.roads[1].getWay('even').lanes.length * halfTileSize);
    const y = this.y - (this.roads[0].getWay('even').lanes.length * halfTileSize);

    ctx.fillStyle = constants.colors.road;
    ctx.fillRect(x, y, this.roads[1].getWay('even').lanes.length * constants.tileSize, this.roads[0].getWay('even').lanes.length * constants.tileSize);

    ctx.translate(x, y);

    for(let i = 0; i < 4; i++) {
      if(i !== 0) {
        ctx.translate(this.roads[i % 2].getWay('even').lanes.length * constants.tileSize, 0);
        ctx.rotate(utils.angleToRadians(90));
      }

      ctx.fillStyle = constants.colors.road;
      ctx.fillRect(0, -15, this.roads[i % 2].getWay('even').lanes.length * constants.tileSize, 15);

      ctx.fillStyle = '#fff';

      const whiteLinesCount = (12 * this.roads[i % 2].getWay('even').lanes.length) + 1;
      const fragmentTileSize = (constants.tileSize * this.roads[i % 2].getWay('even').lanes.length) / whiteLinesCount;
      for(let j = 1; j < whiteLinesCount; j += 2) {
        ctx.fillRect(j * fragmentTileSize, -10, fragmentTileSize, 10);
      }
    }

    ctx.resetTransform();
  }
}

export default Junction;
