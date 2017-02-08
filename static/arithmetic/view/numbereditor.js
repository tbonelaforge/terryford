var NumberEditor = function(options) {
  this.buffer = options.buffer;
  this.startPoint = options.startPoint;
  this.endPoint = options.endPoint;
  this.selectionActive = options.selectionActive;
  this.shiftKeyDown = options.shiftKeyDown;
};

NumberEditor.prototype.handleRightArrow = function() {
  if (this.endPoint < this.buffer.length) {
    this.endPoint += 1;
  }
  this.handleMovingEndpoint();
};

NumberEditor.prototype.handleLeftArrow = function() {
  if (this.endPoint > 0) {
    this.endPoint -= 1;
  }
  this.handleMovingEndpoint();
};

NumberEditor.prototype.handleShiftKeyDown = function() {
  if (!this.selectionActive && !this.shiftKeyDown) {
    this.shiftKeyDown = true;
    this.startPoint = this.endPoint;
    this.selectionActive = true;
  } else if (!this.selectionActive && this.shiftKeyDown) {
    // Shouldn't get here!
  } else if (this.selectionActive && !this.shiftKeyDown) {
    this.shiftKeyDown = true;
  } else if (this.selectionActive && this.shiftKeyDown) {
    // Shouldn't get here!
  } else {
    console.log("Unrecognized state!", this);
  }
}

NumberEditor.prototype.handleShiftKeyUp = function() {
  this.shiftKeyDown = false;
  if (!this.selectionActive && !this.shiftKeyDown) {
    // Shouldn't get here!
  } else if (!this.selectionActive && this.shiftKeyDown) {
    // recording !shiftKeyDown is enough
  } else if (this.selectionActive && !this.shiftKeyDown) {
    // Shouldn't get here!
  } else if (this.selectionActive && this.shiftKeyDown) {
    
  }
}

NumberEditor.prototype.handleMovingEndpoint = function() {
  if (!this.selectionActive && !this.shiftKeyDown) {
    // moving the point is enough.
  } else if (!this.selectionActive && this.shiftKeyDown) {
    // Should never get here!
  } else if (this.selectionActive && !this.shiftKeyDown) {
    this.selectionActive = false;
  } else if (this.selectionActive && this.shiftKeyDown) {
    // moving point is enough.
  } else {
    console.log("Unrecognized state!", this);
  }
};

NumberEditor.prototype.handleDelete = function() {
  if (!this.selectionActive) {
    if (this.endPoint <= 0) {
      return;
    }
    var newEndPoint = this.endPoint - 1;
    this.buffer.splice(newEndPoint, 1);
    this.endPoint = newEndPoint;
    this.startPoint = newEndPoint;
  } else { // selection is active
    this.deleteSelection();
  }
};

NumberEditor.prototype.handleDigitInsert = function(digit) {
  if (!this.selectionActive) {
    this.insertDigit(digit);
  } else { // selection is active
    this.deleteSelection();
    this.insertDigit(digit);
  }
};

NumberEditor.prototype.deleteSelection = function() {
  var selectionLeft = this.getSelectionLeft();
  var selectionRight = this.getSelectionRight();
  this.buffer.splice(selectionLeft, selectionRight - selectionLeft);
  this.startPoint = selectionLeft;
  this.endPoint = selectionLeft;
  this.selectionActive = false;
};

NumberEditor.prototype.insertDigit = function(digit) {
  var staticDigit = new StaticDigit({digit: digit});
  this.buffer.splice(this.endPoint, 0, staticDigit);
  this.endPoint = this.endPoint + 1;
  this.startPoint = this.endPoint;
};
  
NumberEditor.prototype.getSelectionLeft = function() {
  if (this.startPoint <= this.endPoint) {
    return this.startPoint;
  } else {
    return this.endPoint;
  }
};

NumberEditor.prototype.getSelectionRight = function() {
  if (this.startPoint <= this.endPoint) {
    return this.endPoint;
  } else {
    return this.startPoint;
  }
};

NumberEditor.prototype.render = function() {
  var html = '<span class="mq-editable-field" id="editor" tabindex="0">';

  for (var p = 0; p <= this.buffer.length; p++) {
    if (p == this.endPoint) {
      html += '<span class="mq-cursor" id="cursor">&#8203;</span>';
    }
    if (this.selectionActive && this.getSelectionLeft() == p) {
      html += '<span class="mq-selection">';
    }
    if (this.selectionActive && this.getSelectionRight() == p) {
      html += '</span>';
    }
    if (p < this.buffer.length) {
      html += this.buffer[p].render();
    }
  }
  html += '</span>';
  return html;
};

NumberEditor.prototype.parseBuffer = function() {
  var numString = "";

  for (var i = 0; i < this.buffer.length; i++) {
    var viewNode = this.buffer[i];
    if (!(viewNode instanceof StaticDigit)) {
      return null;
    }
    numString += viewNode.digit;
  }
  return parseInt(numString);
};
