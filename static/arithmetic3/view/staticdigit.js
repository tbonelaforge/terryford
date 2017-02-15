function StaticDigit(options) {
  this.digit = options.digit;
}

StaticDigit.prototype.render = function(targetsById) {
  return '<span>' + this.digit + '</span>';
};
