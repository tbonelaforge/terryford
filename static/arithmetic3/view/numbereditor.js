var NumberEditor = function(options) {
  this.id = options.id;
  this.buffer = options.buffer; // array of view nodes.
  this.startPoint = options.startPoint;
  this.endPoint = options.endPoint;
  this.selectionActive = options.selectionActive;
  this.shiftKeyDown = options.shiftKeyDown;
  this.goal = options.goal;
  this.tabCallback = options.tabCallback;
  this.shiftTabCallback = options.shiftTabCallback;
  this.correctCallback = options.correctCallback;
};

NumberEditor.prototype = {
  handleRightArrow: function() {
    if (this.endPoint < this.buffer.length) {
      this.endPoint += 1;
    }
    this.handleMovingEndpoint();
  },
  
  handleLeftArrow: function() {
    if (this.endPoint > 0) {
      this.endPoint -= 1;
    }
    this.handleMovingEndpoint();
  },

  handleShiftKeyDown: function() {
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
  },

  handleShiftKeyUp: function() {
    this.shiftKeyDown = false;
    if (!this.selectionActive && !this.shiftKeyDown) {
      // Shouldn't get here!
    } else if (!this.selectionActive && this.shiftKeyDown) {
      // recording !shiftKeyDown is enough
    } else if (this.selectionActive && !this.shiftKeyDown) {
      // Shouldn't get here!
    } else if (this.selectionActive && this.shiftKeyDown) {
      
    }
  },

  handleTab: function() {
    if (this.shiftKeyDown) { // Shift-Tab
      if (this.shiftTabCallback) {
        this.shiftTabCallback();
      }
    } else { // Regular tab
      if (this.tabCallback) {
        this.tabCallback();
      }
    }
  },

  handleMovingEndpoint: function() {
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
  },

  handleDelete: function() {
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
    this.checkCorrectness();
  },
  
  handleDigitInsert: function(digit) {
    if (!this.selectionActive) {
      this.insertDigit(digit);
    } else { // selection is active
      this.deleteSelection();
      this.insertDigit(digit);
    }
    this.checkCorrectness();
  },

  deleteSelection: function() {
    var selectionLeft = this.getSelectionLeft();
    var selectionRight = this.getSelectionRight();
    this.buffer.splice(selectionLeft, selectionRight - selectionLeft);
    this.startPoint = selectionLeft;
    this.endPoint = selectionLeft;
    this.selectionActive = false;
  },
  
  insertDigit: function(digit) {
    var staticDigit = new StaticDigit({digit: digit});
    this.buffer.splice(this.endPoint, 0, staticDigit);
    this.endPoint = this.endPoint + 1;
    this.startPoint = this.endPoint;
  },
  
  getSelectionLeft: function() {
    if (this.startPoint <= this.endPoint) {
      return this.startPoint;
    } else {
      return this.endPoint;
    }
  },

  getSelectionRight: function() {
    if (this.startPoint <= this.endPoint) {
      return this.endPoint;
    } else {
      return this.startPoint;
    }
  },

  render: function(targetsById) {
    var originalNode = targetsById[this.id];
    var type = (originalNode.type == "answer") ? "answer" : "subexpression";
    var html = '<span id="' + this.id + '" class="mq-editable-field ' + type + '" tabindex="1">';
    html += this.renderBuffer();
    html += '</span>';
    return html;
  },

  parseBuffer: function() {
    var numString = "";
    
    for (var i = 0; i < this.buffer.length; i++) {
      var viewNode = this.buffer[i];
      if (!(viewNode instanceof StaticDigit)) {
        return null;
      }
      numString += viewNode.digit;
    }
    return parseInt(numString);
  },

  renderBuffer: function() {
    var html = "";
    for (var p = 0; p <= this.buffer.length; p++) {
      if (p == this.endPoint) {
        html += '<span class="mq-cursor mq-blink" id="cursor">&#8203;</span>';
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
    return html;
  },

  printBuffer: function() {
    var notation = "";
    for (var i = 0; i < this.buffer.length; i++) {
      notation += this.buffer[i].print();
    }
    return notation;
  },

  setTabCallback: function(callback) {
    this.tabCallback = callback;
  },

  setShiftTabCallback: function(callback) {
    this.shiftTabCallback = callback;
  },

  setCorrectCallback: function(callback) {
    this.correctCallback = callback;
  },

  checkCorrectness: function() {
    var bufferValue = this.parseBuffer();

    if (bufferValue != null && bufferValue == this.goal) {
      if (this.correctCallback) {
        this.correctCallback(bufferValue);
      }
    }
  }
};


