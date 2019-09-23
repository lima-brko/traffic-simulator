import WorldMatrix from './WorldMatrix';

class Location {
  constructor(props) {
    this.x = props.x;
    this.y = props.y;
    this.path = props.path || [];
    this.status = 'Unknown';
  }
}

class Navigation {
  constructor() {
    this.matrix = WorldMatrix;
    this.fromLocation = null;
    this.toLocation = null;
    this.activeStreetMatrix = null;
  }

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
    let {y, x} = currentLocation;

    const newPath = currentLocation.path.slice();
    newPath.push(this.matrix.getTile(x, y));

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

    if(newLocation.status === 'Goal') {
      newLocation.path.push(this.matrix.getTile(x, y));
    }

    if(newLocation.status === 'Valid') {
      this.activeStreetMatrix[x][y].isVisited = true;
    }

    return newLocation;
  }

  findBestRoute(fromTile, toTile) {
    const directions = ['North', 'East', 'South', 'West'];
    const bestRoute = null;
    this.activeStreetMatrix = this.matrix.getStreetMatrix();

    this.fromLocation = new Location({x: fromTile.x, y: fromTile.y});
    this.toLocation = new Location({x: toTile.x, y: toTile.y});

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

export default new Navigation();
