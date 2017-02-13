function generateNewExercise() {
  var node1 = newRandomNumber(2, 5);
  var node2 = newOperator('*');
  var node3 = newRandomNumber(2, 5);  
  var node4 = newRandomNumber(1, 9);
  var node5 = newOperator('+');
  var node6 = newOperator('=');
  var node7 = new Node({
    type: "answer",
    state: "editing"
  });
  node2.left = node1;
  node2.right = node3;
  if (Math.random() < 0.5) {
    node5.left = node2;
    node5.right = node4;
  } else {
    node5.left = node4;
    node5.right = node2;
  }
  node6.left = node5;
  node6.right = node7;
  console.log("Inside generateNewExpression, about to return new tree:\n");
  console.log(node6);
  return node6;
}

function newRandomNumber(low, high) {
  var r = Math.random() * (high - low + 1);
  var randomInteger = low + Math.floor(r);

  return new Node({
    type: "number", 
    value: randomInteger
  });
}

function newOperator(value) {
  return new Node({
    type: "operator",
    value: value
  });
}
