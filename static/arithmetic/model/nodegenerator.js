var lastNodeId = 0;

function NodeGenerator(options) {
  this.desiredOperatorType = options.desiredOperatorType;
  this.desiredDepth = options.desiredDepth;
}

NodeGenerator.prototype = {
  generate: function() {
    var level = 0;
    var a = NodeGenerator.newRandomNumber(2, 5);
    if (this.desiredDepth == 0) {
      return a;
    }
    while (level < this.desiredDepth) {
      var op = this.generateOperator(level + 1);
      var randomDepth = pickRandomInteger(0, level);
      var g = this.makeChildGenerator(op, randomDepth);
      var b = g.generate();
      if (Math.random() < 0.5) {
        op.left = a;
        op.right = b;
      } else {
        op.left = b;
        op.right = a;
      }
      a = op;
      level = level + 1;
    }
    return a;
  },

  generateOperator: function(level) {
    var operatorType;

    if (isOdd(level)) {
      if (isOdd(this.desiredDepth)) {
        operatorType = this.desiredOperatorType;
      } else {
        operatorType = NodeGenerator.oppositeOperator(this.desiredOperatorType);
      }
    } else { // Even level
      if (isEven(this.desiredDepth)) {
        operatorType = this.desiredOperatorType;
      } else {
        operatorType = NodeGenerator.oppositeOperator(this.desiredOperatorType);
      }
    }
    return NodeGenerator.newOperator(operatorType);
  },

  makeChildGenerator: function(parent, desiredDepth) {
    var childOperatorType = NodeGenerator.oppositeOperator(parent.value);
    var childGenerator = new NodeGenerator({
      desiredOperatorType: childOperatorType,
      desiredDepth: desiredDepth
    });

    return childGenerator;
  }
};

NodeGenerator.newRandomNumber = function(low, high) {
  var randomInteger = pickRandomInteger(low, high);
  return new Node({
    id: ++lastNodeId,
    type: "number", 
    value: randomInteger
  });
};

NodeGenerator.newOperator = function(value) {
  return new Node({
    id: ++lastNodeId,
    type: "operator",
    value: value
  });
};

function pickRandomInteger(low, high) {
  var r = Math.random() * (high - low + 1);
  var randomInteger = low + Math.floor(r);

  return randomInteger;
}

NodeGenerator.oppositeOperator = function(operatorType) {
  if (operatorType == "+") {
    return "*";
  } else if (operatorType == '*') {
    return '+';
  } else {
    console.log("Cannot get opposite operator for type %s", operatorType);
  }
}

function isOdd(number) {
  return (number % 2 == 0) ? false : true;
}

function isEven(number) {
  return !isOdd(number);
}
