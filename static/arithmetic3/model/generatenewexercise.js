var lastNodeId = 0;

function generateNewExercise() {

  // Build random expression
  var node1 = newRandomNumber(2, 5);
  var node2 = newOperator('*');
  var node3 = newRandomNumber(2, 5);  
  var node4 = newRandomNumber(1, 9);
  var node5 = newOperator('+');
  node2.left = node1;
  node2.right = node3;
  if (Math.random() < 0.5) {
    node5.left = node2;
    node5.right = node4;
  } else {
    node5.left = node4;
    node5.right = node2;
  }

  // Node5 is the expression node.

  // Build answer node
  var value = node5.evaluate();
  var node7 = new Node({
    type: "answer",
    state: "editing",
    value: value
  });
  // Node7 is the answer node.

  // Build equals node
  var node6 = newOperator('=');
  node6.left = node5;
  node6.right = node7;

  // Node6 is the exercise.
  return node6;
}

function newRandomNumber(low, high) {
  var r = Math.random() * (high - low + 1);
  var randomInteger = low + Math.floor(r);

  return new Node({
    id: ++lastNodeId,
    type: "number", 
    value: randomInteger
  });
}

function newOperator(value) {
  return new Node({
    id: ++lastNodeId,
    type: "operator",
    value: value
  });
}
