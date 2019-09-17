import {
  DoubleSide,
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh
} from 'three';
import contants from '../helpers/contants';

class Street {
  constructor(props) {
    this.name = props.name;
    this.nodes = props.nodes;
    this.tileSize = contants.tileSize;

    // const plane = new Mesh(
    //   new PlaneGeometry(20, 1000),
    //   new MeshBasicMaterial({color: 0x989899, side: DoubleSide})
    // );
    // plane.position.set(props.x, props.y, 0);
    // plane.rotation.x = -Math.PI / 2;

    // this.mesh = plane;
  }

  drawOnCanvas(ctx) {
    this.nodes.forEach((node, i) => {
      const x = this.tileSize * node[0];
      const y = this.tileSize * node[1];

      ctx.fillStyle = '#989899';
      ctx.fillRect(x, y, this.tileSize, this.tileSize);

      if(i === 0) {
        ctx.textAlign = 'center';
        ctx.font = '11px Verdana';
        ctx.fillStyle = '#fff';
        ctx.fillText(this.name, x + this.tileSize / 2, y + this.tileSize / 2);
      }
    });
  }
}

export default Street;
