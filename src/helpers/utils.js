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
   * @returns {point: {x: number, y: number}, left: boolean, dot: number: t: number}
   */
  getPointOnLine(pointX, pointY, lStartX, lStartY, lEndX, lEndY) {
    const p = {x: pointX, y: pointY};
    const a = {x: lStartX, y: lStartY};
    const b = {x: lEndX, y: lEndY};

    const atob = {x: b.x - a.x, y: b.y - a.y};
    const atop = {x: p.x - a.x, y: p.y - a.y};
    const len = atob.x * atob.x + atob.y * atob.y;
    let dot = atop.x * atob.x + atop.y * atob.y;
    const t = Math.min(1, Math.max(0, dot / len));

    dot = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);

    return {
      point: {
        x: a.x + atob.x * t,
        y: a.y + atob.y * t
      },
      left: dot < 1,
      dot,
      t
    };
  },

  /**
   * Get triangle area given 3 points
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {number} x3
   * @param {number} y3
   */
  getTriangleArea(x1, y1, x2, y2, x3, y3) {
    return Math.abs(0.5 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)));
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

  /**
   * Get number with limited decimals
   * @param {number} number
   * @param {number} decimals
   */
  roundNumber(number, decimals) {
    const newnumber = Number(`${number}`).toFixed(parseInt(decimals, 10));
    return parseFloat(newnumber);
  },

  /**
   * Transform radians to angle
   * @param {number} radians
   */
  radiansToAngle(radians) {
    return radians * (180 / Math.PI);
  },

  /**
   * TODO verify function tests
   * Get the difference between two angles
   * @param {number} a1
   * @param {number} a2
   */
  getAnglesDiff(a1, a2) {
    let aDiff = a1 - a2;
    if(aDiff > 180) {
      aDiff += -360;
    } else {
      aDiff += aDiff < -180 ? 360 : 0;
    }
    return aDiff;
  },
  angleToRadians(angle) {
    return angle * Math.PI / 180;
  },
  calcAngleDegrees(x, y) {
    return this.roundNumber(this.radiansToAngle(Math.atan2(y, x)), 2);
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
  },

  /**
   * Get distance between two points
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   */
  getPointsDistance(x1, y1, x2, y2) {
    return Math.sqrt(((x2 - x1) ** 2) + ((y2 - y1) ** 2));
  }
};

export default utils;
