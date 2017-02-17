function StaticOperator(options) {
  this.id = options.id;
  this.value = options.value;
  this.state = options.state;
  this.depth = options.depth;
};

StaticOperator.prototype = {
  render: function(targetsById, expressionDepth) {
    var entity = this.getEntity();
    var html = "";
    var color = null;

    if (!targetsById) {
      targetsById = {};
    }
    if (this.value != '=') {
      color = this.computeColor(expressionDepth);
      if (color) {
        html += '<span class="mq-textcolor" style="color:' + color + '">';
      }
    }
    if (targetsById[this.id]) {
      html += '<span class="mq-binary-operator clickable" id="' + this.id + '">';
      html += entity;
      html += '</span>';
    } else {
      html += '<span class="mq-binary-operator">' + entity + '</span>';
    }
    if (color) {
      html += '</span>';
    }
    return html;
  },
  
  getEntity: function() {
    if (this.value == '+') {
      return '+';
    } else if (this.value == '*') {
      return '&times;';
    } else if (this.value == '=') {
      return '=';
    } else {
      console.log("Could not getEntity for operator with value %s", this.value);
    }
  },

  print: function() {
    return this.value;
  },

  computeColor: function(expressionDepth) {
    if (this.depth == undefined || this.depth == null) {
      return null;
    }
    var colors = StaticOperator.colorsByDepth["" + expressionDepth];
    var ratio = (this.depth - 1) / (expressionDepth - 1);
    var r = ratio * (expressionDepth - 1);
    var i = Math.ceil(r);

    if (i > expressionDepth - 1) {
      i = expressionDepth - 1;
    }
    i = expressionDepth - 1 - i;
    var color = colors[i];
    return color;
  }
};

StaticOperator.colorsByDepth = {
  "2": ["limegreen", "orangered"],
  "3": ["limegreen", "orange", "orangered"],
  "4": ["limegreen", "orange", "orangered", "darkmagenta"]
};
