import *as THREE from 'three';
import gsap from 'gsap';

import CarModel from './CarModel';
import CarSensor from './CarSensor';
import Navigation from '../../services/Navigation';
import utils from '../../helpers/utils';

class Car {
  constructor(props) {
    const {
      position,
      angle
    } = props;

    this.collidableMeshList = props.collidableMeshList;
    this.broken = false;
    this.position = {
      x: 0,
      y: 0
    };
    this.handleAngle = 0;
    this.color = utils.getRandomColor();
    this.mesh = CarModel.create3dModel(this.color);
    this.hitboxMesh = this.mesh.children.find((mesh) => mesh.name === 'hitbox');
    this.mesh.rotation.x = -Math.PI / 2;

    this.setPosition(position.x, position.y);
    this.setAngle(angle);

    this.navigation = Navigation;
    this.currentRoutePoint = null;

    this.velocity = 0;
    this.brakePower = 0.1;
    this.accelerationPower = 0.1;

    this.maxVelocity = 1.5;
    // this.maxVelocity = utils.getRandomInt(15, 20) / 10;
    this.callbacks = {
      onBrake: () => {},
      onArrival: () => {}
    };

    this.sensors = [
      new CarSensor(this.mesh.position, this.mesh.rotation)
    ];

    this.mesh.add(this.sensors[0].createMesh());
  }

  getLeftDistanceToEnd() {
    const {x, y} = this.position;
    const targetPoint = this.route[this.currentRoutePoint];
    let leftDistance = utils.getDistance(x, targetPoint.y, y, targetPoint.y);

    for(let i = this.currentRoutePoint + 1; i < this.route.length; i++) {
      leftDistance += utils.getDistance(this.route[i - 1].x, this.route[i].x, this.route[i - 1].y, this.route[i].y);
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

  setRoute(routePath, callbacks) {
    // const routeTiles = this.navigation.findBestRoute(fromTile, toTile);
    this.route = routePath;
    this.currentRoutePoint = 0;
    this.callbacks.onArrival = callbacks.onArrival;
    this.callbacks.onBrake = callbacks.onBrake;
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
    if(this.route[this.currentRoutePoint + 1]) {
      this.currentRoutePoint++;
    } else {
      this.currentRoutePoint = null;
      this.callbacks.onArrival(this);
    }
  }

  break() {
    if(this.broken) {
      return;
    }

    const _this = this;
    const materials = {
      gray: new THREE.MeshBasicMaterial({color: 0xAEAEAE}),
      black: new THREE.MeshBasicMaterial({color: 0x222222})
    };

    function animateColor(mesh) {
      const initial = new THREE.Color(materials.gray.color.getHex());
      const value = new THREE.Color(materials.black.color.getHex());

      gsap.to(initial, 1, {
        r: value.r,
        g: value.g,
        b: value.b,

        onUpdate() {
          mesh.material.color = initial;
        },
        onComplete() {
          _this.callbacks.onBrake(_this);
        }
      });
    }

    this.broken = true;
    this.mesh.children.forEach(animateColor);
  }

  update(index) {
    if(this.broken) {
      return;
    }

    if(this.currentRoutePoint === null) {
      return;
    }

    // const collisions = utils.checkCollision(this.hitboxMesh, this.collidableMeshList);
    // if(collisions.length) {
    //   this.break();
    //   return;
    // }
    if(index === 0) {
      this.sensors.forEach((sensor) => sensor.update());
    }

    const targetPoint = this.route[this.currentRoutePoint];
    const {x, y} = this.position;

    const deltaX = utils.roundNumber(targetPoint.x - x, 1);
    const deltaY = utils.roundNumber((targetPoint.y - y) * -1, 1);

    if(deltaX === 0 && deltaY === 0) {
      return this.nextRoutePoint();
    }

    const bestAngle = utils.calcAngleDegrees(deltaY, deltaX);
    if(bestAngle !== this.angle) {
      this.setAngle(bestAngle);
    }

    const leftDistance = this.getLeftDistanceToEnd();
    const distanceToStop = this.getStoppingDistance();
    if(distanceToStop >= leftDistance) {
      this.brakePower();
    } else {
      this.accelerate();
    }

    this.calculateNextPosition();

    const targetPointDist = Math.sqrt(((targetPoint.x - this.position.x) ** 2) + ((targetPoint.y - this.position.y) ** 2));

    if(targetPointDist < this.maxVelocity) {
      this.nextRoutePoint();
    }
  }
}

export default Car;
