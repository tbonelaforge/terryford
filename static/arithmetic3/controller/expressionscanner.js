function ExpressionScanner(options) {
  this.maxDepth = 2;
  this.targets = [];
}

ExpressionScanner.prototype.scan = function() {
  var args = Array.from(arguments);
  var node = args.shift();
  var depth = args.length ? args.shift() : 1;

  if (!node) {
    return;
  }
  if (node.type == 'operator') {
    if (depth == this.maxDepth) {
      this.targets.push(node);
    } else if (depth > this.maxDepth) {
      this.targets = [node];
      this.maxDepth = depth;
    }
  }
  this.scan(node.left, depth + 1);
  this.scan(node.right, depth + 1);
}

ExpressionScanner.getTargets = function(node) {
  var expressionScanner = new ExpressionScanner();
  expressionScanner.scan(node);
  return expressionScanner.targets;
}

ExpressionScanner.replace = function(node, target, replacement) {
  if (!node) {
    return null;
  }
  if (node == target) {
    return replacement;
  }
  node.left = ExpressionScanner.replace(node.left, target, replacement);
  node.right = ExpressionScanner.replace(node.right, target, replacement);
  return node;
};
