import _ from 'lodash';
import AccessibilityModule from 'createjs-accessibility';
import createjs from 'createjs';

export default class Grid extends createjs.Container {
  constructor(data, tabIndex) {
    super();
    AccessibilityModule.register({
      displayObject: this,
      role: AccessibilityModule.ROLES.TABLEBODY,
    });
    this.tabIndex = tabIndex;
    this.data = data;
    this.rowCount = this.data.length + 1; // +1 due to header row
    this.colCount = this.data[0].length;
    this.cellWidths = _.map(this.data[0], 'cellWidth');
    this.cellHeight = this.data[0][0].cellHeight;
    this.totalWidth = _.sum(this.cellWidths);
    this.rows = [];
    this.setBounds(0, 0, this.totalWidth, this.cellHeight * this.rowcount);
    this.createTable();
  }

  createTable() {
    this.createRows();
    this.setupLayout();
  }

  createRows() {
    for (let i = 0; i < this.rowCount; i++) {
      const row = this._createContainer(this.totalWidth, this.cellHeight);
      this.addChild(row);
      AccessibilityModule.register({
        displayObject: row,
        parent: this,
        role: AccessibilityModule.ROLES.ROW,
      });
      _.forEach(this.data[i], (data, index) => {
        let cell;
        if (data.type === 'header') {
          cell = this._createCell({
            value: data.value, index, bold: true, fontSize: 20,
          });
          row.addChild(cell);
          AccessibilityModule.register({
            displayObject: cell,
            parent: row,
            role: AccessibilityModule.ROLES.COLUMNHEADER,
          });
        } else {
          cell = this._createCell({ value: data.value, index, align: 'center' });
          row.addChild(cell);
          AccessibilityModule.register({
            displayObject: cell,
            parent: row,
            role: AccessibilityModule.ROLES.GRIDCELL,
          });
        }
        cell.accessible.tabIndex = this.tabIndex++;
        cell.accessible.addChild(cell.cellContent);
      });

      this.rows.push(row);
    }
  }

  setupLayout() {
    _.forEach(this.rows, (row, i) => {
      row.set({
        y: this.cellHeight * i,
      });
      row.rowIndex = i;
      row.accessible.rowindex = i;

      _.forEach(row.children, (cell, j) => {
        cell.set({
          x: _.sum(_.slice(this.cellWidths, 0, j)),
        });
        cell.rowIndex = i;
        cell.colIndex = j;
        cell.accessible.rowindex = i;
        cell.accessible.colindex = j;
        cell.accessible.rowspan = 1;
        cell.accessible.colspan = 1;
      });
    });
  }

  _createCell({ value, index, align = 'center' }) {
    const cell = this._createContainer(this.cellWidths[index], this.cellHeight);
    const cellContent = value;
    cell.addChild(cellContent);
    const cellContentBounds = cellContent.getBounds();

    let left = 0;
    switch (align) {
      case 'left':
        left = 5;
        break;
      case 'right':
        left = (this.cellWidths[index] - cellContentBounds.width);
        break;
      default:
        left = (this.cellWidths[index] - cellContentBounds.width) / 2;
        break;
    }
    const cellHeightDiff = this.cellHeight - cellContentBounds.height;
    cellContent.set({
      x: left,
      y: (cellHeightDiff >= 0) ? (cellHeightDiff * 0.5) : 0,
    });

    cell.cellContent = cellContent;
    const shape = new createjs.Shape();
    shape.graphics.beginStroke('black').drawRect(0, 0, this.cellWidths[index], _.max([this.cellHeight, cell.getBounds().height]));
    cell.addChild(shape);

    const focusRect = new createjs.Shape();
    focusRect.graphics.beginFill('#5FC1FA').drawRect(0, 0, this.cellWidths[index], _.max([this.cellHeight, cell.getBounds().height]));
    cell.addChildAt(focusRect, 0);
    focusRect.visible = false;
    cell.focusRect = focusRect;

    cell.addEventListener('focus', this.onFocus.bind(cell));
    cell.addEventListener('blur', this.onBlur.bind(cell));
    return cell;
  }

  _createContainer(width, height) {
    const container = new createjs.Container();
    container.setBounds(0, 0, width, height);
    return container;
  }

  _createText({
    value, maxWidth, bold = false, fontSize = 18,
  }) {
    const boldOption = bold ? 'bold' : '';
    const text = new createjs.Text().set({
      text: value,
      font: `${boldOption} ${fontSize}px Arial`,
      maxWidth,
      lineWidth: maxWidth - 20,
    });
    return text;
  }

  onFocus() {
    this.focusRect.visible = true;
  }

  onBlur() {
    this.focusRect.visible = false;
  }
}
