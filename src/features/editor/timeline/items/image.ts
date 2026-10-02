import { Pattern, Resizable, util, type ResizableProps } from '@designcombo/timeline';

class Image extends Resizable {
  static type = 'Image';
  declare src: string;
  hasSrc = true;

  constructor(props: ResizableProps<{ src: string }>) {
    super(props);
    this.id = props.id;
    this.src = props.src;
    this.display = props.display;
    this.tScale = props.tScale;
    this.loadImage();
  }

  _render(ctx: CanvasRenderingContext2D) {
    super._render(ctx);
    this.updateSelected(ctx);
  }

  async loadImage() {
    try {
      const img = await util.loadImage(this.src);
      const scale = this.height / img.height;
      this.set('fill', new Pattern({ source: img, repeat: 'repeat-x', patternTransform: [scale, 0, 0, scale, 0, 0] }));
      this.canvas?.requestRenderAll();
    } catch {
      return;
    }
  }

  setSrc(src: string) {
    this.src = src;
    this.loadImage();
  }
}

export default Image;
