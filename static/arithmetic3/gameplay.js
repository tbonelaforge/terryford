// Gameplay state


var controller;
var gameState = 'title-screen';
var countdown = null;
var timeLeft = 60;
var timeGiven;
var howManyExercisesCorrect = 0;

var DEBUG=false;

// Can be addition, multiplication, basic-expressions, parentheses, 
// mixed-expressions1, mixed-expressions2, or expert
var difficulty;

var difficulties = {
  'addition-button': 'addition',
  'multiplication-button': 'multiplication',
  'basic-expressions-button': 'basic-expressions',
  'parentheses-button': 'parentheses',
  'mixed-expressions1-button': 'mixed-expressions1',
  'mixed-expressions2-button': 'mixed-expressions2',
  'expert-button': 'expert'
};

var scales = {
  'addition': [10, 20, 29],
  'multiplication': [10, 20, 29],
  'basic-expressions': [10, 20, 29],
  'parentheses': [10, 20, 29],
  'mixed-expressions1': [10, 20, 29],
  'mixed-expressions2': [9, 18, 25],
  'expert': [8, 16, 23]
};

var levelsCompleted = {
  'addition': false,
  'multiplication': false,
  'basic-expressions': false,
  'parentheses': false,
  'mixed-expressions1': false,
  'mixed-expressions2': false,
  'expert': false
};

var newlyCompleted = null;

function initializeLevelsCompleted() {
  var highestLevelCompleted = util.getCookie('arithmetic');
  if (highestLevelCompleted == 'none' || !highestLevelCompleted) {
    return;
  }
  var levelNames = [
    'addition',
    'multiplication',
    'basic-expressions',
    'parentheses',
    'mixed-expressions1',
    'mixed-expressions2',
    'expert'
  ];
  var completed = true;
  for (var i = 0; i < levelNames.length; i++) {
    levelsCompleted[levelNames[i]] = completed;
    if (levelNames[i] == highestLevelCompleted) {
      completed = false;
    }
  }
}

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
    var newExercise = generateNewExercise(difficulty);
    controller.root = newExercise;
    controller.initializeTargets();
    controller.updateView();
    $('#check-mark').css({visibility: "hidden"});
    $('#next-button').hide();
  });
  $('#play-button').click(function(event) {
    event.stopPropagation();
    gameState = 'selecting-level';
    updateView();
  });
  $('#play-again-button').click(function(event) {
    event.stopPropagation();
    gameState = 'selecting-level';
    howManyExercisesCorrect = 0;
    updateView();
  });
  $('#walkthrough-button').click(function(event) {
    event.stopPropagation();
    window.location = "walkthrough/1";
  });
  $('.level-button').click(function(event) {
    util.stopPropagation(event);
    console.log("Inside the level-button click handler, got called with event...\n");
    console.log(event);
    console.log("The id of the button is:\n");
    console.log(event.target.getAttribute('id'));
    var levelButtonId = event.target.getAttribute('id');
    difficulty = difficulties[levelButtonId];
    console.log("Just set the difficulty to %s", difficulty);
    gameState = 'playing-game';
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

function showWalkthroughButton() {
  $('#walkthrough').show();
}

function hideWalkthroughButton() {
  $('#walkthrough').hide();
}

function showLevels() {
  $('#level-container').show();
  colorLevelButtons();
  unlockLevels();
}

function hideLevels() {
  $('#level-container').hide();
}

function colorLevelButtons() {
  colorLevelButton('addition');
  colorLevelButton('multiplication');
  colorLevelButton('basic-expressions');
  colorLevelButton('parentheses');
  colorLevelButton('mixed-expressions1');
  colorLevelButton('mixed-expressions2');
  colorLevelButton('expert');
  newlyCompleted = null;
}

function colorLevelButton(buttonType) {
  var selector = '#' + buttonType + '-button';
  var levelButtonClass = computeLevelButtonClass(buttonType);
  var classList = ['big-button-font', 'level-button'];
  
  if (levelButtonClass) {
    classList.push(levelButtonClass);
  }
  $(selector).removeClass();
  for (var i = 0; i < classList.length; i++) {
    $(selector).addClass(classList[i]);
  }
}

function computeLevelButtonClass(buttonType) {
  if (buttonType == 'addition') {
    if (levelsCompleted['addition']) {
      if (newlyCompleted == 'addition') {
        return 'newly-completed-level';
      } else {
        return 'completed-level';
      }
    } else {
      return 'available-level';
    }
  } else if (buttonType == 'multiplication') {
    if (levelsCompleted['multiplication']) {
      if (newlyCompleted == 'multiplication') {
        return 'newly-completed-level';
      } else {
        return 'completed-level';
      }
    } else {
      return 'available-level';
    }
  } else if (buttonType == 'basic-expressions') {
    if (levelsCompleted['basic-expressions']) {
      if (newlyCompleted == 'basic-expressions') {
        return 'newly-completed-level';
      } else {
        return 'completed-level';
      }
    } else if (levelsCompleted['addition'] && levelsCompleted['multiplication']) {
      return 'available-level';
    } else {
      return null;
    }
  } else if (buttonType == 'parentheses') {
    if (levelsCompleted['parentheses']) {
      if (newlyCompleted == 'parentheses') {
        return 'newly-completed-level';
      } else {
        return 'completed-level';
      }
    } else if (levelsCompleted['addition'] && levelsCompleted['multiplication']) {
      return 'available-level';
    } else {
      return null;
    }
  } else if (buttonType == 'mixed-expressions1') {
    if (levelsCompleted['mixed-expressions1']) {
      if (newlyCompleted == 'mixed-expressions1') {
        return 'newly-completed-level';
      } else {
        return 'completed-level';        
      }
    } else if (levelsCompleted['basic-expressions'] && levelsCompleted['parentheses']) {
      return 'available-level';
    } else {
      return null;
    }
  } else if (buttonType == 'mixed-expressions2') {
    if (levelsCompleted['mixed-expressions2']) {
      if (newlyCompleted == 'mixed-expressions2') {
        return 'newly-completed-level';
      } else {
        return 'completed-level';
      }
    } else if (levelsCompleted['mixed-expressions1']) {
      return 'available-level';
    } else {
      return null;
    }
  } else if (buttonType == 'expert') {
    if (levelsCompleted['expert']) {
      if (newlyCompleted == 'expert') {
        return 'newly-completed-level';
      } else {
        return 'completed-level';
      }
    } else if (levelsCompleted['mixed-expressions2']) {
      return 'available-level';
    } else {
      return null;
    }
  }
}

function unlockLevels() {
  $('#addition-button').removeAttr('disabled');
  $('#multiplication-button').removeAttr('disabled');
  if (levelsCompleted['addition'] && levelsCompleted['multiplication']) {
    $('#basic-expressions-button').removeAttr('disabled');
    $('#parentheses-button').removeAttr('disabled');
  } else {
    $('#basic-expressions-button').attr('disabled', 'disabled');
    $('#parentheses-button').attr('disabled', 'disabled');
  }
  if (levelsCompleted['basic-expressions'] && levelsCompleted['parentheses']) {
    $('#mixed-expressions1-button').removeAttr('disabled');
  } else {
    $('#mixed-expressions1-button').attr('disabled', 'disabled');
  }
  if (levelsCompleted['mixed-expressions1']) {
    $('#mixed-expressions2-button').removeAttr('disabled');
  } else {
    $('#mixed-expressions2-button').attr('disabled', 'disabled');
  }
  if (levelsCompleted['mixed-expressions2']) {
    $('#expert-button').removeAttr('disabled');
  } else {
    $('#expert-button').attr('disabled', 'disabled');
  }
}

function getFeedbackStats() {
  var text = "You completed " + howManyExercisesCorrect + " exercise" 
    + ((howManyExercisesCorrect > 1) ? "s" : "") + " in " + timeGiven;

  return text;
}

function getFeedback() {
  var p = howManyExercisesCorrect;

  if (p >= 1 && p <= scales[difficulty][0]) {
    return ["You can do mental arithmetic!", "You need " + scales[difficulty][1] + " exercises in " + timeGiven + " to pass this level..."];
  } else if (p >= scales[difficulty][0] + 1 && p <= scales[difficulty][1]) {
    return ["You are pretty good!", "You need " + scales[difficulty][1] + " exercises in " + timeGiven + " to pass this level..."];
  } else if (p >= scales[difficulty][1] + 1 && p <= scales[difficulty][2]) {
    levelsCompleted[difficulty] = true;
    document.cookie = 'arithmetic=' + difficulty;
    newlyCompleted = difficulty;
    return ["You are a star!", "Try the next level?"];
  } else {
    levelsCompleted[difficulty] = true;
    document.cookie = 'arithmetic=' + difficulty;
    newlyCompleted = difficulty;
    return ["You are a master!", "Try the next level?"];
  }
}

function showFeedback() {
  $('#feedback').show();
  if (howManyExercisesCorrect) {
    var feedbackStatsText = getFeedbackStats();
    var feedback = getFeedback();
    $('#feedback-stats').text(feedbackStatsText);
    $('#feedback-stats').show();
    $('#feedback-cheer').text(feedback[0]);
    $('#feedback-cheer').show();
    $('#feedback-instructions').text(feedback[1]);
    $('#feedback-instructions').show();
  }
}

function hideFeedback() {
  $('#feedback').hide();
  $('#check-mark').hide();
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
  if (difficulty == 'addition') {
    timeLeft = 30;
    timeGiven = "30 seconds";
  } else if (difficulty == 'multiplication') {
    timeLeft = 45;
    timeGiven = "45 seconds";
  } else {
    timeLeft = 60;
    timeGiven = "1 minute";
  }
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
    hideLevels();
  } else if (gameState == "selecting-level") {
    hideGame();
    hideTitle();
    hidePlayButton();
    hideWalkthroughButton();
    hidePlayAgainButton();
    hideFeedback();
    showLevels();
  } else if (gameState == "playing-game") {
    showGame();
    hideTitle();
    hidePlayButton();
    hidePlayAgainButton();
    hideWalkthroughButton();
    hideFeedback();
    hideLevels();
    controller.root = generateNewExercise(difficulty);
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
    hideLevels();
  }
}


controller = new Controller({
  root: generateNewExercise(),
  finalAnswerCallback: function() {
    handleFinalAnswer();
  }
});


attachClickHandlers();
initializeLevelsCompleted();
updateView();

