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
import CityMatrix from './CityMatrix';
import contants from '../helpers/contants';

const defaultOptions = {
  width: 1000,
  height: 1000
};

class City {
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
    this.matrix = new CityMatrix(Math.floor(this.width / this.tileSize));
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
    this.cars = [
      new Car()
    ];

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
          nodes.push(axis === 'Col' ? [i, j] : [j, i]);
        }

        const street = new Street({
          name: `${axis}-${counter}`,
          nodes
        });

        street.drawOnCanvas(ctx);
        this.streets.push(street);
      }
    });
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

    this.cars.forEach((car) => {
      this.scene.add(car.mesh);
    });
  }

  update() {
    this.cars.forEach((car) => {
      car.update();
    });
  }
}

export default City;
