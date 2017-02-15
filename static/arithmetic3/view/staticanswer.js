function StaticAnswer(options) {
  this.id = options.id;
  this.staticDigits = options.staticDigits;
}

StaticAnswer.prototype.render = function(targetsById) {
  var html = '<span id="' + this.id + '" class="answer-box">';
  for (var i = 0; i < this.staticDigits.length; i++) {
    html += this.staticDigits[i].render();
  }
  html += '&nbsp;';
  html += '</span>'
  return html;
};
