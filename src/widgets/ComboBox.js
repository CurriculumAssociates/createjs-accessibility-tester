import _ from 'lodash';
import KeyCodes from 'keycodes-enum';
import AccessibilityModule from '@curriculumassociates/createjs-accessibility';
import SingleLineTextInput from './SingleLineTextInput';

export default class ComboBox extends createjs.Container {
  constructor(options, width, height, tabIndex) {
    super();
    _.bindAll(this, '_onCollapedViewBlur', '_onCollapedViewClick', '_onCollapedViewKeyDown', '_onOptionClick');
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
    this._textBox.accessible.controls = this._dropDownView;
    this._dropDownView.visible = false;
  }

  get text() {
    return this._textBox.text;
  }

  _createCollapsedView(width, height, tabIndex) {
    // since the arrow for opening the drop down is a square based on the height, calculate
    // the text box width
    const textBoxWidth = width - height;

    this._textBox = new SingleLineTextInput(textBoxWidth, height, tabIndex);
    this._textBox.enableKeyEvents = true;
    this._textBox.addEventListener('keydown', this._onCollapedViewKeyDown);
    this._textBox.addEventListener('blur', this._onCollapedViewBlur);
    this._textBox.accessible.enableKeyEvents = true;
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
      accessibleOptions: {
        tabIndex: -1,
      },
    });
    this._arrow.addEventListener('click', this._onCollapedViewClick);
    this._arrow.addEventListener('keyboardClick', this._onCollapedViewClick);
    this.addChild(this._arrow);
    this.accessible.addChild(this._arrow);
  }

  _onCollapedViewBlur(evt) {
    if (this._dropDownView.visible) {
      this._onCollapedViewClick(evt);
    }
  }

  _onCollapedViewClick(evt) {
    this._textBox.accessible.requestFocus();
    this._dropDownView.visible = !this._dropDownView.visible;
    this.accessible.expanded = this._dropDownView.visible;
    if (this._dropDownView.visible) {
      // make sure the listbox is on top of its sibling DisplayObjects to try
      // to ensure that the dropdown is completely visible
      this.parent.addChild(this);

      // move focus from the expand button to the drop down list element
      this._dropDownView.accessible.requestFocus();
    } else {
      this._textBox.accessible.active = undefined;
    }

    evt.stopPropagation();
    evt.preventDefault();
  }

  _onCollapedViewKeyDown(evt) {
    if (evt.keyCode === KeyCodes.down) {
      this._dropDownView.visible = true;
      this.accessible.expanded = true;

      // make sure the listbox is on top of its sibling DisplayObjects to try
      // to ensure that the dropdown is completely visible
      this.parent.addChild(this);

      // todo: select first option

      evt.stopPropagation();
      evt.preventDefault();
    }
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

  _onOptionClick(evt) {
    // set the text field to the value of the option
    this._textBox.text = evt.currentTarget._label.text;

    // close the dropdown
    this._onCollapedViewClick(evt);
  }
}
