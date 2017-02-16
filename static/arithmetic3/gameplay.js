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
var gameState = 'title-screen';
var countdown = null;
var timeLeft = 60;
var howManyExercisesCorrect = 0;

// Gameplay methods:
function handleFinalAnswer() {
  $('#check-mark').css({visibility: "visible"});
  $('#next-button').show();
  $('#next-button').focus();
  howManyExercisesCorrect += 1;
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
  $('#play').click(function(event) {
    gameState = 'playing-game';
    updateView();
  });
  $('#play-again').click(function(event) {
    gameState = 'playing-game';
    howManyExercisesCorrect = 0;
    updateView();
  });
}

function showGame() {
  $('#game-container').show();
}

function hideGame() {
  $('#game-container').hide();
}

function showTitle() {
  $('#title').show();
}

function hideTitle() {
  $('#title').hide();
}

function showPlayButton() {
  $('#play').show();
}

function hidePlayButton() {
  $('#play').hide();
}

function showPlayAgainButton() {
  $('#play-again').show();
}

function hidePlayAgainButton() {
  $('#play-again').hide();
}

function getFeedbackStats() {
  var text = "You completed " + howManyExercisesCorrect + " exercise" 
    + ((howManyExercisesCorrect > 1) ? "s" : "") + " in 1 minute.";

  return text;
}

function getFeedbackCheer() {
  var p = howManyExercisesCorrect;
  if (p >= 1 && p <= 10) { // Range of 10
    return "You can do mental arithmetic!";
  } else if (p >= 11 && p <= 20) { // Range of 9
    return "You are pretty good!";
  } else if (p >= 21 && p <= 29) { // Range of 8
    return "You are a star!";
  } else {
    return "You are Ramanujan incarnate!";
  }
}

function showFeedback() {
  $('#feedback').show();
  if (howManyExercisesCorrect) {
    var feedbackStatsText = getFeedbackStats();
    var feedbackCheerText = getFeedbackCheer();
    $('#feedback-stats').text(feedbackStatsText);
    $('#feedback-stats').show();
    $('#feedback-cheer').text(feedbackCheerText);
    $('#feedback-cheer').show();
  }
}

function hideFeedback() {
  $('#feedback').hide();
}

function giveFeedback() {
  gameState = "feedback"
  updateView();
}

function startCountdown() {
  if (countdown != null) {
    stopCountdown();
  }
  resetTimeLeft();
  updateCountdownText();
  countdown = setInterval(function() {
    timeLeft -= 1;
    if (timeLeft <= 0) {
      stopCountdown();
      giveFeedback();
    }
    updateCountdownText();
  }, 1000);
}

function updateCountdownText() {
  var countdownDiv = $('#countdown');
  
  countdownDiv.text("0:" + padLeftZeros(timeLeft));
}

function stopCountdown() {
  clearInterval(countdown);
  countdown = null;
}

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

function updateView() {
  if (gameState == "title-screen") {
    hideGame();
    showTitle();
    showPlayButton();
    hidePlayAgainButton();
  } else if (gameState == "playing-game") {
    showGame();
    hideTitle();
    hidePlayButton();
    hidePlayAgainButton();
    hideFeedback();
    controller.root = generateNewExercise();
    controller.initializeTargets();
    controller.updateView();
    startCountdown();
  } else if (gameState == "feedback") {
    showTitle();
    hideGame();
    showFeedback();
    hidePlayButton();
    showPlayAgainButton();
  }
}


controller = new Controller({
  root: node8,
  finalAnswerCallback: function() {
    handleFinalAnswer();
  }
});

//


/* Generate the view (including flashing cursor + focus) from the viewNod
es...*/


attachClickHandlers();
updateView();
