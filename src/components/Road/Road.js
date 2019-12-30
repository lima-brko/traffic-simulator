import contants from '../../helpers/constants';
import utils from '../../helpers/utils';
import RoadPath from './RoadPath';
import RoadPoint from './RoadPoint';
import Junction from './Junction';
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

      ctx.fillStyle = constants.colors.road;
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

  /**
   * @param {Road} Road1
   * @param {Road} Road2
   */
  static createRoadsJunctions(Road1, Road2) {
    const Road1Len = Road1.tiles.length;
    const Road2Len = Road2.tiles.length;

    for(let i = 0; i < Road1Len; i++) {
      for(let j = 0; j < Road2Len; j++) {
        if(Road1.tiles[i] === Road2.tiles[j] && Road1.tiles[i].getJunctionContents().length === 0) {
          return new Junction([Road1, Road2], Road1.tiles[i]);
        }
      }
    }
  }
}

export default Road;
