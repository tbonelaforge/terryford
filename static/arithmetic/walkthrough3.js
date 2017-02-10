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
  value: 15
});
node8.id = 8;

node7.left = node6;
node7.right = node8;
NodeScanner.setStates(node7);

var container = document.getElementById('math-container');
var controller = new Controller({
  root: node7,
  container: container,
  operatorClickCallback: function(e) {
    window.location = "4";
  }
});

var tour = {
  id: "walkthrough3",
  steps: [
    {
      title: "Operator",
      content: 'This is the only operation left to perform.  Click the green <span style="color:green">+</span> to finish solving the exercise.',
      target: "7",
      placement: "bottom",
      arrowOffset: 0,
      xOffset: -12
    }
  ]
};

controller.updateDisplay();

hopscotch.startTour(tour);
