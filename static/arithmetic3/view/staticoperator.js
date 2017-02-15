function StaticOperator(options) {
  this.id = options.id;
  this.value = options.value;
  this.state = options.state;
};

StaticOperator.prototype.render = function(targetsById) {
  var entity = this.getEntity();
  var html = "";
  if (!targetsById) {
    targetsById = {};
  }
  if (this.value != '=') {
    html += '<span class="mq-textcolor" style="color:limegreen;">';
  }
  if (targetsById[this.id]) {
    html += '<span class="mq-binary-operator clickable" id="' + this.id + '">';
    html += entity;
    html += '</span>';
  } else {
    html += '<span class="mq-binary-operator">' + entity + '</span>';
  }
  if (this.value != '=') {
    html += '</span>';
  }
  return html;
};

StaticOperator.prototype.getEntity = function() {
  if (this.value == '+') {
    return '+';
  } else if (this.value == '*') {
    return '&times;';
  } else if (this.value == '=') {
    return '=';
  } else {
    console.log("Could not getEntity for operator with value %s", this.value);
  }
};
