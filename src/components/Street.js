import contants from '../helpers/constants';

class Street {
  constructor(props) {
    this.name = props.name;
    this.sections = props.tiles.map((tile) => ({
      tile
    }));
    this.tileSize = contants.tileSize;
  }

  drawOnCanvas(ctx) {
    this.sections.forEach(({tile}, i) => {
      const x = this.tileSize * tile.x;
      const y = this.tileSize * tile.y;

      ctx.fillStyle = '#989899';
      ctx.fillRect(x * 2, y * 2, this.tileSize * 2, this.tileSize * 2);

      if(i === 0) {
        ctx.textAlign = 'center';
        ctx.font = '11px Verdana';
        ctx.fillStyle = '#fff';
        ctx.fillText(this.name, (x + (this.tileSize / 2)) * 2, (y + (this.tileSize / 2)) * 2);
      }
    });
  }
}

export default Street;
