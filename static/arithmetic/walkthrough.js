var controller;
var exercise;

var timeLeft = 60;

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
  hideFeedback();
  controller = new Controller({
    root: exercise,
    honeypotElement: $('#honey-pot'),
    shouldAttachKeyboardHandlers: false,
    shouldAttachEditorClickHandler: false,
    shouldAttachDocumentClickHandler: false,
    shouldListenForEditorEvents: false,
    shouldFlashCursor: false,
    shouldFocusCurrentTarget: false
  });
  controller.initializeTargets();
  controller.updateView();
  $('.answer').removeAttr('tabindex');
  $('#3').removeClass('clickable');
  hopscotch.startTour(tour1);
}

function readyForFinalAnswer() {
  controller.cleanUp();
  controller = new Controller({
    root: controller.root,
    honeypotElement: $('#honey-pot'),
    gameState: {
      value: 'playing-game'
    },
    finalAnswerCallback: function() {
      handleFinalAnswer();
    }
  });
  controller.initializeTargets();
  controller.updateView();
}

function subexpressionReplaced() {
  controller.cleanUp();
  $('#honey-pot').blur();
  controller = new Controller({
    root: controller.root,
    honeypotElement: $('#honey-pot'),
    gameState: {
      value: 'playing-game'
    },
    shouldAttachKeyboardHandlers: false,
    shouldAttachEditorClickHandler: false,
    shouldAttachDocumentClickHandler: false,
    shouldListenForEditorEvents: false,
    shouldFlashCursor: true,
    shouldFocusCurrentTarget: false,
    finalAnswerCallback: function() {
      handleFinalAnswer();
    }
  });
  controller.initializeTargets();
  controller.updateView();
  var calloutMgr = hopscotch.getCalloutManager();
  $('.answer').click(function() {
    hopscotch.endTour();
    calloutMgr.removeCallout('final-step');
    readyForFinalAnswer();
  });

  calloutMgr.createCallout({
    id: 'final-step',
    title: 'Simplified',
    content: 'Now click the answer box and enter the final result of 23!',
    target: '.mq-binary-operator',
    placement: 'bottom',
    xOffset: 20,
    onClose: function() {
      readyForFinalAnswer();
    }
  });
}

function startPlaying() {
  controller.cleanUp();
  controller = new Controller({
    root: exercise,
    honeypotElement: $('#honey-pot'),
    gameState: {
      value: 'playing-game'
    },
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
  id: "walkthrough1",
  steps: [
    {
      title: "Arithmetic Exercise",
      content: "Complete as many of these as you can in the given time!",
      target: ".mq-math-mode",
      placement: "bottom",
      arrowOffset: 142,
      yOffset: 0,
      xOffset: -20
    },
    {
      title: "Subexpression",
      content: "You can work step-by-step! Use the Tab key, or click on the operator to focus on a subexpression. Then type the result of 16.",
      target: "3",
      placement: "bottom",
      xOffset: -60,
      arrowOffset: 57,
      onShow: function() {
        $('#3').addClass('clickable');
        $('#3').click(function() {
          newTarget = 3;
          $(document).off("keydown", temporaryTabHandler);
          hopscotch.endTour(); // Will trigger updateView
        });
        $(document).keydown(temporaryTabHandler);
        $('#next-button').click(function() {
          window.location = "arithmetic";
        });
      }
    },
    {
      title: "Answer Box",
      content: "If you know the answer, click the box and enter the final result. You can always go back to the subexpression if you need to!",
      target: ".answer",
      placement: "bottom",
      xOffset: -120,
      yOffset: 7,
      arrowOffset: 145,
      onShow: function() {
        $('.answer').click(function() {
          $(document).off("keydown", temporaryTabHandler);
          hopscotch.endTour();
        });
      }
    }
  ],
  showCloseButton: false,
  onEnd: function() {
    $(document).off("keydown", temporaryTabHandler);
    startPlaying();
  }
};

startWalkthrough();
