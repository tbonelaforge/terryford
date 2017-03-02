import React from 'react';
import ReactDOM from 'react-dom';
import ThoughtBubble from './thoughtbubble.js';

ReactDOM.render(
  <ThoughtBubble
  x="630" y="280"
  svgWidth="840" svgHeight="560"
  radius="190" pointRadius="50">
  </ThoughtBubble>,
  document.getElementById('thought-bubble-container')
);
