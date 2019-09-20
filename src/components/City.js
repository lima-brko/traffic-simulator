import {
  CanvasTexture,
  CylinderBufferGeometry,
  Color,
  Mesh,
  Group,
  BoxBufferGeometry,
  MeshBasicMaterial,
  Scene
} from 'three';
import House from './House';
import Car from './Car';
import Street from './Street';
import WorldMatrix from '../services/WorldMatrix';
import contants from '../helpers/contants';

const defaultOptions = {
  width: 1000,
  height: 1000
};

class DarwinCity {
  constructor() {
    const {
      width,
      height
    } = defaultOptions;

    this.scene = new Scene();
    this.scene.background = new Color(0xfae0cb);

    this.tileSize = contants.tileSize;
    this.width = width;
    this.height = height;
    this.matrix = WorldMatrix;
    this.groundCanvas = document.createElement('canvas');
    this.groundCanvas.width = this.width;
    this.groundCanvas.height = this.height;

    this.streets = [];
    this.houses = [
      new House({
        width: 30,
        height: 101,
        depth: 20,
        x: 150
      })
    ];
    this.cars = [];

    this.initilize();
  }

  drawTilesGrid() {
    const ctx = this.groundCanvas.getContext('2d');
    ctx.fillStyle = '#cac4ae';
    ctx.fillRect(0, 0, this.width, this.height);

    this.matrix.getTiles().forEach((tile) => {
      ctx.strokeStyle = '#aea998';
      ctx.strokeRect(this.tileSize * tile.x, this.tileSize * tile.y, this.tileSize, this.tileSize);
    });
  }

  populateStreets() {
    const ctx = this.groundCanvas.getContext('2d');
    const axes = ['Row', 'Col'];

    axes.forEach((axis) => {
      let counter = 0;

      for(let i = 2; i < this.matrix.size; i += 4) {
        counter++;
        const nodes = [];

        for(let j = 0; j < this.matrix.size; j++) {
          const node = axis === 'Col' ? [i, j] : [j, i];
          nodes.push(node);
        }

        const street = new Street({
          name: `${axis}-${counter}`,
          nodes
        });

        nodes.forEach((node) => {
          this.matrix.setTileContent(node[0], node[1], street);
        });

        street.drawOnCanvas(ctx);
        this.streets.push(street);
      }
    });
  }

  createCarRouteTrace(car) {
    const routeTrace = new Group();
    const material = new MeshBasicMaterial({color: 0xffff00, opacity: 0.5, transparent: true});

    const routePoints = car.route.map((tile) => ({
      x: (tile.x * this.tileSize) + (this.tileSize / 2),
      y: (tile.y * this.tileSize) + (this.tileSize / 2)
    }));

    routePoints.forEach((point, idx) => {
      // const isFirst = idx === 0;
      // const isLast = idx === car.route.length - 1;

      // if(!isFirst) {
      // const prevPoint = car.route[idx - 1];

      const entryGeometry = new CylinderBufferGeometry(1, 1, this.tileSize, 10);
      const entryMesh = new Mesh(entryGeometry, material);
      entryMesh.position.set(point.x, point.y, 5);

      // entryMesh.rotation.x = -Math.PI / 2;
      routeTrace.add(entryMesh);
      // }

      // if(!isLast) {
      //   const exitGeometry = new CylinderBufferGeometry(1, 1, this.tileSize, 10);
      //   const exitMesh = new Mesh(exitGeometry, material);
      //   exitMesh.position.set(x, y + 50, 5);
      //   exitMesh.rotation.z = 0 * Math.PI / 180;
      //   routeTrace.add(exitMesh);
      // }
    });

    routeTrace.rotation.x = 90 * Math.PI / 180;
    routeTrace.position.set(-100, 0, 10);
    this.scene.add(routeTrace);
  }

  populateCars() {
    const carTotal = 1;

    for(let i = 0; i < carTotal; i++) {
      const car = new Car();
      car.setRoute(this.matrix.getTile(2, 0), this.matrix.getTile(6, this.matrix.size - 1));
      this.createCarRouteTrace(car);

      this.scene.add(car.mesh);
      this.cars.push(car);
    }
  }

  populateBuildings() {
    this.houses.forEach((house) => {
      this.scene.add(house.mesh);
    });
  }

  createGround() {
    const ground = new Mesh(
      new BoxBufferGeometry(this.width, 20, this.height),
      [
        new MeshBasicMaterial({color: 0xcac4ae}),
        new MeshBasicMaterial({color: 0xcac4ae}),
        new MeshBasicMaterial({map: new CanvasTexture(this.groundCanvas)}),
        new MeshBasicMaterial({color: 0xcac4ae}),
        new MeshBasicMaterial({color: 0xcac4ae}),
        new MeshBasicMaterial({color: 0xcac4ae})
      ]
    );
    ground.position.set(0, -10, 0);
    this.scene.add(ground);
  }

  initilize() {
    this.drawTilesGrid();
    this.populateStreets();
    this.populateBuildings();
    this.populateCars();
    this.createGround();

    // Center Reference
    const referenceY = new Mesh(
      new BoxBufferGeometry(5, 125, 5),
      new MeshBasicMaterial({color: 0xff0000}),
    );
    referenceY.rotation.x = -Math.PI / 2;
    this.scene.add(referenceY);

    const referenceX = new Mesh(
      new BoxBufferGeometry(125, 5, 5),
      new MeshBasicMaterial({color: 0xff0000}),
    );
    referenceX.rotation.x = -Math.PI / 2;
    this.scene.add(referenceX);
  }

  update() {
    this.cars.forEach((car) => {
      car.update();
    });
  }
}

export default DarwinCity;
