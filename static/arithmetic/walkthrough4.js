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
node7.state = 'editing';

var container = document.getElementById('math-container');
var controller = new Controller({
  root: node7,
  container: container,
  onSubmit: function() {
    hopscotch.endTour();
  },
  correctCallback: function(submission) {
    window.location = "5";
  }
});

var tour = {
  id: "walkthrough4",
  steps: [
    {
      title: "Math Editor",
      content: "Use the keyboard to type in the final answer. Then hit <b><u>Enter</u></b> and check your work!",
      target: "editor",
      placement: "bottom"
    }
  ],
  onClose: function() {
    $('#editor').focus();
  },
  onEnd: function() {
    $('#editor').focus();
  }
}

controller.updateDisplay(); // Do first in order to give proper focus.
controller.startEditing(node7);

hopscotch.startTour(tour);
