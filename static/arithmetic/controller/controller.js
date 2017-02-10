function Controller(options) {
  this.root = options.root;
  this.editorElement = options.editorElement || null;
  this.cursorFlasher = options.cursorFlasher || null;
  this.targetNode = options.targetNode || null;
  this.correctCallback = options.correctCallback || null;
};

Controller.prototype = {
  findNumberEditor: function(viewNodes) {
    for (var i = 0; i < viewNodes.length; i++) {
      if (viewNodes[i] instanceof NumberEditor) {
        return viewNodes[i];
      }
    }
    return null;
  },
  
  updateDisplay: function() {
    var self = this;
    var viewNodes = this.root.toViewNodes();
    var numberEditor = this.findNumberEditor(viewNodes);
    var view = renderView(viewNodes);
    var container = document.getElementById('math-container');
    container.innerHTML = view;  
//    $('.clickable').click(handleOperatorClick);
    $('.clickable').click(function(e) {
      self.handleOperatorClick(e);
    });
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

  onKeyPress: function(numberEditor) {
    var self = this;

    return function(event) {
      // Need digits 0-9, Enter
      
      if (event.keyCode >= 48 && event.keyCode <= 57) { // Digit 0-9
        var digit = event.keyCode - 48;
        numberEditor.handleDigitInsert(digit);
      } else if (event.charCode >= 48 && event.charCode <= 57) { // Firefox digit 0-9
        var digit = event.charCode - 48;
        numberEditor.handleDigitInsert(digit);
      } else if (event.keyCode == 13) { // Enter key.
        var isSubmissionCorrect = self.handleSubmission(numberEditor);
        if (isSubmissionCorrect) {
          self.correctCallback();
        }
      } else {
        return;
      }
      self.editorElement.innerHTML = numberEditor.render();
    };
  },

  flashCursor: function() {
    if (this.cursorFlasher != null) {
      clearInterval(cursorFlasher);
      cursorFlasher = null;
    }
    this.cursorFlasher = setInterval(function() {
      var cursorElement = $('#cursor');
      
      cursorElement.toggleClass('mq-blink');
    }, 500);
  },

  startEditing: function(targetNode) {
    this.targetNode.state = "editing";
    var numberEditor = this.updateDisplay();
    this.flashCursor();
    this.editorElement = document.getElementById("editor");
    this.editorElement.addEventListener("keypress", this.onKeyPress(numberEditor), false);
    this.editorElement.addEventListener("keydown", this.onKeyDown(numberEditor), false);
    this.editorElement.addEventListener("keyup", this.onKeyUp(numberEditor), false);
    this.editorElement.focus();
  },

  handleOperatorClick: function(e) {
    e.stopPropagation();
    var id = parseInt(e.target.getAttribute('id'));
    this.targetNode = NodeScanner.findNodeById(this.root,id);
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
  
  handleSubmission: function(numberEditor) {
    var self = this;
    var submission = numberEditor.parseBuffer();

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
    var hintPosition = this.computeHintPosition(targetNode);
    if (hintPosition) {
      $('#popup_container').css({
        top: hintPosition.top + 'px',
        left: hintPosition.left + 'px'
      });
    } else {
      console.log("Unable to compute hint position...\n");
    }
  },
  
  computeHintPosition: function(targetNode) {
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
  }
};
