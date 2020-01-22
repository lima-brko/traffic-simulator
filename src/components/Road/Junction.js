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
      Object.keys(road.ways).forEach((way) => {
        const oppositeRoad = roads[i === 0 ? 1 : 0];
        const roadPath = road.ways[way][0];
        const closestPoint = roadPath.getClosestPoint(newPoint.x, newPoint.y);
        // const prevPoint = roadPath.getPointPreviousPoint(point);
        const x = road.nodes[1].x - road.nodes[0].x;
        const y = road.nodes[1].y - road.nodes[0].y;
        const angle = utils.calcAngleDegrees(x, y);
        const newPointDist = oppositeRoad.ways.even.length * constants.tileSize;

        const newPoint = new RoadPathNode({
          x: intersecX - (Math.cos(utils.angleToRadians(angle)) * newPointDist),
          y: intersecY - (Math.sin(utils.angleToRadians(angle)) * newPointDist),
          roadPath
        });

        const closestPoint = roadPath.getClosestPoint(newPoint.x, newPoint.y);
        closestPoint.addBefore(newPoint);

        // Create Traffic Light
        // const trafficLight = new TrafficLight({
        //   junction: this,
        //   roadPath
        // });
        // trafficLight.mesh.position.set(newPoint.x, 0, newPoint.y);
        // trafficLight.mesh.rotation.y = utils.angleToRadians((angle * -1) - 90);

        // this.trafficLights.push(trafficLight);

        // Left curve
        const seg1 = {
          x: newPoint.x + Math.cos(utils.angleToRadians(angle)) * (contants.tileSize * 0.75),
          y: newPoint.y + Math.sin(utils.angleToRadians(angle)) * (contants.tileSize * 0.75)
        };
        const seg2 = {
          x: seg1.x + Math.cos(utils.angleToRadians(angle - 90)) * (contants.tileSize * 0.75),
          y: seg1.y + Math.sin(utils.angleToRadians(angle - 90)) * (contants.tileSize * 0.75)
        };

        const beforeTransferPoint = new RoadPathNode({
          x: seg2.x,
          y: seg2.y,
          roadPath
        });

        // newPoint.addNextPoint(beforeTransferPoint);
        const transferPoint = oppositeRoad.findClosestPoint(beforeTransferPoint.x, beforeTransferPoint.y);
        beforeTransferPoint.addNextPoint(transferPoint);

        // Right curve
        const rightTransferPoint = new RoadPathNode({
          x: newPoint.x + Math.cos(utils.angleToRadians(angle)) * (contants.tileSize * 0.25),
          y: newPoint.y + Math.sin(utils.angleToRadians(angle)) * (contants.tileSize * 0.25),
          roadPath
        });
        rightTransferPoint.addNextPoint(oppositeRoad.findClosestPoint(rightTransferPoint.x, rightTransferPoint.y));
        // point.addBefore(rightTransferPoint);
      });
    });
  }

  drawOnCanvas(ctx) {
    const halfTileSize = constants.tileSize / 2;

    ctx.translate(contants.worldWidth / 2, contants.worldHeight / 2);

    const x = this.x - (this.roads[1].ways.even.length * halfTileSize);
    const y = this.y - (this.roads[0].ways.even.length * halfTileSize);

    ctx.fillStyle = constants.colors.road;
    ctx.fillRect(x, y, this.roads[1].ways.even.length * constants.tileSize, this.roads[0].ways.even.length * constants.tileSize);

    ctx.translate(x, y);

    for(let i = 0; i < 4; i++) {
      if(i !== 0) {
        ctx.translate(this.roads[i % 2].ways.even.length * constants.tileSize, 0);
        ctx.rotate(utils.angleToRadians(90));
      }

      ctx.fillStyle = constants.colors.road;
      ctx.fillRect(0, -15, this.roads[i % 2].ways.even.length * constants.tileSize, 15);

      ctx.fillStyle = '#fff';

      const whiteLinesCount = (12 * this.roads[i % 2].ways.even.length) + 1;
      const fragmentTileSize = (constants.tileSize * this.roads[i % 2].ways.even.length) / whiteLinesCount;
      for(let j = 1; j < whiteLinesCount; j += 2) {
        ctx.fillRect(j * fragmentTileSize, -10, fragmentTileSize, 10);
      }
    }

    ctx.resetTransform();
  }
}

export default Junction;
