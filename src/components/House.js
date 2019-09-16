import {
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  BoxBufferGeometry
} from 'three';

const windowSize = {
  width: 8,
  height: 18,
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
        new MeshBasicMaterial({color: 0xcccccc, map: this.createTexture(props.depth, props.height, -90)}),
        new MeshBasicMaterial({color: 0xcccccc, map: this.createTexture(props.depth, props.height)}),
        new MeshBasicMaterial({color: 0xcccccc, map: this.createTexture(props.depth, props.height)}),
        new MeshBasicMaterial({color: 0xcccccc, map: this.createTexture(props.depth, props.height)}),
        new MeshBasicMaterial({color: 0x444444}),
        new MeshBasicMaterial({color: 0x444444})
      ]
    );

    this.mesh.position.x = props.x;
    this.mesh.position.y = props.height / 2;
    this.mesh.rotation.x = -Math.PI / 2;
  }

  createTexture(width, height, rotation) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // ctx.translate(width / 2, height / 2);
    // ctx.rotate(90 * Math.PI / 180);
    // ctx.translate(-width / 2, -height / 2);

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
      for(let i = 0; i < windowsTotal; i++) {
        ctx.fillRect(windowOuter.width * (i % windowsX), windowOuter.height * Math.floor(i / windowsX), 8, 18);
      }
    }

    const texture = new CanvasTexture(canvas);
    // if(rotation) {
    //   texture.mapping =
    // }
    return texture;
  }
}

export default House;
