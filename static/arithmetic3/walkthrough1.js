var controller;

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
  $('.answer').removeAttr('tabindex');
  hopscotch.startTour(tour);
}

function startPlaying() {
  controller.cleanUp();
  controller = new Controller({
    root: exercise,
    finalAnswerCallback: function() {
      handleFinalAnswer();
    }
  });
  controller.initializeTargets();
  controller.updateView();
}

function handleFinalAnswer() {
  $('#check-mark').css({visibility: "visible"});
  $('#next-button').show();
  $('#next-button').focus();
  $('#next-button').click(function() {
    handleNextButton();
  });
}

function handleNextButton() {
  window.location = "/walkthrough/2";
}

var node1 = new Node({
  id: 1,
  type: "number",
  value: 2
});
var node2 = new Node({
  id: 2,
  type: "number",
  value: 2
});
var node3 = new Node({
  id: 3,
  type: "operator",
  value: "+"
});
node3.left = node1;
node3.right = node2;
var node4 = new Node({
  id: 4,
  type: "operator",
  value: '='
});
var node5 = new Node({
  id: 5,
  type: "answer",
  value: 4
});
node4.left = node3;
node4.right = node5;
var exercise = node4;

var tour = {
  id: "walkthrough1",
  steps: [
    {
      title: "Arithmetic Exercise",
      content: "The objective is to complete as many of these exercises as you can in 1 minute.",
      target: ".mq-math-mode",
      placement: "left",
      arrowOffset: 0,
      yOffset: -15,
      xOffset: -20
    },
    {
      title: "Countdown",
      content: "This timer counts down as you solve the exercises. In a real game this would show the number of seconds you have left.",
      target: "countdown",
      placement: "bottom",
      xOffset: -260,
      arrowOffset: 260
    },
    {
      title: "Answer Box",
      content: "Click the answer box, and use the keyboard to enter the final answer.",
      target: ".answer",
      placement: "bottom",
      onShow: function() {
        $('.answer').click(function() {
          hopscotch.endTour();
        });
      }
    }
  ],
  showCloseButton: false,
  onEnd: function() {
    setTimeout(function() {
      startPlaying();
    }, 1);
  }
};

startWalkthrough();
