var AnswerEditor = function(options) {
  NumberEditor.call(this, options);
};

AnswerEditor.prototype = Object.create(NumberEditor.prototype);

AnswerEditor.prototype.render = function() {
  var html = '<span class="answer-box"><span class="mq-editable-field" id="editor" tabindex="0">';
  html += this.renderBuffer();
  html += '</span></span';
  return html;
};
