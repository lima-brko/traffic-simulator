import contants from '../helpers/constants';
import utils from '../helpers/utils';

class RoadPoint {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.edges = [];
  }
}

class RoadPath {
  constructor(props) {
    this.name = props.name;
    this.points = props.points;
  }
}

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
      const y = props.tiles[1].sceneY - props.tiles[0].sceneY;
      const angle = utils.calcAngleDegrees(x, y);
      const points = [];

      props.tiles.forEach((tile) => {
        const pointX = tile.sceneX + Math.sin(utils.angleToRadians(angle)) * (this.tileSize / 4);
        const pointY = tile.sceneY + Math.cos(utils.angleToRadians(angle)) * (this.tileSize / 4);
        points.push(new RoadPoint(pointX, pointY));
      });

      this.ways[way].push(new RoadPath({
        name: `${this.name}-${way}`,
        points
      }));
    });
  }

  static drawPathOnCanvas(ctx, roadPath) {
    const firstPoint = roadPath.points[0];
    const pointsLen = roadPath.points.length;

    ctx.translate(contants.worldWidth / 2, contants.worldHeight / 2);

    ctx.beginPath();
    ctx.fillStyle = '#989899';
    ctx.strokeStyle = '#ff0000';
    ctx.moveTo(firstPoint.x, firstPoint.y);

    for(let i = 1; i < pointsLen; i++) {
      const point = roadPath.points[i];
      ctx.lineTo(point.x, point.y);
    }

    ctx.stroke();
    ctx.closePath();

    for(let i = 0; i < pointsLen; i++) {
      const point = roadPath.points[i];
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    }

    ctx.textAlign = 'center';
    ctx.font = '11px Verdana';
    ctx.fillStyle = '#000';
    ctx.fillText(roadPath.name, firstPoint.x, firstPoint.y + 10);
    ctx.resetTransform();
  }

  drawOnCanvas(ctx) {
    Object.keys(this.ways).forEach((way) => {
      this.ways[way].forEach((roadPath) => {
        Road.drawPathOnCanvas(ctx, roadPath);
      });
    });
  }
}

export default Road;
