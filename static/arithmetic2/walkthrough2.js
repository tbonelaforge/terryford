var node6 = new Node({
  type: "number",
  value: 2
});
node6.id = 6;
var node7 = new Node({
  type: "operator",
  value: "+"
});
node7.id = 7;
var node8 = new Node({
  type: "number",
  value: 3
});
node8.id = 8;
var node9 = new Node({
  type: "operator",
  value: "*"
});
node9.id = 9;
var node10 = new Node({
  type: "number",
  value: 5
});
node10.id = 10;
node9.left = node8;
node9.right = node10;
node7.left = node6;
node7.right = node9;
NodeScanner.setStates(node7);

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
    } else if (event.keyCode == 8) { // Backspace
      event.preventDefault(); // Prevent firefox from navigating back.
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
    } else if (event.charCode >= 48 && event.charCode <= 57) { // Firefox digit 0-9
      var digit = event.charCode - 48;
      numberEditor.handleDigitInsert(digit);
    } else if (event.keyCode == 13) { // Enter key.
      handleSubmission(numberEditor);
    } else {
      return;
    }
    editorElement.innerHTML = numberEditor.render();
  };
}

var root = node7;
var editorElement = null;
var cursorFlasher = null;
var targetNode = null;
