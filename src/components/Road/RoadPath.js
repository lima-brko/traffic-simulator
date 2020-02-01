import contants from '../../helpers/constants';
import utils from '../../helpers/utils';
import RoadPathNode from './RoadPathNode';
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
    this.order = props.order;
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

  getAngle() {
    const x = this.initPoint.nextPoints[0].x - this.initPoint.x;
    const y = this.initPoint.nextPoints[0].y - this.initPoint.y;
    return utils.calcAngleDegrees(x, y * -1);
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

  createNodeOnLineIntersect(line) {
    const startNode = this.initPoint;
    const endNode = this.getDeepestPoint();
    const intersection = utils.getLinesIntersection(
      startNode.x,
      startNode.y,
      endNode.x,
      endNode.y,
      line[0].x,
      line[0].y,
      line[1].x,
      line[1].y,
      true
    );

    if(!intersection) {
      return null;
    }

    const newPoint = new RoadPathNode({
      x: intersection.x,
      y: intersection.y,
      roadPath: this
    });

    this
      .getNextNodeFrom(intersection.x, intersection.y)
      .addBefore(newPoint);

    return newPoint;
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

  drawDetailsOnCanvas(ctx) {
    const {way} = this;
    ctx.translate(contants.worldWidth / 2, contants.worldHeight / 2);

    // Lines
    ctx.beginPath();
    ctx.strokeStyle = colors.ways[way.type];

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
    drawLines(this.initPoint);

    ctx.stroke();
    ctx.closePath();

    // Arrows
    const x = this.initPoint.nextPoints[0].x - this.initPoint.x;
    const y = this.initPoint.nextPoints[0].y - this.initPoint.y;
    const angle = utils.calcAngleDegrees(x, y);

    let edgeX;
    let edgeY;

    function drawArrows(point) {
      if(!point.nextPoints.length) {
        return;
      }

      ctx.beginPath();
      ctx.fillStyle = colors.ways[way.type];
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
    drawArrows(this.initPoint);

    // Texts
    ctx.textAlign = 'center';
    ctx.font = '11px Verdana';
    ctx.fillStyle = '#000';
    ctx.fillText(this.name, this.initPoint.x, this.initPoint.y + 10);
    ctx.resetTransform();
  }

  static getPathUntilNode(fromNode, targetNode) {
    function move(node, path = []) {
      if(node === targetNode) {
        path.push(node);
        return path;
      }

      if(!node.nextPoints.length) {
        return null;
      }

      let nextNode;
      let foundPath;
      for(let i = 0; i < node.nextPoints.length; i++) {
        nextNode = node.nextPoints[i];
        if(nextNode.roadPath !== node.roadPath) {
          return null;
        }

        foundPath = move(nextNode, [...path, node]);
        if(foundPath) {
          // eslint-disable-next-line no-param-reassign
          return foundPath;
        }
      }

      return null;
    }

    const foundPath = move(fromNode);
    return foundPath.length === 0 ? null : foundPath;
  }

  getNextNodeFrom(x, y) {
    let angle1;
    let angle2;
    let angleDiff;
    let maxAngleDiff;
    let closestNextNode = null;

    function move(point) {
      if(!point.nextPoints.length) {
        return false;
      }

      angle1 = utils.calcAngleDegrees(x - point.x, y - point.y);
      angle2 = utils.calcAngleDegrees(x - point.nextPoints[0].x, y - point.nextPoints[0].y);
      angleDiff = Math.abs(utils.getAnglesDiff(angle1, angle2));

      if(!maxAngleDiff || angleDiff > maxAngleDiff) {
        maxAngleDiff = angleDiff;
        // eslint-disable-next-line prefer-destructuring
        closestNextNode = point.nextPoints[0];
      }

      return move(point.nextPoints[0]);
    }

    move(this.initPoint);

    return closestNextNode;
  }

  drawOnCanvas(ctx) {
    // this.drawDetailsOnCanvas(ctx);

    if(this.order === 0) {
      return;
    }

    const angle = this.getAngle();
    const angleModX = Math.sin(utils.angleToRadians(angle)) * constants.quarterTileSize;
    const angleModY = Math.cos(utils.angleToRadians(angle)) * constants.quarterTileSize;

    ctx.translate(contants.worldWidth / 2, contants.worldHeight / 2);

    // Road lane dashed line
    ctx.beginPath();
    function moveLine(point) {
      ctx.lineTo(point.x - angleModX, point.y - angleModY);

      if(!point.nextPoints.length) {
        return false;
      }

      return moveLine(point.nextPoints[0]);
    }

    ctx.moveTo(this.initPoint.x - angleModX, this.initPoint.y - angleModY);
    moveLine(this.initPoint.nextPoints[0]);

    ctx.lineWidth = 1;
    ctx.setLineDash([10, 15]);
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.closePath();
    ctx.setLineDash([]);

    ctx.resetTransform();
  }
}

export default RoadPath;
