import contants from '../helpers/constants';

class Street {
  constructor(props) {
    this.name = props.name;
    this.tiles = props.tiles;
    this.tileSize = contants.tileSize;
  }

  drawOnCanvas(ctx) {
    this.tiles.forEach((tile, i) => {
      const x = this.tileSize * tile.x;
      const y = this.tileSize * tile.y;

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
