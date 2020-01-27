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

    this.roads.forEach((road, i) => {
      road.ways.forEach((way) => {
        const oppositeRoad = roads[i === 0 ? 1 : 0];

        Junction.createLeftCurve(road, oppositeRoad, way.lanes[0]);
        Junction.createRightCurve(road, oppositeRoad, way.lanes[way.lanes.length - 1]);
        this.createTrafficLight(road, oppositeRoad, way);
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

    const trafficLight = new TrafficLight({
      junction: this,
      x: seg2.x,
      y: seg2.y,
      roadPaths: way.lanes
    });

    this.trafficLights.push(trafficLight);
  }

  static createLeftCurve(road, oppositeRoad, roadPath) {
    const roadThick = road.getWay('even').lanes.length * constants.halfTileSize;
    const oppositeRoadThick = oppositeRoad.getWay('even').lanes.length * constants.halfTileSize;
    const roadPathAngle = roadPath.getAngle();

    const oppositeRoadLine = [
      {
        x: oppositeRoad.nodes[0].x - Math.cos(utils.angleToRadians(roadPathAngle)) * oppositeRoadThick,
        y: oppositeRoad.nodes[0].y - Math.sin(utils.angleToRadians(roadPathAngle)) * oppositeRoadThick
      },
      {
        x: oppositeRoad.nodes[1].x - Math.cos(utils.angleToRadians(roadPathAngle)) * oppositeRoadThick,
        y: oppositeRoad.nodes[1].y - Math.sin(utils.angleToRadians(roadPathAngle)) * oppositeRoadThick
      }
    ];

    const newPoint = roadPath.createNodeOnLineIntersect(oppositeRoadLine);

    const seg1 = {
      x: newPoint.x + Math.cos(utils.angleToRadians(roadPathAngle)) * (oppositeRoadThick + constants.quarterTileSize),
      y: newPoint.y + Math.sin(utils.angleToRadians(roadPathAngle)) * (oppositeRoadThick + constants.quarterTileSize)
    };
    const seg2 = {
      x: seg1.x + Math.cos(utils.angleToRadians(roadPathAngle - 90)) * (roadThick + constants.quarterTileSize),
      y: seg1.y + Math.sin(utils.angleToRadians(roadPathAngle - 90)) * (roadThick + constants.quarterTileSize)
    };

    const beforeTransferPoint = new RoadPathNode({
      x: seg2.x,
      y: seg2.y,
      roadPath
    });

    const transferPoint = oppositeRoad.findClosestPoint(beforeTransferPoint.x, beforeTransferPoint.y);
    beforeTransferPoint.addNextPoint(transferPoint);
    newPoint.addNextPoint(beforeTransferPoint);
  }

  static createRightCurve(road, oppositeRoad, roadPath) {
    const oppositeRoadThick = oppositeRoad.getWay('even').lanes.length * constants.halfTileSize;
    const roadPathAngle = roadPath.getAngle();

    const oppositeRoadLine = [
      {
        x: oppositeRoad.nodes[0].x - Math.cos(utils.angleToRadians(roadPathAngle)) * (oppositeRoadThick - constants.quarterTileSize),
        y: oppositeRoad.nodes[0].y - Math.sin(utils.angleToRadians(roadPathAngle)) * (oppositeRoadThick - constants.quarterTileSize)
      },
      {
        x: oppositeRoad.nodes[1].x - Math.cos(utils.angleToRadians(roadPathAngle)) * (oppositeRoadThick - constants.quarterTileSize),
        y: oppositeRoad.nodes[1].y - Math.sin(utils.angleToRadians(roadPathAngle)) * (oppositeRoadThick - constants.quarterTileSize)
      }
    ];

    const newPoint = roadPath.createNodeOnLineIntersect(oppositeRoadLine);

    const rightTransferPoint = new RoadPathNode({
      x: newPoint.x + Math.cos(utils.angleToRadians(roadPathAngle + 90)) * (contants.tileSize * 0.25),
      y: newPoint.y + Math.sin(utils.angleToRadians(roadPathAngle + 90)) * (contants.tileSize * 0.25),
      roadPath
    });
    rightTransferPoint.addNextPoint(oppositeRoad.findClosestPoint(rightTransferPoint.x, rightTransferPoint.y));
    newPoint.addNextPoint(rightTransferPoint);
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
