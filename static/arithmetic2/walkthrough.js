var tour = {
  id: "beginner-walkthrough",
  steps: [
    {
      title: "Easy Operator",
      content: 'This is the most basic way to start playing. Click the green <span style="color:green">&times;</span> to solve the first part of the exercise.',
      target: "12",
      placement: "bottom"
    },
    {
      title: "Hard Operator",
      content: 'This is for when you know the answer to the whole exercise.  Click the <span style="color:red;">+</span> operator to solve the whole thing at once.',
      target: "15",
      placement: "bottom"
    }
  ]
};

hopscotch.startTour(tour);
