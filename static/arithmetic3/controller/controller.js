function Controller(options) {
  this.root = options.root;
  this.targets = options.targets;
  this.targetsById = options.targetsById;
  this.targetIndexesById = options.targetIndexesById;
  this.currentTargetIndex = options.currentTargetIndex;
  this.viewNodes = options.viewNodes;
  this.cursorFlasher = options.cursorFlasher;
  this.finalAnswerCallback = options.finalAnswerCallback;
}
Controller.prototype = {
  initializeTargets: function() {
    if (this.root.right.displayStaticValue) { // Final Answer showing
      this.targets = [];
    } else {
      this.targets = ExpressionScanner.getTargets(this.root.left);
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
      this.targets[this.currentTargetIndex].state = 'editing';      
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
    this.attachClickHandler();
    this.listenForEditorEvents();
    this.flashCursor();
    this.focusCurrentTarget();
  },

  updateEditorView: function() {
    if (this.currentTargetIndex < 0) {
      return;
    }
    var editorNode = this.targets[this.currentTargetIndex];
    var editorElement = $('#' + editorNode.id);
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
      var view = viewNode.render(this.targetsById);
      html += view;
    }
    html += '</span></span>';
    return html;
  },

  focusCurrentTarget: function() {
    if (this.currentTargetIndex < 0) {
      return;
    }
    var currentTarget = this.targets[this.currentTargetIndex];
    var currentTargetId = currentTarget.id;
    var targetSelector = '#' + currentTargetId;
    
    $(targetSelector).focus();
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
      this.targets[this.currentTargetIndex].state = 'static';
    }
    this.targets[newTargetIndex].state = 'editing';
    this.currentTargetIndex = newTargetIndex;
  },

  setTargetId: function(targetId) {
    var newTargetIndex = this.targetIndexesById[targetId];

    this.setTargetIndex(newTargetIndex);
  },
  
  showNewTargetById: function(targetId) {
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
    var editorNode = this.targets[this.currentTargetIndex];
    var editorElement = $('#' + editorNode.id);
    var numberEditor = this.findNumberEditor();


    editorElement.keypress(this.onKeyPress(numberEditor));
    editorElement.keydown(this.onKeyDown(numberEditor));
    editorElement.keyup(this.onKeyUp(numberEditor));
  },

  attachClickHandler: function() {
    var self = this;

    $(document).click(function(event) {
      console.log("Inside the click handler, got called with event:\n");
      console.log(event);
      var targetId = event.target.getAttribute('id');
      if (self.hasTargetId(targetId)) {
        self.showNewTargetById(targetId);
      }
    });
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
    console.log("Inside Controller.handleEnter, got called!\n");
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
    var editorNode = this.targets[this.currentTargetIndex];

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
  }
};
