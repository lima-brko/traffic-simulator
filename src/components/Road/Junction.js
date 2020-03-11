import contants from '../../helpers/constants';
import utils from '../../helpers/utils';
import RoadPathNode from './RoadPathNode';
import TrafficLight from './TrafficLight';
import constants from '../../helpers/constants';
import {safeVelocity} from '../Car';

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
  }

  connectWayTransfers() {
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

    const availableRoadPaths = [];
    if(way.lanes.length) {
      const lastRoadPath = way.lanes[way.lanes.length - 1];
      const transferNode = this.transferNodes.find((node) => node.roadPath === lastRoadPath);
      availableRoadPaths.push(transferNode.nextPoints[0].roadPath);
    }

    const trafficLight = new TrafficLight({
      junction: this,
      x: seg2.x,
      y: seg2.y,
      roadPaths: way.lanes,
      availableRoadPaths
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

    const newPoint = roadPath.createNodeOnLineIntersection(oppositeRoadLine);

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
    beforeTransferPoint.transferTo = oppositeRoadPath;

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

    const prepareToTransferLine = [
      {
        x: oppositeRoad.nodes[0].x - Math.cos(utils.angleToRadians(roadPathAngle)) * (oppositeRoadThick + 50),
        y: oppositeRoad.nodes[0].y - Math.sin(utils.angleToRadians(roadPathAngle * -1)) * (oppositeRoadThick + 50)
      },
      {
        x: oppositeRoad.nodes[1].x - Math.cos(utils.angleToRadians(roadPathAngle)) * (oppositeRoadThick + 50),
        y: oppositeRoad.nodes[1].y - Math.sin(utils.angleToRadians(roadPathAngle * -1)) * (oppositeRoadThick + 50)
      }
    ];
    const prepareToTransferPoint = roadPath.createNodeOnLineIntersection(prepareToTransferLine);
    const trafficLightPoint = new RoadPathNode({
      x: prepareToTransferPoint.x + Math.cos(utils.angleToRadians(roadPathAngle * -1)) * (constants.quarterTileSize + 50 - constants.quarterTileSize),
      y: prepareToTransferPoint.y + Math.sin(utils.angleToRadians(roadPathAngle * -1)) * (constants.quarterTileSize + 50 - constants.quarterTileSize),
      roadPath
    });
    trafficLightPoint.maxSpeed = safeVelocity;

    const seg1 = {
      x: trafficLightPoint.x + Math.cos(utils.angleToRadians(roadPathAngle * -1)) * constants.quarterTileSize,
      y: trafficLightPoint.y + Math.sin(utils.angleToRadians(roadPathAngle * -1)) * constants.quarterTileSize
    };
    const seg2 = {
      x: seg1.x + Math.cos(utils.angleToRadians(roadPathAngle - 90)) * constants.quarterTileSize,
      y: seg1.y + Math.sin(utils.angleToRadians(roadPathAngle + 90)) * constants.quarterTileSize
    };

    const beforeTransferPoint = new RoadPathNode({
      x: seg2.x,
      y: seg2.y,
      roadPath,
      maxSpeed: safeVelocity
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

    prepareToTransferPoint.addNextPoint(trafficLightPoint);
    trafficLightPoint.addNextPoint(beforeTransferPoint);
    trafficLightPoint.transferTo = oppositeRoadPath;
    beforeTransferPoint.addNextPoint(transferPoint);
    this.transferNodes.push(beforeTransferPoint);
  }

  drawOnCanvas(ctx) {
    const halfTileSize = constants.tileSize / 2;

    ctx.translate(contants.worldWidth / 2 * 2, contants.worldHeight / 2 * 2);

    const x = this.x - (this.roads[1].getWay('even').lanes.length * halfTileSize);
    const y = this.y - (this.roads[0].getWay('even').lanes.length * halfTileSize);

    ctx.fillStyle = constants.colors.road;
    ctx.fillRect(x * 2, y * 2, this.roads[1].getWay('even').lanes.length * constants.tileSize * 2, this.roads[0].getWay('even').lanes.length * constants.tileSize * 2);

    ctx.translate(x * 2, y * 2);

    for(let i = 0; i < 4; i++) {
      if(i !== 0) {
        ctx.translate(this.roads[i % 2].getWay('even').lanes.length * constants.tileSize * 2, 0);
        ctx.rotate(utils.angleToRadians(90));
      }

      ctx.fillStyle = constants.colors.road;
      ctx.fillRect(0, -30, this.roads[i % 2].getWay('even').lanes.length * constants.tileSize * 2, 30);

      ctx.fillStyle = '#fff';

      const whiteLinesCount = (12 * this.roads[i % 2].getWay('even').lanes.length) + 1;
      const fragmentTileSize = (constants.tileSize * this.roads[i % 2].getWay('even').lanes.length) / whiteLinesCount;
      for(let j = 1; j < whiteLinesCount; j += 2) {
        ctx.fillRect(j * fragmentTileSize * 2, -20, fragmentTileSize * 2, 20);
      }
    }

    ctx.resetTransform();
  }
}

export default Junction;
