
function debugExercise() {
  var node1 = new Node({
    id: 1,
    type: "number",
    value: 3
  });
  var node2 = new Node({
    id: 2,
    type: "operator",
    value: "*"
  });
  var node3 = new Node({
    id: 3,
    type: "number",
    value: 1
  });
  var node4 = new Node({
    id: 4,
    type: "operator",
    value: "+"
  });
  var node5 = new Node({
    id: 5,
    type: "number",
    value: 2
  });
  node4.left = node3;
  node4.right = node5;
  node2.left = node1;
  node2.right = node4;
  node6 = new Node({
    id: 6,
    type: "operator",
    value: "="
  });
  node7 = new Node({
    id: 7,
    type: "answer",
    value: 9
  });
  node6.left = node2;
  node6.right = node7;
  return node6;
}

function generateNewExercise() {
  var difficulty = 'basic-expressions';
  if (arguments.length) {
    difficulty = arguments[0];
  }
//  return debugExercise();
  if (difficulty == 'addition') {
    return generateAdditionExercise();
  } else if (difficulty == 'multiplication') {
    return generateMultiplicationExercise();
  } else if (difficulty == 'basic-expressions') {
    return generateBasicExercise();
  } else if (difficulty == 'parentheses') {
    return generateParenthesesExercise();
  } else if (difficulty == 'mixed-expressions1') {
    return generateMixedExercise1();
  } else if (difficulty == 'mixed-expressions2') {
    return generateMixedExercise2();
  } else if (difficulty == 'expert') {
    return generateExpertExercise();
  } else {
    console.log("Can not generate exercise: unrecognized difficulty: %s", difficulty);
  }
}

function generateAdditionExercise() {
  var node1 = NodeGenerator.newRandomNumber(2, 9);
  var node2 = NodeGenerator.newRandomNumber(2, 9);
  var plusNode = NodeGenerator.newOperator("+");
  
  plusNode.left = node1;
  plusNode.right = node2;
  return createExercise(plusNode);
}

function generateMultiplicationExercise() {
  var node1 = NodeGenerator.newRandomNumber(2, 9);
  var node2 = NodeGenerator.newRandomNumber(2, 9);
  var timesNode = NodeGenerator.newOperator("*");
  
  timesNode.left = node1;
  timesNode.right = node2;
  return createExercise(timesNode);
}

function generateBasicExercise() {
  var node1 = NodeGenerator.newRandomNumber(2, 5);
  var timesNode = NodeGenerator.newOperator('*');
  var node3 = NodeGenerator.newRandomNumber(2, 5);  
  var node4 = NodeGenerator.newRandomNumber(1, 9);
  var plusNode = NodeGenerator.newOperator('+');
  timesNode.left = node1;
  timesNode.right = node3;
  if (Math.random() < 0.5) {
    plusNode.left = timesNode;
    plusNode.right = node4;
  } else {
    plusNode.left = node4;
    plusNode.right = timesNode;
  }
  return createExercise(plusNode);
}

function generateParenthesesExercise() {
  var number1 = NodeGenerator.newRandomNumber(2, 5);
  var number2 = NodeGenerator.newRandomNumber(2, 5);
  var number3 = NodeGenerator.newRandomNumber(2, 5);
  var plusNode = NodeGenerator.newOperator("+");
  plusNode.left = number1;
  plusNode.right = number2;
  var timesNode = NodeGenerator.newOperator("*");
  if (Math.random() < 0.5) { // Use "+<*"
    timesNode.left = plusNode;
    timesNode.right = number3;
  } else { // Use "*>+"
    timesNode.left = number3;
    timesNode.right = plusNode;
  }
  return createExercise(timesNode);
}

function generateMixedExercise1() {
  if (Math.random() < 0.5) {
    return generateBasicExercise();
  } else {
    return generateParenthesesExercise();
  }
}

function generateMixedExercise2() {
  var operatorType = Math.random() < 0.5 ? "*" : "+";
  var g = new NodeGenerator({
    desiredOperatorType: operatorType,
    desiredDepth: 2
  });
  var mixedExpression = g.generate();

  return createExercise(mixedExpression);
}

function generateExpertExercise() {
  var operatorType = Math.random() < 0.5 ? "*" : "+";
  var g = new NodeGenerator({
    desiredOperatorType: operatorType,
    desiredDepth: 3
  });
  var expertExpression = g.generate();

  return createExercise(expertExpression);
}


function createExercise(expressionNode) {
  var value = expressionNode.evaluate();
  var answerNode = new Node({
    type: "answer",
    state: "editing",
    value: value
  });
  var exerciseNode = NodeGenerator.newOperator('=');

  exerciseNode.left = expressionNode;
  exerciseNode.right = answerNode;
  return exerciseNode;
}
