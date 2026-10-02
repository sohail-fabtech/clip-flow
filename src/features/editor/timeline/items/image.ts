import { Resizable, Pattern, util, Control } from '@designcombo/timeline';

class Image extends Resizable {
  static type = 'Image';
  src;
  hasSrc = true;

  constructor(props) {
    super(props);
    this.id = props.id;
    this.src = props.src;
    this.display = props.display;
    this.tScale = props.tScale;
    this.loadImage();
  }

  _render(ctx) {
    super._render(ctx);
    this.updateSelected(ctx);
  }

  loadImage() {
    util.loadImage(this.src).then(img => {
      const imgHeight = img.height;
      const rectHeight = this.height;
      const scaleY = rectHeight / imgHeight;
      const pattern = new Pattern({
        source: img,
        repeat: 'repeat-x',
        patternTransform: [scaleY, 0, 0, scaleY, 0, 0],
      });
      this.set('fill', pattern);
      this.canvas?.requestRenderAll();
    });
  }

  setSrc(src) {
    this.src = src;
    this.loadImage();
    this.canvas?.requestRenderAll();
  }
}

export default Image;
