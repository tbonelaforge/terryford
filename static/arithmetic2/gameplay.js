
var DEBUG = false;
var container = document.getElementById("math-container");
var controller = new Controller({
  root: generateNewExpression(),
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
document.addEventListener('click', function() {
  controller.resetDisplay();
}, false);

$('#next-button').click(function() {
  controller.root = generateNewExpression();
  controller.resetDisplay();
  $('#next-button').hide();
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
  controller.root = generateNewExpression();
  howManyExercisesCorrect = 0;
  controller.resetDisplay();
  showGame();
  $('#next-button').hide();
  hideFeedback();
  startCountdown();
}

giveFeedback();
