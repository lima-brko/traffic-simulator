import contants from '../../helpers/constants';
import utils from '../../helpers/utils';
import RoadPath from './RoadPath';
import RoadPoint from './RoadPoint';
import constants from '../../helpers/constants';

class Road {
  constructor(props) {
    this.name = props.name;
    this.tiles = props.tiles;
    this.ways = {};

    ['even', 'odd'].forEach((way) => {
      this.ways[way] = [];

      if(way === 'odd') {
        props.tiles.reverse();
      }

      const roadPath = new RoadPath({
        name: `${this.name}-${way}`,
        way,
        road: this
      });
      const x = props.tiles[1].sceneX - props.tiles[0].sceneX;
      const y = (props.tiles[1].sceneY - props.tiles[0].sceneY) * -1;
      const angle = utils.calcAngleDegrees(x, y);
      let point;

      props.tiles.forEach((tile) => {
        const pointX = tile.sceneX + Math.sin(utils.angleToRadians(angle)) * (contants.tileSize / 4);
        const pointY = tile.sceneY + Math.cos(utils.angleToRadians(angle)) * (contants.tileSize / 4);
        point = new RoadPoint({
          x: pointX,
          y: pointY
        });

        roadPath.addPoint(point);
      });

      this.ways[way].push(roadPath);

      if(way === 'odd') {
        props.tiles.reverse();
      }
    });
  }

  getInitPoints() {
    const initPoints = [];
    Object.keys(this.ways).forEach((way) => {
      this.ways[way].forEach((roadPath) => {
        initPoints.push(roadPath.initPoint);
      });
    });

    return initPoints;
  }

  drawOnCanvas(ctx) {
    const halfTileSize = constants.tileSize / 2;

    this.tiles.forEach((tile, i) => {
      const x = constants.tileSize * tile.x;
      const y = constants.tileSize * tile.y;

      ctx.fillStyle = '#989899';
      ctx.fillRect(x, y, constants.tileSize, constants.tileSize);

      if(i === 0) {
        ctx.textAlign = 'center';
        ctx.font = '11px Verdana';
        ctx.fillStyle = '#fff';
        ctx.fillText(this.name, x + halfTileSize, y + halfTileSize);
      }
    });

    const firstTile = this.tiles[0];
    const lastTile = this.tiles[this.tiles.length - 1];
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.setLineDash([10, 15]);
    ctx.moveTo((constants.tileSize * firstTile.x) + halfTileSize, (constants.tileSize * firstTile.y) + halfTileSize);
    ctx.lineTo((constants.tileSize * lastTile.x) + halfTileSize, (constants.tileSize * lastTile.y) + halfTileSize);
    ctx.stroke();


    // Object.keys(this.ways).forEach((way) => {
    //   this.ways[way].forEach((roadPath) => {
    //     RoadPath.drawOnCanvas(ctx, roadPath);
    //   });
    // });
  }

  findClosestPoint(x, y) {
    let closestPoint = null;
    let minDist = null;
    let dist;
    Object.keys(this.ways).forEach((way) => {
      this.ways[way].forEach((roadPath) => {
        roadPath.find((point) => {
          dist = Math.sqrt(((x - point.x) ** 2) + ((y - point.y) ** 2));

          if(!closestPoint || dist < minDist) {
            minDist = dist;
            closestPoint = point;
          }
          return false;
        });
      });
    });

    return closestPoint;
  }

  static createJunctionOnTile(Road1, Road2, tile) {
    const roads = [Road1, Road2];
    roads.forEach((road, i) => {
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

  /**
   *
   * @param {Road} Road1
   * @param {Road} Road2
   */
  static createRoadsJunctions(Road1, Road2) {
    const Road1Len = Road1.tiles.length;
    const Road2Len = Road2.tiles.length;

    for(let i = 0; i < Road1Len; i++) {
      for(let j = 0; j < Road2Len; j++) {
        if(Road1.tiles[i] === Road2.tiles[j]) {
          Road.createJunctionOnTile(Road1, Road2, Road1.tiles[i]);
        }
      }
    }
  }
}

export default Road;
