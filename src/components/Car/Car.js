import *as THREE from 'three';
import gsap from 'gsap';

import CarModel from './CarModel';
import CarSensor from './CarSensor';
import Navigation from '../../services/Navigation';
import utils from '../../helpers/utils';
import TrafficLight from '../Road/TrafficLight';
import RoadPath from '../Road/RoadPath';

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
    this.state = null;
    this.handleAngle = 0;
    this.color = utils.getRandomColor();
    this.mesh = CarModel.create3dModel(this.color);
    this.hitboxMesh = this.mesh.children.find((mesh) => mesh.name === 'hitbox');
    this.mesh.rotation.x = -Math.PI / 2;

    this.setPosition(position.x, position.y);
    this.setAngle(angle);

    this.route = [];
    this.routeIdx = null;

    this.detailedRoute = [];
    this.detailedRouteIdx = null;

    this.navigation = Navigation;
    this.currentRouteTargetNode = null;
    this.currentRoadPath = null;

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
    let leftDistance = this.mesh.position.distanceTo(this.route[this.routeIdx].vector3);

    for(let i = this.routeIdx + 1; i < this.route.length; i++) {
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
    this.mesh.rotation.z = utils.angleToRadians(this.angle - 90);
  }

  calculateNextPosition() {
    const {x, y} = this.position;
    const radians = utils.angleToRadians(this.angle);
    const newX = utils.roundNumber(x + Math.cos(radians) * this.velocity, 1);
    const newY = utils.roundNumber(y - Math.sin(radians) * this.velocity, 1);
    this.setPosition(newX, newY);
  }

  setRoute(routePath, callbacks) {
    // const routeTiles = this.navigation.findBestRoute(fromTile, toTile);
    this.route = routePath;
    this.routeIdx = 0;
    this.currentRoadPath = this.route[this.routeIdx].roadPath;

    this.updateDetailedRoute();

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

  // nextDetailedRoute() {
  //   const routeNode = this.route[this.routeIdx];
  //   const routeNodeIdx = this.currentTargetNode.nextPoints.indexOf(routeNode);

  //   if(routeNodeIdx !== -1) {
  //     this.currentTargetNode = routeNode;
  //     return;
  //   }

  //   // eslint-disable-next-line prefer-destructuring
  //   this.currentTargetNode = this.currentTargetNode.nextPoints[0];
  // }

  onArriveDetailedRoute() {
    const detailedRouteNode = this.detailedRoute[this.detailedRouteIdx];
    const nextDetailedRouteNode = this.detailedRoute[this.detailedRouteIdx + 1];

    if(!nextDetailedRouteNode) {
      this.onArriveRoute();
      return;
    }

    this.detailedRouteIdx++;

    if(detailedRouteNode.laneChange) {
      this.currentRoadPath = detailedRouteNode.roadPath;
    }
  }

  onArriveRoute() {
    const currentRouteNode = this.route[this.routeIdx];
    const nextRouteNode = this.route[this.routeIdx + 1];

    if(!nextRouteNode) {
      this.route = [];
      this.routeIdx = null;
      this.detailedRoute = [];
      this.detailedRouteIdx = null;
      setTimeout(() => {
        this.callbacks.onArrival(this);
      });
      return;
    }

    this.routeIdx++;
    const isDifferentWay = currentRouteNode.roadPath.way !== nextRouteNode.roadPath.way;

    if(isDifferentWay) {
      const nextWayNode = currentRouteNode.nextPoints[0];
      this.currentRoadPath = nextWayNode.roadPath;
      this.updateDetailedRoute(nextWayNode);
      return;
    }

    this.updateDetailedRoute(currentRouteNode);
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

    const bestAngle = utils.calcAngleDegrees(deltaX, deltaY);

    if(bestAngle !== this.angle) {
      this.setAngle(bestAngle);
    }
  }

  updateDetailedRoute(lastPassedNode) {
    const routeNode = this.route[this.routeIdx];

    if(!lastPassedNode) {
      this.detailedRoute = [this.route[this.routeIdx]];
      this.detailedRouteIdx = 0;
      return;
    }

    if(routeNode.roadPath !== this.currentRoadPath) {
      this.detailedRoute = this.getChangeLaneRoute(routeNode.roadPath.order > this.currentRoadPath.order ? 'right' : 'left');
      this.detailedRouteIdx = 0;
      return;
    }

    this.detailedRoute = RoadPath.getPathUntilNode(lastPassedNode, this.route[this.routeIdx]);
    this.detailedRouteIdx = 0;


    // if(this.changingLaneNode) {
    //   const dist = utils.getPointsDistance(this.changingLaneNode.x, this.changingLaneNode.y, this.position.x, this.position.y);
    //   if(dist < 5) {
    //     this.currentRoadPath = this.changingLaneNode.roadPath;
    //     this.currentTargetNode = this.currentRoadPath.getNextNodeFrom(this.changingLaneNode.x, this.changingLaneNode.y);
    //     this.changingLaneNode = null;
    //   }
    // } else if(!this.changingLaneNode && this.currentRoadPath !== currentRouteNode.roadPath) {
    //   this.changeLane(this.currentTargetNode.roadPath.order > currentRouteNode.roadPath.order ? 'right' : 'left');
    // } else {
    //   this.setAngleTo(this.currentTargetNode.x, this.currentTargetNode.y);
    // }
  }

  calculateCarReaction() {
    const endDistance = this.getLeftDistanceToEnd();
    const distanceToStop = this.getStoppingDistance(this.velocity);
    const sensorDistance = this.sensors[0].distance;
    // const carHalfSize = CarModel.carSize / 2;
    const detailedRouteNode = this.detailedRoute[this.detailedRouteIdx];
    this.setAngleTo(detailedRouteNode.x, detailedRouteNode.y);

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

  getChangeLaneRoute(direction) {
    const targetRoadPath = this.route[this.routeIdx].roadPath;
    const deepestNode = targetRoadPath.getDeepestPoint();
    const mod = direction === 'right' ? -1 : 1;
    let newAngle = this.currentRoadPath.getAngle() + (45 * mod);
    if(newAngle > 180) {
      newAngle = -360 + newAngle;
    }

    if(newAngle < -180) {
      newAngle = 360 + newAngle;
    }

    const {x, y} = this.position;
    const diagonalPos = {
      x: x + Math.cos(utils.angleToRadians(newAngle)) * 10,
      y: y + Math.sin(utils.angleToRadians(newAngle * -1)) * 10
    };

    const intersection = utils.getLinesIntersection(
      x,
      y,
      diagonalPos.x,
      diagonalPos.y,
      targetRoadPath.initPoint.x,
      targetRoadPath.initPoint.y,
      deepestNode.x,
      deepestNode.y
    );

    const changingLaneNode = {
      x: intersection.x,
      y: intersection.y,
      roadPath: targetRoadPath,
      laneChange: true
    };

    const nextRoadPathNode = targetRoadPath.getNextNodeFrom(changingLaneNode.x, changingLaneNode.y);

    return [
      changingLaneNode,
      ...RoadPath.getPathUntilNode(nextRoadPathNode, this.route[this.routeIdx])
    ];
  }

  update() {
    if(this.broken || this.routeIdx === null) {
      return;
    }

    const detailRouteNode = this.detailedRoute[this.detailedRouteIdx];
    const detailRouteNodeDist = utils.getPointsDistance(detailRouteNode.x, detailRouteNode.y, this.position.x, this.position.y);

    if(detailRouteNodeDist <= this.maxVelocity) {
      this.onArriveDetailedRoute();
    }

    if(this.routeIdx === null) {
      return;
    }

    // let routeNode = this.route[this.routeIdx];
    // let routeNodeDist = utils.getPointsDistance(routeNode.x, routeNode.y, this.position.x, this.position.y);
    // if(!routeNodeDist || routeNodeDist <= this.maxVelocity) {
    //   if(!this.onArriveRoute()) {
    //     return;
    //   }

    //   routeNode = this.route[this.routeIdx];
    //   routeNodeDist = utils.getPointsDistance(routeNode.x, routeNode.y, this.position.x, this.position.y);
    // }

    this.calculateCarReaction();
    this.calculateNextPosition();
  }
}

export default Car;
