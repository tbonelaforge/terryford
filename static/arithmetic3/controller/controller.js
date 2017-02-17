function Controller(options) {
  this.root = options.root;
  this.targets = options.targets;
  this.targetsById = options.targetsById;
  this.targetIndexesById = options.targetIndexesById;
  this.currentTargetIndex = options.currentTargetIndex;
  this.viewNodes = options.viewNodes;
  this.cursorFlasher = options.cursorFlasher;
  this.finalAnswerCallback = options.finalAnswerCallback;
  this.clickHandler = options.clickHandler;
  this.expressionDepth = options.expressionDepth;
}
Controller.prototype = {
  initializeTargets: function() {
    if (this.root.right.displayStaticValue) { // Final Answer showing
      this.targets = [];
      this.expressionDepth = ExpressionScanner.getMaxDepth(this.root.left);
    } else {
      var expressionScanner = new ExpressionScanner();
      expressionScanner.scan(this.root.left);
      this.targets = expressionScanner.targets;
      this.expressionDepth = expressionScanner.maxDepth;
      this.targets.push(this.root.right); // Editable AnswerNode
    }
    this.targetsById = {};
    this.targetIndexesById = {};
    for (var i = 0; i < this.targets.length; i++) {
      var target = this.targets[i];
      this.targetsById[target.id] = target;
      this.targetIndexesById[target.id] = i;
    }
    this.currentTargetIndex = this.targets.length - 1;
    if (this.currentTargetIndex >= 0) {
      this.getCurrentTarget().state = 'editing';
    }
  },
  
  flashCursor: function() {
    if (this.cursorFlasher) {
      clearInterval(this.cursorFlasher);
    }
    this.cursorFlasher = setInterval(function() {
      $('#cursor').toggleClass('mq-blink');
    }, 500);
  },

  updateView: function() {
    var editorState = this.findNumberEditor() || {};
    var viewNodes = this.root.toViewNodes(editorState);

    var view = this.renderView(viewNodes);
    
    $('#math-container').html(view);
    this.viewNodes = viewNodes;
    this.attachKeyboardHandlers();
    this.attachClickHandlers();
    this.listenForEditorEvents();
    this.flashCursor();
    this.focusCurrentTarget();
  },

  updateEditorView: function() {
    if (this.currentTargetIndex < 0) {
      return;
    }
    var editorElement = this.getEditorElement();
    var numberEditor = this.findNumberEditor();

    if (numberEditor) {
      editorElement.html(numberEditor.renderBuffer());
    }
  },

  renderView: function(viewNodes) {
    var html = "";
    html += '<span class="mq-math-mode"><span class="mq-root-block">';
    for (var i = 0; i < viewNodes.length; i++) {
      var viewNode = viewNodes[i];
      var view = viewNode.render(this.targetsById, this.expressionDepth);
      html += view;
    }
    html += '</span></span>';
    return html;
  },

  focusCurrentTarget: function() {
    var currentTarget = this.getCurrentTarget();

    if (!currentTarget) {
      return;
    }
    $('#' + currentTarget.id).focus();
  },

  showNextTarget: function() {
    var newTargetIndex = this.bumpTargetIndex(1);

    this.setTargetIndex(newTargetIndex);
    this.updateView();
  },
  
  showPreviousTarget: function() {
    var newTargetIndex = this.bumpTargetIndex(-1);

    this.setTargetIndex(newTargetIndex);
    this.updateView();
  },

  bumpTargetIndex: function(direction) {
    if (direction == 1) {
      return (this.currentTargetIndex + 1) % this.targets.length;
    } else if (direction == -1) {
      if (this.currentTargetIndex == 0) {
        return this.targets.length - 1;
      } else {
        return this.currentTargetIndex - 1;
      }
    } else {
      console.log("Invalid direction %d for bumping target index...\n", direction);
    }
  },

  setTargetIndex: function(newTargetIndex) {
    if (this.currentTargetIndex != undefined 
        && this.currentTargetIndex != null) {
      this.getCurrentTarget().state = 'static';
    }
    this.targets[newTargetIndex].state = 'editing';
    this.currentTargetIndex = newTargetIndex;
  },

  setTargetId: function(targetId) {
    var newTargetIndex = this.targetIndexesById[targetId];

    this.setTargetIndex(newTargetIndex);
  },
  
  showNewTargetById: function(targetId) {
    this.removeHint();
    this.setTargetId(targetId);
    this.updateView();
  },

  hasTargetId: function(id) {
    return ( this.targetsById[id] ) ? true : false;
  },

  attachKeyboardHandlers: function() {
    if (this.currentTargetIndex < 0) {
      return;
    }
    var editorElement = this.getEditorElement();
    var numberEditor = this.findNumberEditor();

    editorElement.keypress(this.onKeyPress(numberEditor));
    editorElement.keydown(this.onKeyDown(numberEditor));
    editorElement.keyup(this.onKeyUp(numberEditor));
  },

  attachClickHandlers: function() {
    this.attachEditorClickHandler();
    this.attachDocumentClickHandler();
  },

  attachEditorClickHandler: function() {
    var self = this;
    var editorElement = self.getEditorElement();

    if (!editorElement) {
      return;
    }
    editorElement.click(function(event) {
      event.stopPropagation();
      if (self.getHintState() == 'none') {
        return;
      }
      self.removeHint();
      self.updateView();
    });
  },

  attachDocumentClickHandler: function() {
    var self = this;
    if (self.clickHandler) {
      return;
    }
    var clickHandler = function(event) {
      if (self.targets.length == 0) {
        return;
      }
      var targetId = event.target.getAttribute('id');
      if (self.hasTargetId(targetId)) {
        self.showNewTargetById(targetId);
      } else { // Clicking outside of any given target.
        self.handleClickOutside();
      }
    };
    $(document).click(clickHandler);
    self.clickHandler = clickHandler;
  },

  detachDocumentClickHandler: function() {
    if (this.clickHandler) {
      $(document).off("click", this.clickHandler);
      this.clickHandler = null;
    }
  },

  listenForEditorEvents: function() {
    var self = this;
    var numberEditor = self.findNumberEditor();

    if (!numberEditor) { // All correct, as in end of game...
      return;
    }
    numberEditor.setTabCallback(function() {
      self.showNextTarget();
    });
    numberEditor.setShiftTabCallback(function() {
      self.showPreviousTarget();
    });
    numberEditor.setCorrectCallback(function(value) {
      self.handleCorrect(value);
    });
  },

  onKeyPress: function(editor) {
    var self = this;

    return function(event) {
      var digit = self.extractDigit(event);

      if (digit != null) {
        editor.handleDigitInsert(digit);
        self.updateEditorView(editor);
      } else if (event.keyCode == 13) { // Enter key.
        event.stopPropagation();
        self.handleEnter();
      } else { // unrecognized key press.
        return;
      }
    };
  },

  onKeyDown: function(editor) {
    var self = this;

    return function(event) {
      if (event.keyCode == 39) { // Right Arrow
        editor.handleRightArrow();
      } else if (event.keyCode == 37) { // Left Arrow
        editor.handleLeftArrow();
      } else if (event.keyCode == 16) { // Shift
        editor.handleShiftKeyDown();
      } else if (event.keyCode == 8) { // Backspace
        event.preventDefault(); // Prevent Firefox from navigating back
        editor.handleDelete()
      } else if (event.keyCode == 9) { // Tab
        event.preventDefault(); // Ignore browser's tabindex behavior.
        editor.handleTab();
      } else { // unrecognized key down
        return;
      }
      self.updateEditorView(editor);
    };
  },

  onKeyUp: function(editor) {
    var self = this;

    return function(event) {
      if (event.keyCode == 16) { // Shift
        editor.handleShiftKeyUp();
      } else { // unrecognized key up
        return;
      }
    };
  },

  handleEnter: function() {
    var self = this;

    if (self.getEditingState() == 'subexpression' && self.getHintState() == 'none') {
      self.showSubexpressionHint();
    } else if (self.getEditingState() == 'answer' && self.getHintState() == 'none') {
      self.showAnswerHint();
    }
  },

  findNumberEditor: function() {
    if (!this.viewNodes) {
      return null;
    }
    for (var i = 0; i < this.viewNodes.length; i++) {
      var viewNode = this.viewNodes[i];
      if (viewNode instanceof NumberEditor) {
        return viewNode;
      }
    }
    return null;
  },

  extractDigit: function(event) {
    if (event.keyCode >= 48 && event.keyCode <= 57) { // Digit 0-9
      return event.keyCode - 48;
    } else if (event.charCode >= 48 && event.charCode <= 57) { // Firefox digit 0-9
      return event.charCode - 48;
    }
    return null;
  },

  handleCorrect: function(value) {
    var editorNode = this.getCurrentTarget();

    if (editorNode.type == "answer") {
      editorNode.state = 'static';
      editorNode.displayStaticValue = true;
      this.initializeTargets();
      this.updateView();
      if (this.finalAnswerCallback) {
        this.finalAnswerCallback();
      }
    } else { // A subexpression has been entered correctly.
      var replacementNode = new Node({
        type: 'number',
        value: value
      });
      this.root.left = ExpressionScanner.replace(
        this.root.left,
        editorNode,
        replacementNode
      );
      this.initializeTargets();
      this.updateView();
    }
  },

  setFinalAnswerCallback: function(callback) {
    this.finalAnswerCallback = callback;
  },

  // Compute editing state:
  // Can be 'answer', or  'subexpression'
  getEditingState: function() {
    if (this.currentTargetIndex == (this.targets.length - 1)) {
      return 'answer';
    } else {
      return 'subexpression';
    }
  },

  // Compute hint state:
  // Can be 'hint' or 'none'
  getHintState: function() {
    var popupJQ = $('#popup_container');

    return ( popupJQ.length > 0 ) ? 'hint' : 'none';
  },

  handleClickOutside: function() {
    var self = this;

    if (self.getEditingState() == 'answer' && self.getHintState() == 'none') {
      self.showAnswerHint();
    } else if (self.getEditingState() == 'answer' && self.getHintState() == 'hint') {
      // Do nothing, until they show signs of acknowledgement.
    } else if (self.getEditingState() == 'subexpression' && self.getHintState() == 'none') {
      self.showSubexpressionHint();
    } else if (self.getEditingState() == 'subexpression' && self.getHintState() == 'hint') {
      // Do nothing, until they show signs of acknowledgement.
    } else {
      console.log(
        "Cannot handle click outside: unrecognized (editingState, hintState): (%s, %s)",
        self.getEditingState(),
        self.getHintState()
      );
    }
  },

  showAnswerHint: function() {
    var self = this;
    var expressionRoot = self.root.left;
    var hintString = expressionRoot.getHint();
    var hintTitle = (self.findNumberEditor().buffer.length) ? 'Incorrect' : 'Hint';
    var hintPosition = self.computeHintPosition();
    var callback;

    if (self.targets.length > 1) { // subexpression available
      self.addCalloutArrows();
      callback = function() {
        self.removeCalloutArrows();
        self.updateView();
      }
    } else {
      callback = function() {
        self.updateView();
      }
    }

    jAlert(hintString, hintTitle, callback);
    if (hintPosition) {
      $('#popup_container').css({
        top: hintPosition.top + 'px',
        left: hintPosition.left + 'px'
      });
    }
  },

  showSubexpressionHint: function() {
    var self = this;
    var targetNode = this.getCurrentTarget();
    var hintString = targetNode.getHint();

    jAlert(hintString, 'Incorrect', function() {
      self.updateView();
    });
    var hintPosition = this.computeHintPosition();
    if (hintPosition) {
      $('#popup_container').css({
        top: hintPosition.top + 'px',
        left: hintPosition.left + 'px'
      });
    } else {
      console.log("Unable to compute hint position...\n");
    }
  },

  computeHintPosition: function() {
    var targetNode = this.getCurrentTarget();
    var position = this.computeCalloutPosition(targetNode);

    position.top = position.top + 8; // Account for the alert border + margin
    return position;
  },

  computeCalloutPosition: function(node) {
    var nodeJQ = $('#' + node.id);

    if (nodeJQ.length) {
      var originalPosition = nodeJQ.position();
      var height = nodeJQ.height();
      return {
        top: originalPosition.top + height,
        left: originalPosition.left
      }
    } else {
      return null;
    }
  },

  addCalloutArrows: function() {
    for (var i = 0; i <= this.targets.length - 2; i++) {
      var targetNode = this.targets[i];
      var arrowPosition = this.computeCalloutPosition(targetNode);
      var arrowElement = $('<div class="up-triangle bounce">');

      arrowElement.css({
        top: arrowPosition.top + 'px',
        left: (arrowPosition.left + 13) + 'px'
      });
      $('body').append(arrowElement);
    }
  },

  removeHint: function() {
    $('#popup_container').remove();
    this.removeCalloutArrows();
  },

  removeCalloutArrows: function() {
    $('.up-triangle').remove();
  },

  getCurrentTarget: function() {
    if (this.targets.length && this.currentTargetIndex >= 0) {
      return this.targets[this.currentTargetIndex];
    } else {
      return null;
    }
  },

  getEditorElement: function() {
    var editorNode = this.getCurrentTarget();

    if (!editorNode) {
      return null;
    }
    return $('#' + editorNode.id);
  }
};
