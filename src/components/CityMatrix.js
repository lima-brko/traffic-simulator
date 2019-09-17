class CityMatrix {
  constructor(size) {
    this.size = size;
    this.matrix = [];

    for(let i = 0; i < this.size; i++) {
      this.matrix[i] = [];
      for(let j = 0; j < this.size; j++) {
        this.matrix[i][j] = {
          x: i,
          y: j,
          content: []
        };
      }
    }
  }

  getTiles() {
    const tiles = [];

    for(let i = 0; i < this.matrix.length; i++) {
      for(let j = 0; j < this.matrix[i].length; j++) {
        tiles.push(this.matrix[i][j]);
      }
    }

    return tiles;
  }

  // addStreet(street) {
  //   street.nodes.forEach((node) => {

  //   });
  // }
}

export default CityMatrix;
