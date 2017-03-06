function Controller(options) {
  this.root = options.root;
  this.honeypotElement = options.honeypotElement;
  this.targets = options.targets;
  this.targetsById = options.targetsById;
  this.targetIndexesById = options.targetIndexesById;
  this.currentTargetIndex = options.currentTargetIndex;
  this.viewNodes = options.viewNodes;
  this.cursorFlasher = options.cursorFlasher;
  this.finalAnswerCallback = options.finalAnswerCallback;
  this.subexpressionReplacedCallback = options.subexpressionReplacedCallback;
  this.documentClickHandler = options.documentClickHandler;
  this.expressionDepth = options.expressionDepth;
  this.shouldAttachKeyboardHandlers = extractOption(options.shouldAttachKeyboardHandlers, true);
  this.shouldAttachEditorClickHandler = extractOption(options.shouldAttachEditorClickHandler, true);
  this.shouldAttachDocumentClickHandler = extractOption(options.shouldAttachDocumentClickHandler, true);
  this.shouldListenForEditorEvents = extractOption(options.shouldListenForEditorEvents, true);
  this.shouldFlashCursor = extractOption(options.shouldFlashCursor, true);
  this.shouldFocusCurrentTarget = extractOption(options.shouldFocusCurrentTarget, true);
  if (this.shouldAttachKeyboardHandlers) {
    this.attachKeyboardHandlers();
  }
}
Controller.prototype = {
  initializeTargets: function() {
    if (this.root.right.displayStaticValue) { // Final Answer showing
      this.setTargets([]);
      this.expressionDepth = ExpressionScanner.getMaxDepth(this.root.left);
    } else {
      var expressionScanner = new ExpressionScanner();
      expressionScanner.scan(this.root.left);
      var targets = expressionScanner.targets;
      targets.push(this.root.right); // Editable Answer node.
      this.setTargets(targets);
      this.expressionDepth = expressionScanner.maxDepth;
    }
  },

  setTargets: function(targets) {
    this.targets = targets;
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
    this.attachClickHandlers();
    if (this.shouldListenForEditorEvents) {
      this.listenForEditorEvents();
    }
    if (this.shouldFlashCursor) {
      this.flashCursor();
    }
    if (this.shouldFocusCurrentTarget) {
      this.focusCurrentTarget();
    } else {
    }
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
    $('#' + currentTarget.id).addClass('focused');
    $('#honey-pot').focus();
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
    this.honeypotElement.keypress(this.onKeyPress());
    this.honeypotElement.keydown(this.onKeyDown());
    this.honeypotElement.keyup(this.onKeyUp());
  },

  attachClickHandlers: function() {
    if (this.shouldAttachEditorClickHandler) {
      this.attachEditorClickHandler();
    }
    if (this.shouldAttachDocumentClickHandler) {
      this.attachDocumentClickHandler();
    } else {
    }
  },

  attachEditorClickHandler: function() {
    var self = this;
    var editorElement = self.getEditorElement();

    if (!editorElement) {
      return;
    }
    var clickHandler = function(event) {
      util.stopPropagation(event);
      $('#honey-pot').focus();
      if (self.getHintState() == 'none') {
        return;
      }
      self.removeHint();
      self.updateView();
    };
    editorElement.click(clickHandler);
    self.editorClickHandler = clickHandler;
  },

  detachEditorClickHandler: function() {
    if (this.editorClickHandler) {
      var editorElement = this.getEditorElement();

      if (editorElement) {
        editorElement.off('click', this.editorClickHandler);
      }
    }
  },

  attachDocumentClickHandler: function() {
    var self = this;
    if (self.documentClickHandler) {
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
    var touchstartHandler = function(event) {
      console.log("Inside touchstartHandler, got called and event is:\n", event);
      if (event.target.nodeName.match(/BODY/i)) {
        clickHandler(event);
      }
    };
    $(document).click(clickHandler);
    $(document).on('touchstart', touchstartHandler);
    self.documentClickHandler = clickHandler;
    self.touchstartHandler = touchstartHandler;
  },

  detachDocumentClickHandler: function() {
    if (this.documentClickHandler) {
      $(document).off("click", this.documentClickHandler);
      this.documentClickHandler = null;
    }
    if (this.touchstartHandler) {
      $(document).off("touchstart", this.touchstartHandler);
      this.touchstartHandler = null;
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

  onKeyPress: function() {
    var self = this;

    return function(event) {
      if (self.currentTargetIndex < 0) {
        return;
      }
      var editor = self.findNumberEditor();
      var digit = self.extractDigit(event);

      if (digit != null) {
        editor.handleDigitInsert(digit);
        self.updateEditorView(editor);
      } else if (event.keyCode == 13) { // Enter key.
        util.stopPropagation(event);
        util.preventDefault(event);
        self.handleEnter();
      } else { // unrecognized key press.
        return;
      }
    };
  },

  onKeyDown: function() {
    var self = this;

    return function(event) {
      if (self.currentTargetIndex < 0) {
        return;
      }
      var editor = self.findNumberEditor();
      
      if (event.keyCode == 39) { // Right Arrow
        editor.handleRightArrow();
      } else if (event.keyCode == 37) { // Left Arrow
        editor.handleLeftArrow();
      } else if (event.keyCode == 16) { // Shift
        editor.handleShiftKeyDown();
      } else if (event.keyCode == 8) { // Backspace
        util.preventDefault(event);
        editor.handleDelete()
      } else if (event.keyCode == 9) { // Tab
        util.preventDefault(event);
        editor.handleTab();
      } else { // unrecognized key down
        return;
      }
      self.updateEditorView(editor);
    };
  },

  onKeyUp: function() {
    var self = this;

    return function(event) {
      if (self.currentTargetIndex < 0) {
        return;
      }
      var editor = self.findNumberEditor();
      
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
      if (this.subexpressionReplacedCallback) {
        this.subexpressionReplacedCallback();
      }
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
    var editorElement = self.getEditorElement();
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
    editorElement.removeClass('focused');
    jAlert(hintString, hintTitle, callback);
    $('#popup_container').keydown(function(event) {
      noopTabHandler(event);
    });
    if (hintPosition) {
      $('#popup_container').css({
        top: hintPosition.top + 'px',
        left: hintPosition.left + 'px'
      });
    }
  },

  showSubexpressionHint: function() {
    var self = this;
    var targetNode = self.getCurrentTarget();
    var hintString = targetNode.getHint();
    var editorElement = self.getEditorElement();

    editorElement.removeClass('focused');
    jAlert(hintString, 'Incorrect', function() {
      self.updateView();
    });
    $('#popup_container').keydown(function(event) {
      noopTabHandler(event);
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
    var position;

    if (targetNode.type == 'answer') {
      position = this.computeCalloutPosition({id: "math-container"});
      position.top = position.top + 40;
    } else {
      position = this.computeCalloutPosition(targetNode);
      position.top = position.top + 8; // Account for the alert border + margin
    }
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
  },

  cleanUp: function() {
    if (this.cursorFlasher) {
      clearInterval(this.cursorFlasher);
    }
    if (this.documentClickHandler) {
      $(document).off("click", this.documentClickHandler);
    }
    if (this.touchstartHandler) {
      $(document).off("touchstart", this.touchstartHandler);
    }
  }
};

function extractOption(value, defaultValue) {
  if (value !== undefined && value !== null) {
    return value;
  }
  return defaultValue;
}

function noopTabHandler(event) {
  if (event.keyCode == 9) { // Tab key
    util.stopPropagation(event);
    util.preventDefault(event);
  }
}
