class Location {
  constructor(props) {
    this.x = props.x;
    this.y = props.y;
    this.path = props.path || [];
    this.status = 'Unknown';
  }
}

class Navigation {
  constructor(matrix) {
    this.matrix = matrix;
    this.fromLocation = null;
    this.toLocation = null;
    this.activeStreetMatrix = null;
  }


  // This function will check a location's status
  // (a location is "valid" if it is on the grid, is not an "obstacle",
  // and has not yet been visited by our algorithm)
  // Returns "Valid", "Invalid", "Blocked", or "Goal"
  verifyLocationStatus(location) {
    const {x, y} = location;

    if(x < 0 ||
      x >= this.matrix.size ||
      y < 0 ||
      y >= this.matrix.size) {
      return 'Invalid';
    }

    const tile = this.activeStreetMatrix[x][y];

    if(x === this.toLocation.x && y === this.toLocation.y) {
      return 'Goal';
    }

    if(!tile.streets.length || tile.isVisited) {
      return 'Blocked';
    }

    return 'Valid';
  }

  exploreInDirection(currentLocation, direction) {
    const newPath = currentLocation.path.slice();
    newPath.push(direction);

    let {y, x} = currentLocation;

    if(direction === 'North') {
      y -= 1;
    } else if(direction === 'East') {
      x += 1;
    } else if(direction === 'South') {
      y += 1;
    } else if(direction === 'West') {
      x -= 1;
    }

    const newLocation = new Location({x, y, path: newPath});
    newLocation.status = this.verifyLocationStatus(newLocation);

    if(newLocation.status === 'Valid') {
      this.activeStreetMatrix[x][y].isVisited = true;
    }

    return newLocation;
  }

  findBestRoute(fromNode, toNode) {
    const directions = ['North', 'East', 'South', 'West'];
    const bestRoute = null;
    this.activeStreetMatrix = this.matrix.getStreetMatrix();

    this.fromLocation = new Location({x: fromNode[0], y: fromNode[1]});
    this.toLocation = new Location({x: toNode[0], y: toNode[1]});

    const queue = [this.fromLocation];
    this.activeStreetMatrix[this.fromLocation.x][this.fromLocation.y].isVisited = true;

    while(queue.length > 0 || bestRoute !== null) {
      const currentLocation = queue.shift();

      for(let i = 0; i < directions.length; i++) {
        const location = this.exploreInDirection(currentLocation, directions[i]);

        if(location.status === 'Goal') {
          return location.path;
        }

        if(location.status === 'Valid') {
          queue.push(location);
        }
      }
    }

    return null;
  }
}

export default Navigation;
