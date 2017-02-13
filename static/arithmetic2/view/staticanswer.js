var StaticAnswer = function(options) {
  this.staticDigits = options.staticDigits;
};

StaticAnswer.prototype.render = function() {
  var html = '<span class="answer-box">';
  for (var i = 0; i < this.staticDigits.length; i++) {
    html += this.staticDigits[i].render();
  }
  html += '</span>';
  return html;
}
