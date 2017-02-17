function Node(options) {
  this.id = options.id;
  this.type = options.type;
  this.value = options.value;
  this.state = options.state || 'static'; // Can be static, or editing
  this.left = options.left || null;
  this.right = options.right || null;
  this.displayStaticValue = options.displayStaticValue || false;
  this.depth = options.depth;
}

Node.prototype = {
  toViewNodes: function(editorState) {
    var viewNodes;
    
    if (this.state == 'editing') {
      viewNodes = [this.toEditor(editorState)];
      return viewNodes;
    }
    var left = [];
    var right = [];
    
    if (this.left) {
      left = this.left.toViewNodes(editorState);
    }
    if (this.right) {
      right = this.right.toViewNodes(editorState);
    }
    var theseViewNodes = this.toTheseViewNodes();
    viewNodes = left.concat(theseViewNodes, right);
    return viewNodes;
  },
  
  toTheseViewNodes: function() {
    if (this.type == "number") {
      var digitArray = this.splitDigits();
      var theseViewNodes = [];
      for (var i = 0; i < digitArray.length; i++) {
        var digit = digitArray[i];
        theseViewNodes.push(new StaticDigit({digit: digit}));
      }
      return theseViewNodes;
    } else if (this.type == "operator") {
      return [
        new StaticOperator({
          id: this.id,
          value: this.value,
          depth: this.depth
        })
      ];
    } else if (this.type == "answer") {
      var staticDigits = [];

      if (this.displayStaticValue) {
        var digitArray = this.splitDigits();
        for (var i = 0; i < digitArray.length; i++) {
          var digit = digitArray[i];
          staticDigits.push(new StaticDigit({digit: digit}));
        }
      }
      return [
        new StaticAnswer({
          id: this.id,
          staticDigits: staticDigits
        })
      ];
    } else {
      console.log("Node of type %s Could not produce view nodes\n", this.type);
    }
  },
  
  toBufferContents: function() {
    var left = [];
    var right = [];
    
    if (this.left) {
      left = this.left.toBufferContents();
    }
    if (this.right) {
      right = this.right.toBufferContents();
    }
    var thisBufferContent = this.toBufferContent();
    var bufferContents = left.concat(thisBufferContent, right);
    return bufferContents;
  },
  
  toEditor: function(editorState) {
    var bufferContents = this.toBufferContents();
    var goal = this.evaluate();

    return new NumberEditor({
      id: this.id,
      type: (this.type == 'answer') ? 'answer' : 'subexpression',
      buffer: bufferContents,
      startPoint: 0,
      endPoint: bufferContents.length,
      selectionActive: true,
      shiftKeyDown: editorState.shiftKeyDown,
      goal: goal
    });
  },

  toBufferContent: function() {
    var bufferContent = [];
    
    if (this.type == 'operator') {
      bufferContent.push(
        new StaticOperator({
          id: this.id,
          value: this.value
        })
      );
    } else if (this.type == 'number') {
      var digitArray = this.splitDigits();
      for (var i = 0; i < digitArray.length; i++) {
        var digit = digitArray[i];
        bufferContent.push(
          new StaticDigit({
            digit: parseInt(digit)})
        );
      }
    } else if (this.type == 'answer') {
      // Empty buffer content is enough.
    } else {
      console.log("Cannot get buffer contents for node of type %s\n", this.type);
    }
    return bufferContent;
  },
  
  splitDigits: function() {
    if (this.value == null || this.value == undefined) {
      return [];
    }
    var digitArray = ("" + this.value).split("");
    return digitArray;
  },

  evaluate: function() {
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
    } else if (this.type == "answer") {
      return this.value;
    } else {
      console.log("Cannot evaluate Unknown node type: %s\n", this.type);
      return null;
    }
  },

  getHint: function() {
    var description = this.describeOperation();

    if (description == null) {
      return null;
    }
    if (this.left.type != "number" || this.right.type != "number") {
      return "Enter the final answer or try a simpler expression first.";
    }
    var hint = "Try " + description.full + " "
      + this.left.value + " " + description.brief + " " + this.right.value;
    return hint;
  },

  describeOperation: function() {
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
      }
    } else {
      console.log("Unknown operator: %s", this.value);
      return null;
    }
  },

  print: function() {
    var text;
    var leftText = (this.left) ? this.left.print() : "";
    var rightText = (this.right) ? this.right.print() : "";

    text = leftText + ("" + this.value) + rightText;
    return text;
  }
}
  
