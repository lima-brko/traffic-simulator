import contants from '../../helpers/constants';
import utils from '../../helpers/utils';
// import RoadPath from './RoadPath';
import RoadPoint from './RoadPoint';
import constants from '../../helpers/constants';

class Junction {
  constructor(roads, tile) {
    this.roads = roads;
    this.tile = tile;

    this.roads.forEach((road, i) => {
      ['even', 'odd'].forEach((way) => {
        const oppositeRoad = roads[i === 0 ? 1 : 0];
        const roadPath = road.ways[way][0];
        const point = roadPath.getPointInsideTile(tile);
        const prevPoint = roadPath.getPointPreviousPoint(point);
        const newPoint = new RoadPoint({
          x: (point.x + prevPoint.x) / 2,
          y: (point.y + prevPoint.y) / 2,
          roadPath
        });
        const nextPoint = point.nextPoints[0];

        // Point relocate in front
        point.x = (point.x + nextPoint.x) / 2;
        point.y = (point.y + nextPoint.y) / 2;

        // Left curve
        const x = point.x - newPoint.x;
        const y = point.y - newPoint.y;
        const angle = utils.calcAngleDegrees(x, y);

        const seg1 = {
          x: newPoint.x + Math.cos(utils.angleToRadians(angle)) * (contants.tileSize * 0.75),
          y: newPoint.y + Math.sin(utils.angleToRadians(angle)) * (contants.tileSize * 0.75)
        };
        const seg2 = {
          x: seg1.x + Math.cos(utils.angleToRadians(angle - 90)) * (contants.tileSize * 0.75),
          y: seg1.y + Math.sin(utils.angleToRadians(angle - 90)) * (contants.tileSize * 0.75)
        };

        const beforeTransferPoint = new RoadPoint({
          x: seg2.x,
          y: seg2.y,
          roadPath
        });

        newPoint.addNextPoint(beforeTransferPoint);
        const transferPoint = oppositeRoad.findClosestPoint(beforeTransferPoint.x, beforeTransferPoint.y);
        beforeTransferPoint.addNextPoint(transferPoint);
        point.addBefore(newPoint);

        // Right curve
        const rightTransferPoint = new RoadPoint({
          x: newPoint.x + Math.cos(utils.angleToRadians(angle)) * (contants.tileSize * 0.25),
          y: newPoint.y + Math.sin(utils.angleToRadians(angle)) * (contants.tileSize * 0.25),
          roadPath
        });
        rightTransferPoint.addNextPoint(oppositeRoad.findClosestPoint(rightTransferPoint.x, rightTransferPoint.y));
        point.addBefore(rightTransferPoint);
      });
    });
  }

  drawOnCanvas(ctx) {
    const fragmentTileSize = constants.tileSize / 13;
    const {tile} = this;
    const x = constants.tileSize * tile.x;
    const y = constants.tileSize * tile.y;

    ctx.fillStyle = constants.colors.road;
    ctx.fillRect(x, y, constants.tileSize, constants.tileSize);

    ctx.translate(x, y);

    for(let i = 0; i < 4; i++) {
      if(i !== 0) {
        ctx.translate(constants.tileSize, 0);
        ctx.rotate(utils.angleToRadians(90));
      }

      ctx.fillStyle = constants.colors.road;
      ctx.fillRect(0, -15, constants.tileSize, 15);

      ctx.fillStyle = '#fff';
      for(let j = 1; j < 13; j += 2) {
        ctx.fillRect(j * fragmentTileSize, -15, fragmentTileSize, 15);
      }
    }

    ctx.resetTransform();
  }
}

export default Junction;
