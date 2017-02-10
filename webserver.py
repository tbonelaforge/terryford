from flask import Flask
from flask import render_template
app = Flask(__name__)

@app.route('/')
def hello_world():
    return """<!DOCTYPE html>
<html>
  <head>
    <title>Terry Ford's Website</title>
  </head>
  <body>
    <h1>Hello! My name is Terry Ford.</h1>
    <img src="static/good-picture.jpeg" width="420" title="A picture of me, when this website was a mere twinkle in my eye." alt="Terry at a Baseball Game">
    <a href="arithmetic"><h2>Arithmetic Game</h2></a>
  </body>
</html>"""

@app.route('/arithmetic')
def arithmetic_start_page():
    html = render_template("arithmetic/game-container.html");
    return html;

@app.route('/walkthrough')
def walkthrough():
    return walkthrough_page()

@app.route('/walkthrough/<walkthrough_step>')
def walkthrough_page(walkthrough_step="1"):
    html = render_template("arithmetic/walkthrough.html", step=walkthrough_step);
    return html;
