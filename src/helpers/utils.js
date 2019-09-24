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
  }
};

export default utils;
