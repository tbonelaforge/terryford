//function renderView(node) {
function renderView(viewNodes) {
//  var viewNodes = node.toViewNodes();
  var html = "";
  html += '<span class="mq-math-mode"><span class="mq-root-block">';
  for (var i = 0; i < viewNodes.length; i++) {
    var viewNode = viewNodes[i];
    var viewNodeHtml = viewNode.render();
    html += viewNodeHtml;
  }
  html += '</span></span>';
  return html;
}
