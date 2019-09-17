class Navigation {
  constructor(props) {
    this.matrix = props.matrix;
    this.routes = [];
  }


  // This function will check a location's status
  // (a location is "valid" if it is on the grid, is not an "obstacle",
  // and has not yet been visited by our algorithm)
  // Returns "Valid", "Invalid", "Blocked", or "Goal"
  locationStatus(location) {
    const gridSize = this.matrix.matrix.length;
    const dft = location.distanceFromTop;
    const dfl = location.distanceFromLeft;

    if(location.distanceFromLeft < 0 ||
        location.distanceFromLeft >= gridSize ||
        location.distanceFromTop < 0 ||
        location.distanceFromTop >= gridSize) {
      // location is not on the grid--return false
      return 'Invalid';
    } else if(this.matrix.matrix[dft][dfl] === 'Goal') {
      return 'Goal';
    } else if(this.matrix.matrix[dft][dfl] !== 'Empty') {
      // location is either an obstacle or has been visited
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

    const newLocation = {
      y,
      x,
      path: newPath,
      status: 'Unknown'
    };
    newLocation.status = this.locationStatus(newLocation);

    if(newLocation.status === 'Valid') {
      this.matrix.matrix[newLocation.distanceFromTop][newLocation.distanceFromLeft] = 'Visited';
    }

    return newLocation;
  }

  findBestRoute(fromNode, toNode) {
    this.activeRoute = this.matrix.clone();

    const startLocation = {
      x: fromNode[0],
      y: fromNode[1],
      path: [],
      status: 'Start'
    };

    const queue = [startLocation];

    while(queue.length > 0) {
      const currentLocation = queue.shift();

      const NLocation = this.exploreInDirection(currentLocation, 'North');
      if(NLocation.status === 'Goal') {
        return NLocation.path;
      } else if(NLocation.status === 'Valid') {
        queue.push(NLocation);
      }

      // Explore East
      const ELocation = this.exploreInDirection(currentLocation, 'East');
      if(ELocation.status === 'Goal') {
        return ELocation.path;
      } else if(ELocation.status === 'Valid') {
        queue.push(ELocation);
      }

      // Explore South
      const SLocation = this.exploreInDirection(currentLocation, 'South');
      if(SLocation.status === 'Goal') {
        return SLocation.path;
      } else if(SLocation.status === 'Valid') {
        queue.push(SLocation);
      }

      // Explore West
      const WLocation = this.exploreInDirection(currentLocation, 'West');
      if(WLocation.status === 'Goal') {
        return WLocation.path;
      } else if(WLocation.status === 'Valid') {
        queue.push(WLocation);
      }
    }

    return null;
  }
}

export default Navigation;
