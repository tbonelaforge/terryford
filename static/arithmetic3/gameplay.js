// Gameplay state


var controller;
var gameState = 'title-screen';
var countdown = null;
var timeLeft = 60;
var howManyExercisesCorrect = 0;

var DEBUG=false;

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
  $('#play-button').click(function(event) {
    event.stopPropagation();
    gameState = 'playing-game';
    updateView();
  });
  $('#play-again-button').click(function(event) {
    event.stopPropagation();
    gameState = 'playing-game';
    howManyExercisesCorrect = 0;
    updateView();
  });
  $('#walkthrough-button').click(function(event) {
    event.stopPropagation();
    window.location = "walkthrough/1";
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

function showWalkthroughButton() {
  $('#walkthrough').show();
}

function hideWalkthroughButton() {
  $('#walkthrough').hide();
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
    if (!DEBUG) {
      timeLeft -= 1;
    }
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
    showWalkthroughButton();
    hidePlayAgainButton();
  } else if (gameState == "playing-game") {
    showGame();
    hideTitle();
    hidePlayButton();
    hidePlayAgainButton();
    hideWalkthroughButton();
    hideFeedback();
    controller.root = generateNewExercise();
    controller.initializeTargets();
    controller.updateView();
    startCountdown();
  } else if (gameState == "feedback") {
    controller.removeHint();
    controller.detachDocumentClickHandler();
    showTitle();
    hideGame();
    showFeedback();
    hidePlayButton();
    showPlayAgainButton();
    showWalkthroughButton();
  }
}


controller = new Controller({
  root: generateNewExercise(),
  finalAnswerCallback: function() {
    handleFinalAnswer();
  }
});


attachClickHandlers();
updateView();
