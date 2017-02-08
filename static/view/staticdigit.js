var StaticDigit = function(options) {
  this.digit = options.digit;
};

StaticDigit.prototype.render = function() {
  var html = '<span>' + this.digit + '</span>';

  return html;
};
