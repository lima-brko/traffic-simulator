import {
  Mesh,
  MeshBasicMaterial,
  Group,
  BoxBufferGeometry,
  PlaneBufferGeometry
} from 'three';
import utils from '../../helpers/utils';
import constants from '../../helpers/constants';

const metalMaterial = new MeshBasicMaterial({color: '#222', flatShading: true});
const lightMaterials = {
  deactivate: new MeshBasicMaterial({color: '#333', flatShading: true}),
  green: new MeshBasicMaterial({color: '#01a134', flatShading: true}),
  yellow: new MeshBasicMaterial({color: '#f8be40', flatShading: true}),
  red: new MeshBasicMaterial({color: '#b91c1d', flatShading: true})
};

class TrafficLight {
  constructor(props) {
    this.junction = props.junction;
    this.roadPaths = props.roadPaths;
    this.x = props.x;
    this.y = props.y;

    this.active = false;
    this.state = 'deactivate';
    this.lightsMesh = {};
    this.hitboxMesh = null;
    this.mesh = this.createMesh();

    this.mesh.position.set(this.x, 0, this.y);
    this.mesh.rotation.y = utils.angleToRadians((this.roadPaths[0].getAngle() * -1) - 90);
    this.availableRoadPaths = props.availableRoadPaths || [];
  }

  updateMeshs() {
    Object.keys(this.lightsMesh).forEach((lightMesh) => {
      this.lightsMesh[lightMesh].material = lightMaterials.deactivate;
    });

    if(this.state !== 'deactivate') {
      this.lightsMesh[this.state].material = lightMaterials[this.state];
    }
  }

  deactivate() {
    this.active = false;
    this.state = 'deactivate';
    this.updateMeshs();
  }

  activate(state) {
    this.active = true;
    this.state = state;
    this.updateMeshs();
  }

  createMesh() {
    const tfGroup = new Group();

    // Wall
    const halfTileSize = constants.tileSize / 2;
    const wall = new Mesh(
      new PlaneBufferGeometry(halfTileSize * this.roadPaths.length, halfTileSize),
      new MeshBasicMaterial({
        opacity: 0,
        transparent: true
      })
    );

    wall.position.x = -(halfTileSize * this.roadPaths.length) / 2;
    wall.position.y = halfTileSize / 2;
    wall.name = 'traffic_light_hitbox';
    this.hitboxMesh = wall;
    tfGroup.add(wall);

    // Support
    const support1 = new Mesh(
      new BoxBufferGeometry(16, 1, 1),
      metalMaterial
    );

    support1.position.x = -4.5;
    support1.position.y = 26;
    tfGroup.add(support1);

    const support2 = new Mesh(
      new BoxBufferGeometry(1, 26, 1),
      metalMaterial
    );

    support2.position.x = 3;
    support2.position.y = 13;
    tfGroup.add(support2);

    // Traffic Light Box
    const box = new Mesh(
      new BoxBufferGeometry(14, 4, 3),
      metalMaterial
    );
    box.position.x = -11;
    box.position.y = 26;
    tfGroup.add(box);

    // Lights
    ['red', 'yellow', 'green'].forEach((state, i) => {
      const light = new Mesh(
        new BoxBufferGeometry(2, 2, 2),
        lightMaterials[state]
      );

      light.position.y = 26;
      light.position.z = 1;
      light.position.x = -15 + (i * 4);
      this.lightsMesh[state] = light;
      tfGroup.add(light);
    });

    return tfGroup;
  }
}

export default TrafficLight;
