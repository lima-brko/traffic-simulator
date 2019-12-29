import {Raycaster} from 'three';

const utils = {
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
    const distance = Math.hypot(x2 - x1, y2 - y1);
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
