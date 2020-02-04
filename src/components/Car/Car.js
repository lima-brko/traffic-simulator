import *as THREE from 'three';
import gsap from 'gsap';

import CarModel from './CarModel';
import CarSensor from './CarSensor';
import Navigation from '../../services/Navigation';
import utils from '../../helpers/utils';
import TrafficLight from '../Road/TrafficLight';
import RoadPath from '../Road/RoadPath';
import RoadPathNode from '../Road/RoadPathNode';

const safeVelocity = 0.8;
const safeCarDistance = CarModel.carSize * 2 + 5;

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
    this.leftVelocity = 0;
    this.changingLane = false;

    this.velocity = 0;
    this.brakePower = 0.07;
    this.accelerationPower = 0.01;

    this.maxVelocity = utils.getRandomInt(11, 17) / 10;
    this.callbacks = {
      onBrake: () => {},
      onArrival: () => {}
    };

    this.sensors = {};

    const sensorNear = 5;
    const sensorLongNear = CarModel.carSize / 2;
    const sensorFar = this.getStoppingDistance(this.maxVelocity) + (CarModel.carSize / 2) + 5;
    const sensorLongFar = this.getStoppingDistance(this.maxVelocity) + (CarModel.carSize / 2) + 20;
    [
      ['front', 0, sensorLongNear, sensorLongFar],
      ['left', 90, sensorNear, sensorFar],
      ['right', -90, sensorNear, sensorFar],
      ['fleft', 30, sensorNear, sensorFar],
      ['fright', -30, sensorNear, sensorFar],
      ['rleft', 135, sensorLongNear, sensorFar],
      ['rright', -135, sensorLongNear, sensorFar]
    ].forEach((sensorData) => {
      this.sensors[sensorData[0]] = new CarSensor({
        name: sensorData[0],
        car: this,
        angle: sensorData[1],
        near: sensorData[2],
        far: sensorData[3]
      });
    });
    this.mesh.add(this.sensors.front.line);
    this.mesh.add(this.sensors.left.line);
    this.mesh.add(this.sensors.right.line);
    this.mesh.add(this.sensors.fleft.line);
    this.mesh.add(this.sensors.fright.line);
    this.mesh.add(this.sensors.rleft.line);
    this.mesh.add(this.sensors.rright.line);
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
    const detailedNode = this.detailedRoute[this.detailedRouteIdx];
    const {x, y} = this.position;
    const dist = utils.getPointsDistance(x, y, detailedNode.x, detailedNode.y);
    const radians = utils.angleToRadians(this.angle);
    let velocity = this.leftVelocity ? this.leftVelocity : this.velocity;
    const isFasterThanTarget = dist < velocity;

    if(isFasterThanTarget) {
      velocity = dist;
      this.leftVelocity = velocity - dist;
      this.setPosition(detailedNode.x, detailedNode.y);
      this.update();
      return;
    }

    const newX = utils.roundNumber(x + Math.cos(radians) * velocity, 1);
    const newY = utils.roundNumber(y - Math.sin(radians) * velocity, 1);
    this.setPosition(newX, newY);

    if(this.leftVelocity) {
      this.leftVelocity = 0;
    }
  }

  setRoute(routePath, callbacks) {
    this.route = routePath;
    this.routeIdx = 0;
    this.currentRoadPath = this.route[this.routeIdx].roadPath;

    this.updateDetailedRoute();

    this.callbacks.onArrival = callbacks.onArrival;
    this.callbacks.onBrake = callbacks.onBrake;
  }

  accelerate(expectVelocity) {
    const nodeMaxSpeed = this.detailedRoute[this.detailedRouteIdx].maxSpeed;
    let nextVelocity = this.velocity + this.accelerationPower;

    if(nodeMaxSpeed && this.velocity > nodeMaxSpeed) {
      this.brake(nodeMaxSpeed);
      return;
    }

    if(nodeMaxSpeed && nextVelocity > nodeMaxSpeed) {
      nextVelocity = nodeMaxSpeed;
    }

    if(expectVelocity && nextVelocity > expectVelocity) {
      nextVelocity = expectVelocity;
    }

    if(nextVelocity > this.maxVelocity) {
      nextVelocity = this.maxVelocity;
    }

    this.velocity = nextVelocity;
  }

  adjustVelocity(expectedVelocity) {
    if(expectedVelocity < this.velocity) {
      this.brake(expectedVelocity);
      return;
    }

    this.accelerate(expectedVelocity);
  }

  brake(expectVelocity) {
    const nextVelocity = this.velocity - this.brakePower;

    if(expectVelocity && nextVelocity < expectVelocity) {
      this.velocity = expectVelocity;
      return;
    }

    if(nextVelocity < 0) {
      this.velocity = 0;
      return;
    }

    this.velocity = nextVelocity;
  }

  onArriveDetailedRoute() {
    const detailedRouteNode = this.detailedRoute[this.detailedRouteIdx];
    const nextDetailedRouteNode = this.detailedRoute[this.detailedRouteIdx + 1];

    if(!nextDetailedRouteNode) {
      this.changingLane = false;
      this.onArriveRoute();
      return;
    }

    this.detailedRouteIdx++;
    this.changingLane = nextDetailedRouteNode.laneChange || nextDetailedRouteNode.beforeLaneChange;

    const isWayChanging = nextDetailedRouteNode.nextPoints[0] && nextDetailedRouteNode.roadPath.way !== nextDetailedRouteNode.nextPoints[0].roadPath.way;
    this.changingWay = isWayChanging ? nextDetailedRouteNode.nextPoints[0].roadPath.way : null;

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
    Object.keys(this.sensors).forEach((sensorPos) => this.sensors[sensorPos].reset());
  }

  checkCollision(collidableList) {
    if(this.broken || this.routeIdx === null) {
      return;
    }

    this.resetSensors();

    // Hit check
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

    // Sensors check
    let detailRouteNode = this.detailedRoute[this.detailedRouteIdx];
    const validWays = [this.currentRoadPath.way];
    if(this.changingWay) {
      validWays.push(this.changingWay);
    }

    const sameWayCollidableList = collidableList.filter((obj) => !(obj instanceof Car) || (obj instanceof Car && validWays.indexOf(obj.currentRoadPath.way) !== -1));
    this.sensors.front.update(sameWayCollidableList);

    const frontDiagCollidableList = sameWayCollidableList;
    // if(!this.changingLane) {
    //   frontDiagCollidableList = collidableList.filter((obj) => !(obj instanceof Car) || (obj instanceof Car && obj.currentRoadPath === this.currentRoadPath));
    // }
    this.sensors.fleft.update(frontDiagCollidableList);
    this.sensors.fright.update(frontDiagCollidableList);


    if(detailRouteNode.beforeLaneChange) {
      detailRouteNode = this.detailedRoute[this.detailedRouteIdx + 1];
    }

    if(detailRouteNode.laneChange) {
      const sideSensorCollidableList = collidableList
        .filter((obj) => obj instanceof Car && obj.currentRoadPath === detailRouteNode.roadPath);
      this.sensors[detailRouteNode.direction].update(sideSensorCollidableList);
      this.sensors[`r${detailRouteNode.direction}`].update(sideSensorCollidableList);
    }
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
  }

  isInFrontOfMe(anotherCar) {
    // const refPoint = this.currentRoadPath.way.nodes[0];

    const dist1 = utils.getPointsDistance(this.position.x, this.position.y, this.currentRoadPath.initPoint.x, this.currentRoadPath.initPoint.y);
    const dist2 = utils.getPointsDistance(anotherCar.position.x, anotherCar.position.y, anotherCar.currentRoadPath.initPoint.x, anotherCar.currentRoadPath.initPoint.y);

    return dist2 > dist1;
  }

  hasFrontDiagSensorActivate() {
    const frontDiagSensors = [this.sensors.fleft, this.sensors.fright];

    for(let i = 0; i < frontDiagSensors.length; i++) {
      if(
        frontDiagSensors[i].distance !== null &&
        frontDiagSensors[i].collisionObj instanceof Car &&
        (
          frontDiagSensors[i].collisionObj.velocity !== 0 ||
          this.currentRoadPath === frontDiagSensors[i].collisionObj.currentRoadPath ||
          // frontDiagSensors[i].collisionObj.changingLane ||
          this.isInFrontOfMe(frontDiagSensors[i].collisionObj)
        )
        // frontDiagSensors[i].collisionObj.velocity >= this.velocity
      ) {
        return true;
      }
    }

    return false;
  }

  hasSideOrRearSensorActivate() {
    const sensors = [
      this.sensors.left,
      this.sensors.right,
      this.sensors.rleft,
      this.sensors.rright
    ];
    let sensorMinDist = null;
    let sensorMin = null;

    sensors.forEach((sensor) => {
      if(sensor.distance === null) {
        return;
      }

      if(!sensorMinDist || sensor.distance < sensorMinDist) {
        sensorMin = sensor;
        sensorMinDist = sensorMin.distance;
      }
    });

    if(
      sensorMin &&
      sensorMin.collisionObj instanceof Car &&
      sensorMin.collisionObj.velocity !== 0
      // !sensorMin.collisionObj.changingLane
    ) {
      return true;
    }

    return false;
  }

  calculateCarReaction() {
    const endDistance = this.getLeftDistanceToEnd();
    const distanceToStop = this.getStoppingDistance(this.velocity);
    const detailedRouteNode = this.detailedRoute[this.detailedRouteIdx];

    this.setAngleTo(detailedRouteNode.x, detailedRouteNode.y);

    if(this.sensors.front.distance !== null) {
      if(!this.sensors.front.isCollidingTrafficLight()) {
        const dist = utils.getPointsDistance(this.position.x, this.position.y, this.sensors.front.collisionObj.position.x, this.sensors.front.collisionObj.position.y);
        this.adjustVelocity(this.sensors.front.collisionObj.velocity + (dist - safeCarDistance));
      } else {
        this.brake();
      }
      return;
    }

    if(this.hasFrontDiagSensorActivate()) {
      this.brake();
      return;
    }


    if(this.hasSideOrRearSensorActivate()) {
      this.brake();
      return;
    }

    if(endDistance <= distanceToStop) {
      this.brake();
      return;
    }

    this.accelerate();
  }

  getChangeLaneRoute(direction) {
    const targetRoadPath = this.route[this.routeIdx].roadPath;
    const mod = direction === 'right' ? -1 : 1;
    const roadPathAngle = this.currentRoadPath.getAngle();
    let newAngle = roadPathAngle + (45 * mod);
    if(newAngle > 180) {
      newAngle = -360 + newAngle;
    }

    if(newAngle < -180) {
      newAngle = 360 + newAngle;
    }

    const {x, y} = this.position;
    const crossRoadPathsLen = Math.abs(this.currentRoadPath.order - targetRoadPath.order);
    const changingLaneNodes = [];
    let tempRoadPath;
    let tempRoadPathDeepestNode;
    let intersection;

    changingLaneNodes.push(new RoadPathNode({
      x: x + (Math.cos(utils.angleToRadians(roadPathAngle)) * (CarModel.carSize * 2)),
      y: y + (Math.sin(utils.angleToRadians(roadPathAngle * -1)) * (CarModel.carSize * 2)),
      roadPath: this.currentRoadPath,
      beforeLaneChange: true
    }));

    const diagonalPos = {
      x: changingLaneNodes[0].x + Math.cos(utils.angleToRadians(newAngle)) * 10,
      y: changingLaneNodes[0].y + Math.sin(utils.angleToRadians(newAngle * -1)) * 10
    };

    for(let i = 1; i <= crossRoadPathsLen; i++) {
      tempRoadPath = this.currentRoadPath.way.lanes[this.currentRoadPath.order + (mod * i * -1)];
      tempRoadPathDeepestNode = tempRoadPath.getDeepestPoint();
      intersection = utils.getLinesIntersection(
        changingLaneNodes[0].x,
        changingLaneNodes[0].y,
        diagonalPos.x,
        diagonalPos.y,
        tempRoadPath.initPoint.x,
        tempRoadPath.initPoint.y,
        tempRoadPathDeepestNode.x,
        tempRoadPathDeepestNode.y
      );

      changingLaneNodes.push(new RoadPathNode({
        x: intersection.x,
        y: intersection.y,
        roadPath: tempRoadPath,
        direction,
        laneChange: true,
        maxSpeed: safeVelocity
      }));
    }

    const lastChangeNode = changingLaneNodes[changingLaneNodes.length - 1];
    const nextRoadPathNode = targetRoadPath.getNextNodeFrom(lastChangeNode.x, lastChangeNode.y);

    return [
      ...changingLaneNodes,
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

    this.calculateCarReaction();
    this.calculateNextPosition();
  }
}

export {
  safeVelocity
};

export default Car;
