function runProgram() {
  console.log("Here is where we would run the program text");
  var programTextElement = document.getElementById('program-text');
  var rawProgramText = programTextElement.value;
  var massagedProgramText = rawProgramText.replace(/;[\s]*/g, ";\n");
  massagedProgramText = massagedProgramText.replace(/^[\s]+/, '');
  massagedProgramText = massagedProgramText.replace(/\n$/, '');
  $.ajax({
    type: "POST",
    url: '/lambda/evaluate',
    data: JSON.stringify({
      code: massagedProgramText
    }),
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
    success: function(responseData) {
      console.log("Here is where we should do something with the response data of:");
      console.log(responseData);
      evaluationArea = document.getElementById('evaluation-area')
      evaluationArea.innerHTML = responseData.result;
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("Inside the error callback, got called...");
    }
  });
}

var runButton = document.getElementById('run-button');
runButton.onclick = runProgram;
