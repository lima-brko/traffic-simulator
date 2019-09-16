import {
  Color,
  Mesh,
  BoxBufferGeometry,
  MeshBasicMaterial,
  Scene
} from 'three';
import House from './House';
import Car from './Car';
import Street from './Street';

class City {
  constructor() {
    this.scene = new Scene();
    this.scene.background = new Color(0xfae0cb);
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
    this.streets = [
      new Street({x: 0, y: 0.01}),
      new Street({x: 40, y: 0.01}),
      new Street({x: 80, y: 0.01}),
      new Street({x: 120, y: 0.01})
    ];

    this.initilize();
  }

  initilize() {
    const plane = new Mesh(
      new BoxBufferGeometry(1000, 20, 1000),
      new MeshBasicMaterial({color: 0xcac4ae})
    );
    plane.position.set(0, -10, 0);

    this.scene.add(plane);

    this.houses.forEach((house) => {
      this.scene.add(house.mesh);
    });

    this.cars.forEach((car) => {
      this.scene.add(car.mesh);
    });

    this.streets.forEach((street) => {
      this.scene.add(street.mesh);
    });
  }

  update() {
    this.cars.forEach((car) => {
      car.update();
    });
  }
}

export default City;
