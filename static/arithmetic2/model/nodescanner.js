function NodeScanner() {
  this.easy = null;
  this.hard = null;
//  this.answer = null;
  this.clickableDepth = 0;
}

NodeScanner.prototype.computeClickableNodes = function() {
  var args = Array.from(arguments);
  var node = args.shift();
  var depth = args.length ? args.shift() : 1;

  if (node.type == "operator" && node.value != '=') {
    if (depth > this.clickableDepth) {
      this.easy = node;
      this.clickableDepth = depth;
    }
  }
  if (node.left) {
    this.computeClickableNodes(node.left, depth + 1);
  }
  if (node.right) {
    this.computeClickableNodes(node.right, depth + 1);
  }
}

NodeScanner.setStates = function(node) {
  var nodeScanner = new NodeScanner();
  nodeScanner.computeClickableNodes(node);
  if (nodeScanner.easy) {
    nodeScanner.easy.state = 'easy';
  }
/*
  if (nodeScanner.hard) {
    nodeScanner.hard.state = 'hard';
  }
*/
/*
  if (nodeScanner.answer) {
    nodeScanner.answer.state = 'editing';
  }
*/
  return node;
}

NodeScanner.findNodeById = function(node, target) {
  if (node.id == target) {
    return node;
  }
  var result = null;
  if (node.left) {
    result = NodeScanner.findNodeById(node.left, target);
  }
  if (result) {
    return result;
  }
  if (node.right) {
    result = NodeScanner.findNodeById(node.right, target);
  }
  return result;
}

NodeScanner.replace = function(node, targetNode, replacementNode) {
  if (!node) {
    return null;
  }
  if (node == targetNode) {
    return replacementNode;
  }
  node.left = NodeScanner.replace(node.left, targetNode, replacementNode);
  node.right = NodeScanner.replace(node.right, targetNode, replacementNode);
  return node;
};
