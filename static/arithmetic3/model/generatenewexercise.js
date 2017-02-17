var lastNodeId = 0;

function debugExercise() {
  var node1 = new Node({
    id: 1,
    type: "number",
    value: 22
  });
  
  var node2 = new Node({
    id: 2,
    type: "operator",
    value: '*'
  });
  
  var node3 = new Node({
    id: 3,
    type: "number",
    value: 3
  });
  
  var node4 = new Node({
    id: 4,
    type: "operator",
    value: '+'
  });
  
  var node5 = new Node({
    id: 5,
    type: "number",
    value: 4
  });
  
  var node6 = new Node({
    id: 6,
    type: "operator",
    value: '*'
  });
  
  var node7 = new Node({
    id: 7,
    type: "number",
    value: 5
  });
  
  var node8 = new Node({
    id: 8,
    type: "operator",
    value: "="
  });
  
  var node9 = new Node({
    id: 9,
    type: "answer",
    value: 86
  });

  var node10 = new Node({
    id: 10,
    type: "operator",
    value: '*'
  });

  var node11 = new Node({
    id: 11,
    type: "number",
    value: 11
  });
  
  var node12 = new Node({
    id: 12,
    type: "operator",
    value: '+'
  });

  var node13 = new Node({
    id: 13,
    type: "number",
    value: 13
  });

  node12.right = node13;
  node12.left = node10;
  node10.right = node11;
  node10.left = node4;
  node2.left = node1;
  node2.right = node3;
  node6.left = node5;
  node6.right = node7;
  node4.left = node2;
  node4.right = node6;
//  node8.left = node4;
//  node8.left = node10;
  node8.left = node12;
  node8.right = node9;
  return node8;
}

function generateNewExercise() {
  //return debugExercise();

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
