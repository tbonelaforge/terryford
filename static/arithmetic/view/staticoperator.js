var StaticOperator = function(options) {
  this.id = options.id;
//  this.nodeId = options.nodeId;
  this.value = options.value;
  this.state = options.state;
};

StaticOperator.prototype.render = function() {
  var entity = this.getEntity();
  var color = null;
  if (this.state == 'easy') {
    color = 'limegreen';
  } else if (this.state == 'hard') {
    color = 'red';
  }
  if (color) {
    return '<span class="mq-textcolor" style="color:' + color + '">' +
      '<span class="mq-binary-operator clickable" id="' + this.id + '">' + 
      entity + 
      '</span>' +
      '</span>';
  } else {
    return '<span class="mq-binary-operator">' + entity + '</span>';
  }
};

StaticOperator.prototype.getEntity = function() {
  if (this.value == '+') {
    return '+';
  } else if (this.value == '*') {
    return '&times;';
  }
};
