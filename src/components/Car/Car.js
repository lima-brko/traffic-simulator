import CarModel from './CarModel';
// import CarSensor from './CarSensor';
import Navigation from '../../services/Navigation';
import utils from '../../helpers/utils';

class Car {
  constructor(props) {
    const {
      position,
      angle
    } = props;

    this.position = {
      x: 0,
      y: 0
    };
    this.handleAngle = 0;
    this.color = utils.getRandomColor();
    this.mesh = CarModel.create3dModel(this.color);
    this.mesh.rotation.x = -Math.PI / 2;

    this.setPosition(position.sceneX, position.sceneY);
    this.setAngle(angle);

    this.navigation = Navigation;
    this.currentRouteTile = null;

    this.velocity = 0;
    this.brakePower = 0.1;
    this.accelerationPower = 0.1;
    this.maxVelocity = 0.5;
    this.callbacks = {
      onArrival: () => {}
    };

    // this.sensors = {
    //   front: new CarSensor(this.mesh.position, 0)
    // };

    // this.mesh.add(this.sensors.front.createMesh());
  }

  getLeftDistanceToEnd() {
    const {x, y} = this.position;
    const targetTile = this.route[this.currentRouteTile];
    let leftDistance = utils.getDistance(x, targetTile.sceneY, y, targetTile.sceneY);

    for(let i = this.currentRouteTile + 1; i < this.route.length; i++) {
      leftDistance += utils.getDistance(this.route[i - 1].sceneX, this.route[i].sceneX, this.route[i - 1].sceneY, this.route[i].sceneY);
    }

    return leftDistance;
  }

  getStoppingDistance() {
    let tmpVelocity = this.velocity;
    let stoppingDistance = 0;
    while(tmpVelocity > 0) {
      tmpVelocity -= this.brakePower;
      stoppingDistance += tmpVelocity;
    }
    return stoppingDistance;
  }

  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
    this.mesh.position.set(x, 0, y);
  }

  setAngle(angle) {
    this.angle = angle;
    this.mesh.rotation.z = -utils.angleToRadians(this.angle);
  }

  calculateNextPosition() {
    const {x, y} = this.position;
    const newX = utils.roundNumber(x + Math.sin(utils.angleToRadians(this.angle)) * this.velocity, 1);
    const newY = utils.roundNumber(y - Math.cos(utils.angleToRadians(this.angle)) * this.velocity, 1);
    this.setPosition(newX, newY);
  }

  setRoute(fromTile, toTile, callbacks) {
    const routeTiles = this.navigation.findBestRoute(fromTile, toTile);
    this.route = routeTiles.map((tile, idx) => {
      const deltaX = utils.roundNumber(targetTile.sceneX - x, 1);
      const deltaY = utils.roundNumber((targetTile.sceneY - y) * -1, 1);

      return {
        tile,
        sceneX: 0,
        sceneY: 0
      };
    });
    this.currentRouteTile = 0;
    this.callbacks.onArrival = callbacks.onArrival;
  }

  accelerate() {
    const nextVelocity = this.velocity + this.accelerationPower;
    if(nextVelocity > this.maxVelocity) {
      this.velocity = this.maxVelocity;
      return;
    }

    this.velocity = nextVelocity;
  }

  brake() {
    const nextVelocity = this.velocity - this.brakePower;
    if(nextVelocity < 0) {
      this.velocity = 0;
      return;
    }

    this.velocity = nextVelocity;
  }

  // turnLeft() {

  // }

  nextRoutePoint() {
    if(this.route[this.currentRouteTile + 1]) {
      this.currentRouteTile++;
    } else {
      this.currentRouteTile = null;
      this.callbacks.onArrival(this);
    }
  }

  update() {
    if(this.currentRouteTile === null) {
      return;
    }

    const targetTile = this.route[this.currentRouteTile];
    const {x, y} = this.position;

    const deltaX = utils.roundNumber(targetTile.sceneX - x, 1);
    const deltaY = utils.roundNumber((targetTile.sceneY - y) * -1, 1);

    if(deltaX === 0 && deltaY === 0) {
      return this.nextRoutePoint();
    }

    const bestAngle = utils.calcAngleDegrees(deltaY, deltaX);
    if(bestAngle !== this.angle) {
      this.setAngle(bestAngle);
    }

    // if(isLastTile) {
    const leftDistance = this.getLeftDistanceToEnd();
    const distanceToStop = this.getStoppingDistance();
    if(distanceToStop >= leftDistance) {
      this.brakePower();
    } else {
      this.accelerate();
    }
    // } else {
    //   this.accelerate();
    // }

    this.calculateNextPosition();

    if(targetTile.sceneX === this.position.x &&
       targetTile.sceneY === this.position.y) {
      this.nextRoutePoint();
    }
  }
}

export default Car;
