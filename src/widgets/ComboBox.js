import _ from 'lodash';
// import KeyCodes from 'keycodes-enum';
import AccessibilityModule from '@curriculumassociates/createjs-accessibility';
import SingleLineTextInput from './SingleLineTextInput';

export default class ComboBox extends createjs.Container {
  constructor(options, width, height, tabIndex) {
    super();
    _.bindAll(this, '_onCollapedViewClick', '_onDropDownKeyDown', '_onValueChanged', '_onOptionClick');
    AccessibilityModule.register({
      displayObject: this,
      role: AccessibilityModule.ROLES.COMBOBOX,
      accessibleOptions: {
        expanded: false,
      },
    });

    this._options = options;

    this._createCollapsedView(width, height, tabIndex);
    this._createDropDownView(width, height);
    this._dropDownView.visible = false;
  }

  _createCollapsedView(width, height, tabIndex) {
    // since the arrow for opening the drop down is a square based on the height, calculate
    // the text box width
    const textBoxWidth = width - height;

    this._textBox = new SingleLineTextInput(textBoxWidth, height, tabIndex);
    this.addChild(this._textBox);
    this.accessible.addChild(this._textBox);

    this._arrow = new createjs.Shape();
    this._arrow.graphics.beginFill('#aaaaaa').drawRect(0, 0, height, height); // background
    this._arrow.graphics.endFill().beginStroke('#000000')
      .moveTo(height * 0.25, height * 0.25)
      .lineTo(height * 0.5, height * 0.75)
      .lineTo(height * 0.75, height * 0.25); // arrow
    this._arrow.graphics.beginStroke('#000000').setStrokeStyle(1).drawRect(0, 0, height, height); // border
    this._arrow.x = width - height;
    AccessibilityModule.register({
      displayObject: this._arrow,
      role: AccessibilityModule.ROLES.BUTTON,
    });
    this._arrow.addEventListener('click', this._onCollapedViewClick);
    this._arrow.addEventListener('keyboardClick', this._onCollapedViewClick);
    this.addChild(this._arrow);
    this.accessible.addChild(this._arrow);
  }

  _onCollapedViewClick(evt) {
    this._dropDownView.visible = !this._dropDownView.visible;
    this.accessible.expanded = this._dropDownView.visible;
    if (this._dropDownView.visible) {
      // make sure the listbox is on top of its sibling DisplayObjects to try
      // to ensure that the dropdown is completely visible
      this.parent.addChild(this);

      // move focus from the expand button to the drop down list element
      this._dropDownView.accessible.requestFocus();
    }

    evt.stopPropagation();
    evt.preventDefault();
  }

  _createDropDownView(width, optionHeight) {
    this._dropDownView = new createjs.Container();
    this._dropDownView.y = optionHeight;
    this._dropDownView.visible = false;
    this.addChild(this._dropDownView);

    AccessibilityModule.register({
      displayObject: this._dropDownView,
      role: AccessibilityModule.ROLES.SINGLESELECTLISTBOX,
      parent: this,
    });
    this._dropDownView.accessible.tabIndex = -1;
    this._dropDownView.addEventListener('blur', (evt) => {
      if (this._dropDownView.visible) {
        this._onCollapedViewClick(evt);
      }
    });
    this._dropDownView.accessible.enableKeyEvents = true;
    this._dropDownView.addEventListener('keydown', this._onDropDownKeyDown);
    this._dropDownView.addEventListener('valueChanged', this._onValueChanged);

    const bg = new createjs.Shape();
    bg.graphics.beginStroke('#000000').setStrokeStyle(1).beginFill('#ffffff').drawRect(0, 0, width, optionHeight * this._options.length);
    this._dropDownView.addChild(bg);

    this._options.forEach((option, i) => {
      option.y = optionHeight * i;
      option.addEventListener('click', this._onOptionClick);
      this._dropDownView.addChild(option);
      this._dropDownView.accessible.addChild(option);
    });
  }

  _onDropDownKeyDown() {
    // todo
  }

  _onValueChanged() {
    // todo
  }

  _onOptionClick() {
    // todo
  }
}
