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
node7.state = 'editing'; // got here by clicking the *

var container = document.getElementById('math-container');
var controller = new Controller({
  root: node7,
  container: container,
  onSubmit: function() {
    hopscotch.endTour()
  },
  correctCallback: function(submission) {
    if (submission == 17) {
      window.location = "5";
    } else if (submission == 15) {
      window.location = "4";
    }
  }
});

function refocus() {
  $('#editor').focus();
}

document.addEventListener("click", refocus);

var tour = {
  id: "walkthrough2b",
  steps: [
    {
      title: "Math Editor",
      content: "Use the keyboard to enter the answer to the highlighted portion. Type your response and then hit <b><u>Enter</u></b> to check your work!",
      target: "editor",
      placement: "bottom"
    }
  ],
  onClose: function() {
    $('#editor').focus();
    document.removeEventListener('click', refocus);
    document.addEventListener('click', function(e) {
      if (e.target.className.match('hopscotch')) {
        return;
      }
      controller.resetDisplay();
    }, false);
  },
  onEnd: function() {
    console.log("INside the tour's onEnd handler, got called!\n");
    $('#editor').focus();
    document.removeEventListener('click', refocus);
    document.addEventListener('click', function(e) {
      if (e.target.className.match('hopscotch')) {
        return;
      }
      controller.resetDisplay();
    }, false);
  }
};

controller.updateDisplay();
controller.startEditing(node7);


hopscotch.startTour(tour);
