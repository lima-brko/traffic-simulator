import {Raycaster} from 'three';

const utils = {

  /**
   * Get the closest intersection of a point in a line
   * @param {number} pointX
   * @param {number} pointY
   * @param {number} lStartX
   * @param {number} lStartY
   * @param {number} lEndX
   * @param {number} lEndY
   */
  getPointOnLine(pointX, pointY, lStartX, lStartY, lEndX, lEndY) {
    const atob = {x: lEndX - lStartX, y: lEndY - lStartY};
    const atop = {x: pointX - lStartX, y: pointY - lStartY};
    const len = atop.x * atop.x + atob.y * atob.y;
    let dot = atop.x * atop.x + atop.y * atob.y;
    const t = Math.min(1, Math.max(0, dot / len));

    dot = (lEndX - lStartX) * (pointY - lStartY) - (lEndY - lStartY) * (pointX - lStartX);

    return {
      point: {
        x: lStartX + atop.x * t,
        y: lStartY + atob.y * t
      },
      left: dot < 1,
      dot,
      t
    };
  },

  /**
   * Get intersection point between two lines
   * @param {number} l1StartX
   * @param {number} l1StartY
   * @param {number} l1EndX
   * @param {number} l1EndY
   * @param {number} l2StartX
   * @param {number} l2StartY
   * @param {number} l2EndX
   * @param {number} l2EndY
   * @param {boolean} [edgeCheck]
   * @returns {{x: number, y: number, onLine1: boolean, onLine2: boolean} || null}
   */
  getLinesIntersection(l1StartX, l1StartY, l1EndX, l1EndY, l2StartX, l2StartY, l2EndX, l2EndY, edgeCheck = false) {
    const denominator = ((l2EndY - l2StartY) * (l1EndX - l1StartX)) - ((l2EndX - l2StartX) * (l1EndY - l1StartY));

    if(denominator === 0) {
      return null;
    }

    const result = {
      x: null,
      y: null,
      onLine1: false,
      onLine2: false
    };
    let a = l1StartY - l2StartY;
    let b = l1StartX - l2StartX;

    const numerator1 = ((l2EndX - l2StartX) * a) - ((l2EndY - l2StartY) * b);
    const numerator2 = ((l1EndX - l1StartX) * a) - ((l1EndY - l1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = l1StartX + (a * (l1EndX - l1StartX));
    result.y = l1StartY + (a * (l1EndY - l1StartY));

    if(edgeCheck) {
      // if l1 is a segment and l2 is infinite, they intersect if:
      if(a >= 0 && a <= 1) {
        result.onLine1 = true;
      }

      // if l2 is a segment and l1 is infinite, they intersect if:
      if(b >= 0 && b <= 1) {
        result.onLine2 = true;
      }
    } else {
      if(a > 0 && a < 1) {
        result.onLine1 = true;
      }

      if(b > 0 && b < 1) {
        result.onLine2 = true;
      }
    }

    // if l1 and l2 are segments, they intersect if both of the above are true
    return result;
  },
  roundNumber(number, decimals) {
    const newnumber = Number(`${number}`).toFixed(parseInt(decimals, 10));
    return parseFloat(newnumber);
  },
  radiansToAngle(radians) {
    return radians * (180 / Math.PI);
  },
  angleToRadians(angle) {
    return angle * Math.PI / 180;
  },
  calcAngleDegrees(x, y) {
    return this.roundNumber(this.radiansToAngle(Math.atan2(y, x)), 2);
  },
  getDistance(x1, x2, y1, y2) {
    const a = x1 - x2;
    const b = y1 - y2;

    return Math.sqrt(a * a + b * b);
  },

  /**
   * The maximum is exclusive and the minimum is inclusive
   * @param {number} min
   * @param {number} max
   */
  getRandomInt(min, max) {
    const minCeil = Math.ceil(min);
    const maxFloor = Math.floor(max);
    return Math.floor(Math.random() * (maxFloor - minCeil)) + minCeil;
  },
  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for(let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  },
  pullPointReferenceToLineWithAngle(x1, x2, y1, y2, angle) {
    const deltaY = y2 - y1;
    const deltaX = x2 - x1;
    const angleBetween = Math.atan2(deltaY, deltaX);
    const distance = Math.hypot(deltaX, deltaY);
    const x = x2 + (distance * Math.cos(angleBetween + angle));
    const y = y2 + (distance * Math.sin(angleBetween + angle));
    return [x, y];
  },
  loadImage(url, callback) {
    const image = new Image();

    image.onload = function() {
      callback(image);
    };

    image.src = url;
  },
  checkCollision(obj, collidableMeshList) {
    const objVertices = obj.geometry.vertices;
    let localVertex;
    let globalVertex;
    let directionVector;
    let ray;
    let collisionResults;
    let vertexIndex;

    for(vertexIndex = 0; vertexIndex < objVertices.length; vertexIndex++) {
      localVertex = objVertices[vertexIndex].clone();
      globalVertex = localVertex.applyMatrix4(obj.parent.matrix);
      directionVector = globalVertex.sub(obj.parent.position);

      ray = new Raycaster(obj.parent.position.clone(), directionVector.clone().normalize(), 0, 30);
      collisionResults = ray.intersectObjects(collidableMeshList);

      if(collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
        return collisionResults;
      }
    }

    return [];
  }
};

export default utils;
