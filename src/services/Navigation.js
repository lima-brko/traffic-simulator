import utils from '../helpers/utils';

class Navigation {
  constructor() {
    this.routes = [];
  }

  static findLowestCostNode(costs, processed) {
    const knownNodes = Object.keys(costs);

    const lowestCostNode = knownNodes.reduce((acc, node) => {
      let lowest = acc;
      if(lowest === null && !processed.includes(node)) {
        lowest = node;
      }
      if(costs[node] < costs[lowest] && !processed.includes(node)) {
        lowest = node;
      }
      return lowest;
    }, null);

    return lowestCostNode;
  }

  static dijkstra(graph) {
    // track lowest cost to reach each node
    const trackedCosts = Object.assign({finish: Infinity}, graph.start);

    // track paths
    const trackedParents = {finish: null};
    Object.keys(graph.start).forEach((key) => {
      trackedParents[key] = 'start';
    });

    // track nodes that have already been processed
    const processedNodes = [];

    // Set initial node. Pick lowest cost node.
    let node = Navigation.findLowestCostNode(trackedCosts, processedNodes);

    while(node) {
      const costToReachNode = trackedCosts[node];
      const childrenOfNode = graph[node];

      Object.keys(childrenOfNode).forEach((child) => {
        const costFromNodetoChild = childrenOfNode[child];
        const costToChild = costToReachNode + costFromNodetoChild;

        if(!trackedCosts[child] || trackedCosts[child] > costToChild) {
          trackedCosts[child] = costToChild;
          trackedParents[child] = node;
        }
      });

      processedNodes.push(node);

      node = Navigation.findLowestCostNode(trackedCosts, processedNodes);
    }

    const optimalPath = ['finish'];
    let parent = trackedParents.finish;
    while(parent) {
      optimalPath.push(parent);
      parent = trackedParents[parent];
    }
    optimalPath.reverse();

    const results = {
      distance: trackedCosts.finish,
      path: optimalPath
    };

    return results;
  }

  static createDijkstraGraph(startPoint, endPoint) {
    const startRoadWayNode = startPoint.roadPath.way.nodes[0];
    const endRoadWayNode = endPoint.roadPath.way.nodes[endPoint.roadPath.way.nodes.length - 1];
    const ref = {};

    function move(node, graph, name) {
      let key = node.name;

      if(name) {
        key = name;
      }

      if(node === endRoadWayNode) {
        key = 'finish';
      }

      if(ref[key]) {
        return false;
      }

      ref[key] = node;
      graph[key] = {};

      node.nextNodes.forEach((nextNode) => {
        graph[key][nextNode !== endRoadWayNode ? nextNode.name : 'finish'] = utils.getDistance(node.x, node.y, nextNode.x, nextNode.y);

        move(nextNode, graph);
      });

      return graph;
    }

    const graph = move(startRoadWayNode, {}, 'start');
    return {
      graph,
      ref
    };
  }

  getCachedRoute(startPoint, endPoint) {
    return this.routes.find((route) => route.startPoint === startPoint && route.endPoint === endPoint);
  }

  findBestRoute(startPoint, endPoint) {
    const cachedRoute = this.getCachedRoute(startPoint, endPoint);
    if(cachedRoute) {
      return cachedRoute.route;
    }

    const graphData = Navigation.createDijkstraGraph(startPoint, endPoint);
    const routeData = Navigation.dijkstra(graphData.graph);
    const routePathWayNodes = routeData.path.map((nodeName) => graphData.ref[nodeName]);

    const routePathNodes = routePathWayNodes.map((wayNode, i) => {
      if(i === 0) {
        return startPoint;
      }

      if(i === routePathWayNodes.length - 1) {
        return endPoint;
      }

      const nextWayNode = routePathWayNodes[i + 1];
      const hasWayChange = wayNode.way !== nextWayNode.way;

      if(hasWayChange) {
        return wayNode.roadPathNode;
      }

      return null;
    })
      .filter((node) => node !== null);

    this.routes.push({
      startPoint,
      endPoint,
      route: routePathNodes
    });

    return routePathNodes;
  }
}

export default new Navigation();
