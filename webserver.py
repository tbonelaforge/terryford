from flask import Flask
from flask import render_template
app = Flask(__name__)

@app.route('/')
def home_page():
    html = render_template('homepage/index.html')
    return html

@app.route('/arithmetic')
def arithmetic_start_page():
    html = render_template("arithmetic3/game-container.html")
    return html

@app.route('/walkthrough')
def walkthrough():
    return walkthrough_page()

@app.route('/walkthrough/<walkthrough_step>')
def walkthrough_page(walkthrough_step="1"):
    html = render_template("arithmetic3/walkthrough.html", step=walkthrough_step)
    return html
