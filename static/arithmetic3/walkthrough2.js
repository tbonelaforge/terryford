var controller;
var exercise;
var tour;


function hideTitle() {
  $('#title').hide();
}

function hidePlayButton() {
  $('#play').hide();
}

function hidePlayAgainButton() {
  $('#play-again').hide();
}

function hideFeedback() {
  $('#feedback').hide();
}

function handleNextButton() {
  window.location = "/arithmetic";
}

function handleFinalAnswer() {
  $('#check-mark').css({visibility: "visible"});
  $('#next-button').show();
  $('#next-button').focus();
  $('#next-button').click(function() {
    handleNextButton();
  });
}

var newTarget;

function temporaryTabHandler(event) {
  event.stopPropagation();
  event.preventDefault();
  if (event.keyCode == 9) { // Tab
    newTarget = 3;
    hopscotch.endTour();
    $(document).off("keydown", temporaryTabHandler);
  } else {
  }
}

function startWalkthrough() {
  hideTitle();
  hidePlayButton();
  hidePlayAgainButton();
  hideFeedback();
  controller = new Controller({
    root: exercise,
    shouldAttachKeyboardHandlers: false,
    shouldAttachEditorClickHandler: false,
    shouldAttachDocumentClickHandler: false,
    shouldListenForEditorEvents: false,
    shouldFlashCursor: false,
    shouldFocusCurrentTarget: false
  });
  controller.initializeTargets();
  controller.updateView();
  $('.answer').click(function() {
    $(document).off("keydown", temporaryTabHandler);
    hopscotch.endTour();
  });
  $('#3').click(function() {
    newTarget = 3;
    $(document).off("keydown", temporaryTabHandler);
    hopscotch.endTour(); // Will trigger updateView
  });
  $(document).keydown(temporaryTabHandler);
  $('#next-button').click(function() {
    window.location = "arithmetic";
  });
  hopscotch.startTour(tour1);
}

function readyForFinalAnswer() {
  controller.cleanUp();
  controller = new Controller({
    root: controller.root,
    finalAnswerCallback: function() {
      handleFinalAnswer();
    }
  });
  controller.initializeTargets();
  controller.updateView();
}

function subexpressionReplaced() {
  controller.cleanUp();
  controller = new Controller({
    root: controller.root,
    shouldAttachKeyboardHandlers: false,
    shouldAttachEditorClickHandler: false,
    shouldAttachDocumentClickHandler: false,
    shouldListenForEditorEvents: false,
    shouldFlashCursor: false,
    shouldFocusCurrentTarget: false,
    finalAnswerCallback: function() {
      handleFinalAnswer();
    }
  });
  controller.initializeTargets();
  controller.updateView();
  $('.answer').click(function() {
    hopscotch.endTour();
  });
  hopscotch.startTour(tour2, 1);
}

function startPlaying() {
  controller.cleanUp();
  controller = new Controller({
    root: exercise,
    subexpressionReplacedCallback: function() {
      subexpressionReplaced();
    },
    finalAnswerCallback: function() {
      handleFinalAnswer();
    }
  });
  controller.initializeTargets();
  controller.updateView();
  if (newTarget !== undefined && newTarget !== null) {
    controller.showNewTargetById(newTarget);
  }
}

var node1 = new Node({
  id: 1,
  type: "number",
  value: 2
});
var node2 = new Node({
  id: 2,
  type: "number",
  value: 8
});
var node3 = new Node({
  id: 3,
  type: "operator",
  value: "*"
});
node3.left = node1;
node3.right = node2;
node4 = new Node({
  id: 4,
  type: "number",
  value: 7
});
node5 = new Node({
  id: 5,
  type: "operator",
  value: "+"
});
node5.left = node4;
node5.right = node3
node6 = new Node({
  id: 6,
  type: "operator",
  value: "="
});
node7 = new Node({
  id: 7,
  type: "answer",
  value: 23
});
node6.left = node5;
node6.right = node7;

exercise = node6;

var tour1 = {
  id: "walkthrough2",
  steps: [
    {
      title: "Subexpression",
      content: "You can work the exercise step-by-step, by focusing on one operator at a time. Use the Tab key, or just click the operator to start simplifying.",
      target: "3",
      placement: "bottom",
      xOffset: -12
    }
  ],
  showCloseButton: false,
  onEnd: function() {
    $(document).off("keydown", temporaryTabHandler);
    setTimeout(function() {
      startPlaying();
    });
  }
};

var tour2 = {
  id: "walkthrough2b",
  steps: [
    {

    },
    {
      title: "Simplified",
      content: "The part you selected has been simplified. Now the only thing left to do is to enter the final answer!",
      target: ".mq-binary-operator",
      placement: "bottom",
      xOffset: 20
    }
  ],
  showCloseButton: false,
  onEnd: function() {
    readyForFinalAnswer();
  }
}

startWalkthrough();
