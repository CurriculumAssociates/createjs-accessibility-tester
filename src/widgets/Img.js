import AccessibilityModule from '@curriculumassociates/createjs-accessibility';

export default class Img extends createjs.Container {
  constructor(options, width, height) {
    super();
    AccessibilityModule.register({
      accessibleOptions: {
        alt: options.alt,
        height,
        longdesc: options.longdesc,
        src: options.src,
        width,
      },
      displayObject: this,
      role: AccessibilityModule.ROLES.IMG,
    });
    this._options = options;
    this._image = new createjs.Bitmap(this._options.src);
    this.scaleX = this._options.cjsScaleX;
    this.scaleY = this._options.cjsScaleY;
    this.regX = width / 4;
    this.regY = height / 4;
    this.rotation = 45;
    this.addChild(this._image);
  }
}
