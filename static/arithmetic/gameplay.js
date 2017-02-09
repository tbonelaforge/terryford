/*
var node6 = new Node({
  type: "number",
  value: 22
});

var node7 = new Node({
  type: "operator",
  value: '+'
});

var node8 = new Node({
  type: "number",
  value: 3
});

var node9 = new Node({
  type: "operator",
  value: '*'
});

var node10 = new Node({
  type: "number",
  value: 55
});
*/

/*
node9.left = node8;
node9.right = node10;
node7.left = node6; // node7 is root
node7.right = node9;
NodeScanner.setStates(node7);
*/

var DEBUG = false;


function findNumberEditor(viewNodes) {
  for (var i = 0; i < viewNodes.length; i++) {
    if (viewNodes[i] instanceof NumberEditor) {
      return viewNodes[i];
    }
  }
  return null;
}

function updateDisplay() {
  var viewNodes = root.toViewNodes();
  var numberEditor = findNumberEditor(viewNodes);
  var view = renderView(viewNodes);
  var container = document.getElementById('math-container');
  container.innerHTML = view;  
  $('.clickable').click(handleOperatorClick);
  return numberEditor;
}

function onKeyUp(numberEditor) {
  return function(event) {
    // Need Shift key
    if (event.keyCode == 16) { // Shift
      numberEditor.handleShiftKeyUp();
    } else {
      return;
    }
  };
}

function onKeyDown(numberEditor) {
  return function(event) {
    // Need Shift, left Arrow, Right Arrow, Delete

    if (event.keyCode == 39) { // ArrowRight
      numberEditor.handleRightArrow();
    } else if (event.keyCode == 37) { // ArrowLeft
      numberEditor.handleLeftArrow();
    } else if (event.keyCode == 16) { // Shift
      numberEditor.handleShiftKeyDown();
    } else if (event.keyCode == 8) {
      numberEditor.handleDelete();
    } else {
      return;
    }
    editorElement.innerHTML = numberEditor.render();
  };
}

function onKeyPress(numberEditor) {
  return function(event) {
    // Need digits 0-9, Enter

    if (event.keyCode >= 48 && event.keyCode <= 57) { // Digit 0-9
      var digit = event.keyCode - 48;
      numberEditor.handleDigitInsert(digit);
    }
    else if (event.keyCode == 13) { // Enter key.
      handleSubmission(numberEditor);
    } else {
      return;
    }
    editorElement.innerHTML = numberEditor.render();
  };
}

// Controller State.
//var root = node7;
var root = generateNewExpression();
var editorElement = null;
var cursorFlasher = null;
var targetNode = null;
var countdown = null;
var timeLeft = 60;
var howManyCorrect = 0;


function flashCursor() {
  if (cursorFlasher != null) {
    clearInterval(cursorFlasher);
    cursorFlasher = null;
  }
  cursorFlasher = setInterval(function() {
    var cursorElement = $('#cursor');
    
      cursorElement.toggleClass('mq-blink');
  }, 500);
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

function startEditing(targetNode) {
  targetNode.state = "editing";
  var numberEditor = updateDisplay();
  flashCursor();
  editorElement = document.getElementById("editor");
  editorElement.addEventListener("keypress", onKeyPress(numberEditor), false);
  editorElement.addEventListener("keydown", onKeyDown(numberEditor), false);
  editorElement.addEventListener("keyup", onKeyUp(numberEditor), false);
  editorElement.focus();
}

function handleOperatorClick(e) {
  e.stopPropagation();
  var id = parseInt(e.target.getAttribute('id'));
  targetNode = NodeScanner.findNodeById(root, id);
  startEditing(targetNode);
}

function resetDisplay() {
  NodeScanner.setStates(root);
  if (cursorFlasher != null) {
    clearInterval(cursorFlasher);
    cursorFlasher = null;
  }
  updateDisplay();
}

function handleClickOutside(e) {
  resetDisplay();
}

function handleSubmission(numberEditor) {
  var submission = numberEditor.parseBuffer();
  if (submission != null) {
    var expected = targetNode.evaluate();
    if (submission == expected) {
      var replacementNode = new Node({
        type: 'number',
        value: submission
      });
      root = NodeScanner.replace(root, targetNode, replacementNode);
      resetDisplay();
      if (root.type == "number") {
        $('#next-button').show();
        $('#next-button').focus();
        howManyCorrect += 1;
      }
      return;
    }
  } else {
    console.log("The submission was not parseable...");
  }
  showHint(targetNode, function() {
    console.log("All done showing hint...\n");
    resetDisplay();
  });
}

function showHint(targetNode, callback) {
  var hintString = targetNode.getHint();
  jAlert(hintString, 'Incorrect', callback);
  var hintPosition = computeHintPosition(targetNode);
  if (hintPosition) {
    $('#popup_container').css({
      top: hintPosition.top + 'px',
      left: hintPosition.left + 'px'
    });
  } else {
    console.log("Unable to compute hint position...\n");
  }
}

function computeHintPosition(targetNode) {
  var editorJQ = $('#editor');
  if (editorJQ.length) {
    var editorPosition = editorJQ.position();
    var editorHeight = editorJQ.height();
    return {
      top: editorPosition.top + editorHeight,
      left: editorPosition.left
    };
  } else {
    console.log("Unable to locate the editor..");
    return null;
  }
}

// allow clicking out of editable area to go back to static display
document.addEventListener('click', handleClickOutside, false);

/* DEBUG */
/*
function displayAlertPosition() {
  alertJQ = $('#popup_container');
  if (alertJQ.length) {
    var alertPosition = alertJQ.position();
    $('#debug').text(
      "top: " + alertPosition.top +
      " left: " + alertPosition.left
    );
  } else {
    $('#debug').text("no alert currently");
  }
}
setInterval(displayAlertPosition, 1000);
*/

$('#next-button').click(function() {
  root = generateNewExpression();
  resetDisplay();
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

function showFeedback() {
  if (howManyCorrect) {
    $('#feedback-stats').text("You completed " + howManyCorrect + " exercises in 1 minute.");
    $('#feedback-stats').show();
    var feedbackCheer = computeFeedbackCheer(howManyCorrect);
    
    $('#feedback-cheer').text(feedbackCheer);
    $('#feedback-cheer').show();
    $('#play-again').show();
    $('#quit').show();
  } else {
    $('#feedback-stats').hide();
    $('#feedback-cheer').hide();
    $('#play-again').hide();
    $('#play').show();
    $('#quit').show();
  }
  $('#feedback').show();
}

function computeFeedbackCheer(howManyCorrect) {
  var feedbackCheer = "You can do mental arithmetic.";
  if (howManyCorrect > 7 && howManyCorrect <= 14) {
    feedbackCheer = "You are pretty good!";
  } else if (howManyCorrect > 14 && howManyCorrect <= 21) {
    feedbackCheer = "You are a star!";
  } else if (howManyCorrect > 21) {
    feedbackCheer = "You are Ramanujan incarnate!";
  }
  return feedbackCheer;
}

function hideFeedback() {
  $('#feedback').hide();
  $('#play-again').hide();
  $('#play').hide();
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
  root = generateNewExpression();
  howManyCorrect = 0;
  resetDisplay();
  showGame();
  $('#next-button').hide();
  hideFeedback();
  startCountdown();
}

giveFeedback();
