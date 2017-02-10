var node7 = new Node({
  type: "number",
  value: 17
});
node7.id = 7;

var container = document.getElementById('math-container');
var controller = new Controller({
  root: node7,
  container: container
});

var tour = {
  id: "walkthrough5",
  steps: [
    {
      title: "Correct Answer",
      content: "Congratulations! This is the correct final answer.",
      target: ".mq-math-mode",
      placement: "left",
      yOffset: -20
    },
    {
      title: "Next Button",
      content: "Click this button (or hit enter) to start solving another exercise before the time runs out. Try to solve as many as you can!",
      target: "next-button",
      placement: "bottom",
      yOffset: 10
    }
  ],
  onNext: function() {
    $('#next-button').focus();
  },
  onClose: function() {
    $('#next-button').focus();
  },
  onEnd: function() {
    $('#next-button').focus();
  }
};

controller.updateDisplay();
$('#next-button').show();
$('#next-button').focus();

$('#next-button').click(function() {
  window.location = "/arithmetic";
});

hopscotch.startTour(tour);
