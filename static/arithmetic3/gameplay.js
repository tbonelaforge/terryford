// Gameplay state

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

node2.left = node1;
node2.right = node3;
node6.left = node5;
node6.right = node7;
node4.left = node2;
node4.right = node6;
node8.left = node4;
node8.right = node9;

var controller;

// Gameplay methods:
function handleFinalAnswer() {
  $('#check-mark').css({visibility: "visible"});
  $('#next-button').show();
  $('#next-button').focus();
}

function attachClickHandlers() {
  $('#next-button').click(function(event) {
    event.stopPropagation();
    var newExercise = generateNewExercise();
    controller.root = newExercise;
    controller.initializeTargets();
    controller.updateView();
    $('#check-mark').css({visibility: "hidden"});
    $('#next-button').hide();
  });
}

controller = new Controller({
  root: node8,
  finalAnswerCallback: function() {
    handleFinalAnswer();
  }
});

controller.initializeTargets();


/* Generate the view (including flashing cursor + focus) from the viewNod
es...*/



controller.updateView();

attachClickHandlers();




