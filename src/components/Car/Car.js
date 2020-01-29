import *as THREE from 'three';
import gsap from 'gsap';

import CarModel from './CarModel';
import CarSensor from './CarSensor';
import Navigation from '../../services/Navigation';
import utils from '../../helpers/utils';
import TrafficLight from '../Road/TrafficLight';

class Car {
  constructor(props) {
    const {
      position,
      angle
    } = props;

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
    this.currentRouteTargetIdx = null;
    this.currentRouteTargetNode = null;
    this.currentRoadPath = null;
    this.currentTargetNode = null;
    this.changingLane = false;

    this.velocity = 0;
    this.brakePower = 0.08;
    this.accelerationPower = 0.08;

    this.maxVelocity = utils.getRandomInt(15, 20) / 10;
    this.callbacks = {
      onBrake: () => {},
      onArrival: () => {}
    };

    this.sensors = [
      new CarSensor({
        name: 'front',
        car: this,
        near: CarModel.carSize / 2,
        far: this.getStoppingDistance(this.maxVelocity) + (CarModel.carSize / 2) + 10
      })
    ];
    this.mesh.add(this.sensors[0].line);
  }

  getLeftDistanceToEnd() {
    let leftDistance = this.mesh.position.distanceTo(this.route[this.currentRouteTargetIdx].vector3);

    for(let i = this.currentRouteTargetIdx + 1; i < this.route.length; i++) {
      leftDistance += this.route[i - 1].vector3.distanceTo(this.route[i].vector3);
    }

    return leftDistance;
  }

  getStoppingDistance(velocity) {
    let tmpVelocity = velocity;
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
    this.currentRouteTargetIdx = 0;
    this.currentRoadPath = this.route[this.currentRouteTargetIdx].roadPath;
    this.currentTargetNode = this.route[this.currentRouteTargetIdx];
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

  nextTargetNode() {
    const targetRouteNode = this.route[this.currentRouteTargetIdx];
    const routeNodeIdx = this.currentTargetNode.nextPoints.indexOf(targetRouteNode);

    if(routeNodeIdx !== -1) {
      this.currentTargetNode = targetRouteNode;
      return;
    }

    // eslint-disable-next-line prefer-destructuring
    this.currentTargetNode = this.currentTargetNode.nextPoints[0];
  }

  nextRouteNode() {
    const nextRouteNode = this.route[this.currentRouteTargetIdx + 1];

    if(!nextRouteNode) {
      this.currentRouteTargetIdx = null;
      this.currentTargetNode = null;
      this.currentRoadPath = null;
      this.currentTargetNode = null;
      setTimeout(() => {
        this.callbacks.onArrival(this);
      });
      return false;
    }

    this.currentRouteTargetIdx++;
    this.currentRoadPath = this.route[this.currentRouteTargetIdx].roadPath;
    this.nextTargetNode();
    return true;
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

    const initial = new THREE.Color(materials.gray.color.getHex());
    const value = new THREE.Color(materials.black.color.getHex());

    gsap.to(initial, 1, {
      r: value.r,
      g: value.g,
      b: value.b,

      onUpdate() {
        _this.mesh.children.forEach((mesh) => {
          if(mesh.name === 'sensor') {
            return;
          }

          mesh.material.color = initial;
        });
      },
      onComplete() {
        _this.callbacks.onBrake(_this);
      }
    });

    this.broken = true;
  }

  resetSensors() {
    this.sensors.forEach((sensor) => sensor.reset());
  }

  checkCollision(collidableList) {
    if(this.broken) {
      return;
    }

    if(!collidableList.length) {
      this.resetSensors();
      return;
    }

    const collidableMeshList = collidableList
      .filter((obj) => {
        if(obj instanceof TrafficLight && obj.state !== 'red') {
          return false;
        }

        return true;
      })
      .map((obj) => obj.hitboxMesh);

    const collisions = utils.checkCollision(this.hitboxMesh, collidableMeshList);
    if(collisions.length) {
      this.break();
      collisions.forEach((collision) => {
        if(collision.object.name === 'traffic_light_hitbox') {
          return;
        }

        collidableList[collidableMeshList.indexOf(collision.object)].break();
      });
    }

    const sensorCollidableList = collidableList.map((obj) => obj.hitboxMesh);
    this.sensors.forEach((sensor) => {
      sensor.update(sensorCollidableList);
    });
  }

  setAngleTo(targetX, targetY) {
    const {x, y} = this.position;

    const deltaX = utils.roundNumber(targetX - x, 1);
    const deltaY = utils.roundNumber((targetY - y) * -1, 1);

    const bestAngle = utils.calcAngleDegrees(deltaY, deltaX);

    if(bestAngle !== this.angle) {
      this.setAngle(bestAngle);
    }
  }

  calculateCarHandling() {
    if(this.changingLane) {
      const targetRoadPath = this.currentTargetNode.roadPath;
      const targetDeepestNode = targetRoadPath.getDeepestPoint();
      const pointOnlineData = utils.getPointOnLine(
        this.position.x,
        this.position.y,
        targetRoadPath.initPoint.x,
        targetRoadPath.initPoint.y,
        targetDeepestNode.x,
        targetDeepestNode.y
      );

      const dist = utils.getDistance(pointOnlineData.point.x, pointOnlineData.point.y, this.position.x, this.position.y);
      if(dist < 5) {
        this.currentRoadPath = this.currentTargetNode.roadPath;
        this.changingLane = false;
      }
    } else if(!this.changingLane && this.currentRoadPath !== this.currentTargetNode.roadPath) {
      this.changeLane(this.currentTargetNode.roadPath.order > this.currentRoadPath.order ? 'right' : 'left');
    } else {
      this.setAngleTo(this.currentTargetNode.x, this.currentTargetNode.y);
    }
  }

  calculateCarReaction() {
    const endDistance = this.getLeftDistanceToEnd();
    const distanceToStop = this.getStoppingDistance(this.velocity);
    const sensorDistance = this.sensors[0].distance;
    // const carHalfSize = CarModel.carSize / 2;

    if(
      sensorDistance !== null
    ) {
      this.brake();
      return;
    }

    if(endDistance <= distanceToStop) {
      this.brake();
    } else if(sensorDistance === distanceToStop) {
      // this.accelerate();
    } else {
      this.accelerate();
    }
  }

  changeLane(direction) {
    const mod = direction === 'right' ? -45 : 45;
    this.changingLane = true;
    let newAngle = this.angle + mod;
    if(newAngle > 180) {
      newAngle = 180 - newAngle;
    }

    if(newAngle < -180) {
      newAngle = 360 + newAngle;
    }

    this.setAngle(newAngle);
  }

  update() {
    if(this.broken || this.currentRouteTargetIdx === null) {
      return;
    }

    let targetRouteNode = this.route[this.currentRouteTargetIdx];
    let targetRouteNodeDist = utils.getDistance(targetRouteNode.x, targetRouteNode.y, this.position.x, this.position.y);
    if(!targetRouteNodeDist) {
      if(!this.nextRouteNode()) {
        return;
      }

      targetRouteNode = this.route[this.currentRouteTargetIdx];
      targetRouteNodeDist = utils.getDistance(targetRouteNode.x, targetRouteNode.y, this.position.x, this.position.y);
    }

    const targetNodeDist = utils.getDistance(this.currentTargetNode.x, this.currentTargetNode.y, this.position.x, this.position.y);

    this.calculateCarHandling();
    this.calculateCarReaction();
    this.calculateNextPosition();

    if(targetRouteNodeDist <= this.maxVelocity) {
      this.nextRouteNode();
      return;
    }

    if(targetNodeDist <= this.maxVelocity) {
      this.nextTargetNode();
    }
  }
}

export default Car;
