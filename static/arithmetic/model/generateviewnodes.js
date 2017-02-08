function generateViewNodes(root, setClickable) {
  var stack = [];
  var viewNodes = [];

  stack.push(root, 'l');
  while (stack.length) {
    var instruction = stack.pop();
    var node = stack.pop();
    if (!node) {
      continue;
    }
    if (node.editing) {
      viewNodes.push(node.toNumberEditor());
      continue;
    }
    switch (instruction) {
    case 'l': // push left child
      stack.push(node, 'v');
      stack.push(node.left, 'l');
      break;
    case 'v': // visit
      stack.push(node, 'r');
      Array.prototype.push.apply(viewNodes, node.toViewNodes());
      break;
    case 'r': // push right child
      stack.push(node, 'd');
      stack.push(node.right, 'l');
      break;
    case 'd': // done
      break;
    default:
      console.log("Unrecognized instruction in traversal stack");
    }
  }
  return viewNodes;
}
