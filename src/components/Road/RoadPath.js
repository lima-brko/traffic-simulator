import contants from '../../helpers/constants';
import utils from '../../helpers/utils';
import constants from '../../helpers/constants';

const colors = {
  ways: {
    even: '#ff0000',
    odd: '#ff00ff'
  }
};

class RoadPath {
  constructor(props) {
    this.name = props.name;
    this.way = props.way;
    this.points = props.points;
    this.road = props.road;
  }

  getPointInsideTile(tile) {
    const halfTileSize = constants.tileSize / 2;
    let point;

    for(let i = 0; i < this.points.length; i++) {
      point = this.points[i];
      if(point.x > (tile.sceneX - halfTileSize) && point.x < (tile.sceneX + halfTileSize) && point.y > (tile.sceneY - halfTileSize) && point.y < (tile.sceneY + halfTileSize)) {
        return point;
      }
    }

    return null;
  }

  getPointPrevious(point) {
    let prevPoint;

    for(let i = 0; i < this.points.length; i++) {
      prevPoint = this.points[i];
      if(prevPoint.edges.indexOf(point) !== -1) {
        return prevPoint;
      }
    }
  }

  static drawOnCanvas(ctx, roadPath) {
    const firstPoint = roadPath.points[0];
    const pointsLen = roadPath.points.length;

    ctx.translate(contants.worldWidth / 2, contants.worldHeight / 2);

    // Lines
    ctx.beginPath();
    ctx.strokeStyle = colors.ways[roadPath.way];
    ctx.moveTo(firstPoint.x, firstPoint.y);

    for(let i = 1; i < pointsLen; i++) {
      const point = roadPath.points[i];
      ctx.lineTo(point.x, point.y);
    }

    ctx.stroke();
    ctx.closePath();

    // Arrows
    const x = roadPath.points[1].x - roadPath.points[0].x;
    const y = roadPath.points[1].y - roadPath.points[0].y;
    const angle = utils.calcAngleDegrees(x, y);

    let point;
    let edgeX;
    let edgeY;

    for(let i = 0; i < pointsLen; i++) {
      point = roadPath.points[i];
      ctx.beginPath();
      ctx.fillStyle = colors.ways[roadPath.way];
      edgeX = point.x + Math.sin(utils.angleToRadians(angle)) * (contants.tileSize / 12);
      edgeY = point.y + Math.cos(utils.angleToRadians(angle)) * (contants.tileSize / 12);
      ctx.moveTo(edgeX, edgeY);

      edgeX = point.x - Math.sin(utils.angleToRadians(angle)) * (contants.tileSize / 12);
      edgeY = point.y - Math.cos(utils.angleToRadians(angle)) * (contants.tileSize / 12);
      ctx.lineTo(edgeX, edgeY);

      edgeX = point.x + Math.cos(utils.angleToRadians(angle)) * (contants.tileSize / 8);
      edgeY = point.y + Math.sin(utils.angleToRadians(angle)) * (contants.tileSize / 8);
      ctx.lineTo(edgeX, edgeY);
      ctx.fill();
      ctx.closePath();
    }

    // Texts
    ctx.textAlign = 'center';
    ctx.font = '11px Verdana';
    ctx.fillStyle = '#000';
    ctx.fillText(roadPath.name, firstPoint.x, firstPoint.y + 10);
    ctx.resetTransform();
  }
}

export default RoadPath;
