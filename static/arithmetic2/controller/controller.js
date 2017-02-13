function Controller(options) {
  this.root = options.root;
  this.expressionRoot = options.expressionRoot || this.root && this.root.left;
  this.answerNode = options.answerNode || this.root && this.root.right;
  this.container = options.container;
  this.editorElement = options.editorElement || null;
  this.cursorFlasher = options.cursorFlasher || null;
  this.targetNode = options.targetNode || null;
  this.correctCallback = options.correctCallback || null;
  this.onSubmit = options.onSubmit || null;
  this.operatorClickCallback = options.operatorClickCallback || null;
};

Controller.prototype = {
  setRoot: function(root) {
    this.root = root;
    this.expressionRoot = root.left;
    this.answerNode = root.right;
  },
  findNumberEditor: function(viewNodes) {
    for (var i = 0; i < viewNodes.length; i++) {
      if (viewNodes[i] instanceof NumberEditor) {
        return viewNodes[i];
      }
      if (viewNodes[i] instanceof AnswerEditor) {
        return viewNodes[i];
      }
    }
    return null;
  },
  setOperatorClickCallback: function(operatorClickCallback) {
    this.operatorClickCallback = operatorClickCallback;
    $('.clickable').off('click');
    $('.clickable').click(operatorClickCallback);
  },
  updateDisplay: function() {
    var self = this;
    var viewNodes = this.root.toViewNodes();
    var numberEditor = this.findNumberEditor(viewNodes);
    var view = renderView(viewNodes);
    var operatorCallback = this.operatorClickCallback;

    if (!operatorCallback) {
      operatorCallback = function(e) {
        self.handleOperatorClick(e);
      };
    }
    this.container.innerHTML = view;
    $('.clickable').click(operatorCallback);
    return numberEditor;
  },

  onKeyUp: function(numberEditor) {
    return function(event) {
      // Need Shift key
      
      if (event.keyCode == 16) { // Shift
        numberEditor.handleShiftKeyUp();
      } else {
        return;
      }
    };
  },
  
  onKeyDown: function(numberEditor) {
    var self = this;

    return function(event) {
      // Need Shift, left Arrow, Right Arrow, Delete
      
      if (event.keyCode == 39) { // ArrowRight
        numberEditor.handleRightArrow();
      } else if (event.keyCode == 37) { // ArrowLeft
        numberEditor.handleLeftArrow();
      } else if (event.keyCode == 16) { // Shift
        numberEditor.handleShiftKeyDown();
      } else if (event.keyCode == 8) { // Backspace
        event.preventDefault(); // Prevent firefox from navigating back.
        numberEditor.handleDelete();
      } else {
        return;
      }
      self.editorElement.innerHTML = numberEditor.render();
    };
  },

  onKeyPress: function(editor) {
    var self = this;

    return function(event) {
      // Need digits 0-9, Enter
      console.log("Inside onKeyPress, got called with event:", event);
      var digit = self.extractDigit(event);
      if (digit != null) {
        editor.handleDigitInsert(digit);
        console.log("Inside onKeyPress, just handled digit insert: %d\n", digit);
        self.handleDigitInsert(editor);
/*
        if (editor instanceof AnswerEditor) {
          var isAnswerCorrect = self.handleAnswerSubmission(editor);
          console.log("Inside controller.onKeyPress, realized the correctness of the answer is %s", isAnswerCorrect);
          if (isAnswerCorrect) {
            if (self.correctAnswerCallback) {
              self.correctAnswerCallback(editor.parseBuffer());
            }
          }
        }
*/
      } else if (event.keyCode == 13) { // Enter key.
        self.handleIncorrectEntry(editor);
/*
        var isSubmissionCorrect = self.handleSubmission(editor);
        if (self.onSubmit) {
          self.onSubmit();
        }
        if (isSubmissionCorrect) {
          if (self.correctCallback) {
            self.correctCallback(editor.parseBuffer());
          } else {
            console.log("No correct callback specified.");
          }

        }
*/
      } else {
        return;
      }
      self.editorElement.innerHTML = editor.renderBuffer();
    };
  },

  extractDigit: function(event) {
    if (event.keyCode >= 48 && event.keyCode <= 57) { // Digit 0-9
      return event.keyCode - 48;
    } else if (event.charCode >= 48 && event.charCode <= 57) { // Firefox digit 0-9
      return event.charCode - 48;
    }
    return null;
  },

  handleDigitInsert: function(editor) {
    var self = this;

    if (editor instanceof AnswerEditor) {
      var isAnswerCorrect = self.handleAnswerSubmission(editor);
      console.log("Inside controller.onKeyPress, realized the correctness of the answer is %s", isAnswerCorrect);
      if (isAnswerCorrect) {
        if (self.correctAnswerCallback) {
          self.correctAnswerCallback(editor.parseBuffer());
        }
      }
    } else if (editor instanceof NumberEditor) {
      // TODO: somethingn here...
    }
  },

  handleIncorrectEntry: function(editor) {
    var self = this;

    if (editor instanceof AnswerEditor) {
      //self.showHint(self.targetNode, function() {
      self.showAnswerHint(function() {
        console.log("All done showing hint...\n");
        self.resetDisplay();
        self.startEditing(self.answerNode);
      });
    } else if (editor instanceof NumberEditor) {
      console.log("TODO: something when hitting enter on subexpression...\n");
    }
  },

  flashCursor: function() {
    if (this.cursorFlasher != null) {
      clearInterval(this.cursorFlasher);
      this.cursorFlasher = null;
    }
    this.cursorFlasher = setInterval(function() {
      var cursorElement = $('#cursor');

      cursorElement.toggleClass('mq-blink');
    }, 500);
  },

  startEditing: function(targetNode) {
    this.targetNode = targetNode;
    this.targetNode.state = "editing";
    var editor = this.updateDisplay();
    this.flashCursor();
    this.editorElement = document.getElementById("editor");
    this.editorElement.addEventListener("keypress", this.onKeyPress(editor), false);
    this.editorElement.addEventListener("keydown", this.onKeyDown(editor), false);
    this.editorElement.addEventListener("keyup", this.onKeyUp(editor), false);
    this.editorElement.focus();
  },

  handleOperatorClick: function(e) {
    e.stopPropagation();
    var id = parseInt(e.target.getAttribute('id'));
    this.targetNode = NodeScanner.findNodeById(this.root, id);
    this.startEditing(this.targetNode);
  },
  
  resetDisplay: function() {
    NodeScanner.setStates(this.root);
    if (this.cursorFlasher != null) {
      clearInterval(this.cursorFlasher);
      this.cursorFlasher = null;
    }
    this.updateDisplay();
  },
  
  handleAnswerSubmission: function(editor) {
    var self = this;
    var submission = editor.parseBuffer();

    if (submission != null) {
      var expected = self.expressionRoot.evaluate();
      if (submission == expected) {
        console.log("The answer submission is now CORRECT!\n");
        console.log("From here, we wish to set the value of the answer node, and turn it static...\n");
        self.answerNode.value = expected;
        self.answerNode.state = 'static';
        self.resetDisplay();
        return true;
      } else {
        console.log("The answer submission is INCORRECT!...Do nothing\n");
        return false;
      }
    }
  },

  handleSubmission: function(editor) {
    var self = this;
    var submission = editor.parseBuffer();

    if (submission != null) {
      var expected = self.targetNode.evaluate();
      if (submission == expected) {
        var replacementNode = new Node({
          type: 'number',
          value: submission
        });
        self.root = NodeScanner.replace(self.root, self.targetNode, replacementNode);
        self.resetDisplay(); 
        return true;
      }
    } else {
      console.log("The submission was not parseable...");
    }
    self.showHint(self.targetNode, function() {
      console.log("All done showing hint...\n");
      self.resetDisplay();
    });
    return false;
  },
  
  showHint: function(targetNode, callback) {
    var hintString = targetNode.getHint();
    jAlert(hintString, 'Incorrect', callback);
//    var hintPosition = this.computeHintPosition(targetNode);
    var hintPosition = this.computeEditorHintPosition();
    if (hintPosition) {
      $('#popup_container').css({
        top: hintPosition.top + 'px',
        left: hintPosition.left + 'px'
      });
    } else {
      console.log("Unable to compute hint position...\n");
    }
  },

  showAnswerHint: function(callback) {
    var hintString = this.expressionRoot.getHint();
    var alertCallback = callback;
    var nodeScanner = new NodeScanner();

    nodeScanner.computeClickableNodes(this.expressionRoot);
    if (nodeScanner.easy) { // There is a subexpression available.
      var calloutArrow = this.addCalloutArrow(nodeScanner.easy);
      alertCallback = function() {
        calloutArrow.remove();
        callback();
      }
    }
    jAlert(hintString, 'Incorrect', alertCallback);
//    var hintPosition = this.computeHintPosition(this.answerNode);
    var hintPosition = this.computeEditorHintPosition();
    if (hintPosition) {
      $('#popup_container').css({
        top: hintPosition.top + 'px',
        left: hintPosition.left + 'px'
      });
    } else {
      console.log("Unable to compute hint position...\n");
    }
  },

  addCalloutArrow: function(node) {
    console.log("Inside addCalloutArrow, got called with node...\n");
    console.log(node);
//    var arrowPosition = this.computeHintPosition(node);
    var arrowPosition = this.computeNodePosition(node);
    console.log("The arrowPosition is:\n");
    console.log(arrowPosition);
    arrowElement = $('<div class="up-triangle bounce">');
    arrowElement.css({
      top: arrowPosition.top + 'px',
      left: (arrowPosition.left + 13) + 'px'
    });
    $('body').append(arrowElement);
    return arrowElement;
  },
  
//  computeHintPosition: function(targetNode) {
  computeEditorHintPosition: function() {
    var editorJQ = $('#editor');
    if (editorJQ.length) {
      var editorPosition = editorJQ.position();
      var editorHeight = editorJQ.height();
      return {
        top: editorPosition.top + editorHeight,
        left: editorPosition.left
      };
    } else {
      console.log("Unable to locate the editor..");
      return null;
    }
  },

  computeNodePosition: function(node) {
    var nodeJQ = $('#' + node.id);
    if (nodeJQ.length) {
      var nodePosition = nodeJQ.position();
      var nodeHeight = nodeJQ.height();
      return {
        top: nodePosition.top + nodeHeight,
        left: nodePosition.left
      };
    } else {
      console.log("Unable to locate the node..");
      return null;
    }
  }
};
