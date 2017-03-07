// Gameplay state


var controller;
var gameState = {value: 'title-screen'};
var countdown = null;
var timeLeft = 60;
var timeGiven;
var howManyExercisesCorrect = 0;

var DEBUG=false;

// Can be addition, multiplication, basic-expressions, parentheses, 
// mixed-expressions1, mixed-expressions2, or expert
var userId;
var difficulty;

var levelNames = [
  'basic-expressions',
  'parentheses',
  'mixed-expressions1',
  'mixed-expressions2',
  'expert'
];


var difficulties = {
  'basic-expressions-button': 'basic-expressions',
  'parentheses-button': 'parentheses',
  'mixed-expressions1-button': 'mixed-expressions1',
  'mixed-expressions2-button': 'mixed-expressions2',
  'expert-button': 'expert'
};

var scales = {
  'basic-expressions': [9, 18, 26],
  'parentheses': [9, 18, 26],
  'mixed-expressions1': [9, 19, 29],
  'mixed-expressions2': [9, 19, 29],
  'expert': [5, 9, 12]
};

var levelsCompleted = {
  'basic-expressions': false,
  'parentheses': false,
  'mixed-expressions1': false,
  'mixed-expressions2': false,
  'expert': false
};

var newlyCompleted = null;

var highScores;

function initializeLevelsCompleted() {
  var rawCookie = util.getCookie('arithmetic');
  var levelState = null;
  var parsed = parseArithmeticCookie(rawCookie);
  if (parsed) {
    userId = parsed.userId;
    levelState = parsed.levelsCompleted;
  }
  if (!levelState) {
    return;
  }
  for (var i = 0; i < levelNames.length; i++) {
    var levelName = levelNames[i];
    levelsCompleted[levelName] = levelState[levelName];
  }
}

function writeArithmeticCookie() {
  var uid = (userId) ? userId : 0;
  var levelState = "";

  for (var i = 0; i < levelNames.length; i++) {
    var levelName = levelNames[i];
    levelState += (levelsCompleted[levelName]) ? 't' : 'f';
  }
  return uid + levelState;
}

function parseArithmeticCookie(rawCookie) {
  var matches = rawCookie.match(/^(\d+)([^\d]+)$/);

  if (matches) {
      return {
        userId: matches[1],
        levelsCompleted: parseLevelsCompleted(matches[2])
      }
  } else {
    return null;
  } 
}

function parseLevelsCompleted(levelsCompletedString) {
  var parsed = {};

  for (var i = 0; i < levelNames.length; i++) {
    var c = levelsCompletedString[i];
    if (c == 't') {
      parsed[levelNames[i]] = true;
    } else {
      parsed[levelNames[i]] = false;
    }
  }
  return parsed;
}

// Gameplay methods:
function handleFinalAnswer() {
  $('#check-mark').css({visibility: "visible"});
  $('#next-button').show();
  $('#next-button').focus();
  howManyExercisesCorrect += 1;
  updateTally();
}

function handlePlayClick(event) {
  event.stopPropagation();
  gameState.value = 'selecting-level';
  howManyExercisesCorrect = 0;
  updateView();
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
    handlePlayClick(event);
  });
  $('#play-again-button').click(function(event) {
    handlePlayClick(event);
  });
  $('#walkthrough-button').click(function(event) {
    event.stopPropagation();
    window.location = "arithmetic/walkthrough";
  });
  $('.level-button').click(function(event) {
    util.stopPropagation(event);
    var levelButtonId = event.target.getAttribute('id');
    difficulty = difficulties[levelButtonId];
    gameState.value = 'playing-game';
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
  if (levelsCompleted['mixed-expressions2']) {
    $('#unlock-instructions').hide();
  }
}

function hideLevels() {
  $('#level-container').hide();
}

function showHighScores() {
  $('#high-scores').show();
}

function hideHighScores() {
  $('#high-scores').hide();
}

function colorLevelButtons() {
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
    } else if (true || levelsCompleted['addition'] && levelsCompleted['multiplication']) {
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
    } else if (true || levelsCompleted['addition'] && levelsCompleted['multiplication']) {
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
  $('#basic-expressions-button').removeAttr('disabled');
  $('#parentheses-button').removeAttr('disabled');
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
    + ((howManyExercisesCorrect > 1) ? "s" : "") + " in " + timeGiven + ".";

  return text;
}

function recordLevelCompleted() {
  if (!levelsCompleted[difficulty]) {
    newlyCompleted = difficulty;
  }
  levelsCompleted[difficulty] = true;
  document.cookie = 'arithmetic=' + writeArithmeticCookie();
}

function getFeedback() {
  var p = howManyExercisesCorrect;

  if (p >= 1 && p <= scales[difficulty][0]) {
    return ["You can do mental arithmetic!", "You need " + (scales[difficulty][0] + 1) + " exercises in " + timeGiven + " to pass this level..."];
  } else if (p >= scales[difficulty][0] + 1 && p <= scales[difficulty][1]) {
    recordLevelCompleted();
    return ["You are pretty good!", "Try the next level?"];
  } else if (p >= scales[difficulty][1] + 1 && p <= scales[difficulty][2]) {
    recordLevelCompleted();
    return ["You are a star!", "Try the next level?"];
  } else {
    recordLevelCompleted();
    return ["You are a master!", "Try the next level?"];
  }
}

function showFeedback(responseData) {
  $('#feedback').show();
  if (howManyExercisesCorrect) {
    var feedbackStatsText = getFeedbackStats();
    var feedback = getFeedback();
    if (responseData.isNewHighScore) {
      feedback[0] = "You achieved a new high score!";
    }
    $('#feedback-stats').text(feedbackStatsText);
    $('#feedback-stats').show();
    $('#feedback-cheer').text(feedback[0]);
    $('#feedback-cheer').show();
    if (difficulty == 'expert' && feedback[1].match(/next/)) {
      $('#feedback-instructions').text("");
    } else {
      $('#feedback-instructions').text(feedback[1]);
      $('#feedback-instructions').show();
    }
  } else {
    $('#feedback-stats').text("");
    $('#feedback-cheer').text("");
    $('#feedback-instructions').text("");
  }
}

function hideFeedback() {
  $('#feedback').hide();
  $('#check-mark').css({visibility: "hidden"});
}

function showCountdown() {
  $('#countdown').show();
}

function hideCountdown() {
  $('#countdown').hide();
}

function showTally() {
  $('#tally').show();
}

function hideTally() {
  $('#tally').hide();
}

function giveFeedback(responseData) {
  updateView(responseData);
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
      gameState.value = "feedback";
      stopCountdown();
      recordScore(function(responseData) {
        giveFeedback(responseData);
      });
    }
    updateCountdownText();
  }, 1000);
}

function recordScore(callback) {
/*
  if (!userId || !howManyExercisesCorrect) {
    return callback();
  }
*/
  if (!userId) {
    renderLevelHeader();
    return callback();
  }
  $.ajax({
    type: "POST",
    url: '/arithmetic/scores/' + userId,
    data: JSON.stringify({score: howManyExercisesCorrect, level: difficulty}),
    contentType: 'application/json; charset=utf-8',
    dataType: "json",
    success: function(responseData) {
      highScores = responseData['highScores'];
      responseData.isNewHighScore = renderHighScores(responseData['newScore']);
      callback(responseData);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      callback();
    },

  });
}

function getLevelHeaderText() {
  if (difficulty == 'basic-expressions') {
    return "Basic Expressions"
  } else if (difficulty == 'parentheses') {
    return "Parentheses";
  } else if (difficulty == 'mixed-expressions1') {
    return "Mixed Expressions 1";
  } else if (difficulty == 'mixed-expressions2') {
    return "Mixed Expressions 2";
  } else if (difficulty == 'expert') {
    return "Expert";
  } else {
    return difficulty;
  }
}

function renderLevelHeader() {
  var levelHeaderText = getLevelHeaderText();
  $('#level-header').text(levelHeaderText);
}

function renderHighScores(newScore) {
  if (!newScore) {
    newScore = {};
  }
  var isNewHighScore = false;
  renderLevelHeader();
  var tableElement = $('#high-scores-table');
  tableElement.empty();
  for (var i = 0; i < highScores.length; i++) {
    var highScore = highScores[i];
    var tableRow = $('<tr id="high-score"' + (i + 1) + '></tr>');
    var usernameCell = $('<td class="username"></td>');
    var scoreCell = $('<td class="score"></td>');
    if (highScore['scoreId'] == newScore['id']) {
      isNewHighScore = true;
      usernameCell.append($('<input id="enter-username" type="text" placeholder="YOUR NAME HERE"><button id="submit-username" onClick="submitUsername()">SUBMIT</button>'));
      scoreCell.text(highScore['score']);
    } else {
      usernameCell.text(highScore['username']);
      scoreCell.text(highScore['score']);
    }
    tableRow.append(usernameCell);
    tableRow.append(scoreCell);
    tableElement.append(tableRow);
  }
  return isNewHighScore;
}

function submitUsername() {
  var username = $('#enter-username').val();

  if (!username.length) {
    renderHighScores();
  }
  $.ajax({
    type: "POST",
    url: '/arithmetic/username/' + userId,
    data: JSON.stringify({username: username}),
    contentType: 'application/json; charset=utf-8',
    dataType: "json",
    success: function(responseData) {
      replaceUsername(responseData['user']['id'], responseData['user']['username']);
      renderHighScores();
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("There was an error submitting the username:\n");
      console.log(jqXHR, textStatus, errorThrown);
      renderHighScores();
    }
  });
}

function replaceUsername(userId, username) {
  for (var i = 0; i < highScores.length; i++) {
    var highScore = highScores[i];
    if (highScore['userId'] == userId) {
      highScore['username'] = username;
    }
  }
}

function updateCountdownText() {
  var countdownDiv = $('#countdown');
  
  countdownDiv.text("0:" + padLeftZeros(timeLeft));
}

function updateTally() {
  var tallyDiv = $('#tally');
  var threshold = scales[difficulty][0] + 1;
  var tallyText = howManyExercisesCorrect + " / " + threshold;

  tallyDiv.text(tallyText);
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

function updateView(responseData) {
  if (gameState.value == "title-screen") {
    $('body').attr("class", "game-title-background");
    hideGame();
    showTitle();
    showPlayButton();
    showWalkthroughButton();
    hidePlayAgainButton();
    hideLevels();
    hideHighScores();
  } else if (gameState.value == "selecting-level") {
    $('body').attr("class", "level-select-background");
    hideGame();
    hideTitle();
    hidePlayButton();
    hideWalkthroughButton();
    hidePlayAgainButton();
    hideFeedback();
    hideCountdown();
    hideTally();
    showLevels();
    hideHighScores();
  } else if (gameState.value == "playing-game") {
    $('body').attr("class", "clickable");
    showGame();
    hideTitle();
    hidePlayButton();
    hidePlayAgainButton();
    hideWalkthroughButton();
    hideFeedback();
    hideLevels();
    hideHighScores();
    showTally();
    showCountdown();
    controller.root = generateNewExercise(difficulty);
    controller.initializeTargets();
    controller.updateView();
    startCountdown();
    updateTally();
  } else if (gameState.value == "feedback") {
    $('#honey-pot').blur();
    $('body').attr("class", "level-select-background");
    controller.removeHint();
    controller.detachDocumentClickHandler();
    hideTitle();
    hideGame();
    showFeedback(responseData);
    if ($('#feedback-instructions').text().match(/next/)) {
      hidePlayAgainButton();
      showPlayButton();
    } else {
      hidePlayButton();
      showPlayAgainButton();
    }
    showWalkthroughButton();
    showHighScores();
    hideLevels();
    hideTally();
    hideCountdown();
  }
}


controller = new Controller({
  root: generateNewExercise(),
  honeypotElement: $('#honey-pot'),
  gameState: gameState,
  finalAnswerCallback: function() {
    handleFinalAnswer();
  }
});


attachClickHandlers();
initializeLevelsCompleted();
updateView();

