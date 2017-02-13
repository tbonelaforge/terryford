
var node6 = new Node({
  type: "number",
  value: 2
});
node6.id = 6;

var node7 = new Node({
  type: "operator",
  value: '+'
});
node7.id = 7;

var node8 = new Node({
  type: "number",
  value: 3
});
node8.id = 8;

var node9 = new Node({
  type: "operator",
  value: '*'
});
node9.id = 9;

var node10 = new Node({
  type: "number",
  value: 5
});
node10.id = 10;

node9.left = node8;
node9.right = node10;
node7.left = node6; // node7 is root
node7.right = node9;
NodeScanner.setStates(node7);

var container = document.getElementById('math-container');
var operatorClickCallback = function(e) {
    var operatorId = parseInt(e.target.getAttribute('id'));
    if (operatorId == 9) { // Easy click.
      window.location = "2a";
    } else if (operatorId == 7) { // Hard click
      window.location = "2b";
    } else {
      console.log("Unknown operator click:");
      console.log(e);
    }
};
var controller = new Controller({
  root: node7,
  container: container,
  operatorClickCallback: function(e) { } // To be replaced later.
});

var tour = {
  id: "walkthrough1",
  steps: [
    {
      title: "Arithmetic Exercise",
      content: "The objective is to complete as many of these exercises as you can in 1 minute.",
      target: ".mq-math-mode",
      placement: "left",
      arrowOffset: 0,
      yOffset: -15
    },
    {
      title: "Easy Operator",
      content: 'This is the most basic way to start playing. Click the green <span style="color:green">&times;</span> to solve the first part of the exercise.',
      target: "9",
      placement: "bottom",
      arrowOffset: 0,
      xOffset: -12
    },
    {
      title: "Hard Operator",
      content: 'This can save time if you already know the answer!  Click the <span style="color:red;">+</span> operator to solve the whole thing at once.',
      target: "7",
      placement: "bottom",
      arrowOffset: 0,
      xOffset: -12,
      onNext: function() {
        controller.setOperatorClickCallback(operatorClickCallback)
      }
    },
    {
      title: "Countdown",
      content: "This timer counts down as you solve the exercises. In a real game this would show the number of seconds you have left.",
      target: "countdown",
      placement: "bottom",
      xOffset: -260,
      arrowOffset: 260
    }
  ],
  onClose: function() {
    controller.setOperatorClickCallback(operatorClickCallback);
  }
};

controller.updateDisplay();

hopscotch.startTour(tour);
