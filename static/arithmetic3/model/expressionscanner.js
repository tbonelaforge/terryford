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
    if (depth == maxDepth) {
      this.targets.push(node);
    } else if (depth > maxDepth) {
      this.targets = [node]; // Reset.
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
