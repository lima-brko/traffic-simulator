import {
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  BoxBufferGeometry
} from 'three';

const windowSize = {
  width: 8,
  height: 13,
  margin: 1
};
const houseColors = [
  {
    wall: '#7ca1bf',
    window: '#648199'
  },
  {
    wall: '#cb7a4d',
    window: '#845032'
  }
];

class House {
  constructor(props) {
    this.color = houseColors[Math.floor(Math.random() * houseColors.length)];

    this.mesh = new Mesh(
      new BoxBufferGeometry(props.width, props.depth, props.height),
      [
        new MeshBasicMaterial({map: this.createTexture(props.depth, props.height, 270)}),
        new MeshBasicMaterial({map: this.createTexture(props.depth, props.height, 90)}),
        new MeshBasicMaterial({map: this.createTexture(props.width, props.height, 0)}),
        new MeshBasicMaterial({map: this.createTexture(props.width, props.height, 0)}),
        new MeshBasicMaterial({color: 0x444444}),
        new MeshBasicMaterial({color: 0x444444})
      ]
    );

    this.mesh.position.x = props.x;
    this.mesh.position.y = props.height / 2;
    this.mesh.rotation.x = -Math.PI / 2;
  }

  createTexture(width, height, angle) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const radians = angle * Math.PI / 180;

    canvas.width = width * Math.abs(Math.cos(radians)) + height * Math.abs(Math.sin(radians));
    canvas.height = width * Math.abs(Math.sin(radians)) + height * Math.abs(Math.cos(radians));

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(radians);
    ctx.translate(-width / 2, -height / 2);

    ctx.fillStyle = this.color.wall;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = this.color.window;

    const windowOuter = {
      width: windowSize.width + (windowSize.margin * 2),
      height: windowSize.height + (windowSize.margin * 2)
    };
    const windowsX = Math.floor(width / windowOuter.width);
    const windowsY = Math.floor(height / windowOuter.height);

    if(windowsX >= 1 && windowsY >= 1) {
      const windowsTotal = windowsX * windowsY;
      const windowsTotalWidth = windowsX * windowOuter.width;
      const windowsTotalHeight = windowsY * windowOuter.height;
      const initOffsetX = (width - windowsTotalWidth) / 2;
      const initOffsetY = (height - windowsTotalHeight) / 2;

      for(let i = 0; i < windowsTotal; i++) {
        const x = (windowOuter.width * (i % windowsX)) + windowSize.margin + initOffsetX;
        const y = (windowOuter.height * Math.floor(i / windowsX)) + windowSize.margin + initOffsetY;
        ctx.fillRect(x, y, windowSize.width, windowSize.height);
      }
    }

    return new CanvasTexture(canvas);
  }
}

export default House;
