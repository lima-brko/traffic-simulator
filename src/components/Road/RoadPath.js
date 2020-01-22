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
    this.road = props.road;
    this.initPoint = null;
  }

  addPoint(point) {
    point.roadPath = this;

    if(!this.initPoint) {
      this.initPoint = point;
      return;
    }

    const deepPoint = this.getDeepestPoint();
    deepPoint.addNextPoint(point);
  }

  find(condition) {
    function compare(point) {
      if(condition(point)) {
        return point;
      }
      const nextLen = point.nextPoints.length;
      let nextPoint;

      for(let i = 0; i < nextLen; i++) {
        nextPoint = point.nextPoints[i];
        if(nextPoint.roadPath.name !== point.roadPath.name) {
          continue;
        }

        const foundPoint = compare(nextPoint);
        if(foundPoint) {
          return foundPoint;
        }
      }

      return null;
    }

    return compare(this.initPoint);
  }

  getDeepestPoint() {
    return this.find((point) => point.nextPoints.length === 0);
  }

  getClosestPoint(x, y) {
    let closestPoint = null;
    let minDist = null;
    let dist;

    this.find((point) => {
      dist = Math.sqrt(((x - point.x) ** 2) + ((y - point.y) ** 2));

      if(!closestPoint || dist < minDist) {
        minDist = dist;
        closestPoint = point;
      }

      return false;
    });

    return closestPoint;
  }

  getPathToAnyEndPoint() {
    function move(point, path) {
      path.push(point);

      if(!point.nextPoints.length) {
        return path;
      }

      const randomNextPoint = point.nextPoints[utils.getRandomInt(0, point.nextPoints.length)];
      return move(randomNextPoint, path);
    }

    return move(this.initPoint, []);
  }

  getPointPreviousPoint(searchingPoint) {
    return this.find((point) => {
      if(point.nextPoints.indexOf(searchingPoint) !== -1) {
        return true;
      }

      return false;
    });
  }

  addPointAt(point, index) {
    point.roadPath = this;
    this.points.splice(index, 0, point);
  }

  static drawOnCanvas(ctx, roadPath) {
    const firstPoint = roadPath.initPoint;
    ctx.translate(contants.worldWidth / 2, contants.worldHeight / 2);

    // Lines
    ctx.beginPath();
    ctx.strokeStyle = colors.ways[roadPath.way];

    function drawLines(point) {
      point.nextPoints.forEach((nextPoint) => {
        if(point.roadPath.name !== nextPoint.roadPath.name) {
          return;
        }

        ctx.moveTo(point.x, point.y);
        ctx.lineTo(nextPoint.x, nextPoint.y);

        drawLines(nextPoint);
      });
    }
    drawLines(firstPoint);

    ctx.stroke();
    ctx.closePath();

    // Arrows
    const x = roadPath.initPoint.nextPoints[0].x - roadPath.initPoint.x;
    const y = roadPath.initPoint.nextPoints[0].y - roadPath.initPoint.y;
    const angle = utils.calcAngleDegrees(x, y);

    let edgeX;
    let edgeY;

    function drawArrows(point) {
      if(!point.nextPoints.length) {
        return;
      }

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
      point.nextPoints.forEach((nextPoint) => {
        if(point.roadPath.name !== nextPoint.roadPath.name) {
          return;
        }

        drawArrows(nextPoint);
      });
    }
    drawArrows(firstPoint);

    // Texts
    ctx.textAlign = 'center';
    ctx.font = '11px Verdana';
    ctx.fillStyle = '#000';
    ctx.fillText(roadPath.name, firstPoint.x, firstPoint.y + 10);
    ctx.resetTransform();
  }
}

export default RoadPath;
