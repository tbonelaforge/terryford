
var node1 = new Node({
  type: "operator",
  value: '+'
});
node1.id = 1;
var node4 = new Node({
  type: "number",
  value: 2
});
node4.id = 4;
var node5 = new Node({
  type: "operator",
  value: '*'
});
node5.id = 5;
var node6 = new Node({
  type: "number",
  value: 3
});
node6.id = 6;
var node7 = new Node({
  type: "number",
  value: 5
});
node7.id = 7;
var node2 = new Node({
  type: "operator",
  value: "="
});
node1.left = node4;
node1.right = node5;
node5.left = node6;
node5.right = node7;
node2.id = 2;
var node3 = new Node({
  type: "answer",
  value: "1"
});
node3.id = 3;
node2.left = node1;
node2.right = node3;
//node3.state = 'editing';

var DEBUG = true;
var container = document.getElementById("math-container");
var controller = new Controller({
//  root: generateNewExpression(),
  root: node2,
  container: container
});
var countdown = null;
var timeLeft = 60;
var howManyExercisesCorrect = 0;

controller.correctCallback = function correctCallback() {
  if (controller.root.type == "number") {
    $('#next-button').show();
    $('#next-button').focus();
    howManyExercisesCorrect += 1;
  }
};

controller.correctAnswerCallback = function() {
  console.log("This is where we should make the green check mark show, and the next button...\n");
  $('#next-button').show();
  $('#next-button').focus();
  $('#check-mark').css({visibility: "visible"});
  howManyExercisesCorrect += 1;
};

function resetTimeLeft() {
  timeLeft = 60;
}

function padLeftZeros(number) {
  var padding = "";

  if (number < 10) {
    padding = "0";
  }
  return padding + number;
}

function updateCountdownText() {
  var countdownDiv = $('#countdown');
  
  countdownDiv.text("0:" + padLeftZeros(timeLeft));
}

function stopCountdown() {
  clearInterval(countdown);
  countdown = null;
}

function startCountdown() {
  if (countdown != null) {
    stopCountdown();
  }
  resetTimeLeft();
  updateCountdownText();
  countdown = setInterval(function() {
    if (!DEBUG) {
      timeLeft -= 1;
    }
    if (timeLeft < 0) {
      stopCountdown();
      giveFeedback();
    }
    updateCountdownText();
  }, 1000);
}

// allow clicking out of editable area to go back to static display

document.addEventListener('click', function(e) {
  console.log("Inside the document event listener, got called with e:\n");
  console.log(e);
  console.log("ABout to stop propagation of the event...");
  e.stopPropagation();
  controller.resetDisplay();
  controller.startEditing(controller.answerNode);
}, false);


$('#next-button').click(function() {
//  controller.root = generateNewExpression();
  var newExercise = generateNewExercise();
  controller.setRoot(newExercise);
  controller.resetDisplay();
  $('#next-button').hide();
  $('#check-mark').css({visibility: "hidden"});
  controller.startEditing(controller.root.right);
});

$('#play-again').click(function() {
  startGame();
});

$('#play').click(function() {
  startGame();
});

$('#quit').click(function() {
  window.location = "/";
});
1
$('#walkthrough').click(function() {
  window.location = "/walkthrough/1";
});

function showFeedback() {
  if (howManyExercisesCorrect) {
    $('#feedback-stats').text("You completed " + howManyExercisesCorrect + " exercises in 1 minute.");
    $('#feedback-stats').show();
    var feedbackCheer = computeFeedbackCheer(howManyExercisesCorrect);
    
    $('#feedback-cheer').text(feedbackCheer);
    $('#feedback-cheer').show();
    $('#play-again').show();
    $('#walkthrough').show();
    $('#quit').show();
  } else {
    $('#feedback-stats').hide();
    $('#feedback-cheer').hide();
    $('#play-again').hide();
    $('#play').show();
    $('#walkthrough').show();
    $('#quit').show();
  }
  $('#feedback').show();
}

function computeFeedbackCheer(howManyExercisesCorrect) {
  var feedbackCheer = "You can do mental arithmetic.";
  if (howManyExercisesCorrect > 7 && howManyExercisesCorrect <= 14) {
    feedbackCheer = "You are pretty good!";
  } else if (howManyExercisesCorrect > 14 && howManyExercisesCorrect <= 21) {
    feedbackCheer = "You are a star!";
  } else if (howManyExercisesCorrect > 21) {
    feedbackCheer = "You are Ramanujan incarnate!";
  }
  return feedbackCheer;
}

function hideFeedback() {
  $('#feedback').hide();
  $('#play-again').hide();
  $('#play').hide();
  $('#walkthrough').hide();
  $('#quit').hide();
}

function showGame() {
  $('#countdown').show();
  $('#game-container').show();
}

function hideGame() {
  $('#countdown').hide();
  $('#game-container').hide();
}

function giveFeedback() {
  hideGame();
  showFeedback();
}

function startGame() {
//  controller.root = generateNewExpression();
  controller.root = node2;
  howManyExercisesCorrect = 0;
  controller.resetDisplay();
  showGame();
  $('#next-button').hide();
  hideFeedback();
  startCountdown();
  controller.startEditing(node3); // Todo: find the answer node.
}

giveFeedback();
