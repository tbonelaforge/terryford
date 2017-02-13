var Node = function () {

  var idCounter = 0;

  function Node(options) {
    this.type = options.type; // Can be 'number', 'operator', or 'answer'
    this.value = options.value;
    this.state = options.state || 'static'; // Can be static, easy, hard, or editing
    this.left = options.left || null;
    this.right = options.right || null;
    this.id = ++idCounter;
  }

  Node.prototype.getOperatorCode = function() {
    if (this.value == '*') {
      return '&times;'
    } else if (this.value == '+') {
      return '+';
    }
  }

  Node.prototype.toBufferContent = function(nodeId) {
    var bufferContent = [];

    if (this.type == 'operator') {
      bufferContent.push(
        new StaticOperator({
          nodeId: nodeId,
          value: this.value
        })
      );
    } else if (this.type == 'number') {
      var digitArray = this.splitDigits();
      for (var i = 0; i < digitArray.length; i++) {
        var digit = digitArray[i];
        bufferContent.push(
          new StaticDigit({
            nodeId: nodeId,
            digit: parseInt(digit)})
        );
      }
    }
    return bufferContent;
  };

  Node.prototype.toBufferContents = function(nodeId) {
    var left = [];
    var right = [];

    if (this.left) {
      left = this.left.toBufferContents(nodeId);
    }
    if (this.right) {
      right = this.right.toBufferContents(nodeId);
    }
    var thisBufferContent = this.toBufferContent(nodeId);
    var bufferContents = left.concat(thisBufferContent, right);
    return bufferContents;
  };

  Node.prototype.toEditor = function() {
    var bufferContents = this.toBufferContents();
    if (this.type == "answer") {
      return new AnswerEditor({
        buffer: bufferContents,
        startPoint:0,
        endPoint: bufferContents.length,
        selectionActive: false, // Expect cursor at begininng, no highlight
        shiftKeyDown: false
      });
    } else {
      return new NumberEditor({
        buffer: bufferContents,
        startPoint: 0,
        endPoint: bufferContents.length,
        selectionActive: true, // Expect cursor at end, with highlight
        shiftKeyDown: false
      });
    }
  };

/*
  Node.prototype.toNumberEditor = function() {
    var bufferContents = this.toBufferContents();
    var numberEditor = new NumberEditor();

    return numberEditor;
  }
*/
  Node.prototype.toViewNodes = function() {
    var viewNodes;

    if (this.state == 'editing') {
//      return [this.toNumberEditor()];
      viewNodes = [this.toEditor()];
//      console.log("The result of calling toViewNodes is node, viewNodes:\n");
//      console.log(this, viewNodes);
      return viewNodes;
    }
    var left = [];
    var right = [];

    if (this.left) {
      left = this.left.toViewNodes();
    }
    if (this.right) {
      right = this.right.toViewNodes();
    }
    var theseViewNodes = this.toTheseViewNodes();
    viewNodes = left.concat(theseViewNodes, right);
//    console.log("The result of calling toViewNodes is node, viewNodes:\n");
//    console.log(this, viewNodes);
    return viewNodes;
  };


  Node.prototype.toTheseViewNodes = function() {
    if (this.type == "number") {
      var digitArray = this.splitDigits();
      var theseViewNodes = [];
      for (var i = 0; i < digitArray.length; i++) {
        var digit = digitArray[i];
        theseViewNodes.push(new StaticDigit({digit: digit}));
      }
      return theseViewNodes;    
    }
    else if (this.type == "operator") {
      return [
        new StaticOperator({
          id: this.id,
          value: this.value,
          state: this.state
        })
      ];
    } else if (this.type == "answer") {
      var digitArray = this.splitDigits();
      var staticDigits = [];
      for (var i = 0; i < digitArray.length; i++) {
        var digit = digitArray[i];
        staticDigits.push(new StaticDigit({digit: digit}));
      }
      return [
        new StaticAnswer({
          staticDigits: staticDigits
        })
      ];
    } else {
      console.log("Unrecognized node type: %s", this.type);
    }
  };

  Node.prototype.splitDigits = function() {
    var digitArray = ("" + this.value).split("");
    
    return digitArray;
  };

  Node.prototype.copyToBuffer = function() {
    var copy = new Node(this);

    return copy;
  };

  Node.prototype.evaluate = function() {
    if (this.type == 'number') {
      return this.value;
    } else if (this.type == 'operator') {
      var leftValue = this.left.evaluate();
      var rightValue = this.right.evaluate();
      if (this.value == '*') {
        return leftValue * rightValue;
      } else if (this.value == '+') {
        return leftValue + rightValue;
      } else {
        console.log("Unknown operator: %s\n", this.value);
        return null;
      }
    } else {
      console.log("Unknown node type: %s\n", this.type);
      return null;
    }

  }

  Node.prototype.getHint = function() {
    var description = this.describeOperation();
    if (description == null) {
      console.log("Can't get Hint for node:\n");
      console.log(this);
      return null;
    }
    if (this.left.type != "number" || this.right.type != "number") {
      return "Try a simpler expression.";
    }
    var hint = "Try " + description.full + " " 
      + this.left.value + " " + description.brief + " " + this.right.value;
    return hint;
  };

  Node.prototype.describeOperation = function() {
    if (this.type != "operator") {
      console.log("Can't describe operation for node of type %s \n", this.type);
      return null;
    }
    if (this.value == "*") {
      return {
        full: "multiplying",
        brief: "times"
      };
    } else if (this.value == "+") {
      return {
        full: "adding",
        brief: "plus"
      };
    } else {
      console.log("Unknown operator: %s", this.value);
      return null;
    }
  };

  return Node;
}();
