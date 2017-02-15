function renderView(viewNodes, targetsById) {
  var html = "";
  html += '<span class="mq-math-mode"><span class="mq-root-block">';
  for (var i = 0; i < viewNodes.length; i++) {
    var viewNode = viewNodes[i];
    var view = viewNode.render(targetsById);
    html += view;
  }
  html += '</span></span>';
  return html;
}
