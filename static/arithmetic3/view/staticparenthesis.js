function StaticParenthesis(options) {
  this.value = options.value;
}

StaticParenthesis.prototype = {
  render: function(targetsById) {
    return '<span>' + this.value + '</span>';
  },

  print: function() {
    return this.value;
  }
};
