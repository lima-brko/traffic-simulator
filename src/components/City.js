import {
  CanvasTexture,
  Geometry,
  LineBasicMaterial,
  Line,
  Color,
  Mesh,
  BoxBufferGeometry,
  MeshBasicMaterial,
  Scene,
  Vector3
} from 'three';

import House from './House';
import Car from './Car';
import Street from './Street';
import WorldMatrix from '../services/WorldMatrix';
import contants from '../helpers/contants';

class DarwinCity {
  constructor() {
    this.scene = new Scene();
    this.scene.background = new Color(0xfae0cb);

    this.tileSize = contants.tileSize;
    this.width = contants.worldWidth;
    this.height = contants.worldHeight;
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
    const geometry = new Geometry();
    const material = new LineBasicMaterial({
      color: 0xffff00
    });

    car.route.forEach((point) => {
      geometry.vertices.push(new Vector3(point.sceneX, point.sceneY, 0));
    });

    const routeTrace = new Line(geometry, material);
    routeTrace.rotation.x = 90 * Math.PI / 180;
    // routeTrace.position.set(-(this.width / 2), 10, -(this.height / 2));
    this.scene.add(routeTrace);
  }

  populateCars() {
    const carTotal = 1;

    for(let i = 0; i < carTotal; i++) {
      const fromTile = this.matrix.getTile(2, 0);
      const toTile = this.matrix.getTile(6, this.matrix.size - 1);
      const car = new Car({
        position: fromTile,
        rotation: 180
      });
      car.setRoute(fromTile, toTile);
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
