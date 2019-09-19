import {
  CanvasTexture,
  Color,
  Mesh,
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
        x: 0
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

  populateCars() {
    const carTotal = 1;

    for(let i = 0; i < carTotal; i++) {
      const car = new Car();
      this.scene.add(car.mesh);
      car.setRoute(this.matrix.getTile(2, 0), this.matrix.getTile(6, this.matrix.size - 1));
      this.cars.push(car);
    }
  }

  initilize() {
    this.drawTilesGrid();
    this.populateStreets();
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

    this.houses.forEach((house) => {
      this.scene.add(house.mesh);
    });

    this.populateCars();
  }

  update() {
    this.cars.forEach((car) => {
      car.update();
    });
  }
}

export default DarwinCity;
