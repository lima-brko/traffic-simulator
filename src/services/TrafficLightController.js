const trafficTimers = {
  cycle: 8000,
  warning: 2000
};

class TrafficLightController {
  constructor(trafficLights) {
    this.trafficLights = trafficLights;
    this.currentGroupIndex = 0;
    this.groups = {};

    this.trafficLights.forEach((trafficLight) => {
      const groupKey = trafficLight.roadPath.name.replace(/[0-9]/g, '');
      if(!this.groups[groupKey]) {
        this.groups[groupKey] = [];
      }

      this.groups[groupKey].push(trafficLight);
    });

    this.change();
  }

  warning() {
    const groupKeys = Object.keys(this.groups);
    this.groups[groupKeys[this.currentGroupIndex]].forEach((trafficLight) => trafficLight.activate('yellow'));
  }

  change() {
    const groupKeys = Object.keys(this.groups);
    this.currentGroupIndex = (this.currentGroupIndex + 1) % groupKeys.length;
    groupKeys.forEach((key) => {
      this.groups[key].forEach((trafficLight) => trafficLight.activate('red'));
    });

    this.groups[groupKeys[this.currentGroupIndex]].forEach((trafficLight) => trafficLight.activate('green'));

    setTimeout(this.warning.bind(this), trafficTimers.cycle - trafficTimers.warning);
    setTimeout(this.change.bind(this), trafficTimers.cycle);
  }
}

export default TrafficLightController;
