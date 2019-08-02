import _ from 'lodash';
import KeyCodes from 'keycodes-enum';
import AccessibilityModule from '@curriculumassociates/createjs-accessibility';

export default class ComboBox extends createjs.Container {
  constructor(options, width, height, tabIndex) {
    super();
    _.bindAll(this, '_onFocus', '_onBlur');
    AccessibilityModule.register({
      displayObject: this,
      role: AccessibilityModule.ROLES.COMBOBOX,
    });

    this._options = options;

    // todo
  }

  _onFocus() {
    this._focusIndicator.visible = true;
  }

  _onBlur() {
    this._focusIndicator.visible = false;
  }
}
