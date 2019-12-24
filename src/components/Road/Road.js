import contants from '../../helpers/constants';
import utils from '../../helpers/utils';
import RoadPath from './RoadPath';
import RoadPoint from './RoadPoint';

class Road {
  constructor(props) {
    this.name = props.name;
    this.tileSize = contants.tileSize;
    this.tiles = props.tiles;
    this.ways = {};

    ['even', 'odd'].forEach((way) => {
      this.ways[way] = [];

      if(way === 'odd') {
        props.tiles.reverse();
      }

      const x = props.tiles[1].sceneX - props.tiles[0].sceneX;
      const y = (props.tiles[1].sceneY - props.tiles[0].sceneY) * -1;
      const angle = utils.calcAngleDegrees(x, y);
      const points = [];
      let point;

      props.tiles.forEach((tile, i) => {
        const pointX = tile.sceneX + Math.sin(utils.angleToRadians(angle)) * (this.tileSize / 4);
        const pointY = tile.sceneY + Math.cos(utils.angleToRadians(angle)) * (this.tileSize / 4);
        point = new RoadPoint(pointX, pointY);

        if(i !== 0) {
          points[points.length - 1].edges.push(point);
        }

        points.push(point);
      });

      this.ways[way].push(new RoadPath({
        name: `${this.name}-${way}`,
        way,
        points,
        road: this
      }));

      if(way === 'odd') {
        props.tiles.reverse();
      }
    });
  }

  drawOnCanvas(ctx) {
    Object.keys(this.ways).forEach((way) => {
      this.ways[way].forEach((roadPath) => {
        RoadPath.drawOnCanvas(ctx, roadPath);
      });
    });
  }

  static createJunctionOnTile(Road1, Road2, tile) {
    ['even', 'odd'].forEach((way) => {
      const roadPath = Road1.ways[way][0];
      const newPoint = new RoadPoint();
      const point = roadPath.getPointInsideTile(tile);
      roadPath.getPointPrevious(point);
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
